// server/api/upload/multipart/abort.post.ts
import { auth } from "~/lib/auth"
import { abortMultipartUpload } from "~/lib/minio"

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
    if (!body.uploadId || !body.objectName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: uploadId and objectName are required'
      })
    }
    
    // Abort the multipart upload
    await abortMultipartUpload(
      body.uploadId,
      body.objectName
    )
    
    // Return success
    return {
      success: true,
      message: 'Upload aborted successfully'
    }
    
  } catch (error:any) {
    console.error('Error aborting multipart upload:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to abort multipart upload'
    })
  }
})
