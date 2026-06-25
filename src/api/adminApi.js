import axiosInstance from "./axiosInstance";

export const adminApi = {
  // Get admin dashboard data
  getDashboardData: async () => {
    const response = await axiosInstance.get("/admin/dashboard");
    return response.data;
  },

  // Get all users
  getAllUsers: async (params = {}) => {
    const response = await axiosInstance.get("/admin/users", { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Ban user
  banUser: async (userId) => {
    const response = await axiosInstance.post(`/admin/users/${userId}/ban`);
    return response.data;
  },

  // Unban user
  unbanUser: async (userId) => {
    const response = await axiosInstance.post(`/admin/users/${userId}/unban`);
    return response.data;
  },

  // Get all instructors
  getInstructors: async (params = {}) => {
    const response = await axiosInstance.get("/admin/instructors", { params });
    return response.data;
  },

  // Approve instructor request
  approveInstructor: async (instructorId) => {
    const response = await axiosInstance.post(`/admin/instructors/${instructorId}/approve`);
    return response.data;
  },

  // Reject instructor request
  rejectInstructor: async (instructorId) => {
    const response = await axiosInstance.post(`/admin/instructors/${instructorId}/reject`);
    return response.data;
  },

  // Get all courses
  getAllCourses: async (params = {}) => {
    const response = await axiosInstance.get("/admin/courses", { params });
    return response.data;
  },

  // Update course status
  updateCourseStatus: async (courseId, status) => {
    const response = await axiosInstance.put(`/admin/courses/${courseId}/status`, { status });
    return response.data;
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await axiosInstance.delete(`/admin/courses/${courseId}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await axiosInstance.get("/admin/categories");
    return response.data;
  },

  // Create category
  createCategory: async (categoryData) => {
    const response = await axiosInstance.post("/admin/categories", categoryData);
    return response.data;
  },

  // Update category
  updateCategory: async (categoryId, categoryData) => {
    const response = await axiosInstance.put(`/admin/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete category
  deleteCategory: async (categoryId) => {
    const response = await axiosInstance.delete(`/admin/categories/${categoryId}`);
    return response.data;
  },

  // Get platform analytics
  getAnalytics: async (params = {}) => {
    const response = await axiosInstance.get("/admin/analytics", { params });
    return response.data;
  },

  // Get revenue data
  getRevenue: async (params = {}) => {
    const response = await axiosInstance.get("/admin/revenue", { params });
    return response.data;
  },

  // Get reports
  getReports: async (params = {}) => {
    const response = await axiosInstance.get("/admin/reports", { params });
    return response.data;
  },

  // Resolve report
  resolveReport: async (reportId) => {
    const response = await axiosInstance.put(`/admin/reports/${reportId}/resolve`);
    return response.data;
  },

  // Get system settings
  getSettings: async () => {
    const response = await axiosInstance.get("/admin/settings");
    return response.data;
  },

  // Update system settings
  updateSettings: async (settingsData) => {
    const response = await axiosInstance.put("/admin/settings", settingsData);
    return response.data;
  },

  // Get user activity logs
  getActivityLogs: async (params = {}) => {
    const response = await axiosInstance.get("/admin/activity-logs", { params });
    return response.data;
  },
};
