<template>
  <nav class="hidden md:flex items-center justify-center flex-1 max-w-md mx-8">
    <div class="flex items-center space-x-6">
      <!-- Beranda - Always visible -->
      <NuxtLink 
        to="/" 
        class="relative px-3 py-2 text-base font-medium transition-colors duration-200"
        :class="isActive('/') ? 'text-slate-800' : 'text-slate-700 hover:text-slate-800'"
      >
        Beranda
        <div v-if="isActive('/')" class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800"></div>
      </NuxtLink>
      
      <!-- PERTEK & SLO - Only when logged in -->
      <template v-if="isLoggedIn">
        <NuxtLink 
          :to="userRole === 'administrator' ? '/admin/pertek' : '/pertek'" 
          class="relative px-3 py-2 text-base font-medium transition-colors duration-200"
          :class="isActive('/pertek') || isActive('/admin/pertek') ? 'text-slate-800' : 'text-slate-700 hover:text-slate-800'"
        >
          PERTEK
          <div v-if="isActive('/pertek') || isActive('/admin/pertek')" class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800"></div>
        </NuxtLink>
        <NuxtLink 
          :to="userRole === 'administrator' ? '/admin/slo' : '/slo'" 
          class="relative px-3 py-2 text-base font-medium transition-colors duration-200"
          :class="isActive('/slo') || isActive('/admin/slo') ? 'text-slate-800' : 'text-slate-700 hover:text-slate-800'"
        >
          SLO
          <div v-if="isActive('/slo') || isActive('/admin/slo')" class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800"></div>
        </NuxtLink>
      </template>
      
      <!-- Template & Aturan - Always visible -->
      <NuxtLink 
        to="/template-aturan" 
        class="relative px-3 py-2 text-base font-medium transition-colors duration-200"
        :class="isActive('/template-aturan') ? 'text-slate-800' : 'text-slate-700 hover:text-slate-800'"
      >
        Template & Aturan
        <div v-if="isActive('/template-aturan')" class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800"></div>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute()

defineProps({
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  userRole: {
    type: String,
    default: 'visitor'
  }
})

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
