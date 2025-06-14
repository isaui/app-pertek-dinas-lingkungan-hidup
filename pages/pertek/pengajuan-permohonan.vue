<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    
    <div class="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800">Pengajuan PERTEK</h1>
        <p class="mt-2 text-slate-600">Silakan lengkapi formulir pengajuan Persetujuan Teknis (PERTEK) di bawah ini.</p>
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
          <!-- PERTEK Type Selector -->
          <PertekTypeSelector v-model="formData.pertekType" />
          
          <!-- File Upload Fields -->
          <FileUploadField
            ref="fileUploadRef"
            id="persyaratan"
            label="Upload Persyaratan/Kelengkapan"
            description="Silakan unggah dokumen persyaratan PERTEK sesuai dengan ketentuan di bawah ini."
            :requirements="[
              'Surat Permohonan PERTEK',
              'Dokumen AMDAL/UKL-UPL',
              'Dokumen Standar Teknis atau Dokumen Kajian Teknis'
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
          <SubmitButton 
            :loading="loading" 
            :disabled="!canSubmit"
            @click="handleSubmit"
          />
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
import PertekTypeSelector from '~/components/pertek/PertekTypeSelector.vue';
import FileUploadField from '~/components/pertek/FileUploadField.vue';
import SubmitButton from '~/components/pertek/SubmitButton.vue';

// SEO metadata
useHead({
  title: 'Ajukan Permohonan PERTEK | DLH Kabupaten Grobogan',
  meta: [
    { name: 'description', content: 'Form pengajuan Persetujuan Teknis (PERTEK) pembuangan emisi dan air limbah di Dinas Lingkungan Hidup Kabupaten Grobogan.' },
    { name: 'keywords', content: 'pertek, pembuangan emisi, air limbah, dinas lingkungan hidup, grobogan, persetujuan teknis, formulir' }
  ]
});

const router = useRouter();
const loading = ref(false);
const error = ref('');
const successMessage = ref('');
const fileUploadRef = ref(null);
const uploadedFiles = ref([]);

const formData = ref({
  pertekType: 'emisi',
  company: '',
  address: '',
  persyaratanFiles: [],
  notes: ''
});

// Check if form can be submitted
const canSubmit = computed(() => {
  return formData.value.company && 
         formData.value.address && 
         formData.value.persyaratanFiles.length > 0; // Check selected files, not uploaded files
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
    
    // Step 2: Submit PERTEK data with uploaded files
    // Map pertekType value to API expected format
    let pertekType = formData.value.pertekType;
    if (pertekType === 'limbah') {
      pertekType = 'AIR_LIMBAH';
    } else {
      pertekType = pertekType.toUpperCase();
    }
    
    const pertekData = {
      type: pertekType,
      company: formData.value.company,
      address: formData.value.address,
      notes: formData.value.notes || '',
      documents: uploadedFiles.value
    };
    
    // Submit to API
    const response = await $fetch('/api/pertek/submit', {
      method: 'POST',
      body: pertekData
    });
    
    // Show success and redirect
    successMessage.value = 'Permohonan PERTEK berhasil diajukan!';
    
    // Redirect to PERTEK dashboard with success message after 2 seconds
    setTimeout(() => {
      router.push({
        path: '/pertek',
        query: { 
          success: 'true', 
          message: 'Permohonan PERTEK berhasil diajukan!' 
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