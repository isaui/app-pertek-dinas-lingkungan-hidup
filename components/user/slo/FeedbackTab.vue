<template>
    <div class="space-y-6">
      <!-- Header with Summary -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-medium text-slate-900">Feedback Persyaratan</h3>
            <p class="mt-1 text-sm text-slate-500">
              Daftar feedback yang perlu ditindaklanjuti untuk permohonan SLO Anda
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-amber-600">{{ activeFeedbackCount }}</div>
              <div class="text-xs text-slate-500">Perlu Tindak Lanjut</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">{{ resolvedFeedbackCount }}</div>
              <div class="text-xs text-slate-500">Sudah Selesai</div>
            </div>
          </div>
        </div>
  
        <!-- Quick Actions -->
        <div v-if="activeFeedbackCount > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="h-5 w-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-sm font-medium text-amber-800">
                {{ activeFeedbackCount }} feedback perlu ditindaklanjuti
              </span>
            </div>
            <div class="flex space-x-2">
              <button @click="markAllAsResolved" 
                      :disabled="isProcessing"
                      class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                <span v-if="isProcessing">Memproses...</span>
                <span v-else>Tandai Semua Selesai</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Filter and Sort Controls -->
      <div class="bg-white border border-slate-200 rounded-lg p-4">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Filter by Type -->
          <div>
            <label for="type-filter" class="block text-sm font-medium text-slate-700 mb-1">Filter Tipe</label>
            <select v-model="selectedType" 
                    id="type-filter"
                    class="block w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-slate-500 focus:border-slate-500">
              <option value="">Semua Tipe</option>
              <option v-for="type in requirementTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
  
          <!-- Filter by Status -->
          <div>
            <label for="status-filter" class="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select v-model="selectedStatus" 
                    id="status-filter"
                    class="block w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-slate-500 focus:border-slate-500">
              <option value="">Semua Status</option>
              <option value="active">Perlu Tindak Lanjut</option>
              <option value="resolved">Sudah Selesai</option>
            </select>
          </div>
  
          <!-- Sort -->
          <div>
            <label for="sort-filter" class="block text-sm font-medium text-slate-700 mb-1">Urutkan</label>
            <select v-model="selectedSort" 
                    id="sort-filter"
                    class="block w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-slate-500 focus:border-slate-500">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="type">Tipe</option>
            </select>
          </div>
  
          <!-- Reset Filters -->
          <div class="self-end">
            <button @click="resetFilters" 
                    class="px-3 py-2 text-sm border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50">
              Reset
            </button>
          </div>
        </div>
      </div>
  
      <!-- Feedback List -->
      <div v-if="filteredFeedback.length === 0" class="bg-white border border-slate-200 rounded-lg p-8">
        <div class="text-center text-slate-500">
          <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4.165c0-1.358.104-2.646.313-3.843l1.313-7.546A8 8 0 0121 12z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-slate-900">
            {{ selectedStatus ? 'Tidak ada feedback dengan filter tersebut' : 'Belum ada feedback' }}
          </h3>
          <p class="mt-1 text-sm text-slate-500">
            {{ selectedStatus ? 'Coba ubah filter untuk melihat feedback lainnya.' : 'Feedback akan muncul di sini ketika admin memberikan masukan.' }}
          </p>
        </div>
      </div>
  
      <!-- Feedback Cards -->
      <div v-else class="space-y-4">
        <div v-for="feedback in filteredFeedback" :key="feedback.id"
             :class="[
               'bg-white border rounded-lg p-6 transition-all',
               feedback.isResolved 
                 ? 'border-green-200 bg-green-50' 
                 : 'border-amber-200 bg-amber-50'
             ]">
          
          <!-- Feedback Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div :class="[
                'p-2 rounded-lg',
                feedback.isResolved 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-amber-100 text-amber-600'
              ]">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.013 8.013 0 01-7-4.165c0-1.358.104-2.646.313-3.843l1.313-7.546A8 8 0 0121 12z" />
                </svg>
              </div>
              <div>
                <div class="flex items-center space-x-2 mb-1">
                  <span :class="getRequirementTypeClass(feedback.requirementType)"
                        class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ getRequirementTypeLabel(feedback.requirementType) }}
                  </span>
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    feedback.isResolved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  ]">
                    {{ feedback.isResolved ? 'Sudah Selesai' : 'Perlu Tindak Lanjut' }}
                  </span>
                </div>
                <div class="text-xs text-slate-500">
                  {{ formatDateTime(feedback.createdAt) }}
                  <span v-if="feedback.resolvedAt" class="ml-2">
                    • Selesai {{ formatDateTime(feedback.resolvedAt) }}
                  </span>
                </div>
              </div>
            </div>
  
            <!-- Action Button -->
            <div v-if="!feedback.isResolved">
              <button @click="resolveFeedback(feedback.id)"
                      :disabled="isProcessing"
                      class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center">
                <svg v-if="isProcessing" class="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="isProcessing">Memproses...</span>
                <span v-else>Tandai Selesai</span>
              </button>
            </div>
          </div>
  
          <!-- Feedback Content -->
          <div class="mb-4">
            <div :class="[
              'text-sm leading-relaxed p-4 rounded-lg border',
              feedback.isResolved 
                ? 'bg-white border-green-200 text-slate-700' 
                : 'bg-white border-amber-200 text-slate-700'
            ]">
              {{ feedback.feedbackText }}
            </div>
          </div>
  
          <!-- Related Document -->
          <div v-if="feedback.document" 
               class="bg-white border border-slate-200 rounded-lg p-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="text-slate-400">
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div class="text-sm font-medium text-slate-900">{{ feedback.document.filename }}</div>
                  <div class="text-xs text-slate-500">
                    {{ getDocumentTypeLabel(feedback.document.type) }}
                    <span v-if="feedback.document.expired" class="ml-2 text-red-600 font-medium">
                      (Kedaluwarsa)
                    </span>
                  </div>
                </div>
              </div>
              <button @click="downloadDocument(feedback.document)"
                      class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Actions for Active Feedback -->
      <div v-if="activeFeedbackCount > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Langkah Selanjutnya</h4>
        <div class="text-sm text-blue-800 space-y-2">
          <p>• Baca dan pahami setiap feedback yang diberikan</p>
          <p>• Lakukan perbaikan sesuai dengan feedback</p>
          <p>• Upload dokumen yang diperbaiki jika diperlukan</p>
          <p>• Tandai feedback sebagai selesai setelah ditindaklanjuti</p>
        </div>
        <div class="mt-3 flex space-x-2">
          <button @click="$emit('switch-tab', 'requirements')"
                  v-if="canUpdateRequirements"
                  class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
            Update Persyaratan
          </button>
          <button @click="$emit('switch-tab', 'revision')"
                  v-if="canUploadRevision"
                  class="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Upload Revisi
          </button>
          <button @click="$emit('switch-tab', 'documents')"
                  class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
            Kelola Dokumen
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  const props = defineProps({
    feedback: {
      type: Array,
      default: () => []
    },
    sloId: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['feedback-resolved', 'all-feedback-resolved', 'switch-tab'])
  
  // State
  const isProcessing = ref(false)
  const selectedType = ref('')
  const selectedStatus = ref('')
  const selectedSort = ref('newest')
  
  // Requirement types specific to SLO
  const requirementTypes = [
    { value: 'DOK_PERIZINAN_BERUSAHA', label: 'Dokumen Perizinan Berusaha' },
    { value: 'PERSETUJUAN_LINGKUNGAN', label: 'Persetujuan Lingkungan' },
    { value: 'PERSETUJUAN_TEKNIS', label: 'Persetujuan Teknis' },
    { value: 'HASIL_PEMANTAUAN_EMISI', label: 'Hasil Pemantauan Emisi' },
    { value: 'SERTIFIKAT_REGISTRASI_LAB', label: 'Sertifikat Registrasi Laboratorium' },
    { value: 'DOKUMEN_REVISI', label: 'Dokumen Revisi' },
    { value: 'OTHER', label: 'Lainnya' }
  ]
  
  // Computed properties
  const activeFeedbackCount = computed(() => {
    return props.feedback.filter(f => !f.isResolved).length
  })
  
  const resolvedFeedbackCount = computed(() => {
    return props.feedback.filter(f => f.isResolved).length
  })
  
  const filteredFeedback = computed(() => {
    let filtered = [...props.feedback]
  
    // Filter by type
    if (selectedType.value) {
      filtered = filtered.filter(f => f.requirementType === selectedType.value)
    }
  
    // Filter by status
    if (selectedStatus.value === 'active') {
      filtered = filtered.filter(f => !f.isResolved)
    } else if (selectedStatus.value === 'resolved') {
      filtered = filtered.filter(f => f.isResolved)
    }
  
    // Sort
    if (selectedSort.value === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (selectedSort.value === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (selectedSort.value === 'type') {
      filtered.sort((a, b) => a.requirementType.localeCompare(b.requirementType))
    }
  
    return filtered
  })
  
  const canUpdateRequirements = computed(() => {
    // This should be passed from parent or computed based on SLO status
    return true // Placeholder
  })
  
  const canUploadRevision = computed(() => {
    // This should be passed from parent or computed based on SLO status
    return true // Placeholder
  })
  
  // Methods
  const resolveFeedback = async (feedbackId) => {
    try {
      isProcessing.value = true
      
      const response = await $fetch(`/api/slo/feedback/${feedbackId}/resolve`, {
        method: 'PUT'
      })
      
      if (response.success) {
        emit('feedback-resolved', feedbackId)
      }
    } catch (error) {
      console.error('Error resolving feedback:', error)
      alert('Gagal menandai feedback sebagai selesai')
    } finally {
      isProcessing.value = false
    }
  }
  
  const markAllAsResolved = async () => {
    if (!confirm('Apakah Anda yakin ingin menandai semua feedback sebagai selesai?')) {
      return
    }
    
    try {
      isProcessing.value = true
      const activeFeedbacks = props.feedback.filter(f => !f.isResolved)
      
      // Resolve all active feedbacks
      for (const feedback of activeFeedbacks) {
        await $fetch(`/api/slo/feedback/${feedback.id}/resolve`, {
          method: 'PUT'
        })
      }
      
      const resolvedIds = activeFeedbacks.map(f => f.id)
      emit('all-feedback-resolved', resolvedIds)
      
    } catch (error) {
      console.error('Error resolving all feedback:', error)
      alert('Gagal menandai semua feedback sebagai selesai')
    } finally {
      isProcessing.value = false
    }
  }
  
  const resetFilters = () => {
    selectedType.value = ''
    selectedStatus.value = ''
    selectedSort.value = 'newest'
  }
  
  const downloadDocument = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }
  
  // Helper functions
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(date) + ' (hari ini)'
    } else if (diffInHours < 48) {
      return 'Kemarin, ' + new Intl.DateTimeFormat('id-ID', { timeStyle: 'short' }).format(date)
    } else {
      return new Intl.DateTimeFormat('id-ID', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      }).format(date)
    }
  }
  
  const getRequirementTypeLabel = (type) => {
    const typeOption = requirementTypes.find(t => t.value === type)
    return typeOption ? typeOption.label : type
  }
  
  const getRequirementTypeClass = (type) => {
    const classes = {
      'DOK_PERIZINAN_BERUSAHA': 'bg-blue-100 text-blue-800',
      'PERSETUJUAN_LINGKUNGAN': 'bg-green-100 text-green-800',
      'PERSETUJUAN_TEKNIS': 'bg-purple-100 text-purple-800',
      'HASIL_PEMANTAUAN_EMISI': 'bg-yellow-100 text-yellow-800',
      'SERTIFIKAT_REGISTRASI_LAB': 'bg-indigo-100 text-indigo-800',
      'DOKUMEN_REVISI': 'bg-orange-100 text-orange-800',
      'OTHER': 'bg-slate-100 text-slate-800'
    }
    
    return classes[type] || 'bg-slate-100 text-slate-800'
  }
  
  const getDocumentTypeLabel = (type) => {
    const types = {
      'PERSYARATAN': 'Dokumen Persyaratan',
      'REVISI': 'Dokumen Revisi',
      'SURAT_UNDANGAN_VERIFIKASI': 'Surat Undangan Verifikasi',
      'SLO_FINAL': 'Dokumen SLO Final'
    }
    
    return types[type] || type
  }
  </script>