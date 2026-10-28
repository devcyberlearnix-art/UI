// src/api/axiosInstance.js
import axios from "axios";
import { authApi } from "./authApi";

// The browser talks to the API Gateway only; never call internal services directly.
// In development, use empty string to leverage Vite proxy
// In production, use the environment variable or fallback to ngrok
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Token refresh state management
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  timeout: 30000,
  withCredentials: true, // Important for cookies
});

// Request interceptor - Log and add token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
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
      '/courses',
      '/categories'
    ];

    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (!isPublicEndpoint) {
      const getCookie = (name) => {
        try {
          const match = typeof document !== 'undefined' && document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
          return match ? decodeURIComponent(match[2]) : null;
        } catch {
          return null;
        }
      };

      const token = localStorage.getItem('authToken') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('lms_token') ||
        localStorage.getItem('access_token') ||
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('accessToken') ||
        sessionStorage.getItem('token') ||
        sessionStorage.getItem('lms_token') ||
        getCookie('accessToken') ||
        getCookie('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
      }
    }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor with automatic token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[API] ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    console.error('[API Response Error]', error);

    // CORS-specific error handling
    if (!error.response && error.message === 'Network Error') {
      console.error('[Network Error] Network Error detected');
      console.error('[Network Error] API URL:', BASE_URL);
      console.error('[Network Error] Request URL:', error.config?.url);
      console.error('[Network Error] Troubleshooting: Check if backend is running and proxy is configured correctly');
    }

    if (error.response) {
      const { status, config, data } = error.response;

      const isPublicAuthCall = config?.url?.includes('/auth/') ||
        config?.url?.includes('/verify-email') ||
        config?.url?.includes('/register');

      const isRefreshEndpoint = config?.url?.includes('/auth/refresh');

      // Attempt token refresh on 401 for protected endpoints
      if (status === 401 && !isPublicAuthCall && !isRefreshEndpoint) {
        if (isRefreshing) {
          // Queue the request if refresh is already in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(config);
          }).catch((err) => {
            return Promise.reject(err);
          });
        }

        isRefreshing = true;

        try {
          // Attempt to refresh the token
          const refreshResponse = await authApi.refreshAccessToken();
          
          // Extract new access token from response
          const newAccessToken = refreshResponse?.authentication?.accessToken ||
                                refreshResponse?.accessToken ||
                                refreshResponse?.data?.authentication?.accessToken ||
                                refreshResponse?.data?.accessToken;

          if (newAccessToken) {
            // Update token storage
            localStorage.setItem('lms_token', newAccessToken);
            localStorage.setItem('access_token', newAccessToken);
            sessionStorage.setItem('lms_token', newAccessToken);

            // Update refresh token if rotated by backend
            const newRefreshToken = refreshResponse?.authentication?.refreshToken ||
                                     refreshResponse?.refreshToken ||
                                     refreshResponse?.data?.authentication?.refreshToken ||
                                     refreshResponse?.data?.refreshToken;
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }

            // Process queued requests with new token
            processQueue(null, newAccessToken);

            // Retry original request with new token
            config.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(config);
          } else {
            throw new Error('No access token in refresh response');
          }
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError);
          
          // Process queued requests with error
          processQueue(refreshError, null);

          // Clear all tokens and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('lms_token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('userData');
          localStorage.removeItem('lms_user');
          sessionStorage.removeItem('authToken');
          sessionStorage.removeItem('lms_token');

          // Only redirect if user is currently trying to browse a protected route
          const isProtectedRoute = () => {
            const p = window.location.pathname;
            return p.startsWith('/student') ||
                   p.startsWith('/instructor') ||
                   p.startsWith('/admin') ||
                   p === '/profile' ||
                   p.startsWith('/classroom') ||
                   p.startsWith('/checkout');
          };

          if (isProtectedRoute()) {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (status === 401 && !isPublicAuthCall) {
        // Direct logout for refresh endpoint failures or other 401s
        console.warn('[API] 401 Unauthorized - Clearing tokens');

        localStorage.removeItem('authToken');
        localStorage.removeItem('lms_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('userData');
        localStorage.removeItem('lms_user');
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('lms_token');

        const isProtectedRoute = () => {
          const p = window.location.pathname;
          return p.startsWith('/student') ||
                 p.startsWith('/instructor') ||
                 p.startsWith('/admin') ||
                 p === '/profile' ||
                 p.startsWith('/classroom') ||
                 p.startsWith('/checkout');
        };

        if (isProtectedRoute()) {
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
