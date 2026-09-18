import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true, // Automatically opens the CORRECT port in your browser
    proxy: {
      '/ngrok-api': {
        target: 'https://matted-ascent-specimen.ngrok-free.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ngrok-api/, ''),
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    }
  }
})