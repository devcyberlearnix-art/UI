import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_BASE_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          // Rewrite cookie domain so browser accepts backend cookies on localhost:3000
          cookieDomainRewrite: 'localhost',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              // Required to bypass the ngrok browser-warning interstitial page
              proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
            });
            proxy.on('proxyRes', (proxyRes) => {
              // Allow credentials to pass through the proxy
              proxyRes.headers['access-control-allow-credentials'] = 'true';
            });
          },
        },
      },
    },
  }
})