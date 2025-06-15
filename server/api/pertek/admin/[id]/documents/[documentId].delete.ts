// server/api/pertek/admin/[id]/documents/[documentId].delete.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"

export default defineEventHandler(async (event) => {
  try {
    // Auth check - implement secure server-side authentication
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
    
    // Get PERTEK ID and document ID
    const pertekId = getRouterParam(event, 'id')
    const documentId = getRouterParam(event, 'documentId')
    
    if (!pertekId || !documentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID and Document ID are required'
      })
    }
    
    // Validate document exists and belongs to this PERTEK
    const existingDocument = await prisma.pertekDocument.findFirst({
      where: { 
        id: documentId,
        pertekId: pertekId
      }
    })
    
    if (!existingDocument) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Document not found or does not belong to this PERTEK'
      })
    }
    
    // Check if document is referenced in feedback
    const referencedInFeedback = await prisma.pertekRequirementFeedback.findFirst({
      where: { documentId: documentId }
    })
    
    if (referencedInFeedback) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete document that is referenced in feedback. Consider updating it instead.'
      })
    }
    
    // Check document type and PERTEK status to ensure critical documents aren't deleted
    const pertek = await prisma.pertek.findUnique({
      where: { id: pertekId }
    })
    
    // Prevent deletion of critical documents based on status
    if (pertek) {
      // Don't allow deleting PERTEK_FINAL if status is already PERTEK_ISSUED
      if (existingDocument.type === 'PERTEK_FINAL' && pertek.status === 'PERTEK_ISSUED') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot delete PERTEK final document when PERTEK has been issued. Update it instead.'
        })
      }
      
      // Don't allow deleting SURAT_UNDANGAN_PAPARAN if paparan date is in the past
      if (existingDocument.type === 'SURAT_UNDANGAN_PAPARAN' && 
          pertek.paparanDate && new Date(pertek.paparanDate) < new Date()) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot delete paparan invitation document for completed paparan. Update it instead.'
        })
      }
    }
    
    // Delete the document record
    await prisma.pertekDocument.delete({
      where: { id: documentId }
    })
    
    // Note: We're not deleting the actual file from storage here
    // In a production system, you might want to delete from MinIO or mark for deletion
    
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
