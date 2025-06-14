<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">PERTEK Issuance</h3>
      <p class="mt-1 max-w-2xl text-sm text-gray-500">Issue the official PERTEK document</p>
    </div>

    <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
      <div v-if="pertek.status === 'REVISION_APPROVED'">
        <!-- Check if PERTEK final document exists -->
        <div v-if="!hasFinalDocument" class="mb-5 rounded-md bg-yellow-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-yellow-800">Upload Required</h3>
              <div class="mt-2 text-sm text-yellow-700">
                <p>You must upload the final PERTEK document before issuing the PERTEK.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Issuance Form -->
        <form @submit.prevent="issuePertek" class="space-y-4">
          <div>
            <label for="pertekNumber" class="block text-sm font-medium text-gray-700">PERTEK Number</label>
            <input 
              type="text" 
              id="pertekNumber"
              v-model="issuanceForm.pertekNumber"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="e.g. PERTEK/2025/VII/001"
              :disabled="isSubmitting || !hasFinalDocument"
              required
            />
            <p class="mt-1 text-xs text-gray-500">Official PERTEK reference number</p>
          </div>
          
          <div>
            <label for="approvalDate" class="block text-sm font-medium text-gray-700">Approval Date</label>
            <input 
              type="date" 
              id="approvalDate"
              v-model="issuanceForm.approvalDate"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              :disabled="isSubmitting || !hasFinalDocument"
            />
            <p class="mt-1 text-xs text-gray-500">Official approval date (defaults to today if left blank)</p>
          </div>
          
          <div class="pt-2">
            <button
              type="submit"
              :disabled="isSubmitting || !hasFinalDocument"
              :class="[
                'w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:w-auto sm:text-sm',
                hasFinalDocument 
                  ? 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500' 
                  : 'bg-gray-300 cursor-not-allowed'
              ]"
            >
              <span v-if="isSubmitting">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else>Issue Official PERTEK</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Already Issued PERTEK -->
      <div v-else-if="pertek.status === 'PERTEK_ISSUED'" class="rounded-md bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">PERTEK Successfully Issued</h3>
            <div class="mt-2 text-sm text-green-700">
              <p><span class="font-medium">PERTEK Number:</span> {{ pertek.pertekNumber }}</p>
              <p class="mt-1"><span class="font-medium">Approval Date:</span> {{ formatDate(pertek.approvedAt) }}</p>
            </div>
            <div class="mt-3">
              <button 
                @click="downloadPertek"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Download PERTEK Document
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Ready for Issuance -->
      <div v-else class="rounded-md bg-gray-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-gray-800">Not Ready for Issuance</h3>
            <div class="mt-2 text-sm text-gray-700">
              <p>PERTEK can only be issued after revisions have been approved.</p>
              <p class="mt-1">Current Status: <span class="font-medium">{{ getStatusLabel(pertek.status) }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// Define interfaces for type safety
interface PertekDocument {
  id: string;
  type: string;
  name?: string;
  filename?: string;
  fileUrl?: string;
  size?: number;
  createdAt?: Date;
  uploadedAt?: Date;
  [key: string]: any; // Allow for additional properties
}

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

interface Pertek {
  id: string;
  status: PertekStatus;
  pertekNumber?: string;
  approvedAt?: Date | string | null;
  paparanDate?: Date | string | null;
  paparanLocation?: string;
  company: string;
  [key: string]: any; // Allow for additional properties
}

const props = defineProps({
  pertek: {
    type: Object as () => Pertek,
    required: true
  },
  documents: {
    type: Array as () => PertekDocument[],
    default: () => []
  }
})

const emit = defineEmits(['pertek-issued'])

// Check if there's a final PERTEK document
const hasFinalDocument = computed(() => {
  return props.documents.some(doc => doc.type === 'PERTEK_FINAL')
})

// Form state
const issuanceForm = ref({
  pertekNumber: '',
  approvalDate: formatInputDate(new Date())
})

const isSubmitting = ref(false)

// Format date for input field (YYYY-MM-DD)
function formatInputDate(date: Date | string): string {
  const d = new Date(date)
  const month = '' + (d.getMonth() + 1)
  const day = '' + d.getDate()
  const year = d.getFullYear()

  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
}

// Format date for display
const formatDate = (dateString?: Date | string | null): string => {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date)
}

// Issue PERTEK
const issuePertek = async (): Promise<void> => {
  if (!hasFinalDocument.value) {
    alert('Please upload the final PERTEK document first')
    return
  }
  
  isSubmitting.value = true
  
  try {
    const payload = {
      pertekNumber: issuanceForm.value.pertekNumber,
      approvalDate: issuanceForm.value.approvalDate || new Date().toISOString()
    }
    
    // Post the PERTEK issuance request
    const response = await fetch(`/api/pertek/admin/${props.pertek.id}/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to issue PERTEK')
    }
    
    // Emit event to update parent component
    emit('pertek-issued', result.data)
  } catch (error: any) {
    console.error('Error issuing PERTEK:', error)
    alert(`Failed to issue PERTEK: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

// Download PERTEK
const downloadPertek = async (): Promise<void> => {
  try {
    // Find the PERTEK_FINAL document
    const finalDoc = props.documents.find(doc => doc.type === 'PERTEK_FINAL')
    
    if (finalDoc) {
      // Generate download URL
      const url = `/api/pertek/admin/${props.pertek.id}/documents/${finalDoc.id}/download`
      window.open(url, '_blank')
    } else {
      // Use the general download endpoint (might be a consolidated version)
      const url = `/api/pertek/admin/${props.pertek.id}/download`
      window.open(url, '_blank')
    }
  } catch (error: any) {
    console.error('Error downloading PERTEK:', error)
    alert('Failed to download PERTEK document')
  }
}

// Helper for status labels
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
</script>
