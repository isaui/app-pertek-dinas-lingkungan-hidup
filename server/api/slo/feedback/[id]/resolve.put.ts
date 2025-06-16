// server/api/slo/feedback/[id]/resolve.put.ts
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
    
    // Validate feedback exists and belongs to user's SLO
    const feedback = await prisma.sLORequirementFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        slo: true
      }
    })
    
    if (!feedback) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Feedback not found'
      })
    }
    
    // Check ownership
    if (feedback.slo.userId !== session.user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to access this feedback'
      })
    }
    
    if (feedback.isResolved) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feedback is already resolved'
      })
    }
    
    // Resolve feedback
    const resolvedFeedback = await prisma.sLORequirementFeedback.update({
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