<template>
  <transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="transform opacity-0 -translate-y-2"
    enter-to-class="transform opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="transform opacity-100 translate-y-0"
    leave-to-class="transform opacity-0 -translate-y-2"
  >
    <div v-if="isOpen" class="md:hidden border-t border-slate-200">
      <!-- Navigation Links -->
      <div class="bg-slate-50 py-3 space-y-1">
        <!-- Beranda - Always visible -->
        <NuxtLink 
          to="/" 
          @click="$emit('close')"
          class="block mx-3 px-4 py-3 text-base font-medium rounded-lg transition-colors"
          :class="isActive('/') ? 'text-slate-800 bg-slate-100' : 'text-slate-700 hover:bg-white'"
        >
          Beranda
        </NuxtLink>
        
        <!-- PERTEK & SLO - Only when logged in -->
        <template v-if="isLoggedIn">
          <NuxtLink 
            :to="userRole === 'administrator' ? '/admin/pertek' : '/pertek'" 
            @click="$emit('close')"
            class="block mx-3 px-4 py-3 text-base font-medium rounded-lg transition-colors"
            :class="isActive('/pertek') || isActive('/admin/pertek') ? 'text-slate-800 bg-slate-100' : 'text-slate-700 hover:bg-white'"
          >
            PERTEK
          </NuxtLink>
          
          <NuxtLink 
            :to="userRole === 'administrator' ? '/admin/slo' : '/slo'" 
            @click="$emit('close')"
            class="block mx-3 px-4 py-3 text-base font-medium rounded-lg transition-colors"
            :class="isActive('/slo') || isActive('/admin/slo') ? 'text-slate-800 bg-slate-100' : 'text-slate-700 hover:bg-white'"
          >
            SLO
          </NuxtLink>
        </template>
        
        <!-- Template & Aturan - Always visible -->
        <NuxtLink 
          to="/template-aturan" 
          @click="$emit('close')"
          class="block mx-3 px-4 py-3 text-base font-medium rounded-lg transition-colors"
          :class="isActive('/template-aturan') ? 'text-slate-800 bg-slate-100' : 'text-slate-700 hover:bg-white'"
        >
          Template & Aturan
        </NuxtLink>
        
        <!-- Auth buttons only shown when NOT logged in -->
        <div v-if="!isLoggedIn" class="mt-3">
          <div class="px-3">
            <NuxtLink 
              to="/login"
              @click="$emit('close')"
              class="block w-full mb-2 py-2 px-4 text-center bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Masuk
            </NuxtLink>
            <NuxtLink 
              to="/register"
              @click="$emit('close')"
              class="block w-full py-2 px-4 text-center bg-slate-800 border border-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Daftar
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Mobile User Section (When Logged In) -->
      <div v-if="isLoggedIn && user" class="bg-white border-t border-slate-200 py-4">
        <div class="flex items-center px-5 mb-3">
          <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span class="text-base font-semibold text-white">
              {{ userInitial }}
            </span>
          </div>
          <div class="ml-4">
            <div class="text-base font-semibold text-slate-900">{{ user.name || 'User' }}</div>
            <div class="text-sm text-slate-500">{{ user.email || 'email@example.com' }}</div>
            <div class="text-sm text-emerald-600 font-medium">{{ userRole }}</div>
          </div>
        </div>
        
        <div class="px-4">
          <button 
            @click="$emit('logout')"
            class="w-full flex items-center justify-center px-4 py-3 text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const route = useRoute()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  user: {
    type: Object,
    default: () => ({})
  },
  userRole: {
    type: String,
    default: 'Administrator'
  }
})

defineEmits(['close', 'logout'])

const userInitial = computed(() => {
  return props.user?.name?.charAt(0).toUpperCase() || 'U'
})

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
