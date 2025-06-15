<template>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white border border-slate-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-slate-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-3.154 1.578a.5.5 0 01-.723-.445l.157-2.512A8 8 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          Feedback & Persyaratan
        </h3>
        <p class="mt-1 text-sm text-slate-500">
          Feedback dari admin mengenai persyaratan yang perlu diperbaiki atau dilengkapi
        </p>
        
        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <div class="text-lg font-bold text-amber-600">{{ activeFeedbackCount }}</div>
            <div class="text-xs text-amber-700">Perlu Tindakan</div>
          </div>
          <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div class="text-lg font-bold text-green-600">{{ resolvedFeedbackCount }}</div>
            <div class="text-xs text-green-700">Sudah Diselesaikan</div>
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <div class="text-lg font-bold text-blue-600">{{ totalFeedbackCount }}</div>
            <div class="text-xs text-blue-700">Total Feedback</div>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
            <div class="text-lg font-bold text-slate-600">{{ uniqueDocumentsCount }}</div>
            <div class="text-xs text-slate-700">Dokumen Terkait</div>
          </div>
        </div>
      </div>
  
      <!-- Filter Tabs -->
      <div class="bg-white border border-slate-200 rounded-lg">
        <div class="border-b border-slate-200">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              @click="activeFilter = tab.key"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeFilter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              ]"
            >
              {{ tab.label }}
              <span 
                v-if="tab.count > 0"
                :class="[
                  'ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  activeFilter === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-slate-100 text-slate-600'
                ]"
              >
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>
      </div>
  
      <!-- Empty State -->
      <div v-if="filteredFeedback.length === 0" class="bg-white border border-slate-200 rounded-lg p-8">
        <div class="text-center text-slate-500">
          <svg class="mx-auto h-12 w-12 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-3.154 1.578a.5.5 0 01-.723-.445l.157-2.512A8 8 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          <h3 class="mt-4 text-sm font-medium text-slate-900">
            {{ getEmptyStateTitle() }}
          </h3>
          <p class="mt-1 text-sm text-slate-500">
            {{ getEmptyStateMessage() }}
          </p>
        </div>
      </div>
  
      <!-- Feedback List -->
      <div v-else class="space-y-4">
        <!-- Group by requirement type -->
        <div v-for="(group, groupType) in groupedFeedback" :key="groupType" class="bg-white border border-slate-200 rounded-lg">
          <div class="px-6 py-4 border-b border-slate-200">
            <h4 class="text-md font-medium text-slate-900 flex items-center">
              <span :class="[
                'w-3 h-3 rounded-full mr-3',
                getRequirementTypeColor(groupType)
              ]"></span>
              {{ getRequirementTypeLabel(groupType) }}
              <span class="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {{ group.length }} feedback
              </span>
            </h4>
          </div>
          
          <div class="p-6">
            <div class="space-y-4">
              <div 
                v-for="feedback in group" 
                :key="feedback.id"
                :class="[
                  'border rounded-lg p-4 transition-all duration-200',
                  feedback.isResolved 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:shadow-sm'
                ]"
              >
                <!-- Feedback Header -->
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center space-x-2">
                    <span :class="[
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      feedback.isResolved 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    ]">
                      <svg v-if="feedback.isResolved" class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <svg v-else class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ feedback.isResolved ? 'Diselesaikan' : 'Perlu Tindakan' }}
                    </span>
                    
                    <span v-if="feedback.document" class="inline-flex items-center text-xs text-slate-500">
                      <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {{ feedback.document.filename }}
                    </span>
                  </div>
                  
                  <span class="text-xs text-slate-500">
                    {{ formatRelativeTime(feedback.createdAt) }}
                  </span>
                </div>
                
                <!-- Feedback Text -->
                <div class="mb-4">
                  <p :class="[
                    'text-sm leading-relaxed',
                    feedback.isResolved ? 'text-green-800' : 'text-amber-800'
                  ]">
                    {{ feedback.feedbackText }}
                  </p>
                </div>
                
                <!-- Actions -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <!-- Document link if exists -->
                    <button
                      v-if="feedback.document"
                      @click="downloadDocument(feedback.document)"
                      class="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Dokumen Terkait
                    </button>
                    
                    <!-- Resolved info -->
                    <span v-if="feedback.isResolved && feedback.resolvedAt" class="text-xs text-green-600 flex items-center">
                      <svg class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Diselesaikan {{ formatRelativeTime(feedback.resolvedAt) }}
                    </span>
                  </div>
                  
                  <!-- Resolve Button -->
                  <button
                    v-if="!feedback.isResolved"
                    @click="resolveFeedback(feedback.id)"
                    :disabled="resolvingFeedback === feedback.id"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
                  >
                    <svg v-if="resolvingFeedback === feedback.id" class="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ resolvingFeedback === feedback.id ? 'Menyimpan...' : 'Tandai Selesai' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Bulk Actions (if needed) -->
      <div v-if="activeFeedbackCount > 1 && activeFilter === 'active'" class="bg-white border border-slate-200 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <svg class="h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-medium text-slate-900">
              {{ activeFeedbackCount }} feedback perlu ditindaklanjuti
            </span>
          </div>
          <button
            @click="resolveAllFeedback"
            :disabled="resolvingAll"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
          >
            <svg v-if="resolvingAll" class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ resolvingAll ? 'Memproses...' : 'Tandai Semua Selesai' }}
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    feedback: {
      type: Array,
      default: () => []
    },
    pertekId: {
      type: String,
      required: true
    }
  });
  
  const emit = defineEmits(['feedback-resolved', 'all-feedback-resolved']);
  
  // State
  const activeFilter = ref('all');
  const resolvingFeedback = ref(null);
  const resolvingAll = ref(false);
  
  // Filter tabs
  const filterTabs = computed(() => [
    {
      key: 'all',
      label: 'Semua',
      count: totalFeedbackCount.value
    },
    {
      key: 'active',
      label: 'Perlu Tindakan',
      count: activeFeedbackCount.value
    },
    {
      key: 'resolved',
      label: 'Sudah Diselesaikan',
      count: resolvedFeedbackCount.value
    }
  ]);
  
  // Computed stats
  const activeFeedbackCount = computed(() => {
    return props.feedback.filter(f => !f.isResolved).length;
  });
  
  const resolvedFeedbackCount = computed(() => {
    return props.feedback.filter(f => f.isResolved).length;
  });
  
  const totalFeedbackCount = computed(() => {
    return props.feedback.length;
  });
  
  const uniqueDocumentsCount = computed(() => {
    const documentIds = new Set();
    props.feedback.forEach(f => {
      if (f.document) {
        documentIds.add(f.document.id);
      }
    });
    return documentIds.size;
  });
  
  // Filtered feedback based on active tab
  const filteredFeedback = computed(() => {
    switch (activeFilter.value) {
      case 'active':
        return props.feedback.filter(f => !f.isResolved);
      case 'resolved':
        return props.feedback.filter(f => f.isResolved);
      default:
        return props.feedback;
    }
  });
  
  // Group feedback by requirement type
  const groupedFeedback = computed(() => {
    const groups = {};
    
    filteredFeedback.value.forEach(feedback => {
      const type = feedback.requirementType;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(feedback);
    });
    
    // Sort groups by requirement type priority
    const sortedGroups = {};
    const typeOrder = ['SURAT_PERMOHONAN', 'DOKUMEN_AMDAL_UKL_UPL', 'DOKUMEN_TEKNIS', 'DOKUMEN_REVISI', 'OTHER'];
    
    typeOrder.forEach(type => {
      if (groups[type]) {
        sortedGroups[type] = groups[type].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    });
    
    return sortedGroups;
  });
  
  // Methods
  const resolveFeedback = async (feedbackId) => {
    if (resolvingFeedback.value) return;
    
    try {
      resolvingFeedback.value = feedbackId;
      
      const response = await $fetch(`/api/pertek/feedback/${feedbackId}/resolve`, {
        method: 'PUT'
      });
      
      if (response.success) {
        // Update local state
        const feedback = props.feedback.find(f => f.id === feedbackId);
        if (feedback) {
          feedback.isResolved = true;
          feedback.resolvedAt = new Date().toISOString();
        }
        
        // Emit event to parent
        emit('feedback-resolved', feedbackId);
        
        // Show success notification
        console.log('Feedback berhasil ditandai selesai');
      }
    } catch (error) {
      console.error('Error resolving feedback:', error);
    } finally {
      resolvingFeedback.value = null;
    }
  };
  
  const resolveAllFeedback = async () => {
    if (resolvingAll.value) return;
    
    const activeFeedbackIds = props.feedback
      .filter(f => !f.isResolved)
      .map(f => f.id);
    
    if (activeFeedbackIds.length === 0) return;
    
    try {
      resolvingAll.value = true;
      
      // Resolve all active feedback
      const promises = activeFeedbackIds.map(id => 
        $fetch(`/api/pertek/feedback/${id}/resolve`, { method: 'PUT' })
      );
      
      await Promise.all(promises);
      
      // Update local state
      props.feedback.forEach(feedback => {
        if (!feedback.isResolved) {
          feedback.isResolved = true;
          feedback.resolvedAt = new Date().toISOString();
        }
      });
      
      // Emit event to parent
      emit('all-feedback-resolved', activeFeedbackIds);
      
      console.log('Semua feedback berhasil ditandai selesai');
    } catch (error) {
      console.error('Error resolving all feedback:', error);
    } finally {
      resolvingAll.value = false;
    }
  };
  
  const downloadDocument = (document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    } else if (document.url) {
      window.open(document.url, '_blank');
    } else {
      const url = `/api/pertek/documents/${document.id}/download`;
      window.open(url, '_blank');
    }
  };
  
  // Helper functions
  const getRequirementTypeLabel = (type) => {
    const labels = {
      'SURAT_PERMOHONAN': 'Surat Permohonan',
      'DOKUMEN_AMDAL_UKL_UPL': 'AMDAL/UKL-UPL',
      'DOKUMEN_TEKNIS': 'Dokumen Teknis',
      'DOKUMEN_REVISI': 'Dokumen Revisi',
      'OTHER': 'Lainnya'
    };
    return labels[type] || type;
  };
  
  const getRequirementTypeColor = (type) => {
    const colors = {
      'SURAT_PERMOHONAN': 'bg-blue-500',
      'DOKUMEN_AMDAL_UKL_UPL': 'bg-green-500',
      'DOKUMEN_TEKNIS': 'bg-purple-500',
      'DOKUMEN_REVISI': 'bg-amber-500',
      'OTHER': 'bg-slate-500'
    };
    return colors[type] || 'bg-slate-500';
  };
  
  const getEmptyStateTitle = () => {
    switch (activeFilter.value) {
      case 'active':
        return 'Tidak ada feedback yang perlu ditindaklanjuti';
      case 'resolved':
        return 'Belum ada feedback yang diselesaikan';
      default:
        return 'Belum ada feedback';
    }
  };
  
  const getEmptyStateMessage = () => {
    switch (activeFilter.value) {
      case 'active':
        return 'Semua feedback sudah ditandai selesai atau belum ada feedback dari admin.';
      case 'resolved':
        return 'Feedback yang sudah Anda tandai selesai akan muncul di sini.';
      default:
        return 'Feedback dari admin akan muncul di sini ketika ada persyaratan yang perlu diperbaiki.';
    }
  };
  
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
  
    if (diffInMinutes < 1) {
      return 'baru saja';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} menit lalu`;
    } else if (diffInHours < 24) {
      return `${diffInHours} jam lalu`;
    } else if (diffInDays === 1) {
      return 'kemarin';
    } else if (diffInDays < 7) {
      return `${diffInDays} hari lalu`;
    } else {
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date);
    }
  };
  
  // Watch for filter changes
  watch(activeFilter, () => {
    // Could add analytics or other side effects here
  });
  </script>