<template>
  <section class="py-16 bg-slate-800 text-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl font-bold mb-6">Siap Mengajukan Dokumen Anda?</h2>
      <p class="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
        Buat akun sekarang untuk memulai proses pengajuan dokumen PERTEK dan SLO
        dengan sistem yang transparan dan efisien
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <NuxtLink to="/login" class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-slate-900 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm">
          Login Akun
        </NuxtLink>
        <NuxtLink to="/register" class="inline-flex items-center px-6 py-3 border border-slate-300 text-base font-medium rounded-md text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
          Daftar Baru
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
// No props or data needed for this component
</script>
