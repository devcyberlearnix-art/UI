import axiosInstance from "./axiosInstance";

export const studentApi = {
  // Get student dashboard data
  getDashboardData: async () => {
    const response = await axiosInstance.get("/student/dashboard");
    return response.data;
  },

  // Get student profile
  getProfile: async () => {
    const response = await axiosInstance.get("/student/profile");
    return response.data;
  },

  // Update student profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put("/student/profile", profileData);
    return response.data;
  },

  // Get certificates
  getCertificates: async () => {
    const response = await axiosInstance.get("/student/certificates");
    return response.data;
  },

  // Download certificate
  downloadCertificate: async (certificateId) => {
    const response = await axiosInstance.get(`/student/certificates/${certificateId}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  // Get cart items
  getCart: async () => {
    const response = await axiosInstance.get("/student/cart");
    return response.data;
  },

  // Add to cart
  addToCart: async (courseId) => {
    const response = await axiosInstance.post("/student/cart", { courseId });
    return response.data;
  },

  // Remove from cart
  removeFromCart: async (courseId) => {
    const response = await axiosInstance.delete(`/student/cart/${courseId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await axiosInstance.delete("/student/cart");
    return response.data;
  },

  // Checkout
  checkout: async (paymentData) => {
    const response = await axiosInstance.post("/student/checkout", paymentData);
    return response.data;
  },

  // Get notifications
  getNotifications: async () => {
    const response = await axiosInstance.get("/student/notifications");
    return response.data;
  },

  // Mark notification as read
  markNotificationRead: async (notificationId) => {
    const response = await axiosInstance.put(`/student/notifications/${notificationId}/read`);
    return response.data;
  },

  // Get learning history
  getLearningHistory: async () => {
    const response = await axiosInstance.get("/student/learning-history");
    return response.data;
  },
};
