<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Requirement Feedback</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">Manage feedback on PERTEK requirements</p>
    </div>

    <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
      <!-- Feedback Creation Form -->
      <div class="mb-6">
        <h4 class="text-base font-medium text-gray-700 mb-3">Add New Feedback</h4>
        <form @submit.prevent="submitFeedback" class="space-y-4">
          <!-- Document Selection -->
          <div>
            <label for="documentId" class="block text-sm font-medium text-gray-700">Related Document (Optional)</label>
            <select 
              id="documentId" 
              v-model="feedbackForm.documentId"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">General Feedback (No specific document)</option>
              <option v-for="doc in documents" :key="doc.id" :value="doc.id">
                {{ doc.filename }} ({{ getDocumentTypeLabel(doc.type) }})
              </option>
            </select>
          </div>
          
          <!-- Requirement Type -->
          <div>
            <label for="requirementType" class="block text-sm font-medium text-gray-700">Requirement Type</label>
            <select 
              id="requirementType" 
              v-model="feedbackForm.requirementType"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              required
            >
              <option disabled value="">Select requirement type</option>
              <option value="DOKUMEN_UMUM">Dokumen Umum</option>
              <option value="PROFIL_PERUSAHAAN">Profil Perusahaan</option>
              <option value="DATA_TEKNIS">Data Teknis</option>
              <option value="SPESIFIKASI_ALAT">Spesifikasi Peralatan</option>
              <option value="PROSEDUR_OPERASIONAL">Prosedur Operasional</option>
              <option value="STANDAR_EMISI">Standar Emisi</option>
              <option value="LIMBAH_BERBAHAYA">Penanganan Limbah Berbahaya</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>
          
          <!-- Feedback Text -->
          <div>
            <label for="feedbackText" class="block text-sm font-medium text-gray-700">Feedback Details</label>
            <textarea 
              id="feedbackText"
              v-model="feedbackForm.feedbackText"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Provide detailed feedback on what needs to be fixed or improved"
              required
            ></textarea>
          </div>
          
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span v-if="isSubmitting">Submitting...</span>
              <span v-else>Add Feedback</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Feedback List -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-base font-medium text-gray-700">Feedback List</h4>
          <div class="flex items-center">
            <label for="showResolved" class="mr-3 text-sm text-gray-500">Show Resolved:</label>
            <input 
              type="checkbox" 
              id="showResolved" 
              v-model="showResolved"
              class="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
          </div>
        </div>
        
        <div class="flow-root">
          <ul role="list" class="divide-y divide-gray-200">
            <li v-if="filteredFeedback.length === 0" class="py-4 text-center text-gray-500">
              No feedback items found
            </li>
            
            <li v-for="item in filteredFeedback" :key="item.id" class="py-4">
              <div :class="{'opacity-70': item.isResolved}" class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-between">
                  <div class="flex items-center space-x-2">
                    <span :class="getRequirementTypeClass(item.requirementType)" class="px-2 py-1 text-xs rounded-full font-medium">
                      {{ getRequirementTypeLabel(item.requirementType) }}
                    </span>
                    <span v-if="item.isResolved" class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                      Resolved
                    </span>
                  </div>
                  
                  <div class="text-xs text-gray-500">
                    {{ formatDate(item.createdAt) }}
                  </div>
                </div>
                
                <div class="mt-2 text-sm text-gray-700">
                  {{ item.feedbackText }}
                </div>
                
                <div v-if="item.document" class="mt-2 flex items-center text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{{ item.document.filename }}</span>
                </div>
                
                <div class="mt-3 flex justify-end">
                  <button
                    v-if="!item.isResolved"
                    @click="markAsResolved(item.id)"
                    class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  pertekId: {
    type: String,
    required: true
  },
  documents: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['feedback-created', 'feedback-updated'])

// Form state
const feedbackForm = ref({
  documentId: '',
  requirementType: '',
  feedbackText: ''
})

const isSubmitting = ref(false)
const feedback = ref([])
const showResolved = ref(false)
const isLoading = ref(true)

// Filtered feedback based on showResolved setting
const filteredFeedback = computed(() => {
  if (showResolved.value) {
    return feedback.value
  } else {
    return feedback.value.filter(item => !item.isResolved)
  }
})

// Load feedback on mount and when showResolved changes
onMounted(() => {
  loadFeedback()
})

watch(showResolved, () => {
  loadFeedback()
})

// Fetch feedback from the API
const loadFeedback = async () => {
  isLoading.value = true
  
  try {
    const queryParams = new URLSearchParams()
    queryParams.append('includeResolved', showResolved.value.toString())
    
    const { data } = await useFetch(`/api/pertek/admin/${props.pertekId}/feedback?${queryParams.toString()}`)
    
    if (data.value && data.value.success) {
      feedback.value = data.value.data || []
    }
  } catch (error) {
    console.error('Failed to load feedback:', error)
  } finally {
    isLoading.value = false
  }
}

// Submit new feedback
const submitFeedback = async () => {
  isSubmitting.value = true
  
  try {
    const payload = {
      requirementType: feedbackForm.value.requirementType,
      feedbackText: feedbackForm.value.feedbackText
    }
    
    // Add document ID if selected
    if (feedbackForm.value.documentId) {
      payload.documentId = feedbackForm.value.documentId
    }
    
    // Post the feedback
    const response = await fetch(`/api/pertek/admin/${props.pertekId}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to submit feedback')
    }
    
    // Clear form
    feedbackForm.value = {
      documentId: '',
      requirementType: '',
      feedbackText: ''
    }
    
    // Reload feedback list
    await loadFeedback()
    
    // Emit event
    emit('feedback-created', result.data)
  } catch (error) {
    console.error('Error submitting feedback:', error)
    alert(`Failed to submit feedback: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

// Mark feedback as resolved
const markAsResolved = async (feedbackId) => {
  try {
    const response = await fetch(`/api/pertek/admin/${props.pertekId}/feedback/${feedbackId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isResolved: true
      })
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update feedback')
    }
    
    // Update local state instead of reloading
    const updatedItem = feedback.value.find(item => item.id === feedbackId)
    if (updatedItem) {
      updatedItem.isResolved = true
      updatedItem.resolvedAt = new Date().toISOString()
    }
    
    // Emit event
    emit('feedback-updated', result.data)
  } catch (error) {
    console.error('Error updating feedback:', error)
    alert(`Failed to update feedback: ${error.message}`)
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

const getDocumentTypeLabel = (type) => {
  const types = {
    'PERSYARATAN': 'Dokumen Persyaratan',
    'REVISI': 'Dokumen Revisi',
    'SURAT_UNDANGAN_PAPARAN': 'Surat Undangan Paparan',
    'PERTEK_FINAL': 'Dokumen PERTEK Final'
  }
  
  return types[type] || type
}

const getRequirementTypeLabel = (type) => {
  const types = {
    'DOKUMEN_UMUM': 'Dokumen Umum',
    'PROFIL_PERUSAHAAN': 'Profil Perusahaan',
    'DATA_TEKNIS': 'Data Teknis',
    'SPESIFIKASI_ALAT': 'Spesifikasi Alat',
    'PROSEDUR_OPERASIONAL': 'Prosedur Operasional',
    'STANDAR_EMISI': 'Standar Emisi',
    'LIMBAH_BERBAHAYA': 'Penanganan Limbah Berbahaya',
    'LAINNYA': 'Lainnya'
  }
  
  return types[type] || type
}

const getRequirementTypeClass = (type) => {
  const classes = {
    'DOKUMEN_UMUM': 'bg-gray-100 text-gray-800',
    'PROFIL_PERUSAHAAN': 'bg-blue-100 text-blue-800',
    'DATA_TEKNIS': 'bg-indigo-100 text-indigo-800',
    'SPESIFIKASI_ALAT': 'bg-purple-100 text-purple-800',
    'PROSEDUR_OPERASIONAL': 'bg-yellow-100 text-yellow-800',
    'STANDAR_EMISI': 'bg-green-100 text-green-800',
    'LIMBAH_BERBAHAYA': 'bg-red-100 text-red-800',
    'LAINNYA': 'bg-gray-100 text-gray-800'
  }
  
  return classes[type] || 'bg-gray-100 text-gray-800'
}
</script>
