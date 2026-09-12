import axiosInstance from "../api/axiosInstance";
import { decodeToken, setUser, removeUser } from "../utils/auth";

export const authService = {
  // Password Login
  login: async (email, password) => {
    try {
      // 1. Try standard user password login
      const response = await axiosInstance.post("/login/password", {
        email,
        password,
      });
      const data = response.data;
      
      // Extract payload and token from standard response
      const payload = data?.data || data || {};
      const token = payload.accessToken || payload.token || data?.token;
      
      if (token) {
        return authService.handleAuthSuccess(data, email);
      }
      throw new Error("Invalid response structure from backend");
    } catch (userError) {
      console.warn("User password login failed, attempting Admin login...");
      try {
        // 2. Try Admin OTP/Password Login (treat password as OTP/password credential)
        const response = await axiosInstance.post("/admin/login/otp/request", {
          email,
          password,
          otp: password
        });
        const data = response.data;
        
        const payload = data?.data || data || {};
        const token = payload.accessToken || payload.token || data?.token;
        
        if (token) {
          return authService.handleAuthSuccess(data, email);
        }
        throw new Error("Invalid response structure from admin backend");
      } catch (adminError) {
        const errorMsg = adminError.response?.data?.message || userError.response?.data?.message || adminError.message || "Login failed";
        throw new Error(errorMsg);
      }
    }
  },

  // Request OTP - Auto-detects if user is Admin or standard User
  requestOtp: async (email) => {
    try {
      // 1. Try User OTP Request
      const response = await axiosInstance.post("/auth/login/otp/request", { email });
      return { success: true, isAdmin: false, data: response.data };
    } catch (error) {
      console.warn("User OTP request failed, trying Admin OTP request...");
      
      try {
        // 2. Try Admin OTP Request
        const response = await axiosInstance.post("/admin/login/otp/request", { email });
        return { success: true, isAdmin: true, data: response.data };
      } catch (adminError) {
        const errorMsg = adminError.response?.data?.message || error.response?.data?.message || "Failed to send OTP";
        throw new Error(errorMsg);
      }
    }
  },

  // Verify OTP (User or Admin)
  verifyOtp: async (email, otp, isAdmin) => {
    try {
      const endpoint = isAdmin ? "/admin/login/otp/request" : "/auth/login/otp/request";
      const response = await axiosInstance.post(endpoint, { email, otp });
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
  resendOtp: async (email, isAdmin) => {
    try {
      if (isAdmin) {
        const response = await axiosInstance.post("/admin/login/otp/request", { email });
        return response.data;
      } else {
        const response = await axiosInstance.post("/auth/login/otp/verify", { email });
        return response.data;
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to resend OTP";
      throw new Error(errorMsg);
    }
  },

  // Process successful authentication
  handleAuthSuccess: (data, email) => {
    // Extract nested payload or fall back to root data
    const payload = data?.data || data || {};
    const token = payload.accessToken || payload.token || data?.token;

    if (!token) {
      throw new Error("No access token found in response");
    }

    localStorage.setItem("lms_token", token);
    localStorage.setItem("access_token", token);

    const decoded = decodeToken(token);
    
    // Normalize role: check activeRole, decoded role, or fallback
    let rawRole = payload.activeRole || decoded?.role || payload.role || "student";
    let userRole = typeof rawRole === "string" ? rawRole.toLowerCase() : "student";
    
    if (userRole === "user" || userRole === "student") {
      userRole = "student";
    } else if (userRole === "instructor") {
      userRole = "instructor";
    } else if (userRole === "admin") {
      userRole = "admin";
    }

    const userData = {
      id: decoded?.sub || decoded?.id || payload.userId || payload.id || "user_" + Date.now(),
      email: email || decoded?.email || payload.email,
      name: decoded?.name || payload.name || (email ? email.split("@")[0] : "User"),
      role: userRole,
      ...payload
    };

    setUser(userData);
    return { user: userData, token };
  },

  // Register
  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/api/v1/auth/register", userData);
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMsg);
    }
  },

  // Logout
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.warn("Logout API call failed, clearing session locally anyway");
    }
    localStorage.removeItem("lms_token");
    localStorage.removeItem("access_token");
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
