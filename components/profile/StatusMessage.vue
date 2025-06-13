<template>
  <div v-if="show" :class="type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'" class="border rounded-md p-4">
    <div class="flex">
      <svg v-if="type === 'success'" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <p class="ml-3 text-sm" :class="type === 'success' ? 'text-green-800' : 'text-red-800'">{{ message }}</p>
    </div>
    <slot></slot>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'success',
    validator: (value) => ['success', 'error'].includes(value)
  },
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  }
})
</script>
