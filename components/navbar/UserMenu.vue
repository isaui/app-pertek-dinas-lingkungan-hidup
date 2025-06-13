<template>
  <div class="hidden md:block relative" ref="profileDropdown">
    <button 
      @click="toggleProfileMenu"
      class="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
    >
      <div class="flex items-center space-x-3">
        <div class="text-right hidden lg:block">
          <div class="text-sm font-semibold text-slate-900 truncate max-w-[120px]">{{ user?.name || 'User' }}</div>
          <div class="text-xs text-slate-500">{{ userRole }}</div>
        </div>
        <div class="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
          <span class="text-sm font-semibold text-white">
            {{ userInitial }}
          </span>
        </div>
      </div>
      <svg class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{'rotate-180': showMenu}" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Dropdown -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div 
        v-if="showMenu"
        class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-100 py-2 z-50"
      >
        <div class="px-4 py-3 border-b border-slate-100">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span class="text-sm font-semibold text-white">
                {{ userInitial }}
              </span>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ user?.name || 'User' }}</p>
              <p class="text-xs text-slate-500">{{ user?.email || 'email@example.com' }}</p>
              <p class="text-xs text-emerald-600 font-medium">{{ userRole }}</p>
            </div>
          </div>
        </div>
        
        <div class="py-1">
          <NuxtLink 
            to="/akun" 
            @click="$emit('close-menu')"
            class="flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <svg class="w-4 h-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Akun
          </NuxtLink>
          
          <div class="border-t border-slate-100 my-1"></div>
          
          <button 
            @click="$emit('logout')"
            class="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <svg class="w-4 h-4 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Keluar
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  userRole: {
    type: String,
    default: 'Administrator'
  }
})

const emit = defineEmits(['logout', 'close-menu'])

const showMenu = ref(false)
const profileDropdown = ref(null)

const userInitial = computed(() => {
  return props.user?.name?.charAt(0).toUpperCase() || 'U'
})

const toggleProfileMenu = () => {
  showMenu.value = !showMenu.value
}

const handleClickOutside = (event) => {
  if (profileDropdown.value && !profileDropdown.value.contains(event.target)) {
    showMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
