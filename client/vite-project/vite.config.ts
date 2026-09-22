import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5005',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      // canvg (pulled in by jspdf) imports core-js internal module paths
      // that Rollup cannot resolve. These are browser polyfills that modern
      // browsers provide natively, so externalizing them is safe.
      external: (id: string) => id.startsWith('core-js/'),
    },
  },
})
