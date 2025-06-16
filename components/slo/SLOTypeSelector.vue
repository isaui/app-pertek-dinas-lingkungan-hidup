<template>
    <div class="mb-6">
      <label for="sloType" class="block text-sm font-medium text-slate-700 mb-2">Jenis Surat Layak Operasi (SLO)</label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div 
          class="flex items-center border rounded-lg p-4 cursor-pointer"
          :class="modelValue === 'emisi' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'"
          @click="$emit('update:modelValue', 'emisi')"
        >
          <input
            id="sloType-emisi"
            type="radio"
            name="sloType" 
            value="emisi"
            :checked="modelValue === 'emisi'"
            class="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
            @change="$emit('update:modelValue', 'emisi')"
          />
          <label for="sloType-emisi" class="ml-3 block text-sm font-medium text-slate-700 cursor-pointer">
            <span class="font-medium block">Pembuangan Emisi</span>
            <span class="text-xs text-slate-500">Surat Layak Operasi untuk pembuangan emisi ke udara</span>
          </label>
        </div>
        
        <div 
          class="flex items-center border rounded-lg p-4 cursor-pointer"
          :class="modelValue === 'limbah' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'"
          @click="$emit('update:modelValue', 'limbah')"
        >
          <input
            id="sloType-limbah"
            type="radio"
            name="sloType" 
            value="limbah"
            :checked="modelValue === 'limbah'"
            class="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
            @change="$emit('update:modelValue', 'limbah')"
          />
          <label for="sloType-limbah" class="ml-3 block text-sm font-medium text-slate-700 cursor-pointer">
            <span class="font-medium block">Air Limbah</span>
            <span class="text-xs text-slate-500">Surat Layak Operasi untuk pembuangan/pemanfaatan air limbah</span>
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