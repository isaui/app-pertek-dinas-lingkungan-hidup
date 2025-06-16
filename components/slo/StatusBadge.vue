<template>
    <span :class="badgeClasses">
      {{ statusLabel }}
    </span>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    status: {
      type: String,
      required: true
    }
  });
  
  // Computed untuk menerjemahkan status ke label Indonesia
  const statusLabel = computed(() => {
    const labels = {
      'SUBMITTED': 'Diajukan',
      'VERIFICATION': 'Verifikasi',
      'INCOMPLETE_REQUIREMENTS': 'Persyaratan Kurang',
      'COMPLETE_REQUIREMENTS': 'Persyaratan Lengkap',
      'FIELD_VERIFICATION_SCHEDULED': 'Verifikasi Dijadwalkan',
      'FIELD_VERIFICATION_COMPLETED': 'Verifikasi Selesai',
      'REVISION_SUBMITTED': 'Revisi Diajukan',
      'REVISION_REVIEW': 'Review Revisi',
      'REVISION_REJECTED': 'Revisi Ditolak',
      'REVISION_APPROVED': 'Revisi Disetujui',
      'SLO_ISSUED': 'SLO Diterbitkan',
      'REJECTED': 'Ditolak'
    };
    
    return labels[props.status] || props.status;
  });
  
  // Computed untuk menentukan class warna badge berdasarkan status
  const badgeClasses = computed(() => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    // Status yang berhasil/positif
    if (['SLO_ISSUED', 'REVISION_APPROVED', 'COMPLETE_REQUIREMENTS'].includes(props.status)) {
      return `${baseClasses} bg-green-100 text-green-800`;
    }
    
    // Status yang perlu perhatian/dalam proses
    if (['VERIFICATION', 'FIELD_VERIFICATION_SCHEDULED', 'FIELD_VERIFICATION_COMPLETED', 'REVISION_REVIEW'].includes(props.status)) {
      return `${baseClasses} bg-blue-100 text-blue-800`;
    }
    
    // Status yang negatif/perlu tindakan
    if (['INCOMPLETE_REQUIREMENTS', 'REVISION_REJECTED', 'REJECTED'].includes(props.status)) {
      return `${baseClasses} bg-red-100 text-red-800`;
    }
    
    // Status yang pending/waiting
    if (['SUBMITTED', 'REVISION_SUBMITTED'].includes(props.status)) {
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
    
    // Status default/netral
    return `${baseClasses} bg-gray-100 text-gray-800`;
  });
  </script>