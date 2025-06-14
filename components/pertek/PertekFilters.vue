<template>
  <div class="bg-white shadow-sm rounded-lg border border-slate-200 p-4 mb-6">
    <div class="flex flex-wrap items-center gap-4">
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
      
      <!-- Reset Button -->
      <div class="self-end">
        <button
          type="button"
          @click="resetFilters"
          class="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
          Reset Filter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Define emit events
const emit = defineEmits(['filter']);

// Estado de los filtros
const selectedStatus = ref('');
const selectedType = ref('');

// Opciones de estado disponibles
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

// Aplicar filtros y emitir evento
const applyFilters = () => {
  emit('filter', {
    status: selectedStatus.value,
    type: selectedType.value
  });
};

// Resetear filtros
const resetFilters = () => {
  selectedStatus.value = '';
  selectedType.value = '';
  applyFilters();
};

// Expose filter state
defineExpose({
  getFilters: () => ({
    status: selectedStatus.value,
    type: selectedType.value
  })
});
</script>
