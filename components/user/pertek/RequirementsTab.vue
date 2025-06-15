<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-slate-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ isEditMode ? 'Perbaiki Dokumen Persyaratan' : 'Upload Dokumen Persyaratan Tambahan' }}
        </h3>
        <p class="mt-1 text-sm text-slate-500">
          {{ getHeaderDescription() }}
        </p>
        
        <!-- Status Info -->
        <div class="mt-4 flex items-center space-x-4">
          <StatusBadge :status="pertekStatus" />
          <span class="text-sm text-slate-600">
            {{ getStatusMessage() }}
          </span>
        </div>
      </div>
  
      <!-- Feedback Context (if available) -->
      <div v-if="activeFeedback.length > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 class="text-md font-medium text-amber-900 mb-3 flex items-center">
          <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-3.154 1.578a.5.5 0 01-.723-.445l.157-2.512A8 8 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          Feedback yang Perlu Ditindaklanjuti
        </h4>
        
        <div class="space-y-3">
          <div 
            v-for="feedback in activeFeedback.slice(0, 3)" 
            :key="feedback.id"
            class="bg-white border border-amber-200 rounded-lg p-3"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h5 class="text-sm font-medium text-slate-900">{{ getRequirementTypeLabel(feedback.requirementType) }}</h5>
                <p class="text-sm text-amber-800 mt-1">{{ feedback.feedbackText }}</p>
                <p class="text-xs text-slate-500 mt-2">{{ formatRelativeTime(feedback.createdAt) }}</p>
              </div>
            </div>
          </div>
          
          <div v-if="activeFeedback.length > 3" class="text-center">
            <button 
              @click="$emit('switch-tab', 'feedback')"
              class="text-sm text-amber-700 hover:text-amber-800 font-medium"
            >
              Lihat {{ activeFeedback.length - 3 }} feedback lainnya →
            </button>
          </div>
        </div>
      </div>
  
      <!-- Action Mode Selector -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h4 class="text-md font-medium text-slate-900 mb-4">Pilih Tindakan</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Upload Additional Requirements -->
          <div 
            :class="[
              'border-2 rounded-lg p-4 cursor-pointer transition-all',
              !isEditMode 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-slate-200 hover:border-slate-300'
            ]"
            @click="setMode(false)"
          >
            <div class="flex items-center">
              <input
                type="radio"
                name="requirementMode"
                :checked="!isEditMode"
                class="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                @change="setMode(false)"
              />
              <div class="ml-3">
                <div class="text-sm font-medium text-slate-900">Upload Dokumen Tambahan</div>
                <div class="text-xs text-slate-500 mt-1">
                  Tambahkan dokumen persyaratan yang masih kurang
                </div>
              </div>
            </div>
          </div>
  
          <!-- Replace Existing Requirements -->
          <div 
            :class="[
              'border-2 rounded-lg p-4 cursor-pointer transition-all',
              isEditMode 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-slate-200 hover:border-slate-300',
              !hasExistingRequirements ? 'opacity-50 cursor-not-allowed' : ''
            ]"
            @click="hasExistingRequirements && setMode(true)"
          >
            <div class="flex items-center">
              <input
                type="radio"
                name="requirementMode"
                :checked="isEditMode"
                :disabled="!hasExistingRequirements"
                class="h-4 w-4 text-amber-600 border-slate-300 focus:ring-amber-500"
                @change="setMode(true)"
              />
              <div class="ml-3">
                <div class="text-sm font-medium text-slate-900">
                  Perbaiki Dokumen yang Ada
                  <span v-if="!hasExistingRequirements" class="text-slate-400">(Tidak Tersedia)</span>
                </div>
                <div class="text-xs text-slate-500 mt-1">
                  Ganti dokumen persyaratan yang sudah ada sebelumnya
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Existing Requirements Info (Edit Mode) -->
      <div v-if="isEditMode && hasExistingRequirements" class="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 class="text-md font-medium text-amber-900 mb-3 flex items-center">
          <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Peringatan: Dokumen Lama Akan Diganti
        </h4>
        
        <div class="space-y-3">
          <div class="bg-white border border-amber-200 rounded-lg p-4">
            <h5 class="text-sm font-medium text-slate-900 mb-3">Dokumen Persyaratan Saat Ini:</h5>
            <div class="space-y-2">
              <div
                v-for="doc in existingRequirements"
                :key="doc.id"
                class="flex items-center justify-between p-2 bg-slate-50 rounded"
              >
                <div>
                  <div class="text-sm font-medium text-slate-900">{{ doc.filename }}</div>
                  <div class="text-xs text-slate-500">
                    {{ formatDate(doc.uploadedAt || doc.createdAt) }}
                    • {{ formatFileSize(doc.size || 0) }}
                  </div>
                </div>
                <button
                  @click="downloadDocument(doc)"
                  class="text-amber-600 hover:text-amber-800 text-sm font-medium"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
          
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 mr-3 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h5 class="text-sm font-medium text-red-800">Semua dokumen lama akan menjadi kedaluwarsa</h5>
                <p class="text-sm text-red-700 mt-1">
                  Ketika Anda mengupload dokumen persyaratan baru, <strong>SEMUA</strong> dokumen persyaratan 
                  yang lama akan ditandai sebagai <strong>kedaluwarsa (expired)</strong> dan tidak akan berlaku lagi. 
                  Pastikan dokumen baru sudah lengkap dan benar sebelum mengupload.
                </p>
                <div class="mt-2 text-sm text-red-600 font-medium">
                  {{ existingRequirements.length }} dokumen akan menjadi kedaluwarsa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- File Upload Section -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h4 class="text-md font-medium text-slate-900 mb-4">
          {{ isEditMode ? 'Upload Dokumen Persyaratan Baru' : 'Upload Dokumen Persyaratan Tambahan' }}
        </h4>
        
        <!-- Requirements Guide -->
        <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <h5 class="text-sm font-medium text-slate-700 mb-2">Persyaratan/Kelengkapan yang Diperlukan:</h5>
          <ul class="list-disc pl-5 space-y-1 text-sm text-slate-600">
            <li>Surat Permohonan PERTEK (bermaterai dan ditandatangani)</li>
            <li>Dokumen AMDAL/UKL-UPL yang telah disahkan</li>
            <li>Dokumen Standar Teknis atau Dokumen Kajian Teknis</li>
            <li>Dokumen pendukung lainnya sesuai jenis PERTEK</li>
          </ul>
          <div class="mt-3 text-xs text-slate-500">
            <strong>Format file:</strong> PDF, DOC, DOCX, atau arsip (RAR/ZIP) • 
            <strong>Ukuran maksimal:</strong> 10MB per file
          </div>
        </div>
  
        <!-- File Upload Progress -->
        <div v-if="isUploading" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 class="text-sm font-semibold text-blue-900 mb-3">Mengupload Dokumen...</h5>
          
          <!-- Overall Progress -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1">
              <div class="text-xs font-medium text-blue-700">Progress Upload</div>
              <div class="text-xs font-medium text-blue-700">{{ Math.floor(uploadProgress) }}%</div>
            </div>
            <div class="w-full bg-blue-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{width: `${uploadProgress}%`}"></div>
            </div>
          </div>
          
          <div v-if="uploadingFileName" class="text-sm text-blue-800">
            Mengupload: {{ uploadingFileName }}
          </div>
        </div>
  
        <!-- File Input -->
        <div v-if="!isUploading" class="mb-6">
          <label class="block text-sm font-medium text-slate-700 mb-2">
            Pilih Dokumen Persyaratan
          </label>
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,.doc,.docx,.rar,.zip"
            multiple
            class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="handleFileChange"
          />
          <p class="mt-1 text-xs text-slate-500">
            Anda dapat memilih beberapa file sekaligus. Total ukuran tidak boleh melebihi 50MB.
          </p>
        </div>
  
        <!-- Selected Files Preview -->
        <div v-if="selectedFiles.length > 0 && !isUploading" class="mb-6">
          <h5 class="text-sm font-medium text-slate-700 mb-3">File yang Dipilih:</h5>
          <div class="space-y-2">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg"
            >
              <div class="flex items-center space-x-3">
                <div class="bg-blue-100 p-2 rounded">
                  <svg class="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-medium text-slate-900">{{ file.name }}</div>
                  <div class="text-xs text-slate-500">{{ formatFileSize(file.size) }}</div>
                </div>
              </div>
              <button
                @click="removeFile(index)"
                class="text-red-500 hover:text-red-700 p-1"
              >
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Total Size -->
          <div class="mt-3 text-sm text-slate-600">
            Total ukuran: {{ formatFileSize(totalSelectedSize) }}
            <span v-if="totalSelectedSize > maxTotalSize" class="text-red-600 ml-2">
              (Melebihi batas maksimal 50MB)
            </span>
          </div>
        </div>
  
        <!-- Error Messages -->
        <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-red-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h5 class="text-sm font-medium text-red-800">Error</h5>
              <p class="text-sm text-red-700 mt-1">{{ errorMessage }}</p>
            </div>
          </div>
        </div>
  
        <!-- Success Messages -->
        <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex">
            <svg class="h-5 w-5 text-green-400 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h5 class="text-sm font-medium text-green-800">Berhasil</h5>
              <p class="text-sm text-green-700 mt-1">{{ successMessage }}</p>
            </div>
          </div>
        </div>
  
        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('switch-tab', 'feedback')"
            class="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors"
            :disabled="isUploading"
          >
            Lihat Feedback
          </button>
          
          <button
            @click="uploadRequirements"
            :disabled="!canUpload || isUploading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isUploading">Mengupload...</span>
            <span v-else>{{ isEditMode ? 'Perbarui Persyaratan' : 'Upload Persyaratan' }}</span>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  import StatusBadge from '~/components/pertek/StatusBadge.vue';
  
  const props = defineProps({
    pertekId: {
      type: String,
      required: true
    },
    pertekStatus: {
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
  });
  
  const emit = defineEmits(['switch-tab', 'requirements-uploaded']);
  
  // State
  const isEditMode = ref(false);
  const selectedFiles = ref([]);
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const uploadingFileName = ref('');
  const errorMessage = ref('');
  const successMessage = ref('');
  const fileInput = ref(null);
  
  // Constants
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxTotalSize = 50 * 1024 * 1024; // 50MB
  
  // Computed
  const hasExistingRequirements = computed(() => {
    return props.existingRequirements && props.existingRequirements.length > 0;
  });
  
  const canUpload = computed(() => {
    return selectedFiles.value.length > 0 && 
           totalSelectedSize.value <= maxTotalSize &&
           selectedFiles.value.every(file => file.size <= maxFileSize);
  });
  
  const totalSelectedSize = computed(() => {
    return selectedFiles.value.reduce((total, file) => total + file.size, 0);
  });
  
  // Methods
  const setMode = (editMode) => {
    isEditMode.value = editMode;
    clearMessages();
  };
  
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    selectedFiles.value = files;
    clearMessages();
    
    // Validate files
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      errorMessage.value = `File ${oversizedFiles[0].name} terlalu besar. Maksimal 10MB per file.`;
      return;
    }
    
    if (totalSelectedSize.value > maxTotalSize) {
      errorMessage.value = 'Total ukuran file melebihi batas maksimal 50MB.';
      return;
    }
  };
  
  const removeFile = (index) => {
    selectedFiles.value.splice(index, 1);
    clearMessages();
  };
  
  const uploadRequirements = async () => {
    if (!canUpload.value) return;
    
    try {
      isUploading.value = true;
      uploadProgress.value = 0;
      clearMessages();
      
      const uploadedDocuments = [];
      
      // Upload each file
      for (let i = 0; i < selectedFiles.value.length; i++) {
        const file = selectedFiles.value[i];
        uploadingFileName.value = file.name;
        
        const fileUrl = await uploadFileWithProgress(file, (progress) => {
          const baseProgress = (i / selectedFiles.value.length) * 100;
          const fileProgress = (progress / selectedFiles.value.length);
          uploadProgress.value = baseProgress + fileProgress;
        });
        
        uploadedDocuments.push({
          filename: file.name,
          fileUrl: fileUrl,
          size: file.size,
          mimeType: file.type || 'application/octet-stream'
        });
      }
      
      uploadProgress.value = 100;
      
      // Submit requirements to API
      const response = await $fetch(`/api/pertek/detail/${props.pertekId}/requirements`, {
        method: 'POST',
        body: {
          documents: uploadedDocuments,
          replaceExisting: isEditMode.value
        }
      });
      
      if (response.success) {
        successMessage.value = isEditMode.value 
          ? `Dokumen persyaratan berhasil diperbarui. ${props.existingRequirements.length} dokumen lama sudah ditandai kedaluwarsa.`
          : 'Dokumen persyaratan berhasil diupload.';
        
        // Clear form
        selectedFiles.value = [];
        if (fileInput.value) {
          fileInput.value.value = '';
        }
        
        // Emit event
        emit('requirements-uploaded', uploadedDocuments);
        
        // Auto switch to documents tab after delay
        setTimeout(() => {
          emit('switch-tab', 'documents');
        }, 3000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      errorMessage.value = 'Terjadi kesalahan saat mengupload dokumen. Silakan coba lagi.';
    } finally {
      isUploading.value = false;
      uploadingFileName.value = '';
    }
  };
  
  const uploadFileWithProgress = async (file, progressCallback) => {
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    
    try {
      // 1. Initiate multipart upload
      const initiateResponse = await $fetch('/api/upload/multipart/initiate', {
        method: 'POST',
        body: {
          filename: file.name,
          contentType: file.type || 'application/octet-stream'
        }
      });
      
      const { uploadId, key } = initiateResponse;
      
      // 2. Upload parts
      const fileBuffer = await file.arrayBuffer();
      const totalChunks = Math.ceil(fileBuffer.byteLength / chunkSize);
      const parts = [];
      
      for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
        const start = (partNumber - 1) * chunkSize;
        const end = Math.min(partNumber * chunkSize, fileBuffer.byteLength);
        const chunk = fileBuffer.slice(start, end);
        
        const formData = new FormData();
        formData.append('file', new Blob([chunk]));
        
        const partResponse = await $fetch('/api/upload/multipart/upload-part', {
          method: 'POST',
          body: formData,
          query: {
            objectName: key,
            uploadId,
            partNumber
          }
        });
        
        let etag = partResponse.etag;
        if (!etag.startsWith('"') && !etag.endsWith('"')) {
          etag = `"${etag}"`;
        }
        
        parts.push({
          part: partNumber,
          etag: etag
        });
        
        // Update progress
        progressCallback((partNumber / totalChunks) * 100);
      }
      
      // 3. Complete multipart upload
      const completeResponse = await $fetch('/api/upload/multipart/complete', {
        method: 'POST',
        body: {
          objectName: key,
          uploadId,
          parts
        }
      });
      
      return completeResponse.url;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  };
  
  const downloadDocument = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    } else if (document.url) {
      window.open(document.url, '_blank');
    }
  };
  
  const clearMessages = () => {
    errorMessage.value = '';
    successMessage.value = '';
  };
  
  // Helper functions
  const getHeaderDescription = () => {
    if (isEditMode.value) {
      return 'Ganti semua dokumen persyaratan yang ada. Dokumen lama akan menjadi kedaluwarsa.';
    }
    return 'Tambahkan dokumen persyaratan yang masih kurang berdasarkan feedback admin.';
  };
  
  const getStatusMessage = () => {
    const messages = {
      'INCOMPLETE_REQUIREMENTS': 'Persyaratan tidak lengkap, silakan perbaiki berdasarkan feedback admin.',
      'REJECTED': 'Permohonan ditolak, Anda dapat mencoba memperbaiki dokumen persyaratan.',
      'VERIFICATION': 'Dokumen sedang diverifikasi, Anda masih dapat menambah dokumen jika diperlukan.'
    };
    return messages[props.pertekStatus] || 'Status saat ini tidak memungkinkan update persyaratan.';
  };
  
  const getRequirementTypeLabel = (type) => {
    const labels = {
      'SURAT_PERMOHONAN': 'Surat Permohonan',
      'DOKUMEN_AMDAL_UKL_UPL': 'AMDAL/UKL-UPL',
      'DOKUMEN_TEKNIS': 'Dokumen Teknis',
      'OTHER': 'Lainnya'
    };
    return labels[type] || type;
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
  
    if (diffInMinutes < 1) {
      return 'baru saja';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} menit lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam lalu`;
    } else if (diffInDays === 1) {
      return 'kemarin';
    } else if (diffInDays < 7) {
      return `${diffInDays} hari lalu`;
    } else {
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date);
    }
  };
  
  // Watch for mode changes
  watch(isEditMode, () => {
    clearMessages();
  });
  </script>