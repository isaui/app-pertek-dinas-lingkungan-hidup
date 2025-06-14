<template>
  <div class="flex justify-between items-center bg-white px-4 py-3 border border-slate-200 shadow-sm rounded-lg">
    <div class="flex-1 flex justify-between sm:hidden">
      <button
        @click="prev"
        :disabled="currentPage === 1"
        :class="[
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50',
          'relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white'
        ]"
      >
        Sebelumnya
      </button>
      <span class="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
        Halaman {{ currentPage }} dari {{ totalPages }}
      </span>
      <button
        @click="next"
        :disabled="currentPage === totalPages"
        :class="[
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50',
          'relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white'
        ]"
      >
        Selanjutnya
      </button>
    </div>
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-slate-700">
          Menampilkan 
          <span class="font-medium">{{ startItem }}</span>
          sampai
          <span class="font-medium">{{ endItem }}</span>
          dari
          <span class="font-medium">{{ totalItems }}</span>
          hasil
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            @click="prev"
            :disabled="currentPage === 1"
            :class="[
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50',
              'relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500'
            ]"
          >
            <span class="sr-only">Previous</span>
            <!-- Heroicon name: solid/chevron-left -->
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <div v-for="page in pages" :key="page">
            <!-- Current page -->
            <button
              v-if="page === currentPage"
              aria-current="page"
              class="z-10 bg-slate-100 border-slate-500 text-slate-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
            >
              {{ page }}
            </button>
            
            <!-- Other page -->
            <button
              v-else-if="page !== '...'"
              @click="goToPage(page)"
              class="bg-white border-slate-300 text-slate-500 hover:bg-slate-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
            >
              {{ page }}
            </button>
            
            <!-- Ellipsis -->
            <span
              v-else
              class="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700"
            >
              ...
            </span>
          </div>
          
          <button
            @click="next"
            :disabled="currentPage === totalPages"
            :class="[
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50',
              'relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500'
            ]"
          >
            <span class="sr-only">Next</span>
            <!-- Heroicon name: solid/chevron-right -->
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  perPage: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['page-change']);

// Menghitung item yang ditampilkan
const startItem = computed(() => {
  return (props.currentPage - 1) * props.perPage + 1;
});

const endItem = computed(() => {
  const end = props.currentPage * props.perPage;
  return end > props.totalItems ? props.totalItems : end;
});

// Generate page numbers to display
const pages = computed(() => {
  const pageArray = [];
  const maxVisiblePages = 5;
  
  if (props.totalPages <= maxVisiblePages) {
    // Show all pages if totalPages <= maxVisiblePages
    for (let i = 1; i <= props.totalPages; i++) {
      pageArray.push(i);
    }
  } else {
    // Always include first page
    pageArray.push(1);
    
    let startPage = Math.max(2, props.currentPage - 1);
    let endPage = Math.min(props.totalPages - 1, props.currentPage + 1);
    
    // Adjust if current page is near the beginning
    if (props.currentPage <= 3) {
      endPage = 4;
    }
    
    // Adjust if current page is near the end
    if (props.currentPage >= props.totalPages - 2) {
      startPage = props.totalPages - 3;
    }
    
    // Add ellipsis if needed
    if (startPage > 2) {
      pageArray.push('...');
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageArray.push(i);
    }
    
    // Add ellipsis if needed
    if (endPage < props.totalPages - 1) {
      pageArray.push('...');
    }
    
    // Always include last page
    pageArray.push(props.totalPages);
  }
  
  return pageArray;
});

// Navigation methods
const prev = () => {
  if (props.currentPage > 1) {
    emit('page-change', props.currentPage - 1);
  }
};

const next = () => {
  if (props.currentPage < props.totalPages) {
    emit('page-change', props.currentPage + 1);
  }
};

const goToPage = (page) => {
  emit('page-change', page);
};
</script>
