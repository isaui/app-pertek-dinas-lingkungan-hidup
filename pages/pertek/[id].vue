<template>
    <div>
      <!-- SEO Head -->
      <Head>
        <Title>Detail PERTEK {{ pertek?.pertekNumber || pertekId }} | DLH Kabupaten Grobogan</Title>
        <Meta name="description" content="Detail permohonan Persetujuan Teknis (PERTEK) Anda di DLH Kabupaten Grobogan" />
        <Meta name="keywords" content="pertek, detail permohonan, status pertek, dinas lingkungan hidup, grobogan" />
        <Meta property="og:title" content="Detail PERTEK | DLH Kabupaten Grobogan" />
        <Meta property="og:description" content="Pantau status dan kelola permohonan PERTEK Anda" />
      </Head>
      
      <div class="min-h-screen bg-slate-50">
        <Navbar />
        
        <div class="py-6 px-4 sm:px-6 lg:px-8">
          <!-- Loading state -->
          <div v-if="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
  
          <!-- Error state -->
          <div v-else-if="error" class="max-w-4xl mx-auto">
            <div class="rounded-md bg-red-50 border border-red-200 p-4 my-8">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Gagal Memuat Data PERTEK</h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>{{ errorMessage }}</p>
                  </div>
                  <div class="mt-4">
                    <button
                      type="button"
                      @click="fetchData"
                      class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Content -->
          <div v-else class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="bg-white shadow-sm rounded-lg mb-6 overflow-hidden border border-slate-200">
              <div class="border-b border-slate-200 px-6 py-4">
                <div class="sm:flex sm:items-center sm:justify-between">
                  <div class="flex-1 min-w-0">
                    <h1 class="text-2xl font-bold leading-7 text-slate-900 sm:truncate mb-2">
                      Detail Permohonan PERTEK
                    </h1>
                    <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-4">
                      <div class="flex items-center text-sm text-slate-600">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2H5v-2h10zM5 8h10v2H5V8z" clip-rule="evenodd" />
                        </svg>
                        <span>{{ pertek.company }}</span>
                      </div>
                      <div class="flex items-center text-sm text-slate-600">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                        </svg>
                        <span>{{ formatDate(pertek.createdAt) }}</span>
                      </div>
                      <div>
                        <StatusBadge :status="pertek.status" />
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 flex sm:mt-0 sm:ml-4">
                    <button
                      @click="navigateToList"
                      class="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg class="-ml-1 mr-2 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                      </svg>
                      Kembali ke Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Tabs Navigation -->
            <div class="bg-white shadow-sm rounded-lg border border-slate-200">
              <!-- Tab Navigation -->
              <div class="border-b border-slate-200">
                <nav class="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                  <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    @click="setActiveTab(tab.id)"
                    :class="[
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center',
                      tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    ]"
                    :disabled="tab.disabled"
                    :aria-current="activeTab === tab.id ? 'page' : undefined"
                  >
                    <component :is="tab.icon" class="h-4 w-4 mr-2" />
                    {{ tab.name }}
                    <span v-if="tab.badge" :class="tab.badgeClass" class="ml-2 py-0.5 px-2 rounded-full text-xs font-medium">
                      {{ tab.badge }}
                    </span>
                  </button>
                </nav>
              </div>
              
              <!-- Tab Content -->
              <div class="p-6">
                <!-- Tab 1: Overview -->
                <div v-show="activeTab === 'overview'">
                  <OverviewTab 
                    :pertek="pertek"
                    @switch-tab="setActiveTab"
                    @quick-action="handleQuickAction"
                  />
                </div>
  
                <!-- Tab 2: History & Timeline -->
                <div v-show="activeTab === 'history'">
                  <HistoryTab 
                    :pertek="pertek"
                    @feedback-resolved="handleFeedbackResolved"
                  />
                </div>
  
                <!-- Tab 3: Documents -->
                <div v-show="activeTab === 'documents'">
                  <DocumentTab 
                    :documents="pertek?.documents || []"
                    :pertekId="pertekId"
                    @documents-updated="refreshData"
                  />
                </div>
  
                <!-- Tab 4: Feedback -->
                <div v-show="activeTab === 'feedback'">
                  <FeedbackTab 
                    :feedback="pertek?.requirementFeedback || []"
                    :pertekId="pertekId"
                    @feedback-resolved="handleFeedbackResolved"
                    @all-feedback-resolved="handleAllFeedbackResolved"
                  />
                </div>
  
                <!-- Tab 5: Upload Revisi -->
                <div v-show="activeTab === 'revision'">
                  <RevisionTab 
                    :pertekId="pertekId"
                    :pertekStatus="pertek.status"
                    :existingRevisions="getRevisionDocuments()"
                    @switch-tab="setActiveTab"
                    @revision-uploaded="handleRevisionUploaded"
                  />
                </div>
  
                <!-- Tab 6: Update Persyaratan -->
                <div v-show="activeTab === 'requirements'">
                  <RequirementsTab 
                    :pertekId="pertekId"
                    :pertekStatus="pertek.status"
                    :existingRequirements="getRequirementDocuments()"
                    :activeFeedback="getActiveFeedback()"
                    @switch-tab="setActiveTab"
                    @requirements-uploaded="handleRequirementsUploaded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import Navbar from '~/components/navbar/index.vue';
  import StatusBadge from '~/components/pertek/StatusBadge.vue';
  
  // Import tab components
  import OverviewTab from '~/components/user/pertek/InformasiUmum.vue';
  import HistoryTab from '~/components/user/pertek/HistoryTab.vue';
  import DocumentTab from '~/components/user/pertek/DocumentTab.vue';
  import FeedbackTab from '~/components/user/pertek/FeedbackTab.vue';
  import RevisionTab from '~/components/user/pertek/RevisionTab.vue';
  import RequirementsTab from '~/components/user/pertek/RequirementsTab.vue';
  
  // Router and route params
  const router = useRouter();
  const route = useRoute();
  const pertekId = route.params.id;
  
  // State
  const loading = ref(true);
  const error = ref(false);
  const errorMessage = ref('');
  const pertek = ref({});
  const activeTab = ref('overview');
  
  // Helper functions - defined early so they can be used in computeds
  const getActiveFeedback = () => {
    return pertek.value.requirementFeedback?.filter(f => !f.isResolved) || [];
  };

  // Tab access control
  const canUploadRevision = () => {
    return ['PAPARAN_COMPLETED', 'REVISION_REJECTED'].includes(pertek.value.status);
  };

  const canUpdateRequirements = () => {
    return ['INCOMPLETE_REQUIREMENTS', 'REJECTED'].includes(pertek.value.status);
  };

  // Tab configuration with dynamic badges and states
  const tabs = computed(() => {
    const activeFeedbackCount = getActiveFeedback().length;
    const documentsCount = pertek.value.documents?.length || 0;
    const historyCount = pertek.value.statusHistory?.length || 0;
    
    return [
      { 
        id: 'overview', 
        name: 'Ringkasan',
        icon: 'svg',
        disabled: false
      },
      { 
        id: 'history', 
        name: 'Riwayat',
        icon: 'svg',
        badge: historyCount > 0 ? historyCount : null,
        badgeClass: 'bg-blue-100 text-blue-800',
        disabled: false
      },
      { 
        id: 'documents', 
        name: 'Dokumen',
        icon: 'svg',
        badge: documentsCount > 0 ? documentsCount : null,
        badgeClass: 'bg-green-100 text-green-800',
        disabled: false
      },
      { 
        id: 'feedback', 
        name: 'Feedback',
        icon: 'svg',
        badge: activeFeedbackCount > 0 ? activeFeedbackCount : null,
        badgeClass: 'bg-amber-100 text-amber-800',
        disabled: false
      },
      { 
        id: 'revision', 
        name: 'Upload Revisi',
        icon: 'svg',
        disabled: !canUploadRevision()
      },
      { 
        id: 'requirements', 
        name: 'Update Persyaratan',
        icon: 'svg',
        disabled: !canUpdateRequirements()
      }
    ];
  });

  

  // Fetch PERTEK data
  const fetchData = async () => {
    loading.value = true;
    error.value = false;
    
    try {
      const response = await $fetch(`/api/pertek/detail/${pertekId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Gagal memuat data PERTEK');
      }
      
      pertek.value = response.data;
      
    } catch (err) {
      console.error('Error fetching PERTEK:', err);
      error.value = true;
      errorMessage.value = err.message || 'Terjadi kesalahan yang tidak terduga';
    } finally {
      loading.value = false;
    }
  };

  // Refresh data without full reload
  const refreshData = async () => {
    try {
      const response = await $fetch(`/api/pertek/detail/${pertekId}`);
      
      if (response.success) {
        pertek.value = response.data;
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  // Tab management
  const setActiveTab = (tabId) => {
    const tab = tabs.value.find(t => t.id === tabId);
    if (tab && !tab.disabled) {
      activeTab.value = tabId;
      // Update URL query parameter
      router.replace({ 
        path: route.path, 
        query: { ...route.query, tab: tabId } 
      });
    }
  };

  // Event handlers
  const handleQuickAction = (action) => {
    switch (action.key) {
      case 'view-feedback':
        setActiveTab('feedback');
        break;
      case 'view-paparan':
        setActiveTab('overview'); // Show paparan info in overview
        break;
      case 'upload-revisi':
        setActiveTab('revision');
        break;
      case 'view-documents':
        setActiveTab('documents');
        break;
      case 'update-requirements':
        setActiveTab('requirements');
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  const handleFeedbackResolved = (feedbackId) => {
    // Update local feedback state
    const feedback = pertek.value.requirementFeedback?.find(f => f.id === feedbackId);
    if (feedback) {
      feedback.isResolved = true;
      feedback.resolvedAt = new Date().toISOString();
    }
    
    // Refresh to get updated data
    refreshData();
  };

  const handleAllFeedbackResolved = (feedbackIds) => {
    // Update local feedback states
    if (pertek.value.requirementFeedback) {
      pertek.value.requirementFeedback.forEach(feedback => {
        if (feedbackIds.includes(feedback.id)) {
          feedback.isResolved = true;
          feedback.resolvedAt = new Date().toISOString();
        }
      });
    }
    
    // Refresh to get updated data
    refreshData();
  };

  const handleRevisionUploaded = (documents) => {
    console.log('Revision uploaded:', documents);
    // Refresh data to show new documents
    refreshData();
  };

  const handleRequirementsUploaded = (documents) => {
    console.log('Requirements uploaded:', documents);
    // Refresh data to show new documents
    refreshData();
  };

  // Helper functions
  const getRevisionDocuments = () => {
    return pertek.value.documents?.filter(doc => doc.type === 'REVISI') || [];
  };

  const getRequirementDocuments = () => {
    return pertek.value.documents?.filter(doc => doc.type === 'PERSYARATAN') || [];
  };

  const navigateToList = () => {
    router.push('/pertek');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };
  
  // Lifecycle
  onMounted(() => {
    fetchData();
  });

  // Watch route query for tab switching
  watch(() => route.query.tab, (newTab) => {
    if (newTab && tabs.value.find(t => t.id === newTab)) {
      activeTab.value = newTab;
      // Update URL query parameter
      router.replace({ 
        path: route.path, 
        query: { ...route.query, tab: newTab } 
      });
    }
  }, { immediate: true });
  </script>