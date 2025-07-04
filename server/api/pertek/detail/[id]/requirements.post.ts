// server/api/pertek/[id]/requirements.post.ts
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
    
    if (!pertek) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PERTEK not found or you do not have permission to access it'
      })
    }
    
    // Validate status allows requirements update
    const allowedStatuses = ['INCOMPLETE_REQUIREMENTS', 'REJECTED', 'VERIFICATION']
    if (!allowedStatuses.includes(pertek.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot update requirements in current status: ${pertek.status}`
      })
    }
    
    // Process upload in transaction
    const result = await prisma.$transaction(async (tx) => {
      // If replacing existing requirements, mark them as expired
      if (replaceExisting && pertek.documents.length > 0) {
        await tx.pertekDocument.updateMany({
          where: {
            pertekId: pertekId,
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
        const document = await tx.pertekDocument.create({
          data: {
            pertekId: pertekId,
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
      
      // Update PERTEK status if needed (back to verification for review)
      if (pertek.status === 'INCOMPLETE_REQUIREMENTS' || pertek.status === 'REJECTED') {
        await tx.pertek.update({
          where: { id: pertekId },
          data: {
            status: 'SUBMITTED',
            updatedAt: new Date()
          }
        })
        
        // Create status history
        await tx.pertekStatusHistory.create({
          data: {
            pertekId: pertekId,
            status: 'SUBMITTED',
            notes: replaceExisting 
              ? 'User memperbarui semua dokumen persyaratan'
              : 'User menambahkan dokumen persyaratan tambahan',
            changedById: session.user.id
          }
        })

        if(pertek.user?.email) {
          try {
            // Queue email notification to be sent asynchronously
            await dbEmailQueue.add('status-update-notification', {
              to: pertek.user.email,
              name: pertek.user.name || 'User',
              companyName: pertek.company, // Company name from PERTEK model
              pertekNumber: pertek.pertekNumber || pertek.id, // Use PERTEK number if available, fallback to ID
              newStatus: 'SUBMITTED',
              statusLabel: getStatusLabel('SUBMITTED'),
              notes: 'User memperbarui semua dokumen persyaratan'
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
      }
      
      return uploadedDocuments
    })
    
    return {
      success: true,
      data: result,
      message: replaceExisting 
        ? `Dokumen persyaratan berhasil diperbarui. ${pertek.documents.length} dokumen lama sudah ditandai kedaluwarsa.`
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