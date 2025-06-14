<template>
  <header class="sticky top-0 z-50 bg-white shadow-sm">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <!-- Logo -->
        <Logo />

        <!-- Center Navigation -->
        <NavLinks :is-logged-in="isLoggedIn" :user-role="userRole" />

        <!-- User Menu (Logged In) -->
        <div v-if="isLoggedIn" class="flex items-center">
          <UserMenu 
            :user="user" 
            :user-role="userRole" 
            @logout="handleLogout" 
            @close-menu="closeMenus" 
          />
          
          <MobileMenuButton 
            :is-open="showMobileMenu" 
            @toggle="toggleMobileMenu" 
          />
        </div>

        <!-- Auth Buttons (Not Logged In) -->
        <div v-else class="flex items-center space-x-2">
          <AuthButtons />
          
          <MobileMenuButton 
            :is-open="showMobileMenu" 
            @toggle="toggleMobileMenu" 
          />
        </div>
      </div>

      <!-- Mobile Menu -->
      <MobileMenu 
        :is-open="showMobileMenu"
        :is-logged-in="isLoggedIn"
        :user="user"
        :user-role="userRole"
        @close="closeMobileMenu"
        @logout="handleLogout"
      />
    </div>
  </header>
</template>

<script setup>
import { ref, onServerPrefetch } from 'vue'
import { useNavbar } from '~/composables/useNavbar'
import Logo from './Logo.vue'
import NavLinks from './NavLinks.vue'
import UserMenu from './UserMenu.vue'
import AuthButtons from './AuthButtons.vue'
import MobileMenuButton from './MobileMenuButton.vue'
import MobileMenu from './MobileMenu.vue'

// Use our SSR-friendly navbar composable
const { user, isLoggedIn, userRole, logout, fetchUserData } = useNavbar()

// Menu state
const showMobileMenu = ref(false)

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const closeMenus = () => {
  showMobileMenu.value = false
}

const handleLogout = async () => {
  closeMenus()
  await logout()
}

// Prefetch user data on the server to prevent auth flash
onServerPrefetch(async () => {
  await fetchUserData()
})

// Also fetch on client-side in case server fetch fails
if (import.meta.client) {
  fetchUserData()
}
</script>
