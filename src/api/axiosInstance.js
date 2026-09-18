// src/api/axiosInstance.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    // Required to bypass the ngrok browser-warning interstitial page
    "ngrok-skip-browser-warning": "true",
  },
  // ✅ Send cookies (accessToken, refreshToken, JSESSIONID) with every request
  // This mirrors --cookie in curl and is required by the backend
  withCredentials: true,
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
      // Read token — stored under lms_token or access_token by AuthContext after login
      const token =
        localStorage.getItem('lms_token') ||
        localStorage.getItem('access_token') ||
        sessionStorage.getItem('lms_token') ||
        sessionStorage.getItem('access_token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[API] Auth token attached (${token.substring(0, 20)}...)`);
      } else {
        console.warn('[API] No auth token found in storage for:', config.url);
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
    console.error('[API Response Error]', error?.config?.url, error?.response?.status, error?.message);
    
    // Pass errors through to components so they can handle 401/404 gracefully
    // without unexpectedly wiping user session or redirecting to login
    return Promise.reject(error);
  }
);

export default axiosInstance;