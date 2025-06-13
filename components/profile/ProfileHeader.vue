<template>
  <div class="bg-white border-b border-slate-200">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center space-x-6">
        <div class="h-20 w-20 rounded-full bg-slate-700 flex items-center justify-center">
          <span class="text-white font-semibold text-2xl">
            {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
          </span>
        </div>
        
        <div>
          <h1 class="text-2xl font-semibold text-slate-800">{{ user?.name || 'Loading...' }}</h1>
          <p class="text-slate-600">{{ user?.email }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ user?.instansi || 'Instansi tidak diisi' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  user: {
    type: Object,
    default: () => ({})
  }
})
</script>
