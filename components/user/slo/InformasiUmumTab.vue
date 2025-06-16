<template>
  <div class="space-y-6">
    <!-- SLO Header with Status and Quick Actions -->
    <SLOHeader 
      :slo="slo" 
      @quick-action="handleQuickAction"
    />
    
    <!-- Progress Indicator -->
    <SLOProgress :slo="slo" />
    
    <!-- Main Info Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Basic Information -->
      <SLOBasicInfo :slo="slo" />
      
      <!-- Time Information -->
      <SLOTimeInfo :slo="slo" />
    </div>
    
    <!-- Document Summary -->
    <SLODocumentSummary 
      :documents="slo.documents || []" 
      @view-all-documents="handleQuickAction({key: 'view-documents'})"
    />
    
    <!-- Important Notices / Alerts -->
    <div v-if="hasFeedbackOrInstructions" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-blue-900 mb-4 flex items-center">
        <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Informasi Penting
      </h3>
      
      <!-- Verification Instructions -->
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
      
      <!-- Admin Feedback -->
      <div v-if="slo.feedbackToUser" class="mb-4">
        <h4 class="font-medium text-blue-900 mb-2">Feedback dari Admin</h4>
        <p class="text-blue-800 text-sm bg-white p-3 rounded border border-blue-200">{{ slo.feedbackToUser }}</p>
      </div>
      
      <!-- Additional Instructions -->
      <div v-if="slo.additionalInstructions" class="mb-0">
        <h4 class="font-medium text-blue-900 mb-2">Instruksi Tambahan</h4>
        <p class="text-blue-800 text-sm bg-white p-3 rounded border border-blue-200">{{ slo.additionalInstructions }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import SLOHeader from './SLOHeader.vue';
import SLOProgress from './SLOProgress.vue';
import SLOBasicInfo from './SLOBasicInfo.vue';
import SLOTimeInfo from './SLOTimeInfo.vue';
import SLODocumentSummary from './SLODocumentSummary.vue';

const props = defineProps({
  slo: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['quick-action', 'switch-tab']);

// Pass through quick actions to parent component
const handleQuickAction = (action) => {
  emit('quick-action', action);
};

// Helper computed properties
const hasFeedbackOrInstructions = computed(() => {
  return props.slo.verifikasiDate || 
         props.slo.feedbackToUser || 
         props.slo.additionalInstructions;
});

// Helper methods
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  }).format(date);
};
</script>
