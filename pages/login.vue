<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mt-6 text-2xl font-semibold text-slate-800">Masuk ke Sistem PERTEK</h2>
        <p class="mt-2 text-slate-600">Masukkan kredensial Anda untuk mengakses sistem Persetujuan Teknis</p>
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
      
      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <!-- Username/Email Field -->
        <div>
          <label for="identifier" class="block text-sm font-medium text-slate-700 mb-1">Email atau Username Pengguna</label>
          <input 
            v-model="identifier" 
            id="identifier" 
            name="identifier" 
            type="text" 
            autocomplete="username" 
            required
            class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
          />
        </div>
        
        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
          <input 
            v-model="password" 
            id="password" 
            name="password" 
            type="password" 
            autocomplete="current-password" 
            required
            class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
          />
        </div>

        <!-- Forgot Password -->
        <div class="flex items-center justify-end text-sm">
          <div>
            <a href="/forgot-password" class="font-medium text-slate-600 hover:text-slate-500">Lupa kata sandi?</a>
          </div>
        </div>

        <!-- Login Button -->
        <div>
          <button 
            type="submit" 
            class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            :disabled="loading"
          >
            <template v-if="loading">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </template>
            <template v-else>Masuk</template>
          </button>
        </div>
      </form>

      <!-- Footer Links -->
      <div class="mt-8 text-center">
        <div class="text-sm text-slate-600">
          <NuxtLink to="/register" class="font-medium text-slate-600 hover:text-slate-500">Daftar akun baru</NuxtLink>
          <span class="mx-2">|</span>
          <NuxtLink to="/" class="font-medium text-slate-600 hover:text-slate-500">Kembali ke Beranda</NuxtLink>
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
import { authClient } from '~/lib/auth-client'

// SEO metadata
useHead({
  title: 'Login - Aplikasi Status Dokumen PERTEK/SLO | Dinas Lingkungan Hidup Kabupaten Grobogan',
  meta: [
    { name: 'description', content: 'Halaman login Aplikasi Status Dokumen Persetujuan Teknis (PERTEK) Dinas Lingkungan Hidup Kabupaten Grobogan.' },
    { name: 'keywords', content: 'login, pertek, persetujuan teknis, dokumen, dlh, grobogan, dinas lingkungan hidup' },
    { property: 'og:title', content: 'Login - Aplikasi Status Dokumen PERTEK' },
    { property: 'og:description', content: 'Halaman login Aplikasi Status Dokumen Persetujuan Teknis (PERTEK) Dinas Lingkungan Hidup Kabupaten Grobogan.' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' }
  ]
});

const router = useRouter();
const identifier = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';

  try {
    // Direct API call to login endpoint
    await $fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      body: {
        identifier: identifier.value,
        password: password.value
      }
    });
    await authClient.getSession()
    
    // If successful, redirect to profile page
    router.push('/akun');
  } catch (err) {
    console.error('Login error:', err);
    // Display the specific error message from the server
    error.value = err?.response?._data?.statusMessage || err?.message || 'Authentication failed';
  } finally {
    loading.value = false;
  }
};
</script>
