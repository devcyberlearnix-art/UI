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

  // ======================== SUB-ADMIN / ADMIN PROFILE ========================
  getAdminProfile: async () => {
    const response = await axiosInstance.get('/api/v1/admin/me');
    return response.data;
  },

  updateAdminProfile: async (profileData) => {
    const response = await axiosInstance.put('/api/v1/admin/me', profileData);
    return response.data;
  },

  getSubAdminProfile: async () => {
    const response = await axiosInstance.get('/api/v1/admin/me');
    return response.data;
  },

  updateSubAdminProfile: async (profileData) => {
    const response = await axiosInstance.put('/api/v1/admin/me', profileData);
    return response.data;
  },

  uploadProfilePhoto: async (formData) => {
    const response = await axiosInstance.post('/api/v1/admin/me/photo', formData);
    return response.data;
  },

  deleteProfilePhoto: async () => {
    const response = await axiosInstance.delete('/api/v1/admin/me/photo');
    return response.data;
  },

  uploadCoverPhoto: async (formData) => {
    const response = await axiosInstance.post('/api/v1/admin/me/cover-photo', formData);
    return response.data;
  },

  deleteCoverPhoto: async () => {
    const response = await axiosInstance.delete('/api/v1/admin/me/cover-photo');
    return response.data;
  },

  // ======================== USERS MANAGEMENT ========================
  // Legacy paginated helpers
  getUsersPaged: async (page = 0, size = 10) => {
    const response = await axiosInstance.get(`/api/v1/admin/users?page=${page}&size=${size}`);
    return response.data;
  },

  getInstructorsPaged: async (page = 0, size = 10) => {
    const response = await axiosInstance.get(`/api/v1/admin/instructors?page=${page}&size=${size}`);
    return response.data;
  },

  registerSubAdmin: async (adminData) => {
    // Backend expects singular 'admin' in the register path
    const response = await axiosInstance.post('/api/v1/admin/register', adminData);
    return response.data;
  },

  // ======================== DASHBOARD REPORTS ========================
  getUsersReport: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/reports/users', { params });
    return response.data;
  },

  getOrdersReport: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/reports/orders', { params });
    return response.data;
  },

  getRevenueReport: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/reports/revenue', { params });
    return response.data;
  },

  getCoursesReport: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/reports/courses', { params });
    return response.data;
  },

  getDashboardStats: {
    users: async (params = {}) => {
      const response = await axiosInstance.get('/api/v1/admin/reports/users', { params });
      return response.data;
    },
    courses: async (params = {}) => {
      const response = await axiosInstance.get('/api/v1/admin/reports/courses', { params });
      return response.data;
    },
    revenue: async (params = {}) => {
      const response = await axiosInstance.get('/api/v1/admin/reports/revenue', { params });
      return response.data;
    },
    orders: async (params = {}) => {
      const response = await axiosInstance.get('/api/v1/admin/reports/orders', { params });
      return response.data;
    },
  },

  // ======================== USER MANAGEMENT ========================
  getUsers: async (pageOrParams = {}, maybeSize) => {
    let params = {};
    if (typeof pageOrParams === 'object' && pageOrParams !== null) {
      params = pageOrParams;
    } else if (typeof pageOrParams === 'number') {
      params = { page: pageOrParams, size: maybeSize ?? 10 };
    }
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
  getInstructors: async (pageOrParams = {}, maybeSize) => {
    let params = {};
    if (typeof pageOrParams === 'object' && pageOrParams !== null) {
      params = pageOrParams;
    } else if (typeof pageOrParams === 'number') {
      params = { page: pageOrParams, size: maybeSize ?? 10 };
    }
    const response = await axiosInstance.get('/api/v1/admin/instructors', { params });
    return response.data;
  },

  getInstructorApplications: async (params = {}) => {
    const response = await axiosInstance.get('/api/v1/admin/instructors/applications', { params });
    return response.data;
  },

  getInstructorApplicationById: async (applicationId) => {
    const response = await axiosInstance.get(`/api/v1/admin/instructors/applications/${applicationId}`);
    return response.data;
  },

  getInstructorApplicationsByStatus: async (status, params = {}) => {
    const response = await axiosInstance.get(`/api/v1/admin/instructors/applications/status/${status}`, { params });
    return response.data;
  },

  approveInstructorApplication: async (applicationId, reason = "") => {
    const response = await axiosInstance.put(`/api/v1/admin/instructors/applications/${applicationId}/approve`, { reason });
    return response.data;
  },

  rejectInstructorApplication: async (applicationId, reason) => {
    const response = await axiosInstance.put(`/api/v1/admin/instructors/applications/${applicationId}/reject`, { reason });
    return response.data;
  },

  requestAdditionalInfo: async (applicationId, requestedInfo) => {
    const response = await axiosInstance.put(`/api/v1/admin/instructors/applications/${applicationId}/request-info`, { requestedInfo });
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

  getCourseStudents: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/courses/${courseId}/students`);
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


  // ======================== COUPON MANAGEMENT ========================
  getCoupons: async () => {
    const response = await axiosInstance.get('/api/v1/coupons');
    return response.data?.data || response.data || [];
  },

  getCouponById: async (couponId) => {
    const response = await axiosInstance.get(`/api/v1/coupons/${couponId}`);
    return response.data?.data || response.data;
  },

  createCoupon: async (couponPayload) => {
    const response = await axiosInstance.post('/api/v1/coupons', couponPayload);
    return response.data?.data || response.data;
  },

  updateCoupon: async (couponId, couponPayload) => {
    const response = await axiosInstance.put(`/api/v1/coupons/${couponId}`, couponPayload);
    return response.data?.data || response.data;
  },

  deleteCoupon: async (couponId) => {
    const response = await axiosInstance.delete(`/api/v1/coupons/${couponId}`);
    return response.data?.data || response.data;
  },

  activateCoupon: async (couponId) => {
    const response = await axiosInstance.patch(`/api/v1/coupons/${couponId}/activate`);
    return response.data?.data || response.data;
  },

  deactivateCoupon: async (couponId) => {
    const response = await axiosInstance.patch(`/api/v1/coupons/${couponId}/deactivate`);
    return response.data?.data || response.data;
  },

  validateCoupon: async (code) => {
    const response = await axiosInstance.get(`/api/v1/coupons/validate/${code}`);
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

  // ======================== BANNER MANAGEMENT (15 ENDPOINTS) ========================
  createBanner: async (bannerPayload) => {
    const response = await axiosInstance.post('/api/v1/admin/banners', bannerPayload);
    return response.data;
  },

  getAllBanners: async () => {
    const response = await axiosInstance.get('/api/v1/admin/banners');
    return response.data;
  },

  getBanners: async () => {
    return adminApi.getAllBanners();
  },

  getBannerById: async (bannerId) => {
    const response = await axiosInstance.get(`/api/v1/admin/banners/${bannerId}`);
    return response.data;
  },

  updateBanner: async (bannerId, bannerPayload) => {
    const response = await axiosInstance.put(`/api/v1/admin/banners/${bannerId}`, bannerPayload);
    return response.data;
  },

  patchBanner: async (bannerId, bannerPayload) => {
    const response = await axiosInstance.patch(`/api/v1/admin/banners/${bannerId}`, bannerPayload);
    return response.data;
  },

  updateBannerStatus: async (bannerId, statusPayload) => {
    const payload = typeof statusPayload === 'string' ? { status: statusPayload } : statusPayload;
    const response = await axiosInstance.patch(`/api/v1/admin/banners/${bannerId}/status`, payload);
    return response.data;
  },

  reorderBanners: async (reorderPayload) => {
    const response = await axiosInstance.patch('/api/v1/admin/banners/reorder', reorderPayload);
    return response.data;
  },

  deleteBanner: async (bannerId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/banners/${bannerId}`);
    return response.data;
  },

  getBannerAnalytics: async (bannerId) => {
    const path = bannerId ? `/api/v1/admin/banners/${bannerId}/analytics` : '/api/v1/admin/banners/analytics';
    const response = await axiosInstance.get(path);
    return response.data;
  },

  uploadBannerImage: async (file, imageType = 'desktop') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', imageType);
    const response = await axiosInstance.post('/api/v1/admin/banners/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  validateBannerImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/api/v1/admin/banners/validate-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getDeletedBanners: async () => {
    const response = await axiosInstance.get('/api/v1/admin/banners/deleted');
    return response.data;
  },

  restoreBanner: async (bannerId) => {
    const response = await axiosInstance.post(`/api/v1/admin/banners/${bannerId}/restore`);
    return response.data;
  },

  getBannersByTarget: async (targetType) => {
    const response = await axiosInstance.get(`/api/v1/admin/banners/target/${targetType}`);
    return response.data;
  },

  trackBannerConversion: async (bannerId) => {
    const response = await axiosInstance.post(`/api/v1/admin/banners/${bannerId}/conversion`);
    return response.data;
  },

  // ======================== ADMIN AUTH & PASSWORD RECOVERY (8 ENDPOINTS) ========================
  loginDirect: async (email, password) => {
    const response = await axiosInstance.post('/api/v1/admin/login', { email, password });
    return response.data;
  },

  requestLoginOtp: async (email) => {
    const response = await axiosInstance.post('/api/v1/admin/login/otp/request', { email });
    return response.data;
  },

  verifyLoginOtp: async (email, otp) => {
    const response = await axiosInstance.post('/api/v1/admin/login/otp/verify', { email, otp });
    return response.data;
  },

  resendLoginOtp: async (email) => {
    const response = await axiosInstance.post('/api/v1/admin/login/otp/resend', { email });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/api/v1/admin/password/forgot', { email });
    return response.data;
  },

  verifyPasswordOtp: async (email, otp) => {
    const response = await axiosInstance.post('/api/v1/admin/password/verify-otp', { email, otp });
    return response.data;
  },

  resendPasswordOtp: async (email) => {
    const response = await axiosInstance.post('/api/v1/admin/password/otp/resend', { email });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await axiosInstance.post('/api/v1/admin/password/reset', { email, otp, newPassword });
    return response.data;
  },

  // ======================== ADMIN 2FA & SECURITY MUTATIONS (8 ENDPOINTS) ========================
  initiateEmailChange: async (payload) => {
    const response = await axiosInstance.post('/api/v1/admin/email/change-request', payload);
    return response.data;
  },

  verifyOldEmailOtp: async (sessionId, otp) => {
    const response = await axiosInstance.post('/api/v1/admin/email/verify-old', { sessionId, otp });
    return response.data;
  },

  verifyNewEmailOtp: async (sessionId, otp) => {
    const response = await axiosInstance.post('/api/v1/admin/email/verify-new', { sessionId, otp });
    return response.data;
  },

  resendEmailChangeOtp: async (sessionId, type = 'old') => {
    const response = await axiosInstance.post('/api/v1/admin/email/resend-otp', { sessionId, type });
    return response.data;
  },

  getEmailChangeSession: async (sessionId) => {
    const response = await axiosInstance.get(`/api/v1/admin/email/change-request/${sessionId}`);
    return response.data;
  },

  initiatePasswordChange: async (payload) => {
    const response = await axiosInstance.post('/api/v1/admin/change-password', payload);
    return response.data;
  },

  verifyChangePasswordOtp: async (otp) => {
    const response = await axiosInstance.post('/api/v1/admin/change-password/verify-otp', { otp });
    return response.data;
  },

  resendChangePasswordOtp: async () => {
    const response = await axiosInstance.post('/api/v1/admin/change-password/resend-otp');
    return response.data;
  },

  // ======================== LIFECYCLE & SERVICE HEALTH (3 ENDPOINTS) ========================
  deleteInstructor: async (instructorId) => {
    const response = await axiosInstance.delete(`/api/v1/admin/instructors/${instructorId}`);
    return response.data;
  },

  getAdminProfileDirect: async () => {
    const response = await axiosInstance.get('/api/v1/admin/profile');
    return response.data;
  },

  refreshUserEligibility: async (userId) => {
    const response = await axiosInstance.get(`/api/v1/admin/internal/users/${userId}/refresh-eligibility`);
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