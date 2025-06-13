<template>
  <div class="bg-white shadow rounded-md">
    <div class="px-6 py-4 border-b border-slate-200">
      <h3 class="text-lg font-medium text-slate-800">Informasi Akun</h3>
    </div>
    <div class="p-6 space-y-4">
      <div>
        <p class="text-sm text-slate-600">Terdaftar sejak</p>
        <p class="text-sm font-medium text-slate-800">{{ formattedDate }}</p>
      </div>
      <div>
        <p class="text-sm text-slate-600">Status Email</p>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
          {{ user.emailVerified ? 'Terverifikasi' : 'Belum Terverifikasi' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

// Format date helper
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formattedDate = computed(() => {
  return props.user?.createdAt ? formatDate(props.user.createdAt) : '-'
})
</script>
