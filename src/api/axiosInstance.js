// src/api/axiosInstance.js
import axios from "axios";
import API_BASE_URL from "../config/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
      '/api/v1/auth/register',
      '/api/v1/auth/register/email',
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
        
        if (!window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;