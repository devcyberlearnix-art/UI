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

  // Register new user
  register: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
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
};
