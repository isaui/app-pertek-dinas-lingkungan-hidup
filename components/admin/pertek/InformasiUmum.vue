<template>
    <div class="space-y-6">
      <!-- Informasi Dasar -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Nama Perusahaan</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ pertek.company }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Alamat</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ pertek.address }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Jenis PERTEK</dt>
            <dd class="mt-1">
              <span v-if="pertek.type === 'EMISI'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pembuangan Emisi
              </span>
              <span v-else-if="pertek.type === 'AIR_LIMBAH'" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Air Limbah
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Status Saat Ini</dt>
            <dd class="mt-1">
              <span :class="getStatusClass(pertek.status)" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                {{ getStatusLabel(pertek.status) }}
              </span>
            </dd>
          </div>
          <div v-if="pertek.pertekNumber">
            <dt class="text-sm font-medium text-gray-500">Nomor PERTEK</dt>
            <dd class="mt-1 text-sm font-mono text-gray-900 bg-green-50 px-2 py-1 rounded">{{ pertek.pertekNumber }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Tanggal Pengajuan</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(pertek.createdAt) }}</dd>
          </div>
          <div v-if="pertek.approvedAt">
            <dt class="text-sm font-medium text-gray-500">Tanggal Disetujui</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDate(pertek.approvedAt) }}</dd>
          </div>
        </dl>
      </div>
  
      <!-- Informasi Pemohon -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informasi Pemohon</h3>
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-medium text-gray-500">Nama</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ pertek.user?.name || 'Tidak tersedia' }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-gray-500">Email</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ pertek.user?.email || 'Tidak tersedia' }}</dd>
          </div>
          <div v-if="pertek.user?.instansi">
            <dt class="text-sm font-medium text-gray-500">Instansi</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ pertek.user.instansi }}</dd>
          </div>
          <div v-if="pertek.user?.nomorHp">
            <dt class="text-sm font-medium text-gray-500">Nomor HP</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ pertek.user.nomorHp }}</dd>
          </div>
        </dl>
      </div>
  
      <!-- Informasi Paparan (jika ada) -->
      <div v-if="pertek.paparanDate || pertek.paparanLocation" class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informasi Paparan</h3>
        <dl class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div v-if="pertek.paparanDate">
            <dt class="text-sm font-medium text-gray-500">Tanggal & Waktu</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(pertek.paparanDate) }}</dd>
          </div>
          <div v-if="pertek.paparanLocation">
            <dt class="text-sm font-medium text-gray-500">Lokasi</dt>
            <dd class="mt-1 text-sm text-gray-900">{{ pertek.paparanLocation }}</dd>
          </div>
        </dl>
      </div>
  
      <!-- Catatan (jika ada) -->
      <div v-if="pertek.notes || pertek.feedbackToUser" class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Catatan</h3>
        <div class="space-y-4">
          <div v-if="pertek.notes">
            <dt class="text-sm font-medium text-gray-500">Catatan Pemohon</dt>
            <dd class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{{ pertek.notes }}</dd>
          </div>
        </div>
      </div>
  
      <!-- Statistik Dokumen -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Ringkasan Dokumen</h3>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ getTotalDocuments() }}</div>
            <div class="text-sm text-gray-500">Total Dokumen</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ getDocumentsByType('PERSYARATAN').length }}</div>
            <div class="text-sm text-gray-500">Persyaratan</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-yellow-600">{{ getDocumentsByType('REVISI').length }}</div>
            <div class="text-sm text-gray-500">Revisi</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">{{ getDocumentsByType('SURAT_UNDANGAN_PAPARAN').length }}</div>
            <div class="text-sm text-gray-500">Surat Undangan</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ getDocumentsByType('PERTEK_FINAL').length }}</div>
            <div class="text-sm text-gray-500">Final</div>
          </div>
        </div>
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
  
  // Helper functions
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Tidak tersedia'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long'
    }).format(date)
  }
  
  const formatDateTime = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'Tidak tersedia'
    
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short'
    }).format(date)
  }
  
  const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
      'SUBMITTED': 'bg-gray-100 text-gray-800',
      'VERIFICATION': 'bg-blue-100 text-blue-800',
      'INCOMPLETE_REQUIREMENTS': 'bg-red-100 text-red-800',
      'COMPLETE_REQUIREMENTS': 'bg-green-100 text-green-800',
      'SCHEDULED_PAPARAN': 'bg-purple-100 text-purple-800',
      'PAPARAN_COMPLETED': 'bg-yellow-100 text-yellow-800',
      'REVISION_SUBMITTED': 'bg-indigo-100 text-indigo-800',
      'REVISION_REVIEW': 'bg-blue-100 text-blue-800',
      'REVISION_REJECTED': 'bg-red-100 text-red-800',
      'REVISION_APPROVED': 'bg-green-100 text-green-800',
      'PERTEK_ISSUED': 'bg-emerald-100 text-emerald-800',
      'REJECTED': 'bg-red-100 text-red-800'
    }
    
    return classes[status] || 'bg-gray-100 text-gray-800'
  }
  
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'SUBMITTED': 'Pengajuan Baru',
      'VERIFICATION': 'Proses Verifikasi',
      'INCOMPLETE_REQUIREMENTS': 'Persyaratan Tidak Lengkap',
      'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
      'SCHEDULED_PAPARAN': 'Paparan Dijadwalkan',
      'PAPARAN_COMPLETED': 'Paparan Selesai',
      'REVISION_SUBMITTED': 'Revisi Disubmit',
      'REVISION_REVIEW': 'Review Revisi',
      'REVISION_REJECTED': 'Revisi Ditolak',
      'REVISION_APPROVED': 'Revisi Disetujui',
      'PERTEK_ISSUED': 'PERTEK Diterbitkan',
      'REJECTED': 'Ditolak'
    }
    
    return labels[status] || status
  }
  
  const getTotalDocuments = () => {
    return props.pertek.documents?.length || 0
  }
  
  const getDocumentsByType = (type: string) => {
    return props.pertek.documents?.filter((doc: any) => doc.type === type) || []
  }
  </script>