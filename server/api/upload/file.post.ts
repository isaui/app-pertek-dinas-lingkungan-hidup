// server/api/upload/file.post.ts
import { auth } from "~/lib/auth"
import { uploadBuffer, streamUploadBuffer } from "~/lib/minio"
import { randomUUID } from "crypto"

// Minimum file size to trigger streaming upload (5MB)
const STREAM_THRESHOLD = 5 * 1024 * 1024

export default defineEventHandler(async (event) => {
  try {
    // Verifikasi session user aktif
    const eventHeaders = getHeaders(event)
    const headers = new Headers()
    
    // Convert dari Nuxt headers ke Web API Headers
    Object.entries(eventHeaders).forEach(([key, value]) => {
      if (value) {
        headers.set(key, value)
      }
    })
    
    // Get session dari Better Auth
    const session = await auth.api.getSession({
      headers: headers
    })
    
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
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
    
    // Ambil file part
    const file = formData.find(part => part.name === 'file')
    
    if (!file || !file.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file upload'
      })
    }
    
    // Generate unique file name
    const fileExt = file.filename.split('.').pop() || ''
    const uniqueFilename = `${randomUUID()}.${fileExt}`
    const objectName = `uploads/${session.user.id}/${uniqueFilename}`
    
    // Determine content type
    const contentType = file.type || 'application/octet-stream'
    
    let fileUrl
    
    // Use streaming upload for large files
    if (file.data.length > STREAM_THRESHOLD) {
      fileUrl = await streamUploadBuffer(
        file.data,
        objectName,
        contentType
      )
    } else {
      // Use regular upload for smaller files
      fileUrl = await uploadBuffer(
        objectName,
        file.data,
        contentType
      )
    }
    
    return {
      success: true,
      url: fileUrl,
      filename: file.filename,
      size: file.data.length,
      contentType
    }
    
  } catch (error:any) {
    console.error('File upload error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to upload file'
    })
  }
})
