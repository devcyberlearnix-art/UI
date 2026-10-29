// src/api/authApi.js
// Updated with new workflow endpoints
// Uses shared API base URL from src/config/api.js via axiosInstance
import axiosInstance from "./axiosInstance";

// ✅ Export authApi as a named export
export const authApi = {
  login: async (email, password) => {
    try {
      const emailStr = typeof email === 'string' ? email : String(email || '');
      const passwordStr = typeof password === 'string' ? password : String(password || '');
      
      const requestData = {
        email: emailStr.trim(),
        password: passwordStr
      };
      
      const response = await axiosInstance.post('/api/v1/auth/login', requestData);
      return response.data;
    } catch (error) {
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

  refreshAccessToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }
      // Backend expects refresh token in Authorization header, not request body
      // According to AUTHENTICATION_AND_AUTHORIZATION.md: "Headers: Authorization: Bearer <refresh_token>"
      const response = await axiosInstance.post('/api/v1/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${refreshToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Refresh token error:', error);
      throw error;
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

  verifyOtp: async ({ email, otp, otpSessionId, flow }) => {
    if (flow === 'login') {
      return await authApi.verifyLoginOtp({ email, otpSessionId, otp });
    }
    return await authApi.verifyEmail({ email, otp, otpSessionId });
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
      formData.append('file', file);
      // Don't set Content-Type header; let Axios/browser set it with correct boundary
      const response = await axiosInstance.put('/api/v1/users/me/photo', formData);
      return response.data;
    } catch (error) {
      console.error('[Auth] Upload profile photo error:', error);
      throw error;
    }
  },

  removeProfilePhoto: async () => {
    try {
      const response = await axiosInstance.delete('/api/v1/users/me/photo');
      return response.data;
    } catch (error) {
      console.error('[Auth] Remove profile photo error:', error);
      throw error;
    }
  },

  uploadCoverPhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axiosInstance.put('/api/v1/users/me/cover-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Upload cover photo error:', error);
      throw error;
    }
  },

  removeCoverPhoto: async () => {
    try {
      const response = await axiosInstance.delete('/api/v1/users/me/cover-photo');
      return response.data;
    } catch (error) {
      console.error('[Auth] Remove cover photo error:', error);
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

  // Get user profile (for students/general users)
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/users/me');
      return response.data;
    } catch (error) {
      console.error('[Auth] Get user profile error:', error);
      throw error;
    }
  },

  // Update user profile (for students/general users)
  updateUserProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put('/api/v1/users/me', profileData);
      return response.data;
    } catch (error) {
      console.error('[Auth] Update user profile error:', error);
      throw error;
    }
  },

  // ======================== SESSION MANAGEMENT ========================
  // List all active sessions for current user
  listSessions: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/users/me/sessions');
      return response.data;
    } catch (error) {
      console.error('[Auth] List sessions error:', error);
      throw error;
    }
  },

  // Logout from specific device/session
  logoutDevice: async (sessionId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/users/me/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('[Auth] Logout device error:', error);
      throw error;
    }
  },

  // Logout from all devices/sessions
  logoutAllSessions: async () => {
    try {
      const response = await axiosInstance.delete('/api/v1/users/me/sessions');
      return response.data;
    } catch (error) {
      console.error('[Auth] Logout all sessions error:', error);
      throw error;
    }
  },
  getSessions: async () => authApi.listSessions(),
  revokeSession: async (sessionId) => authApi.logoutDevice(sessionId),
  logoutSession: async (sessionId) => authApi.logoutDevice(sessionId),
  revokeAllSessions: async () => authApi.logoutAllSessions(),

  // ======================== EMAIL CHANGE ========================
  // Email change is a 3-step flow:
  // 1. Initiate email change (re-auth + send OTPs to old and new email)
  // 2. Verify old email OTP
  // 3. Verify new email OTP (completes change, invalidates sessions)
  
  // Step 1: Initiate email change
  requestEmailChange: async (newEmail, password = null, reAuthOtpSessionId = null) => {
    try {
      const payload = { newEmail };
      if (password) {
        payload.password = password;
      }
      if (reAuthOtpSessionId) {
        payload.reAuthOtpSessionId = reAuthOtpSessionId;
      }
      const response = await axiosInstance.post('/api/v1/users/email/change-request', payload);
      return response.data;
    } catch (error) {
      console.error('[Auth] Request email change error:', error);
      throw error;
    }
  },

  // Step 2: Verify old email OTP
  verifyOldEmail: async (sessionId, otp) => {
    try {
      const response = await axiosInstance.post('/api/v1/users/email/verify-old', {
        sessionId,
        otp
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify old email error:', error);
      throw error;
    }
  },

  // Step 3: Verify new email OTP (completes change)
  verifyNewEmail: async (sessionId, otp) => {
    try {
      const response = await axiosInstance.post('/api/v1/users/email/verify-new', {
        sessionId,
        otp
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Verify new email error:', error);
      throw error;
    }
  },

  // Resend OTP for email change
  resendEmailChangeOtp: async (sessionId, target = 'ALL') => {
    try {
      const response = await axiosInstance.post('/api/v1/users/email/resend-otp', {
        sessionId,
        target // 'OLD', 'NEW', or 'ALL'
      });
      return response.data;
    } catch (error) {
      console.error('[Auth] Resend email change OTP error:', error);
      throw error;
    }
  },

  // Get email change session status
  getEmailChangeSession: async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/users/email/change-request/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('[Auth] Get email change session error:', error);
      throw error;
    }
  },

  // ======================== OAUTH & SOCIAL AUTHENTICATION ========================
  getOAuthProviders: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/auth/oauth/providers');
      return response.data;
    } catch (error) {
      console.error('[Auth] Get OAuth providers error:', error);
      throw error;
    }
  },

  socialLogin: async (payload) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/social-login', payload);
      return response.data;
    } catch (error) {
      console.error('[Auth] Social login error:', error);
      throw error;
    }
  },

  socialLoginWithProvider: async (provider, payload) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/social-login/' + provider, payload);
      return response.data;
    } catch (error) {
      console.error('[Auth] Social login for ' + provider + ' error:', error);
      throw error;
    }
  },

  oauthContinue: async (payload) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/oauth/continue', payload);
      return response.data;
    } catch (error) {
      console.error('[Auth] OAuth continue error:', error);
      throw error;
    }
  },

  resendPasswordOtp: async ({ email, otpSessionId }) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/password/otp/resend', { email, otpSessionId });
      return response.data;
    } catch (error) {
      console.error('[Auth] Resend password OTP error:', error);
      throw error;
    }
  },

  // ======================== USER MANAGEMENT & ADMINISTRATION ========================
  getUserStats: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/users/stats');
      return response.data;
    } catch (error) {
      console.error('[Auth] Get user stats error:', error);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      const response = await axiosInstance.delete('/api/v1/users/me');
      return response.data;
    } catch (error) {
      console.error('[Auth] Delete account error:', error);
      throw error;
    }
  },

  getPhotoUrl: (fileId) => {
    if (!fileId) return null;
    return `/api/v1/users/photo/${fileId}`;
  },

  getAllUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/v1/users', { params });
      return response.data;
    } catch (error) {
      console.error('[Auth] Get all users error:', error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[Auth] Get user ${id} error:`, error);
      throw error;
    }
  },

  updateUserStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/api/v1/users/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`[Auth] Update user ${id} status error:`, error);
      throw error;
    }
  },

  deleteUserById: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[Auth] Delete user ${id} error:`, error);
      throw error;
    }
  },
};

export default authApi;
