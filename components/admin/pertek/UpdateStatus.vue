<template>
    <div class="space-y-6">
      <!-- Current Status -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Status Saat Ini</h3>
        <div class="flex items-center space-x-4">
          <span :class="getStatusClass(pertek.status)" class="px-3 py-2 text-sm font-medium rounded-lg">
            {{ getStatusLabel(pertek.status) }}
          </span>
          <span class="text-sm text-gray-500">
            Diperbarui {{ formatDate(pertek.updatedAt) }}
          </span>
        </div>
      </div>
  
      <!-- Update Status Form -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Ubah Status</h3>
        
        <form @submit.prevent="submitStatusUpdate" class="space-y-6">
          <!-- Admin Override Mode -->
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <label class="flex items-start space-x-3">
              <input 
                type="checkbox" 
                v-model="adminOverride" 
                @change="onOverrideModeChange"
                class="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              >
              <div class="text-sm">
                <div class="font-medium text-red-700">Mode Bypass Admin</div>
                <div class="text-red-600">
                  Lewati validasi workflow normal. Gunakan hanya untuk kasus khusus atau mendesak.
                </div>
              </div>
            </label>
          </div>
  
          <!-- New Status Selection -->
          <div>
            <label for="newStatus" class="block text-sm font-medium text-gray-700 mb-2">
              Status Baru
              <span v-if="adminOverride" class="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                MODE BYPASS
              </span>
            </label>
            <select 
              id="newStatus" 
              v-model="formData.newStatus"
              @change="onStatusChange"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Pilih status baru</option>
              <template v-if="adminOverride">
                <option v-for="status in allStatuses" :key="status" :value="status" 
                        :class="{'text-red-600': !availableTransitions.includes(status)}">
                  {{ getStatusLabel(status) }}
                  <span v-if="!availableTransitions.includes(status)"> (BYPASS)</span>
                  <span v-if="status === 'SUBMITTED' || status === 'REVISION_SUBMITTED'"> (Diupdate oleh sistem)</span>
                </option>
              </template>
              <template v-else>
                <option v-for="status in availableTransitions" :key="status" :value="status">
                  {{ getStatusLabel(status) }}
                  <span v-if="status === 'SUBMITTED' || status === 'REVISION_SUBMITTED'"> (Diupdate oleh sistem)</span>
                </option>
              </template>
            </select>
            <p v-if="formData.newStatus === 'SUBMITTED' || formData.newStatus === 'REVISION_SUBMITTED'" 
               class="mt-1 text-xs text-blue-600">
              <i class="fas fa-info-circle mr-1"></i> Status ini diupdate oleh sistem secara otomatis saat aksi terkait dilakukan, bukan diubah manual oleh admin.
            </p>
            <p v-if="adminOverride && formData.newStatus && !availableTransitions.includes(formData.newStatus as PertekStatus)" 
               class="mt-1 text-xs text-red-600">
              Status ini melewati validasi workflow normal
            </p>
          </div>
  
          <!-- Feedback to User -->
          <div>
            <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
              Feedback Umum untuk Pemohon
            </label>
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="3"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Berikan feedback umum yang akan dilihat oleh pemohon (opsional)"
            ></textarea>
          </div>
  
          <!-- Requirement Feedback (untuk status yang butuh feedback detail) -->
          <div v-if="needsRequirementFeedback(formData.newStatus)" class="border-t pt-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Feedback Persyaratan Detail</h4>
            <p class="text-sm text-gray-600 mb-4">
              Berikan feedback spesifik untuk membantu pemohon memperbaiki persyaratan yang tidak sesuai.
            </p>
            
            <!-- Add Requirement Feedback -->
            <div class="space-y-4">
              <div v-for="(feedback, index) in formData.requirementFeedbacks" :key="index" 
                   class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start mb-3">
                  <h5 class="text-sm font-medium text-gray-900">Feedback {{ index + 1 }}</h5>
                  <button type="button" @click="removeRequirementFeedback(index)"
                          class="text-red-600 hover:text-red-800 text-sm">
                    Hapus
                  </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <!-- Requirement Type -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Persyaratan</label>
                    <select v-model="feedback.requirementType" 
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            required>
                      <option value="">Pilih jenis persyaratan</option>
                      <option value="SURAT_PERMOHONAN">Surat Permohonan</option>
                      <option value="DOKUMEN_AMDAL_UKL_UPL">Dokumen AMDAL/UKL-UPL</option>
                      <option value="DOKUMEN_TEKNIS">Dokumen Teknis</option>
                      <option value="DOKUMEN_REVISI">Dokumen Revisi</option>
                      <option value="OTHER">Lainnya</option>
                    </select>
                  </div>
                  
                  <!-- Related Document (Optional) -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dokumen Terkait (Opsional)</label>
                    <select v-model="feedback.documentId" 
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                      <option value="">Feedback umum (tidak terkait dokumen spesifik)</option>
                      <option v-for="doc in availableDocuments" :key="doc.id" :value="doc.id">
                        {{ doc.filename }} ({{ getDocumentTypeLabel(doc.type) }})
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Feedback Text -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Detail Feedback</label>
                  <textarea v-model="feedback.feedbackText" 
                            rows="3"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            placeholder="Jelaskan secara detail apa yang perlu diperbaiki atau dilengkapi"
                            required></textarea>
                </div>
              </div>
              
              <!-- Add New Feedback Button -->
              <button type="button" @click="addRequirementFeedback"
                      class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                + Tambah Feedback Persyaratan
              </button>
            </div>
          </div>
  
          <!-- Conditional Fields Based on Status -->
          
          <!-- Paparan Details for SCHEDULED_PAPARAN only -->
          <div v-if="formData.newStatus === 'SCHEDULED_PAPARAN'" class="border-t pt-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Detail Paparan</h4>
            <p class="text-sm text-gray-600 mb-4">
              Jadwalkan sesi paparan dengan pemohon dan upload surat undangan.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="paparanDate" class="block text-sm font-medium text-gray-700 mb-2">Tanggal & Waktu Paparan</label>
                <input 
                  type="datetime-local" 
                  id="paparanDate"
                  v-model="formData.paparanDate"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  :required="!adminOverride"
                />
              </div>
              
              <div>
                <label for="paparanLocation" class="block text-sm font-medium text-gray-700 mb-2">Lokasi Paparan</label>
                <input 
                  type="text" 
                  id="paparanLocation"
                  v-model="formData.paparanLocation"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Contoh: Ruang Rapat 3, DLH Grobogan"
                  :required="!adminOverride"
                />
              </div>
            </div>
            
            <div class="mt-4">
              <label for="suratUndangan" class="block text-sm font-medium text-gray-700 mb-2">Upload Surat Undangan Paparan</label>
              <input 
                type="file" 
                id="suratUndangan"
                ref="suratUndanganInput"
                @change="handleSuratUndanganUpload"
                accept=".pdf,.doc,.docx"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                :required="!adminOverride"
              />
              <p class="mt-1 text-xs text-gray-500">Format yang diterima: PDF, DOC, DOCX</p>
            </div>
          </div>
  
          <!-- PERTEK Final Document for PERTEK_ISSUED -->
          <div v-if="formData.newStatus === 'PERTEK_ISSUED'" class="border-t pt-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Penerbitan PERTEK</h4>
            <p class="text-sm text-gray-600 mb-4">
              Terbitkan PERTEK resmi dengan mengupload dokumen final yang sudah ditandatangani.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="pertekNumber" class="block text-sm font-medium text-gray-700 mb-2">Nomor PERTEK</label>
                <input 
                  type="text" 
                  id="pertekNumber"
                  v-model="formData.pertekNumber"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Contoh: PERTEK/2025/VII/001"
                  :required="!adminOverride"
                />
              </div>
              
              <div>
                <label for="approvalDate" class="block text-sm font-medium text-gray-700 mb-2">Tanggal Persetujuan</label>
                <input 
                  type="date" 
                  id="approvalDate"
                  v-model="formData.approvalDate"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p class="mt-1 text-xs text-gray-500">Kosongkan untuk menggunakan tanggal hari ini</p>
              </div>
            </div>
            
            <div>
              <label for="pertekFinal" class="block text-sm font-medium text-gray-700 mb-2">Upload Dokumen PERTEK Final</label>
              <input 
                type="file" 
                id="pertekFinal"
                ref="pertekFinalInput"
                @change="handlePertekFinalUpload"
                accept=".pdf"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                :required="!adminOverride"
              />
              <p class="mt-1 text-xs text-gray-500">Hanya format PDF yang diterima untuk dokumen PERTEK final yang sudah ditandatangani</p>
            </div>
          </div>
  
          <!-- Submit Button -->
          <div class="flex justify-end pt-4">
            <button
              type="submit"
              :disabled="isSubmitting || !formData.newStatus"
              :class="[
                'inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white',
                isSubmitting || !formData.newStatus
                  ? 'bg-gray-300 cursor-not-allowed'
                  : adminOverride
                    ? 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              ]"
            >
              <span v-if="isSubmitting">
                <div class="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Memproses...
              </span>
              <span v-else-if="adminOverride">
                BYPASS - Ubah Status
              </span>
              <span v-else>Ubah Status</span>
            </button>
          </div>
        </form>
      </div>
  
      <!-- Next Actions Guide -->
      <div v-if="nextActions.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Panduan Tindakan Selanjutnya</h4>
        <ul class="text-sm text-blue-800 space-y-1">
          <li v-for="(action, index) in nextActions" :key="index" class="flex items-start">
            <span class="text-blue-500 mr-2">•</span>
            {{ action }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  // Define types
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
  
  const props = defineProps({
    pertek: {
      type: Object,
      required: true
    },
    availableTransitions: {
      type: Array as () => PertekStatus[],
      default: () => []
    },
    nextActions: {
      type: Array as () => string[], 
      default: () => []
    },
    documents: {
      type: Array as () => Array<{
        id: string
        filename: string
        type: string
        size?: number
        uploadedAt?: string
        description?: string
      }>,
      default: () => []
    }
  })
  
  const emit = defineEmits(['status-updated'])
  
  // All possible statuses for override mode
  const allStatuses: PertekStatus[] = [
    'SUBMITTED',
    'VERIFICATION', 
    'INCOMPLETE_REQUIREMENTS',
    'COMPLETE_REQUIREMENTS',
    'SCHEDULED_PAPARAN',
    'PAPARAN_COMPLETED',
    'REVISION_SUBMITTED',
    'REVISION_REVIEW',
    'REVISION_REJECTED',
    'REVISION_APPROVED',
    'PERTEK_ISSUED',
    'REJECTED'
  ]
  
  // Form data
  const formData = ref({
    newStatus: '',
    notes: '',
    paparanDate: '',
    paparanLocation: '',
    pertekNumber: '',
    approvalDate: '',
    suratUndanganFile: null as File | null,
    pertekFinalFile: null as File | null,
    requirementFeedbacks: [] as Array<{
      requirementType: string,
      documentId: string,
      feedbackText: string
    }>
  })
  
  const isSubmitting = ref(false)
  const adminOverride = ref(false)
  
  // Available documents for feedback
  const availableDocuments = computed(() => {
    return props.documents || []
  })
  
  // Refs for file inputs
  const suratUndanganInput = ref<HTMLInputElement>()
  const pertekFinalInput = ref<HTMLInputElement>()
  
  // Handle admin override mode change
  const onOverrideModeChange = () => {
    formData.value.newStatus = ''
    
    // Admin override mode enabled
  }
  
  // Handle status change
  const onStatusChange = () => {
    if (formData.value.newStatus === 'SCHEDULED_PAPARAN' && props.pertek.paparanDate) {
      const date = new Date(props.pertek.paparanDate)
      formData.value.paparanDate = date.toISOString().slice(0, 16)
      formData.value.paparanLocation = props.pertek.paparanLocation || ''
    }
    
    // Auto add first requirement feedback for statuses that need it
    if (needsRequirementFeedback(formData.value.newStatus) && formData.value.requirementFeedbacks.length === 0) {
      addRequirementFeedback()
    }
  }
  
  // Check if status needs requirement feedback
  const needsRequirementFeedback = (status: string) => {
    return ['INCOMPLETE_REQUIREMENTS', 'REVISION_REJECTED'].includes(status)
  }
  
  // Add requirement feedback
  const addRequirementFeedback = () => {
    formData.value.requirementFeedbacks.push({
      requirementType: '',
      documentId: '',
      feedbackText: ''
    })
  }
  
  // Remove requirement feedback
  const removeRequirementFeedback = (index: number) => {
    formData.value.requirementFeedbacks.splice(index, 1)
  }
  
  // File upload handlers
  const handleSuratUndanganUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
      formData.value.suratUndanganFile = target.files[0]
    }
  }
  
  const handlePertekFinalUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
      formData.value.pertekFinalFile = target.files[0]
    }
  }
  
  // Submit form
  const submitStatusUpdate = async () => {
    isSubmitting.value = true
    
    try {
      const requestData = new FormData()
      requestData.append('newStatus', formData.value.newStatus)
      requestData.append('notes', formData.value.notes)
      requestData.append('adminOverride', adminOverride.value.toString())
      
      // Add requirement feedbacks
      if (formData.value.requirementFeedbacks.length > 0) {
        requestData.append('requirementFeedbacks', JSON.stringify(formData.value.requirementFeedbacks))
      }
      
      // Add paparan details only for SCHEDULED_PAPARAN
      if (formData.value.newStatus === 'SCHEDULED_PAPARAN') {
        if (formData.value.paparanDate) {
          requestData.append('paparanDate', formData.value.paparanDate)
        }
        if (formData.value.paparanLocation) {
          requestData.append('paparanLocation', formData.value.paparanLocation)
        }
      }
      
      // Add PERTEK issuance details for PERTEK_ISSUED
      if (formData.value.newStatus === 'PERTEK_ISSUED') {
        if (formData.value.pertekNumber) {
          requestData.append('pertekNumber', formData.value.pertekNumber)
        }
        if (formData.value.approvalDate) {
          requestData.append('approvalDate', formData.value.approvalDate)
        }
      }
      
      if (formData.value.suratUndanganFile) {
        requestData.append('suratUndangan', formData.value.suratUndanganFile)
      }
      
      if (formData.value.pertekFinalFile) {
        requestData.append('pertekFinal', formData.value.pertekFinalFile)
      }
      
      const response = await fetch(`/api/pertek/admin/${props.pertek.id}/status`, {
        method: 'PUT',
        body: requestData
      })
  
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result?.message || 'Gagal mengubah status')
      }
      
      // Reset form
      formData.value = {
        newStatus: '',
        notes: '',
        paparanDate: '',
        paparanLocation: '',
        pertekNumber: '',
        approvalDate: '',
        suratUndanganFile: null,
        pertekFinalFile: null,
        requirementFeedbacks: []
      }
      
      adminOverride.value = false
      
      if (suratUndanganInput.value) suratUndanganInput.value.value = ''
      if (pertekFinalInput.value) pertekFinalInput.value.value = ''
      
      emit('status-updated', result.data)
      
    } catch (error: any) {
      console.error('Failed to update status:', error)
      alert(`Gagal mengubah status: ${error.message}`)
    } finally {
      isSubmitting.value = false
    }
  }
  
  // Helper functions
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Tidak tersedia'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date)
  }
  
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
  
  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'PERSYARATAN': 'Dokumen Persyaratan',
      'REVISI': 'Dokumen Revisi',
      'SURAT_UNDANGAN_PAPARAN': 'Surat Undangan Paparan',
      'PERTEK_FINAL': 'Dokumen PERTEK Final'
    }
    
    return types[type] || type
  }
  </script>