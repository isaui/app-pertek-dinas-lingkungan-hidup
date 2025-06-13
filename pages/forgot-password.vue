<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mt-6 text-2xl font-semibold text-slate-800">Lupa Password</h2>
        <p class="mt-2 text-slate-600">Masukkan email Anda untuk menerima link reset password</p>
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
            <p class="text-sm text-green-700 font-medium">Email terkirim!</p>
            <p class="text-sm text-green-700 mt-1">Email dengan instruksi reset password telah dikirim ke <strong>{{ emailSent }}</strong>. Silakan periksa kotak masuk email Anda (termasuk folder spam) dan ikuti petunjuknya.</p>
            <p class="text-sm text-green-700 mt-1">Anda akan dialihkan ke halaman login dalam <strong>{{ countdown }}</strong> detik...</p>
          </div>
        </div>
      </div>
      
      <!-- Forgot Password Form -->
      <form v-if="!success" class="space-y-6" @submit.prevent="handleForgotPassword">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Alamat Email</label>
          <input v-model="email" id="email" name="email" type="email" autocomplete="email" required
            class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
            placeholder="email@contoh.com" />
        </div>
        
        <!-- Submit Button -->
        <div>
          <button type="submit" 
            :disabled="loading"
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400">
            <template v-if="loading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </template>
            <template v-else>Kirim Link Reset Password</template>
          </button>
        </div>
      </form>
      
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
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useHead } from '#app';

// SEO metadata
useHead({
  title: 'Lupa Password - Sistem PERTEK',
  meta: [
    { name: 'description', content: 'Reset password untuk mengakses sistem Persetujuan Teknis (PERTEK)' },
    { name: 'keywords', content: 'lupa password, reset password, pertek, persetujuan teknis, dokumen, dlh, grobogan, dinas lingkungan hidup' },
    { property: 'og:title', content: 'Lupa Password - Sistem PERTEK' },
    { property: 'og:description', content: 'Reset password untuk mengakses sistem Persetujuan Teknis (PERTEK)' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' }
  ]
});

const router = useRouter();
const loading = ref(false);
const error = ref('');
const success = ref(false);
const email = ref('');
const emailSent = ref('');
const countdown = ref(5);

const handleForgotPassword = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: {
        email: email.value
      }
    });
    
    // Show success message
    emailSent.value = email.value;
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
    console.error('Error reset password:', err);
    error.value = err?.response?._data?.statusMessage || err?.message || 'Gagal mengirim email reset password';
  } finally {
    loading.value = false;
  }
};
</script>
