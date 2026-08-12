import axiosInstance from "../api/axiosInstance";
import { decodeToken, setUser, removeUser } from "../utils/auth";

export const authService = {
  // Password Login
  login: async (email, password) => {
    const response = await axiosInstance.post("/api/v1/auth/login", { email, password });
    return authService.handleAuthSuccess(response.data, email);
  },

  // Request OTP - Auto-detects if user is Admin or standard User
  requestOtp: async (email) => {
    const response = await axiosInstance.post("/api/v1/auth/login/otp/request", { email });
    return { success: true, data: response.data };
  },

  // Verify OTP (User or Admin)
  verifyOtp: async (email, otp, otpSessionId) => {
    try {
      const response = await axiosInstance.post("/api/v1/auth/login/otp/verify", { email, otp, otpSessionId });
      const data = response.data;

      const payload = data?.data || data || {};
      const token = payload.accessToken || payload.token || data?.token;

      if (token) {
        return authService.handleAuthSuccess(data, email);
      }
      throw new Error("Invalid OTP response structure");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "OTP verification failed";
      throw new Error(errorMsg);
    }
  },

  // Resend OTP
  resendOtp: async (email) => {
    try {
      const response = await axiosInstance.post("/api/v1/auth/login/otp/request", { email });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to resend OTP";
      throw new Error(errorMsg);
    }
  },

  // Process successful authentication
  handleAuthSuccess: (data, email) => {
    // Extract nested payload or fall back to root data
    const payload = data?.data || data || {};
    const authentication = data?.authentication || payload.authentication || {};
    const token = authentication.accessToken || payload.accessToken || payload.token || data?.token;

    if (!token) {
      throw new Error("No access token found in response");
    }

    localStorage.setItem("lms_token", token);
    localStorage.setItem("access_token", token);
    if (authentication.refreshToken) {
      localStorage.setItem("refresh_token", authentication.refreshToken);
    }

    const decoded = decodeToken(token);
    
    // Normalize role: check activeRole, decoded role, or fallback
    let rawRole = payload.activeRole || data?.user?.role || decoded?.role || payload.role || "student";
    let userRole = typeof rawRole === "string" ? rawRole.toLowerCase() : "student";
    
    if (userRole === "user" || userRole === "student") {
      userRole = "student";
    } else if (userRole === "instructor") {
      userRole = "instructor";
    } else if (userRole === "admin" || userRole.endsWith("_admin")) {
      userRole = "admin";
    }

    const userData = {
      id: decoded?.sub || decoded?.id || payload.userId || payload.id || "user_" + Date.now(),
      email: email || decoded?.email || payload.email,
      name: decoded?.name || payload.name || (email ? email.split("@")[0] : "User"),
      role: userRole,
      ...data?.user,
      ...payload
    };

    setUser(userData);
    return { user: userData, token };
  },

  // Logout
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      await axiosInstance.post("/api/v1/auth/logout", refreshToken ? { refreshToken } : {});
    } catch (error) {
      console.warn("Logout API call failed, clearing session locally anyway");
    }
    localStorage.removeItem("lms_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    removeUser();
  },

  // Get current user and validate token expiry
  getCurrentUser: () => {
    const token = localStorage.getItem("lms_token");
    if (!token) return null;

    try {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("lms_token");
        localStorage.removeItem("access_token");
        removeUser();
        return null;
      }
      
      const user = localStorage.getItem("lms_user");
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }
};
