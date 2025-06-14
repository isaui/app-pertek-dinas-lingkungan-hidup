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
    console.log('Complete request body:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    if (!body.uploadId || !body.objectName || !Array.isArray(body.parts) || body.parts.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request: uploadId, objectName, and parts are required'
      })
    }
    
    // Define type for part object
    type PartInfo = { etag: string; part: number }
    
    // Log the parts data received
    console.log('Parts received:', JSON.stringify(body.parts, null, 2))
    
    // Sort parts by part number (required by S3 API)
    const sortedParts = [...body.parts].sort((a, b) => a.part - b.part);
    console.log('Sorted parts:', JSON.stringify(sortedParts, null, 2));
    
    // Validate parts format
    const validParts = sortedParts.every((part: unknown) => 
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
    
    console.log('Using sorted parts for completion:', JSON.stringify(sortedParts, null, 2));
    
    // Complete the multipart upload - menggunakan format {etag, part} sesuai definisi fungsi
    const fileUrl = await completeMultipartUpload(
      body.uploadId,
      body.objectName,
      sortedParts
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
