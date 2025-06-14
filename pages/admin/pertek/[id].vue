<template>
  <div>
    <div class="py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-20">
        <svg class="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="rounded-md bg-red-50 p-4 my-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error loading PERTEK</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ errorMessage }}</p>
            </div>
            <div class="mt-4">
              <button
                type="button"
                @click="fetchData"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Header -->
        <div class="md:flex md:items-center md:justify-between mb-8">
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              PERTEK Detail
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              {{ pertek.company }}
            </p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <button
              @click="navigateToList"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Left Column: Basic Info & Status Timeline -->
          <div class="lg:col-span-1 space-y-6">
            <PertekInfo :pertek="pertek" />
            <StatusTimeline :pertekId="pertekId" :pertek="pertek" />
          </div>

          <!-- Right Column: Status Management, Documents, Feedback, Issuance -->
          <div class="lg:col-span-2 space-y-6">
            <StatusManager 
              :pertek="pertek" 
              :availableTransitions="availableTransitions"
              :nextActions="nextActions"
              @status-updated="handleStatusUpdate"
            />
            <DocumentManager 
              :pertekId="pertekId" 
              :currentStatus="pertek.status" 
              :documents="pertek.documents"
              @document-uploaded="handleDocumentUploaded"
            />
            <FeedbackManager 
              :pertekId="pertekId" 
              :documents="pertek.documents"
              @feedback-created="refreshData"
              @feedback-updated="refreshData"
            />
            <PertekIssuance 
              :pertek="pertek" 
              :documents="pertek.documents"
              @pertek-issued="handlePertekIssued"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, useFetch, onServerPrefetch } from '#imports'
import { useRouter } from 'vue-router'

// Import components
import PertekInfo from '~/components/admin/pertek/PertekInfo.vue'
import StatusTimeline from '~/components/admin/pertek/StatusTimeline.vue'
import StatusManager from '~/components/admin/pertek/StatusManager.vue'
import DocumentManager from '~/components/admin/pertek/DocumentManager.vue'
import FeedbackManager from '~/components/admin/pertek/FeedbackManager.vue'
import PertekIssuance from '~/components/admin/pertek/PertekIssuance.vue'

// Router and route params
const router = useRouter()
const route = useRoute()
const pertekId = route.params.id as string

// State
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const pertek = ref<any>({})
const availableTransitions = ref<string[]>([])
const nextActions = ref<string[]>([])

// Fetch PERTEK data
const fetchData = async () => {
  loading.value = true
  error.value = false
  
  try {
    const { data, error: fetchError } = await useFetch(`/api/pertek/admin/${pertekId}`)
    
    if (fetchError.value) {
      throw new Error('Failed to load PERTEK data')
    }
    
    if (!data.value || !data.value.success) {
      throw new Error(data.value?.message || 'Failed to load PERTEK data')
    }
    
    pertek.value = data.value.data
    availableTransitions.value = data.value.availableTransitions || []
    nextActions.value = data.value.nextActions || []
  } catch (err) {
    console.error('Error fetching PERTEK:', err)
    error.value = true
    errorMessage.value = err.message || 'An unexpected error occurred'
  } finally {
    loading.value = false
  }
}

// Refresh data without full reload
const refreshData = async () => {
  try {
    const { data } = await useFetch(`/api/pertek/admin/${pertekId}`, {
      key: `pertek-${pertekId}-${Date.now()}` // Force refetch by changing key
    })
    
    if (data.value && data.value.success) {
      pertek.value = data.value.data
      availableTransitions.value = data.value.availableTransitions || []
      nextActions.value = data.value.nextActions || []
    }
  } catch (err) {
    console.error('Error refreshing data:', err)
  }
}

// Handle status update
const handleStatusUpdate = (updatedPertek) => {
  pertek.value = updatedPertek
  refreshData()
}

// Handle document upload
const handleDocumentUploaded = (newDocument) => {
  // Add document to the list if it doesn't exist already
  const exists = pertek.value.documents.some(doc => doc.id === newDocument.id)
  if (!exists) {
    pertek.value.documents.push(newDocument)
  }
  
  refreshData() // Refresh to get latest data
}

// Handle PERTEK issued
const handlePertekIssued = (updatedPertek) => {
  pertek.value = updatedPertek
  refreshData()
}

// Navigate back to list
const navigateToList = () => {
  router.push('/admin/pertek')
}

// Setup lifecycle hooks
onMounted(() => {
  fetchData()
})

onServerPrefetch(fetchData)

// Define page metadata
useHead({
  title: 'Admin PERTEK Detail',
  meta: [
    { name: 'description', content: 'Admin PERTEK Detail Page' }
  ]
})
</script>
