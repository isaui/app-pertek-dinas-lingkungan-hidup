<template>
  <div class="flex items-center space-x-2">
    <span class="text-sm text-slate-500">Tampilan:</span>
    <button
      @click="$emit('change', 'table')"
      :class="[
        'p-1.5 rounded-md transition-colors',
        currentView === 'table' ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-500 hover:bg-slate-100'
      ]"
      title="Tampilan Tabel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    </button>
    <button
      @click="$emit('change', 'card')"
      :class="[
        'p-1.5 rounded-md transition-colors', 
        currentView === 'card' ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-500 hover:bg-slate-100'
      ]"
      title="Tampilan Kartu"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentView: {
    type: String,
    required: true,
    validator: (value) => ['table', 'card'].includes(value)
  }
});

defineEmits(['change']);
</script>
