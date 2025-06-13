// server/api/upload/multipart/complete.post.ts
import { auth } from "~/lib/auth"
import { completeMultipartUpload } from "~/lib/minio"

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
    
    // Get request body
    const body = await readBody(event)
    
    // Validate required fields
    if (!body.uploadId || !body.objectName || !Array.isArray(body.parts) || body.parts.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: uploadId, objectName, and parts are required'
      })
    }
    
    // Define type for part object
    type PartInfo = { etag: string; part: number }
    
    // Validate parts format
    const validParts = body.parts.every((part: unknown) => 
      typeof part === 'object' && 
      part !== null && 
      'etag' in part && 
      'part' in part &&
      typeof (part as PartInfo).etag === 'string' &&
      typeof (part as PartInfo).part === 'number'
    )
    
    if (!validParts) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid parts format: each part must have etag and part number'
      })
    }
    
    // Complete the multipart upload
    const fileUrl = await completeMultipartUpload(
      body.uploadId,
      body.objectName,
      body.parts
    )
    
    // Return the completed file URL
    return {
      success: true,
      url: fileUrl,
      objectName: body.objectName
    }
    
  } catch (error:any) {
    console.error('Error completing multipart upload:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to complete multipart upload'
    })
  }
})
