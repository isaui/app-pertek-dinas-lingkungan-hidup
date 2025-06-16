<template>
    <div class="space-y-6">
      <!-- Header Info -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-slate-900 mb-2">Update Dokumen Persyaratan</h3>
        <p class="text-sm text-slate-600 mb-4">
          Lengkapi atau perbarui dokumen persyaratan SLO sesuai dengan feedback yang diberikan.
        </p>
        
        <!-- Status indicator -->
        <div class="flex items-center space-x-2">
          <SLOStatusBadge :status="sloStatus" />
          <span class="text-sm text-slate-500">Status saat ini</span>
        </div>
      </div>
  
      <!-- Active Feedback Display -->
      <div v-if="activeFeedback.length > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 class="text-lg font-medium text-amber-900 mb-3 flex items-center">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Feedback yang Perlu Ditindaklanjuti
        </h4>
        <div class="space-y-3">
          <div v-for="feedback in activeFeedback" :key="feedback.id" 
               class="bg-white border border-amber-200 rounded-lg p-4">
            <div class="flex items-start justify-between mb-2">
              <span :class="getRequirementTypeClass(feedback.requirementType)" 
                    class="px-2 py-1 text-xs font-medium rounded-full">
                {{ getRequirementTypeLabel(feedback.requirementType) }}
              </span>
              <span class="text-xs text-slate-500">{{ formatDate(feedback.createdAt) }}</span>
            </div>
            <p class="text-sm text-slate-700 mb-2">{{ feedback.feedbackText }}</p>
            <div v-if="feedback.document" class="text-xs text-slate-500">
              Terkait dokumen: <span class="font-medium">{{ feedback.document.filename }}</span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Existing Requirements Display -->
      <div v-if="existingRequirements.length > 0" class="bg-white border border-slate-200 rounded-lg p-6">
        <h4 class="text-lg font-medium text-slate-900 mb-4">Dokumen Persyaratan Saat Ini</h4>
        <div class="space-y-3">
          <div v-for="doc in existingRequirements" :key="doc.id" 
               :class="[
                 'flex items-center justify-between p-3 rounded-lg border',
                 doc.expired ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
               ]">
            <div class="flex items-center space-x-3">
              <div :class="[
                'p-2 rounded-lg',
                doc.expired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
              ]">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div :class="[
                  'text-sm font-medium',
                  doc.expired ? 'text-red-900' : 'text-slate-900'
                ]">
                  {{ doc.filename }}
                </div>
                <div :class="[
                  'text-xs',
                  doc.expired ? 'text-red-600' : 'text-slate-500'
                ]">
                  {{ formatFileSize(doc.size) }} • {{ formatDate(doc.uploadedAt) }}
                  <span v-if="doc.expired" class="ml-2 font-medium">(Kedaluwarsa)</span>
                </div>
              </div>
            </div>
            <button @click="downloadDocument(doc)" 
                    :class="[
                      'px-3 py-1 rounded text-xs font-medium',
                      doc.expired 
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    ]">
              Download
            </button>
          </div>
        </div>
      </div>
  
      <!-- Upload Form -->
      <div v-if="canUpdateRequirements" class="bg-white border border-slate-200 rounded-lg p-6">
        <h4 class="text-lg font-medium text-slate-900 mb-4">Upload Dokumen Persyaratan Baru</h4>
        
        <!-- Requirements List -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h5 class="font-medium text-blue-900 mb-3">Persyaratan yang Diperlukan:</h5>
          <ul class="list-disc list-inside space-y-1 text-sm text-blue-800">
            <li>Dokumen Perizinan Berusaha (NIB atau yang setara)</li>
            <li>Persetujuan Lingkungan (AMDAL/UKL-UPL/SPPL)</li>
            <li>Persetujuan Teknis (PERTEK) yang masih berlaku</li>
            <li>Hasil Pemantauan Emisi dari Laboratorium Terakreditasi</li>
            <li>Sertifikat Registrasi Laboratorium Penguji</li>
            <li>Dokumen teknis lainnya yang relevan</li>
          </ul>
          <p class="text-xs text-blue-600 mt-3">
            *Format yang diterima: PDF, DOC, DOCX, RAR, ZIP (maksimum 50MB per file)
          </p>
        </div>
  
        <!-- File Upload -->
        <FileUploadField
          ref="fileUploadRef"
          id="requirements-upload"
          label="Pilih Dokumen Persyaratan"
          description="Upload semua dokumen persyaratan yang diperlukan untuk SLO."
          accept=".pdf,.doc,.docx,.rar,.zip"
          :multiple="true"
          v-model="selectedFiles"
          @uploaded="handleFilesUploaded"
          @upload-error="handleUploadError"
        />
  
        <!-- Upload Options -->
        <div class="mt-6">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="replaceExisting"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
            <span class="ml-2 text-sm text-slate-700">
              Ganti semua dokumen persyaratan yang ada
              <span class="text-slate-500">(dokumen lama akan ditandai sebagai kedaluwarsa)</span>
            </span>
          </label>
        </div>
  
        <!-- Submit Button -->
        <div class="mt-6 flex justify-end space-x-3">
          <button @click="$emit('switch-tab', 'overview')"
                  class="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
            Batal
          </button>
          <button @click="submitRequirements"
                  :disabled="!canSubmit || isSubmitting"
                  :class="[
                    'px-4 py-2 rounded-md text-sm font-medium',
                    canSubmit && !isSubmitting
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  ]">
            <span v-if="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mengupload...
            </span>
            <span v-else>Upload Persyaratan</span>
          </button>
        </div>
      </div>
  
      <!-- Status Not Allowed -->
      <div v-else class="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
        </svg>
        <h3 class="text-lg font-medium text-slate-900 mb-2">Tidak Dapat Mengupload Persyaratan</h3>
        <p class="text-sm text-slate-600">
          Upload dokumen persyaratan hanya dapat dilakukan ketika status SLO adalah 
          "Persyaratan Tidak Lengkap" atau "Ditolak".
        </p>
        <p class="text-sm text-slate-500 mt-2">
          Status saat ini: <span class="font-medium">{{ getStatusLabel(sloStatus) }}</span>
        </p>
      </div>
  
      <!-- Success Message -->
      <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
      </div>
  
      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg class="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-700">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import SLOStatusBadge from '~/components/slo/StatusBadge.vue'
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
    existingRequirements: {
      type: Array,
      default: () => []
    },
    activeFeedback: {
      type: Array,
      default: () => []
    }
  })
  
  const emit = defineEmits(['switch-tab', 'requirements-uploaded'])
  
  // State
  const selectedFiles = ref([])
  const uploadedFiles = ref([])
  const replaceExisting = ref(false)
  const isSubmitting = ref(false)
  const successMessage = ref('')
  const errorMessage = ref('')
  const fileUploadRef = ref(null)
  
  // Computed
  const canUpdateRequirements = computed(() => {
    return ['INCOMPLETE_REQUIREMENTS', 'REJECTED', 'VERIFICATION'].includes(props.sloStatus)
  })
  
  const canSubmit = computed(() => {
    return selectedFiles.value.length > 0 || uploadedFiles.value.length > 0
  })
  
  // Methods
  const handleFilesUploaded = (files) => {
    uploadedFiles.value = files
    successMessage.value = `${files.length} file berhasil diupload dan siap untuk disubmit.`
    errorMessage.value = ''
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
  
  const handleUploadError = (error) => {
    errorMessage.value = `Error saat mengupload file: ${error.message}`
    successMessage.value = ''
    
    // Clear error after 5 seconds
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  }
  
  const submitRequirements = async () => {
    try {
      isSubmitting.value = true
      errorMessage.value = ''
      successMessage.value = ''
      
      // Upload files if not already uploaded
      if (uploadedFiles.value.length === 0 && fileUploadRef.value) {
        try {
          await fileUploadRef.value.uploadFiles()
          // Wait for upload completion
          if (uploadedFiles.value.length === 0) {
            throw new Error('Gagal mengupload file. Silakan coba lagi.')
          }
        } catch (uploadError) {
          throw new Error('Gagal mengupload file. Silakan coba lagi.')
        }
      }
      
      if (uploadedFiles.value.length === 0) {
        throw new Error('Tidak ada file yang berhasil diupload.')
      }
      
      // Submit requirements
      const response = await $fetch(`/api/slo/detail/${props.sloId}/requirements`, {
        method: 'POST',
        body: {
          documents: uploadedFiles.value,
          replaceExisting: replaceExisting.value
        }
      })
      
      if (response.success) {
        successMessage.value = response.message
        emit('requirements-uploaded', response.data)
        
        // Clear form
        selectedFiles.value = []
        uploadedFiles.value = []
        replaceExisting.value = false
        
        // Switch to overview tab after successful upload
        setTimeout(() => {
          emit('switch-tab', 'overview')
        }, 2000)
      } else {
        throw new Error(response.message || 'Gagal mengupload persyaratan')
      }
      
    } catch (error) {
      console.error('Error submitting requirements:', error)
      errorMessage.value = error.message || 'Terjadi kesalahan saat mengupload persyaratan'
    } finally {
      isSubmitting.value = false
    }
  }
  
  const downloadDocument = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }
  
  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(date)
  }
  
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
  
  const getStatusLabel = (status) => {
    const labels = {
      'SUBMITTED': 'Diajukan',
      'VERIFICATION': 'Verifikasi',
      'INCOMPLETE_REQUIREMENTS': 'Persyaratan Tidak Lengkap',
      'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
      'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi Lapangan Dijadwalkan',
      'FIELD_VERIFICATION_COMPLETED': 'Verifikasi Lapangan Selesai',
      'REVISION_SUBMITTED': 'Revisi Diajukan',
      'REVISION_REVIEW': 'Review Revisi',
      'REVISION_REJECTED': 'Revisi Ditolak',
      'REVISION_APPROVED': 'Revisi Disetujui',
      'SLO_ISSUED': 'SLO Diterbitkan',
      'REJECTED': 'Ditolak'
    }
    return labels[status] || status
  }
  
  const getRequirementTypeLabel = (type) => {
    const types = {
      'DOK_PERIZINAN_BERUSAHA': 'Dokumen Perizinan Berusaha',
      'PERSETUJUAN_LINGKUNGAN': 'Persetujuan Lingkungan',
      'PERSETUJUAN_TEKNIS': 'Persetujuan Teknis',
      'HASIL_PEMANTAUAN_EMISI': 'Hasil Pemantauan Emisi',
      'SERTIFIKAT_REGISTRASI_LAB': 'Sertifikat Registrasi Laboratorium',
      'DOKUMEN_REVISI': 'Dokumen Revisi',
      'OTHER': 'Lainnya'
    }
    return types[type] || type
  }
  
  const getRequirementTypeClass = (type) => {
    const classes = {
      'DOK_PERIZINAN_BERUSAHA': 'bg-blue-100 text-blue-800',
      'PERSETUJUAN_LINGKUNGAN': 'bg-green-100 text-green-800',
      'PERSETUJUAN_TEKNIS': 'bg-purple-100 text-purple-800',
      'HASIL_PEMANTAUAN_EMISI': 'bg-yellow-100 text-yellow-800',
      'SERTIFIKAT_REGISTRASI_LAB': 'bg-indigo-100 text-indigo-800',
      'DOKUMEN_REVISI': 'bg-orange-100 text-orange-800',
      'OTHER': 'bg-slate-100 text-slate-800'
    }
    return classes[type] || 'bg-slate-100 text-slate-800'
  }
  </script>