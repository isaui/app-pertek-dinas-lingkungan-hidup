import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"

// server/api/slo/admin/[id]/documents/[documentId].delete.ts
export const deleteDocumentHandler = defineEventHandler(async (event) => {
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
      
      // Get SLO ID and document ID
      const sloId = getRouterParam(event, 'id')
      const documentId = getRouterParam(event, 'documentId')
      
      if (!sloId || !documentId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'SLO ID and Document ID are required'
        })
      }
      
      // Validate document exists and belongs to this SLO
      const existingDocument = await prisma.sLODocument.findFirst({
        where: { 
          id: documentId,
          sloId: sloId
        }
      })
      
      if (!existingDocument) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Document not found or does not belong to this SLO'
        })
      }
      
      // Check if document is referenced in feedback
      const referencedInFeedback = await prisma.sLORequirementFeedback.findFirst({
        where: { documentId: documentId }
      })
      
      if (referencedInFeedback) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot delete document that is referenced in feedback. Consider updating it instead.'
        })
      }
      
      // Check document type and SLO status to ensure critical documents aren't deleted
      const slo = await prisma.sLO.findUnique({
        where: { id: sloId }
      })
      
      // Prevent deletion of critical documents based on status
      if (slo) {
        // Don't allow deleting SLO_FINAL if status is already SLO_ISSUED
        if (existingDocument.type === 'SLO_FINAL' && slo.status === 'SLO_ISSUED') {
          throw createError({
            statusCode: 400,
            statusMessage: 'Cannot delete SLO final document when SLO has been issued. Update it instead.'
          })
        }
        
        // Don't allow deleting SURAT_UNDANGAN_VERIFIKASI if verification date is in the past
        if (existingDocument.type === 'SURAT_UNDANGAN_VERIFIKASI' && 
            slo.verifikasiDate && new Date(slo.verifikasiDate) < new Date()) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Cannot delete verification invitation document for completed verification. Update it instead.'
          })
        }
      }
      
      // Delete the document record
      await prisma.sLODocument.delete({
        where: { id: documentId }
      })
      
      return {
        success: true,
        message: `Document "${existingDocument.filename}" has been deleted successfully`,
        deletedDocumentId: documentId
      }
      
    } catch (error: any) {
      console.error('Error deleting document:', error)
      return {
        success: false,
        message: error.message || 'Failed to delete document',
        error: error.statusMessage || error.message
      }
    }
  })