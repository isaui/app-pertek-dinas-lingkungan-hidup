<template>
  <div class="bg-white border border-slate-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold text-slate-900 mb-4">Progress Permohonan</h4>
    <div class="relative">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-slate-600">{{ getProgressText(slo.status) }}</span>
        <span class="text-sm font-medium text-slate-900">{{ getProgressPercentage(slo.status) }}%</span>
      </div>
      <div class="w-full bg-slate-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-500"
          :class="getProgressColor(slo.status)"
          :style="{ width: `${getProgressPercentage(slo.status)}%` }"
        ></div>
      </div>
      <div class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div v-for="stage in progressStages" :key="stage.key" class="flex items-center space-x-1">
          <div 
            :class="[
              'w-2 h-2 rounded-full',
              isStageCompleted(stage.key, slo.status) ? 'bg-green-500' : 
              isCurrentStage(stage.key, slo.status) ? 'bg-blue-500' : 'bg-slate-300'
            ]"
          ></div>
          <span :class="isStageCompleted(stage.key, slo.status) ? 'text-green-700' : 'text-slate-500'">
            {{ stage.label }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  slo: {
    type: Object,
    required: true
  }
});

const progressStages = [
  { key: 'submission', label: 'Pengajuan' },
  { key: 'verification', label: 'Verifikasi' },
  { key: 'field_check', label: 'Pengecekan Lapangan' },
  { key: 'slo_issue', label: 'Penerbitan SLO' }
];

const getProgressPercentage = (status) => {
  const progressMap = {
    'SUBMITTED': 10,
    'VERIFICATION': 25,
    'INCOMPLETE_REQUIREMENTS': 30,
    'COMPLETE_REQUIREMENTS': 40,
    'FIELD_VERIFICATION_SCHEDULED': 50,
    'FIELD_VERIFICATION_COMPLETED': 65,
    'REVISION_SUBMITTED': 75,
    'REVISION_REVIEW': 85,
    'REVISION_REJECTED': 70,
    'REVISION_APPROVED': 95,
    'SLO_ISSUED': 100,
    'REJECTED': 0
  };
  return progressMap[status] || 0;
};

const getProgressColor = (status) => {
  if (status === 'SLO_ISSUED') {
    return 'bg-green-500';
  } else if (status === 'REJECTED') {
    return 'bg-red-500';
  } else if (status === 'INCOMPLETE_REQUIREMENTS' || status === 'REVISION_REJECTED') {
    return 'bg-amber-500';
  } else {
    return 'bg-blue-500';
  }
};

const getProgressText = (status) => {
  const texts = {
    'SUBMITTED': 'Permohonan diajukan',
    'VERIFICATION': 'Verifikasi dokumen',
    'INCOMPLETE_REQUIREMENTS': 'Persyaratan belum lengkap',
    'COMPLETE_REQUIREMENTS': 'Menunggu verifikasi lapangan',
    'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi lapangan terjadwal',
    'FIELD_VERIFICATION_COMPLETED': 'Verifikasi lapangan selesai',
    'REVISION_SUBMITTED': 'Revisi diajukan',
    'REVISION_REVIEW': 'Review revisi',
    'REVISION_REJECTED': 'Revisi ditolak',
    'REVISION_APPROVED': 'Revisi disetujui',
    'SLO_ISSUED': 'SLO terbit',
    'REJECTED': 'Permohonan ditolak'
  };
  return texts[status] || 'Status tidak dikenal';
};

const isStageCompleted = (stage, status) => {
  const stageOrder = {
    'submission': 0,
    'verification': 1,
    'field_check': 2,
    'slo_issue': 3
  };
  
  const statusStage = {
    'SUBMITTED': 0,
    'VERIFICATION': 1,
    'INCOMPLETE_REQUIREMENTS': 1,
    'COMPLETE_REQUIREMENTS': 1,
    'FIELD_VERIFICATION_SCHEDULED': 2,
    'FIELD_VERIFICATION_COMPLETED': 2,
    'REVISION_SUBMITTED': 2,
    'REVISION_REVIEW': 2,
    'REVISION_REJECTED': 2,
    'REVISION_APPROVED': 2,
    'SLO_ISSUED': 3,
    'REJECTED': -1
  };
  
  // If rejected, no stages are completed
  if (status === 'REJECTED') return false;
  
  // If SLO_ISSUED, all stages are completed
  if (status === 'SLO_ISSUED') return true;
  
  // Otherwise check if the current status has passed the given stage
  return statusStage[status] > stageOrder[stage];
};

const isCurrentStage = (stage, status) => {
  const stageOrder = {
    'submission': 0,
    'verification': 1,
    'field_check': 2,
    'slo_issue': 3
  };
  
  const statusStage = {
    'SUBMITTED': 0,
    'VERIFICATION': 1,
    'INCOMPLETE_REQUIREMENTS': 1,
    'COMPLETE_REQUIREMENTS': 1,
    'FIELD_VERIFICATION_SCHEDULED': 2,
    'FIELD_VERIFICATION_COMPLETED': 2,
    'REVISION_SUBMITTED': 2,
    'REVISION_REVIEW': 2,
    'REVISION_REJECTED': 2,
    'REVISION_APPROVED': 2,
    'SLO_ISSUED': 3,
    'REJECTED': -1
  };
  
  // For rejected status, no stage is current
  if (status === 'REJECTED') return false;
  
  // For other statuses, check if the stage matches the current status stage
  return statusStage[status] === stageOrder[stage];
};
</script>
