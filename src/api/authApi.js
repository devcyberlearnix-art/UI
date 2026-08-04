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
      const refreshToken = localStorage.getItem("refresh_token") || null;
      const response = await axiosInstance.post('/api/v1/auth/logout', refreshToken ? { refreshToken } : {});
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
      const response = await axiosInstance.post('/api/v1/auth/password/forgot', { email });
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

  verifyEmail: async ({ email, otp }) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/verify-email', { email, otp });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify email error:', error);
      throw error;
    }
  },

  requestLoginOtp: async (email) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/login/otp/request', { email });
      return response.data;
    } catch (error) {
      console.error('[Auth] Request login OTP error:', error);
      throw error;
    }
  },

  verifyLoginOtp: async ({ email, otpSessionId, otp }) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/login/otp/verify', {
        email,
        otpSessionId,
        otp,
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify login OTP error:', error);
      throw error;
    }
  },

  requestForgotPasswordOtp: async (email) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/password/forgot', { email });
      return response.data;
    } catch (error) {
      console.error('[Auth] Request forgot password OTP error:', error);
      throw error;
    }
  },

  resendOtp: async ({ flow, email }) => {
    try {
      if (flow === 'password_reset') {
        return await authApi.requestForgotPasswordOtp(email);
      }

      if (flow === 'login') {
        return await authApi.requestLoginOtp(email);
      }

      // Registration OTP resend endpoint is not part of the provided contract.
      // Fallback to verify-email flow by reusing login request semantics when needed.
      return await authApi.requestLoginOtp(email);
    } catch (error) {
      console.error('[Auth] Resend OTP error:', error);
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

// ✅ Default export for flexibility
export default authApi;