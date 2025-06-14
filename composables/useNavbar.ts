import { useState, useFetch } from '#app'
import { computed } from 'vue'
import type { User } from '~/types/user'



export function useNavbar() {
  // Use Nuxt's useState for SSR-compatible state
  const user = useState<User | null>('navbar-user', () => null)
  const loading = useState<boolean>('navbar-loading', () => false)
  const error = useState<string>('navbar-error', () => '')
  
  // Computed properties for authentication state
  const isLoggedIn = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || 'visitor')
  
  // Fetch user data in a way that works with SSR
  const fetchUserData = async () => {
    // Skip if we already have user data
    if (user.value) return user.value
    
    loading.value = true
    error.value = ''
    
    try {
      const { data } = await useFetch('/api/auth/me', {
        key: 'navbar-auth',
        credentials: 'include',
        transform: (response: any) => {
          if (response && response.success && response.user) {
            return response.user
          }
          return null
        },
        // Only cache on client-side to ensure fresh data when navigating between pages
        getCachedData: import.meta.client ? undefined : () => null
      })
      
      user.value = data.value
      return data.value
    } catch (err: any) {
      console.error('Failed to fetch navbar user data:', err)
      error.value = 'Authentication error'
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Handle logout
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      
      // Clear user data
      user.value = null
      
      // Reload the page to reset all state
      if (import.meta.client) {
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Logout error:', err)
    }
  }
  
  return {
    user,
    loading,
    error,
    isLoggedIn,
    userRole,
    fetchUserData,
    logout
  }
}
