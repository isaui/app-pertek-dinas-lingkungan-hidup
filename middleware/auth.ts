// middleware/auth.ts

export default defineNuxtRouteMiddleware(async (to, from) => {
  const publicRoutes = ['/login', '/register', '/', '/about', '/akun/verify', '/akun/reset-password', '/forgot-password']
  
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // Gunakan isClient() untuk memeriksa lingkungan client-side
  if (import.meta.server) {
    // Pada server-side, kita percayakan pada konfigurasi server-side auth (Lucia, NextAuth, dll)
    // Route API sudah dikonfigurasi untuk menangani autentikasi server-side
    return
  }

  console.log('【LOG】 Auth middleware started')
  
  // Di client-side, langsung coba fetch user
  try {
    const { data } = await useFetch('/api/auth/me', {
      credentials: 'include'
    })
    
    const response = data.value
    
    if (!response || !response.success || !response.user) {
      return navigateTo('/login')
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return navigateTo('/login')
  }
})