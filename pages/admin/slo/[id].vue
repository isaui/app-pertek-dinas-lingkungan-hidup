<template>
    <div>
      <!-- SEO Head -->
      <Head>
        <Title>Admin - Detail SLO {{ slo?.sloNumber || sloId }} | DLH Kabupaten Grobogan</Title>
        <Meta name="description" content="Admin detail permohonan Surat Layak Operasi (SLO) di DLH Kabupaten Grobogan" />
        <Meta name="keywords" content="admin, slo, detail permohonan, status slo, dinas lingkungan hidup, grobogan" />
        <Meta property="og:title" content="Admin Detail SLO | DLH Kabupaten Grobogan" />
        <Meta property="og:description" content="Kelola dan pantau permohonan SLO dari dashboard admin" />
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
                  <h3 class="text-sm font-medium text-red-800">Gagal Memuat Data SLO</h3>
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
                      Admin - Detail SLO
                    </h1>
                    <div class="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-4">
                      <div class="flex items-center text-sm text-slate-600">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2H5v-2h10zM5 8h10v2H5V8z" clip-rule="evenodd" />
                        </svg>
                        <span>{{ slo.company }}</span>
                      </div>
                      <div class="flex items-center text-sm text-slate-600">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                        </svg>
                        <span>{{ formatDate(slo.createdAt) }}</span>
                      </div>
                      <div>
                        <StatusBadge :status="slo.status" />
                      </div>
                      <div v-if="slo.sloNumber" class="flex items-center text-sm text-slate-600">
                        <svg class="flex-shrink-0 mr-1.5 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
                        </svg>
                        <span class="font-mono text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{{ slo.sloNumber }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 flex sm:mt-0 sm:ml-4 space-x-3">
                    <button
                      @click="navigateToList"
                      class="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg class="-ml-1 mr-2 h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                      </svg>
                      Kembali ke Dashboard
                    </button>
                    
                    <!-- Quick Action: Download All Documents -->
                    <button
                      v-if="slo.documents && slo.documents.length > 0"
                      @click="downloadAllDocuments"
                      class="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg class="-ml-1 mr-2 h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      Download Semua Dokumen
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
                      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center cursor-pointer'
                    ]"
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
                <!-- Tab 1: Informasi Umum -->
                <div v-show="activeTab === 'overview'">
                  <SLOInformasiUmum :slo="slo" />
                </div>
  
                <!-- Tab 2: Update Status -->
                <div v-show="activeTab === 'status'">
                  <SLOUpdateStatus 
                    :slo="slo"
                    :available-transitions="availableTransitions"
                    :next-actions="nextActions"
                    :documents="slo.documents || []"
                    @status-updated="handleStatusUpdated"
                  />
                </div>
  
                <!-- Tab 3: Documents -->
                <div v-show="activeTab === 'documents'">
                  <SLODocumentsTab 
                    :documents="slo?.documents || []"
                    :sloId="sloId"
                    @documents-updated="refreshData"
                  />
                </div>
  
                <!-- Tab 4: History & Timeline -->
                <div v-show="activeTab === 'history'">
                  <SLOHistoryTimeline 
                    :slo="slo"
                    :sloId="sloId"
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
  import StatusBadge from '~/components/slo/SLOStatusBadge.vue';
  
  // Import tab components
  import SLOInformasiUmum from '~/components/admin/slo/SLOInformasiUmum.vue';
  import SLOUpdateStatus from '~/components/admin/slo/SLOUpdateStatus.vue';
  import SLODocumentsTab from '~/components/admin/slo/SLODocumentsTab.vue';
  import SLOHistoryTimeline from '~/components/admin/slo/SLOHistoryTimeline.vue';
  
  // Router and route params
  const router = useRouter();
  const route = useRoute();
  const sloId = route.params.id;
  
  // State
  const loading = ref(true);
  const error = ref(false);
  const errorMessage = ref('');
  const slo = ref({});
  const activeTab = ref('overview');
  const availableTransitions = ref([]);
  const nextActions = ref([]);
  
  // Tab configuration with dynamic badges and states
  const tabs = computed(() => {
    const documentsCount = slo.value.documents?.length || 0;
    const historyCount = slo.value.statusHistory?.length || 0;
    const activeFeedbackCount = slo.value.feedbackByStatus?.active?.length || 0;
    
    return [
      { 
        id: 'overview', 
        name: 'Informasi Umum',
        icon: 'svg',
        disabled: false
      },
      { 
        id: 'status', 
        name: 'Update Status',
        icon: 'svg',
        badge: activeFeedbackCount > 0 ? activeFeedbackCount : null,
        badgeClass: 'bg-amber-100 text-amber-800',
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
        id: 'history', 
        name: 'Riwayat',
        icon: 'svg',
        badge: historyCount > 0 ? historyCount : null,
        badgeClass: 'bg-blue-100 text-blue-800',
        disabled: false
      }
    ];
  });
  
  // Fetch SLO data
  const fetchData = async () => {
    loading.value = true;
    error.value = false;
    
    try {
      const response = await $fetch(`/api/slo/admin/${sloId}`);
      
      if (!response.success) {
        throw new Error(response.message || 'Gagal memuat data SLO');
      }
      
      slo.value = response.data;
      availableTransitions.value = response.availableTransitions || [];
      nextActions.value = response.nextActions || [];
      
    } catch (err) {
      console.error('Error fetching SLO:', err);
      error.value = true;
      errorMessage.value = err.message || 'Terjadi kesalahan yang tidak terduga';
    } finally {
      loading.value = false;
    }
  };
  
  // Refresh data without full reload
  const refreshData = async () => {
    try {
      const response = await $fetch(`/api/slo/admin/${sloId}`);
      
      if (response.success) {
        slo.value = response.data;
        availableTransitions.value = response.availableTransitions || [];
        nextActions.value = response.nextActions || [];
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
  const handleStatusUpdated = (updatedSlo) => {
    console.log('Status updated:', updatedSlo);
    // Refresh data to get updated status and transitions
    refreshData();
  };
  
  // Navigation helpers
  const navigateToList = () => {
    router.push('/admin/slo');
  };
  
  // Download all documents
  const downloadAllDocuments = async () => {
    try {
      // Create download URL for bulk download
      const url = `/api/slo/admin/${sloId}/download`;
      
      // Open download in new window/tab
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error downloading documents:', error);
      alert('Gagal mendownload dokumen. Silakan coba lagi.');
    }
  };
  
  // Helper functions
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
    
    // Check if there's a tab parameter in URL
    const tabParam = route.query.tab;
    if (tabParam && tabs.value.find(t => t.id === tabParam)) {
      activeTab.value = tabParam;
    }
  });
  
  // Watch route query for tab switching
  watch(() => route.query.tab, (newTab) => {
    if (newTab && tabs.value.find(t => t.id === newTab)) {
      activeTab.value = newTab;
    }
  }, { immediate: true });
  </script>