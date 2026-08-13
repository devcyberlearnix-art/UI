import axiosInstance from "./axiosInstance";

export const studentApi = {
  // Get student profile
  getProfile: async () => {
    const response = await axiosInstance.get("/api/v1/users/me");
    return response.data;
  },

  // Update student profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put("/api/v1/users/me", profileData);
    return response.data;
  },

  // Get cart items
  getCart: async () => {
    const response = await axiosInstance.get("/api/v1/cart");
    return response.data;
  },

  // Add to cart
  addToCart: async (courseId) => {
    const response = await axiosInstance.post("/api/v1/cart", { courseId });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (courseId) => {
    const response = await axiosInstance.delete(`/api/v1/cart/${courseId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await axiosInstance.delete("/api/v1/cart");
    return response.data;
  },

  // Checkout
  checkout: async () => {
    const response = await axiosInstance.post("/api/v1/cart/checkout");
    return response.data;
  },

  // Get notifications
  getNotifications: async () => {
    const response = await axiosInstance.get("/api/v1/users/me/notifications");
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const response = await axiosInstance.put(`/api/v1/users/me/read/${notificationId}`);
    return response.data;
  },
};