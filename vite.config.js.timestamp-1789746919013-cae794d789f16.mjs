// vite.config.js
import { defineConfig } from "file:///C:/Users/kasoju%20sindhu/OneDrive/Documents/Desktop/clx-lms/UI/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/kasoju%20sindhu/OneDrive/Documents/Desktop/clx-lms/UI/node_modules/@vitejs/plugin-react/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  server: {
    port: 3e3,
    open: true,
    // Automatically opens the CORRECT port in your browser
    proxy: {
      "/ngrok-api": {
        target: "https://matted-ascent-specimen.ngrok-free.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ngrok-api/, ""),
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxrYXNvanUgc2luZGh1XFxcXE9uZURyaXZlXFxcXERvY3VtZW50c1xcXFxEZXNrdG9wXFxcXGNseC1sbXNcXFxcVUlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGthc29qdSBzaW5kaHVcXFxcT25lRHJpdmVcXFxcRG9jdW1lbnRzXFxcXERlc2t0b3BcXFxcY2x4LWxtc1xcXFxVSVxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMva2Fzb2p1JTIwc2luZGh1L09uZURyaXZlL0RvY3VtZW50cy9EZXNrdG9wL2NseC1sbXMvVUkvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBvcGVuOiB0cnVlLCAvLyBBdXRvbWF0aWNhbGx5IG9wZW5zIHRoZSBDT1JSRUNUIHBvcnQgaW4geW91ciBicm93c2VyXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL25ncm9rLWFwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwczovL21hdHRlZC1hc2NlbnQtc3BlY2ltZW4ubmdyb2stZnJlZS5kZXYnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICByZXdyaXRlOiAocGF0aCkgPT4gcGF0aC5yZXBsYWNlKC9eXFwvbmdyb2stYXBpLywgJycpLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICduZ3Jvay1za2lwLWJyb3dzZXItd2FybmluZyc6ICd0cnVlJ1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQXdYLFNBQVMsb0JBQW9CO0FBQ3JaLE9BQU8sV0FBVztBQUVsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxjQUFjO0FBQUEsUUFDWixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUMsU0FBUyxLQUFLLFFBQVEsZ0JBQWdCLEVBQUU7QUFBQSxRQUNsRCxTQUFTO0FBQUEsVUFDUCw4QkFBOEI7QUFBQSxRQUNoQztBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
