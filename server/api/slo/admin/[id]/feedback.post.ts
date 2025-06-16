
// server/api/slo/admin/[id]/feedback.post.ts
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
    const body = await readBody(event)
    
    if (!sloId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'SLO ID is required'
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
    
    // Get current SLO to validate
    const slo = await prisma.sLO.findUnique({
      where: { id: sloId },
      include: {
        documents: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })
    
    if (!slo) {
      throw createError({
        statusCode: 404,
        statusMessage: 'SLO not found'
      })
    }
    
    // Validate document ID if provided
    if (documentId) {
      const document = slo.documents.find(doc => doc.id === documentId)
      if (!document) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Document not found in this SLO'
        })
      }
    }
    
    // Get latest status history for linking
    const latestStatusHistory = slo.statusHistory[0]
    if (!latestStatusHistory) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No status history found'
      })
    }
    
    // Create feedback in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create requirement feedback
      const feedback = await tx.sLORequirementFeedback.create({
        data: {
          sloId: sloId,
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
      if (slo.status !== 'INCOMPLETE_REQUIREMENTS') {
        await tx.sLO.update({
          where: { id: sloId },
          data: {
            status: 'INCOMPLETE_REQUIREMENTS',
            updatedAt: new Date()
          }
        })
        
        // Create status history for the automatic change
        await tx.sLOStatusHistory.create({
          data: {
            sloId: sloId,
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

// server/api/slo/admin/[id]/feedback/[feedbackId]/index.put.ts
export const updateFeedbackHandler = defineEventHandler(async (event) => {
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