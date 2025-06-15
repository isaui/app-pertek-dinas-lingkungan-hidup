// server/api/pertek/admin/[id]/feedback/[feedbackId]/resolve.put.ts
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

    
    // Get params
    const feedbackId = getRouterParam(event, 'id')
    
    if (!feedbackId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feedback ID is required'
      })
    }
    
    // Validate feedback exists and belongs to PERTEK
    const feedback = await prisma.pertekRequirementFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        pertek: true
      }
    })
    
    if (!feedback) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Feedback not found'
      })
    }
    
    
    if (feedback.isResolved) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feedback is already resolved'
      })
    }
    
    // Resolve feedback
    const resolvedFeedback = await prisma.pertekRequirementFeedback.update({
      where: { id: feedbackId },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      },
      include: {
        document: {
          select: {
            id: true,
            filename: true,
            type: true
          }
        }
      }
    })
    
    return {
      success: true,
      data: resolvedFeedback,
      message: 'Feedback berhasil diselesaikan',
    }
    
  } catch (error: any) {
    console.error('Error resolving feedback:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat menyelesaikan feedback'
    })
  }
})