<template>
    <div class="space-y-6">
      <!-- Quick Actions & Status Banner -->
      <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div class="flex items-center space-x-3 mb-3">
              <div class="flex-shrink-0">
                <StatusBadge :status="pertek.status" class="text-sm" />
              </div>
              <h3 class="text-lg font-semibold text-slate-900">{{ getStatusTitle(pertek.status) }}</h3>
            </div>
            <p class="text-sm text-slate-600">{{ getStatusDescription(pertek.status) }}</p>
            
            <!-- Feedback Notice (if applicable) -->
            <div v-if="feedbackCount > 0" class="flex items-center space-x-2 mt-4 text-amber-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-sm font-medium">{{ feedbackCount }} feedback menunggu</span>
            </div>
          </div>
          
          <!-- Quick Actions Section - Match design in screenshot -->
          <div class="flex flex-wrap gap-2">
            <button
              v-if="shouldShowUpdateRequirementsButton"
              @click="handleQuickAction({key: 'update-requirements'})"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Persyaratan
            </button>
            
            <button
              v-if="feedbackCount > 0"
              @click="handleQuickAction({key: 'view-feedback'})"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Lihat Feedback
            </button>
            
            <button
              @click="handleQuickAction({key: 'view-documents'})"
              class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Lihat Dokumen
            </button>
          </div>
        </div>
      </div>
  
      <!-- Progress Indicator -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-slate-900 mb-4">Progress Permohonan</h4>
        <div class="relative">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm text-slate-600">{{ getProgressText(pertek.status) }}</span>
            <span class="text-sm font-medium text-slate-900">{{ getProgressPercentage(pertek.status) }}%</span>
          </div>
          <div class="w-full bg-slate-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-500"
              :class="getProgressColor(pertek.status)"
              :style="{ width: `${getProgressPercentage(pertek.status)}%` }"
            ></div>
          </div>
          <div class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div v-for="stage in progressStages" :key="stage.key" class="flex items-center space-x-1">
              <div 
                :class="[
                  'w-2 h-2 rounded-full',
                  isStageCompleted(stage.key, pertek.status) ? 'bg-green-500' : 
                  isCurrentStage(stage.key, pertek.status) ? 'bg-blue-500' : 'bg-slate-300'
                ]"
              ></div>
              <span :class="isStageCompleted(stage.key, pertek.status) ? 'text-green-700' : 'text-slate-500'">
                {{ stage.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Main Info Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Informasi Umum -->
        <div class="bg-white border border-slate-200 rounded-lg p-6">
          <h4 class="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21h2m-2 0h-2m0-16h2m0 0h2m-2 0h2M5 5v16" />
            </svg>
            Informasi Umum
          </h4>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-slate-500">Nama Perusahaan</label>
              <p class="text-sm text-slate-900 mt-1">{{ pertek.company }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-slate-500">Alamat</label>
              <p class="text-sm text-slate-900 mt-1">{{ pertek.address }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-slate-500">Jenis PERTEK</label>
              <p class="text-sm text-slate-900 mt-1">{{ getPertekTypeLabel(pertek.type) }}</p>
            </div>
            <div v-if="pertek.pertekNumber">
              <label class="text-sm font-medium text-slate-500">Nomor PERTEK</label>
              <p class="text-sm font-semibold text-green-700 mt-1">{{ pertek.pertekNumber }}</p>
            </div>
            <div v-if="pertek.notes">
              <label class="text-sm font-medium text-slate-500">Catatan</label>
              <p class="text-sm text-slate-900 mt-1">{{ pertek.notes }}</p>
            </div>
          </div>
        </div>
  
        <!-- Informasi Status & Waktu -->
        <div class="bg-white border border-slate-200 rounded-lg p-6">
          <h4 class="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Informasi Waktu
          </h4>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium text-slate-500">Tanggal Pengajuan</label>
              <p class="text-sm text-slate-900 mt-1">{{ formatDate(pertek.createdAt) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-slate-500">Terakhir Diperbarui</label>
              <p class="text-sm text-slate-900 mt-1">{{ formatRelativeTime(pertek.updatedAt) }}</p>
            </div>
            <div v-if="pertek.paparanDate">
              <label class="text-sm font-medium text-slate-500">Jadwal Paparan</label>
              <p class="text-sm text-slate-900 mt-1">{{ formatDate(pertek.paparanDate) }}</p>
              <p v-if="pertek.paparanLocation" class="text-xs text-slate-600 mt-1">📍 {{ pertek.paparanLocation }}</p>
            </div>
            <div v-if="pertek.approvedAt">
              <label class="text-sm font-medium text-slate-500">Tanggal Persetujuan</label>
              <p class="text-sm font-semibold text-green-700 mt-1">{{ formatDate(pertek.approvedAt) }}</p>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Ringkasan Dokumen -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-slate-900 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Ringkasan Dokumen
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="docType in documentTypes" :key="docType.key" class="border border-slate-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <h5 class="text-sm font-medium text-slate-700">{{ docType.label }}</h5>
              <span :class="[
                'text-xs px-2 py-1 rounded-full',
                getDocumentCount(docType.key) > 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
              ]">
                {{ getDocumentCount(docType.key) }} file
              </span>
            </div>
            <p class="text-xs text-slate-500">{{ docType.description }}</p>
          </div>
        </div>
      </div>
  
      <!-- Feedback Summary (jika ada) -->
      <div v-if="activeFeedback.length > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h4 class="text-lg font-semibold text-amber-900 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Feedback Menunggu Tindakan
        </h4>
        <div class="space-y-3">
          <div v-for="feedback in activeFeedback.slice(0, 3)" :key="feedback.id" class="bg-white border border-amber-200 rounded-md p-3">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h5 class="text-sm font-medium text-slate-900">{{ getRequirementTypeLabel(feedback.requirementType) }}</h5>
                <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ feedback.feedbackText }}</p>
                <p class="text-xs text-slate-500 mt-2">{{ formatRelativeTime(feedback.createdAt) }}</p>
              </div>
              <span class="ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Belum diselesaikan
              </span>
            </div>
          </div>
          <div v-if="activeFeedback.length > 3" class="text-center">
            <button 
              @click="$emit('switch-tab', 'feedback')"
              class="text-sm text-amber-700 hover:text-amber-800 font-medium"
            >
              Lihat {{ activeFeedback.length - 3 }} feedback lainnya →
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import StatusBadge from '~/components/pertek/StatusBadge.vue';
  
  const props = defineProps({
    pertek: {
      type: Object,
      required: true
    }
  });
  
  const emit = defineEmits(['switch-tab', 'quick-action']);
  
  // Quick Actions berdasarkan status
  const quickActions = computed(() => {
    const actions = [];
    
    switch (props.pertek.status) {
      case 'INCOMPLETE_REQUIREMENTS':
        // Quick action to update requirements
        actions.push({
          key: 'update-requirements',
          label: 'Update Persyaratan',
          icon: 'svg',
          primary: true
        });
        
        // Feedback action if there are active feedbacks
        if (activeFeedback.value.length > 0) {
          actions.push({
            key: 'view-feedback',
            label: 'Lihat Feedback',
            icon: 'svg',
            primary: false
          });
        }
        break;
        
      case 'SCHEDULED_PAPARAN':
        actions.push({
          key: 'view-paparan',
          label: 'Info Paparan',
          icon: 'svg',
          primary: true
        });
        break;
        
      case 'PAPARAN_COMPLETED':
        actions.push({
          key: 'upload-revisi',
          label: 'Upload Revisi',
          icon: 'svg',
          primary: true
        });
        break;
        
      case 'REVISION_REJECTED':
        actions.push({
          key: 'view-feedback',
          label: 'Lihat Feedback',
          icon: 'svg',
          primary: true
        });
        break;
    }
    
    // Always show document tab action
    actions.push({
      key: 'view-documents',
      label: 'Lihat Dokumen',
      icon: 'svg',
      primary: false
    });
    
    return actions;
  });
  
  // Feedback yang belum diselesaikan
  const activeFeedback = computed(() => {
    return props.pertek.requirementFeedback?.filter(f => !f.isResolved) || [];
  });
  
  const feedbackCount = computed(() => activeFeedback.value.length);

  // Control visibility of Update Persyaratan button
  const shouldShowUpdateRequirementsButton = computed(() => {
    return ['INCOMPLETE_REQUIREMENTS', 'REJECTED'].includes(props.pertek.status);
  });
  
  // Document types untuk ringkasan
  const documentTypes = [
    { key: 'PERSYARATAN', label: 'Persyaratan', description: 'Dokumen awal yang diajukan' },
    { key: 'REVISI', label: 'Revisi', description: 'Dokumen hasil revisi' },
    { key: 'SURAT_UNDANGAN_PAPARAN', label: 'Surat Undangan', description: 'Undangan paparan dari admin' },
    { key: 'PERTEK_FINAL', label: 'PERTEK Final', description: 'Dokumen PERTEK yang diterbitkan' }
  ];
  
  // Progress stages
  const progressStages = [
    { key: 'submitted', label: 'Diajukan' },
    { key: 'verified', label: 'Verifikasi' },
    { key: 'paparan', label: 'Paparan' },
    { key: 'approved', label: 'Diterbitkan' }
  ];
  
  // Helper functions
  const handleQuickAction = (action) => {
    emit('quick-action', action);
  };
  
  const getDocumentCount = (type) => {
    return props.pertek.documents?.filter(doc => doc.type === type).length || 0;
  };
  
  const getStatusTitle = (status) => {
    const titles = {
      'SUBMITTED': 'Menunggu Verifikasi',
      'VERIFICATION': 'Sedang Diverifikasi',
      'INCOMPLETE_REQUIREMENTS': 'Persyaratan Perlu Diperbaiki',
      'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
      'SCHEDULED_PAPARAN': 'Paparan Telah Dijadwalkan',
      'PAPARAN_COMPLETED': 'Paparan Selesai',
      'REVISION_SUBMITTED': 'Revisi Telah Diajukan',
      'REVISION_REVIEW': 'Revisi Sedang Direview',
      'REVISION_REJECTED': 'Revisi Perlu Diperbaiki',
      'REVISION_APPROVED': 'Revisi Disetujui',
      'PERTEK_ISSUED': 'PERTEK Telah Diterbitkan',
      'REJECTED': 'Permohonan Ditolak'
    };
    return titles[status] || status;
  };
  
  const getStatusDescription = (status) => {
    const descriptions = {
      'SUBMITTED': 'Permohonan Anda sedang menunggu untuk diverifikasi oleh admin',
      'VERIFICATION': 'Admin sedang memeriksa kelengkapan dokumen persyaratan',
      'INCOMPLETE_REQUIREMENTS': 'Ada dokumen yang perlu diperbaiki atau dilengkapi',
      'COMPLETE_REQUIREMENTS': 'Semua persyaratan sudah lengkap, menunggu jadwal paparan',
      'SCHEDULED_PAPARAN': 'Sesi paparan sudah dijadwalkan, silakan lihat detail',
      'PAPARAN_COMPLETED': 'Paparan selesai, silakan upload dokumen revisi',
      'REVISION_SUBMITTED': 'Dokumen revisi sedang menunggu review admin',
      'REVISION_REVIEW': 'Admin sedang mereview dokumen revisi Anda',
      'REVISION_REJECTED': 'Dokumen revisi perlu diperbaiki kembali',
      'REVISION_APPROVED': 'Dokumen revisi disetujui, PERTEK sedang disiapkan',
      'PERTEK_ISSUED': 'PERTEK resmi telah diterbitkan dan dapat diunduh',
      'REJECTED': 'Permohonan tidak dapat diproses lebih lanjut'
    };
    return descriptions[status] || '';
  };
  
  const getProgressPercentage = (status) => {
    const percentages = {
      'SUBMITTED': 15,
      'VERIFICATION': 25,
      'INCOMPLETE_REQUIREMENTS': 35,
      'COMPLETE_REQUIREMENTS': 45,
      'SCHEDULED_PAPARAN': 55,
      'PAPARAN_COMPLETED': 65,
      'REVISION_SUBMITTED': 75,
      'REVISION_REVIEW': 80,
      'REVISION_REJECTED': 70,
      'REVISION_APPROVED': 90,
      'PERTEK_ISSUED': 100,
      'REJECTED': 0
    };
    return percentages[status] || 0;
  };
  
  const getProgressText = (status) => {
    if (status === 'PERTEK_ISSUED') return 'Proses selesai';
    if (status === 'REJECTED') return 'Proses dihentikan';
    return 'Sedang dalam proses';
  };
  
  const getProgressColor = (status) => {
    if (status === 'PERTEK_ISSUED') return 'bg-green-500';
    if (status === 'REJECTED') return 'bg-red-500';
    if (['INCOMPLETE_REQUIREMENTS', 'REVISION_REJECTED'].includes(status)) return 'bg-amber-500';
    return 'bg-blue-500';
  };
  
  const isStageCompleted = (stage, currentStatus) => {
    const statusOrder = {
      'submitted': ['VERIFICATION', 'INCOMPLETE_REQUIREMENTS', 'COMPLETE_REQUIREMENTS', 'SCHEDULED_PAPARAN', 'PAPARAN_COMPLETED', 'REVISION_SUBMITTED', 'REVISION_REVIEW', 'REVISION_APPROVED', 'PERTEK_ISSUED'],
      'verified': ['COMPLETE_REQUIREMENTS', 'SCHEDULED_PAPARAN', 'PAPARAN_COMPLETED', 'REVISION_SUBMITTED', 'REVISION_REVIEW', 'REVISION_APPROVED', 'PERTEK_ISSUED'],
      'paparan': ['PAPARAN_COMPLETED', 'REVISION_SUBMITTED', 'REVISION_REVIEW', 'REVISION_APPROVED', 'PERTEK_ISSUED'],
      'approved': ['PERTEK_ISSUED']
    };
    return statusOrder[stage]?.includes(currentStatus) || false;
  };
  
  const isCurrentStage = (stage, currentStatus) => {
    const currentStages = {
      'submitted': ['SUBMITTED', 'VERIFICATION', 'INCOMPLETE_REQUIREMENTS'],
      'verified': ['COMPLETE_REQUIREMENTS'],
      'paparan': ['SCHEDULED_PAPARAN', 'PAPARAN_COMPLETED', 'REVISION_SUBMITTED', 'REVISION_REVIEW', 'REVISION_REJECTED', 'REVISION_APPROVED'],
      'approved': ['PERTEK_ISSUED']
    };
    return currentStages[stage]?.includes(currentStatus) || false;
  };
  
  const getPertekTypeLabel = (type) => {
    const labels = {
      'EMISI': 'Pembuangan Emisi',
      'AIR_LIMBAH': 'Air Limbah'
    };
    return labels[type] || type;
  };
  
  const getRequirementTypeLabel = (type) => {
    const labels = {
      'SURAT_PERMOHONAN': 'Surat Permohonan',
      'DOKUMEN_AMDAL_UKL_UPL': 'Dokumen AMDAL/UKL-UPL',
      'DOKUMEN_TEKNIS': 'Dokumen Teknis',
      'DOKUMEN_REVISI': 'Dokumen Revisi',
      'OTHER': 'Lainnya'
    };
    return labels[type] || type;
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
  
    if (diffInMinutes < 1) {
      return 'Baru saja';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} menit lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam lalu`;
    } else if (diffInDays === 1) {
      return 'Kemarin';
    } else if (diffInDays < 7) {
      return `${diffInDays} hari lalu`;
    } else {
      return formatDate(dateString);
    }
  };
  </script>
  
  <style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  </style>