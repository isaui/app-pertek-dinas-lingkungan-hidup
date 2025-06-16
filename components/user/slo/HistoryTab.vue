<template>
    <div class="space-y-6">
      <!-- Timeline -->
      <div class="bg-white border border-slate-200 rounded-lg">
        <div class="px-6 py-4 border-b border-slate-200">
          <h3 class="text-lg font-medium text-slate-900">Riwayat Permohonan</h3>
          <p class="mt-1 text-sm text-slate-500">
            Timeline perubahan status dan feedback untuk permohonan SLO Anda
          </p>
        </div>
        
        <div class="p-6">
          <div v-if="timeline.length === 0" class="text-center py-8 text-slate-500">
            Tidak ada riwayat aktivitas
          </div>
          
          <div v-else class="flow-root">
            <ul role="list" class="-mb-8">
              <li v-for="(item, idx) in timeline" :key="item.id" class="relative pb-8">
                <!-- Connecting Line -->
                <span v-if="idx !== timeline.length - 1" 
                      class="absolute top-8 left-4 -ml-px h-full w-0.5 bg-slate-200" 
                      aria-hidden="true"></span>
                
                <!-- Timeline Item -->
                <div class="relative flex space-x-3">
                  <!-- Icon -->
                  <div :class="getItemIconClass(item)" class="h-8 w-8 rounded-full flex items-center justify-center">
                    <component :is="getItemIcon(item)" class="w-4 h-4" />
                  </div>
                  
                  <!-- Content -->
                  <div class="min-w-0 flex-1">
                    <!-- Header -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <span :class="getItemTypeClass(item)" class="px-2 py-1 text-xs font-medium rounded-full">
                          {{ getItemTypeLabel(item) }}
                        </span>
                      </div>
                      <span class="text-xs text-slate-500">{{ formatDateTime(item.createdAt) }}</span>
                    </div>
                    
                    <!-- Status Change Content -->
                    <div v-if="item.type === 'status'" class="mt-2">
                      <div class="bg-slate-50 rounded-lg p-4">
                        <div class="flex items-center space-x-3">
                          <span :class="getStatusClass(item.status)" 
                                class="px-2 py-1 text-xs font-medium rounded">
                            {{ getStatusLabel(item.status) }}
                          </span>
                        </div>
                        <div v-if="item.notes" class="mt-2 text-sm text-slate-700">
                          {{ item.notes }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Feedback Content -->
                    <div v-if="item.type === 'feedback'" class="mt-2">
                      <div class="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-200">
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center space-x-2">
                            <span :class="getRequirementTypeClass(item.requirementType)" 
                                  class="px-2 py-1 text-xs font-medium rounded-full">
                              {{ getRequirementTypeLabel(item.requirementType) }}
                            </span>
                            <span v-if="!item.isResolved" 
                                  class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                              Perlu Tindak Lanjut
                            </span>
                            <span v-else 
                                  class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Sudah Ditindaklanjuti
                            </span>
                          </div>
                        </div>
                        <div class="text-sm text-slate-700 leading-relaxed mb-3">
                          {{ item.feedbackText }}
                        </div>
                        <div v-if="item.document" class="flex items-center text-xs text-slate-600 bg-white rounded p-2">
                          <span class="font-medium">Terkait dokumen:</span>
                          <button @click="downloadDocument(item.document)" 
                                  class="ml-2 text-blue-600 hover:text-blue-800 underline">
                            {{ item.document.filename }}
                          </button>
                        </div>
                        <div v-if="!item.isResolved" class="mt-3 flex justify-end">
                          <button @click="resolveFeedback(item.id)"
                                  :disabled="resolvingFeedback"
                                  class="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
                            <span v-if="resolvingFeedback">Memproses...</span>
                            <span v-else>Tandai Selesai</span>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Document Content -->
                    <div v-if="item.type === 'document'" class="mt-2">
                      <div class="bg-green-50 rounded-lg p-4 border-l-4 border-green-200">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-3">
                            <div class="text-green-600">📄</div>
                            <div>
                              <div class="text-sm font-medium text-slate-900">{{ item.filename }}</div>
                              <div class="text-xs text-slate-500">
                                {{ getDocumentTypeLabel(item.documentType) }} • {{ formatFileSize(item.size) }}
                              </div>
                            </div>
                          </div>
                          <button @click="downloadDocument(item)" 
                                  class="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import SLOStatusBadge from '~/components/slo/StatusBadge.vue'
  
  const props = defineProps({
    slo: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits(['feedback-resolved'])
  
  // State
  const resolvingFeedback = ref(false)
  
  // Combined timeline data
  const timeline = computed(() => {
    const items = []
    
    // Add status history
    if (props.slo.statusHistory) {
      props.slo.statusHistory.forEach(status => {
        items.push({
          id: `status-${status.id}`,
          type: 'status',
          status: status.status,
          notes: status.notes,
          createdAt: status.createdAt
        })
      })
    }
    
    // Add feedback items
    if (props.slo.requirementFeedback) {
      props.slo.requirementFeedback.forEach(feedback => {
        items.push({
          id: `feedback-${feedback.id}`,
          type: 'feedback',
          requirementType: feedback.requirementType,
          feedbackText: feedback.feedbackText,
          isResolved: feedback.isResolved,
          document: feedback.document,
          createdAt: feedback.createdAt
        })
      })
    }
    
    // Add documents
    if (props.slo.documents) {
      props.slo.documents.forEach(doc => {
        items.push({
          id: `document-${doc.id}`,
          type: 'document',
          filename: doc.filename,
          documentType: doc.type,
          size: doc.size,
          fileUrl: doc.fileUrl,
          createdAt: doc.uploadedAt
        })
      })
    }
    
    // Sort by date (newest first)
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  })
  
  // Methods
  const resolveFeedback = async (feedbackId) => {
    try {
      resolvingFeedback.value = true
      
      const response = await $fetch(`/api/slo/feedback/${feedbackId}/resolve`, {
        method: 'PUT'
      })
      
      if (response.success) {
        emit('feedback-resolved', feedbackId)
      }
    } catch (error) {
      console.error('Error resolving feedback:', error)
      alert('Gagal menandai feedback sebagai selesai')
    } finally {
      resolvingFeedback.value = false
    }
  }
  
  const downloadDocument = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    }
  }
  
  // Helper functions
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Tidak tersedia'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return new Intl.DateTimeFormat('id-ID', {
        timeStyle: 'short'
      }).format(date) + ' (hari ini)'
    } else if (diffInHours < 48) {
      return 'Kemarin, ' + new Intl.DateTimeFormat('id-ID', {
        timeStyle: 'short'
      }).format(date)
    } else {
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date)
    }
  }
  
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
  
  const getItemIcon = (item) => {
    const icons = {
      'status': 'svg',
      'feedback': 'svg', 
      'document': 'svg'
    }
    
    // Return appropriate SVG component or just 'svg'
    return 'svg'
  }
  
  const getItemIconClass = (item) => {
    const classes = {
      'status': 'bg-blue-100 text-blue-600',
      'feedback': item.isResolved ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600',
      'document': 'bg-green-100 text-green-600'
    }
    
    return classes[item.type] || 'bg-slate-100 text-slate-600'
  }
  
  const getItemTypeClass = (item) => {
    const classes = {
      'status': 'bg-blue-100 text-blue-800',
      'feedback': 'bg-amber-100 text-amber-800',
      'document': 'bg-green-100 text-green-800'
    }
    
    return classes[item.type] || 'bg-slate-100 text-slate-800'
  }
  
  const getItemTypeLabel = (item) => {
    const labels = {
      'status': 'Perubahan Status',
      'feedback': 'Feedback',
      'document': 'Dokumen'
    }
    
    return labels[item.type] || 'Aktivitas'
  }
  
  const getStatusClass = (status) => {
    const classes = {
      'SUBMITTED': 'bg-slate-100 text-slate-800',
      'VERIFICATION': 'bg-blue-100 text-blue-800',
      'INCOMPLETE_REQUIREMENTS': 'bg-red-100 text-red-800',
      'COMPLETE_REQUIREMENTS': 'bg-green-100 text-green-800',
      'FIELD_VERIFICATION_SCHEDULED': 'bg-purple-100 text-purple-800',
      'FIELD_VERIFICATION_COMPLETED': 'bg-yellow-100 text-yellow-800',
      'REVISION_SUBMITTED': 'bg-indigo-100 text-indigo-800',
      'REVISION_REVIEW': 'bg-blue-100 text-blue-800',
      'REVISION_REJECTED': 'bg-red-100 text-red-800',
      'REVISION_APPROVED': 'bg-green-100 text-green-800',
      'SLO_ISSUED': 'bg-emerald-100 text-emerald-800',
      'REJECTED': 'bg-red-100 text-red-800'
    }
    
    return classes[status] || 'bg-slate-100 text-slate-800'
  }
  
  const getStatusLabel = (status) => {
    const labels = {
      'SUBMITTED': 'Diajukan',
      'VERIFICATION': 'Verifikasi',
      'INCOMPLETE_REQUIREMENTS': 'Persyaratan Tidak Lengkap',
      'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
      'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi Lapangan Dijadwalkan',
      'FIELD_VERIFICATION_COMPLETED': 'Verifikasi Lapangan Selesai',
      'REVISION_SUBMITTED': 'Revisi Diajukan',
      'REVISION_REVIEW': 'Review Revisi',
      'REVISION_REJECTED': 'Revisi Ditolak',
      'REVISION_APPROVED': 'Revisi Disetujui',
      'SLO_ISSUED': 'SLO Diterbitkan',
      'REJECTED': 'Ditolak'
    }
    
    return labels[status] || status
  }
  
  const getDocumentTypeLabel = (type) => {
    const types = {
      'PERSYARATAN': 'Dokumen Persyaratan',
      'REVISI': 'Dokumen Revisi',
      'SURAT_UNDANGAN_VERIFIKASI': 'Surat Undangan Verifikasi',
      'SLO_FINAL': 'Dokumen SLO Final'
    }
    
    return types[type] || type
  }
  
  const getRequirementTypeLabel = (type) => {
    const types = {
      'DOK_PERIZINAN_BERUSAHA': 'Dokumen Perizinan Berusaha',
      'PERSETUJUAN_LINGKUNGAN': 'Persetujuan Lingkungan',
      'PERSETUJUAN_TEKNIS': 'Persetujuan Teknis',
      'HASIL_PEMANTAUAN_EMISI': 'Hasil Pemantauan Emisi',
      'SERTIFIKAT_REGISTRASI_LAB': 'Sertifikat Registrasi Laboratorium',
      'DOKUMEN_REVISI': 'Dokumen Revisi',
      'OTHER': 'Lainnya'
    }
    
    return types[type] || type
  }
  
  const getRequirementTypeClass = (type) => {
    const classes = {
      'DOK_PERIZINAN_BERUSAHA': 'bg-blue-100 text-blue-800',
      'PERSETUJUAN_LINGKUNGAN': 'bg-green-100 text-green-800',
      'PERSETUJUAN_TEKNIS': 'bg-purple-100 text-purple-800',
      'HASIL_PEMANTAUAN_EMISI': 'bg-yellow-100 text-yellow-800',
      'SERTIFIKAT_REGISTRASI_LAB': 'bg-indigo-100 text-indigo-800',
      'DOKUMEN_REVISI': 'bg-orange-100 text-orange-800',
      'OTHER': 'bg-slate-100 text-slate-800'
    }
    
    return classes[type] || 'bg-slate-100 text-slate-800'
  }
  </script>