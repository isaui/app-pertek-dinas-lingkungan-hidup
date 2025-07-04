<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    
    <div class="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">Pengajuan SLO</h1>
        <p class="mt-2 text-slate-600">Silakan lengkapi formulir pengajuan Surat Layak Operasi (SLO) di bawah ini.</p>
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
      <div v-if="successMessage" class="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>
        </div>
      </div>
      
      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-6">
          <!-- SLO Type Selector -->
          <SLOTypeSelector v-model="formData.sloType" />
          
          <!-- File Upload Fields -->
          <FileUploadField
            ref="fileUploadRef"
            id="persyaratan"
            label="Upload Persyaratan/Kelengkapan"
            description="Silakan unggah dokumen persyaratan SLO sesuai dengan ketentuan di bawah ini."
            :requirements="[
              'Surat Permohonan SLO',
              'Dokumen Hasil Uji Emisi/Air Limbah',
              'Bukti Kalibrasi Alat',
              'Dokumen Teknis Instalasi Pengelolaan'
            ]"
            acceptedFormats="pdf/doc/docx/rar"
            accept=".pdf,.doc,.docx,.rar"
            v-model="formData.persyaratanFiles"
            @uploaded="handleFilesUploaded"
            @upload-error="handleUploadError"
            @upload-progress="handleUploadProgress"
          />
          
          <!-- Company Info -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label for="company" class="block text-sm font-medium text-slate-700 mb-1">Nama Perusahaan/Instansi</label>
              <input 
                v-model="formData.company" 
                id="company"
                type="text"
                class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label for="address" class="block text-sm font-medium text-slate-700 mb-1">Alamat</label>
              <input 
                v-model="formData.address" 
                id="address"
                type="text"
                class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
                required
              />
            </div>
          </div>
          
          <!-- Notes/Description -->
          <div class="mb-6">
            <label for="notes" class="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea 
              v-model="formData.notes" 
              id="notes"
              rows="3"
              class="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-slate-900 sm:text-sm"
              placeholder="Tambahkan catatan jika diperlukan..."
            ></textarea>
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div class="flex items-center justify-end space-x-3">
            <button 
              type="button" 
              @click="$router.back()" 
              class="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Batal
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center space-x-2" 
              :disabled="!canSubmit || loading"
            >
              <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Memproses...' : 'Ajukan Permohonan' }}
            </button>
          </div>
        </div>
      </form>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useHead } from '#app';
import { useRouter } from 'vue-router';
import Navbar from '~/components/navbar/index.vue';
import SLOTypeSelector from '~/components/slo/SLOTypeSelector.vue';
import FileUploadField from '~/components/common/FileUploadField.vue';

// SEO metadata
useHead({
  title: 'Ajukan Permohonan SLO | DLH Kabupaten Grobogan',
  meta: [
    { name: 'description', content: 'Form pengajuan Surat Layak Operasi (SLO) pembuangan emisi dan air limbah di Dinas Lingkungan Hidup Kabupaten Grobogan.' },
    { name: 'keywords', content: 'slo, surat layak operasi, pembuangan emisi, air limbah, dinas lingkungan hidup, grobogan' }
  ]
});

const router = useRouter();
const loading = ref(false);
const error = ref('');
const successMessage = ref('');
const fileUploadRef = ref(null);
const uploadedFiles = ref([]);

const formData = ref({
  sloType: 'emisi',
  company: '',
  address: '',
  persyaratanFiles: [],
  notes: ''
});

// Check if form can be submitted
const canSubmit = computed(() => {
  return formData.value.company && 
         formData.value.address && 
         formData.value.persyaratanFiles.length > 0;
});

// Handle uploaded files from FileUploadField
const handleFilesUploaded = (files) => {
  uploadedFiles.value = files;
  successMessage.value = `${files.length} file berhasil diupload.`;
  
  // Clear success message after 3 seconds
  setTimeout(() => {
    successMessage.value = '';
  }, 3000);
};

// Handle upload errors from FileUploadField
const handleUploadError = (uploadError) => {
  error.value = `Error saat mengupload file: ${uploadError.message}`;
  
  // Clear error after 5 seconds
  setTimeout(() => {
    error.value = '';
  }, 5000);
};

// Handle upload progress updates from FileUploadField
const handleUploadProgress = (progressData) => {
  if (progressData.completed) {
    console.log('All files uploaded successfully:', progressData.files);
  }
};

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  // Clear previous errors
  error.value = '';
  
  // Validate input
  if (!formData.value.company || !formData.value.address) {
    error.value = 'Mohon lengkapi informasi perusahaan/instansi.';
    return;
  }
  
  if (formData.value.persyaratanFiles.length === 0) {
    error.value = 'Mohon pilih dokumen persyaratan terlebih dahulu.';
    return;
  }

  try {
    loading.value = true;
    
    // Step 1: Upload files if not already uploaded
    if (uploadedFiles.value.length === 0 && fileUploadRef.value) {
      try {
        await fileUploadRef.value.uploadFiles();
        // Wait for upload completion - the handleFilesUploaded will be called
        // We need to wait for uploadedFiles to be populated
        
        // Check if upload was successful
        if (uploadedFiles.value.length === 0) {
          error.value = 'Gagal mengupload file. Silakan coba lagi.';
          return;
        }
      } catch (uploadError) {
        error.value = 'Gagal mengupload file. Silakan coba lagi.';
        return;
      }
    }
    
    // Step 2: Submit SLO data with uploaded files
    // Map sloType value to API expected format
    let sloType = formData.value.sloType;
    if (sloType === 'limbah') {
      sloType = 'AIR_LIMBAH';
    } else {
      sloType = sloType.toUpperCase();
    }
    
    const sloData = {
      type: sloType,
      company: formData.value.company,
      address: formData.value.address,
      notes: formData.value.notes || '',
      documents: uploadedFiles.value
    };
    
    // Submit to API
    const response = await $fetch('/api/slo/submit', {
      method: 'POST',
      body: sloData
    });
    
    // Show success and redirect
    successMessage.value = 'Permohonan SLO berhasil diajukan!';
    
    // Redirect to SLO dashboard with success message after 2 seconds
    setTimeout(() => {
      router.push({
        path: '/slo',
        query: { 
          success: 'true', 
          message: 'Permohonan SLO berhasil diajukan!' 
        }
      });
    }, 2000);
    
  } catch (e) {
    console.error('Submit error:', e);
    error.value = 'Terjadi kesalahan saat mengirim permohonan. Silakan coba lagi.';
  } finally {
    loading.value = false;
  }
};
</script>
