// server/api/pertek/[id]/revision.post.ts
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
    
    // Get PERTEK ID from route params
    const pertekId = getRouterParam(event, 'id')
    
    if (!pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID is required'
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
    
    // Validate PERTEK ownership and status
    const pertek = await prisma.pertek.findFirst({
      where: { 
        id: pertekId,
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
    
    if (!pertek) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PERTEK not found or you do not have permission to access it'
      })
    }
    
    // Validate status allows revision upload
    const allowedStatuses = ['PAPARAN_COMPLETED', 'REVISION_REJECTED', 'REJECTED']
    if (!allowedStatuses.includes(pertek.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot upload revision in current status: ${pertek.status}`
      })
    }
    
    // Process upload in transaction
    const result = await prisma.$transaction(async (tx) => {
      // If replacing existing revisions, mark them as expired
      if (replaceExisting && pertek.documents.length > 0) {
        await tx.pertekDocument.updateMany({
          where: {
            pertekId: pertekId,
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
        const document = await tx.pertekDocument.create({
          data: {
            pertekId: pertekId,
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
      
      // Update PERTEK status if needed
      if (pertek.status === 'PAPARAN_COMPLETED' || pertek.status === 'REVISION_REJECTED') {
        await tx.pertek.update({
          where: { id: pertekId },
          data: {
            status: 'REVISION_SUBMITTED',
            updatedAt: new Date()
          }
        })
        
        // Create status history
        await tx.pertekStatusHistory.create({
          data: {
            pertekId: pertekId,
            status: 'REVISION_SUBMITTED',
            notes: 'User mengupload dokumen revisi',
            changedById: session.user.id
          }
        })
      }

      if (pertek.user?.email) {
        try {
          // Queue email notification to be sent asynchronously
          await dbEmailQueue.add('status-update-notification', {
            to: pertek.user.email,
            name: pertek.user.name || 'User',
            companyName: pertek.company, // Company name from PERTEK model
            pertekNumber: pertek.pertekNumber || pertek.id, // Use PERTEK number if available, fallback to ID
            newStatus: 'REVISION_SUBMITTED',
            statusLabel: getStatusLabel('REVISION_SUBMITTED'),
            notes: 'User mengupload dokumen revisi'
          }, {
            maxAttempts: 3,
            delaySeconds: 1 // Small delay to ensure transaction is fully committed
          })
          console.log(`[PERTEK Status] Email notification queued for ${pertek.user.email}`)
        } catch (emailError) {
          // Log error but don't fail the request
          console.error('Error queueing status notification email:', emailError)
        }
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
    'SCHEDULED_PAPARAN': 'Paparan Dijadwalkan',
    'PAPARAN_COMPLETED': 'Paparan Selesai',
    'REVISION_SUBMITTED': 'Revisi Diajukan',
    'REVISION_REVIEW': 'Review Revisi',
    'REVISION_REJECTED': 'Revisi Ditolak',
    'REVISION_APPROVED': 'Revisi Disetujui',
    'PERTEK_ISSUED': 'PERTEK Diterbitkan',
    'REJECTED': 'Ditolak'
  }
  
  return labels[status] || status
}