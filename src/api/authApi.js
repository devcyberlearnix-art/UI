import axiosInstance from "./axiosInstance";

export const authApi = {
  // Login with email and password
  login: async (email, password) => {
    const response = await axiosInstance.post("/login/password", {
      email,
      password,
    });
    return response.data;
  },

<<<<<<< Updated upstream
  // Register new user
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
=======
  logout: async () => {
    try {
      const response = await axiosInstance.post('/admin/logout');
      return response.data;
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      return { success: false };
    }
>>>>>>> Stashed changes
  },

  // Login with OTP
  loginWithOtp: async (mobile) => {
    const response = await axiosInstance.post("/auth/login/otp", { mobile });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (mobile, otp) => {
    const response = await axiosInstance.post("/auth/verify-otp", { mobile, otp });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email) => {
<<<<<<< Updated upstream
    const response = await axiosInstance.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password with OTP
  resetPassword: async (email, otp, newPassword) => {
    const response = await axiosInstance.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  // Upload profile photo
  uploadProfilePhoto: async (file) => {
    const formData = new FormData();
    formData.append("profilePhoto", file);
    const response = await axiosInstance.post("/auth/upload/profile-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
=======
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
>>>>>>> Stashed changes
};
