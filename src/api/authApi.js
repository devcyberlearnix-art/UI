// src/api/authApi.js
import axiosInstance from "./axiosInstance";

export const authApi = {
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

  changeRegistrationEmail: async ({ email, otpSessionId }) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/change-registration-email', {
        email,
        otpSessionId,
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Change registration email error:', error);
      throw error;
    }
  },

  // ✅ UPDATED: Correct endpoint for profile photo upload
  uploadProfilePhoto: async (formData) => {
    try {
      const token = localStorage.getItem('lms_token') || 
                    localStorage.getItem('access_token') || 
                    sessionStorage.getItem('lms_token');
      
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await axiosInstance.put('/api/v1/users/me/photo', formData, {
        headers: headers,
      });
      
      console.log('[Auth] Upload response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Upload profile photo error:', error);
      throw error;
    }
  },

  // ✅ NEW: Get current user profile
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/users/me');
      console.log('[Auth] Get profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Get profile error:', error);
      throw error;
    }
  },

  // ✅ NEW: Update user profile (full update)
  updateUserProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/api/v1/users/me', profileData);
      console.log('[Auth] Update profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
      throw error;
    }
  },

  // ✅ NEW: Partial update user profile
  patchUserProfile: async (profileData) => {
    try {
      const response = await axiosInstance.patch('/api/v1/users/me', profileData);
      console.log('[Auth] Patch profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Patch profile error:', error);
      throw error;
    }
  },

  // ✅ FIXED: Login with proper email validation
  login: async (email, password) => {
    try {
      // ✅ Ensure email is a string and trim it
      const emailStr = typeof email === 'string' ? email.trim() : String(email || '').trim();
      
      if (!emailStr) {
        throw new Error('Email is required');
      }
      
      if (!password) {
        throw new Error('Password is required');
      }
      
      console.log('[Auth] Login attempt for:', emailStr);
      
      const requestData = {
        email: emailStr,
        password: password
      };
      
      const response = await axiosInstance.post('/api/v1/auth/login', requestData);
      console.log('[Auth] Response data:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Login error:', error);
      throw error;
    }
  },

  // ✅ FIXED: Request login OTP with proper email validation
  requestLoginOtp: async (email) => {
    try {
      const emailStr = typeof email === 'string' ? email.trim() : String(email || '').trim();
      
      if (!emailStr) {
        throw new Error('Email is required');
      }
      
      const response = await axiosInstance.post('/api/v1/auth/login/otp/request', { email: emailStr });
      return response.data;
    } catch (error) {
      console.error('[Auth] Request login OTP error:', error);
      throw error;
    }
  },

  // ✅ FIXED: Verify login OTP
  verifyLoginOtp: async ({ email, otpSessionId, otp }) => {
    try {
      const emailStr = typeof email === 'string' ? email.trim() : String(email || '').trim();
      
      const response = await axiosInstance.post('/api/v1/auth/login/otp/verify', {
        email: emailStr,
        otpSessionId,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify login OTP error:', error);
      throw error;
    }
  },

  // ✅ FIXED: Forgot password with proper email validation
  forgotPassword: async (email) => {
    try {
      const emailStr = typeof email === 'string' ? email.trim() : String(email || '').trim();
      
      if (!emailStr) {
        throw new Error('Email is required');
      }
      
      const response = await axiosInstance.post('/api/v1/auth/password/forgot', { email: emailStr });
      return response.data;
    } catch (error) {
      console.error('[Auth] Forgot password error:', error);
      throw error;
    }
  },

  verifyPasswordOtp: async ({ email, otpSessionId, otp }) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/password/verify-otp', {
        email,
        otpSessionId,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify password OTP error:', error);
      throw error;
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/password/reset', data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Reset password error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token") || null;
      const response = await axiosInstance.post('/api/v1/auth/logout', refreshToken ? { refreshToken } : {});
      return response.data;
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      return { success: false };
    }
  },

  verifyEmail: async ({ email, otp, otpSessionId }) => {
    try {
      console.log('[Auth] Verify email request:', { email, otp, otpSessionId });
      
      const response = await axiosInstance.post('/api/v1/auth/verify-email', { 
        email, 
        otp, 
        otpSessionId 
      });
      
      console.log('[Auth] Verify email response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify email error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      throw error;
    }
  },

  resendOtp: async ({ flow, email, otpSessionId }) => {
    try {
      console.log('[Auth] Resend OTP:', { flow, email, otpSessionId });
      
      if (flow === 'password_reset') {
        return await authApi.forgotPassword(email);
      }

      if (flow === 'login') {
        return await authApi.requestLoginOtp(email);
      }

      const response = await axiosInstance.post('/api/v1/auth/resend-otp', { 
        email, 
        otpSessionId,
        flow: 'registration' 
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Resend OTP error:', error);
      throw error;
    }
  },

  // Sub-admin management
  getSubAdminProfile: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/admins/me');
      return response.data;
    } catch (error) {
      console.error('[Auth] Get profile error:', error);
      throw error;
    }
  },

  updateSubAdminProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/api/v1/admins/me', profileData);
      return response.data;
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
      throw error;
    }
  },

  registerSubAdmin: async (adminData) => {
    try {
      const response = await axiosInstance.post('/api/v1/admins/register', adminData);
      return response.data;
    } catch (error) {
      console.error('[Auth] Register error:', error);
      throw error;
    }
  },

  changePassword: async (payload) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/change-password', payload);
      return response.data;
    } catch (error) {
      console.error('[Auth] Change password error:', error);
      throw error;
    }
  },
};

export default authApi;