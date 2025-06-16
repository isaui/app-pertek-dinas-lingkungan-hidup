<template>
    <div class="space-y-6">
      <!-- Current Status -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Status Saat Ini</h3>
        <div class="flex items-center space-x-4">
          <span :class="getStatusClass(slo.status)" class="px-3 py-2 text-sm font-medium rounded-lg">
            {{ getStatusLabel(slo.status) }}
          </span>
          <span class="text-sm text-gray-500">
            Diperbarui {{ formatDate(slo.updatedAt) }}
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
            <p v-if="adminOverride && formData.newStatus && !availableTransitions.includes(formData.newStatus as SLOStatus)" 
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
            <h4 class="text-lg font-medium text-gray-900 mb-4">
              <span v-if="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED'">Feedback Hasil Verifikasi Lapangan</span>
              <span v-else>Feedback Persyaratan Detail</span>
            </h4>
            <p class="text-sm text-gray-600 mb-4">
              <span v-if="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED'">
                Berikan feedback spesifik berdasarkan hasil verifikasi lapangan untuk membantu pemohon memahami hasil evaluasi dan tindak lanjut yang diperlukan.
              </span>
              <span v-else>
                Berikan feedback spesifik untuk membantu pemohon memperbaiki persyaratan yang tidak sesuai.
              </span>
            </p>
            
            <!-- Add Requirement Feedback -->
            <div class="space-y-4">
              <div v-for="(feedback, index) in formData.requirementFeedbacks" :key="index" 
                   class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start mb-3">
                  <h5 class="text-sm font-medium text-gray-900">
                    <span v-if="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED'">Feedback Verifikasi {{ index + 1 }}</span>
                    <span v-else>Feedback {{ index + 1 }}</span>
                  </h5>
                  <button type="button" @click="removeRequirementFeedback(index)"
                          class="text-red-600 hover:text-red-800 text-sm">
                    Hapus
                  </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <!-- Requirement Type -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      <span v-if="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED'">Kategori Feedback</span>
                      <span v-else">Jenis Persyaratan</span>
                    </label>
                    <select v-model="feedback.requirementType" 
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            required>
                      <option value="">
                        <span v-if="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED'">Pilih kategori feedback</span>
                        <span v-else>Pilih jenis persyaratan</span>
                      </option>
                      <template v-if="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED'">
                        <option value="PERSETUJUAN_TEKNIS">Persetujuan Teknis</option>
                        <option value="HASIL_PEMANTAUAN_EMISI">Hasil Pemantauan Emisi</option>
                        <option value="SERTIFIKAT_REGISTRASI_LAB">Sertifikat Registrasi Lab</option>
                        <option value="PERSETUJUAN_LINGKUNGAN">Persetujuan Lingkungan</option>
                        <option value="DOK_PERIZINAN_BERUSAHA">Dokumen Perizinan Berusaha</option>
                        <option value="DOKUMEN_REVISI">Dokumen Revisi</option>
                        <option value="OTHER">Lainnya</option>
                      </template>
                      <template v-else>
                        <option value="DOK_PERIZINAN_BERUSAHA">Dokumen Perizinan Berusaha</option>
                        <option value="PERSETUJUAN_LINGKUNGAN">Persetujuan Lingkungan</option>
                        <option value="PERSETUJUAN_TEKNIS">Persetujuan Teknis</option>
                        <option value="HASIL_PEMANTAUAN_EMISI">Hasil Pemantauan Emisi</option>
                        <option value="SERTIFIKAT_REGISTRASI_LAB">Sertifikat Registrasi Laboratorium Penguji</option>
                        <option value="DOKUMEN_REVISI">Dokumen Revisi</option>
                        <option value="OTHER">Lainnya</option>
                      </template>
                    </select>
                  </div>
                  
                  <!-- Related Document (Optional) -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dokumen Terkait (Opsional)</label>
                    <select v-model="feedback.documentId" 
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm">
                      <option value="">
                        <span v-if="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED'">Feedback umum verifikasi</span>
                        <span v-else">Feedback umum (tidak terkait dokumen spesifik)</span>
                      </option>
                      <option v-for="doc in availableDocuments" :key="doc.id" :value="doc.id">
                        {{ doc.filename }} ({{ getDocumentTypeLabel(doc.type) }})
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- Feedback Text -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    <span v-if="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED'">Detail Feedback Verifikasi</span>
                    <span v-else">Detail Feedback</span>
                  </label>
                  <textarea v-model="feedback.feedbackText" 
                            rows="3"
                            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            :placeholder="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED' 
                              ? 'Jelaskan hasil evaluasi dari verifikasi lapangan, rekomendasi, atau catatan penting lainnya' 
                              : 'Jelaskan secara detail apa yang perlu diperbaiki atau dilengkapi'"
                            required></textarea>
                </div>
              </div>
              
              <!-- Add New Feedback Button -->
              <button type="button" @click="addRequirementFeedback"
                      class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span v-if="formData.newStatus === 'FIELD_VERIFICATION_COMPLETED'">+ Tambah Feedback Verifikasi</span>
                <span v-else>+ Tambah Feedback Persyaratan</span>
              </button>
            </div>
          </div>
  
          <!-- Conditional Fields Based on Status -->
          
          <!-- Verifikasi Details for FIELD_VERIFICATION_SCHEDULED only -->
          <div v-if="formData.newStatus === 'FIELD_VERIFICATION_SCHEDULED'" class="border-t pt-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Detail Verifikasi Lapangan</h4>
            <p class="text-sm text-gray-600 mb-4">
              Jadwalkan sesi verifikasi lapangan dengan pemohon dan upload surat undangan.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="verifikasiDate" class="block text-sm font-medium text-gray-700 mb-2">Tanggal & Waktu Verifikasi</label>
                <input 
                  type="datetime-local" 
                  id="verifikasiDate"
                  v-model="formData.verifikasiDate"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  :required="!adminOverride"
                />
              </div>
              
              <div>
                <label for="verifikasiLocation" class="block text-sm font-medium text-gray-700 mb-2">Lokasi Verifikasi</label>
                <input 
                  type="text" 
                  id="verifikasiLocation"
                  v-model="formData.verifikasiLocation"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Contoh: Kantor Perusahaan/Lokasi Fasilitas"
                  :required="!adminOverride"
                />
              </div>
            </div>
            
            <div class="mt-4">
              <label for="suratUndangan" class="block text-sm font-medium text-gray-700 mb-2">Upload Surat Undangan Verifikasi</label>
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
  
          <!-- SLO Final Document for SLO_ISSUED -->
          <div v-if="formData.newStatus === 'SLO_ISSUED'" class="border-t pt-6">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Penerbitan SLO</h4>
            <p class="text-sm text-gray-600 mb-4">
              Terbitkan SLO resmi dengan mengupload dokumen final yang sudah ditandatangani.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="sloNumber" class="block text-sm font-medium text-gray-700 mb-2">Nomor SLO</label>
                <input 
                  type="text" 
                  id="sloNumber"
                  v-model="formData.sloNumber"
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Contoh: SLO/2025/VII/001"
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
              <label for="sloFinal" class="block text-sm font-medium text-gray-700 mb-2">Upload Dokumen SLO Final</label>
              <input 
                type="file" 
                id="sloFinal"
                ref="sloFinalInput"
                @change="handleSloFinalUpload"
                accept=".pdf"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                :required="!adminOverride"
              />
              <p class="mt-1 text-xs text-gray-500">Hanya format PDF yang diterima untuk dokumen SLO final yang sudah ditandatangani</p>
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
  type SLOStatus = 
    | 'SUBMITTED'
    | 'VERIFICATION'
    | 'INCOMPLETE_REQUIREMENTS'
    | 'COMPLETE_REQUIREMENTS'
    | 'FIELD_VERIFICATION_SCHEDULED'
    | 'FIELD_VERIFICATION_COMPLETED'
    | 'REVISION_SUBMITTED'
    | 'REVISION_REVIEW'
    | 'REVISION_REJECTED'
    | 'REVISION_APPROVED'
    | 'SLO_ISSUED'
    | 'REJECTED';
  
  const props = defineProps({
    slo: {
      type: Object,
      required: true
    },
    availableTransitions: {
      type: Array as () => SLOStatus[],
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
  const allStatuses: SLOStatus[] = [
    'SUBMITTED',
    'VERIFICATION', 
    'INCOMPLETE_REQUIREMENTS',
    'COMPLETE_REQUIREMENTS',
    'FIELD_VERIFICATION_SCHEDULED',
    'FIELD_VERIFICATION_COMPLETED',
    'REVISION_SUBMITTED',
    'REVISION_REVIEW',
    'REVISION_REJECTED',
    'REVISION_APPROVED',
    'SLO_ISSUED',
    'REJECTED'
  ]
  
  // Form data
  const formData = ref({
    newStatus: '',
    notes: '',
    verifikasiDate: '',
    verifikasiLocation: '',
    sloNumber: '',
    approvalDate: '',
    suratUndanganFile: null as File | null,
    sloFinalFile: null as File | null,
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
  const sloFinalInput = ref<HTMLInputElement>()
  
  // Handle admin override mode change
  const onOverrideModeChange = () => {
    formData.value.newStatus = ''
    
    // Admin override mode enabled
  }
  
  // Handle status change
  const onStatusChange = () => {
    if (formData.value.newStatus === 'FIELD_VERIFICATION_SCHEDULED' && props.slo.verifikasiDate) {
      const date = new Date(props.slo.verifikasiDate)
      formData.value.verifikasiDate = date.toISOString().slice(0, 16)
      formData.value.verifikasiLocation = props.slo.verifikasiLocation || ''
    }
    
    // Auto add first requirement feedback for statuses that need it
    if (needsRequirementFeedback(formData.value.newStatus) && formData.value.requirementFeedbacks.length === 0) {
      addRequirementFeedback()
    }
  }
  
  // Check if status needs requirement feedback - HOTFIX: Added FIELD_VERIFICATION_COMPLETED
  const needsRequirementFeedback = (status: string) => {
    return ['INCOMPLETE_REQUIREMENTS', 'REVISION_REJECTED', 'FIELD_VERIFICATION_COMPLETED'].includes(status)
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
  
  const handleSloFinalUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.files && target.files[0]) {
      formData.value.sloFinalFile = target.files[0]
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
      
      // Add verifikasi details only for FIELD_VERIFICATION_SCHEDULED
      if (formData.value.newStatus === 'FIELD_VERIFICATION_SCHEDULED') {
        if (formData.value.verifikasiDate) {
          requestData.append('verifikasiDate', formData.value.verifikasiDate)
        }
        if (formData.value.verifikasiLocation) {
          requestData.append('verifikasiLocation', formData.value.verifikasiLocation)
        }
      }
      
      // Add SLO issuance details for SLO_ISSUED
      if (formData.value.newStatus === 'SLO_ISSUED') {
        if (formData.value.sloNumber) {
          requestData.append('sloNumber', formData.value.sloNumber)
        }
        if (formData.value.approvalDate) {
          requestData.append('approvalDate', formData.value.approvalDate)
        }
      }
      
      if (formData.value.suratUndanganFile) {
        requestData.append('suratUndangan', formData.value.suratUndanganFile)
      }
      
      if (formData.value.sloFinalFile) {
        requestData.append('sloFinal', formData.value.sloFinalFile)
      }
      
      const response = await fetch(`/api/slo/admin/${props.slo.id}/status`, {
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
        verifikasiDate: '',
        verifikasiLocation: '',
        sloNumber: '',
        approvalDate: '',
        suratUndanganFile: null,
        sloFinalFile: null,
        requirementFeedbacks: []
      }
      
      adminOverride.value = false
      
      if (suratUndanganInput.value) suratUndanganInput.value.value = ''
      if (sloFinalInput.value) sloFinalInput.value.value = ''
      
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
      'FIELD_VERIFICATION_SCHEDULED': 'bg-purple-100 text-purple-800',
      'FIELD_VERIFICATION_COMPLETED': 'bg-yellow-100 text-yellow-800',
      'REVISION_SUBMITTED': 'bg-indigo-100 text-indigo-800',
      'REVISION_REVIEW': 'bg-blue-100 text-blue-800',
      'REVISION_REJECTED': 'bg-red-100 text-red-800',
      'REVISION_APPROVED': 'bg-green-100 text-green-800',
      'SLO_ISSUED': 'bg-emerald-100 text-emerald-800',
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
      'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi Lapangan Dijadwalkan',
      'FIELD_VERIFICATION_COMPLETED': 'Verifikasi Lapangan Selesai',
      'REVISION_SUBMITTED': 'Revisi Disubmit',
      'REVISION_REVIEW': 'Review Revisi',
      'REVISION_REJECTED': 'Revisi Ditolak',
      'REVISION_APPROVED': 'Revisi Disetujui',
      'SLO_ISSUED': 'SLO Diterbitkan',
      'REJECTED': 'Ditolak'
    }
    
    return labels[status] || status
  }
  
  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'PERSYARATAN': 'Dokumen Persyaratan',
      'REVISI': 'Dokumen Revisi',
      'SURAT_UNDANGAN_VERIFIKASI': 'Surat Undangan Verifikasi',
      'SLO_FINAL': 'Dokumen SLO Final'
    }
    
    return types[type] || type
  }
  </script>