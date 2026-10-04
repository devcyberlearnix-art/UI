import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️  UPDATE THIS URL every time you restart ngrok
const NGROK_URL = 'https://matted-ascent-specimen.ngrok-free.dev';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/ngrok-api': {
        target: NGROK_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ngrok-api/, ''),
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      }
    }
  }
})