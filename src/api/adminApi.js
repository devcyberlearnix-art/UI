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
  // Helper: build config with override token if stored
  _userConfig(extra = {}) {
    const t = localStorage.getItem('lms_users_api_token');
    return t ? { ...extra, headers: { ...(extra.headers || {}), Authorization: `Bearer ${t}` } } : extra;
  },

  getUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/users', adminApi._userConfig({ params }));
      return response.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        const e = new Error(err?.response?.data?.message || `Access denied (${status}). The token may lack USER_SERVICE permission.`);
        e.status = status;
        throw e;
      }
      throw err;
    }
  },

  // GET /api/v1/admin/users/:userId
  getUserById: async (userId) => {
    const response = await axiosInstance.get(
      `/api/v1/admin/users/${userId}`,
      adminApi._userConfig()
    );
    return response.data;
  },

  // PUT /api/v1/admin/users/:userId/status   body: { status: "ACTIVE" | "BLOCKED" | "INACTIVE" }
  updateUserStatus: async (userId, status) => {
    const response = await axiosInstance.put(
      `/api/v1/admin/users/${userId}/status`,
      { status },
      adminApi._userConfig()
    );
    return response.data;
  },

  // DELETE /api/v1/admin/users/:userId
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(
      `/api/v1/admin/users/${userId}`,
      adminApi._userConfig()
    );
    return response.data;
  },

  // POST /api/v1/admin/users
  createUser: async (userData) => {
    const response = await axiosInstance.post(
      '/api/v1/admin/users',
      userData,
      adminApi._userConfig()
    );
    return response.data;
  },

  // PUT /api/v1/admin/users/:userId
  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(
      `/api/v1/admin/users/${userId}`,
      userData,
      adminApi._userConfig()
    );
    return response.data;
  },

  banUser:   async (userId) => adminApi.updateUserStatus(userId, 'BLOCKED'),
  unbanUser: async (userId) => adminApi.updateUserStatus(userId, 'ACTIVE'),


  // ======================== INSTRUCTOR MANAGEMENT ========================
  getInstructors: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/instructors', { params });
    return response.data;
  },

  // GET /api/v1/admin/instructors/applications
  // Params: { status: 'PENDING'|'APPROVED'|'REJECTED'|'all', page: 0, size: 10 }
  // Response: { success, data: [ { application, user, documents, nextSteps } ], pagination: { currentPage, totalPages, totalApplications, pageSize } }
  getInstructorApplications: async (params = {}) => {
    // Map 'all' to no status filter; capitalize status for backend
    const queryParams = { ...params };
    if (queryParams.status === 'all' || !queryParams.status) {
      delete queryParams.status;
    } else {
      queryParams.status = String(queryParams.status).toUpperCase();
    }
    const response = await axiosInstance.get('/api/v1/admin/instructors/applications', { params: queryParams });
    return response.data;
  },

  // PUT /api/v1/admin/instructors/applications/{applicationId}/approve
  // applicationId = application.applicationId from the GET response
  approveInstructorApplication: async (applicationId) => {
    const response = await axiosInstance.put(`/api/v1/admin/instructors/applications/${applicationId}/approve`);
    return response.data;
  },

  // PUT /api/v1/admin/instructors/applications/{applicationId}/reject
  // applicationId = application.applicationId from the GET response
  rejectInstructorApplication: async (applicationId, reason) => {
    const body = reason ? { reason } : {};
    const response = await axiosInstance.put(`/api/v1/admin/instructors/applications/${applicationId}/reject`, body);
    return response.data;
  },

  getInstructorCourses: async (instructorId) => {
    const response = await axiosInstance.get(`/api/v1/admin/instructors/${instructorId}/courses`);
    return response.data;
  },

  deleteInstructor: async (instructorId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/instructors/${instructorId}`);
    return response.data;
  },

  // ======================== COURSE MANAGEMENT ====================
  getCourses: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/courses', { params });
      return response.data;
    } catch (err) {
      console.warn('[adminApi] /api/v1/admin/courses failed, trying fallback endpoints...');
      try {
        const fallback1 = await axiosInstance.get('/api/v1/courses', { params });
        return fallback1.data;
      } catch (err1) {
        try {
          const fallback2 = await axiosInstance.get('/api/v1/admin/reports/courses', { params });
          return fallback2.data;
        } catch (err2) {
          console.warn('[adminApi] All course endpoints returned error, returning empty list');
          return [];
        }
      }
    }
  },

  getCourseById: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/admin/courses/${courseId}`);
    return response.data;
  },

  // GET /api/v1/admin/content/{courseId}
  getCourseContent: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/admin/content/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[adminApi] GET /api/v1/admin/content/${courseId} failed, trying fallback...`);
      try {
        const response = await axiosInstance.get(`/api/v1/courses/${courseId}`);
        return response.data;
      } catch (err2) {
        const localCourses = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
        const found = localCourses.find(
          (c) => String(c.id) === String(courseId) || String(c._id) === String(courseId)
        );
        if (found) return { success: true, data: found };
        throw err;
      }
    }
  },

  // PUT /api/v1/courses/{courseId}
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axiosInstance.put(`/api/v1/courses/${courseId}`, courseData);
      return response.data;
    } catch (err) {
      try {
        const fallback = await axiosInstance.put(`/api/v1/admin/courses/${courseId}`, courseData);
        return fallback.data;
      } catch (err2) {
        return courseData;
      }
    }
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