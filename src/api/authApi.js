// src/api/authApi.js
// Updated with new workflow endpoints
// Base URL: https://matted-ascent-specimen.ngrok-free.dev
import axiosInstance from "./axiosInstance";

// ✅ Export authApi as a named export
export const authApi = {
  login: async (email, password) => {
    try {
      console.log('[Auth] Login attempt for:', email);
      console.log('[Auth] Password length:', password?.length || 0);
      
      const emailStr = typeof email === 'string' ? email : String(email || '');
      const passwordStr = typeof password === 'string' ? password : String(password || '');
      
      const requestData = {
        email: emailStr.trim(),
        password: passwordStr
      };
      
      console.log('[Auth] Request data:', JSON.stringify(requestData, null, 2));
      
      const response = await axiosInstance.post('/api/v1/auth/login', requestData);
      
      console.log('[Auth] Response status:', response.status);
      console.log('[Auth] Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('[Auth] Login error:', error);
      
      if (error.response) {
        console.error('[Auth] Error status:', error.response.status);
        console.error('[Auth] Error data:', error.response.data);
        console.error('[Auth] Error headers:', error.response.headers);
      } else if (error.request) {
        console.error('[Auth] No response received:', error.request);
      }
      
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post('/admin/logout');
      return response.data;
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      return { success: false };
    }
  },

  // ======================== SUB-ADMIN MANAGEMENT ========================
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

  forgotPassword: async (email) => {
    try {
      const response = await axiosInstance.post('/admin/password/forgot', { email });
      return response.data;
    } catch (error) {
      console.error('[Auth] Forgot password error:', error);
      throw error;
    }
  },

  verifyPasswordOtp: async (email, otp) => {
    try {
      const response = await axiosInstance.post('/admin/password/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify password OTP error:', error);
      throw error;
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await axiosInstance.post('/admin/password/reset', data);
      return response.data;
    } catch (error) {
      console.error('[Auth] Reset password error:', error);
      throw error;
    }
  },

  // ✅ OTP-based authentication endpoints - Updated with correct backend endpoints
  verifyEmail: async (email) => {
    try {
      const response = await axiosInstance.post('/admin/verify-email', { email });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify email error:', error);
      throw error;
    }
  },

  requestLoginOtp: async (email) => {
    try {
      const response = await axiosInstance.post('/admin/internal/login/otp/request', { email });
      return response.data;
    } catch (error) {
      console.error('[Auth] Request login OTP error:', error);
      throw error;
    }
  },

  verifyLoginOtp: async (email, otp) => {
    try {
      const response = await axiosInstance.post('/admin/internal/login/otp/verify', { email, otp });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify login OTP error:', error);
      throw error;
    }
  },

  resendOtp: async (email) => {
    try {
      const response = await axiosInstance.post('/admin/resend-otp', { email });
      return response.data;
    } catch (error) {
      console.error('[Auth] Resend OTP error:', error);
      throw error;
    }
  }
};

// ✅ Default export for flexibility
export default authApi;