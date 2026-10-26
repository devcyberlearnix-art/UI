import axiosInstance from "./axiosInstance";

/**
 * Live Class API Client
 * Service: Course Service (Port 8083)
 * Gateway Path: /api/v1/live-classes
 */
export const liveClassApi = {
  // ============================================
  // Live Class Management (Instructor/Admin)
  // ============================================

  /**
   * POST /api/v1/live-classes
   * Create live class
   */
  createLiveClass: async (liveClassData) => {
    try {
      const response = await axiosInstance.post('/api/v1/live-classes', liveClassData);
      return response.data;
    } catch (err) {
      console.warn('[liveClassApi] POST /api/v1/live-classes failed');
      throw err;
    }
  },

  /**
   * PUT /api/v1/live-classes/{liveClassId}
   * Update live class
   */
  updateLiveClass: async (liveClassId, liveClassData) => {
    try {
      const response = await axiosInstance.put(`/api/v1/live-classes/${liveClassId}`, liveClassData);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] PUT /api/v1/live-classes/${liveClassId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/live-classes/{liveClassId}
   * Get live class by ID
   */
  getLiveClassById: async (liveClassId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/live-classes/${liveClassId}`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] GET /api/v1/live-classes/${liveClassId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/live-classes/course/{courseId}
   * Get live classes by course
   */
  getLiveClassesByCourse: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/live-classes/course/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] GET /api/v1/live-classes/course/${courseId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/live-classes/section/{sectionId}
   * Get live classes by section
   */
  getLiveClassesBySection: async (sectionId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/live-classes/section/${sectionId}`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] GET /api/v1/live-classes/section/${sectionId} failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/live-classes/{liveClassId}/start
   * Start live class
   */
  startLiveClass: async (liveClassId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/live-classes/${liveClassId}/start`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] PATCH /api/v1/live-classes/${liveClassId}/start failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/live-classes/{liveClassId}/complete
   * Complete live class
   */
  completeLiveClass: async (liveClassId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/live-classes/${liveClassId}/complete`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] PATCH /api/v1/live-classes/${liveClassId}/complete failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/live-classes/{liveClassId}/cancel
   * Cancel live class
   */
  cancelLiveClass: async (liveClassId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/live-classes/${liveClassId}/cancel`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] PATCH /api/v1/live-classes/${liveClassId}/cancel failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/live-classes/{liveClassId}
   * Delete live class
   */
  deleteLiveClass: async (liveClassId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/live-classes/${liveClassId}`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] DELETE /api/v1/live-classes/${liveClassId} failed`);
      throw err;
    }
  },

  // ============================================
  // Live Class Participation (Student/Instructor)
  // ============================================

  /**
   * GET /api/v1/live-classes/course/{courseId}/upcoming
   * Get upcoming live classes
   */
  getUpcomingLiveClasses: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/live-classes/course/${courseId}/upcoming`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] GET /api/v1/live-classes/course/${courseId}/upcoming failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/live-classes/{liveClassId}/join
   * Join live class
   */
  joinLiveClass: async (liveClassId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/live-classes/${liveClassId}/join`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] GET /api/v1/live-classes/${liveClassId}/join failed`);
      throw err;
    }
  },

  // ============================================
  // Attendance APIs
  // ============================================

  /**
   * POST /api/v1/live-classes/{liveClassId}/attendance/join
   * Join live class (attendance tracking)
   */
  joinAttendance: async (liveClassId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/live-classes/${liveClassId}/attendance/join`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] POST /api/v1/live-classes/${liveClassId}/attendance/join failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/live-classes/{liveClassId}/attendance/leave
   * Leave live class
   */
  leaveAttendance: async (liveClassId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/live-classes/${liveClassId}/attendance/leave`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] PATCH /api/v1/live-classes/${liveClassId}/attendance/leave failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/live-classes/{liveClassId}/attendance/me
   * Get my attendance
   */
  getMyAttendance: async (liveClassId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/live-classes/${liveClassId}/attendance/me`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] GET /api/v1/live-classes/${liveClassId}/attendance/me failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/live-classes/{liveClassId}/attendance
   * Get all attendance (Instructor)
   */
  getAllAttendance: async (liveClassId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/live-classes/${liveClassId}/attendance`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] GET /api/v1/live-classes/${liveClassId}/attendance failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/live-classes/{liveClassId}/attendance/summary
   * Get attendance summary (Instructor)
   */
  getAttendanceSummary: async (liveClassId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/live-classes/${liveClassId}/attendance/summary`);
      return response.data;
    } catch (err) {
      console.warn(`[liveClassApi] GET /api/v1/live-classes/${liveClassId}/attendance/summary failed`);
      throw err;
    }
  },
};

export default liveClassApi;
