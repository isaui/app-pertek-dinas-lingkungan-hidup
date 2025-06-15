<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white border border-slate-200 rounded-lg p-6">
      <h3 class="text-lg font-medium text-slate-900 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Semua Dokumen
      </h3>
      <p class="mt-1 text-sm text-slate-500">
        Dokumen yang tersedia dalam pengajuan PERTEK Anda
      </p>
      
      <!-- Expired documents warning -->
      <div v-if="totalExpiredCount > 0" class="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
        <div class="flex items-center">
          <svg class="h-4 w-4 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-sm font-medium text-red-800">
            {{ totalExpiredCount }} dokumen sudah kedaluwarsa
          </span>
        </div>
        <p class="text-xs text-red-600 mt-1 ml-6">
          Dokumen yang kedaluwarsa tidak lagi berlaku
        </p>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="!documents || documents.length === 0" class="bg-white border border-slate-200 rounded-lg p-8">
      <div class="text-center text-slate-500">
        <svg class="mx-auto h-12 w-12 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="mt-4 text-sm">Tidak ada dokumen yang tersedia</p>
      </div>
    </div>
    
    <!-- Documents List -->
    <div v-if="documents && documents.length > 0" class="space-y-4">
      <!-- Group documents by type -->
      <div v-for="(group, groupType) in groupedDocuments" :key="groupType" class="bg-white border border-slate-200 rounded-lg">
        <div class="px-6 py-4 border-b border-slate-200">
          <h4 class="text-md font-medium text-slate-900">{{ getDocumentTypeLabel(groupType) }}</h4>
          <p class="text-sm text-slate-500 mt-1">{{ getDocumentTypeDescription(groupType) }}</p>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="doc in group" :key="doc.id" :class="[
              'flex items-center justify-between p-4 rounded-lg transition-colors',
              doc.expired 
                ? 'bg-red-50 border border-red-200 hover:bg-red-100' 
                : 'bg-slate-50 hover:bg-slate-100'
            ]">
              <!-- Document info -->
              <div class="flex items-center space-x-4">
                <!-- Document icon -->
                <div :class="[
                  'p-2 rounded-lg relative',
                  doc.expired 
                    ? 'bg-red-100 text-red-600' 
                    : getDocumentIconClasses(doc.type)
                ]">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <!-- Expired overlay icon -->
                  <div v-if="doc.expired" class="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5">
                    <svg class="h-2 w-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                
                <!-- Document details -->
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <span :class="[
                      'text-sm font-medium',
                      doc.expired ? 'text-red-900' : 'text-slate-900'
                    ]">
                      {{ cleanFilename(doc.filename) }}
                    </span>
                    <!-- Expired badge -->
                    <span v-if="doc.expired" class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kedaluwarsa
                    </span>
                  </div>
                  <div :class="[
                    'text-xs space-x-2 mt-1',
                    doc.expired ? 'text-red-600' : 'text-slate-500'
                  ]">
                    <span>{{ formatFileSize(doc.size || 0) }}</span>
                    <span>•</span>
                    <span>{{ formatDate(doc.uploadedAt || doc.createdAt) }}</span>
                  </div>
                  <div v-if="doc.description" :class="[
                    'text-xs mt-1',
                    doc.expired ? 'text-red-500' : 'text-slate-400'
                  ]">
                    {{ cleanFilename(doc.description) }}
                  </div>
                  <!-- Expired warning message -->
                  <div v-if="doc.expired" class="text-xs text-red-600 mt-1 flex items-center">
                    <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {{ getExpiredMessage(doc.type) }}
                  </div>
                </div>
              </div>
              
              <!-- Action buttons -->
              <div class="flex space-x-2">
                <!-- Document type badge -->
                <span :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  doc.expired 
                    ? 'bg-red-100 text-red-800' 
                    : getDocumentTypeBadgeClasses(doc.type)
                ]">
                  {{ getDocumentTypeShortLabel(doc.type) }}
                </span>
                
                <!-- Download button -->
                <button 
                  @click="downloadDocument(doc)" 
                  :class="[
                    'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center transition-colors focus:outline-none focus:ring-2',
                    doc.expired 
                      ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500' 
                      : 'bg-blue-500 text-white hover:bg-blue-700 focus:ring-blue-500'
                  ]"
                  :title="doc.expired ? 'Download dokumen kedaluwarsa' : 'Download dokumen'"
                >
                  <svg class="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                  <svg v-if="doc.expired" class="ml-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Statistics -->
    <div v-if="documents && documents.length > 0" class="bg-white border border-slate-200 rounded-lg p-6">
      <h4 class="text-md font-medium text-slate-900 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Ringkasan Dokumen
      </h4>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="stat in documentStats" :key="stat.type" class="text-center p-4 bg-slate-50 rounded-lg">
          <div :class="['text-2xl font-bold', stat.color]">
            {{ stat.count }}
          </div>
          <div class="text-xs text-slate-600 mt-1">{{ stat.label }}</div>
          <div v-if="stat.expired > 0" class="text-xs text-red-600 mt-1 font-medium">
            {{ stat.expired }} kedaluwarsa
          </div>
        </div>
      </div>
      
      <div class="mt-4 pt-4 border-t border-slate-200">
        <div class="flex items-center justify-between text-sm">
          <span class="text-slate-600">Total dokumen:</span>
          <span class="font-medium text-slate-900">{{ documents.length }} file</span>
        </div>
        <div class="flex items-center justify-between text-sm mt-1">
          <span class="text-slate-600">Total ukuran:</span>
          <span class="font-medium text-slate-900">{{ totalFileSize }}</span>
        </div>
        <div v-if="totalExpiredCount > 0" class="flex items-center justify-between text-sm mt-1">
          <span class="text-slate-600">Dokumen kedaluwarsa:</span>
          <span class="font-medium text-red-600">{{ totalExpiredCount }} file</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  documents: {
    type: Array,
    default: () => []
  },
  pertekId: {
    type: String,
    required: true
  }
});

// Group documents by their type
const groupedDocuments = computed(() => {
  const groups = {};
  
  const cleanedDocs = props.documents.map(doc => ({
    ...doc,
    filename: cleanFilename(doc.filename || ''),
    description: doc.description?.replace(/\s*\(auto-uploaded\)/gi, '') || ''
  }));
  
  cleanedDocs.forEach(doc => {
    if (!groups[doc.type]) {
      groups[doc.type] = [];
    }
    groups[doc.type].push(doc);
  });
  
  return groups;
});

// Document statistics
const documentStats = computed(() => {
  const stats = [
    { type: 'PERSYARATAN', label: 'Persyaratan', count: 0, expired: 0, color: 'text-blue-600' },
    { type: 'REVISI', label: 'Revisi', count: 0, expired: 0, color: 'text-green-600' },
    { type: 'SURAT_UNDANGAN_PAPARAN', label: 'Surat Undangan', count: 0, expired: 0, color: 'text-purple-600' },
    { type: 'PERTEK_FINAL', label: 'PERTEK Final', count: 0, expired: 0, color: 'text-emerald-600' }
  ];
  
  props.documents.forEach(doc => {
    const stat = stats.find(s => s.type === doc.type);
    if (stat) {
      stat.count++;
      if (doc.expired) {
        stat.expired++;
      }
    }
  });
  
  return stats;
});

// Total file size and expired count
const totalFileSize = computed(() => {
  const totalBytes = props.documents.reduce((total, doc) => total + (doc.size || 0), 0);
  return formatFileSize(totalBytes);
});

const totalExpiredCount = computed(() => {
  return props.documents.filter(doc => doc.expired).length;
});

// Clean filename by removing auto-uploaded text
const cleanFilename = (filename) => {
  return filename?.replace(/\s*\(auto-uploaded\)/gi, '') || '';
};

// Download document function
const downloadDocument = (document) => {
  if (document.fileUrl) {
    window.open(document.fileUrl, '_blank');
  } else if (document.url) {
    window.open(document.url, '_blank');
  } else {
    // Fallback to API endpoint
    const url = `/api/pertek/documents/${document.id}/download`;
    window.open(url, '_blank');
  }
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const getExpiredMessage = (type) => {
  const messages = {
    'PERSYARATAN': 'Dokumen persyaratan tidak berlaku lagi',
    'REVISI': 'Dokumen revisi sudah kedaluwarsa',
    'SURAT_UNDANGAN_PAPARAN': 'Surat undangan sudah lewat masa berlaku',
    'PERTEK_FINAL': 'PERTEK sudah tidak berlaku lagi'
  };
  
  return messages[type] || 'Dokumen sudah kedaluwarsa';
};

const getDocumentTypeLabel = (type) => {
  const types = {
    'PERSYARATAN': 'Dokumen Persyaratan',
    'REVISI': 'Dokumen Revisi',
    'SURAT_UNDANGAN_PAPARAN': 'Surat Undangan Paparan',
    'PERTEK_FINAL': 'Dokumen PERTEK Final'
  };
  
  return types[type] || type;
};

const getDocumentTypeDescription = (type) => {
  const descriptions = {
    'PERSYARATAN': 'Dokumen awal yang Anda ajukan saat permohonan',
    'REVISI': 'Dokumen hasil revisi berdasarkan feedback paparan',
    'SURAT_UNDANGAN_PAPARAN': 'Surat undangan paparan dari admin',
    'PERTEK_FINAL': 'Dokumen PERTEK resmi yang telah diterbitkan'
  };
  
  return descriptions[type] || '';
};

const getDocumentTypeShortLabel = (type) => {
  const labels = {
    'PERSYARATAN': 'Persyaratan',
    'REVISI': 'Revisi',
    'SURAT_UNDANGAN_PAPARAN': 'Undangan',
    'PERTEK_FINAL': 'Final'
  };
  
  return labels[type] || type;
};

const getDocumentIconClasses = (type) => {
  const classes = {
    'PERSYARATAN': 'bg-blue-100 text-blue-600',
    'REVISI': 'bg-green-100 text-green-600',
    'SURAT_UNDANGAN_PAPARAN': 'bg-purple-100 text-purple-600',
    'PERTEK_FINAL': 'bg-emerald-100 text-emerald-600'
  };
  
  return classes[type] || 'bg-slate-100 text-slate-600';
};

const getDocumentTypeBadgeClasses = (type) => {
  const classes = {
    'PERSYARATAN': 'bg-blue-100 text-blue-800',
    'REVISI': 'bg-green-100 text-green-800',
    'SURAT_UNDANGAN_PAPARAN': 'bg-purple-100 text-purple-800',
    'PERTEK_FINAL': 'bg-emerald-100 text-emerald-800'
  };
  
  return classes[type] || 'bg-slate-100 text-slate-800';
};
</script>