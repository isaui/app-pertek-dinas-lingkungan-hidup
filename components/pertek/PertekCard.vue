<template>
  <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200 hover:shadow-md transition-shadow h-full flex flex-col">
    <div class="p-6 flex-1">
      <!-- Status Badge -->
      <div class="flex items-start justify-between mb-4">
        <StatusBadge :status="pertek.status" />
        <span class="bg-slate-100 text-slate-700 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
          {{ pertekTypeLabel(pertek.type) }}
        </span>
      </div>
      
      <!-- PERTEK Number (Admin Only) -->
      <div v-if="isAdmin && pertek.pertekNumber" class="mb-3">
        <div class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ pertek.pertekNumber }}
        </div>
      </div>
      
      <!-- Company Info -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-slate-900 mb-2 leading-tight line-clamp-2">{{ pertek.company }}</h3>
        <p class="text-sm text-slate-600 leading-relaxed line-clamp-3">{{ pertek.address }}</p>
      </div>
      
      <!-- User Info (Admin Only) -->
      <div v-if="isAdmin && pertek.user" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div class="text-xs text-blue-600 font-medium mb-1">Pemohon:</div>
        <div class="text-sm font-medium text-blue-900">{{ pertek.user.name }}</div>
        <div class="text-xs text-blue-600">{{ pertek.user.email }}</div>
        <div v-if="pertek.user.instansi" class="text-xs text-blue-500">{{ pertek.user.instansi }}</div>
      </div>
      
      <!-- Feedback indicator -->
      <div v-if="hasFeedback(pertek)" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
        <div class="flex items-center text-amber-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-sm font-medium">{{ feedbackCount(pertek) }} feedback perlu ditindaklanjuti</span>
        </div>
      </div>
    </div>
    
    <!-- Footer with dates and action - Always at bottom -->
    <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 mt-auto">
      <div class="flex items-center justify-between">
        <div class="text-xs text-slate-500 space-y-1">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>{{ formatDate(pertek.createdAt) }}</span>
          </div>
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ formatRelativeTime(pertek.updatedAt) }}</span>
          </div>
        </div>
        <button
          @click="$emit('view', pertek.id)"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <span v-if="isAdmin">Kelola</span>
          <span v-else>Lihat Detail</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['view']);

// Format tanggal untuk created date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// Format relative time untuk updated date
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
    // For older dates, show formatted date
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  }
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

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>