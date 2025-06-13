<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h2 class="mt-6 text-2xl font-semibold text-slate-800">Registrasi Akun Baru</h2>
        <p class="mt-2 text-slate-600">Silakan daftar untuk mengakses Aplikasi Status Dokumen PERTEK</p>
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
      
      <!-- Success message after registration -->
      <div v-if="registrationSuccess" class="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700 font-medium">Registrasi berhasil!</p>
            <p class="text-sm text-green-700 mt-1">Email verifikasi telah dikirim ke <strong>{{ registeredEmail }}</strong>. Silakan periksa kotak masuk email Anda (termasuk folder spam) dan klik link verifikasi.</p>
            <p class="text-sm text-green-700 mt-1">Anda akan dialihkan ke halaman login dalam <strong>{{ countdown }}</strong> detik...</p>
          </div>
        </div>
      </div>
      
      <!-- Unverified email message -->
      <div v-if="unverifiedEmailCase" class="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-yellow-700 font-medium">Email sudah terdaftar tapi belum diverifikasi!</p>
            <p class="text-sm text-yellow-700 mt-1">Akun dengan email <strong>{{ registeredEmail }}</strong> sudah pernah terdaftar tetapi belum diverifikasi. Silakan verifikasi email Anda atau kirim ulang email verifikasi.</p>
            <button 
              @click="resendVerification"
              class="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              :disabled="resendingVerification"
            >
              <svg v-if="resendingVerification" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ resendingVerification ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Resend verification success -->
      <div v-if="resendSuccess" class="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700 font-medium">Email verifikasi telah dikirim ulang!</p>
            <p class="text-sm text-green-700 mt-1">Email verifikasi baru telah dikirim ke <strong>{{ registeredEmail }}</strong>. Silakan periksa kotak masuk email Anda (termasuk folder spam) dan klik link verifikasi.</p>
            <p class="text-sm text-green-700 mt-1">Anda akan dialihkan ke halaman login dalam <strong>{{ countdown }}</strong> detik...</p>
          </div>
        </div>
      </div>
      
      <!-- Registration Form -->
      <form class="space-y-6" @submit.prevent="handleRegister">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Name Field -->
          <div>
            <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
            <input v-model="form.name" id="name" name="name" type="text" required
              class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
              placeholder="Masukkan nama lengkap" />
          </div>
          
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-slate-700 mb-1">Username Pengguna</label>
            <input v-model="form.username" id="username" name="username" type="text" required
              class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
              placeholder="username123" />
          </div>
        </div>
        
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Alamat Email</label>
          <input v-model="form.email" id="email" name="email" type="email" autocomplete="email" required
            class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
            placeholder="email@contoh.com" />
        </div>
        
        <!-- Password Field -->
        <div>
          <label for="password" class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi</label>
          <input v-model="form.password" id="password" name="password" type="password" autocomplete="new-password" required
            class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
            placeholder="Minimal 6 karakter" />
        </div>
        
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <!-- Instansi Field -->
          <div>
            <label for="instansi" class="block text-sm font-medium text-slate-700 mb-1">Instansi</label>
            <input v-model="form.instansi" id="instansi" name="instansi" type="text" required
              class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
              placeholder="Nama instansi" />
          </div>
          
          <!-- Nomor HP Field -->
          <div>
            <label for="nomorHp" class="block text-sm font-medium text-slate-700 mb-1">Nomor HP</label>
            <input v-model="form.nomorHp" id="nomorHp" name="nomorHp" type="tel" required
              class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
              placeholder="08123456789" />
          </div>
        </div>
        
        <!-- Terms and Conditions -->
        <div class="flex items-center">
          <input id="terms" name="terms" type="checkbox" required
            class="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded">
          <label for="terms" class="ml-2 block text-sm text-slate-700">
            Saya menyetujui 
            <a href="#" class="font-medium text-slate-600 hover:text-slate-500">Syarat dan Ketentuan</a>
          </label>
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
            <template v-else>Buat Akun Baru</template>
          </button>
        </div>
      </form>
      
      <!-- Footer Links -->
      <div class="mt-8 text-center">
        <div class="text-sm text-slate-600">
          <NuxtLink to="/login" class="font-medium text-slate-600 hover:text-slate-500">Sudah punya akun? Masuk</NuxtLink>
          <span class="mx-2">|</span>
          <NuxtLink to="/" class="font-medium text-slate-600 hover:text-slate-500">Kembali ke Beranda</NuxtLink>
        </div>
        <p class="mt-4 text-xs text-slate-500">© {{ new Date().getFullYear() }} Dinas Lingkungan Hidup Kabupaten Grobogan. Hak Cipta Dilindungi.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useHead } from '#app';

// SEO metadata
useHead({
  title: 'Register - Sistem PERTEK',
  meta: [
    { name: 'description', content: 'Registrasi akun baru untuk mengakses sistem Persetujuan Teknis (PERTEK)' },
    { name: 'keywords', content: 'register, pertek, persetujuan teknis, dokumen, dlh, grobogan, dinas lingkungan hidup' },
    { property: 'og:title', content: 'Register - Sistem PERTEK' },
    { property: 'og:description', content: 'Registrasi akun baru untuk mengakses sistem Persetujuan Teknis (PERTEK)' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' }
  ]
});

const router = useRouter();
const loading = ref(false);
const error = ref('');
const registrationSuccess = ref(false);
const registeredEmail = ref('');
const unverifiedEmailCase = ref(false);
const resendingVerification = ref(false);
const resendSuccess = ref(false);
const countdown = ref(5); // Timer countdown dari 5 detik

const form = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  instansi: '',
  nomorHp: ''
});

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  registrationSuccess.value = false;
  unverifiedEmailCase.value = false;
  resendSuccess.value = false;

  try {
    // Daftarkan pengguna menggunakan API
    await $fetch('/api/auth/register', {
      method: 'POST',
      credentials: 'include',
      body: form,
    });
    
    // Store the email for displaying in the success message
    registeredEmail.value = form.email;
    registrationSuccess.value = true;
    
    // Countdown dan redirect ke login
    countdown.value = 5;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        router.push('/login');
      }
    }, 1000);
  } catch (err) {
    console.error('Error registrasi:', err);
    
    // Check for unverified email special case (status code 409)
    if (err?.response?.status === 409 && err?.response?._data?.data?.unverifiedEmail) {
      unverifiedEmailCase.value = true;
      registeredEmail.value = form.email;
    } else {
      error.value = err?.response?._data?.statusMessage || err?.message || 'Registrasi gagal';
    }
  } finally {
    loading.value = false;
  }
};

// Function to resend verification email
const resendVerification = async () => {
  if (!registeredEmail.value) return;
  
  resendingVerification.value = true;
  error.value = '';
  
  try {
    await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: {
        email: registeredEmail.value
      }
    });
    
    // Show success message
    resendSuccess.value = true;
    unverifiedEmailCase.value = false;
    
    // Countdown dan redirect ke login
    countdown.value = 5;
    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        router.push('/login');
      }
    }, 1000);
  } catch (err) {
    console.error('Error resending verification email:', err);
    error.value = err?.response?._data?.statusMessage || err?.message || 'Gagal mengirim ulang email verifikasi';
  } finally {
    resendingVerification.value = false;
  }
};
</script>
