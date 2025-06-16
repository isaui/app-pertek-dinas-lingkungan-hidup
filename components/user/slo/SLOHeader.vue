<template>
  <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
      <div>
        <div class="flex items-center space-x-3 mb-3">
          <div class="flex-shrink-0">
            <SLOStatusBadge :status="slo.status" class="text-sm" />
          </div>
          <h3 class="text-lg font-semibold text-slate-900">{{ getStatusTitle(slo.status) }}</h3>
        </div>
        <p class="text-sm text-slate-600">{{ getStatusDescription(slo.status) }}</p>
        
        <!-- Feedback Notice (if applicable) -->
        <div v-if="feedbackCount > 0" class="flex items-center space-x-2 mt-4 text-amber-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-sm font-medium">{{ feedbackCount }} feedback menunggu</span>
        </div>
      </div>
      
      <!-- Quick Actions Section -->
      <div class="flex flex-wrap gap-2">
        <button
          v-if="shouldShowUpdateRequirementsButton"
          @click="$emit('quick-action', {key: 'update-requirements'})"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Update Persyaratan
        </button>
        
        <button
          v-if="feedbackCount > 0"
          @click="$emit('quick-action', {key: 'view-feedback'})"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Lihat Feedback
        </button>
        
        <button
          @click="$emit('quick-action', {key: 'view-documents'})"
          class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Lihat Dokumen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SLOStatusBadge from '~/components/slo/SLOStatusBadge.vue';

const props = defineProps({
  slo: {
    type: Object,
    required: true
  }
});

defineEmits(['quick-action']);

const feedbackCount = computed(() => {
  return props.slo.requirementFeedback?.filter(f => !f.isResolved).length || 0;
});

const shouldShowUpdateRequirementsButton = computed(() => {
  return ['INCOMPLETE_REQUIREMENTS', 'REJECTED'].includes(props.slo.status);
});

const getStatusTitle = (status) => {
  const titles = {
    'SUBMITTED': 'Permohonan Diajukan',
    'VERIFICATION': 'Verifikasi Dokumen',
    'INCOMPLETE_REQUIREMENTS': 'Persyaratan Belum Lengkap',
    'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
    'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi Lapangan Terjadwal',
    'FIELD_VERIFICATION_COMPLETED': 'Verifikasi Lapangan Selesai',
    'REVISION_SUBMITTED': 'Revisi Diajukan',
    'REVISION_REVIEW': 'Review Revisi',
    'REVISION_REJECTED': 'Revisi Ditolak',
    'REVISION_APPROVED': 'Revisi Disetujui',
    'SLO_ISSUED': 'SLO Terbit',
    'REJECTED': 'Permohonan Ditolak'
  };
  return titles[status] || 'Status Tidak Dikenal';
};

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
  };
  return descriptions[status] || 'Status tidak dikenal.';
};
</script>
