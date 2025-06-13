<template>
  <div v-if="isOpen" class="fixed inset-0 overflow-y-auto h-full w-full z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div class="relative mx-auto p-6 border border-slate-100 w-96 shadow-xl rounded-lg bg-white">
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-800">Ubah Kata Sandi</h3>
          <button @click="onCancel" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Password Error -->
        <div v-if="error" class="mb-4 bg-red-50 border-l-4 border-red-400 rounded-r p-3">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-600">{{ error }}</p>
            </div>
          </div>
        </div>

        <form @submit.prevent="onSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Kata Sandi Baru</label>
            <input 
              v-model="formData.newPassword"
              type="password" 
              required
              minlength="6"
              class="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Kata Sandi</label>
            <input 
              v-model="formData.confirmPassword"
              type="password" 
              required
              minlength="6"
              class="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            />
          </div>

          <div class="flex justify-end space-x-3 pt-6">
            <button 
              type="button"
              @click="onCancel"
              class="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <span v-if="loading" class="mr-2">
                <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? 'Memperbarui...' : 'Ubah Kata Sandi' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = reactive({
  newPassword: '',
  confirmPassword: ''
})

const onSubmit = () => {
  emit('submit', { 
    newPassword: formData.newPassword, 
    confirmPassword: formData.confirmPassword 
  })
}

const onCancel = () => {
  formData.newPassword = ''
  formData.confirmPassword = ''
  emit('close')
}
</script>
