<template>
    <div class="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <div class="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Admin Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-800">Dashboard Admin PERTEK</h1>
              <p class="mt-2 text-slate-600">Kelola semua permohonan Persetujuan Teknis (PERTEK).</p>
            </div>
            <div class="flex items-center space-x-3">
              <button
                @click="exportData"
                class="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Data
              </button>
            </div>
          </div>
        </div>
        
        <!-- Admin Stats -->
        <div v-if="stats" class="mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-slate-500 truncate">Total Permohonan</dt>
                      <dd class="text-lg font-medium text-slate-900">{{ stats.total }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-slate-500 truncate">Baru Diajukan</dt>
                      <dd class="text-lg font-medium text-slate-900">{{ stats.submitted }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-slate-500 truncate">Dalam Proses</dt>
                      <dd class="text-lg font-medium text-slate-900">{{ stats.inProgress }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-slate-500 truncate">Selesai</dt>
                      <dd class="text-lg font-medium text-slate-900">{{ stats.completed }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
  
            <div class="bg-white overflow-hidden shadow-sm rounded-lg border border-slate-200">
              <div class="p-5">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                      <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <dl>
                      <dt class="text-sm font-medium text-slate-500 truncate">Ditolak</dt>
                      <dd class="text-lg font-medium text-slate-900">{{ stats.rejected }}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ error }}</p>
            </div>
          </div>
        </div>
        
        <!-- Enhanced Controls for Admin -->
        <PertekControls 
          ref="controlsRef"
          :current-view="currentView"
          :total-items="totalItems"
          :is-admin="true"
          @filter="handleFilter" 
          @view-change="handleViewChange"
        />
        
        <!-- Loading Indicator -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-700"></div>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="pertekItems.length === 0" class="bg-white shadow-sm rounded-lg border border-slate-200 p-12 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-slate-900">Tidak ada permohonan PERTEK</h3>
          <p class="mt-1 text-sm text-slate-500">Belum ada permohonan PERTEK yang sesuai dengan filter yang dipilih.</p>
        </div>
        
        <!-- Content based on view type -->
        <div v-else>
          <!-- Card View -->
          <div v-if="currentView === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <PertekCard 
              v-for="pertek in pertekItems" 
              :key="pertek.id"
              :pertek="pertek"
              :is-admin="true"
              @view="viewPertekDetail"
            />
          </div>
          
          <!-- Table View -->
          <div v-else-if="currentView === 'table'" class="mb-6">
            <PertekTable 
              :pertek-items="pertekItems"
              :is-admin="true"
              @view="viewPertekDetail"
            />
          </div>
        </div>
        
        <!-- Pagination -->
        <Pagination
          v-if="pertekItems.length > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :per-page="perPage"
          @page-change="changePage"
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, reactive } from 'vue';
  import { useHead } from '#app';
  import { useRouter } from 'vue-router';
  import Navbar from '~/components/navbar/index.vue';
  import PertekCard from '~/components/pertek/PertekCard.vue';
  import PertekTable from '~/components/pertek/PertekTable.vue';
  import PertekControls from '~/components/pertek/PertekControls.vue';
  import Pagination from '~/components/common/Pagination.vue';
  
  // SEO metadata
  useHead({
    title: 'Admin Dashboard PERTEK | DLH Kabupaten Grobogan',
    meta: [
      { name: 'description', content: 'Dashboard administrator untuk mengelola semua permohonan Persetujuan Teknis (PERTEK) di Dinas Lingkungan Hidup Kabupaten Grobogan.' },
      { name: 'robots', content: 'noindex, nofollow' } // Admin page should not be indexed
    ]
  });
  
  const router = useRouter();
  const controlsRef = ref(null);
  
  // State
  const loading = ref(true);
  const error = ref('');
  const pertekItems = ref([]);
  const currentPage = ref(1);
  const perPage = ref(15); // More items per page for admin
  const totalPages = ref(0);
  const totalItems = ref(0);
  const currentView = ref('table'); // Default to table view for admin
  const stats = reactive({
    total: 0,
    submitted: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  });
  
  // Computed
  const filterParams = computed(() => {
    if (!controlsRef.value) return {};
    return controlsRef.value.getFilters();
  });
  
  // Methods
  const fetchPertekList = async () => {
    try {
      loading.value = true;
      error.value = '';
      
      // Build query params
      const queryParams = new URLSearchParams({
        page: currentPage.value.toString(),
        limit: perPage.value.toString()
      });
      
      // Add filters if available
      if (filterParams.value.status) {
        queryParams.append('status', filterParams.value.status);
      }
      
      if (filterParams.value.type) {
        queryParams.append('type', filterParams.value.type);
      }
      
      if (filterParams.value.sort) {
        queryParams.append('sort', filterParams.value.sort);
      }
      
      if (filterParams.value.search) {
        queryParams.append('search', filterParams.value.search);
      }
      
      // API call to admin endpoint
      const response = await $fetch(`/api/pertek/admin/list?${queryParams.toString()}`);
      
      // Update state with response data
      if (response.success) {
        pertekItems.value = response.data;
        totalPages.value = response.pagination.totalPages;
        totalItems.value = response.pagination.totalItems;
        
        // Update stats if available
        if (response.stats) {
          Object.assign(stats, response.stats);
        }
      } else {
        error.value = 'Gagal memuat data PERTEK';
      }
      
    } catch (e) {
      console.error('Error fetching PERTEK data:', e);
      if (e.statusCode === 403) {
        error.value = 'Akses ditolak. Anda harus memiliki role administrator.';
        // Redirect to main dashboard
        setTimeout(() => {
          router.push('/pertek');
        }, 3000);
      } else {
        error.value = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
      }
    } finally {
      loading.value = false;
    }
  };
  
  // Handle page change
  const changePage = (page) => {
    currentPage.value = page;
    fetchPertekList();
    // Scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle filter change
  const handleFilter = (filters) => {
    currentPage.value = 1; // Reset to first page when filtering
    fetchPertekList();
  };
  
  // Handle view change
  const handleViewChange = (view) => {
    currentView.value = view;
    
    // Save preference to localStorage for persistence
    try {
      localStorage.setItem('admin-pertek-dashboard-view', view);
    } catch (e) {
      // Ignore localStorage errors
    }
  };
  
  // View PERTEK detail (admin can manage)
  const viewPertekDetail = (id) => {
    router.push(`/admin/pertek/${id}`);
  };
  
  // Export data functionality
  const exportData = async () => {
    try {
      // Implementation for data export
      console.log('Exporting PERTEK data...');
      // You can implement CSV/Excel export here
    } catch (e) {
      console.error('Export error:', e);
      error.value = 'Gagal mengexport data.';
    }
  };
  
  // Load saved view preference
  const loadViewPreference = () => {
    try {
      const savedView = localStorage.getItem('admin-pertek-dashboard-view');
      if (savedView && ['card', 'table'].includes(savedView)) {
        currentView.value = savedView;
      }
    } catch (e) {
      // Ignore localStorage errors, use default
    }
  };
  
  // Lifecycle hooks
  onMounted(() => {
    // Load view preference
    loadViewPreference();
    
    // Fetch PERTEK data
    fetchPertekList();
  });
  </script>