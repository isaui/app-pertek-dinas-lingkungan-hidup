<template>
    <div class="space-y-6">
      <!-- SLO Header Info -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-900">{{ slo.company }}</h2>
            <p class="text-slate-600 mt-1">{{ slo.address }}</p>
          </div>
          <div class="text-right">
            <SLOStatusBadge :status="slo.status" class="mb-2" />
            <div v-if="slo.sloNumber" class="text-sm">
              <span class="font-medium text-green-700">{{ slo.sloNumber }}</span>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span class="text-slate-500">Jenis SLO:</span>
            <span class="ml-2 font-medium">{{ getSloTypeLabel(slo.type) }}</span>
          </div>
          <div>
            <span class="text-slate-500">Tanggal Pengajuan:</span>
            <span class="ml-2 font-medium">{{ formatDate(slo.createdAt) }}</span>
          </div>
          <div v-if="slo.approvedAt">
            <span class="text-slate-500">Tanggal Persetujuan:</span>
            <span class="ml-2 font-medium">{{ formatDate(slo.approvedAt) }}</span>
          </div>
        </div>
      </div>
  
      <!-- Status Progress -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-slate-900 mb-4">Progress Permohonan</h3>
        <div class="relative">
          <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-200">
            <div :style="`width: ${getProgressPercentage(slo.status)}%`" 
                 class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"></div>
          </div>
          <div class="flex justify-between text-sm text-slate-600">
            <span>Diajukan</span>
            <span>Dalam Proses</span>
            <span>Selesai</span>
          </div>
        </div>
        <p class="text-sm text-slate-600 mt-3">
          {{ getStatusDescription(slo.status) }}
        </p>
      </div>
  
      <!-- Quick Actions -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-slate-900 mb-4">Tindakan Cepat</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <!-- View Feedback Action -->
          <button v-if="hasFeedback" 
                  @click="$emit('quick-action', { key: 'view-feedback', label: 'Lihat Feedback' })"
                  class="flex items-center p-4 border border-amber-200 rounded-lg hover:bg-amber-50 transition-colors group">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <p class="text-sm font-medium text-slate-900">Tindak Lanjuti Feedback</p>
              <p class="text-xs text-slate-500">{{ activeFeedbackCount }} feedback perlu ditindaklanjuti</p>
            </div>
          </button>
  
          <!-- View Verification Schedule -->
          <button v-if="hasVerificationScheduled" 
                  @click="$emit('quick-action', { key: 'view-verification', label: 'Lihat Jadwal Verifikasi' })"
                  class="flex items-center p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors group">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <p class="text-sm font-medium text-slate-900">Jadwal Verifikasi Lapangan</p>
              <p class="text-xs text-slate-500">{{ formatDateTime(slo.verifikasiDate) }}</p>
            </div>
          </button>
  
          <!-- Upload Revision Action -->
          <button v-if="canUploadRevision" 
                  @click="$emit('quick-action', { key: 'upload-revision', label: 'Upload Revisi' })"
                  class="flex items-center p-4 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors group">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <p class="text-sm font-medium text-slate-900">Upload Dokumen Revisi</p>
              <p class="text-xs text-slate-500">Verifikasi selesai, upload revisi sekarang</p>
            </div>
          </button>
  
          <!-- View Documents Action -->
          <button @click="$emit('quick-action', { key: 'view-documents', label: 'Lihat Dokumen' })"
                  class="flex items-center p-4 border border-green-200 rounded-lg hover:bg-green-50 transition-colors group">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <p class="text-sm font-medium text-slate-900">Kelola Dokumen</p>
              <p class="text-xs text-slate-500">{{ totalDocuments }} dokumen tersedia</p>
            </div>
          </button>
  
          <!-- Update Requirements Action -->
          <button v-if="canUpdateRequirements" 
                  @click="$emit('quick-action', { key: 'update-requirements', label: 'Update Persyaratan' })"
                  class="flex items-center p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors group">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <p class="text-sm font-medium text-slate-900">Perbaiki Persyaratan</p>
              <p class="text-xs text-slate-500">Persyaratan perlu diperbaiki</p>
            </div>
          </button>
  
          <!-- Download SLO Final -->
          <button v-if="hasFinalDocument" 
                  @click="downloadFinalDocument"
                  class="flex items-center p-4 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors group">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-4 text-left">
              <p class="text-sm font-medium text-slate-900">Download SLO</p>
              <p class="text-xs text-slate-500">SLO sudah diterbitkan</p>
            </div>
          </button>
        </div>
      </div>
  
      <!-- Important Information -->
      <div v-if="slo.verifikasiDate || slo.notes || slo.feedbackToUser" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-blue-900 mb-4 flex items-center">
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Informasi Penting
        </h3>
        
        <!-- Verification Schedule -->
        <div v-if="slo.verifikasiDate" class="mb-4 p-4 bg-white border border-blue-200 rounded-lg">
          <h4 class="font-medium text-blue-900 mb-2">Jadwal Verifikasi Lapangan</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-blue-600 font-medium">Tanggal & Waktu:</span>
              <span class="ml-2">{{ formatDateTime(slo.verifikasiDate) }}</span>
            </div>
            <div v-if="slo.verifikasiLocation">
              <span class="text-blue-600 font-medium">Lokasi:</span>
              <span class="ml-2">{{ slo.verifikasiLocation }}</span>
            </div>
          </div>
        </div>
  
        <!-- User Notes -->
        <div v-if="slo.notes" class="mb-4">
          <h4 class="font-medium text-blue-900 mb-2">Catatan Anda</h4>
          <p class="text-blue-800 text-sm bg-white p-3 rounded border border-blue-200">{{ slo.notes }}</p>
        </div>
  
        <!-- Admin Feedback -->
        <div v-if="slo.feedbackToUser" class="mb-0">
          <h4 class="font-medium text-blue-900 mb-2">Feedback dari Admin</h4>
          <p class="text-blue-800 text-sm bg-white p-3 rounded border border-blue-200">{{ slo.feedbackToUser }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import SLOStatusBadge from '~/components/slo/StatusBadge.vue'
  
  const props = defineProps({
    slo: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['quick-action', 'switch-tab'])
  
  // Computed properties
  const hasFeedback = computed(() => {
    return props.slo.requirementFeedback && props.slo.requirementFeedback.some(f => !f.isResolved)
  })
  
  const activeFeedbackCount = computed(() => {
    return props.slo.requirementFeedback?.filter(f => !f.isResolved).length || 0
  })
  
  const hasVerificationScheduled = computed(() => {
    return props.slo.verifikasiDate && props.slo.status === 'FIELD_VERIFICATION_SCHEDULED'
  })
  
  const canUploadRevision = computed(() => {
    return ['FIELD_VERIFICATION_COMPLETED', 'REVISION_REJECTED'].includes(props.slo.status)
  })
  
  const canUpdateRequirements = computed(() => {
    return ['INCOMPLETE_REQUIREMENTS', 'REJECTED'].includes(props.slo.status)
  })
  
  const totalDocuments = computed(() => {
    return props.slo.documents?.length || 0
  })
  
  const hasFinalDocument = computed(() => {
    return props.slo.documents?.some(doc => doc.type === 'SLO_FINAL') && props.slo.status === 'SLO_ISSUED'
  })
  
  // Methods
  const getSloTypeLabel = (type) => {
    const labels = {
      'EMISI': 'Pembuangan Emisi',
      'AIR_LIMBAH': 'Air Limbah'
    }
    return labels[type] || type
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date)
  }
  
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', { 
      dateStyle: 'medium', 
      timeStyle: 'short' 
    }).format(date)
  }
  
  const getProgressPercentage = (status) => {
    const progressMap = {
      'SUBMITTED': 10,
      'VERIFICATION': 20,
      'INCOMPLETE_REQUIREMENTS': 25,
      'COMPLETE_REQUIREMENTS': 40,
      'FIELD_VERIFICATION_SCHEDULED': 50,
      'FIELD_VERIFICATION_COMPLETED': 60,
      'REVISION_SUBMITTED': 70,
      'REVISION_REVIEW': 80,
      'REVISION_REJECTED': 75,
      'REVISION_APPROVED': 90,
      'SLO_ISSUED': 100,
      'REJECTED': 0
    }
    return progressMap[status] || 0
  }
  
  const getStatusDescription = (status) => {
    const descriptions = {
      'SUBMITTED': 'Permohonan SLO Anda telah berhasil diajukan dan sedang menunggu proses verifikasi.',
      'VERIFICATION': 'Dokumen persyaratan Anda sedang dalam proses verifikasi oleh petugas.',
      'INCOMPLETE_REQUIREMENTS': 'Terdapat persyaratan yang perlu dilengkapi. Silakan periksa feedback untuk detail.',
      'COMPLETE_REQUIREMENTS': 'Persyaratan sudah lengkap. Menunggu jadwal verifikasi lapangan.',
      'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi lapangan telah dijadwalkan. Harap siapkan segala kebutuhan.',
      'FIELD_VERIFICATION_COMPLETED': 'Verifikasi lapangan selesai. Silakan upload dokumen revisi jika diperlukan.',
      'REVISION_SUBMITTED': 'Dokumen revisi telah disubmit dan sedang dalam proses review.',
      'REVISION_REVIEW': 'Dokumen revisi sedang direview oleh petugas.',
      'REVISION_REJECTED': 'Dokumen revisi ditolak. Silakan perbaiki sesuai feedback.',
      'REVISION_APPROVED': 'Dokumen revisi disetujui. SLO akan segera diterbitkan.',
      'SLO_ISSUED': 'Selamat! SLO Anda telah resmi diterbitkan.',
      'REJECTED': 'Permohonan ditolak. Silakan periksa alasan penolakan.'
    }
    return descriptions[status] || 'Status tidak dikenal.'
  }
  
  const downloadFinalDocument = () => {
    const finalDoc = props.slo.documents?.find(doc => doc.type === 'SLO_FINAL')
    if (finalDoc && finalDoc.fileUrl) {
      window.open(finalDoc.fileUrl, '_blank')
    }
  }
  </script>