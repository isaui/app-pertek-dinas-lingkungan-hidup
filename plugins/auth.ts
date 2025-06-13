// plugins/auth.ts
import { auth } from '~/lib/auth'

export default defineNuxtPlugin(() => {
  // Initialize auth services
  return {
    provide: {
      auth
    }
  }
})
