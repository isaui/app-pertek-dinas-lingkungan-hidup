// server/api/auth/login.post.ts
import { auth } from "~/lib/auth"
import { 
  validateLoginInputs, 
  resolveEmailFromIdentifier, 
  prepareHeaders 
} from "../../utils/auth-utils"

export default defineEventHandler(async (event) => {
  const { identifier, password } = await readBody(event)
  validateLoginInputs(identifier, password)
  
  try {
    const email = await resolveEmailFromIdentifier(identifier)
    const headers = prepareHeaders(event)
    
    // Get response dengan asResponse: true
    const authResponse = await auth.api.signInEmail({
      body: { email, password },
      headers,
      asResponse: true
    })
    
    // ✅ Check kalau response ga OK (status 400, 401, etc)
    if (!authResponse.ok) {
      const errorBody = await authResponse.json().catch(() => ({}))
      
      // Handle different error status codes
      if (authResponse.status === 401) {
        throw createError({
          statusCode: 401,
          statusMessage: 'kredensial salah'
        })
      } else if (authResponse.status === 400) {
        throw createError({
          statusCode: 400,
          statusMessage: errorBody.message || 'Data login tidak valid'
        })
      } else if (authResponse.status === 429) {
        throw createError({
          statusCode: 429,
          statusMessage: 'Terlalu banyak percobaan login. Coba lagi nanti.'
        })
      } else {
        throw createError({
          statusCode: authResponse.status,
          statusMessage: errorBody.message || 'Login gagal'
        })
      }
    }
    
    // ✅ Kalau sukses, forward cookies
    const setCookieHeaders = authResponse.headers.getSetCookie?.() || 
                           authResponse.headers.get('set-cookie')

    if (setCookieHeaders) {
      if (Array.isArray(setCookieHeaders)) {
        setCookieHeaders.forEach(cookie => {
          setHeader(event, 'set-cookie', cookie)
        })
      } else {
        setHeader(event, 'set-cookie', setCookieHeaders)
      }
    }
    
    return { success: true }
    
  } catch (error: any) {
    // Forward error yang udah di-handle
    console.log(error)
    throw error.statusMessage ? error : createError({
      statusCode: 500,
      statusMessage: 'Terjadi kesalahan yang tidak diharapkan'
    })
  }
})