// src/api/axiosInstance.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://matted-ascent-specimen.ngrok-free.dev";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    // Required to bypass ngrok's browser interstitial warning page
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 30000,
});

// ✅ Request interceptor - Log and add token
axiosInstance.interceptors.request.use(
  (config) => {
    // If sending FormData, delete Content-Type so Axios/browser sets boundary automatically
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Skip auth header for public endpoints (forgot password, verify email, etc.)
    const publicEndpoints = [
      '/api/v1/auth/register',
      '/api/v1/auth/verify-email',
      '/api/v1/auth/login',
      '/api/v1/auth/login/otp/request',
      '/api/v1/auth/login/otp/verify',
      '/api/v1/auth/password/forgot',
      '/api/v1/auth/password/verify-otp',
      '/api/v1/auth/password/reset',
      '/api/v1/auth/refresh'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('lms_token') || 
                    localStorage.getItem('access_token') || 
                    sessionStorage.getItem('lms_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ✅ Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);
    
    if (error.response) {
      const { status, config } = error.response;
      
      const isPublicAuthCall = config?.url?.includes('/api/v1/auth/');

      if (status === 401 && !isPublicAuthCall && !config?.url?.includes('/login')) {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('lms_user');
        sessionStorage.removeItem('lms_token');
        
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin')) {
          if (!currentPath.includes('/admin/login')) {
            window.location.href = '/admin/login';
          }
        } else {
          if (currentPath !== '/login' && currentPath !== '/') {
            window.location.href = '/login';
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;