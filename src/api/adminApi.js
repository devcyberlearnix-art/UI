import axiosInstance from "./axiosInstance";

const tryPaths = async (requestBuilder) => {
  let lastError;
  for (const build of requestBuilder) {
    try {
      const response = await build();
      return response.data;
    } catch (error) {
      lastError = error;
      if (error?.response && ![404, 405].includes(error.response.status)) {
        throw error;
      }
    }
  }
  throw lastError;
};

export const adminApi = {
  login: async (email, password) => {
    const response = await axiosInstance.post("/api/v1/auth/login", { email, password });
    return response.data;
  },

  getSubAdminProfile: async () => {
    const response = await axiosInstance.get("/api/v1/admin/me");
    return response.data;
  },

  updateSubAdminProfile: async (profileData) => {
    const response = await axiosInstance.put("/api/v1/admin/me", profileData);
    return response.data;
  },

  registerSubAdmin: async (adminData) => {
    const response = await axiosInstance.post("/api/v1/admin/register", adminData);
    return response.data;
  },

  getDashboardStats: {
    users: async () => adminApi.getUsersReport(),
    courses: async () => adminApi.getCoursesReport(),
    revenue: async () => adminApi.getRevenueReport(),
    orders: async () => adminApi.getOrdersReport(),
  },

  getUsers: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/users", { params });
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

  updateUser: async (userId, payload) => {
    const response = await axiosInstance.put(`/api/v1/admin/users/${userId}`, payload);
    return response.data;
  },

  createUser: async (payload) => {
    const response = await axiosInstance.post("/api/v1/admin/users", payload);
    return response.data;
  },

  banUser: async (userId) => {
    const response = await axiosInstance.put(`/api/v1/admin/users/${userId}/status`, { status: "BLOCKED" });
    return response.data;
  },

  unbanUser: async (userId) => {
    const response = await axiosInstance.put(`/api/v1/admin/users/${userId}/status`, { status: "ACTIVE" });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/users/${userId}`);
    return response.data;
  },

  getInstructors: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/instructors", { params });
    return response.data;
  },

  getInstructorApplications: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/instructors/applications", { params });
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

  deleteInstructor: async (instructorId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/instructors/${instructorId}`);
    return response.data;
  },

  getInstructorCourses: async (instructorId) => {
    const response = await axiosInstance.get(`/api/v1/admin/instructors/${instructorId}/courses`);
    return response.data;
  },

  getCourses: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/courses", { params });
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

  getOrders: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/orders", { params });
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/api/v1/admin/orders/${orderId}`);
    return response.data;
  },

  deleteOrder: async (orderId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/orders/${orderId}`);
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
    const response = await axiosInstance.get("/api/v1/admin/payments", { params });
    return response.data;
  },

  getPaymentById: async (paymentId) => {
    const response = await axiosInstance.get(`/api/v1/admin/payments/${paymentId}`);
    return response.data;
  },

  getReviews: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/reviews", { params });
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/reviews/${reviewId}`);
    return response.data;
  },

  updatePlatformSettings: async (settingsData) => {
    const response = await axiosInstance.put("/api/v1/admin/settings/platform", settingsData);
    return response.data;
  },

  updatePaymentSettings: async (settingsData) => {
    const response = await axiosInstance.put("/api/v1/admin/settings/payment", settingsData);
    return response.data;
  },

  updateNotificationSettings: async (settingsData) => {
    const response = await axiosInstance.put("/api/v1/admin/settings/notifications", settingsData);
    return response.data;
  },

  broadcastNotification: async (notificationData) => {
    const response = await axiosInstance.post("/api/v1/admin/broadcast", notificationData);
    return response.data;
  },

  reprocessDLQ: async () => {
    const response = await axiosInstance.post("/api/v1/admin/reprocess-dlq");
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await axiosInstance.get("/api/v1/admin/system-health");
    return response.data;
  },

  getAllUsers: async (params = {}) => adminApi.getUsers(params),
  getAllCourses: async (params = {}) => adminApi.getCourses(params),
  approveInstructor: async (instructorId) => adminApi.approveInstructorApplication(instructorId),
  rejectInstructor: async (instructorId) => adminApi.rejectInstructorApplication(instructorId),
  updateCourseStatus: async (courseId, status) => {
    if (status === "approved") return adminApi.approveCourse(courseId);
    if (status === "rejected") return adminApi.rejectCourse(courseId);
    throw new Error("Invalid status. Use approve or reject.");
  },

  getUsersReport: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/reports/users", { params });
    return response.data;
  },

  getOrdersReport: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/reports/orders", { params });
    return response.data;
  },

  getRevenueReport: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/reports/revenue", { params });
    return response.data;
  },

  getCoursesReport: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/admin/reports/courses", { params });
    return response.data;
  },

  getOrderAnalytics: async () => {
    return tryPaths([
      () => axiosInstance.get("/api/v1/admin/analytics/orders"),
      () => axiosInstance.get("/api/v1/admin/reports/orders"),
    ]);
  },

  getCourseReport: async () => adminApi.getCoursesReport(),
  getOrderDetails: async (orderId) => adminApi.getOrderById(orderId),
  getPlatformSettings: async () => tryPaths([() => axiosInstance.get("/api/v1/admin/settings/platform")]),
  savePlatformSettings: async (settings) => tryPaths([() => axiosInstance.put("/api/v1/admin/settings/platform", settings)]),
  getPaymentSettings: async () => tryPaths([() => axiosInstance.get("/api/v1/admin/settings/payment")]),
  savePaymentSettings: async (settings) => tryPaths([() => axiosInstance.put("/api/v1/admin/settings/payment", settings)]),
  getNotificationSettings: async () => tryPaths([() => axiosInstance.get("/api/v1/admin/settings/notifications")]),
  saveNotificationSettings: async (settings) => tryPaths([() => axiosInstance.put("/api/v1/admin/settings/notifications", settings)]),

  verifyAdminEmail: async ({ email, otp }) => {
    return tryPaths([
      () => axiosInstance.post("/api/v1/auth/verify-email", { email, otp }),
      () => axiosInstance.post("/api/v1/admin/verify-email", { email, otp }),
    ]);
  },

  getAdminProfile: async () => adminApi.getSubAdminProfile(),
  updateAdminProfile: async (payload) => adminApi.updateSubAdminProfile(payload),

  getAdmins: async () => {
    return tryPaths([
      () => axiosInstance.get("/api/v1/admin/admins"),
      () => axiosInstance.get("/api/v1/admin/users", { params: { role: "admin" } }),
    ]);
  },

  deleteSubAdmin: async (adminId) => {
    return tryPaths([
      () => axiosInstance.delete(`/api/v1/admin/admins/${adminId}`),
      () => axiosInstance.delete(`/api/v1/admin/users/${adminId}`),
    ]);
  },

  toggleAdminStatus: async (adminId) => {
    return tryPaths([
      () => axiosInstance.patch(`/api/v1/admin/admins/${adminId}/status`),
      () => axiosInstance.put(`/api/v1/admin/users/${adminId}/status`),
    ]);
  },

  getRoles: async () => {
    const response = await axiosInstance.get("/api/v1/admin/roles");
    return response.data;
  },

  createRole: async (payload) => {
    const response = await axiosInstance.post("/api/v1/admin/roles", payload);
    return response.data;
  },

  updateRole: async (roleId, payload) => {
    const response = await axiosInstance.put(`/api/v1/admin/roles/${roleId}`, payload);
    return response.data;
  },

  deleteRole: async (roleId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/roles/${roleId}`);
    return response.data;
  },
};