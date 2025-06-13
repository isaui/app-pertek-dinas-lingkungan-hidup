<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mt-6 text-2xl font-semibold text-slate-800">Verifikasi Email</h2>
        <p class="mt-2 text-slate-600">{{ isLoading ? 'Memverifikasi email Anda...' : 'Status verifikasi akun' }}</p>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="flex justify-center py-8">
        <svg class="animate-spin h-10 w-10 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <!-- Success message -->
      <div v-if="verificationStatus === 'success'" class="bg-green-50 border-l-4 border-green-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700 font-medium">Email berhasil diverifikasi!</p>
            <p class="text-sm text-green-700 mt-1">Akun Anda sudah aktif dan siap digunakan. Silakan masuk menggunakan email dan kata sandi Anda.</p>
          </div>
        </div>
      </div>
      
      <!-- Error message -->
      <div v-if="verificationStatus === 'error'" class="bg-red-50 border-l-4 border-red-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700 font-medium">Verifikasi gagal!</p>
            <p class="text-sm text-red-700 mt-1">{{ errorMessage || 'Token verifikasi tidak valid atau sudah kadaluarsa.' }}</p>
          </div>
        </div>
      </div>
      
      <!-- Token expired message -->
      <div v-if="verificationStatus === 'expired'" class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700 font-medium">Token verifikasi sudah kadaluarsa!</p>
            <p class="text-sm text-yellow-700 mt-1">Token verifikasi sudah tidak berlaku. Silakan minta token verifikasi baru.</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="!isLoading" class="mt-6 flex flex-col space-y-4">
        <button 
          v-if="verificationStatus === 'expired' || verificationStatus === 'error'"
          @click="resendVerification" 
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-600 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          :disabled="isResending"
        >
          <template v-if="isResending">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Mengirim...
          </template>
          <template v-else>Kirim Ulang Email Verifikasi</template>
        </button>
        
        <NuxtLink to="/login" class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
          {{ verificationStatus === 'success' ? 'Masuk ke Akun' : 'Kembali ke Halaman Login' }}
        </NuxtLink>
        
        <NuxtLink to="/" class="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
          Kembali ke Beranda
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHead } from '#app';

// SEO metadata
useHead({
  title: 'Verifikasi Email - Sistem PERTEK',
  meta: [
    { name: 'description', content: 'Verifikasi email untuk akun sistem Persetujuan Teknis (PERTEK)' },
    { name: 'robots', content: 'noindex' } // Don't index this page
  ]
});

const route = useRoute();
const token = ref('');
const isLoading = ref(true);
const isResending = ref(false);
const verificationStatus = ref(''); // 'success', 'error', 'expired'
const errorMessage = ref('');
const email = ref('');

onMounted(async () => {
  // Get token from URL
  token.value = route.query.token;
  
  if (!token.value) {
    verificationStatus.value = 'error';
    errorMessage.value = 'Token verifikasi tidak ditemukan dalam URL.';
    isLoading.value = false;
    return;
  }
  
  try {
    // Call API to verify token
    const response = await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: {
        token: token.value
      }
    });
    
    email.value = response.email;
    verificationStatus.value = 'success';
  } catch (err) {
    console.error('Error verifying email:', err);
    
    // Check if token expired
    if (err?.response?._data?.statusCode === 410) {
      verificationStatus.value = 'expired';
      // Extract email from error response if available
      email.value = err?.response?._data?.email || '';
    } else {
      verificationStatus.value = 'error';
      errorMessage.value = err?.response?._data?.statusMessage || 'Terjadi kesalahan saat memverifikasi email.';
    }
  } finally {
    isLoading.value = false;
  }
});

// Function to request a new verification token
const resendVerification = async () => {
  if (!email.value) {
    errorMessage.value = 'Email tidak tersedia untuk pengiriman ulang.';
    return;
  }
  
  isResending.value = true;
  
  try {
    await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: {
        email: email.value
      }
    });
    
    // Show success message
    verificationStatus.value = 'resent';
    errorMessage.value = '';
  } catch (err) {
    console.error('Error resending verification email:', err);
    errorMessage.value = err?.response?._data?.statusMessage || 'Gagal mengirim ulang email verifikasi.';
  } finally {
    isResending.value = false;
  }
};
</script>
