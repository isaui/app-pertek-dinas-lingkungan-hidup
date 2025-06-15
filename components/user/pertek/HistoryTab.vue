<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white border border-gray-200 rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Riwayat Permohonan
        </h3>
      </div>
      
      <div class="p-6">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-sm text-gray-500 mt-2">Memuat riwayat...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredTimeline.length === 0" class="text-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat</h3>
          <p class="text-sm text-gray-500">Timeline akan muncul setelah ada perubahan status</p>
        </div>
        
        <!-- Timeline -->
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
                <div :class="getItemIconClass(group, groupIdx)" class="h-8 w-8 rounded-full flex items-center justify-center relative">
                  <div class="w-2 h-2 bg-current rounded-full"></div>
                  <!-- Pulse animation for current status -->
                  <div 
                    v-if="groupIdx === 0"
                    class="absolute -inset-1 w-10 h-10 rounded-full border border-blue-400 animate-ping opacity-75"
                  ></div>
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
                    </div>

                    <!-- Additional Details -->
                    <div v-if="getAdditionalDetails(group).length > 0" class="mt-3">
                      <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <h5 class="text-sm font-medium text-blue-700 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Detail Tambahan
                        </h5>
                        <div class="space-y-1">
                          <p v-for="detail in getAdditionalDetails(group)" :key="detail" class="text-sm text-blue-600">
                            {{ detail }}
                          </p>
                        </div>
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
                      <div v-if="child.type === 'feedback'" class="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-200">
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
                              Menunggu Tindak Lanjut
                            </span>
                            <span v-if="child.isResolved === true" 
                                  class="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Sudah Diselesaikan
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

                        <!-- Resolve Button for User -->
                        <div v-if="!child.isResolved" class="mt-3 flex justify-end">
                          <button
                            @click="resolveFeedback(child.id)"
                            :disabled="resolvingFeedback === child.id"
                            class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                          >
                            <svg v-if="resolvingFeedback === child.id" class="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {{ resolvingFeedback === child.id ? 'Menyimpan...' : 'Tandai Selesai' }}
                          </button>
                        </div>

                        <!-- Resolution info -->
                        <div v-if="child.isResolved && child.resolvedAt" class="mt-2 text-xs text-green-600">
                          Diselesaikan {{ formatRelativeTime(child.resolvedAt) }}
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
                                  class="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors">
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const props = defineProps({
  pertek: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['feedback-resolved'])

// State
const loading = ref(false)
const resolvingFeedback = ref(null)
const timeline = ref([])

// Computed timeline for display
const filteredTimeline = computed(() => {
  return timeline.value.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

// Create combined timeline on mount
onMounted(() => {
  createTimeline()
})

// Watch untuk pertek agar timeline diperbarui ketika pertek berubah
watch(() => props.pertek, (newValue) => {
  if (newValue) {
    createTimeline()
  }
}, { deep: true })

const createTimeline = () => {
  const statusItems = []
  const feedbackItems = []
  const documentItems = []

  // Collect all items
  if (props.pertek.statusHistory) {
    props.pertek.statusHistory.forEach((status, index) => {
      const previousStatus = props.pertek.statusHistory[index + 1]
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

  if (props.pertek.requirementFeedback) {
    props.pertek.requirementFeedback.forEach((feedback) => {
      feedbackItems.push({
        id: `feedback-${feedback.id}`,
        type: 'feedback',
        feedbackText: feedback.feedbackText,
        requirementType: feedback.requirementType,
        isResolved: feedback.isResolved,
        resolvedAt: feedback.resolvedAt,
        document: feedback.document,
        createdAt: feedback.createdAt,
        isBypass: feedback.feedbackText?.includes('[ADMIN BYPASS]')
      })
    })
  }

  if (props.pertek.documents) {
    props.pertek.documents.forEach((doc) => {
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
  const timelineWithChildren = []
  let currentStatusItem = null

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
        item.children.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      }
      return item
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// Resolve feedback function
const resolveFeedback = async (feedbackId) => {
  if (resolvingFeedback.value) return
  
  try {
    resolvingFeedback.value = feedbackId
    
    // Call API to resolve feedback
    const response = await $fetch(`/api/pertek/feedback/${feedbackId}/resolve`, {
      method: 'PUT'
    })
    
    if (response.success) {
      // Update local state
      const feedback = findFeedbackInTimeline(feedbackId)
      if (feedback) {
        feedback.isResolved = true
        feedback.resolvedAt = new Date().toISOString()
      }
      
      // Emit event to parent
      emit('feedback-resolved', feedbackId)
      
      // Show success notification
      console.log('Feedback berhasil ditandai selesai')
    }
  } catch (error) {
    console.error('Error resolving feedback:', error)
    // Show error notification
  } finally {
    resolvingFeedback.value = null
  }
}

const findFeedbackInTimeline = (feedbackId) => {
  for (const item of timeline.value) {
    if (item.children) {
      const feedback = item.children.find(child => 
        child.type === 'feedback' && child.id === `feedback-${feedbackId}`
      )
      if (feedback) return feedback
    }
  }
  return null
}

// Download document
const downloadDocument = (document) => {
  if (document.fileUrl) {
    window.open(document.fileUrl, '_blank')
  } else {
    // Fallback to API endpoint
    const url = `/api/pertek/documents/${document.id}/download`
    window.open(url, '_blank')
  }
}

// Get additional details for status
const getAdditionalDetails = (item) => {
  const details = []
  
  // Add paparan details if applicable
  if (item.status === 'SCHEDULED_PAPARAN' && props.pertek.paparanDate) {
    details.push(`📅 Tanggal Paparan: ${formatDate(props.pertek.paparanDate)}`)
    if (props.pertek.paparanLocation) {
      details.push(`📍 Lokasi: ${props.pertek.paparanLocation}`)
    }
  }
  
  // Add PERTEK number if issued
  if (item.status === 'PERTEK_ISSUED' && props.pertek.pertekNumber) {
    details.push(`📄 Nomor PERTEK: ${props.pertek.pertekNumber}`)
  }
  
  return details
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

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInMinutes < 1) {
    return 'baru saja'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} menit lalu`
  } else if (diffInHours < 24) {
    return `${diffInHours} jam lalu`
  } else if (diffInDays === 1) {
    return 'kemarin'
  } else if (diffInDays < 7) {
    return `${diffInDays} hari lalu`
  } else {
    return formatDate(dateString)
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

const getItemIconClass = (item, index) => {
  // Current/latest status gets pulsing animation
  if (index === 0) {
    return 'bg-blue-100 text-blue-600'
  }
  
  // Completed statuses
  const completedStatuses = ['VERIFICATION', 'COMPLETE_REQUIREMENTS', 'PAPARAN_COMPLETED', 'REVISION_APPROVED', 'PERTEK_ISSUED']
  if (completedStatuses.includes(item.status)) {
    return 'bg-green-100 text-green-600'
  }
  
  // Problem statuses
  const problemStatuses = ['INCOMPLETE_REQUIREMENTS', 'REVISION_REJECTED', 'REJECTED']
  if (problemStatuses.includes(item.status)) {
    return 'bg-red-100 text-red-600'
  }
  
  // Default
  return 'bg-gray-100 text-gray-600'
}

const getItemTypeClass = (item) => {
  const classes = {
    'status': 'bg-blue-100 text-blue-800',
    'feedback': 'bg-orange-100 text-orange-800',
    'document': 'bg-green-100 text-green-800'
  }
  
  return classes[item.type] || 'bg-gray-100 text-gray-800'
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
    'SUBMITTED': 'bg-gray-100 text-gray-800',
    'VERIFICATION': 'bg-blue-100 text-blue-800',
    'INCOMPLETE_REQUIREMENTS': 'bg-red-100 text-red-800',
    'COMPLETE_REQUIREMENTS': 'bg-green-100 text-green-800',
    'SCHEDULED_PAPARAN': 'bg-purple-100 text-purple-800',
    'PAPARAN_COMPLETED': 'bg-yellow-100 text-yellow-800',
    'REVISION_SUBMITTED': 'bg-indigo-100 text-indigo-800',
    'REVISION_REVIEW': 'bg-blue-100 text-blue-800',
    'REVISION_REJECTED': 'bg-red-100 text-red-800',
    'REVISION_APPROVED': 'bg-green-100 text-green-800',
    'PERTEK_ISSUED': 'bg-emerald-100 text-emerald-800',
    'REJECTED': 'bg-red-100 text-red-800'
  }
  
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status) => {
  const labels = {
    'SUBMITTED': 'Permohonan Diajukan',
    'VERIFICATION': 'Tahap Verifikasi',
    'INCOMPLETE_REQUIREMENTS': 'Persyaratan Tidak Lengkap',
    'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
    'SCHEDULED_PAPARAN': 'Paparan Dijadwalkan',
    'PAPARAN_COMPLETED': 'Paparan Selesai',
    'REVISION_SUBMITTED': 'Revisi Diajukan',
    'REVISION_REVIEW': 'Review Revisi',
    'REVISION_REJECTED': 'Revisi Ditolak',
    'REVISION_APPROVED': 'Revisi Disetujui',
    'PERTEK_ISSUED': 'PERTEK Diterbitkan',
    'REJECTED': 'Permohonan Ditolak'
  }
  
  return labels[status] || status
}

const getDocumentTypeLabel = (type) => {
  const types = {
    'PERSYARATAN': 'Dokumen Persyaratan',
    'REVISI': 'Dokumen Revisi',
    'SURAT_UNDANGAN_PAPARAN': 'Surat Undangan Paparan',
    'PERTEK_FINAL': 'Dokumen PERTEK Final'
  }
  
  return types[type] || type
}

const getRequirementTypeLabel = (type) => {
  const types = {
    'SURAT_PERMOHONAN': 'Surat Permohonan',
    'DOKUMEN_AMDAL_UKL_UPL': 'AMDAL/UKL-UPL',
    'DOKUMEN_TEKNIS': 'Dokumen Teknis',
    'DOKUMEN_REVISI': 'Dokumen Revisi',
    'OTHER': 'Lainnya'
  }
  
  return types[type] || type
}

const getRequirementTypeClass = (type) => {
  const classes = {
    'SURAT_PERMOHONAN': 'bg-blue-100 text-blue-800',
    'DOKUMEN_AMDAL_UKL_UPL': 'bg-green-100 text-green-800',
    'DOKUMEN_TEKNIS': 'bg-purple-100 text-purple-800',
    'DOKUMEN_REVISI': 'bg-yellow-100 text-yellow-800',
    'OTHER': 'bg-gray-100 text-gray-800'
  }
  
  return classes[type] || 'bg-gray-100 text-gray-800'
}
</script>