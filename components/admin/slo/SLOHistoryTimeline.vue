<template>
    <div class="space-y-6">
  
      <!-- Timeline -->
      <div class="bg-white border border-gray-200 rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Riwayat Lengkap</h3>
          <p class="mt-1 text-sm text-gray-500">
            Timeline perubahan status dengan feedback dan dokumen terkait
          </p>
        </div>
        
        <div class="p-6">
          <div v-if="filteredTimeline.length === 0" class="text-center py-8 text-gray-500">
            Tidak ada riwayat aktivitas
          </div>
          
          <div v-else class="flow-root">
            <ul role="list" class="-mb-8">
              <li v-for="(group, groupIdx) in filteredTimeline" :key="group.id" class="relative pb-8">
                <!-- Connecting Line -->
                <span v-if="groupIdx !== filteredTimeline.length - 1" 
                      class="absolute top-8 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                      aria-hidden="true"></span>
                
                <!-- Main Timeline Item (Status Update) -->
                <div class="relative flex space-x-3">
                  <!-- Icon -->
                  <div :class="getItemIconClass(group)" class="h-8 w-8 rounded-full flex items-center justify-center">
                    <div class="w-2 h-2 bg-current rounded-full"></div>
                  </div>
                  
                  <!-- Content -->
                  <div class="min-w-0 flex-1">
                    <!-- Header -->
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <span :class="getItemTypeClass(group)" class="px-2 py-1 text-xs font-medium rounded-full">
                          {{ getItemTypeLabel(group) }}
                        </span>
                        <span v-if="group.isBypass" 
                              class="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Bypass Admin
                        </span>
                      </div>
                      <span class="text-xs text-gray-500">{{ formatDateTime(group.createdAt) }}</span>
                    </div>
                    
                    <!-- Status Change Content -->
                    <div class="mt-2">
                      <div class="bg-gray-50 rounded-lg p-4">
                        <!-- Show arrow only if it's not the first status -->
                        <div v-if="group.fromStatus" class="flex items-center space-x-3">
                          <span :class="getStatusClass(group.fromStatus)" 
                                class="px-2 py-1 text-xs font-medium rounded">
                            {{ getStatusLabel(group.fromStatus) }}
                          </span>
                          <span class="text-gray-400">→</span>
                          <span :class="getStatusClass(group.status)" 
                                class="px-2 py-1 text-xs font-medium rounded">
                            {{ getStatusLabel(group.status) }}
                          </span>
                        </div>
                        <!-- Show single status for first status -->
                        <div v-else class="flex items-center">
                          <span :class="getStatusClass(group.status)" 
                                class="px-2 py-1 text-xs font-medium rounded">
                            {{ getStatusLabel(group.status) }}
                          </span>
                        </div>
                        <div v-if="group.changedBy" class="mt-2 text-xs text-gray-500">
                          Diubah oleh: {{ group.changedBy }}
                        </div>
                      </div>
                    </div>
                    
                    <!-- Children Items (Feedback & Documents related to this status) -->
                    <div v-if="group.children && group.children.length > 0" class="mt-4 ml-6 space-y-3">
                      <div v-for="child in group.children" :key="child.id" class="relative">
                        <!-- Child connecting line -->
                        <div class="absolute -left-3 top-3 w-3 h-0.5 bg-gray-300"></div>
                        <div class="absolute -left-3 top-0 w-0.5 h-3 bg-gray-300"></div>
                        
                        <!-- Feedback Child -->
                        <div v-if="child.type === 'feedback'" class="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-200">
                          <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center space-x-2">
                              <span class="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full font-medium">
                                Feedback
                              </span>
                              <span v-if="child.requirementType" :class="getRequirementTypeClass(child.requirementType)" 
                                    class="px-2 py-1 text-xs font-medium rounded-full">
                                {{ getRequirementTypeLabel(child.requirementType) }}
                              </span>
                              <span v-if="child.isResolved === false" 
                                    class="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Menunggu Tindak Lanjut oleh Pemohon
                              </span>
                              <span v-if="child.isResolved === true" 
                                    class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Ditandai Selesai oleh Pemohon
                              </span>
                            </div>
                            <span class="text-xs text-gray-500">{{ formatDateTime(child.createdAt) }}</span>
                          </div>
                          <div class="text-sm text-gray-700 leading-relaxed">
                            {{ child.feedbackText?.replace(/\[ADMIN BYPASS\]\s*/, '') }}
                          </div>
                          <div v-if="child.document" class="mt-2 flex items-center text-xs text-gray-600 bg-white rounded p-2">
                            <span class="font-medium">Terkait dokumen:</span>
                            <button @click="downloadDocument(child.document)" 
                                    class="ml-2 text-blue-600 hover:text-blue-800 underline">
                              {{ child.document.filename }}
                            </button>
                          </div>
                        </div>
                        
                        <!-- Document Child -->
                        <div v-if="child.type === 'document'" class="bg-green-50 rounded-lg p-3 border-l-4 border-green-200">
                          <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                              <div class="text-green-600">📄</div>
                              <div>
                                <div class="flex items-center space-x-2 mb-1">
                                  <span class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                                    Dokumen
                                  </span>
                                  <span class="text-xs text-gray-500">{{ formatDateTime(child.createdAt) }}</span>
                                </div>
                                <div class="text-sm font-medium text-gray-900">{{ child.filename }}</div>
                                <div class="text-xs text-gray-500">
                                  {{ getDocumentTypeLabel(child.documentType) }} • {{ formatFileSize(child.size) }}
                                </div>
                              </div>
                            </div>
                            <button @click="downloadDocument(child)" 
                                    class="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700">
                              Download
                            </button>
                          </div>
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
  
  <script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  
  const props = defineProps({
    sloId: {
      type: String,
      required: true
    },
    slo: {
      type: Object,
      required: true
    }
  })
  
  const emit = defineEmits([])
  
  // Combined timeline data
  const timeline = ref<any[]>([])
  
  // Computed timeline for display
  const filteredTimeline = computed(() => {
    return timeline.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  })
  
  // Create combined timeline on mount
  onMounted(() => {
    createTimeline()
  })
  
  // Watch untuk slo agar timeline diperbarui ketika slo berubah
  watch(() => props.slo, (newValue) => {
    if (newValue) {
      createTimeline()
    }
  }, { deep: true })
  
  const createTimeline = () => {
    const statusItems: any[] = []
    const feedbackItems: any[] = []
    const documentItems: any[] = []
  
    // Collect all items
    if (props.slo.statusHistory) {
      props.slo.statusHistory.forEach((status: any, index: number) => {
        const previousStatus = props.slo.statusHistory[index + 1]
        statusItems.push({
          id: `status-${status.id}`,
          type: 'status',
          status: status.status,
          fromStatus: previousStatus?.status,
          notes: status.notes,
          changedBy: status.changedBy?.name,
          createdAt: status.createdAt,
          isBypass: status.notes?.includes('[ADMIN BYPASS]'),
          children: []
        })
      })
    }
  
    if (props.slo.requirementFeedback) {
      props.slo.requirementFeedback.forEach((feedback: any) => {
        feedbackItems.push({
          id: `feedback-${feedback.id}`,
          type: 'feedback',
          feedbackText: feedback.feedbackText,
          requirementType: feedback.requirementType,
          isResolved: feedback.isResolved,
          document: feedback.document,
          createdAt: feedback.createdAt,
          isBypass: feedback.feedbackText?.includes('[ADMIN BYPASS]')
        })
      })
    }
  
    if (props.slo.documents) {
      props.slo.documents.forEach((doc: any) => {
        documentItems.push({
          id: `document-${doc.id}`,
          type: 'document',
          filename: doc.filename,
          documentType: doc.type,
          size: doc.size,
          description: doc.description,
          fileUrl: doc.fileUrl,
          createdAt: doc.uploadedAt,
          isBypass: false
        })
      })
    }
  
    // Combine all items and sort by timestamp
    const allItems = [...statusItems, ...feedbackItems, ...documentItems]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  
    // Group children under their parent status
    const timelineWithChildren: any[] = []
    let currentStatusItem: any = null
  
    allItems.forEach(item => {
      if (item.type === 'status') {
        // If we have a previous status, add it to timeline first
        if (currentStatusItem) {
          timelineWithChildren.push(currentStatusItem)
        }
        // Start new status group
        currentStatusItem = { ...item, children: [] }
      } else {
        // This is a feedback or document, add to current status as child
        if (currentStatusItem) {
          currentStatusItem.children.push(item)
        } else {
          // Edge case: feedback/document before any status (shouldn't happen but handle gracefully)
          timelineWithChildren.push(item)
        }
      }
    })
  
    // Don't forget to add the last status item
    if (currentStatusItem) {
      timelineWithChildren.push(currentStatusItem)
    }
  
    // Sort final timeline by date (most recent first) and sort children within each status
    timeline.value = timelineWithChildren
      .map(item => {
        if (item.children && item.children.length > 0) {
          item.children.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        }
        return item
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
  
  // Download document
  const downloadDocument = (document: any) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank')
    } else {
      // Fallback to API endpoint
      const url = `/api/slo/admin/${props.sloId}/documents/${document.id}/download`
      window.open(url, '_blank')
    }
  }
  
  // Helper functions
  const formatDateTime = (dateString: string | Date | null | undefined) => {
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
  
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B'
    
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }
  
  const getItemIconClass = (item: any) => {
    const classes = {
      'status': 'bg-blue-100 text-blue-600',
      'feedback': item.isResolved ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600',
      'document': 'bg-green-100 text-green-600'
    }
    
    return classes[item.type as keyof typeof classes] || 'bg-gray-100 text-gray-600'
  }
  
  const getItemTypeClass = (item: any) => {
    const classes = {
      'status': 'bg-blue-100 text-blue-800',
      'feedback': 'bg-orange-100 text-orange-800',
      'document': 'bg-green-100 text-green-800'
    }
    
    return classes[item.type as keyof typeof classes] || 'bg-gray-100 text-gray-800'
  }
  
  const getItemTypeLabel = (item: any) => {
    const labels = {
      'status': 'Perubahan Status',
      'feedback': 'Feedback',
      'document': 'Dokumen'
    }
    
    return labels[item.type as keyof typeof labels] || 'Aktivitas'
  }
  
  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      'SUBMITTED': 'bg-gray-100 text-gray-800',
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
    
    return classes[status] || 'bg-gray-100 text-gray-800'
  }
  
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'SUBMITTED': 'Pengajuan Baru',
      'VERIFICATION': 'Proses Verifikasi',
      'INCOMPLETE_REQUIREMENTS': 'Persyaratan Tidak Lengkap',
      'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
      'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi Lapangan Dijadwalkan',
      'FIELD_VERIFICATION_COMPLETED': 'Verifikasi Lapangan Selesai',
      'REVISION_SUBMITTED': 'Revisi Disubmit',
      'REVISION_REVIEW': 'Review Revisi',
      'REVISION_REJECTED': 'Revisi Ditolak',
      'REVISION_APPROVED': 'Revisi Disetujui',
      'SLO_ISSUED': 'SLO Diterbitkan',
      'REJECTED': 'Ditolak'
    }
    
    return labels[status] || status
  }
  
  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'PERSYARATAN': 'Dokumen Persyaratan',
      'REVISI': 'Dokumen Revisi',
      'SURAT_UNDANGAN_VERIFIKASI': 'Surat Undangan Verifikasi',
      'SLO_FINAL': 'Dokumen SLO Final'
    }
    
    return types[type] || type
  }
  
  const getRequirementTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'DOK_PERIZINAN_BERUSAHA': 'Dokumen Perizinan Berusaha',
      'PERSETUJUAN_LINGKUNGAN': 'Persetujuan Lingkungan',
      'PERSETUJUAN_TEKNIS': 'Persetujuan Teknis',
      'HASIL_PEMANTAUAN_EMISI': 'Hasil Pemantauan Emisi',
      'SERTIFIKAT_REGISTRASI_LAB': 'Sertifikat Registrasi Lab',
      'DOKUMEN_REVISI': 'Dokumen Revisi',
      'OTHER': 'Lainnya'
    }
    
    return types[type] || type
  }
  
  const getRequirementTypeClass = (type: string) => {
    const classes: Record<string, string> = {
      'DOK_PERIZINAN_BERUSAHA': 'bg-blue-100 text-blue-800',
      'PERSETUJUAN_LINGKUNGAN': 'bg-green-100 text-green-800',
      'PERSETUJUAN_TEKNIS': 'bg-purple-100 text-purple-800',
      'HASIL_PEMANTAUAN_EMISI': 'bg-orange-100 text-orange-800',
      'SERTIFIKAT_REGISTRASI_LAB': 'bg-cyan-100 text-cyan-800',
      'DOKUMEN_REVISI': 'bg-yellow-100 text-yellow-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    }
    
    return classes[type] || 'bg-gray-100 text-gray-800'
  }
  </script>