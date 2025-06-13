// server/api/logout.post.ts
import { auth } from "~/lib/auth"

export default defineEventHandler(async (event) => {
  try {
    // Get headers for session token
    const eventHeaders = getHeaders(event)
    const headers = new Headers()
    
    Object.entries(eventHeaders).forEach(([key, value]) => {
      if (value) {
        headers.set(key, value)
      }
    })
    
    // Sign out via Better Auth
    const logoutResponse = await auth.api.signOut({
      headers: headers,
      asResponse: true
    })
    
    // Forward logout cookies to client
    const setCookieHeaders = logoutResponse.headers.getSetCookie?.() || 
                           logoutResponse.headers.get('set-cookie')
    
    if (setCookieHeaders) {
      if (Array.isArray(setCookieHeaders)) {
        setCookieHeaders.forEach(cookie => {
          setHeader(event, 'set-cookie', cookie)
        })
      } else {
        setHeader(event, 'set-cookie', setCookieHeaders)
      }
    }
    
    return {
      success: true,
      message: 'Logout successful'
    }
    
  } catch (error: any) {
    console.error('Logout error:', error)
    
    // Even if logout fails, return success
    // Frontend will handle redirect anyway
    return {
      success: true,
      message: 'Logout completed'
    }
  }
})