// server/api/pertek/admin/[id]/documents/[documentId]/download.get.ts
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
    const documentId = getRouterParam(event, 'documentId')
    
    if (!pertekId || !documentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PERTEK ID and Document ID are required'
      })
    }
    
    // Get document and validate it belongs to the PERTEK
    const document = await prisma.pertekDocument.findUnique({
      where: { id: documentId },
      include: {
        pertek: {
          select: {
            id: true,
            company: true
          }
        }
      }
    })
    
    if (!document) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Document not found'
      })
    }
    
    if (document.pertekId !== pertekId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Document does not belong to this PERTEK'
      })
    }
    
    // Fetch the file from storage
    const response = await fetch(document.fileUrl)
    
    if (!response.ok) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found in storage'
      })
    }
    
    // Get file content
    const fileBuffer = await response.arrayBuffer()
    
    // Set appropriate headers for download
    const headers_response = new Headers()
    headers_response.set('Content-Type', document.mimeType || 'application/octet-stream')
    headers_response.set('Content-Length', document.size.toString())
    headers_response.set('Content-Disposition', `attachment; filename="${encodeURIComponent(document.filename)}"`)
    
    // Optional: Add custom headers for tracking
    headers_response.set('X-Document-Type', document.type)
    headers_response.set('X-PERTEK-Company', encodeURIComponent(document.pertek.company))
    
    return new Response(fileBuffer, {
      headers: headers_response
    })
    
  } catch (error: any) {
    console.error('Error downloading document:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan saat mendownload dokumen'
    })
  }
})