<template>
  <section class="relative bg-gradient-to-br from-slate-800 to-slate-900 py-16 md:py-24 text-white overflow-hidden">
    <div class="absolute inset-0 z-0 opacity-10">
      <div class="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat"></div>
    </div>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
          Aplikasi Persetujuan Teknis & SLO
          <span class="block text-slate-300 mt-2">Dinas Lingkungan Hidup Kabupaten Grobogan</span>
        </h1>
        <p class="text-slate-300 text-lg mb-8 max-w-3xl mx-auto">
          Sistem manajemen dokumen untuk perizinan lingkungan dan pemantauan status pengajuan secara transparan dan efisien
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <NuxtLink to="/login" class="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-slate-900 bg-white hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm">
            Masuk Akun
          </NuxtLink>
          <NuxtLink to="/register" class="inline-flex items-center px-5 py-3 border border-slate-300 text-base font-medium rounded-md text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">
            Daftar Akun
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No props or data needed for this component
</script>
