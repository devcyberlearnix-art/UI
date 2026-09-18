// src/api/authApi.js
// Updated with new workflow endpoints
// Uses shared API base URL from src/config/api.js via axiosInstance
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
      const response = await axiosInstance.get('/api/v1/admin/me');
      return response.data;
    } catch (error) {
      console.error('[Auth] Get profile error:', error);
      throw error;
    }
  },

  updateSubAdminProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/api/v1/admin/me', profileData);
      return response.data;
    } catch (error) {
      console.error('[Auth] Update profile error:', error);
      throw error;
    }
  },

  registerSubAdmin: async (adminData) => {
    try {
      const response = await axiosInstance.post('/api/v1/admin/register', adminData);
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

  verifyEmail: async ({ email, otp, otpSessionId }) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/verify-email', {
        email,
        otp,
        otpSessionId,
      });
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

  resendOtp: async ({ flow, email, otpSessionId }) => {
    try {
      if (flow === 'password_reset') {
        return await authApi.requestForgotPasswordOtp(email);
      }

      if (flow === 'login') {
        return await authApi.requestLoginOtp(email);
      }

      const response = await axiosInstance.post('/api/v1/auth/register/resend-otp', {
        otpSessionId,
      });
      return response.data;
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

  switchRole: async (role) => {
    try {
      const targetRole = String(role || '').trim();
      const normalized = targetRole.toLowerCase();
      const payload = {
        role: normalized,
        newRole: normalized,
        targetRole: normalized,
      };

      const response = await axiosInstance.post('/api/v1/auth/switch-role', payload);
      return response.data;
    } catch (error) {
      console.error('[Auth] Switch role error:', error);
      throw error;
    }
  },

  register: async (payload) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/register', payload);
      return response.data;
    } catch (error) {
      console.error('[Auth] Register error:', error);
      throw error;
    }
  },

  changeRegistrationEmail: async ({ email, otpSessionId }) => {
    try {
      const response = await axiosInstance.patch('/api/v1/auth/register/email', {
        email,
        otpSessionId,
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Change registration email error:', error);
      throw error;
    }
  },

  uploadProfilePhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      const response = await axiosInstance.post('/api/v1/auth/upload/profile-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Upload profile photo error:', error);
      throw error;
    }
  },

  verifyResetOtpAndPassword: async ({ email, otp, newPassword }) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/password/verify-otp', {
        email,
        otp,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify reset OTP and password error:', error);
      throw error;
    }
  },
};

export default authApi;