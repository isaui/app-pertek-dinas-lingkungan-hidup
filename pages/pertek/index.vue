<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    
    <div class="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Success message from query params -->
      <div v-if="successMessage" class="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{{ successMessage }}</p>
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
      
      <!-- Dashboard Header with Stats -->
      <DashboardHeader :stats="stats" @new="handleNewPertek" />
      
      <!-- Controls: Combined Filters and View Toggle -->
      <PertekControls 
        ref="controlsRef"
        :current-view="currentView"
        :total-items="totalItems"
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
        <h3 class="mt-4 text-lg font-medium text-slate-900">Belum ada permohonan PERTEK</h3>
        <p class="mt-1 text-sm text-slate-500">Anda belum mengajukan permohonan PERTEK. Klik tombol "Ajukan PERTEK Baru" untuk mulai mengajukan.</p>
        <div class="mt-6">
          <button
            @click="handleNewPertek"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajukan PERTEK Baru
          </button>
        </div>
      </div>
      
      <!-- Content based on view type -->
      <div v-else>
        <!-- Card View -->
        <div v-if="currentView === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <PertekCard 
            v-for="pertek in pertekItems" 
            :key="pertek.id"
            :pertek="pertek"
            @view="viewPertekDetail"
          />
        </div>
        
        <!-- Table View -->
        <div v-else-if="currentView === 'table'" class="mb-6">
          <PertekTable 
            :pertek-items="pertekItems"
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
import { useRoute, useRouter } from 'vue-router';
import Navbar from '~/components/navbar/index.vue';
import PertekCard from '~/components/pertek/PertekCard.vue';
import PertekTable from '~/components/pertek/PertekTable.vue';
import PertekControls from '~/components/pertek/PertekControls.vue';
import DashboardHeader from '~/components/pertek/DashboardHeader.vue';
import Pagination from '~/components/common/Pagination.vue';

// SEO metadata
useHead({
  title: 'Dashboard PERTEK | DLH Kabupaten Grobogan',
  meta: [
    { name: 'description', content: 'Kelola permohonan Persetujuan Teknis (PERTEK) di Dinas Lingkungan Hidup Kabupaten Grobogan.' },
    { name: 'keywords', content: 'pertek, dashboard, status pertek, dinas lingkungan hidup, grobogan, persetujuan teknis' }
  ]
});

const route = useRoute();
const router = useRouter();
const controlsRef = ref(null);

// State
const loading = ref(true);
const error = ref('');
const successMessage = ref('');
const pertekItems = ref([]);
const currentPage = ref(1);
const perPage = ref(10);
const totalPages = ref(0);
const totalItems = ref(0);
const currentView = ref('card'); // Default to card view
const stats = reactive({
  total: 0,
  inProgress: 0,
  issued: 0
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
    
    // API call
    const response = await $fetch(`/api/pertek/list?${queryParams.toString()}`);
    
    // Update state with response data
    if (response.success) {
      pertekItems.value = response.data;
      totalPages.value = response.pagination.totalPages;
      totalItems.value = response.pagination.totalItems;
      
      // Calculate stats
      calculateStats(response.data);
    } else {
      error.value = 'Gagal memuat data PERTEK';
    }
    
  } catch (e) {
    console.error('Error fetching PERTEK data:', e);
    error.value = 'Terjadi kesalahan saat memuat data. Silakan coba lagi.';
  } finally {
    loading.value = false;
  }
};

// Calculate summary statistics
const calculateStats = (data) => {
  // Reset stats
  stats.total = totalItems.value;
  stats.inProgress = 0;
  stats.issued = 0;
  
  // Count in progress and issued
  data.forEach(pertek => {
    if (pertek.status === 'PERTEK_ISSUED') {
      stats.issued++;
    } else if (['REJECTED'].includes(pertek.status)) {
      // Tidak dihitung dalam proses
    } else {
      stats.inProgress++;
    }
  });
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
    localStorage.setItem('pertek-dashboard-view', view);
  } catch (e) {
    // Ignore localStorage errors
  }
};

// View PERTEK detail
const viewPertekDetail = (id) => {
  router.push(`/pertek/${id}`);
};

// Handle new PERTEK button
const handleNewPertek = () => {
  router.push('/pertek/pengajuan-permohonan');
};

// Load saved view preference
const loadViewPreference = () => {
  try {
    const savedView = localStorage.getItem('pertek-dashboard-view');
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
  
  // Check for success message in query params
  if (route.query.success === 'true' && route.query.message) {
    successMessage.value = route.query.message;
    
    // Clear success message from URL and state after 5 seconds
    setTimeout(() => {
      router.replace({ path: route.path });
      successMessage.value = '';
    }, 5000);
  }
  
  // Fetch PERTEK data
  fetchPertekList();
});
</script>