// server/api/slo/admin/[id]/feedback/[feedbackId]/index.put.ts
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
    const sloId = getRouterParam(event, 'id')
    const feedbackId = getRouterParam(event, 'feedbackId')
    const body = await readBody(event)
    
    if (!sloId || !feedbackId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO ID and Feedback ID are required'
      })
    }
    
    const { requirementType, feedbackText, documentId } = body
    
    // Validate feedback exists and belongs to SLO
    const existingFeedback = await prisma.sLORequirementFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        slo: {
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
    
    if (existingFeedback.sloId !== sloId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Feedback does not belong to this SLO'
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
        'DOK_PERIZINAN_BERUSAHA',
        'PERSETUJUAN_LINGKUNGAN', 
        'PERSETUJUAN_TEKNIS',
        'HASIL_PEMANTAUAN_EMISI',
        'SERTIFIKAT_REGISTRASI_LAB',
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
      const document = existingFeedback.slo.documents.find(doc => doc.id === documentId)
      if (!document) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Document not found in this SLO'
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
    const updatedFeedback = await prisma.sLORequirementFeedback.update({
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