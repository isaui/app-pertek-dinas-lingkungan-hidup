<template>
  <div class="mb-6">
    <label for="pertekType" class="block text-sm font-medium text-slate-700 mb-2">Jenis Persetujuan Teknis</label>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div 
        class="flex items-center border rounded-lg p-4 cursor-pointer"
        :class="modelValue === 'emisi' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'"
        @click="$emit('update:modelValue', 'emisi')"
      >
        <input
          id="pertekType-emisi"
          type="radio"
          name="pertekType" 
          value="emisi"
          :checked="modelValue === 'emisi'"
          class="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
          @change="$emit('update:modelValue', 'emisi')"
        />
        <label for="pertekType-emisi" class="ml-3 block text-sm font-medium text-slate-700 cursor-pointer">
          <span class="font-medium block">Pembuangan Emisi</span>
          <span class="text-xs text-slate-500">Persetujuan Teknis untuk pembuangan emisi ke udara</span>
        </label>
      </div>
      
      <div 
        class="flex items-center border rounded-lg p-4 cursor-pointer"
        :class="modelValue === 'limbah' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'"
        @click="$emit('update:modelValue', 'limbah')"
      >
        <input
          id="pertekType-limbah"
          type="radio"
          name="pertekType" 
          value="limbah"
          :checked="modelValue === 'limbah'"
          class="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
          @change="$emit('update:modelValue', 'limbah')"
        />
        <label for="pertekType-limbah" class="ml-3 block text-sm font-medium text-slate-700 cursor-pointer">
          <span class="font-medium block">Air Limbah</span>
          <span class="text-xs text-slate-500">Persetujuan Teknis untuk pembuangan/pemanfaatan air limbah</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String,
    default: 'emisi'
  }
});

defineEmits(['update:modelValue']);
</script>
