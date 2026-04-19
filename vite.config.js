import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['hayey-spoutlike-angelena.ngrok-free.dev'],
    proxy: {
      '/ws': {
        target: 'http://localhost:8082',
        ws: true,
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
    },
  },
})
