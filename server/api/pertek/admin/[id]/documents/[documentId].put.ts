// server/api/pertek/admin/[id]/documents/[documentId].put.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"
import { uploadBuffer } from "~/lib/minio"
import { randomUUID } from "crypto"
import { PertekDocumentType } from "@prisma/client"

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
        statusMessage: 'Document not found'
      })
    }
    
    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    
    // Get form fields
    const getFormField = (name: string) => {
      const field = formData?.find(part => part.name === name)
      return field ? field.data.toString() : undefined
    }
    
    const getFormFile = (name: string) => {
      return formData?.find(part => part.name === name && part.filename)
    }
    
    // Extract fields
    const file = getFormFile('file')
    const description = getFormField('description')
    
    // Prepare update data
    const updateData: any = {}
    
    // If description is provided, update it
    if (description !== undefined) {
      updateData.description = description
    }
    
    // If new file is uploaded, process it
    if (file && file.filename) {
      // Generate unique filename
      const fileExt = file.filename.split('.').pop() || ''
      const uniqueFilename = `${randomUUID()}.${fileExt}`
      const objectName = `admin-documents/${pertekId}/${uniqueFilename}`
      
      // Upload file to MinIO
      const fileUrl = await uploadBuffer(
        objectName,
        file.data,
        file.type || 'application/octet-stream'
      )
      
      // Update additional fields
      updateData.filename = file.filename
      updateData.fileUrl = fileUrl
      updateData.size = file.data.length
      updateData.mimeType = file.type || 'application/octet-stream'
      updateData.updatedAt = new Date()
    }
    
    // If there's nothing to update, return error
    if (Object.keys(updateData).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No update data provided'
      })
    }
    
    // Update document record
    const updatedDocument = await prisma.pertekDocument.update({
      where: { id: documentId },
      data: updateData
    })
    
    return {
      success: true,
      message: 'Document updated successfully',
      document: updatedDocument
    }
    
  } catch (error: any) {
    console.error('Error updating document:', error)
    return {
      success: false,
      message: error.message || 'Failed to update document',
      error: error.statusMessage || error.message
    }
  }
})

// Helper function to validate document upload based on PERTEK status
const validateDocumentUpload = (status: string, documentType: string): string | null => {
  switch (documentType) {
    case 'SURAT_UNDANGAN_PAPARAN':
      // Surat undangan hanya masuk akal jika status berkaitan dengan paparan
      if (!['COMPLETE_REQUIREMENTS', 'SCHEDULED_PAPARAN', 'PAPARAN_COMPLETED'].includes(status)) {
        return 'Surat undangan paparan hanya dapat diupload saat status terkait paparan'
      }
      break;
    case 'PERTEK_FINAL':
      // Dokumen PERTEK final hanya masuk akal jika status sudah mencapai tahap akhir
      if (!['REVISION_APPROVED', 'PERTEK_ISSUED'].includes(status)) {
        return 'Dokumen PERTEK final hanya dapat diupload saat status sudah disetujui'
      }
      break;
  }
  
  return null // No validation error
}
