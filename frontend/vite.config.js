import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',             // absolute base — required for Vercel + React Router deep links

  plugins: [react()],

  server: {
    port: 3000,
    host: true        // listen on 0.0.0.0 — accessible from other devices on the network
  },

  preview: {
    port: parseInt(process.env.PORT) || 3000,
    host: true,
    allowedHosts: 'all'
  }
})
