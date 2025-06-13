import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Definisi tipe untuk User
interface User {
  id: string
  name: string
  username: string | null
  email: string
  instansi: string | null
  nomorHp: string | null
  createdAt: string | Date
  updatedAt: string | Date
  emailVerified: boolean | string | null
  role: string
}

// Tipe untuk form update profile
interface ProfileUpdateData {
  name: string
  username: string
  instansi?: string
  nomorHp?: string
}

export function useProfile() {
  const router = useRouter()
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref('')

  // Password change
  const showChangePasswordModal = ref(false)
  const newPassword = ref('')
  const confirmPassword = ref('')
  const passwordError = ref('')
  const passwordLoading = ref(false)

  // Profile update
  const updateLoading = ref(false)
  const updateError = ref('')
  const updateSuccess = ref(false)

  // Fetch user data
  const fetchUserData = async () => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await $fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (response && response.success && response.user) {
        user.value = response.user
        console.log('User data loaded:', response.user)
      }
    } catch (err:any) {
      console.error('Failed to fetch user data:', err)
      error.value = 'Gagal memuat data profil'

    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (profileData: ProfileUpdateData) => {
    updateLoading.value = true
    updateError.value = ''
    updateSuccess.value = false
    
    try {
      const response:any = await $fetch('/api/auth/update-profile', {
        method: 'POST',
        body: profileData,
        credentials: 'include'
      })
      
      if (response && response.success) {
        // Update local user data
        if (response.user) {
          user.value = response.user
        }
        
        updateSuccess.value = true
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          updateSuccess.value = false
        }, 3000)
        
        return true
      }
      
      return false
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      updateError.value = err?.data?.statusMessage || 'Gagal memperbarui profil'
      return false
    } finally {
      updateLoading.value = false
    }
  }

  // Reset password form
  const resetPasswordForm = () => {
    newPassword.value = ''
    confirmPassword.value = ''
    passwordError.value = ''
  }

  // Change password
  const changePassword = async (passedNewPassword?: string, passedConfirmPassword?: string) => {
    passwordError.value = ''
    
    // Use passed values if provided, otherwise use local state
    const newPass = passedNewPassword || newPassword.value
    const confirmPass = passedConfirmPassword || confirmPassword.value
    
    // Update local state if values were passed
    if (passedNewPassword) {
      newPassword.value = passedNewPassword
    }
    if (passedConfirmPassword) {
      confirmPassword.value = passedConfirmPassword
    }
    
    // Validate
    if (!newPass) {
      passwordError.value = 'Kata sandi baru diperlukan'
      return false
    }
    
    if (newPass.length < 6) {
      passwordError.value = 'Kata sandi minimal 6 karakter'
      return false
    }
    
    if (newPass !== confirmPass) {
      passwordError.value = 'Konfirmasi kata sandi tidak cocok'
      return false
    }
    
    passwordLoading.value = true
    try {
      await $fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        body: {
          newPassword: newPass
        }
      })
      
      // Success - close modal and reset form
      showChangePasswordModal.value = false
      resetPasswordForm()
      return true
    } catch (err: any) {
      console.error('Failed to change password:', err)
      passwordError.value = err?.data?.statusMessage || 'Gagal mengubah kata sandi'
      return false
    } finally {
      passwordLoading.value = false
    }
  }
// Update logout function di useProfile.ts
const logout = async () => {
  try {
    // Call custom logout API
    await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    
    // Clear local state
    user.value = null
    
    // Redirect to login
    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
    // Force redirect even if logout fails
    router.push('/login')
  }
}
  // Reset update state
  const resetUpdateState = () => {
    updateError.value = ''
    updateSuccess.value = false
  }

  return {
    // User data
    user,
    loading,
    error,
    
    // Password change
    showChangePasswordModal,
    newPassword,
    confirmPassword,
    passwordError,
    passwordLoading,
    
    // Profile update
    updateLoading,
    updateError,
    updateSuccess,
    
    // Methods
    fetchUserData,
    updateProfile,
    resetPasswordForm,
    changePassword,
    logout,
    resetUpdateState
  }
}