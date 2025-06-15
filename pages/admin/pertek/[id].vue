<template>
  <div>
    <!-- SEO Head -->
    <Head>
      <Title>Detail PERTEK {{ pertek?.pertekNumber || pertekId }} | Admin DLH</Title>
      <Meta name="description" content="Halaman administrasi untuk PERTEK. Hanya untuk administrator DLH." />
      <Meta name="robots" content="noindex, nofollow" />
      <Meta property="og:title" content="Detail PERTEK Admin | DLH" />
      <Meta property="og:description" content="Halaman administrasi PERTEK DLH." />
    </Head>
    
    <div class="min-h-screen bg-gray-50">
      <div class="py-6 px-4 sm:px-6 lg:px-8">
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="max-w-4xl mx-auto">
          <div class="rounded-md bg-red-50 border border-red-200 p-4 my-8">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">Gagal Memuat Data PERTEK</h3>
                <div class="mt-2 text-sm text-red-700">
                  <p>{{ errorMessage }}</p>
                </div>
                <div class="mt-4">
                  <button
                    type="button"
                    @click="fetchData"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div v-else class="max-w-6xl mx-auto">

          <!-- Header -->
          <div class="bg-white shadow rounded-lg mb-6 overflow-hidden">
            <div class="border-b border-gray-200 px-6 py-4">
              <div class="sm:flex sm:items-center sm:justify-between">
                <div class="flex-1 min-w-0">
                  <h1 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate mb-2">
                    Detail Permohonan Persetujuan Teknis
                  </h1>
                  <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-4">
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2H5v-2h10zM5 8h10v2H5V8z" clip-rule="evenodd" />
                      </svg>
                      <span>{{ pertek.company }}</span>
                    </div>
                    <div class="flex items-center text-sm text-gray-600">
                      <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                      </svg>
                      <span>{{ formatDate(pertek.createdAt) }}</span>
                    </div>
                    <div>
                      <span :class="getStatusClass(pertek.status)" class="px-2.5 py-1 text-xs font-medium rounded-full inline-flex items-center">
                        <span class="w-2 h-2 mr-1.5 rounded-full" :class="getStatusDotClass(pertek.status)"></span>
                        {{ getStatusLabel(pertek.status) }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="mt-4 flex sm:mt-0 sm:ml-4">
                  <button
                    @click="navigateToList"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    Kembali ke Daftar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="bg-white shadow-sm rounded-lg">
            <!-- Tab Navigation -->
            <div class="border-b border-gray-200">
              <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  :class="[
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                  ]"
                  :aria-current="activeTab === tab.id ? 'page' : undefined"
                >
                  {{ tab.name }}
                  <span v-if="tab.badge" :class="tab.badgeClass" class="ml-2 py-0.5 px-2 rounded-full text-xs font-medium">
                    {{ tab.badge }}
                  </span>
                </button>
              </nav>
            </div>
            
            <!-- Tab Content -->
            <div class="p-6">
              <!-- Tab 1: Informasi Umum -->
              <div v-show="activeTab === 'info'">
                <InformasiUmum :pertek="pertek" />
              </div>

              <!-- Tab 2: Update Status -->
              <div v-show="activeTab === 'status'">
                <UpdateStatus 
                  :pertek="pertek"
                  :availableTransitions="availableTransitions"
                  :nextActions="nextActions"
                  :documents="pertek.documents || []"
                  @status-updated="handleStatusUpdate"
                />
              </div>

              <!-- Tab 3: Documents -->
              <div v-show="activeTab === 'documents'">
                <DocumentsTab 
                  :documents="pertek?.documents || []"
                  :pertekId="pertekId"
                  @documents-updated="handleDocumentsUpdated"
                />
              </div>

              <!-- Tab 4: History -->
              <div v-show="activeTab === 'history'">
                <HistoryTimeline 
                  :pertekId="pertekId"
                  :pertek="pertek"
                  @feedback-resolved="refreshData"
                />
                </div>
            </div>
          </div>
        </div>

        <!-- Component was removed -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Import new components
import InformasiUmum from '~/components/admin/pertek/InformasiUmum.vue'
import UpdateStatus from '~/components/admin/pertek/UpdateStatus.vue'
import HistoryTimeline from '~/components/admin/pertek/HistoryTimeline.vue'
import DocumentsTab from '~/components/admin/pertek/DocumentsTab.vue'

// Define proper types
type PertekStatus = 
  | 'SUBMITTED'
  | 'VERIFICATION'
  | 'INCOMPLETE_REQUIREMENTS'
  | 'COMPLETE_REQUIREMENTS'
  | 'SCHEDULED_PAPARAN'
  | 'PAPARAN_COMPLETED'
  | 'REVISION_SUBMITTED'
  | 'REVISION_REVIEW'
  | 'REVISION_REJECTED'
  | 'REVISION_APPROVED'
  | 'PERTEK_ISSUED'
  | 'REJECTED';

// Router and route params
const router = useRouter()
const route = useRoute()
const pertekId = route.params.id as string

// State
const loading = ref(true)
const error = ref(false)
const errorMessage = ref('')
const pertek = ref<any>({})
const availableTransitions = ref<PertekStatus[]>([])
const nextActions = ref<string[]>([])
const activeTab = ref('info')

// Tab configuration
const tabs = computed(() => {
  const pendingFeedback = pertek.value.requirementFeedback?.filter((f: any) => !f.isResolved).length || 0
  
  return [
    { 
      id: 'info', 
      name: 'Informasi Umum' 
    },
    { 
      id: 'status', 
      name: 'Update Status',
      badge: availableTransitions.value.length > 0 ? availableTransitions.value.length : null,
      badgeClass: 'bg-blue-100 text-blue-800'
    },
    { 
      id: 'documents', 
      name: 'Dokumen',
      badge: pertek.value.documents?.length || null,
      badgeClass: 'bg-green-100 text-green-800'
    },
    { 
      id: 'history', 
      name: 'History',
      badge: pertek.value.statusHistory?.length || null,
      badgeClass: 'bg-blue-100 text-blue-800'
    }
  ]
})

// Fetch PERTEK data
const fetchData = async () => {
  loading.value = true
  error.value = false
  
  try {
    const response: any = await $fetch(`/api/pertek/admin/${pertekId}`)
    
    if (!response.success) {
      throw new Error(response.message || 'Gagal memuat data PERTEK')
    }
    
    pertek.value = response.data
    availableTransitions.value = response.availableTransitions || []
    nextActions.value = response.nextActions || []
    
  } catch (err: any) {
    console.error('Error fetching PERTEK:', err)
    error.value = true
    errorMessage.value = err.message || 'Terjadi kesalahan yang tidak terduga'
  } finally {
    loading.value = false
  }
}

// Refresh data without full reload
const refreshData = async () => {
  try {
    const response: any = await $fetch(`/api/pertek/admin/${pertekId}`)
    
    if (response.success) {
      pertek.value = response.data
      availableTransitions.value = response.availableTransitions || []
      nextActions.value = response.nextActions || []
    }
  } catch (err) {
    console.error('Error refreshing data:', err)
  }
}

// Handle status update
const handleStatusUpdate = (updatedPertek: any) => {
  pertek.value = updatedPertek
  refreshData()
  // Switch to history tab to see the update
  activeTab.value = 'history'
}

// Handle documents updated
const handleDocumentsUpdated = () => {
  // Refresh data to get updated documents list
  refreshData()
}


// Navigate back to list
const navigateToList = () => {
  router.push('/admin/pertek')
}

// Helper functions
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'SUBMITTED': 'bg-gray-100 text-gray-800',
    'VERIFICATION': 'bg-blue-100 text-blue-800',
    'INCOMPLETE_REQUIREMENTS': 'bg-red-100 text-red-800',
    'COMPLETE_REQUIREMENTS': 'bg-green-100 text-green-800',
    'SCHEDULED_PAPARAN': 'bg-purple-100 text-purple-800',
    'PAPARAN_COMPLETED': 'bg-yellow-100 text-yellow-800',
    'REVISION_SUBMITTED': 'bg-indigo-100 text-indigo-800',
    'REVISION_REVIEW': 'bg-blue-100 text-blue-800',
    'REVISION_REJECTED': 'bg-red-100 text-red-800',
    'REVISION_APPROVED': 'bg-green-100 text-green-800',
    'PERTEK_ISSUED': 'bg-emerald-100 text-emerald-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusDotClass = (status: string) => {
  const classes: Record<string, string> = {
    'SUBMITTED': 'bg-gray-400',
    'VERIFICATION': 'bg-blue-400',
    'INCOMPLETE_REQUIREMENTS': 'bg-red-400',
    'COMPLETE_REQUIREMENTS': 'bg-green-400',
    'SCHEDULED_PAPARAN': 'bg-purple-400',
    'PAPARAN_COMPLETED': 'bg-yellow-400',
    'REVISION_SUBMITTED': 'bg-indigo-400',
    'REVISION_REVIEW': 'bg-blue-400',
    'REVISION_REJECTED': 'bg-red-400',
    'REVISION_APPROVED': 'bg-green-400',
    'PERTEK_ISSUED': 'bg-emerald-400',
    'REJECTED': 'bg-red-400'
  }
  
  return classes[status] || 'bg-gray-400'
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'SUBMITTED': 'Pengajuan Baru',
    'VERIFICATION': 'Proses Verifikasi',
    'INCOMPLETE_REQUIREMENTS': 'Persyaratan Tidak Lengkap',
    'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
    'SCHEDULED_PAPARAN': 'Paparan Dijadwalkan',
    'PAPARAN_COMPLETED': 'Paparan Selesai',
    'REVISION_SUBMITTED': 'Revisi Disubmit',
    'REVISION_REVIEW': 'Review Revisi',
    'REVISION_REJECTED': 'Revisi Ditolak',
    'REVISION_APPROVED': 'Revisi Disetujui',
    'PERTEK_ISSUED': 'PERTEK Diterbitkan',
    'REJECTED': 'Ditolak'
  }
  
  return labels[status] || status
}

// Setup lifecycle hooks
onMounted(() => {
  fetchData()
})

// Page metadata is now defined in the <Head> component in the template
</script>