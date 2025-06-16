<template>
  <div class="bg-white border border-slate-200 rounded-lg p-6">
    <h4 class="text-lg font-semibold text-slate-900 mb-4 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M5 21h2m-2 0h-2m0-16h2m0 0h2m-2 0h2M5 5v16" />
      </svg>
      Informasi Umum
    </h4>
    <div class="space-y-4">
      <div>
        <label class="text-sm font-medium text-slate-500">Nama Perusahaan</label>
        <p class="text-sm text-slate-900 mt-1">{{ slo.company }}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-slate-500">Alamat</label>
        <p class="text-sm text-slate-900 mt-1">{{ slo.address }}</p>
      </div>
      <div>
        <label class="text-sm font-medium text-slate-500">Jenis SLO</label>
        <p class="text-sm text-slate-900 mt-1">{{ getSloTypeLabel(slo.type) }}</p>
      </div>
      <div v-if="slo.sloNumber">
        <label class="text-sm font-medium text-slate-500">Nomor SLO</label>
        <p class="text-sm font-semibold text-green-700 mt-1">{{ slo.sloNumber }}</p>
      </div>
      <div v-if="slo.notes">
        <label class="text-sm font-medium text-slate-500">Catatan</label>
        <p class="text-sm text-slate-900 mt-1">{{ slo.notes }}</p>
      </div>
      <div v-if="slo.user">
        <label class="text-sm font-medium text-slate-500">Pemohon</label>
        <p class="text-sm text-slate-900 mt-1">{{ slo.user.name }}</p>
        <p v-if="slo.user.instansi" class="text-xs text-slate-600">{{ slo.user.instansi }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  slo: {
    type: Object,
    required: true
  }
});

const getSloTypeLabel = (type) => {
  const labels = {
    'EMISI': 'Pembuangan Emisi',
    'AIR_LIMBAH': 'Air Limbah'
  };
  return labels[type] || type;
};
</script>
