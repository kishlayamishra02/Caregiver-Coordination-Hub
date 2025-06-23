import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Change default port from 5173 to 3000
    host: true, // Allow access from other devices on your network
    hmr: {
      host: 'localhost',
      port: 3000,
      overlay: true // Show error overlay in browser
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
})
