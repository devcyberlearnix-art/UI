import axiosInstance from "./axiosInstance";

/**
 * Review Service API Client
 * Service: Review Service (Port 8089)
 * Gateway Path: /api/v1/reviews
 */
export const reviewApi = {
  /**
   * POST /api/v1/reviews
   * Create course review
   */
  createReview: async (reviewData) => {
    try {
      const response = await axiosInstance.post('/api/v1/reviews', reviewData);
      return response.data;
    } catch (err) {
      console.warn('[reviewApi] POST /api/v1/reviews failed');
      throw err;
    }
  },

  addReview: async (reviewData) => {
    return reviewApi.createReview(reviewData);
  },

  /**
   * PUT /api/v1/reviews/{reviewId}
   * Update course review
   */
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axiosInstance.put(`/api/v1/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (err) {
      console.warn(`[reviewApi] PUT /api/v1/reviews/${reviewId} failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/reviews/{reviewId}
   * Delete course review
   */
  deleteReview: async (reviewId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/reviews/${reviewId}`);
      return response.data;
    } catch (err) {
      console.warn(`[reviewApi] DELETE /api/v1/reviews/${reviewId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/reviews/my/course/{courseId}
   * Get my review for course
   */
  getMyReview: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/reviews/my/course/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[reviewApi] GET /api/v1/reviews/my/course/${courseId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/reviews/course/{courseId}
   * Get course reviews (Public, paginated)
   */
  getCourseReviews: async (courseId, params = { page: 0, size: 10, sort: 'createdAt,desc' }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/reviews/course/${courseId}`, { params });
      return response.data;
    } catch (err) {
      console.warn(`[reviewApi] GET /api/v1/reviews/course/${courseId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/reviews/course/{courseId}/summary
   * Get course rating summary (Public)
   */
  getRatingSummary: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/reviews/course/${courseId}/summary`);
      return response.data;
    } catch (err) {
      console.warn(`[reviewApi] GET /api/v1/reviews/course/${courseId}/summary failed`);
      throw err;
    }
  },

  // ============================================
  // Admin Review APIs
  // ============================================

  /**
   * GET /api/v1/admin/reviews
   * Get all reviews (Admin)
   */
  getAllReviews: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/admin/reviews');
      return response.data;
    } catch (err) {
      console.warn('[reviewApi] GET /api/v1/admin/reviews failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/admin/reviews/{reviewUuid}
   * Get review by ID (Admin)
   */
  getReviewById: async (reviewUuid) => {
    try {
      const response = await axiosInstance.get(`/api/v1/admin/reviews/${reviewUuid}`);
      return response.data;
    } catch (err) {
      console.warn(`[reviewApi] GET /api/v1/admin/reviews/${reviewUuid} failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/admin/reviews/{reviewUuid}/hide
   * Hide review (Admin)
   */
  hideReview: async (reviewUuid) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/admin/reviews/${reviewUuid}/hide`);
      return response.data;
    } catch (err) {
      console.warn(`[reviewApi] PATCH /api/v1/admin/reviews/${reviewUuid}/hide failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/admin/reviews/{reviewUuid}/unhide
   * Unhide review (Admin)
   */
  unhideReview: async (reviewUuid) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/admin/reviews/${reviewUuid}/unhide`);
      return response.data;
    } catch (err) {
      console.warn(`[reviewApi] PATCH /api/v1/admin/reviews/${reviewUuid}/unhide failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/admin/reviews/{reviewUuid}
   * Delete review (Admin)
   */
  deleteReviewAdmin: async (reviewUuid) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/admin/reviews/${reviewUuid}`);
      return response.data;
    } catch (err) {
      console.warn(`[reviewApi] DELETE /api/v1/admin/reviews/${reviewUuid} failed`);
      throw err;
    }
  },
};

export default reviewApi;
