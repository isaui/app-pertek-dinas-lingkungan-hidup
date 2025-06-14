import { defineEventHandler, getRequestURL, getRequestHeaders, sendRedirect, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  const headers = getRequestHeaders(event)
  
  console.log('==================================')
  console.log(`【SERVER】 Request to: ${path}`)
  console.log(`【SERVER】 Method: ${event.method}`)
  
  // Log cookies if present
  if (headers.cookie) {
    console.log(`【SERVER】 Cookies present`)
    // Redacted the full cookie value from logs for security
  }
  
  // Log referer if present
  if (headers.referer) {
    console.log(`【SERVER】 Referer: ${headers.referer}`)
  }
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/unauthorized', '/about', '/akun/verify', 
                       '/akun/reset-password', '/forgot-password']
                       
  // Don't check authentication for public paths, assets, or API endpoints
  if (path === '/' || 
      publicRoutes.includes(path) || 
      path.startsWith('/_nuxt/') || 
      path.startsWith('/images/') || 
      path.match(/\.(js|css|ico|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$/)) {
    console.log('【SERVER】 Public route, allowing access')
    return
  }
  
  // For API requests, let the API handlers check auth
  if (path.startsWith('/api/')) {
    console.log('【SERVER】 API request, delegating auth check to handler')
    return
  }
  
  // Langsung lakukan pemeriksaan auth dengan memanggil /api/auth/me
  try {
    console.log('【SERVER】 Checking auth status by calling /api/auth/me')
    
    // Di server middleware, kita gunakan $fetch dengan forwarding cookies
    const response = await $fetch('/api/auth/me', {
      headers: headers.cookie ? { cookie: headers.cookie } : undefined
    })
    
    if (!response || !response.success || !response.user) {
      console.log('【SERVER】 Auth check failed, redirecting to login')
      return sendRedirect(event, `/login?redirect=${encodeURIComponent(path)}`)
    }
    
    console.log('【SERVER】 Auth check passed for user:', response.user.name || response.user.email)
    
    // Periksa akses admin jika path dimulai dengan /admin
    if (path.startsWith('/admin') && response.user.role !== 'administrator') {
      console.log('【SERVER】 Unauthorized access attempt to admin area')
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found'
      })
    }
  } catch (error: any) {
    console.error('【SERVER】 Auth check error:', error)
    if(error.statusCode === 404){
      throw error;
    }
    
    // Jika terjadi error dengan API, redirect ke login
    return sendRedirect(event, `/login?redirect=${encodeURIComponent(path)}`)
  }
  
  console.log('==================================')
})
