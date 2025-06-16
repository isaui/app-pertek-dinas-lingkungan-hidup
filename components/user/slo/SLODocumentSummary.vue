<template>
  <div class="bg-white border border-slate-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold text-slate-900 mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Ringkasan Dokumen
    </h4>
    
    <div v-if="totalDocuments > 0" class="space-y-3">
      <!-- Document category counts -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <!-- PERSYARATAN documents -->
        <div class="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-sm text-slate-700">Persyaratan</span>
          </div>
          <span class="text-sm font-semibold">{{ documentCountsByType.PERSYARATAN || 0 }}</span>
        </div>
        
        <!-- REVISI documents -->
        <div class="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="text-sm text-slate-700">Revisi</span>
          </div>
          <span class="text-sm font-semibold">{{ documentCountsByType.REVISI || 0 }}</span>
        </div>
        
        <!-- SURAT_UNDANGAN_VERIFIKASI documents -->
        <div class="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span class="text-sm text-slate-700">Undangan</span>
          </div>
          <span class="text-sm font-semibold">{{ documentCountsByType.SURAT_UNDANGAN_VERIFIKASI || 0 }}</span>
        </div>
        
        <!-- SLO_FINAL documents -->
        <div class="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            <span class="text-sm text-slate-700">SLO Final</span>
          </div>
          <span class="text-sm font-semibold">{{ documentCountsByType.SLO_FINAL || 0 }}</span>
        </div>
        
        <!-- Total documents -->
        <div class="bg-blue-50 rounded-lg p-3 flex items-center justify-between">
          <div class="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span class="text-sm text-blue-700 font-medium">Total</span>
          </div>
          <span class="text-sm font-semibold">{{ totalDocuments }}</span>
        </div>
      </div>
      
      <!-- Recent documents -->
      <div v-if="recentDocuments.length > 0">
        <h5 class="text-sm font-medium text-slate-600 mb-2">Dokumen Terbaru</h5>
        <ul class="space-y-2">
          <li v-for="doc in recentDocuments" :key="doc.id" class="text-sm">
            <a :href="doc.fileUrl" target="_blank" class="flex items-center p-2 hover:bg-slate-50 rounded-md transition-colors">
              <span class="flex-shrink-0 mr-2">
                <svg v-if="isPDF(doc.mimeType)" class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                </svg>
                <svg v-else class="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
                </svg>
              </span>
              <div class="overflow-hidden">
                <div class="truncate">{{ doc.filename }}</div>
                <div class="text-xs text-slate-500 flex items-center">
                  <span>{{ formatFileSize(doc.size) }}</span>
                  <span class="mx-1">•</span>
                  <span>{{ formatDate(doc.uploadedAt) }}</span>
                  <span v-if="getDocumentType(doc.type)" class="ml-1 px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-sm">
                    {{ getDocumentType(doc.type) }}
                  </span>
                </div>
              </div>
            </a>
          </li>
        </ul>
      </div>
      
      <!-- View all documents button -->
      <div class="mt-3 text-center">
        <button 
          @click="$emit('view-all-documents')" 
          class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center w-full"
        >
          <span>Lihat Semua Dokumen</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
    
    <div v-else class="text-center py-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="mt-2 text-sm text-slate-500">Belum ada dokumen tersedia</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  documents: {
    type: Array,
    default: () => []
  }
});

defineEmits(['view-all-documents']);

const totalDocuments = computed(() => props.documents.length);

const documentCountsByType = computed(() => {
  const counts = {};
  
  props.documents.forEach(doc => {
    if (doc.type) {
      counts[doc.type] = (counts[doc.type] || 0) + 1;
    }
  });
  
  return counts;
});

const recentDocuments = computed(() => {
  // Get 3 most recent documents
  return props.documents.slice(0, 3);
});

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', { 
    day: 'numeric',
    month: 'short'
  }).format(date);
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i), 2)} ${sizes[i]}`;
};

const isPDF = (mimeType) => {
  return mimeType === 'application/pdf' || mimeType === 'pdf';
};

const getDocumentType = (type) => {
  const types = {
    'PERSYARATAN': 'Persyaratan',
    'REVISI': 'Revisi',
    'SURAT_UNDANGAN_VERIFIKASI': 'Undangan Verifikasi',
    'SLO_FINAL': 'SLO Final'
  };
  return types[type] || null;
};
</script>
