// src/api/adminApi.js
// Updated with complete new workflow endpoints
// Base URL: https://matted-ascent-specimen.ngrok-free.dev
import axiosInstance from "./axiosInstance";

export const adminApi = {
  // ======================== AUTHENTICATION ========================
  login: async (email, password) => {
    const response = await axiosInstance.post('/api/v1/auth/login', { email, password });
    return response.data;
  },

  // ======================== SUB-ADMIN MANAGEMENT ========================
  getSubAdminProfile: async () => {
    const response = await axiosInstance.get('/api/v1/admins/me');
    return response.data;
  },

  updateSubAdminProfile: async (profileData) => {
    const response = await axiosInstance.put('/api/v1/admins/me', profileData);
    return response.data;
  },

  registerSubAdmin: async (adminData) => {
    const response = await axiosInstance.post('/api/v1/admins/register', adminData);
    return response.data;
  },

  // ======================== DASHBOARD REPORTS ========================
  getDashboardStats: {
    users: async () => {
      const response = await axiosInstance.get('/api/v1/admin/reports/users');
      return response.data;
    },
    courses: async () => {
      const response = await axiosInstance.get('/api/v1/admin/reports/courses');
      return response.data;
    },
    revenue: async () => {
      const response = await axiosInstance.get('/api/v1/admin/reports/revenue');
      return response.data;
    },
    orders: async () => {
      const response = await axiosInstance.get('/api/v1/admin/reports/orders');
      return response.data;
    },
  },

  // ======================== USER MANAGEMENT ========================
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await axiosInstance.get(`/api/v1/admin/users/${userId}`);
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await axiosInstance.put(`/api/v1/admin/users/${userId}/status`, { status });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
  },

  // ======================== INSTRUCTOR MANAGEMENT ========================
  getInstructors: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/instructors', { params });
    return response.data;
  },

  getInstructorApplications: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/instructors/applications', { params });
    return response.data;
  },

  approveInstructorApplication: async (userId) => {
    const response = await axiosInstance.put(`/api/v1/admin/instructors/applications/${userId}/approve`);
    return response.data;
  },

  rejectInstructorApplication: async (userId) => {
    const response = await axiosInstance.put(`/api/v1/admin/instructors/applications/${userId}/reject`);
    return response.data;
  },

  getInstructorCourses: async (instructorId) => {
    const response = await axiosInstance.get(`/api/v1/admin/instructors/${instructorId}/courses`);
    return response.data;
  },

  // ======================== COURSE MANAGEMENT ====================
  getCourses: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/courses', { params });
    return response.data;
  },

  getCourseById: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/admin/courses/${courseId}`);
    return response.data;
  },

  getCourseContent: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/admin/content/${courseId}`);
    return response.data;
  },

  approveCourse: async (courseId) => {
    const response = await axiosInstance.put(`/api/v1/admin/courses/${courseId}/approve`);
    return response.data;
  },

  rejectCourse: async (courseId) => {
    const response = await axiosInstance.put(`/api/v1/admin/courses/${courseId}/reject`);
    return response.data;
  },

  deleteCourse: async (courseId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/courses/${courseId}`);
    return response.data;
  },

  // ======================== COURSE CONTENT MANAGEMENT (SECTIONS & LECTURES) ====================
  createSection: async (courseId, sectionData) => {
    const response = await axiosInstance.post(`/api/v1/admin/courses/${courseId}/sections`, sectionData);
    return response.data;
  },

  deleteSection: async (sectionId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/sections/${sectionId}`);
    return response.data;
  },

  createLecture: async (sectionId, lectureData) => {
    const response = await axiosInstance.post(`/api/v1/admin/sections/${sectionId}/lectures`, lectureData);
    return response.data;
  },

  approveLecture: async (sectionId, lectureId) => {
    const response = await axiosInstance.put(`/api/v1/admin/sections/${sectionId}/lectures/${lectureId}/approve`);
    return response.data;
  },

  rejectLecture: async (sectionId, lectureId) => {
    const response = await axiosInstance.put(`/api/v1/admin/sections/${sectionId}/lectures/${lectureId}/reject`);
    return response.data;
  },

  deleteLecture: async (sectionId, lectureId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/sections/${sectionId}/lectures/${lectureId}`);
    return response.data;
  },

  // ======================== ORDERS & PAYMENTS ====================
  getOrders: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/orders', { params });
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/api/v1/admin/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await axiosInstance.put(`/api/v1/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  processOrderRefund: async (orderId, refundData) => {
    const response = await axiosInstance.post(`/api/v1/admin/orders/${orderId}/refund`, refundData);
    return response.data;
  },

  getPayments: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/payments', { params });
    return response.data;
  },

  getPaymentById: async (paymentId) => {
    const response = await axiosInstance.get(`/api/v1/admin/payments/${paymentId}`);
    return response.data;
  },

  // ======================== REVIEWS ====================
  getReviews: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/reviews', { params });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/reviews/${reviewId}`);
    return response.data;
  },

  // ======================== SETTINGS ====================
  updatePlatformSettings: async (settingsData) => {
    const response = await axiosInstance.put('/api/v1/admin/settings/platform', settingsData);
    return response.data;
  },

  updatePaymentSettings: async (settingsData) => {
    const response = await axiosInstance.put('/api/v1/admin/settings/payment', settingsData);
    return response.data;
  },

  updateNotificationSettings: async (settingsData) => {
    const response = await axiosInstance.put('/api/v1/admin/settings/notifications', settingsData);
    return response.data;
  },

  // ======================== NOTIFICATIONS & SYSTEM ====================
  broadcastNotification: async (notificationData) => {
    const response = await axiosInstance.post('/api/v1/admin/broadcast', notificationData);
    return response.data;
  },

  reprocessDLQ: async () => {
    const response = await axiosInstance.post('/api/v1/admin/reprocess-dlq');
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await axiosInstance.get('/api/v1/admin/system-health');
    return response.data;
  },

  // ======================== LEGACY COMPATIBILITY ====================
  // These methods provide backward compatibility with existing components
  getAllUsers: async (params = {}) => {
    return adminApi.getUsers(params);
  },

  getAllCourses: async (params = {}) => {
    return adminApi.getCourses(params);
  },

  approveInstructor: async (instructorId) => {
    return adminApi.approveInstructorApplication(instructorId);
  },

  rejectInstructor: async (instructorId) => {
    return adminApi.rejectInstructorApplication(instructorId);
  },

  updateCourseStatus: async (courseId, status) => {
    if (status === 'approved') return adminApi.approveCourse(courseId);
    if (status === 'rejected') return adminApi.rejectCourse(courseId);
    throw new Error('Invalid status. Use approve or reject.');
  },
};