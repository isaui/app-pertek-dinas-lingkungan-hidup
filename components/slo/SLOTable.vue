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
                Tipe SLO
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Tanggal Pengajuan
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Terakhir Diperbarui
              </th>
              <th v-if="isAdmin" scope="col" class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                No. SLO
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-for="slo in sloItems" :key="slo.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <SLOStatusBadge :status="slo.status" />
                
                <!-- Has Feedback Indicator -->
                <div v-if="hasFeedback(slo)" class="mt-1 flex items-center text-amber-600 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {{ feedbackCount(slo) }} feedback
                </div>
                
                <!-- Verification Schedule Indicator -->
                <div v-if="slo.verifikasiDate && slo.status === 'FIELD_VERIFICATION_SCHEDULED'" class="mt-1 flex items-center text-purple-600 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {{ formatDate(slo.verifikasiDate) }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ slo.company }}</div>
                <div class="text-sm text-gray-500 truncate max-w-xs">{{ slo.address }}</div>
              </td>
              <td v-if="isAdmin" class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ slo.user?.name || 'N/A' }}</div>
                <div class="text-sm text-gray-500">{{ slo.user?.email || 'N/A' }}</div>
                <div v-if="slo.user?.instansi" class="text-xs text-gray-400">{{ slo.user.instansi }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="bg-slate-100 text-slate-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ sloTypeLabel(slo.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(slo.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDateTime(slo.updatedAt) }}
              </td>
              <td v-if="isAdmin" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                <span v-if="slo.sloNumber" class="text-green-700 font-medium">
                  {{ slo.sloNumber }}
                </span>
                <span v-else class="text-gray-400 italic">
                  Belum diterbitkan
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click="$emit('view', slo.id)"
                  class="text-blue-600 hover:text-blue-900 transition-colors"
                >
                  <span v-if="isAdmin">Kelola</span>
                  <span v-else>Lihat Detail</span>
                </button>
              </td>
            </tr>
            
            <!-- Empty state -->
            <tr v-if="sloItems.length === 0">
              <td :colspan="isAdmin ? 8 : 6" class="px-6 py-10 text-center text-sm text-gray-500">
                Tidak ada data permohonan SLO
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import SLOStatusBadge from '~/components/slo/SLOStatusBadge.vue';
  
  const props = defineProps({
    sloItems: {
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
  
  // Label untuk tipe SLO
  const sloTypeLabel = (type) => {
    const labels = {
      'EMISI': 'Pembuangan Emisi',
      'AIR_LIMBAH': 'Air Limbah'
    };
    
    return labels[type] || type;
  };
  
  // Check apakah ada feedback yang belum diselesaikan
  const hasFeedback = (slo) => {
    return slo.requirementFeedback && slo.requirementFeedback.length > 0;
  };
  
  // Hitung jumlah feedback
  const feedbackCount = (slo) => {
    return slo.requirementFeedback ? slo.requirementFeedback.length : 0;
  };
  </script>