// server/api/upload/multipart/upload-part.post.ts
import { auth } from "~/lib/auth"
import { uploadPart } from "~/lib/minio"

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
        statusMessage: 'No data uploaded'
      })
    }
    
    // Get the file part
    const filePart = formData.find(part => part.name === 'file')
    
    if (!filePart || !filePart.data) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file part'
      })
    }
    
    // Get the required metadata
    const query = getQuery(event)
    const uploadId = query.uploadId as string
    const objectName = query.objectName as string
    const partNumber = parseInt(query.partNumber as string || '0')
    
    // Validate required parameters
    if (!uploadId || !objectName || !partNumber) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: uploadId, objectName, partNumber'
      })
    }
    
    // Upload the part
    const etag = await uploadPart(
      uploadId,
      objectName,
      partNumber,
      filePart.data
    )
    
    // Return success with ETag for client to track
    return {
      success: true,
      etag,
      part: partNumber
    }
    
  } catch (error:any) {
    console.error('Error uploading part:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to upload part'
    })
  }
})
