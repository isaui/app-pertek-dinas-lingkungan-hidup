<template>
  <div class="homepage-container">
    <Navbar />
    
    <!-- Hero Section -->
    <HeroSection />
    
    <!-- Features Section -->
    <FeaturesSection />
    
    <!-- Process Section -->
    <ProcessSection />
    
    <!-- FAQ Section -->
    <FaqSection />
    
    <!-- CTA Section -->
    <CtaSection />
    
    <!-- Footer Section -->
    <FooterSection />
  </div>
</template>

<script setup>
import { useHead } from '#app'
import Navbar from '~/components/navbar/index.vue'
import HeroSection from '~/components/homepage/HeroSection.vue'
import FeaturesSection from '~/components/homepage/FeaturesSection.vue'
import ProcessSection from '~/components/homepage/ProcessSection.vue'
import FaqSection from '~/components/homepage/FaqSection.vue'
import CtaSection from '~/components/homepage/CtaSection.vue'
import FooterSection from '~/components/homepage/FooterSection.vue'

// SEO metadata
useHead({
  title: 'Aplikasi Status Dokumen PERTEK/SLO | Dinas Lingkungan Hidup Kabupaten Grobogan',
  meta: [
    { name: 'description', content: 'Aplikasi status dokumen Persetujuan Teknis (PERTEK) dan Sertifikat Laik Operasi (SLO) Dinas Lingkungan Hidup Kabupaten Grobogan.' },
    { name: 'keywords', content: 'pertek, slo, dinas lingkungan hidup, grobogan, dokumen lingkungan, persetujuan teknis, laik operasi' },
    { name: 'author', content: 'DLH Kabupaten Grobogan' },
    { property: 'og:title', content: 'Aplikasi Status Dokumen PERTEK/SLO' },
    { property: 'og:description', content: 'Aplikasi status dokumen Persetujuan Teknis (PERTEK) dan Sertifikat Laik Operasi (SLO) Dinas Lingkungan Hidup Kabupaten Grobogan.' },
    { property: 'og:type', content: 'website' },
    { name: 'robots', content: 'index, follow' }
  ]
})
</script>

<style>
/* Add any page-specific styles here */
.homepage-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
