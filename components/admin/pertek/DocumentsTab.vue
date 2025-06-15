<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900">Semua Dokumen</h3>
      <p class="mt-1 text-sm text-gray-500">
        Dokumen yang tersedia dalam pengajuan PERTEK
      </p>
    </div>
    
    <!-- Empty State -->
    <div v-if="!documents || documents.length === 0" class="bg-white border border-gray-200 rounded-lg p-8">
      <div class="text-center text-gray-500">
        <svg class="mx-auto h-12 w-12 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-4 text-sm">Tidak ada dokumen yang tersedia</p>
      </div>
    </div>
    
    <!-- Edit Document Dialog -->
    <div v-if="showEditDialog" class="fixed inset-0 flex items-center justify-center z-50 p-4">
      <!-- Background Overlay -->
      <div class="fixed inset-0 bg-black opacity-20" @click="cancelEdit"></div>
      
      <!-- Dialog Content -->
      <div class="relative bg-white border border-gray-200 rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Edit Dokumen</h3>
        
        <div class="space-y-4">
          <!-- Filename display -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama File</label>
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-sm text-gray-900">{{ selectedDocument?.filename || '' }}</p>
            </div>
          </div>
          
          <!-- File upload field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ganti File</label>
            <input 
              ref="fileInput" 
              type="file" 
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @change="handleFileChange"
            >
            <p class="mt-1 text-xs text-gray-500">Pilih file baru untuk mengganti dokumen yang ada</p>
          </div>

          <!-- Status message -->
          <div v-if="statusMessage" :class="`text-sm p-3 rounded-lg ${statusSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`">
            {{ statusMessage }}
          </div>
          
          <!-- Buttons -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button 
              @click="cancelEdit" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              :disabled="isLoading"
            >
              Batal
            </button>
            <button 
              @click="submitEdit" 
              class="px-4 py-2 bg-blue-600 rounded-lg text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Menyimpan...</span>
              <span v-else>Simpan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Document Dialog -->
    <div v-if="showDeleteDialog" class="fixed inset-0 flex items-center justify-center z-50 p-4">
      <!-- Background Overlay -->
      <div class="fixed inset-0 bg-black opacity-20" @click="cancelDelete"></div>
      
      <!-- Dialog Content -->
      <div class="relative bg-white border border-gray-200 rounded-lg p-6 w-full max-w-lg shadow-lg">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Hapus Dokumen</h3>
        
        <div class="space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">
              Apakah Anda yakin ingin menghapus dokumen:
            </p>
            <p class="font-medium text-red-900 mt-1">{{ selectedDocument?.filename || '' }}</p>
          </div>
          
          <p class="text-sm text-gray-600">
            Tindakan ini tidak dapat dibatalkan dan dokumen tidak akan tersedia lagi.
          </p>

          <!-- Status message -->
          <div v-if="statusMessage" :class="`text-sm p-3 rounded-lg ${statusSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`">
            {{ statusMessage }}
          </div>
          
          <!-- Buttons -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button 
              @click="cancelDelete" 
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              :disabled="isLoading"
            >
              Batal
            </button>
            <button 
              @click="confirmDelete" 
              class="px-4 py-2 bg-red-600 rounded-lg text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Menghapus...</span>
              <span v-else>Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Documents List -->
    <div v-if="documents && documents.length > 0" class="space-y-4">
      <!-- Group documents by type -->
      <div v-for="(group, groupType) in groupedDocuments" :key="groupType" class="bg-white border border-gray-200 rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h4 class="text-md font-medium text-gray-900">{{ getDocumentTypeLabel(groupType) }}</h4>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="doc in group" :key="doc.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <!-- Document info -->
              <div class="flex items-center space-x-4">
                <!-- Document icon -->
                <div class="bg-green-100 p-2 rounded-lg text-green-600">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                
                <!-- Document details -->
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ doc.filename.replace(/\s*\(auto-uploaded\)/gi, '') }}</div>
                  <div class="text-xs text-gray-500">
                    {{ formatFileSize(doc.size || 0) }}
                  </div>
                </div>
              </div>
              
              <!-- Action buttons -->
              <div class="flex space-x-2">
                <!-- Edit and Delete buttons for admin documents only -->
                <template v-if="['PERTEK_FINAL', 'SURAT_UNDANGAN_PAPARAN'].includes(doc.type)">
                  <button 
                    @click="openEditDialog(doc)" 
                    class="bg-gray-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center"
                  >
                    <svg class="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  
                  <button 
                    @click="openDeleteDialog(doc)" 
                    class="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
                  >
                    <svg class="mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </template>
                
                <!-- Download button -->
                <button 
                  @click="downloadDocument(doc)" 
                  class="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                >
                  <svg class="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const emit = defineEmits(['documents-updated'])

const props = defineProps({
  documents: {
    type: Array as () => Array<{
      id: string
      filename: string
      type: string
      fileUrl?: string
      url?: string
      size?: number
      description?: string
      createdAt: string
    }>,
    default: () => []
  },
  pertekId: {
    type: String,
    required: true
  }
})

// Dialog state
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedDocument = ref(null as any)
const isLoading = ref(false)
const statusMessage = ref('')
const statusSuccess = ref(true)
const fileInput = ref<HTMLInputElement | null>(null)

// Edit form state
const editForm = ref({
  description: '',
  file: null as File | null
})

// Group documents by their type
const groupedDocuments = computed(() => {
  const groups: Record<string, any[]> = {}
  
  // Clone and clean documents data
  const cleanedDocs = props.documents.map(doc => ({
    ...doc,
    filename: doc.filename?.replace(/\s*\(auto-uploaded\)/gi, '') || '',
    description: doc.description?.replace(/\s*\(auto-uploaded\)/gi, '') || ''
  }))
  
  cleanedDocs.forEach(doc => {
    if (!groups[doc.type]) {
      groups[doc.type] = []
    }
    groups[doc.type].push(doc)
  })
  
  return groups
})

// Edit document functions
const openEditDialog = (doc: any) => {
  selectedDocument.value = doc
  editForm.value.description = doc.description || ''
  editForm.value.file = null
  statusMessage.value = ''
  showEditDialog.value = true
}

const cancelEdit = () => {
  showEditDialog.value = false
  selectedDocument.value = null
  statusMessage.value = ''
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    editForm.value.file = input.files[0]
  }
}

const submitEdit = async () => {
  if (!selectedDocument.value) return
  
  // Verifikasi file dipilih (required sekarang karena tidak ada deskripsi)
  if (!editForm.value.file) {
    statusSuccess.value = false
    statusMessage.value = 'Silakan pilih file untuk diupload'
    return
  }
  
  isLoading.value = true
  statusMessage.value = ''
  
  try {
    const formData = new FormData()
    
    // Add file
    formData.append('file', editForm.value.file)
    
    // Make API call to update document
    const response = await fetch(`/api/pertek/admin/${props.pertekId}/documents/${selectedDocument.value.id}`, {
      method: 'PUT',
      body: formData
    })
    
    const result = await response.json()
    
    if (result.success) {
      statusSuccess.value = true
      statusMessage.value = result.message || 'Dokumen berhasil diperbarui'
      
      // Notify parent to refresh documents
      emit('documents-updated')
      
      // Close dialog after a short delay
      setTimeout(() => {
        cancelEdit()
      }, 1500)
    } else {
      statusSuccess.value = false
      statusMessage.value = result.message || 'Gagal memperbarui dokumen'
    }
  } catch (error) {
    console.error('Error updating document:', error)
    statusSuccess.value = false
    statusMessage.value = 'Terjadi kesalahan saat memperbarui dokumen'
  } finally {
    isLoading.value = false
  }
}

// Delete document functions
const openDeleteDialog = (doc: any) => {
  selectedDocument.value = doc
  statusMessage.value = ''
  showDeleteDialog.value = true
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  selectedDocument.value = null
  statusMessage.value = ''
}

const confirmDelete = async () => {
  if (!selectedDocument.value) return
  
  isLoading.value = true
  statusMessage.value = ''
  
  try {
    // Make API call to delete document
    const response = await fetch(`/api/pertek/admin/${props.pertekId}/documents/${selectedDocument.value.id}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (result.success) {
      statusSuccess.value = true
      statusMessage.value = result.message || 'Dokumen berhasil dihapus'
      
      // Notify parent to refresh documents
      emit('documents-updated')
      
      // Close dialog after a short delay
      setTimeout(() => {
        cancelDelete()
      }, 1500)
    } else {
      statusSuccess.value = false
      statusMessage.value = result.message || 'Gagal menghapus dokumen'
    }
  } catch (error) {
    console.error('Error deleting document:', error)
    statusSuccess.value = false
    statusMessage.value = 'Terjadi kesalahan saat menghapus dokumen'
  } finally {
    isLoading.value = false
  }
}

// Download document function
const downloadDocument = (document: any) => {
  if (document.fileUrl) {
    window.open(document.fileUrl, '_blank')
  } else if (document.url) {
    window.open(document.url, '_blank')
  } else {
    // Fallback to API endpoint
    const url = `/api/pertek/admin/${props.pertekId}/documents/${document.id}/download`
    window.open(url, '_blank')
  }
}

// Helper functions
const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const getDocumentTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    'PERSYARATAN': 'Dokumen Persyaratan',
    'REVISI': 'Dokumen Revisi',
    'SURAT_UNDANGAN_PAPARAN': 'Surat Undangan Paparan',
    'PERTEK_FINAL': 'Dokumen PERTEK Final'
  }
  
  // Hapus teks (auto-uploaded) dari nama dokumen
  return (types[type] || type).replace(/\s*\(auto-uploaded\)/gi, '')
}
</script>