<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Document Management</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">View and manage PERTEK documents</p>
    </div>

    <!-- Upload Document Form -->
    <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
      <div class="sm:flex sm:items-start">
        <div class="w-full">
          <form @submit.prevent="uploadDocument" class="space-y-4">
            <div>
              <label for="documentType" class="block text-sm font-medium text-gray-700">Document Type</label>
              <select 
                id="documentType" 
                v-model="uploadForm.type"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                required
              >
                <option disabled value="">Select document type</option>
                <option v-for="option in availableDocumentTypes" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p v-if="uploadForm.typeError" class="mt-1 text-sm text-red-600">
                {{ uploadForm.typeError }}
              </p>
            </div>
            
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <input 
                type="text" 
                id="description"
                v-model="uploadForm.description"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Brief description of this document"
              />
            </div>
            
            <div>
              <label for="document" class="block text-sm font-medium text-gray-700">Select File</label>
              <input 
                type="file" 
                ref="fileInput"
                @change="handleFileChange"
                class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p v-if="uploadForm.fileError" class="mt-1 text-sm text-red-600">
                {{ uploadForm.fileError }}
              </p>
            </div>
            
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="isUploading"
                class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span v-if="isUploading">Uploading...</span>
                <span v-else>Upload Document</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Document List -->
    <div class="px-4 py-5 sm:px-6 border-t border-gray-200">
      <h4 class="text-base font-medium text-gray-700 mb-4">Document List</h4>
      <div class="flow-root">
        <ul class="-my-5 divide-y divide-gray-200">
          <li v-if="documents.length === 0" class="py-4 text-center text-gray-500">
            No documents uploaded yet
          </li>
          <li v-for="doc in documents" :key="doc.id" class="py-4">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <span v-if="getDocumentIcon(doc.mimeType)" class="text-gray-500 h-8 w-8 flex items-center justify-center">
                  <!-- Document icon based on file type -->
                  <svg v-if="doc.mimeType.includes('pdf')" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <svg v-else-if="doc.mimeType.includes('image')" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
              </div>
              
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ doc.filename }}
                </p>
                <div class="mt-1 flex items-center">
                  <p class="text-sm text-gray-500 mr-2">
                    {{ getDocumentTypeLabel(doc.type) }}
                  </p>
                  <span class="text-xs text-gray-400">
                    {{ formatFileSize(doc.size) }}
                  </span>
                  <span v-if="doc.description" class="ml-2 text-xs text-gray-500">
                    {{ doc.description }}
                  </span>
                </div>
                <p class="text-xs text-gray-400 mt-1">
                  Uploaded {{ formatDate(doc.uploadedAt) }}
                </p>
              </div>
              
              <div class="flex-shrink-0">
                <button
                  @click="downloadDocument(doc.id)"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Download
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  pertekId: {
    type: String,
    required: true
  },
  currentStatus: {
    type: String,
    required: true
  },
  documents: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['document-uploaded'])

const fileInput = ref(null)
const isUploading = ref(false)
const uploadForm = ref({
  type: '',
  description: '',
  file: null,
  typeError: '',
  fileError: ''
})

// Determine available document types based on current status
const availableDocumentTypes = computed(() => {
  const types = []
  
  // Always available types
  types.push({ value: 'PERSYARATAN', label: 'Dokumen Persyaratan' })
  
  // Add more types based on status
  if (['PAPARAN_COMPLETED', 'REVISION_SUBMITTED', 'REVISION_REVIEW', 'REVISION_REJECTED'].includes(props.currentStatus)) {
    types.push({ value: 'REVISI', label: 'Dokumen Revisi' })
  }
  
  if (props.currentStatus === 'SCHEDULED_PAPARAN') {
    types.push({ value: 'SURAT_UNDANGAN_PAPARAN', label: 'Surat Undangan Paparan' })
  }
  
  if (props.currentStatus === 'REVISION_APPROVED') {
    types.push({ value: 'PERTEK_FINAL', label: 'Dokumen PERTEK Final' })
  }
  
  return types
})

// Handle file selection
const handleFileChange = (event) => {
  const file = event.target.files[0]
  
  if (file) {
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      uploadForm.value.fileError = 'File size exceeds 10MB limit'
      return
    }
    
    uploadForm.value.file = file
    uploadForm.value.fileError = ''
  }
}

// Upload document
const uploadDocument = async () => {
  // Clear previous errors
  uploadForm.value.typeError = ''
  uploadForm.value.fileError = ''
  
  // Validate fields
  if (!uploadForm.value.type) {
    uploadForm.value.typeError = 'Please select document type'
    return
  }
  
  if (!uploadForm.value.file) {
    uploadForm.value.fileError = 'Please select a file to upload'
    return
  }
  
  isUploading.value = true
  
  try {
    // Create form data
    const formData = new FormData()
    formData.append('file', uploadForm.value.file)
    formData.append('type', uploadForm.value.type)
    
    if (uploadForm.value.description) {
      formData.append('description', uploadForm.value.description)
    }
    
    // Upload document
    const response = await fetch(`/api/pertek/admin/${props.pertekId}/documents`, {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload document')
    }
    
    // Reset form
    uploadForm.value.type = ''
    uploadForm.value.description = ''
    uploadForm.value.file = null
    
    if (fileInput.value) {
      fileInput.value.value = '' // Reset file input
    }
    
    // Emit event to notify parent component
    emit('document-uploaded', result.data)
  } catch (error) {
    console.error('Error uploading document:', error)
    alert(`Failed to upload document: ${error.message}`)
  } finally {
    isUploading.value = false
  }
}

// Download document
const downloadDocument = async (documentId) => {
  try {
    // Generate download URL
    const url = `/api/pertek/admin/${props.pertekId}/documents/${documentId}/download`
    
    // Open in new tab
    window.open(url, '_blank')
  } catch (error) {
    console.error('Error downloading document:', error)
    alert('Failed to download document')
  }
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

const getDocumentTypeLabel = (type) => {
  const types = {
    'PERSYARATAN': 'Dokumen Persyaratan',
    'REVISI': 'Dokumen Revisi',
    'SURAT_UNDANGAN_PAPARAN': 'Surat Undangan Paparan',
    'PERTEK_FINAL': 'Dokumen PERTEK Final'
  }
  
  return types[type] || type
}

const getDocumentIcon = (mimeType) => {
  // Return appropriate icon class based on MIME type
  if (!mimeType) return false
  
  if (mimeType.includes('pdf')) {
    return 'pdf'
  } else if (mimeType.includes('image')) {
    return 'image'
  }
  
  return 'document'
}
</script>
