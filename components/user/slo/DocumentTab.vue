<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-slate-900 mb-2">Dokumen SLO</h3>
        <p class="text-sm text-slate-500 mb-4">
          Semua dokumen yang terkait dengan permohonan SLO Anda
        </p>
        
        <!-- Document Summary -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-3 bg-slate-50 rounded-lg">
            <div class="text-xl font-bold text-slate-900">{{ getTotalDocuments() }}</div>
            <div class="text-xs text-slate-500">Total Dokumen</div>
          </div>
          <div class="text-center p-3 bg-blue-50 rounded-lg">
            <div class="text-xl font-bold text-blue-600">{{ getDocumentsByType('PERSYARATAN').length }}</div>
            <div class="text-xs text-slate-500">Persyaratan</div>
          </div>
          <div class="text-center p-3 bg-indigo-50 rounded-lg">
            <div class="text-xl font-bold text-indigo-600">{{ getDocumentsByType('REVISI').length }}</div>
            <div class="text-xs text-slate-500">Revisi</div>
          </div>
          <div class="text-center p-3 bg-green-50 rounded-lg">
            <div class="text-xl font-bold text-green-600">{{ getAdminDocuments().length }}</div>
            <div class="text-xs text-slate-500">Dari Admin</div>
          </div>
        </div>
      </div>
  
      <!-- Empty State -->
      <div v-if="!documents || documents.length === 0" class="bg-white border border-slate-200 rounded-lg p-8">
        <div class="text-center text-slate-500">
          <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-slate-900">Belum ada dokumen</h3>
          <p class="mt-1 text-sm text-slate-500">Dokumen akan muncul di sini setelah Anda mengupload persyaratan.</p>
        </div>
      </div>
  
      <!-- Documents by Category -->
      <div v-else class="space-y-6">
        
        <!-- Dokumen Persyaratan -->
        <div v-if="getDocumentsByType('PERSYARATAN').length > 0" class="bg-white border border-slate-200 rounded-lg">
          <div class="px-6 py-4 border-b border-slate-200 bg-blue-50">
            <div class="flex items-center justify-between">
              <h4 class="text-md font-medium text-slate-900 flex items-center">
                <svg class="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Dokumen Persyaratan
              </h4>
              <span class="text-sm text-slate-500">{{ getDocumentsByType('PERSYARATAN').length }} dokumen</span>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div v-for="doc in getDocumentsByType('PERSYARATAN')" :key="doc.id" 
                   :class="[
                     'flex items-center justify-between p-4 rounded-lg border transition-colors',
                     doc.expired 
                       ? 'bg-red-50 border-red-200' 
                       : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                   ]">
                <div class="flex items-center space-x-4">
                  <div :class="[
                    'p-2 rounded-lg',
                    doc.expired 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-blue-100 text-blue-600'
                  ]">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <span :class="[
                        'text-sm font-medium',
                        doc.expired ? 'text-red-900' : 'text-slate-900'
                      ]">
                        {{ doc.filename }}
                      </span>
                      <span v-if="doc.expired" class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Kedaluwarsa
                      </span>
                    </div>
                    <div class="text-xs text-slate-500 mt-1">
                      {{ formatFileSize(doc.size || 0) }} • {{ formatDateTime(doc.uploadedAt) }}
                    </div>
                  </div>
                </div>
                <button @click="downloadDocument(doc)"
                        class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Dokumen Revisi -->
        <div v-if="getDocumentsByType('REVISI').length > 0" class="bg-white border border-slate-200 rounded-lg">
          <div class="px-6 py-4 border-b border-slate-200 bg-indigo-50">
            <div class="flex items-center justify-between">
              <h4 class="text-md font-medium text-slate-900 flex items-center">
                <svg class="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Dokumen Revisi
              </h4>
              <span class="text-sm text-slate-500">{{ getDocumentsByType('REVISI').length }} dokumen</span>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div v-for="doc in getDocumentsByType('REVISI')" :key="doc.id" 
                   :class="[
                     'flex items-center justify-between p-4 rounded-lg border transition-colors',
                     doc.expired 
                       ? 'bg-red-50 border-red-200' 
                       : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                   ]">
                <div class="flex items-center space-x-4">
                  <div :class="[
                    'p-2 rounded-lg',
                    doc.expired 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-indigo-100 text-indigo-600'
                  ]">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <span :class="[
                        'text-sm font-medium',
                        doc.expired ? 'text-red-900' : 'text-slate-900'
                      ]">
                        {{ doc.filename }}
                      </span>
                      <span v-if="doc.expired" class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        Kedaluwarsa
                      </span>
                    </div>
                    <div class="text-xs text-slate-500 mt-1">
                      {{ formatFileSize(doc.size || 0) }} • {{ formatDateTime(doc.uploadedAt) }}
                    </div>
                  </div>
                </div>
                <button @click="downloadDocument(doc)"
                        class="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Dokumen dari Admin -->
        <div v-if="getAdminDocuments().length > 0" class="bg-white border border-slate-200 rounded-lg">
          <div class="px-6 py-4 border-b border-slate-200 bg-green-50">
            <div class="flex items-center justify-between">
              <h4 class="text-md font-medium text-slate-900 flex items-center">
                <svg class="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Dokumen dari Admin
              </h4>
              <span class="text-sm text-slate-500">{{ getAdminDocuments().length }} dokumen</span>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-3">
              <div v-for="doc in getAdminDocuments()" :key="doc.id" 
                   class="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors">
                <div class="flex items-center space-x-4">
                  <div class="p-2 rounded-lg bg-green-100 text-green-600">
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm font-medium text-slate-900">{{ doc.filename }}</span>
                      <span :class="getAdminDocumentBadgeClass(doc.type)" 
                            class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ getAdminDocumentLabel(doc.type) }}
                      </span>
                    </div>
                    <div class="text-xs text-slate-500 mt-1">
                      {{ formatFileSize(doc.size || 0) }} • {{ formatDateTime(doc.uploadedAt) }}
                    </div>
                    <div v-if="doc.description" class="text-xs text-slate-600 mt-1">
                      {{ doc.description }}
                    </div>
                  </div>
                </div>
                <button @click="downloadDocument(doc)"
                        class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Quick Actions -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 class="text-sm font-medium text-blue-900 mb-3">Tindakan Cepat</h4>
          <div class="flex flex-wrap gap-2">
            <button @click="downloadAllDocuments"
                    v-if="documents.length > 0"
                    class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
              Download Semua
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    documents: {
      type: Array,
      default: () => []
    },
    sloId: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['documents-updated'])
  
  // Computed properties
  const getTotalDocuments = () => {
    return props.documents?.length || 0
  }
  
  const getDocumentsByType = (type) => {
    return props.documents?.filter(doc => doc.type === type) || []
  }
  
  const getAdminDocuments = () => {
    return props.documents?.filter(doc => 
      ['SURAT_UNDANGAN_VERIFIKASI', 'SLO_FINAL'].includes(doc.type)
    ) || []
  }
  
  // Methods
  const downloadDocument = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }
  
  const downloadAllDocuments = () => {
    // This would trigger a bulk download from the API
    window.open(`/api/slo/detail/${props.sloId}/download`, '_blank')
  }
  
  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date)
  }
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
  
  const getAdminDocumentLabel = (type) => {
    const labels = {
      'SURAT_UNDANGAN_VERIFIKASI': 'Surat Undangan',
      'SLO_FINAL': 'SLO Final'
    }
    return labels[type] || type
  }
  
  const getAdminDocumentBadgeClass = (type) => {
    const classes = {
      'SURAT_UNDANGAN_VERIFIKASI': 'bg-purple-100 text-purple-800',
      'SLO_FINAL': 'bg-emerald-100 text-emerald-800'
    }
    return classes[type] || 'bg-slate-100 text-slate-800'
  }
  </script>