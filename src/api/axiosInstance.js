// src/api/axiosInstance.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://matted-ascent-specimen.ngrok-free.dev";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "ngrok-skip-browser-warning": "true",
    "bypass-tunnel-reminder": "true",
  },
  timeout: 30000,
});

// Request interceptor - Log and add token
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip auth header for public endpoints
    const publicEndpoints = [
      '/auth/register',
      '/auth/verify-email',
      '/auth/login',
      '/auth/login/otp/request',
      '/auth/login/otp/verify',
      '/auth/password/forgot',
      '/auth/password/verify-otp',
      '/auth/password/reset',
      '/auth/refresh',
      '/auth/upload/profile-photo' // Add this if it's public during registration
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (!isPublicEndpoint) {
      // Try multiple token storage keys
      const token = localStorage.getItem('authToken') || 
                    localStorage.getItem('lms_token') || 
                    localStorage.getItem('access_token') || 
                    sessionStorage.getItem('authToken') ||
                    sessionStorage.getItem('lms_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API] Added Authorization header for ${config.url}`);
      } else {
        console.log(`[API] No token found for ${config.url}`);
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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);
    
    if (error.response) {
      const { status, config, data } = error.response;
      
      // Don't redirect for public auth calls
      const isPublicAuthCall = config?.url?.includes('/auth/') || 
                              config?.url?.includes('/verify-email') ||
                              config?.url?.includes('/register');
      
      // Handle 401 Unauthorized
      if (status === 401 && !isPublicAuthCall) {
        console.warn('[API] 401 Unauthorized - Clearing tokens');
        
        // Clear all tokens
        localStorage.removeItem('authToken');
        localStorage.removeItem('lms_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userData');
        localStorage.removeItem('lms_user');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('lms_token');
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register') &&
            !window.location.pathname.includes('/otp-verify')) {
          window.location.href = '/login';
        }
      }
      
      // Log specific error details
      console.error('[API] Error details:', {
        status,
        message: data?.message || data?.error || 'Unknown error',
        path: config?.url
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;