<template>
  <div class="bg-white shadow rounded-md">
    <div class="px-6 py-4 border-b border-slate-200">
      <h2 class="text-lg font-medium text-slate-800">Edit Profil</h2>
    </div>
    
    <form @submit.prevent="onSubmit" class="p-6 space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Name Field -->
        <div>
          <label for="name" class="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
          <input 
            v-model="form.name"
            id="name" 
            type="text" 
            required
            class="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>

        <!-- Username Field -->
        <div>
          <label for="username" class="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input 
            v-model="form.username"
            id="username" 
            type="text" 
            required
            class="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>
      </div>

      <!-- Email Field (Read-only) -->
      <div>
        <label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input 
          v-model="userEmail"
          id="email" 
          type="email" 
          readonly
          class="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-50 text-slate-500 cursor-not-allowed"
        />
        <p class="mt-1 text-xs text-slate-500">Email tidak dapat diubah</p>
      </div>

      <!-- Role Field (Read-only) -->
      <div>
        <label for="role" class="block text-sm font-medium text-slate-700 mb-1">Role</label>
        <input 
          v-model="userRole"
          id="role" 
          type="text" 
          readonly
          class="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-50 text-slate-500 cursor-not-allowed"
        />
        <p class="mt-1 text-xs text-slate-500">Role tidak dapat diubah</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Instansi Field -->
        <div>
          <label for="instansi" class="block text-sm font-medium text-slate-700 mb-1">Instansi</label>
          <input 
            v-model="form.instansi"
            id="instansi" 
            type="text"
            class="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>

        <!-- Nomor HP Field -->
        <div>
          <label for="nomorHp" class="block text-sm font-medium text-slate-700 mb-1">Nomor HP</label>
          <input 
            v-model="form.nomorHp"
            id="nomorHp" 
            type="tel"
            class="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
          />
        </div>
      </div>

      <!-- Submit Button -->
      <div class="pt-4">
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full md:w-auto bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50"
        >
          {{ loading ? 'Memperbarui...' : 'Perbarui Profil' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit'])

const userEmail = computed(() => props.user?.email || '')
const userRole = computed(() => props.user?.role || 'undefined')

const form = reactive({
  name: '',
  username: '',
  instansi: '',
  nomorHp: '',
  // Note: role is handled separately as a read-only field
})

// Initialize form when user data changes
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.name = newUser.name || ''
    form.username = newUser.username || ''
    form.instansi = newUser.instansi || ''
    form.nomorHp = newUser.nomorHp || ''
  }
}, { immediate: true })

const onSubmit = () => {
  emit('submit', { ...form })
}
</script>
