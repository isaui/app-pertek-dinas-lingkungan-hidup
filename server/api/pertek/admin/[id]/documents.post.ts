// server/api/pertek/admin/[id]/documents.post.ts
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
    
    // Get PERTEK ID
    const pertekId = getRouterParam(event, 'id')
    
    if (!pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID is required'
      })
    }
    
    // Validate PERTEK exists
    const pertek = await prisma.pertek.findUnique({
      where: { id: pertekId }
    })
    
    if (!pertek) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PERTEK not found'
      })
    }
    
    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }
    
    // Get file and document type
    const file = formData.find(part => part.name === 'file')
    const documentTypePart = formData.find(part => part.name === 'documentType')
    const descriptionPart = formData.find(part => part.name === 'description')
    
    if (!file || !file.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file upload'
      })
    }
    
    if (!documentTypePart) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Document type is required'
      })
    }
    
    const documentType = documentTypePart.data.toString()
    const description = descriptionPart?.data.toString() || null
    
    // Validate document type
    const validAdminDocTypes = ['SURAT_UNDANGAN_PAPARAN', 'PERTEK_FINAL']
    if (!validAdminDocTypes.includes(documentType)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid document type for admin upload'
      })
    }
    
    // Validate document type against current status
    const validationError = validateDocumentUpload(pertek.status, documentType)
    if (validationError) {
      throw createError({
        statusCode: 400,
        statusMessage: validationError
      })
    }
    
    // Generate unique filename
    const fileExt = file.filename.split('.').pop() || ''
    const uniqueFilename = `${randomUUID()}.${fileExt}`
    const objectName = `admin-documents/${pertekId}/${uniqueFilename}`
    
    // Determine content type
    const contentType = file.type || 'application/octet-stream'
    
    // Upload file to MinIO
    const fileUrl = await uploadBuffer(
      objectName,
      file.data,
      contentType
    )
    
    // Save document record
    const document = await prisma.pertekDocument.create({
      data: {
        pertekId: pertekId,
        type: documentType as PertekDocumentType,
        filename: file.filename,
        fileUrl: fileUrl,
        size: file.data.length,
        mimeType: contentType,
        description: description
      }
    })
    
    // Auto-update status if applicable
    let statusUpdate = null
    if (documentType === 'SURAT_UNDANGAN_PAPARAN' && pertek.status === 'COMPLETE_REQUIREMENTS') {
      // Don't auto-update, let admin manually change to SCHEDULED_PAPARAN
      statusUpdate = 'ready_for_paparan_scheduling'
    }
    
    return {
      success: true,
      data: document,
      message: 'Dokumen berhasil diupload',
      statusUpdate
    }
    
  } catch (error: any) {
    console.error('Error uploading admin document:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mengupload dokumen'
    })
  }
})

// Helper: Validate document upload against current status
function validateDocumentUpload(currentStatus: string, documentType: string): string | null {
  const rules: Record<string, string[]> = {
    'COMPLETE_REQUIREMENTS': ['SURAT_UNDANGAN_PAPARAN'],
    'SCHEDULED_PAPARAN': ['SURAT_UNDANGAN_PAPARAN'],
    'PAPARAN_COMPLETED': [],
    'REVISION_APPROVED': ['PERTEK_FINAL'],
    'PERTEK_ISSUED': []
  }
  
  const allowedTypes = rules[currentStatus]
  
  if (!allowedTypes) {
    return `Tidak dapat upload dokumen pada status ${currentStatus}`
  }
  
  if (!allowedTypes.includes(documentType)) {
    const statusLabels: Record<string, string> = {
      'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
      'SCHEDULED_PAPARAN': 'Paparan Dijadwalkan',
      'REVISION_APPROVED': 'Revisi Disetujui'
    }
    
    const docLabels: Record<string, string> = {
      'SURAT_UNDANGAN_PAPARAN': 'Surat Undangan Paparan',
      'PERTEK_FINAL': 'Dokumen PERTEK Final'
    }
    
    return `Dokumen ${docLabels[documentType]} tidak dapat diupload pada status ${statusLabels[currentStatus]}`
  }
  
  return null
}