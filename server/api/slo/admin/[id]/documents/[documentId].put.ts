// server/api/slo/admin/[id]/documents/[documentId].put.ts
import { auth } from "~/lib/auth"
import prisma from "~/lib/prisma"
import { uploadBuffer } from "~/lib/minio"
import { randomUUID } from "crypto"

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
      const objectName = `admin-documents/${sloId}/${uniqueFilename}`
      
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
    const updatedDocument = await prisma.sLODocument.update({
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