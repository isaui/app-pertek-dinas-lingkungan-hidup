<template>
  <div class="bg-white shadow-sm rounded-lg border border-slate-200 p-4 mb-6">
    <!-- Search Bar (Admin Only) -->
    <div v-if="isAdmin" class="mb-4">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg class="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari berdasarkan nama perusahaan, alamat, atau nomor PERTEK..."
          class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
          @input="handleSearchInput"
        />
        <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            @click="clearSearch"
            class="text-slate-400 hover:text-slate-600"
            type="button"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
      <!-- Filters Section -->
      <div class="flex flex-wrap items-end gap-4">
        <!-- Filter Status -->
        <div>
          <label for="status-filter" class="block text-sm font-medium text-slate-700 mb-1">Status</label>
          <select
            id="status-filter"
            v-model="selectedStatus"
            class="block w-full pl-3 pr-10 py-2 text-base border border-slate-300 rounded-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            @change="applyFilters"
          >
            <option value="">Semua Status</option>
            <option v-for="status in statusOptions" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </select>
        </div>
        
        <!-- Filter Tipe -->
        <div>
          <label for="type-filter" class="block text-sm font-medium text-slate-700 mb-1">Tipe PERTEK</label>
          <select
            id="type-filter"
            v-model="selectedType"
            class="block w-full pl-3 pr-10 py-2 text-base border border-slate-300 rounded-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            @change="applyFilters"
          >
            <option value="">Semua Tipe</option>
            <option value="EMISI">Pembuangan Emisi</option>
            <option value="AIR_LIMBAH">Air Limbah</option>
          </select>
        </div>
        
        <!-- Sort Options -->
        <div>
          <label for="sort-filter" class="block text-sm font-medium text-slate-700 mb-1">Urutkan</label>
          <select
            id="sort-filter"
            v-model="selectedSort"
            class="block w-full pl-3 pr-10 py-2 text-base border border-slate-300 rounded-md focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
            @change="applyFilters"
          >
            <option v-for="sort in sortOptions" :key="sort.value" :value="sort.value">
              {{ sort.label }}
            </option>
          </select>
        </div>
        
        <!-- Reset Button -->
        <div>
          <button
            type="button"
            @click="resetFilters"
            class="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>
      </div>
      
      <!-- View Toggle Section -->
      <div class="flex items-center justify-between lg:justify-end">
        <!-- Responsive info text -->
        <span class="text-sm text-slate-500 mr-4 lg:hidden">
          {{ totalItems || 0 }} permohonan
        </span>
        
        <!-- View Toggle -->
        <div class="flex items-center space-x-2">
          <span class="text-sm text-slate-500">Tampilan:</span>
          <div class="flex border border-slate-200 rounded-md overflow-hidden">
            <button
              @click="handleViewChange('table')"
              :class="[
                'p-2 transition-colors',
                currentView === 'table' 
                  ? 'bg-slate-200 text-slate-800' 
                  : 'bg-white text-slate-500 hover:bg-slate-100'
              ]"
              title="Tampilan Tabel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              @click="handleViewChange('card')"
              :class="[
                'p-2 transition-colors', 
                currentView === 'card' 
                  ? 'bg-slate-200 text-slate-800' 
                  : 'bg-white text-slate-500 hover:bg-slate-100'
              ]"
              title="Tampilan Kartu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-3 pt-3 border-t border-slate-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-slate-500">Filter aktif:</span>
          <div class="flex flex-wrap items-center gap-2">
            <span v-if="searchQuery" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
              Pencarian: "{{ searchQuery }}"
              <button @click="clearSearch" class="ml-1 text-indigo-600 hover:text-indigo-800">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span v-if="selectedStatus" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
              {{ getStatusLabel(selectedStatus) }}
              <button @click="clearStatusFilter" class="ml-1 text-blue-600 hover:text-blue-800">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span v-if="selectedType" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
              {{ getTypeLabel(selectedType) }}
              <button @click="clearTypeFilter" class="ml-1 text-green-600 hover:text-green-800">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
            <span v-if="selectedSort !== 'created_desc'" class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
              {{ getSortLabel(selectedSort) }}
              <button @click="clearSortFilter" class="ml-1 text-purple-600 hover:text-purple-800">
                <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>
        <button @click="resetFilters" class="text-sm text-slate-500 hover:text-slate-700">
          Hapus semua filter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
  currentView: {
    type: String,
    required: true,
    validator: (value) => ['table', 'card'].includes(value)
  },
  totalItems: {
    type: Number,
    default: 0
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
});

// Define emit events
const emit = defineEmits(['filter', 'view-change']);

// Filter state
const selectedStatus = ref('');
const selectedType = ref('');
const selectedSort = ref('created_desc'); // Default sort
const searchQuery = ref('');

// Search debounce timer
let searchTimeout = null;

// Status options
const statusOptions = [
  { value: 'SUBMITTED', label: 'Diajukan' },
  { value: 'VERIFICATION', label: 'Verifikasi' },
  { value: 'INCOMPLETE_REQUIREMENTS', label: 'Persyaratan Kurang' },
  { value: 'COMPLETE_REQUIREMENTS', label: 'Persyaratan Lengkap' },
  { value: 'SCHEDULED_PAPARAN', label: 'Paparan Dijadwalkan' },
  { value: 'PAPARAN_COMPLETED', label: 'Paparan Selesai' },
  { value: 'REVISION_SUBMITTED', label: 'Revisi Diajukan' },
  { value: 'REVISION_REVIEW', label: 'Review Revisi' },
  { value: 'REVISION_REJECTED', label: 'Revisi Ditolak' },
  { value: 'REVISION_APPROVED', label: 'Revisi Disetujui' },
  { value: 'PERTEK_ISSUED', label: 'PERTEK Diterbitkan' },
  { value: 'REJECTED', label: 'Ditolak' }
];

// Sort options - Enhanced for admin
const sortOptions = [
  { value: 'created_desc', label: 'Terbaru Diajukan' },
  { value: 'created_asc', label: 'Terlama Diajukan' },
  { value: 'updated_desc', label: 'Terbaru Diperbarui' },
  { value: 'updated_asc', label: 'Terlama Diperbarui' },
  { value: 'company_asc', label: 'Perusahaan A-Z' },
  { value: 'company_desc', label: 'Perusahaan Z-A' }
];

// Computed
const hasActiveFilters = computed(() => {
  return selectedStatus.value || 
         selectedType.value || 
         selectedSort.value !== 'created_desc' ||
         searchQuery.value;
});

// Methods
const applyFilters = () => {
  emit('filter', {
    status: selectedStatus.value,
    type: selectedType.value,
    sort: selectedSort.value,
    search: searchQuery.value
  });
};

// Debounced search input handler
const handleSearchInput = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 500); // 500ms debounce
};

const resetFilters = () => {
  selectedStatus.value = '';
  selectedType.value = '';
  selectedSort.value = 'created_desc';
  searchQuery.value = '';
  applyFilters();
};

const handleViewChange = (view) => {
  emit('view-change', view);
};

const clearSearch = () => {
  searchQuery.value = '';
  applyFilters();
};

const clearStatusFilter = () => {
  selectedStatus.value = '';
  applyFilters();
};

const clearTypeFilter = () => {
  selectedType.value = '';
  applyFilters();
};

const clearSortFilter = () => {
  selectedSort.value = 'created_desc';
  applyFilters();
};

const getStatusLabel = (status) => {
  const option = statusOptions.find(opt => opt.value === status);
  return option ? option.label : status;
};

const getTypeLabel = (type) => {
  const typeLabels = {
    'EMISI': 'Pembuangan Emisi',
    'AIR_LIMBAH': 'Air Limbah'
  };
  return typeLabels[type] || type;
};

const getSortLabel = (sort) => {
  const option = sortOptions.find(opt => opt.value === sort);
  return option ? option.label : sort;
};

// Expose methods and state
defineExpose({
  getFilters: () => ({
    status: selectedStatus.value,
    type: selectedType.value,
    sort: selectedSort.value,
    search: searchQuery.value
  }),
  resetFilters
});
</script>