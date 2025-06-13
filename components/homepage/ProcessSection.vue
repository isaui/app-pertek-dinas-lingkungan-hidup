<template>
  <section class="py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-slate-900 mb-4">Alur Proses Pengajuan</h2>
        <p class="text-xl text-slate-500 max-w-3xl mx-auto">
          Langkah-langkah pengajuan dokumen PERTEK dan SLO melalui sistem kami
        </p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Step 1 -->
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 flex items-center justify-center bg-slate-800 text-white text-xl font-bold rounded-full mb-4">1</div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">Daftar Akun</h3>
          <p class="text-slate-600">
            Buat akun dengan mengisi informasi identitas perusahaan dan data kontak yang valid
          </p>
        </div>
        
        <!-- Step 2 -->
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 flex items-center justify-center bg-slate-800 text-white text-xl font-bold rounded-full mb-4">2</div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">Upload Dokumen</h3>
          <p class="text-slate-600">
            Upload persyaratan sesuai jenis dokumen yang diajukan (PERTEK atau SLO)
          </p>
        </div>
        
        <!-- Step 3 -->
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 flex items-center justify-center bg-slate-800 text-white text-xl font-bold rounded-full mb-4">3</div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">Verifikasi & Paparan</h3>
          <p class="text-slate-600">
            Tim akan memverifikasi dokumen dan melakukan paparan jika diperlukan
          </p>
        </div>
        
        <!-- Step 4 -->
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 flex items-center justify-center bg-slate-800 text-white text-xl font-bold rounded-full mb-4">4</div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">Terbit Dokumen</h3>
          <p class="text-slate-600">
            Setelah disetujui, dokumen final akan tersedia untuk diunduh melalui sistem
          </p>
        </div>
      </div>
      
      <!-- Status Timeline -->
      <div class="mt-16 p-6 bg-white rounded-lg border border-slate-100 shadow-sm">
        <h3 class="text-xl font-semibold text-slate-900 mb-4 text-center">Pantau Status Dokumen Anda</h3>
        <div class="overflow-x-auto scrollbar-hide">
          <div class="flex min-w-max gap-2 justify-between pb-4">
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center mb-2">✓</div>
              <p class="text-sm font-medium text-slate-900">Upload Berhasil</p>
            </div>
            <div class="w-16 h-0.5 bg-slate-300 self-center"></div>
            
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mb-2">?</div>
              <p class="text-sm text-slate-600">Pemeriksaan</p>
            </div>
            <div class="w-16 h-0.5 bg-slate-300 self-center"></div>
            
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mb-2">?</div>
              <p class="text-sm text-slate-600">Paparan</p>
            </div>
            <div class="w-16 h-0.5 bg-slate-300 self-center"></div>
            
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mb-2">?</div>
              <p class="text-sm text-slate-600">Revisi</p>
            </div>
            <div class="w-16 h-0.5 bg-slate-300 self-center"></div>
            
            <div class="flex flex-col items-center">
              <div class="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center mb-2">?</div>
              <p class="text-sm text-slate-600">Terbit Dokumen</p>
            </div>
          </div>
        </div>
        <div class="mt-4 text-center">
          <NuxtLink to="/login" class="inline-block px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition">
            Masuk untuk melihat status
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// No props or data needed for this component
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}
</style>
