// server/api/pertek/admin/[id]/feedback.post.ts
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
    
    const { requirementType, feedbackText, documentId } = body
    
    if (!requirementType || !feedbackText) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Requirement type and feedback text are required'
      })
    }
    
    // Validate requirement type
    const validRequirementTypes = [
      'SURAT_PERMOHONAN',
      'DOKUMEN_AMDAL_UKL_UPL', 
      'DOKUMEN_TEKNIS',
      'DOKUMEN_REVISI',
      'OTHER'
    ]
    
    if (!validRequirementTypes.includes(requirementType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid requirement type'
      })
    }
    
    // Get current PERTEK to validate
    const pertek = await prisma.pertek.findUnique({
      where: { id: pertekId },
      include: {
        documents: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!pertek) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PERTEK not found'
      })
    }
    
    // Validate document ID if provided
    if (documentId) {
      const document = pertek.documents.find(doc => doc.id === documentId)
      if (!document) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Document not found in this PERTEK'
        })
      }
    }
    
    // Get latest status history for linking
    const latestStatusHistory = pertek.statusHistory[0]
    if (!latestStatusHistory) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No status history found'
      })
    }
    
    // Create feedback in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create requirement feedback
      const feedback = await tx.pertekRequirementFeedback.create({
        data: {
          pertekId: pertekId,
          statusHistoryId: latestStatusHistory.id,
          documentId: documentId || null,
          requirementType: requirementType,
          feedbackText: feedbackText,
          isResolved: false
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
      
      // If this is the first feedback and status is not INCOMPLETE_REQUIREMENTS,
      // automatically change status
      if (pertek.status !== 'INCOMPLETE_REQUIREMENTS') {
        await tx.pertek.update({
          where: { id: pertekId },
          data: {
            status: 'INCOMPLETE_REQUIREMENTS',
            updatedAt: new Date()
          }
        })
        
        // Create status history for the automatic change
        await tx.pertekStatusHistory.create({
          data: {
            pertekId: pertekId,
            status: 'INCOMPLETE_REQUIREMENTS',
            notes: 'Status otomatis diubah karena ada feedback persyaratan',
            changedById: user.id
          }
        })
      }
      
      return feedback
    })
    
    return {
      success: true,
      data: result,
      message: 'Feedback berhasil ditambahkan'
    }
    
  } catch (error: any) {
    console.error('Error adding requirement feedback:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat menambahkan feedback'
    })
  }
})