<template>
  <div class="mt-8 flex justify-end">
    <NuxtLink 
      to="/pertek" 
      class="mr-4 px-5 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-md hover:bg-slate-50 flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Kembali
    </NuxtLink>
    
    <button
      type="submit"
      class="px-5 py-2.5 bg-slate-800 text-white rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 flex items-center"
      :disabled="loading"
    >
      <template v-if="loading">
        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Sedang Mengirim...
      </template>
      <template v-else>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ submitText || 'Ajukan Permohonan' }}
      </template>
    </button>
  </div>
</template>

<script setup>
defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  submitText: {
    type: String,
    default: 'Ajukan Permohonan'
  }
});
</script>
