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

    const user = await prisma.user.findFirst({
      where: { id: session.user.id }
    })
    
    if (!user || user.role !== 'administrator') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden - Administrator access required'
      })
    }
    
    // Get params
    const pertekId = getRouterParam(event, 'id')
    const feedbackId = getRouterParam(event, 'feedbackId')
    
    if (!pertekId || !feedbackId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID and Feedback ID are required'
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
    
    if (feedback.pertekId !== pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feedback does not belong to this PERTEK'
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
    
    // Check if all feedback for this PERTEK is now resolved
    const remainingFeedback = await prisma.pertekRequirementFeedback.count({
      where: {
        pertekId: pertekId,
        isResolved: false
      }
    })
    
    // If no more unresolved feedback and status is INCOMPLETE_REQUIREMENTS,
    // suggest status change to admin (don't auto-change)
    let statusSuggestion = null
    if (remainingFeedback === 0 && feedback.pertek.status === 'INCOMPLETE_REQUIREMENTS') {
      statusSuggestion = 'COMPLETE_REQUIREMENTS'
    }
    
    return {
      success: true,
      data: resolvedFeedback,
      message: 'Feedback berhasil diselesaikan',
      remainingFeedback,
      statusSuggestion
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