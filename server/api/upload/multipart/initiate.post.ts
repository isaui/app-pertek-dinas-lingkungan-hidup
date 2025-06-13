// server/api/upload/multipart/initiate.post.ts
import { auth } from "~/lib/auth"
import { initiateMultipartUpload } from "~/lib/minio"
import { randomUUID } from "crypto"

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
    if (!body.filename || !body.contentType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Filename and contentType are required'
      })
    }
    
    // Generate unique file path
    const fileExt = body.filename.split('.').pop() || ''
    const uniqueFilename = `${randomUUID()}.${fileExt}`
    const objectName = `uploads/${session.user.id}/${uniqueFilename}`
    
    // Initiate multipart upload
    const uploadInfo = await initiateMultipartUpload(
      objectName, 
      body.contentType || 'application/octet-stream'
    )
    
    // Return upload information for the client
    return {
      success: true,
      ...uploadInfo,
      originalFilename: body.filename
    }
    
  } catch (error:any) {
    console.error('Error initiating multipart upload:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to initiate multipart upload'
    })
  }
})
