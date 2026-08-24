// src/api/authApi.js
import axiosInstance from "./axiosInstance";

export const authApi = {
  // Register user
  register: async (payload) => {
    try {
      console.log('[Auth] Register request payload:', payload);
      const response = await axiosInstance.post('/api/v1/auth/register', payload);
      console.log('[Auth] Register response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Register error:', error);
      throw error;
    }
  },

  // Verify Email with OTP
  verifyEmail: async ({ email, otp, otpSessionId }) => {
    try {
      console.log('[Auth] Verify email request:', { email, otp, otpSessionId });
      
      const response = await axiosInstance.post('/api/v1/auth/verify-email', { 
        email: email?.trim(), 
        otp: String(otp).trim(),
        otpSessionId: otpSessionId?.trim()
      });
      
      console.log('[Auth] Verify email response:', response.data);
      
      // Only store token if it exists in the response
      if (response.data?.success && response.data?.data?.token) {
        const token = response.data.data.token;
        localStorage.setItem('authToken', token);
        localStorage.setItem('lms_token', token);
        console.log('[Auth] Token stored after verification');
      } else {
        console.log('[Auth] No token in verification response - user needs to login');
        // ✅ IMPORTANT: Clear any existing tokens to prevent auto-login issues
        authApi.clearAllTokens();
      }
      
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify email error:', error);
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const emailStr = typeof email === 'string' ? email.trim() : String(email || '').trim();
      
      if (!emailStr) {
        throw new Error('Email is required');
      }
      
      if (!password) {
        throw new Error('Password is required');
      }
      
      console.log('[Auth] Login attempt for:', emailStr);
      
      const response = await axiosInstance.post('/api/v1/auth/login', {
        email: emailStr,
        password: password
      });
      
      console.log('[Auth] Login response:', response.data);
      
      // Extract and store tokens from the response structure
      if (response.data?.success && response.data?.authentication?.accessToken) {
        const accessToken = response.data.authentication.accessToken;
        const refreshToken = response.data.authentication.refreshToken;
        const userData = response.data.user;
        
        // Clear any old tokens first
        authApi.clearAllTokens();
        
        // Store tokens with consistent keys
        localStorage.setItem('authToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('lms_token', accessToken);
        localStorage.setItem('lms_user', JSON.stringify(userData));
        
        // Also store in session for cross-tab support
        sessionStorage.setItem('authToken', accessToken);
        sessionStorage.setItem('lms_token', accessToken);
        
        // Set the token in axios headers
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        console.log('[Auth] Tokens stored successfully');
        console.log('[Auth] User:', userData.email, 'Role:', userData.role);
      } else {
        console.warn('[Auth] No access token in login response:', response.data);
        throw new Error(response.data?.message || 'Login failed. Please try again.');
      }
      
      return response.data;
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  },

  // Request OTP for Login
  requestLoginOtp: async (email) => {
    try {
      console.log('[Auth] Request Login OTP for:', email);
      const response = await axiosInstance.post('/api/v1/auth/login/otp/request', { 
        email: email?.trim() 
      });
      console.log('[Auth] Request Login OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Request Login OTP error:', error);
      throw error;
    }
  },

  // Verify OTP for Login
  verifyLoginOtp: async ({ email, otpSessionId, otp }) => {
    try {
      console.log('[Auth] Verify Login OTP:', { email, otpSessionId, otp });
      const response = await axiosInstance.post('/api/v1/auth/login/otp/verify', {
        email: email?.trim(),
        otpSessionId: otpSessionId?.trim(),
        otp: String(otp).trim()
      });
      console.log('[Auth] Verify Login OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify Login OTP error:', error);
      throw error;
    }
  },

  // Request Forgot Password OTP
  requestForgotPasswordOtp: async (email) => {
    try {
      console.log('[Auth] Request Forgot Password OTP for:', email);
      const response = await axiosInstance.post('/api/v1/auth/password/forgot', { 
        email: email?.trim() 
      });
      console.log('[Auth] Request Forgot Password OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Request Forgot Password OTP error:', error);
      throw error;
    }
  },

  // Verify Password Reset OTP
  verifyPasswordOtp: async ({ email, otpSessionId, otp }) => {
    try {
      console.log('[Auth] Verify Password OTP:', { email, otpSessionId, otp });
      const response = await axiosInstance.post('/api/v1/auth/password/verify-otp', {
        email: email?.trim(),
        otpSessionId: otpSessionId?.trim(),
        otp: String(otp).trim()
      });
      console.log('[Auth] Verify Password OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify Password OTP error:', error);
      throw error;
    }
  },

  // Reset Password
  resetPassword: async ({ email, otpSessionId, newPassword, confirmPassword }) => {
    try {
      console.log('[Auth] Reset Password for:', email);
      const response = await axiosInstance.post('/api/v1/auth/password/reset', {
        email: email?.trim(),
        otpSessionId: otpSessionId?.trim(),
        newPassword,
        confirmPassword
      });
      console.log('[Auth] Reset Password response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Reset Password error:', error);
      throw error;
    }
  },

  // Upload profile photo
  uploadProfilePhoto: async (fileOrFormData) => {
    try {
      const token = authApi.getToken();
      
      if (!token) {
        throw new Error('User not authenticated. Please login first.');
      }
      
      let formData = fileOrFormData;
      if (fileOrFormData instanceof File || fileOrFormData instanceof Blob) {
        formData = new FormData();
        formData.append('file', fileOrFormData);
        formData.append('profilePhoto', fileOrFormData);
        formData.append('photo', fileOrFormData);
        formData.append('image', fileOrFormData);
      }
      
      console.log('[Auth] Uploading profile photo to /api/v1/users/me/photo');
      let response;
      try {
        response = await axiosInstance.post('/api/v1/users/me/photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (postError) {
        if (postError.response?.status === 404 || postError.response?.status === 405) {
          console.log('[Auth] Fallback: PUT /api/v1/users/me/photo');
          response = await axiosInstance.put('/api/v1/users/me/photo', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else {
          throw postError;
        }
      }
      
      console.log('[Auth] Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Upload profile photo error:', error);
      throw error;
    }
  },

  // Resend OTP
  resendOtp: async ({ email, otpSessionId, flow = 'registration' }) => {
    try {
      console.log('[Auth] Resend OTP:', { email, otpSessionId, flow });
      
      const response = await axiosInstance.post('/api/v1/auth/resend-otp', { 
        email: email?.trim(), 
        otpSessionId: otpSessionId?.trim(),
        flow: flow 
      });
      
      console.log('[Auth] Resend OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Resend OTP error:', error);
      throw error;
    }
  },

  // Get current user profile
  getUserProfile: async () => {
    try {
      const token = authApi.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      const response = await axiosInstance.get('/api/v1/users/me');
      console.log('[Auth] Get profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      const token = authApi.getToken();
      if (!token) {
        throw new Error('User not authenticated');
      }
      
      const response = await axiosInstance.put('/api/v1/users/me', profileData);
      console.log('[Auth] Update profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
      throw error;
    }
  },

  // ✅ Clear all tokens
  clearAllTokens: () => {
    // Remove from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('lms_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userData');
    localStorage.removeItem('lms_user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('registrationEmail');
    
    // Remove from sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('lms_token');
    sessionStorage.removeItem('otpSessionId');
    sessionStorage.removeItem('pendingProfilePhoto');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('uploadPendingPhoto');
    sessionStorage.removeItem('verificationSuccess');
    
    // Remove from axios headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    
    console.log('[Auth] All tokens cleared');
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await axiosInstance.post('/api/v1/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      authApi.clearAllTokens();
      console.log('[Auth] Logout successful');
    }
  },

  // ✅ Helper: Check if authenticated with token validation
  isAuthenticated: () => {
    const token = authApi.getToken();
    
    if (!token) {
      return false;
    }
    
    // Validate token format (JWT has 3 parts)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('[Auth] Invalid token format');
      authApi.clearAllTokens();
      return false;
    }
    
    // Check token expiration
    try {
      const payload = JSON.parse(atob(parts[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      
      if (Date.now() >= exp) {
        console.warn('[Auth] Token expired');
        authApi.clearAllTokens();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[Auth] Error validating token:', error);
      authApi.clearAllTokens();
      return false;
    }
  },

  // ✅ Get token helper
  getToken: () => {
    return localStorage.getItem('authToken') || 
           localStorage.getItem('lms_token') || 
           localStorage.getItem('access_token') ||
           sessionStorage.getItem('authToken') ||
           sessionStorage.getItem('lms_token') ||
           null;
  },

  // Helper: Get current user
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData') || localStorage.getItem('lms_user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('[Auth] Error parsing user data:', error);
      return null;
    }
  },

  // ✅ Get user from API (use this after login)
  fetchCurrentUser: async () => {
    try {
      const response = await authApi.getUserProfile();
      if (response.success && response.data) {
        const userData = response.data;
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('lms_user', JSON.stringify(userData));
        return userData;
      }
      return null;
    } catch (error) {
      console.error('[Auth] Error fetching user:', error);
      return null;
    }
  }
};

export default authApi;