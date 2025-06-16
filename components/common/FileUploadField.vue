<template>
  <div class="mb-6">
    <div class="bg-white rounded-lg shadow-sm p-5 border border-slate-200">
      <label :for="id" class="block text-sm font-medium text-slate-700 mb-2">{{ label }}</label>
      
      <div v-if="description" class="mb-3">
        <p class="text-sm text-slate-500">{{ description }}</p>
      </div>
      
      <div v-if="requirements && requirements.length > 0" class="bg-slate-50 p-4 rounded-md mb-4">
        <h4 class="font-medium text-slate-700 mb-2">{{ requirementsTitle || 'Persyaratan/kelengkapan:' }}</h4>
        <ul class="list-disc pl-5 space-y-1 text-slate-700">
          <li v-for="(item, index) in requirements" :key="index">{{ item }}</li>
        </ul>
        <p v-if="acceptedFormats" class="text-xs text-slate-500 mt-2">*Format {{ acceptedFormats }}</p>
      </div>
      
      <!-- Upload Progress Bar -->
      <div v-if="isUploading" class="mb-4 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <div class="p-4">
          <h4 class="text-sm font-semibold text-slate-900 mb-3">Mengupload File...</h4>
          
          <!-- Overall progress -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-1">
              <div class="text-xs font-medium text-slate-700">Total Progress</div>
              <div class="text-xs font-medium text-slate-700">{{ Math.floor(overallProgress) }}%</div>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{width: `${overallProgress}%`}"></div>
            </div>
          </div>
          
          <!-- Individual file progress -->
          <div v-for="(progress, fileId) in uploadProgress" :key="fileId" class="mb-2 last:mb-0">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center">
                <span class="text-xs font-medium text-slate-700 truncate max-w-xs">{{ progress.fileName }}</span>
                <span v-if="progress.status === 'error'" class="ml-2 text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">Error</span>
                <span v-if="progress.status === 'complete'" class="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Done</span>
              </div>
              <div class="flex items-center space-x-2">
                <!-- Retry button -->
                <button 
                  v-if="progress.status === 'error'" 
                  @click="retryUpload(fileId)"
                  type="button"
                  class="text-xs text-blue-600 hover:text-blue-800"
                >
                  Retry
                </button>
                
                <!-- Cancel button -->
                <button 
                  v-if="progress.status === 'uploading' || progress.status === 'initiating'"
                  @click="cancelUpload(fileId)"
                  type="button"
                  class="text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                
                <div class="text-xs font-medium text-slate-700">{{ Math.floor(progress.progress) }}%</div>
              </div>
            </div>
            <div class="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                class="h-1.5 rounded-full transition-all duration-300" 
                :class="{
                  'bg-blue-600': progress.status === 'uploading' || progress.status === 'initiating',
                  'bg-green-600': progress.status === 'complete',
                  'bg-red-600': progress.status === 'error'
                }"
                :style="{width: `${progress.progress}%`}"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex items-center">
        <input
          :id="id"
          ref="fileInput"
          type="file"
          :accept="accept"
          class="hidden"
          :multiple="multiple"
          @change="handleFileChange"
          :disabled="isUploading"
        />
        <label
          :for="id"
          class="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition flex items-center justify-center"
          :class="{ 'opacity-50 cursor-not-allowed': isUploading }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {{ isUploading ? 'Uploading...' : (buttonText || 'Pilih file...') }}
        </label>
      </div>
      
      <div v-if="files && files.length > 0" class="mt-4">
        <p class="text-sm font-medium text-slate-700 mb-2">File yang dipilih:</p>
        <ul class="space-y-2">
          <li v-for="(file, index) in files" :key="index" class="text-sm text-slate-600 bg-slate-50 p-2 rounded flex items-center justify-between">
            <span class="truncate">{{ file.name }}</span>
            <button 
              @click="removeFile(index)" 
              type="button" 
              class="text-slate-500 hover:text-slate-700"
              :disabled="isUploading"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </li>
        </ul>
      </div>

      <!-- Uploaded files display -->
      <div v-if="uploadedFiles && uploadedFiles.length > 0" class="mt-4">
        <p class="text-sm font-medium text-slate-700 mb-2">File berhasil diupload:</p>
        <ul class="space-y-2">
          <li v-for="(file, index) in uploadedFiles" :key="index" class="text-sm text-slate-600 bg-green-50 p-2 rounded flex items-center justify-between">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="truncate">{{ file.filename }}</span>
            </div>
            <span class="text-xs text-green-600">{{ formatFileSize(file.size) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  requirements: {
    type: Array,
    default: () => []
  },
  requirementsTitle: {
    type: String,
    default: ''
  },
  acceptedFormats: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: '.pdf,.doc,.docx,.rar'
  },
  buttonText: {
    type: String,
    default: 'Pilih file...'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  modelValue: {
    type: Array,
    default: () => []
  },
  autoUpload: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'uploaded', 'upload-error', 'upload-progress']);

const fileInput = ref(null);
const files = ref([]);
const uploadedFiles = ref([]);

// Upload state tracking
const uploadProgress = ref({});
const isUploading = ref(false);
const cancelTokens = ref({});

// Track overall upload progress
const overallProgress = computed(() => {
  if (Object.keys(uploadProgress.value).length === 0) return 0;
  
  const totalProgress = Object.values(uploadProgress.value).reduce(
    (total, file) => total + (file.progress || 0), 0
  );
  
  return totalProgress / Object.keys(uploadProgress.value).length;
});

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && Array.isArray(newValue)) {
    files.value = newValue;
  }
}, { deep: true });

// Emit changes when files change
watch(files, (newFiles) => {
  emit('update:modelValue', newFiles);
}, { deep: true });

// Emit uploaded files
watch(uploadedFiles, (newUploadedFiles) => {
  emit('uploaded', newUploadedFiles);
}, { deep: true });

// Handle file selection
const handleFileChange = async (event) => {
  if (event.target.files && event.target.files.length > 0) {
    const newFiles = Array.from(event.target.files);
    
    if (props.multiple) {
      files.value = [...files.value, ...newFiles];
    } else {
      files.value = newFiles;
    }
    
    // Reset input to allow selecting the same file again
    if (fileInput.value) {
      fileInput.value.value = '';
    }

    // Only auto upload if explicitly enabled
    if (props.autoUpload) {
      await uploadFiles(newFiles);
    }
  }
};

// Remove a file
const removeFile = (index) => {
  files.value = files.value.filter((_, i) => i !== index);
};

// Upload files manually
const uploadFiles = async (filesToUpload = null) => {
  const targetFiles = filesToUpload || files.value;
  if (targetFiles.length === 0) return;

  try {
    isUploading.value = true;
    uploadProgress.value = {};
    
    for (const file of targetFiles) {
      await handleMultipartUpload(file);
    }
    
    emit('upload-progress', { completed: true, files: uploadedFiles.value });
  } catch (error) {
    emit('upload-error', error);
  } finally {
    isUploading.value = false;
  }
};

/**
 * Retry uploading a specific file
 */
const retryUpload = async (fileId) => {
  const fileName = uploadProgress.value[fileId].fileName;
  const fileToRetry = files.value.find(f => f.name === fileName);
  
  if (fileToRetry) {
    // Reset progress status
    uploadProgress.value[fileId].status = 'initiating';
    uploadProgress.value[fileId].progress = 0;
    
    try {
      await handleMultipartUpload(fileToRetry, fileId);
    } catch (error) {
      console.error('Retry failed:', error);
      emit('upload-error', error);
    }
  }
};

/**
 * Cancel an in-progress upload
 */
const cancelUpload = async (fileId) => {
  // Abort upload if there's an AbortController
  if (cancelTokens.value[fileId]) {
    cancelTokens.value[fileId].abort();
    delete cancelTokens.value[fileId];
  }
  
  // Update status
  if (uploadProgress.value[fileId]) {
    uploadProgress.value[fileId].status = 'cancelled';
  }
};

/**
 * Handle multipart upload for a file
 */
const handleMultipartUpload = async (file, existingFileId) => {
  const chunkSize = 5 * 1024 * 1024; // 5MB chunk size
  const fileId = existingFileId || `file-${Date.now()}-${file.name}`;
  
  // Create abort controller for this upload
  cancelTokens.value[fileId] = new AbortController();
  const { signal } = cancelTokens.value[fileId];
  
  // Initialize progress tracking
  uploadProgress.value[fileId] = {
    progress: 0,
    status: 'initiating',
    fileName: file.name
  };
  
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
    uploadProgress.value[fileId].status = 'uploading';
    
    // 2. Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    const totalChunks = Math.ceil(fileBuffer.byteLength / chunkSize);
    const parts = [];
    
    // 3. Upload each part
    for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
      const start = (partNumber - 1) * chunkSize;
      const end = Math.min(partNumber * chunkSize, fileBuffer.byteLength);
      const chunk = fileBuffer.slice(start, end);
      
      // Check if upload was cancelled
      if (signal.aborted) {
        throw new Error('Upload cancelled by user');
      }
      
      try {
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
        
        // Ensure etag is properly formatted with quotes as MinIO expects
        let etag = partResponse.etag;
        if (!etag.startsWith('"') && !etag.endsWith('"')) {
          etag = `"${etag}"`;
        }
        
        parts.push({
          part: partNumber,
          etag: etag
        });
        
        // Update progress
        uploadProgress.value[fileId].progress = (partNumber / totalChunks) * 100;
        
      } catch (partError) {
        // Retry logic - try up to 3 times
        let retryCount = 0;
        let success = false;
        
        while (retryCount < 3 && !success && !signal.aborted) {
          retryCount++;
          
          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const formData = new FormData();
            formData.append('file', new Blob([chunk]));
            
            const retryResponse = await $fetch('/api/upload/multipart/upload-part', {
              method: 'POST',
              body: formData,
              query: {
                objectName: key,
                uploadId,
                partNumber
              }
            });
            
            let etag = retryResponse.etag;
            if (!etag.startsWith('"') && !etag.endsWith('"')) {
              etag = `"${etag}"`;
            }
            
            parts.push({
              part: partNumber,
              etag: etag
            });
            
            uploadProgress.value[fileId].progress = (partNumber / totalChunks) * 100;
            success = true;
          } catch (retryError) {
            console.error(`Retry ${retryCount} failed for part ${partNumber}:`, retryError);
          }
        }
        
        if (!success) {
          throw new Error(`Failed to upload part ${partNumber} after ${retryCount} retries`);
        }
      }
    }
    
    // Check if upload was cancelled
    if (signal.aborted) {
      try {
        await $fetch('/api/upload/multipart/abort', {
          method: 'POST',
          body: {
            objectName: key,
            uploadId
          }
        });
      } catch (abortError) {
        console.error('Error aborting multipart upload:', abortError);
      }
      throw new Error('Upload cancelled by user');
    }
    
    // 4. Complete multipart upload
    const completeResponse = await $fetch('/api/upload/multipart/complete', {
      method: 'POST',
      body: {
        objectName: key,
        uploadId,
        parts
      }
    });
    
    uploadProgress.value[fileId].status = 'complete';
    uploadProgress.value[fileId].progress = 100;
    
    // Add to uploaded files
    uploadedFiles.value.push({
      filename: file.name,
      fileUrl: completeResponse.url,
      size: file.size,
      mimeType: file.type || 'application/octet-stream'
    });
    
    return completeResponse;
  } catch (error) {
    // Don't mark as error if it was cancelled by user
    if (error.message === 'Upload cancelled by user') {
      uploadProgress.value[fileId].status = 'cancelled';
    } else {
      uploadProgress.value[fileId].status = 'error';
    }
    
    // Clean up abort controller
    delete cancelTokens.value[fileId];
    
    throw error;
  } finally {
    // Clean up abort controller if it exists
    if (cancelTokens.value[fileId]) {
      delete cancelTokens.value[fileId];
    }
  }
};

// Utility function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Expose methods to parent component
defineExpose({
  uploadFiles,
  uploadedFiles,
  isUploading
});
</script>