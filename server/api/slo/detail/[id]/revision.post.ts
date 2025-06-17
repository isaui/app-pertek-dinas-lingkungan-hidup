// server/api/slo/detail/[id]/revision.post.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    // Auth check
    const eventHeaders = getHeaders(event)
    const headers = new Headers()
    
    Object.entries(eventHeaders).forEach(([key, value]) => {
      if (value) {
        headers.set(key, value)
      }
    })
    
    const session = await auth.api.getSession({
      headers: headers
    })
    
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }
    
    // Get SLO ID from route params
    const sloId = getRouterParam(event, 'id')
    
    if (!sloId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO ID is required'
      })
    }
    
    // Get request body
    const body = await readBody(event)
    const { documents, replaceExisting } = body
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Documents are required'
      })
    }
    
    // Validate SLO ownership and status
    const slo = await prisma.sLO.findFirst({
      where: { 
        id: sloId,
        userId: session.user.id
      },
      include: {
        documents: {
          where: {
            type: 'REVISI'
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!slo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'SLO not found or you do not have permission to access it'
      })
    }
    
    // Validate status allows revision upload
    const allowedStatuses = ['FIELD_VERIFICATION_COMPLETED', 'REVISION_REJECTED', 'REJECTED']
    if (!allowedStatuses.includes(slo.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot upload revision in current status: ${slo.status}`
      })
    }
    
    // Process upload in transaction
    const result = await prisma.$transaction(async (tx) => {
      // If replacing existing revisions, mark them as expired
      if (replaceExisting && slo.documents.length > 0) {
        await tx.sLODocument.updateMany({
          where: {
            sloId: sloId,
            type: 'REVISI',
            expired: false
          },
          data: {
            expired: true
          }
        })
      }
      
      // Create new revision documents
      const uploadedDocuments = []
      for (const doc of documents) {
        const document = await tx.sLODocument.create({
          data: {
            sloId: sloId,
            type: 'REVISI',
            filename: doc.filename,
            fileUrl: doc.fileUrl,
            size: doc.size,
            mimeType: doc.mimeType,
            description: 'Dokumen revisi dari user',
            expired: false
          }
        })
        uploadedDocuments.push(document)
      }
      
      // Update SLO status if needed
      if (slo.status === 'FIELD_VERIFICATION_COMPLETED' || slo.status === 'REVISION_REJECTED') {
        await tx.sLO.update({
          where: { id: sloId },
          data: {
            status: 'REVISION_SUBMITTED',
            updatedAt: new Date()
          }
        })
        
        if(slo.user?.email) {
          try {
            // Queue email notification to be sent asynchronously
            await dbEmailQueue.add('status-update-notification', {
              to: slo.user.email,
              name: slo.user.name || 'User',
              companyName: slo.company, // Company name from PERTEK model
              sloNumber: slo.sloNumber || slo.id, // Use PERTEK number if available, fallback to ID
              newStatus: 'REVISION_SUBMITTED',
              statusLabel: getStatusLabel('REVISION_SUBMITTED'),
              notes: 'User mengupload dokumen revisi'
            }, {
              maxAttempts: 3,
              delaySeconds: 1 // Small delay to ensure transaction is fully committed
            })
            console.log(`[SLO Status] Email notification queued for ${slo.user.email}`)
          } catch (emailError) {
            // Log error but don't fail the request
            console.error('Error queueing status notification email:', emailError)
          }
        }
        // Create status history
        await tx.sLOStatusHistory.create({
          data: {
            sloId: sloId,
            status: 'REVISION_SUBMITTED',
            notes: 'User mengupload dokumen revisi',
            changedById: session.user.id
          }
        })
      }
      
      return uploadedDocuments
    })
    
    return {
      success: true,
      data: result,
      message: replaceExisting 
        ? 'Dokumen revisi berhasil diperbarui. Dokumen lama sudah ditandai kedaluwarsa.'
        : 'Dokumen revisi berhasil diupload.'
    }
    
  } catch (error: any) {
    console.error('Error uploading revision:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengupload dokumen revisi'
    })
  }
})

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'SUBMITTED': 'Diajukan',
    'VERIFICATION': 'Verifikasi',
    'INCOMPLETE_REQUIREMENTS': 'Persyaratan Tidak Lengkap',
    'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
    'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi Lapangan Dijadwalkan',
    'FIELD_VERIFICATION_COMPLETED': 'Verifikasi Lapangan Selesai',
    'REVISION_SUBMITTED': 'Revisi Diajukan',
    'REVISION_REVIEW': 'Review Revisi',
    'REVISION_REJECTED': 'Revisi Ditolak',
    'REVISION_APPROVED': 'Revisi Disetujui',
    'SLO_ISSUED': 'SLO Diterbitkan',
    'REJECTED': 'Ditolak'
  }
  
  return labels[status] || status
}
