// server/api/slo/detail/[id]/requirements.post.ts
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
            type: 'PERSYARATAN'
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
    
    // Validate status allows requirements update
    const allowedStatuses = ['INCOMPLETE_REQUIREMENTS', 'REJECTED', 'VERIFICATION']
    if (!allowedStatuses.includes(slo.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot update requirements in current status: ${slo.status}`
      })
    }
    
    // Process upload in transaction
    const result = await prisma.$transaction(async (tx) => {
      // If replacing existing requirements, mark them as expired
      if (replaceExisting && slo.documents.length > 0) {
        await tx.sLODocument.updateMany({
          where: {
            sloId: sloId,
            type: 'PERSYARATAN',
            expired: false
          },
          data: {
            expired: true
          }
        })
      }
      
      // Create new requirement documents
      const uploadedDocuments: any[] = []
      for (const doc of documents) {
        const document = await tx.sLODocument.create({
          data: {
            sloId: sloId,
            type: 'PERSYARATAN',
            filename: doc.filename,
            fileUrl: doc.fileUrl,
            size: doc.size,
            mimeType: doc.mimeType,
            description: 'Dokumen persyaratan dari user',
            expired: false
          }
        })
        uploadedDocuments.push(document)
      }
      
      // Update SLO status if needed (back to verification for review)
      if (slo.status === 'INCOMPLETE_REQUIREMENTS' || slo.status === 'REJECTED') {
        await tx.sLO.update({
          where: { id: sloId },
          data: {
            status: 'SUBMITTED',
            updatedAt: new Date()
          }
        })
        
        // Create status history
        await tx.sLOStatusHistory.create({
          data: {
            sloId: sloId,
            status: 'SUBMITTED',
            notes: replaceExisting 
              ? 'User memperbarui semua dokumen persyaratan'
              : 'User menambahkan dokumen persyaratan tambahan',
            changedById: session.user.id
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
              newStatus: 'SUBMITTED',
              statusLabel:  getStatusLabel('SUBMITTED'),
              notes: 'User memperbarui semua dokumen persyaratan'
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
        
      }
      
      return uploadedDocuments
    })
    
    return {
      success: true,
      data: result,
      message: replaceExisting 
        ? `Dokumen persyaratan berhasil diperbarui. ${slo.documents.length} dokumen lama sudah ditandai kedaluwarsa.`
        : 'Dokumen persyaratan berhasil diupload.'
    }
    
  } catch (error: any) {
    console.error('Error uploading requirements:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengupload dokumen persyaratan'
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
