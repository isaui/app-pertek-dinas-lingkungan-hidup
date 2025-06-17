// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
      },
    },
  },
  runtimeConfig: {
    betterAuthSecret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-me',
    betterAuthUrl: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    public: {
      authEnabled: true
    }
  },
  // No external auth module needed
  modules: [],
})
