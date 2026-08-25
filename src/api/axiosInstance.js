// src/api/axiosInstance.js
import axios from "axios";

// Use environment variable or default to localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://matted-ascent-specimen.ngrok-free.dev";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    // Removed ngrok headers to fix CORS
  },
  timeout: 30000,
  withCredentials: true, // Important for cookies
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
      '/auth/upload/profile-photo'
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url.includes(endpoint));

    if (!isPublicEndpoint) {
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

// Response interceptor (unchanged)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error);

    if (error.response) {
      const { status, config, data } = error.response;

      const isPublicAuthCall = config?.url?.includes('/auth/') ||
        config?.url?.includes('/verify-email') ||
        config?.url?.includes('/register');

      if (status === 401 && !isPublicAuthCall) {
        console.warn('[API] 401 Unauthorized - Clearing tokens');

        localStorage.removeItem('authToken');
        localStorage.removeItem('lms_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userData');
        localStorage.removeItem('lms_user');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('lms_token');

        if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/otp-verify')) {
          window.location.href = '/login';
        }
      }

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