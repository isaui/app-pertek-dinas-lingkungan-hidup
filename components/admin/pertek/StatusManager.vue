<template>
  <div class="bg-white overflow-hidden shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900">Status Management</h3>
      
      <!-- Current Status -->
      <div class="mt-4 flex items-center">
        <span class="text-sm font-medium text-gray-500 mr-2">Current Status:</span>
        <span :class="getStatusClass(pertek.status)" class="px-2 py-1 text-sm font-medium rounded-full">
          {{ getStatusLabel(pertek.status) }}
        </span>
      </div>

      <!-- Available Transitions -->
      <div v-if="availableTransitions.length > 0" class="mt-6">
        <h4 class="text-base font-medium text-gray-700">Available Actions</h4>
        <div class="mt-3 flex flex-wrap gap-2">
          <button 
            v-for="transition in availableTransitions" 
            :key="transition"
            @click="openStatusModal(transition)"
            :class="getActionButtonClass(transition)"
            class="inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md shadow-sm">
            {{ getActionLabel(transition) }}
          </button>
        </div>
      </div>

      <!-- Next Actions -->
      <div v-if="nextActions.length > 0" class="mt-6">
        <h4 class="text-sm font-medium text-gray-600">Suggested Next Steps</h4>
        <ul class="mt-2 pl-5 list-disc text-sm text-gray-600">
          <li v-for="(action, index) in nextActions" :key="index" class="mt-1">
            {{ action }}
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Status Update Modal -->
  <div v-if="showModal" class="fixed inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showModal = false"></div>
      
      <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Update PERTEK Status: {{ getActionLabel(selectedTransition) }}
            </h3>

            <form @submit.prevent="submitStatusUpdate" class="mt-4 space-y-4">
              <!-- Notes (always included) -->
              <div>
                <label for="notes" class="block text-sm font-medium text-gray-700">Notes (visible to user)</label>
                <textarea
                  id="notes"
                  v-model="formData.notes"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Provide notes that will be visible to the user"
                ></textarea>
              </div>

              <!-- Admin Notes -->
              <div>
                <label for="adminNotes" class="block text-sm font-medium text-gray-700">Admin Notes (internal only)</label>
                <textarea
                  id="adminNotes"
                  v-model="formData.adminNotes"
                  rows="2"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Internal notes (not visible to users)"
                ></textarea>
              </div>

              <!-- Paparan Date and Location (SCHEDULED_PAPARAN only) -->
              <div v-if="selectedTransition === 'SCHEDULED_PAPARAN'" class="space-y-4">
                <div>
                  <label for="paparanDate" class="block text-sm font-medium text-gray-700">Presentation Date</label>
                  <input 
                    type="datetime-local" 
                    id="paparanDate"
                    v-model="formData.paparanDate"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label for="paparanLocation" class="block text-sm font-medium text-gray-700">Presentation Location</label>
                  <input 
                    type="text" 
                    id="paparanLocation"
                    v-model="formData.paparanLocation"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="e.g., Meeting Room 3, DLH Grobogan"
                    required
                  />
                </div>
              </div>

              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  :class="[
                    'inline-flex justify-center w-full sm:w-auto sm:text-sm px-4 py-2 rounded-md shadow-sm',
                    isSubmitting 
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                  ]"
                >
                  <span v-if="isSubmitting">Processing...</span>
                  <span v-else>Update Status</span>
                </button>
                <button
                  type="button"
                  @click="showModal = false"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm sm:ml-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

interface Pertek {
  id: string;
  status: PertekStatus;
  pertekNumber?: string;
  approvedAt?: Date | string | null;
  paparanDate?: Date | string | null;
  paparanLocation?: string;
  [key: string]: any;
}

interface StatusFormData {
  newStatus: string;
  notes: string;
  adminNotes: string;
  paparanDate?: string;
  paparanLocation?: string;
  [key: string]: any;
}

const props = defineProps({
  pertek: {
    type: Object as () => Pertek,
    required: true
  },
  availableTransitions: {
    type: Array as () => PertekStatus[],
    default: () => []
  },
  nextActions: {
    type: Array as () => string[], 
    default: () => []
  }
})

const emit = defineEmits(['status-updated'])

const showModal = ref(false)
const isSubmitting = ref(false)
const selectedTransition = ref<PertekStatus | ''>('')
const formData = ref<StatusFormData>({
  newStatus: '',
  notes: '',
  adminNotes: '',
  paparanDate: '',
  paparanLocation: ''
})

// Open modal for specific status transition
const openStatusModal = (transition: PertekStatus) => {
  selectedTransition.value = transition
  showModal.value = true
  
  // Reset form data
  formData.value = {
    newStatus: transition,
    notes: '',
    adminNotes: '',
    paparanDate: '',
    paparanLocation: ''
  }
  
  // If the current pertek already has paparan details, pre-fill them
  if (transition === 'SCHEDULED_PAPARAN' && props.pertek.paparanDate) {
    // Format date for the datetime-local input
    const date = new Date(props.pertek.paparanDate)
    // Format to YYYY-MM-DDThh:mm
    const formattedDate = date.toISOString().slice(0, 16)
    
    formData.value.paparanDate = formattedDate
    formData.value.paparanLocation = props.pertek.paparanLocation || ''
  }
}

// Handle form submission
const submitStatusUpdate = async () => {
  isSubmitting.value = true
  
  try {
    // Build request data
    const updateData: StatusFormData = {
      newStatus: selectedTransition.value,
      notes: formData.value.notes,
      adminNotes: formData.value.adminNotes
    }
    
    // Add paparan details if applicable
    if (selectedTransition.value === 'SCHEDULED_PAPARAN') {
      updateData.paparanDate = formData.value.paparanDate
      updateData.paparanLocation = formData.value.paparanLocation
    }
    
    // Call the API to update status
    const response = await fetch(`/api/pertek/admin/${props.pertek.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    const result = await response.json()
    
    if (!response.ok || !result.success) {
      throw new Error(result?.message || 'Failed to update status')
    }
    
    // Emit event to refresh parent component
    emit('status-updated', result.data)
    showModal.value = false
  } catch (error: any) {
    console.error('Failed to update status:', error)
    alert(`Failed to update status: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

// Helpers for UI display
const getStatusClass = (status: PertekStatus | string): string => {
  const classes: Record<PertekStatus, string> = {
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
  
  return classes[status as PertekStatus] || 'bg-gray-100 text-gray-800'
}

const getActionButtonClass = (action: PertekStatus | string): string => {
  const classes: Record<PertekStatus, string> = {
    'SUBMITTED': 'bg-gray-600 hover:bg-gray-700 text-white',
    'VERIFICATION': 'bg-blue-600 hover:bg-blue-700 text-white',
    'INCOMPLETE_REQUIREMENTS': 'bg-red-600 hover:bg-red-700 text-white',
    'COMPLETE_REQUIREMENTS': 'bg-green-600 hover:bg-green-700 text-white',
    'SCHEDULED_PAPARAN': 'bg-purple-600 hover:bg-purple-700 text-white',
    'PAPARAN_COMPLETED': 'bg-yellow-600 hover:bg-yellow-700 text-white',
    'REVISION_SUBMITTED': 'bg-indigo-600 hover:bg-indigo-700 text-white',
    'REVISION_REVIEW': 'bg-blue-600 hover:bg-blue-700 text-white',
    'REVISION_REJECTED': 'bg-red-600 hover:bg-red-700 text-white',
    'REVISION_APPROVED': 'bg-green-600 hover:bg-green-700 text-white',
    'PERTEK_ISSUED': 'bg-emerald-600 hover:bg-emerald-700 text-white',
    'REJECTED': 'bg-red-600 hover:bg-red-700 text-white'
  }
  
  return classes[action as PertekStatus] || 'bg-gray-600 hover:bg-gray-700 text-white'
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
  
  return labels[status as PertekStatus] || String(status)
}

const getActionLabel = (action: PertekStatus | string): string => {
  const labels: Partial<Record<PertekStatus, string>> = {
    'VERIFICATION': 'Start Verification',
    'INCOMPLETE_REQUIREMENTS': 'Mark as Incomplete',
    'COMPLETE_REQUIREMENTS': 'Mark as Complete',
    'SCHEDULED_PAPARAN': 'Schedule Presentation',
    'PAPARAN_COMPLETED': 'Complete Presentation',
    'REVISION_SUBMITTED': 'Review Submission',
    'REVISION_REVIEW': 'Start Revision Review',
    'REVISION_REJECTED': 'Reject Revision',
    'REVISION_APPROVED': 'Approve Revision',
    'SUBMITTED': 'Process Submission',
    'PERTEK_ISSUED': 'View Issued PERTEK',
    'REJECTED': 'Reject PERTEK'
  }
  
  return (action as PertekStatus in labels) ? labels[action as PertekStatus]! : `Change to ${getStatusLabel(action)}`
}
</script>
