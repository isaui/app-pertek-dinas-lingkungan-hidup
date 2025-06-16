<template>
    <div class="bg-white shadow-sm rounded-lg border border-slate-200 p-6 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">Dashboard SLO</h1>
          <p class="mt-1 text-slate-600">Kelola permohonan Surat Layak Operasi Anda</p>
        </div>
        
        <div>
          <button
            @click="$emit('new')"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Ajukan SLO Baru
          </button>
        </div>
      </div>
      
      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div class="text-sm font-medium text-slate-500">Total Permohonan</div>
          <div class="mt-1 text-2xl font-semibold text-slate-800">{{ stats.total || 0 }}</div>
        </div>
        
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div class="text-sm font-medium text-slate-500">Dalam Proses</div>
          <div class="mt-1 text-2xl font-semibold text-slate-800">{{ stats.inProgress || 0 }}</div>
        </div>
        
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div class="text-sm font-medium text-slate-500">Verifikasi Terjadwal</div>
          <div class="mt-1 text-2xl font-semibold text-slate-800">{{ stats.scheduled || 0 }}</div>
        </div>
        
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <div class="text-sm font-medium text-slate-500">SLO Diterbitkan</div>
          <div class="mt-1 text-2xl font-semibold text-slate-800">{{ stats.issued || 0 }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    stats: {
      type: Object,
      default: () => ({
        total: 0,
        inProgress: 0,
        scheduled: 0,
        issued: 0
      })
    }
  });
  
  defineEmits(['new']);
  </script>