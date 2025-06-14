<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-lg">
    <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
      <div>
        <h3 class="text-lg leading-6 font-medium text-gray-900">PERTEK Information</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">Basic details for this PERTEK application</p>
      </div>
      <div v-if="pertek.pertekNumber" class="px-3 py-1 inline-flex items-center rounded-full bg-green-100 text-green-800 text-sm font-medium">
        PERTEK #{{ pertek.pertekNumber }}
      </div>
    </div>
    <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
      <dl class="sm:divide-y sm:divide-gray-200">
        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Company</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ pertek.company }}</dd>
        </div>
        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Address</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{{ pertek.address }}</dd>
        </div>
        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Type</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <span v-if="pertek.type === 'EMISI'" class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
              Pembuangan Emisi
            </span>
            <span v-else-if="pertek.type === 'AIR_LIMBAH'" class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
              Air Limbah
            </span>
          </dd>
        </div>
        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Submitted By</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {{ pertek.user?.name || 'Unknown' }}
            <span class="text-gray-500 ml-2">({{ pertek.user?.email || 'No email' }})</span>
          </dd>
        </div>
        <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
          <dt class="text-sm font-medium text-gray-500">Created At</dt>
          <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            {{ formatDate(pertek.createdAt) }}
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  pertek: {
    type: Object,
    required: true
  }
})

// Format date for better readability
const formatDate = (dateString: string | Date | null | undefined) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', { 
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(date)
}
</script>
