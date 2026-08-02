// src/api/axiosInstance.js
import axios from "axios";

const BASE_URL = "https://matted-ascent-specimen.ngrok-free.dev";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 30000,
});

// ✅ Request interceptor - Log and add token
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip auth header for public endpoints (forgot password, verify email, etc.)
    const publicEndpoints = [
      '/admin/password/forgot',
      '/admin/password/verify-otp',
      '/admin/password/reset',
      '/admin/verify-email',
      '/admin/internal/login',
      '/admin/internal/login/otp/request',
      '/admin/internal/login/otp/verify',
      '/admin/resend-otp',
      '/admin/register'
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
      
      if (status === 401 && !config?.url?.includes('/login')) {
        localStorage.removeItem('lms_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('lms_user');
        sessionStorage.removeItem('lms_token');
        
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;