// server/api/pertek/admin/[id]/feedback/[feedbackId]/index.put.ts
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
    const feedbackId = getRouterParam(event, 'feedbackId')
    const body = await readBody(event)
    
    if (!pertekId || !feedbackId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID and Feedback ID are required'
      })
    }
    
    const { requirementType, feedbackText, documentId } = body
    
    // Validate feedback exists and belongs to PERTEK
    const existingFeedback = await prisma.pertekRequirementFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        pertek: {
          include: {
            documents: true
          }
        }
      }
    })
    
    if (!existingFeedback) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Feedback not found'
      })
    }
    
    if (existingFeedback.pertekId !== pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feedback does not belong to this PERTEK'
      })
    }
    
    // Don't allow editing resolved feedback
    if (existingFeedback.isResolved) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot edit resolved feedback'
      })
    }
    
    // Validate requirement type if provided
    if (requirementType) {
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
    }
    
    // Validate document ID if provided
    if (documentId) {
      const document = existingFeedback.pertek.documents.find(doc => doc.id === documentId)
      if (!document) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Document not found in this PERTEK'
        })
      }
    }
    
    // Prepare update data
    const updateData: any = {}
    
    if (requirementType !== undefined) {
      updateData.requirementType = requirementType
    }
    
    if (feedbackText !== undefined) {
      if (!feedbackText.trim()) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Feedback text cannot be empty'
        })
      }
      updateData.feedbackText = feedbackText
    }
    
    if (documentId !== undefined) {
      updateData.documentId = documentId || null
    }
    
    // Update feedback
    const updatedFeedback = await prisma.pertekRequirementFeedback.update({
      where: { id: feedbackId },
      data: updateData,
      include: {
        document: {
          select: {
            id: true,
            filename: true,
            type: true
          }
        },
        statusHistory: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      }
    })
    
    return {
      success: true,
      data: updatedFeedback,
      message: 'Feedback berhasil diperbarui'
    }
    
  } catch (error: any) {
    console.error('Error updating feedback:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat memperbarui feedback'
    })
  }
})