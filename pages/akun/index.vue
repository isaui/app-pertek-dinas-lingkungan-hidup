<template>
  <div>
    <!-- Navbar -->
    <Navbar />
    
    <!-- Main Content -->
    <div class="min-h-screen bg-slate-50">
      <!-- Header -->
      <ProfileHeader :user="user" />

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatusMessage
          type="error"
          :show="true"
          :message="error"
        >
          <button 
            @click="fetchUserData"
            class="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Coba Lagi
          </button>
        </StatusMessage>
      </div>

      <!-- Main Content -->
      <div v-else-if="user" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Status Messages -->
        <StatusMessage
          type="success"
          :show="updateSuccess"
          message="Profil berhasil diperbarui!"
        />
        
        <StatusMessage
          type="error"
          :show="!!updateError"
          :message="updateError"
        />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Profile Form -->
          <div class="lg:col-span-2">
            <ProfileForm 
              :user="user" 
              :loading="updateLoading" 
              @submit="handleUpdateProfile"
            />
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Account Info -->
            <AccountInfo :user="user" />
            
            <!-- Security Options -->
            <SecurityOptions 
              @change-password="showChangePasswordModal = true"
              @logout="logout"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <ChangePasswordModal
      :is-open="showChangePasswordModal"
      :error="passwordError"
      :loading="passwordLoading"
      @close="closePasswordModal"
      @submit="handlePasswordChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useHead } from '#app'
import { useProfile } from '~/composables/useProfile'
import Navbar from '~/components/navbar/index.vue'
import ProfileHeader from '~/components/profile/ProfileHeader.vue'
import ProfileForm from '~/components/profile/ProfileForm.vue'
import AccountInfo from '~/components/profile/AccountInfo.vue'
import SecurityOptions from '~/components/profile/SecurityOptions.vue'
import ChangePasswordModal from '~/components/profile/ChangePasswordModal.vue'
import StatusMessage from '~/components/profile/StatusMessage.vue'

useHead({
  title: 'Profil Pengguna - Aplikasi Status Dokumen PERTEK/SLO | Dinas Lingkungan Hidup Kabupaten Grobogan',
  meta: [
    { name: 'description', content: 'Halaman profil pengguna untuk mengelola informasi akun dan pengaturan keamanan.' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const {
  user,
  loading,
  error,
  showChangePasswordModal,
  passwordError,
  passwordLoading,
  updateLoading,
  updateError,
  updateSuccess,
  fetchUserData,
  updateProfile,
  resetPasswordForm,
  changePassword,
  logout
} = useProfile()

// Update profile function
const handleUpdateProfile = async (profileData) => {
  await updateProfile(profileData)
}

// Handle password change
const handlePasswordChange = async ({ newPassword, confirmPassword }) => {
  // Reset previous error
  passwordError.value = ''
  
  // Pass values directly to the changePassword function which now accepts parameters
  await changePassword(newPassword, confirmPassword)
}

// Close password modal
const closePasswordModal = () => {
  showChangePasswordModal.value = false
  resetPasswordForm()
}

// Fetch user data on mount
onMounted(() => {
  fetchUserData()
})
</script>