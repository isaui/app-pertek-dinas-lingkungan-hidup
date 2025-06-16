<template>
    <div class="space-y-6">
      <!-- Header dengan Status Check -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-slate-900 mb-2">Upload Dokumen Revisi</h3>
        <p class="text-sm text-slate-500 mb-4">
          Upload dokumen revisi berdasarkan hasil verifikasi lapangan
        </p>
  
        <!-- Status Check -->
        <div v-if="!canUploadRevision" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 class="text-sm font-medium text-yellow-800">Upload Revisi Belum Tersedia</h4>
              <p class="text-xs text-yellow-700 mt-1">{{ getStatusMessage() }}</p>
            </div>
          </div>
        </div>
  
        <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center">
            <svg class="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 class="text-sm font-medium text-green-800">Siap Upload Revisi</h4>
              <p class="text-xs text-green-700 mt-1">Verifikasi lapangan telah selesai. Anda dapat mengupload dokumen revisi.</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Existing Revisions -->
      <div v-if="existingRevisions.length > 0" class="bg-white border border-slate-200 rounded-lg">
        <div class="px-6 py-4 border-b border-slate-200">
          <h4 class="text-md font-medium text-slate-900">Dokumen Revisi yang Sudah Ada</h4>
          <p class="text-sm text-slate-500 mt-1">{{ existingRevisions.length }} dokumen revisi</p>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <div v-for="doc in existingRevisions" :key="doc.id" 
                 :class="[
                   'flex items-center justify-between p-4 rounded-lg border',
                   doc.expired 
                     ? 'bg-red-50 border-red-200' 
                     : 'bg-slate-50 border-slate-200'
                 ]">
              <div class="flex items-center space-x-4">
                <div :class="[
                  'p-2 rounded-lg',
                  doc.expired 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-indigo-100 text-indigo-600'
                ]">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <span :class="[
                      'text-sm font-medium',
                      doc.expired ? 'text-red-900' : 'text-slate-900'
                    ]">
                      {{ doc.filename }}
                    </span>
                    <span v-if="doc.expired" class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      Kedaluwarsa
                    </span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">
                    {{ formatFileSize(doc.size || 0) }} • {{ formatDateTime(doc.uploadedAt) }}
                  </div>
                </div>
              </div>
              <button @click="downloadDocument(doc)"
                      class="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Upload Form -->
      <div v-if="canUploadRevision" class="bg-white border border-slate-200 rounded-lg">
        <div class="px-6 py-4 border-b border-slate-200">
          <h4 class="text-md font-medium text-slate-900">Upload Dokumen Revisi Baru</h4>
          <p class="text-sm text-slate-500 mt-1">Upload dokumen yang telah direvisi berdasarkan hasil verifikasi lapangan</p>
        </div>
        
        <div class="p-6">
          <!-- Instructions -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h5 class="text-sm font-medium text-blue-900 mb-2">Panduan Upload Revisi:</h5>
            <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Pastikan dokumen sudah diperbaiki sesuai hasil verifikasi lapangan</li>
              <li>Format file yang didukung: PDF, DOC, DOCX, RAR, ZIP</li>
              <li>Ukuran maksimal per file: 10MB</li>
              <li>Berikan nama file yang jelas dan deskriptif</li>
              <li>Dokumen lama akan ditandai sebagai kedaluwarsa jika Anda memilih "Ganti Semua"</li>
            </ul>
          </div>
  
          <!-- Upload Options -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-700 mb-3">Mode Upload</label>
            <div class="space-y-3">
              <label class="flex items-center">
                <input type="radio" v-model="uploadMode" value="add" 
                       class="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500">
                <span class="ml-3 text-sm text-slate-700">
                  <span class="font-medium">Tambah Dokumen</span> - Dokumen baru akan ditambahkan ke yang sudah ada
                </span>
              </label>
              <label class="flex items-center">
                <input type="radio" v-model="uploadMode" value="replace" 
                       class="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500">
                <span class="ml-3 text-sm text-slate-700">
                  <span class="font-medium">Ganti Semua</span> - Dokumen lama akan ditandai kedaluwarsa
                </span>
              </label>
            </div>
          </div>
  
          <!-- File Upload -->
          <FileUploadField
            ref="fileUploadRef"
            id="revision-documents"
            label="Pilih Dokumen Revisi"
            description="Upload dokumen yang telah direvisi berdasarkan hasil verifikasi lapangan."
            :requirements="[
              'Dokumen hasil perbaikan dari verifikasi lapangan',
              'Dokumen teknis yang telah disesuaikan',
              'Laporan monitoring yang diperbaiki',
              'Dokumen pendukung lainnya'
            ]"
            requirements-title="Dokumen yang dapat diupload:"
            accepted-formats="PDF, DOC, DOCX, RAR, ZIP"
            accept=".pdf,.doc,.docx,.rar,.zip"
            v-model="selectedFiles"
            @uploaded="handleFilesUploaded"
            @upload-error="handleUploadError"
            @upload-progress="handleUploadProgress"
          />
  
          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <button @click="$emit('switch-tab', 'overview')"
                    class="px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 bg-white hover:bg-slate-50">
              Batal
            </button>
            <button @click="submitRevision"
                    :disabled="!canSubmit || isSubmitting"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="isSubmitting">
                <svg class="animate-spin inline-block w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengupload...
              </span>
              <span v-else>Upload Revisi</span>
            </button>
          </div>
        </div>
      </div>
  
      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="text-sm font-medium text-green-800">Upload Berhasil</h4>
            <p class="text-xs text-green-700 mt-1">{{ successMessage }}</p>
          </div>
        </div>
      </div>
  
      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-center">
          <svg class="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 class="text-sm font-medium text-red-800">Upload Gagal</h4>
            <p class="text-xs text-red-700 mt-1">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import FileUploadField from '~/components/common/FileUploadField.vue'
  
  const props = defineProps({
    sloId: {
      type: String,
      required: true
    },
    sloStatus: {
      type: String,
      required: true
    },
    existingRevisions: {
      type: Array,
      default: () => []
    }
  })
  
  const emit = defineEmits(['revision-uploaded', 'switch-tab'])
  
  // State
  const selectedFiles = ref([])
  const uploadedFiles = ref([])
  const uploadMode = ref('add')
  const isSubmitting = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')
  const fileUploadRef = ref(null)
  
  // Computed
  const canUploadRevision = computed(() => {
    return ['FIELD_VERIFICATION_COMPLETED', 'REVISION_REJECTED'].includes(props.sloStatus)
  })
  
  const canSubmit = computed(() => {
    return selectedFiles.value.length > 0 || uploadedFiles.value.length > 0
  })
  
  // Methods
  const getStatusMessage = () => {
    const messages = {
      'SUBMITTED': 'SLO masih dalam tahap pengajuan awal',
      'VERIFICATION': 'SLO sedang dalam proses verifikasi dokumen',
      'INCOMPLETE_REQUIREMENTS': 'Persyaratan perlu dilengkapi terlebih dahulu',
      'COMPLETE_REQUIREMENTS': 'Menunggu jadwal verifikasi lapangan',
      'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi lapangan telah dijadwalkan, menunggu pelaksanaan',
      'REVISION_SUBMITTED': 'Revisi sudah disubmit, menunggu review',
      'REVISION_REVIEW': 'Revisi sedang direview oleh admin',
      'REVISION_APPROVED': 'Revisi sudah disetujui',
      'SLO_ISSUED': 'SLO sudah diterbitkan',
      'REJECTED': 'SLO ditolak'
    }
    
    return messages[props.sloStatus] || 'Status tidak dikenal'
  }
  
  const handleFilesUploaded = (files) => {
    uploadedFiles.value = files
    clearMessages()
  }
  
  const handleUploadError = (error) => {
    errorMessage.value = `Error upload: ${error.message}`
    successMessage.value = ''
  }
  
  const handleUploadProgress = (progress) => {
    // Handle upload progress if needed
    console.log('Upload progress:', progress)
  }
  
  const submitRevision = async () => {
    try {
      isSubmitting.value = true
      clearMessages()
      
      // Upload files if not already uploaded
      if (uploadedFiles.value.length === 0 && fileUploadRef.value) {
        await fileUploadRef.value.uploadFiles()
      }
      
      if (uploadedFiles.value.length === 0) {
        throw new Error('Tidak ada file yang berhasil diupload')
      }
      
      // Submit revision
      const response = await $fetch(`/api/slo/detail/${props.sloId}/revision`, {
        method: 'POST',
        body: {
          documents: uploadedFiles.value,
          replaceExisting: uploadMode.value === 'replace'
        }
      })
      
      if (response.success) {
        successMessage.value = response.message
        emit('revision-uploaded', uploadedFiles.value)
        
        // Reset form
        selectedFiles.value = []
        uploadedFiles.value = []
        uploadMode.value = 'add'
        
        // Reset file input
        if (fileUploadRef.value) {
          // Assuming the FileUploadField has a reset method
        }
      }
      
    } catch (error) {
      console.error('Error submitting revision:', error)
      errorMessage.value = error.message || 'Terjadi kesalahan saat mengupload revisi'
    } finally {
      isSubmitting.value = false
    }
  }
  
  const downloadDocument = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }
  
  const clearMessages = () => {
    successMessage.value = ''
    errorMessage.value = ''
  }
  
  // Helper functions
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date)
  }
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
  </script>