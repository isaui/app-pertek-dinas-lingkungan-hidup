<template>
  <section class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <h2 class="text-3xl font-bold text-slate-900 mb-4">Pertanyaan Umum</h2>
        <p class="text-xl text-slate-500 max-w-3xl mx-auto">
          Jawaban untuk pertanyaan yang sering diajukan tentang layanan kami
        </p>
      </div>

      <div class="max-w-3xl mx-auto">
        <div v-for="(item, index) in faqs" :key="index" class="mb-6 border-b border-slate-200 pb-6 last:border-0">
          <button 
            class="flex justify-between items-center w-full text-left focus:outline-none"
            @click="toggleFaq(index)"
          >
            <h3 class="text-lg font-medium text-slate-900">{{ item.question }}</h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5 text-slate-500 transform transition-transform duration-200" 
              :class="activeFaq === index ? 'rotate-180' : ''" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <div 
            v-show="activeFaq === index"
            class="mt-3 text-slate-600"
          >
            <p>{{ item.answer }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const activeFaq = ref(0) // Initially open the first FAQ

const toggleFaq = (index) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const faqs = [
  {
    question: 'Apa persyaratan untuk mengajukan dokumen PERTEK?',
    answer: 'Untuk mengajukan dokumen PERTEK, Anda memerlukan Surat Permohonan PERTEK, Dokumen AMDAL/UKL-UPL, dan Dokumen Standar Teknis atau Dokumen Kajian Teknis dalam format pdf/doc/docx/rar.'
  },
  {
    question: 'Berapa lama proses penerbitan dokumen SLO?',
    answer: 'Proses penerbitan dokumen SLO membutuhkan waktu sekitar 14-30 hari kerja setelah semua persyaratan lengkap, termasuk waktu untuk verifikasi lapangan dan pemeriksaan revisi jika diperlukan.'
  },
  {
    question: 'Bagaimana cara memantau status pengajuan dokumen saya?',
    answer: 'Setelah login dengan akun Anda, buka halaman Akun dan pilih tab "Status Dokumen PERTEK" atau "Status Dokumen SLO" untuk melihat status terbaru pengajuan dokumen Anda.'
  },
  {
    question: 'Apa yang harus dilakukan jika persyaratan dinyatakan tidak lengkap?',
    answer: 'Jika persyaratan dinyatakan tidak lengkap, sistem akan menampilkan daftar dokumen yang harus diperbaiki. Anda dapat mengunggah revisi dokumen melalui halaman yang sama.'
  },
  {
    question: 'Apakah setelah paparan masih bisa ada revisi?',
    answer: 'Ya, setelah paparan masih dimungkinkan adanya revisi jika tim verifikasi menemukan hal-hal yang perlu diperbaiki. Anda akan mendapatkan notifikasi dan daftar perbaikan yang diperlukan.'
  }
]
</script>
