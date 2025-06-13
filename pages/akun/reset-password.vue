<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mt-6 text-2xl font-semibold text-slate-800">Reset Password</h2>
        <p v-if="loading && !isInvalidToken" class="mt-2 text-slate-600">Memeriksa token reset password...</p>
        <p v-else-if="isValidToken" class="mt-2 text-slate-600">Silahkan masukkan password baru Anda</p>
        <p v-else class="mt-2 text-slate-600">Link reset password yang tidak valid atau kadaluarsa</p>
      </div>
      
      <!-- Loading Spinner -->
      <div v-if="loading && !error" class="flex flex-col items-center py-6">
        <svg class="animate-spin h-10 w-10 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-3 text-slate-600">Memeriksa token...</p>
      </div>
      
      <!-- Alert for error messages -->
      <div v-if="error" class="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
            <div v-if="isExpiredToken" class="mt-3">
              <button @click="requestNewToken" 
                class="text-sm text-red-700 font-medium hover:text-red-600 focus:outline-none">
                Kirim ulang email reset password
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Success message -->
      <div v-if="success" class="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700 font-medium">Password berhasil diubah!</p>
            <p class="text-sm text-green-700 mt-1">Password Anda telah berhasil diperbarui. Silakan login dengan password baru Anda.</p>
            <p class="text-sm text-green-700 mt-1">Anda akan dialihkan ke halaman login dalam <strong>{{ countdown }}</strong> detik...</p>
          </div>
        </div>
      </div>
      
      <!-- Reset Password Form -->
      <form v-if="isValidToken && !success" class="space-y-6" @submit.prevent="handleResetPassword">
        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Password Baru</label>
          <input v-model="password" id="password" name="password" type="password" autocomplete="new-password" required
            class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
            placeholder="Minimal 6 karakter" />
          <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
        </div>
        
        <!-- Confirm Password Field -->
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
          <input v-model="confirmPassword" id="confirmPassword" name="confirmPassword" type="password" autocomplete="new-password" required
            class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
            placeholder="Masukkan ulang password" />
          <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">{{ confirmPasswordError }}</p>
        </div>
        
        <!-- Submit Button -->
        <div>
          <button type="submit" 
            :disabled="formLoading"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400">
            <template v-if="formLoading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </template>
            <template v-else>Reset Password</template>
          </button>
        </div>
      </form>
      
      <!-- Invalid Token Action -->
      <div v-if="isInvalidToken && !loading && !success" class="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <p class="text-slate-700 mb-4">Link reset password tidak valid atau telah kadaluarsa. Silakan minta link reset password baru.</p>
        <NuxtLink to="/forgot-password" 
          class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
          Minta Link Reset Password Baru
        </NuxtLink>
      </div>
      
      <!-- Footer Links -->
      <div class="mt-8 text-center">
        <div class="text-sm text-slate-600">
          <NuxtLink to="/login" class="font-medium text-slate-600 hover:text-slate-500">Kembali ke Halaman Login</NuxtLink>
          <span class="mx-2">|</span>
          <NuxtLink to="/register" class="font-medium text-slate-600 hover:text-slate-500">Buat Akun Baru</NuxtLink>
        </div>
        <p class="mt-4 text-xs text-slate-500">© {{ new Date().getFullYear() }} Dinas Lingkungan Hidup Kabupaten Grobogan. Hak Cipta Dilindungi.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHead } from '#app';

// SEO metadata
useHead({
  title: 'Reset Password - Sistem PERTEK',
  meta: [
    { name: 'description', content: 'Reset password untuk mengakses sistem Persetujuan Teknis (PERTEK)' },
    { name: 'keywords', content: 'reset password, pertek, persetujuan teknis, dokumen, dlh, grobogan, dinas lingkungan hidup' },
    { property: 'og:title', content: 'Reset Password - Sistem PERTEK' },
    { property: 'og:description', content: 'Reset password untuk mengakses sistem Persetujuan Teknis (PERTEK)' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'noindex, nofollow' }
  ]
});

const route = useRoute();
const router = useRouter();
const token = ref('');
const email = ref('');
const loading = ref(true);
const formLoading = ref(false);
const isValidToken = ref(false);
const isInvalidToken = ref(false);
const isExpiredToken = ref(false);
const error = ref('');
const success = ref(false);
const password = ref('');
const confirmPassword = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const countdown = ref(5);

onMounted(async () => {
  token.value = route.query.token;
  
  if (!token.value) {
    error.value = 'Token reset password tidak ditemukan';
    isInvalidToken.value = true;
    loading.value = false;
    return;
  }
  
  // Verify token
  try {
    const result = await $fetch('/api/auth/verify-reset-token', {
      method: 'POST',
      body: { token: token.value }
    });
    
    if (result?.data?.email) {
      email.value = result.data.email;
      isValidToken.value = true;
    } else {
      throw new Error('Token tidak valid');
    }
  } catch (err) {
    console.error('Error verifying token:', err);
    error.value = err?.response?._data?.statusMessage || 'Token reset password tidak valid';
    isInvalidToken.value = true;
    
    // Check if token is expired
    if (err?.response?._data?.data?.expired) {
      isExpiredToken.value = true;
      email.value = err?.response?._data?.data?.email || '';
    }
  } finally {
    loading.value = false;
  }
});

// Form validation
const validateForm = () => {
  let isValid = true;
  
  // Reset errors
  passwordError.value = '';
  confirmPasswordError.value = '';
  
  // Validate password
  if (password.value.length < 6) {
    passwordError.value = 'Password minimal 6 karakter';
    isValid = false;
  }
  
  // Validate password confirmation
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Konfirmasi password tidak cocok';
    isValid = false;
  }
  
  return isValid;
};

// Handle form submission
const handleResetPassword = async () => {
  if (!validateForm()) return;
  
  formLoading.value = true;
  error.value = '';
  
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        password: password.value
      }
    });
    
    // Show success message
    success.value = true;
    
    // Countdown and redirect to login
    countdown.value = 5;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        router.push('/login');
      }
    }, 1000);
    
  } catch (err) {
    console.error('Error resetting password:', err);
    error.value = err?.response?._data?.statusMessage || 'Gagal mengubah password';
  } finally {
    formLoading.value = false;
  }
};

// Request new reset token if expired
const requestNewToken = async () => {
  if (!email.value) {
    router.push('/forgot-password');
    return;
  }
  
  formLoading.value = true;
  
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    });
    
    error.value = 'Email reset password baru telah dikirim. Silakan periksa inbox email Anda.';
    isExpiredToken.value = false;
  } catch (err) {
    console.error('Error requesting new token:', err);
    error.value = err?.response?._data?.statusMessage || 'Gagal mengirim email reset password baru';
  } finally {
    formLoading.value = false;
  }
};
</script>
