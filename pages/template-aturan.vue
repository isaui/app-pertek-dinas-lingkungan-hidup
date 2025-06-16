<template>
    <div>
      <!-- Navbar -->
      <Navbar />
      
      <!-- Main Content -->
      <div class="min-h-screen bg-slate-50">
        <!-- Header Section -->
        <div class="bg-white border-b border-slate-200">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center">
              <h1 class="text-3xl font-bold text-slate-900 mb-2">
                Template & Aturan
              </h1>
              <p class="text-lg text-slate-600 max-w-2xl mx-auto">
                Download template dan aturan terkait dokumen PERTEK dan SLO dari Dinas Lingkungan Hidup Kabupaten Grobogan
              </p>
            </div>
          </div>
        </div>
  
        <!-- Downloads Section -->
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 class="text-xl font-semibold text-slate-900 flex items-center">
                <svg class="w-6 h-6 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Link Download
              </h2>
            </div>
            
            <div class="divide-y divide-slate-200">
              <!-- Template Surat Permohonan Pertek -->
              <div class="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-slate-900 mb-1">
                      Template Surat Permohonan Pertek
                    </h3>
                    <p class="text-sm text-slate-600">
                      Template resmi untuk pengajuan permohonan dokumen PERTEK
                    </p>
                  </div>
                  <a 
                    href="/downloads/template-permohonan-pertek.pdf" 
                    target="_blank"
                    class="ml-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
  
              <!-- Template Surat Permohonan SLO -->
              <div class="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-slate-900 mb-1">
                      Template Surat Permohonan SLO
                    </h3>
                    <p class="text-sm text-slate-600">
                      Template resmi untuk pengajuan permohonan dokumen SLO
                    </p>
                  </div>
                  <a 
                    href="/downloads/template-permohonan-slo.pdf" 
                    target="_blank"
                    class="ml-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
  
              <!-- PP Nomor 22 Tahun 2021 -->
              <div class="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-slate-900 mb-1">
                      PP Nomor 22 Tahun 2021
                    </h3>
                    <p class="text-sm text-slate-600">
                      Peraturan Pemerintah tentang Penyelenggaraan Perlindungan dan Pengelolaan Lingkungan Hidup
                    </p>
                  </div>
                  <a 
                    href="/downloads/pp-22-2021.pdf" 
                    target="_blank"
                    class="ml-4 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
  
              <!-- Permen LHK Nomor 5 tahun 2021 -->
              <div class="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-slate-900 mb-1">
                      Permen LHK Nomor 5 Tahun 2021
                    </h3>
                    <p class="text-sm text-slate-600">
                      Peraturan Menteri Lingkungan Hidup dan Kehutanan tentang Tata Cara Penerbitan Persetujuan Teknis dan Surat Laik Operasi
                    </p>
                  </div>
                  <a 
                    href="/downloads/permen-lhk-5-2021.pdf" 
                    target="_blank"
                    class="ml-4 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Info Section -->
          <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div class="flex items-start">
              <svg class="w-6 h-6 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <h3 class="text-lg font-medium text-blue-900 mb-2">
                  Informasi Penting
                </h3>
                <ul class="text-blue-800 space-y-1 text-sm">
                  <li>• Pastikan menggunakan template terbaru untuk permohonan dokumen</li>
                  <li>• Baca dengan teliti peraturan yang berlaku sebelum mengajukan permohonan</li>
                  <li>• Hubungi kantor Dinas Lingkungan Hidup jika memerlukan bantuan lebih lanjut</li>
                </ul>
              </div>
            </div>
          </div>
  
          <!-- Contact Info -->
          <div class="mt-6 text-center">
            <p class="text-slate-600">
              Butuh bantuan? Hubungi 
              <span class="font-medium text-slate-900">Dinas Lingkungan Hidup Kabupaten Grobogan</span>
            </p>
            <p class="text-slate-500 text-sm mt-1">
              Telepon: (0292) 421234 | Email: dlh@grobogankab.go.id
            </p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useHead } from '#app'
  import Navbar from '~/components/navbar/index.vue'
  
  useHead({
    title: 'Template & Aturan - Aplikasi Status Dokumen PERTEK/SLO | Dinas Lingkungan Hidup Kabupaten Grobogan',
    meta: [
      { name: 'description', content: 'Download template surat permohonan dan aturan terkait dokumen PERTEK dan SLO dari Dinas Lingkungan Hidup Kabupaten Grobogan.' },
      { name: 'keywords', content: 'template permohonan, PERTEK, SLO, PP 22 2021, Permen LHK 5 2021, Dinas Lingkungan Hidup Grobogan' }
    ]
  })
  </script>