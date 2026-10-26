import axiosInstance from "./axiosInstance";

/**
 * Course Service API Client
 * Complete API functions based on the backend API reference
 * Service: Course Service (Port 8083)
 * Gateway Path: /api/v1/courses
 */
export const courseApi = {
  // ============================================
  // Course Discovery & Catalog APIs
  // ============================================

  /**
   * GET /api/v1/courses
   * Get all courses with pagination
   */
  getAllCourses: async (params = { page: 0, size: 10, sortBy: 'id', sortDir: 'asc' }) => {
    try {
      const response = await axiosInstance.get('/api/v1/courses', { params });
      return response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/courses failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/list
   * Get course list with filters
   */
  getCourseList: async (filters = {}) => {
    try {
      const response = await axiosInstance.get('/api/v1/courses/list', { params: filters });
      return response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/courses/list failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/featured
   * Get featured courses
   */
  getFeaturedCourses: async (limit = 6) => {
    try {
      const response = await axiosInstance.get('/api/v1/courses/featured', { params: { limit } });
      return response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/courses/featured failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/trending
   * Get trending courses
   */
  getTrendingCourses: async ({ page = 0, size = 10, category = '', level = '' } = {}) => {
    const params = { page, size };
    if (category && category !== 'All') params.category = category;
    if (level && level !== 'All') params.level = level;

    try {
      const response = await axiosInstance.get('/api/v1/courses/trending', { params });
      return response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/courses/trending failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/{id}
   * Get course by ID
   */
  getCourseById: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId} failed`);
      throw err;
    }
  },

  /**
   * POST /api/v1/courses/{courseId}/impressions
   * Track course impressions
   */
  trackCourseImpression: async (courseId, source = 'HOME') => {
    try {
      const response = await axiosInstance.post(`/api/v1/courses/${courseId}/impressions`, null, {
        params: { source }
      });
      return response.data;
    } catch (err) {
      console.warn('[courseApi] Track impression failed');
      // Non-critical, don't throw
      return null;
    }
  },

  /**
   * GET /api/v1/courses/stats
   * Get course statistics (Admin only)
   */
  getCourseStats: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/courses/stats');
      return response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/courses/stats failed');
      throw err;
    }
  },

  // ============================================
  // Course Details & Learning Content APIs
  // ============================================

  /**
   * GET /api/v1/courses/{courseId}/details
   * Get comprehensive course details
   */
  getCourseDetails: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/details`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId}/details failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/{courseId}/curriculum
   * Get course curriculum
   */
  getCourseCurriculum: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/curriculum`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId}/curriculum failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/{courseId}/requirements
   * Get course requirements
   */
  getCourseRequirements: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/requirements`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId}/requirements failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/{courseId}/outcomes
   * Get learning outcomes
   */
  getLearningOutcomes: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/outcomes`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId}/outcomes failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/{courseId}/materials
   * Get course materials
   */
  getCourseMaterials: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/materials`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId}/materials failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/{courseId}/faqs
   * Get course FAQs
   */
  getCourseFAQs: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/faqs`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId}/faqs failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/{courseId}/preview
   * Get course preview
   */
  getCoursePreview: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/preview`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId}/preview failed`);
      throw err;
    }
  },

  // ============================================
  // Course Enrollment & Progress APIs
  // ============================================

  /**
   * POST /api/v1/courses/{courseId}/enroll
   * Enroll in free course
   */
  enrollCourse: async (courseId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/courses/${courseId}/enroll`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] POST /api/v1/courses/${courseId}/enroll failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/enrollments/check/{courseId}
   * Check enrollment status
   */
  checkEnrollmentStatus: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/enrollments/check/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/enrollments/check/${courseId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/dashboard/student
   * Get student dashboard overview
   */
  getStudentDashboard: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/dashboard/student');
      // Backend returns ApiResponse<StudentDashboardResponse> envelope
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/dashboard/student failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/dashboard/student/courses
   * Get student's enrolled courses
   */
  getStudentCourses: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/dashboard/student/courses');
      // Backend returns ApiResponse<DashboardCourseResponse> envelope
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/dashboard/student/courses failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/progress/courses/{courseId}
   * Get course progress
   */
  getCourseProgress: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/progress/courses/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/progress/courses/${courseId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/progress/courses/{courseId}/resume
   * Resume learning (get last accessed lecture)
   */
  resumeLearning: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/progress/courses/${courseId}/resume`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/progress/courses/${courseId}/resume failed`);
      throw err;
    }
  },

  /**
   * POST /api/v1/progress/lectures/{lectureId}/start
   * Start lecture
   */
  startLecture: async (lectureId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/progress/lectures/${lectureId}/start`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] POST /api/v1/progress/lectures/${lectureId}/start failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/progress/lectures/{lectureId}
   * Update lecture progress
   */
  updateLectureProgress: async (lectureId, progressPercentage) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/progress/lectures/${lectureId}`, {
        progressPercentage
      });
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] PATCH /api/v1/progress/lectures/${lectureId} failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/progress/lectures/{lectureId}/complete
   * Complete lecture
   */
  completeLecture: async (lectureId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/progress/lectures/${lectureId}/complete`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] PATCH /api/v1/progress/lectures/${lectureId}/complete failed`);
      throw err;
    }
  },

  // ============================================
  // Section Management APIs
  // ============================================

  /**
   * POST /api/v1/courses/{courseId}/sections
   * Create section (Instructor/Admin)
   */
  createSection: async (courseId, sectionData) => {
    try {
      const response = await axiosInstance.post(`/api/v1/courses/${courseId}/sections`, sectionData);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] POST /api/v1/courses/${courseId}/sections failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/{courseId}/sections
   * Get sections for course
   */
  getSections: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/sections`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId}/sections failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/courses/sections/{sectionId}
   * Update section (Instructor/Admin)
   */
  updateSection: async (sectionId, sectionData) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/courses/sections/${sectionId}`, sectionData);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] PATCH /api/v1/courses/sections/${sectionId} failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/courses/sections/{sectionId}
   * Delete section (Instructor/Admin)
   */
  deleteSection: async (sectionId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/courses/sections/${sectionId}`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] DELETE /api/v1/courses/sections/${sectionId} failed`);
      throw err;
    }
  },

  // ============================================
  // Lecture Management APIs
  // ============================================

  /**
   * POST /api/v1/sections/{sectionId}/lectures
   * Create lecture (Instructor/Admin)
   */
  createLecture: async (sectionId, lectureData) => {
    try {
      const response = await axiosInstance.post(`/api/v1/sections/${sectionId}/lectures`, lectureData);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] POST /api/v1/sections/${sectionId}/lectures failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/sections/{sectionId}/lectures
   * Get lectures for section
   */
  getLectures: async (sectionId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/sections/${sectionId}/lectures`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/sections/${sectionId}/lectures failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/sections/{sectionId}/lectures/{lectureId}
   * Update lecture (Instructor/Admin)
   */
  updateLecture: async (sectionId, lectureId, lectureData) => {
    try {
      const response = await axiosInstance.patch(
        `/api/v1/sections/${sectionId}/lectures/${lectureId}`,
        lectureData
      );
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] PATCH /api/v1/sections/${sectionId}/lectures/${lectureId} failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/sections/{sectionId}/lectures/{lectureId}
   * Delete lecture (Instructor/Admin)
   */
  deleteLecture: async (sectionId, lectureId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/v1/sections/${sectionId}/lectures/${lectureId}`
      );
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] DELETE /api/v1/sections/${sectionId}/lectures/${lectureId} failed`);
      throw err;
    }
  },

  // ============================================
  // Video Upload APIs
  // ============================================

  /**
   * POST /api/v1/upload/video
   * Upload video to Google Drive (Instructor/Admin)
   */
  uploadVideo: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/api/v1/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (err) {
      console.warn('[courseApi] POST /api/v1/upload/video failed');
      throw err;
    }
  },

  // ============================================
  // Banner APIs (Public)
  // ============================================

  /**
   * GET /api/v1/banners
   * Get active banners (Public)
   */
  getActiveBanners: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/banners');
      return response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/banners failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/banners/target/{targetType}
   * Get banners by target type (Public)
   */
  getBannersByTarget: async (targetType) => {
    try {
      const response = await axiosInstance.get(`/api/v1/banners/target/${targetType}`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/banners/target/${targetType} failed`);
      throw err;
    }
  },

  /**
   * POST /api/v1/banners/{id}/impression
   * Track banner impression (Public)
   */
  trackBannerImpression: async (bannerId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/banners/${bannerId}/impression`);
      return response.data;
    } catch (err) {
      // Non-critical, don't throw
      return null;
    }
  },

  /**
   * POST /api/v1/banners/{id}/click
   * Track banner click (Public)
   */
  trackBannerClick: async (bannerId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/banners/${bannerId}/click`);
      return response.data;
    } catch (err) {
      // Non-critical, don't throw
      return null;
    }
  },

  // ============================================
  // Certificate APIs
  // ============================================

  /**
   * GET /api/v1/certificates/courses/{courseId}
   * Get course certificate
   */
  getCourseCertificate: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/certificates/courses/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/certificates/courses/${courseId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/certificates/my
   * Get my certificates
   */
  getMyCertificates: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/certificates/my');
      return response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/certificates/my failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/certificates/verify/{verificationCode}
   * Verify certificate (Public)
   */
  verifyCertificate: async (verificationCode) => {
    try {
      const response = await axiosInstance.get(`/api/v1/certificates/verify/${verificationCode}`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/certificates/verify/${verificationCode} failed`);
      throw err;
    }
  },

  // ============================================
  // Course Content APIs (Learning)
  // ============================================

  /**
   * GET /api/v1/courses/{courseId}/content
   * Get course content for enrolled students
   */
  getCourseContent: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/content`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId}/content failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/courses/lectures/{lectureId}/learn
   * Get lecture detail for enrolled students
   */
  getLectureDetail: async (lectureId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/lectures/${lectureId}/learn`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/lectures/${lectureId}/learn failed`);
      throw err;
    }
  },

  // ============================================
  // Admin Banner APIs
  // ============================================

  getBanners: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/banners');
      return response.data;
    } catch (err) {
      console.warn('[courseApi] GET /api/v1/admin/banners failed');
      throw err;
    }
  },

  createBanner: async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        ctaText: data.buttonText || data.ctaText || 'Learn More',
        ctaUrl: data.actionUrl || data.ctaUrl || '/',
        displayOrder: Number(data.displayOrder || 1),
        status: (data.status || 'ACTIVE').toUpperCase(),
      };
      const response = await axiosInstance.post('/api/v1/admin/banners', payload);
      return response.data;
    } catch (err) {
      console.warn('[courseApi] POST /api/v1/admin/banners failed');
      throw err;
    }
  },

  updateBanner: async (id, data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        ctaText: data.buttonText || data.ctaText,
        ctaUrl: data.actionUrl || data.ctaUrl,
        displayOrder: data.displayOrder ? Number(data.displayOrder) : undefined,
        status: data.status ? data.status.toUpperCase() : undefined,
      };
      const response = await axiosInstance.put(`/api/v1/admin/banners/${id}`, payload);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] PUT /api/v1/admin/banners/${id} failed`);
      throw err;
    }
  },

  deleteBanner: async (id) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/admin/banners/${id}`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] DELETE /api/v1/admin/banners/${id} failed`);
      throw err;
    }
  },

  uploadBannerImage: async (formData) => {
    try {
      const response = await axiosInstance.post('/api/v1/upload/admin/banners/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      console.warn('[courseApi] POST /api/v1/upload/admin/banners/upload-image failed');
      throw err;
    }
  },

  getBannerAnalytics: async () => {
    return { data: { impressions: 0, clicks: 0, conversions: 0 } };
  },
};

export default courseApi;
