// server/api/pertek/admin/[id]/status.put.ts
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

    const user = await prisma.user.findFirst({
      where: { id: session.user.id }
    })
    
    if (!user || user.role !== 'administrator') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Administrator access required'
      })
    }
    
    // Get params and body
    const pertekId = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID is required'
      })
    }
    
    const { newStatus, notes, adminNotes, feedbackToUser, paparanDate, paparanLocation } = body
    
    if (!newStatus) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New status is required'
      })
    }
    
    // Get current PERTEK
    const currentPertek = await prisma.pertek.findUnique({
      where: { id: pertekId },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!currentPertek) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PERTEK not found'
      })
    }
    
    // Validate status transition
    const validTransitions = getValidTransitions(currentPertek.status)
    if (!validTransitions.includes(newStatus)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid status transition from ${currentPertek.status} to ${newStatus}`
      })
    }
    
    // Prepare update data
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date()
    }
    
    // Add optional fields based on status
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }
    
    if (feedbackToUser !== undefined) {
      updateData.feedbackToUser = feedbackToUser
    }
    
    if (newStatus === 'SCHEDULED_PAPARAN') {
      if (paparanDate) {
        updateData.paparanDate = new Date(paparanDate)
      }
      if (paparanLocation) {
        updateData.paparanLocation = paparanLocation
      }
    }
    
    if (newStatus === 'PERTEK_ISSUED') {
      updateData.approvedAt = new Date()
    }
    
    // Update PERTEK and create status history in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update PERTEK
      const updatedPertek = await tx.pertek.update({
        where: { id: pertekId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      // Create status history record
      await tx.pertekStatusHistory.create({
        data: {
          pertekId: pertekId,
          status: newStatus,
          notes: notes || null,
          changedById: user.id
        }
      })
      
      return updatedPertek
    })
    
    // TODO: Send email notification to user
    // await sendStatusUpdateNotification(result.user.email, result.company, newStatus)
    
    return {
      success: true,
      data: result,
      message: `Status berhasil diubah ke ${getStatusLabel(newStatus)}`
    }
    
  } catch (error: any) {
    console.error('Error updating PERTEK status:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengubah status PERTEK'
    })
  }
})

// Helper: Get valid status transitions
function getValidTransitions(currentStatus: string): string[] {
  const transitions: Record<string, string[]> = {
    'SUBMITTED': ['VERIFICATION', 'INCOMPLETE_REQUIREMENTS', 'COMPLETE_REQUIREMENTS', 'REJECTED'],
    'VERIFICATION': ['INCOMPLETE_REQUIREMENTS', 'COMPLETE_REQUIREMENTS', 'REJECTED'],
    'INCOMPLETE_REQUIREMENTS': ['VERIFICATION', 'COMPLETE_REQUIREMENTS', 'REJECTED'],
    'COMPLETE_REQUIREMENTS': ['SCHEDULED_PAPARAN', 'INCOMPLETE_REQUIREMENTS'],
    'SCHEDULED_PAPARAN': ['PAPARAN_COMPLETED', 'COMPLETE_REQUIREMENTS'],
    'PAPARAN_COMPLETED': ['REVISION_SUBMITTED'],
    'REVISION_SUBMITTED': ['REVISION_REVIEW'],
    'REVISION_REVIEW': ['REVISION_APPROVED', 'REVISION_REJECTED'],
    'REVISION_REJECTED': ['REVISION_SUBMITTED'],
    'REVISION_APPROVED': ['PERTEK_ISSUED']
  }
  
  return transitions[currentStatus] || []
}

// Helper: Get status label in Indonesian
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