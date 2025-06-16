<template>
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
        <p class="text-sm text-slate-900 mt-1">{{ formatDate(slo.createdAt) }}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-slate-500">Terakhir Diperbarui</label>
        <p class="text-sm text-slate-900 mt-1">{{ formatRelativeTime(slo.updatedAt) }}</p>
      </div>
      <div v-if="slo.verifikasiDate">
        <label class="text-sm font-medium text-slate-500">Jadwal Verifikasi Lapangan</label>
        <p class="text-sm text-slate-900 mt-1">{{ formatDate(slo.verifikasiDate) }}</p>
        <p v-if="slo.verifikasiLocation" class="text-xs text-slate-600 mt-1">📍 {{ slo.verifikasiLocation }}</p>
      </div>
      <div v-if="slo.approvedAt">
        <label class="text-sm font-medium text-slate-500">Tanggal Persetujuan</label>
        <p class="text-sm font-semibold text-green-700 mt-1">{{ formatDate(slo.approvedAt) }}</p>
      </div>
      <div v-if="hasFeedback">
        <label class="text-sm font-medium text-slate-500">Feedback Terakhir</label>
        <p class="text-sm text-amber-600 mt-1">{{ formatDate(latestFeedback.createdAt) }}</p>
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

const hasFeedback = computed(() => {
  return props.slo.requirementFeedback && props.slo.requirementFeedback.length > 0;
});

const latestFeedback = computed(() => {
  if (!hasFeedback.value) return null;
  return props.slo.requirementFeedback[0]; // Already sorted by createdAt desc
});

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date);
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  
  if (diffMin < 1) {
    return 'Baru saja';
  } else if (diffMin < 60) {
    return `${diffMin} menit yang lalu`;
  } else if (diffHour < 24) {
    return `${diffHour} jam yang lalu`;
  } else if (diffDay < 30) {
    return `${diffDay} hari yang lalu`;
  } else {
    return formatDate(dateString);
  }
};
</script>
