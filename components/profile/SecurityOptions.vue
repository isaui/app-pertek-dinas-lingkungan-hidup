<template>
  <div class="bg-white shadow rounded-md">
    <div class="px-6 py-4 border-b border-slate-200">
      <h3 class="text-lg font-medium text-slate-800">Keamanan</h3>
    </div>
    <div class="p-6 space-y-3">
      <button 
        @click="$emit('change-password')"
        class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded border border-slate-200"
      >
        Ubah Kata Sandi
      </button>
      <button 
        @click="$emit('logout')"
        class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
      >
        Keluar dari Akun
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['change-password', 'logout'])
</script>
