<template>
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-slate-900 mb-4">Layanan Dokumen Lingkungan</h2>
        <p class="text-xl text-slate-500 max-w-3xl mx-auto">
          Aplikasi ini menyediakan layanan pengelolaan dokumen PERTEK dan SLO untuk memudahkan proses pengajuan 
          dan pemantauan status dokumen lingkungan.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- PERTEK Card -->
        <div class="bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-100 hover:shadow-md transition">
          <div class="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 mb-2">Dokumen PERTEK</h3>
          <p class="text-slate-600 mb-4">
            Persetujuan Teknis untuk dokumen lingkungan terkait air limbah 
            dan pembuangan emisi dengan tracking status yang transparan.
          </p>
          <NuxtLink to="/pertek" class="text-slate-800 font-medium inline-flex items-center hover:text-slate-600">
            Pelajari lebih lanjut
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>

        <!-- SLO Card -->
        <div class="bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-100 hover:shadow-md transition">
          <div class="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 mb-2">Dokumen SLO</h3>
          <p class="text-slate-600 mb-4">
            Sertifikat Laik Operasi dengan proses verifikasi lapangan 
            dan pemantauan hasil emisi yang sistematis dan akuntabel.
          </p>
          <NuxtLink to="/slo" class="text-slate-800 font-medium inline-flex items-center hover:text-slate-600">
            Pelajari lebih lanjut
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>

        <!-- Template & Aturan Card -->
        <div class="bg-slate-50 rounded-lg shadow-sm p-6 border border-slate-100 hover:shadow-md transition">
          <div class="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-white mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 mb-2">Template & Aturan</h3>
          <p class="text-slate-600 mb-4">
            Dokumen panduan, template pengajuan, serta peraturan terkait 
            untuk memudahkan proses pengajuan dokumen lingkungan.
          </p>
          <NuxtLink to="/template-aturan" class="text-slate-800 font-medium inline-flex items-center hover:text-slate-600">
            Pelajari lebih lanjut
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No props or data needed for this component
</script>
