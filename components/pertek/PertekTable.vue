<template>
  <div class="overflow-hidden bg-white shadow-sm border border-slate-200 rounded-lg">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Perusahaan
            </th>
            <th v-if="isAdmin" scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pemohon
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tipe PERTEK
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tanggal Pengajuan
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Terakhir Diperbarui
            </th>
            <th v-if="isAdmin" scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              No. PERTEK
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-slate-200">
          <tr v-for="pertek in pertekItems" :key="pertek.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <StatusBadge :status="pertek.status" />
              
              <!-- Has Feedback Indicator -->
              <div v-if="hasFeedback(pertek)" class="mt-1 flex items-center text-amber-600 text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {{ feedbackCount(pertek) }} feedback
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ pertek.company }}</div>
              <div class="text-sm text-gray-500 truncate max-w-xs">{{ pertek.address }}</div>
            </td>
            <td v-if="isAdmin" class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ pertek.user?.name || 'N/A' }}</div>
              <div class="text-sm text-gray-500">{{ pertek.user?.email || 'N/A' }}</div>
              <div v-if="pertek.user?.instansi" class="text-xs text-gray-400">{{ pertek.user.instansi }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="bg-slate-100 text-slate-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ pertekTypeLabel(pertek.type) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(pertek.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDateTime(pertek.updatedAt) }}
            </td>
            <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
              <span v-if="pertek.pertekNumber" class="text-green-700 font-medium">
                {{ pertek.pertekNumber }}
              </span>
              <span v-else class="text-gray-400 italic">
                Belum diterbitkan
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="$emit('view', pertek.id)"
                class="text-blue-600 hover:text-blue-900 transition-colors"
              >
                <span v-if="isAdmin">Kelola</span>
                <span v-else>Lihat Detail</span>
              </button>
            </td>
          </tr>
          
          <!-- Empty state -->
          <tr v-if="pertekItems.length === 0">
            <td :colspan="isAdmin ? 8 : 6" class="px-6 py-10 text-center text-sm text-gray-500">
              Tidak ada data permohonan PERTEK
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import StatusBadge from '~/components/pertek/StatusBadge.vue';

const props = defineProps({
  pertekItems: {
    type: Array,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view']);

// Format tanggal pengajuan
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Format tanggal dengan waktu untuk updated at
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Label untuk tipe PERTEK
const pertekTypeLabel = (type) => {
  const labels = {
    'EMISI': 'Pembuangan Emisi',
    'AIR_LIMBAH': 'Air Limbah'
  };
  
  return labels[type] || type;
};

// Check apakah ada feedback yang belum diselesaikan
const hasFeedback = (pertek) => {
  return pertek.requirementFeedback && pertek.requirementFeedback.length > 0;
};

// Hitung jumlah feedback
const feedbackCount = (pertek) => {
  return pertek.requirementFeedback ? pertek.requirementFeedback.length : 0;
};
</script>