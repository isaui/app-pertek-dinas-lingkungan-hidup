<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Status Timeline</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">Timeline of all status changes for this PERTEK</p>
    </div>
    
    <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-4">
        <svg class="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="!statusHistory || statusHistory.length === 0" class="text-center py-4 text-gray-500">
        No status history available
      </div>
      
      <!-- Timeline -->
      <div v-else class="flow-root">
        <ul role="list" class="-mb-8">
          <li v-for="(event, eventIdx) in statusHistory" :key="event.id">
            <div class="relative pb-8">
              <!-- Line connecting events -->
              <span v-if="eventIdx !== statusHistory.length - 1" class="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              <div class="relative flex items-start space-x-3">
                <!-- Status Icon -->
                <div :class="getStatusIconClass(event.status)" class="relative h-10 w-10 flex items-center justify-center rounded-full">
                  <span v-if="getStatusIcon(event.status) === 'check'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span v-else-if="getStatusIcon(event.status) === 'x'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  <span v-else-if="getStatusIcon(event.status) === 'clock'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span v-else-if="getStatusIcon(event.status) === 'document'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <span v-else-if="getStatusIcon(event.status) === 'presentation'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                
                <!-- Status Content -->
                <div class="min-w-0 flex-1">
                  <div>
                    <div class="text-sm">
                      <span class="font-medium text-gray-900">{{ getStatusLabel(event.status) }}</span>
                    </div>
                    <p class="mt-0.5 text-sm text-gray-500">
                      {{ formatDate(event.createdAt) }}
                      <span v-if="event.changedBy" class="ml-1">by {{ event.changedBy.name }}</span>
                    </p>
                  </div>
                  
                  <div v-if="event.notes" class="mt-2 text-sm text-gray-700">
                    <p>{{ event.notes }}</p>
                  </div>
                  
                  <!-- Special info for scheduled presentation -->
                  <div v-if="event.status === 'SCHEDULED_PAPARAN' && pertek.paparanDate" class="mt-2 text-sm text-gray-600">
                    <div class="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{{ formatDateTime(pertek.paparanDate) }}</span>
                    </div>
                    <div v-if="pertek.paparanLocation" class="flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{{ pertek.paparanLocation }}</span>
                    </div>
                  </div>
                  
                  <!-- PERTEK issuance details -->
                  <div v-if="event.status === 'PERTEK_ISSUED'" class="mt-2 text-sm text-gray-600">
                    <p><span class="font-medium">PERTEK Number:</span> {{ pertek.pertekNumber }}</p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Define TypeScript interfaces for better type checking
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

interface User {
  id: string;
  name: string;
  email?: string;
  [key: string]: any;
}

interface StatusHistoryItem {
  id: string;
  status: PertekStatus;
  createdAt: Date | string;
  notes?: string;
  changedBy?: User | null;
  [key: string]: any;
}

interface Pertek {
  id: string;
  status: PertekStatus;
  pertekNumber?: string;
  approvedAt?: Date | string | null;
  paparanDate?: Date | string | null;
  paparanLocation?: string;
  statusHistory?: StatusHistoryItem[];
  [key: string]: any;
}

const props = defineProps({
  pertekId: {
    type: String,
    required: true
  },
  pertek: {
    type: Object as () => Pertek,
    required: true
  }
})

const statusHistory = ref<StatusHistoryItem[]>([])
const isLoading = ref(true)

// Fetch status history on mount
onMounted(async () => {
  await loadStatusHistory()
})

// Get status history from API
const loadStatusHistory = async (): Promise<void> => {
  isLoading.value = true
  
  try {
    // Use composable for fetch (this would likely be an API endpoint similar to the other PERTEK endpoints)
    // For now, we'll simulate using the status history from the pertek object directly
    if (props.pertek.statusHistory && Array.isArray(props.pertek.statusHistory)) {
      statusHistory.value = [...props.pertek.statusHistory].sort((a: StatusHistoryItem, b: StatusHistoryItem) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    } else {
      statusHistory.value = []
    }
  } catch (error: any) {
    console.error('Failed to load status history:', error)
  } finally {
    isLoading.value = false
  }
}

// Helper functions
const formatDate = (dateString: Date | string | null | undefined): string => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

const formatDateTime = (dateString: Date | string | null | undefined): string => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'full'
  }).format(date)
  
  const timeFormatted = new Intl.DateTimeFormat('id-ID', {
    timeStyle: 'short'
  }).format(date)
  
  return `${dateFormatted} at ${timeFormatted}`
}

const getStatusLabel = (status: PertekStatus | string): string => {
  const labels: Record<PertekStatus, string> = {
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
  
  return labels[status as PertekStatus] || status
}

const getStatusIcon = (status: PertekStatus | string): string => {
  const icons: Record<PertekStatus, string> = {
    'SUBMITTED': 'document',
    'VERIFICATION': 'clock',
    'INCOMPLETE_REQUIREMENTS': 'x',
    'COMPLETE_REQUIREMENTS': 'check',
    'SCHEDULED_PAPARAN': 'presentation',
    'PAPARAN_COMPLETED': 'presentation',
    'REVISION_SUBMITTED': 'document',
    'REVISION_REVIEW': 'clock',
    'REVISION_REJECTED': 'x',
    'REVISION_APPROVED': 'check',
    'PERTEK_ISSUED': 'document',
    'REJECTED': 'x'
  }
  
  return icons[status as PertekStatus] || 'document'
}

const getStatusIconClass = (status: PertekStatus | string): string => {
  let baseClass = 'bg-gray-200 text-gray-600'
  
  switch (status as PertekStatus) {
    case 'COMPLETE_REQUIREMENTS':
    case 'REVISION_APPROVED':
    case 'PERTEK_ISSUED':
      baseClass = 'bg-green-100 text-green-600'
      break
    case 'INCOMPLETE_REQUIREMENTS':
    case 'REVISION_REJECTED':
    case 'REJECTED':
      baseClass = 'bg-red-100 text-red-600'
      break
    case 'VERIFICATION':
    case 'REVISION_REVIEW':
      baseClass = 'bg-blue-100 text-blue-600'
      break
    case 'SCHEDULED_PAPARAN':
    case 'PAPARAN_COMPLETED':
      baseClass = 'bg-purple-100 text-purple-600'
      break
    case 'REVISION_SUBMITTED':
      baseClass = 'bg-indigo-100 text-indigo-600'
      break
    case 'SUBMITTED':
    default:
      baseClass = 'bg-gray-100 text-gray-600'
  }
  
  return baseClass
}
</script>
