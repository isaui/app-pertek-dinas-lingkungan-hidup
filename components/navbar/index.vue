<template>
  <header class="sticky top-0 z-50 bg-white shadow-sm">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <!-- Logo -->
        <Logo />

        <!-- Center Navigation -->
        <NavLinks :is-logged-in="isLoggedIn" />

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
import { ref, computed, onMounted } from 'vue'
import { useProfile } from '~/composables/useProfile'
import Logo from './Logo.vue'
import NavLinks from './NavLinks.vue'
import UserMenu from './UserMenu.vue'
import AuthButtons from './AuthButtons.vue'
import MobileMenuButton from './MobileMenuButton.vue'
import MobileMenu from './MobileMenu.vue'

const { user, logout, fetchUserData } = useProfile()

// Menu state
const showMobileMenu = ref(false)

// Check if user is logged in
const isLoggedIn = computed(() => !!user.value)

// Get user role
const userRole = computed(() => {
  // Get the user's role from the user object or default to 'visitor'
  return user.value?.role || 'Undefined'
})

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

onMounted(() => {
  // Fetch user data when component mounts
  fetchUserData()
})
</script>
