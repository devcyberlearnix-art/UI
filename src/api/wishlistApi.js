import axiosInstance from "./axiosInstance";

/**
 * Wishlist Service API Client
 * Service: Wishlist Service (Port 8090)
 * Gateway Path: /api/v1/wishlist
 */
export const wishlistApi = {
  /**
   * POST /api/v1/wishlist
   * Add course to wishlist
   * Requires: courseId, instructorId
   */
  addToWishlist: async (courseData) => {
    try {
      let payload = courseData;
      if (typeof courseData === 'number' || typeof courseData === 'string') {
        payload = {
          courseId: courseData,
          instructorId: 'c1bfb11b-ce5a-43ab-8eb4-03a50722ce7f',
        };
      } else if (typeof courseData === 'object' && courseData !== null) {
        payload = {
          courseId: courseData.courseId || courseData.id,
          instructorId: courseData.instructorId || 'c1bfb11b-ce5a-43ab-8eb4-03a50722ce7f',
        };
      }
      const response = await axiosInstance.post('/api/v1/wishlist', payload);
      return response.data;
    } catch (err) {
      console.warn('[wishlistApi] POST /api/v1/wishlist failed', err);
      throw err;
    }
  },

  /**
   * Toggle course in wishlist
   * Checks current state and performs add or remove seamlessly
   */
  toggleWishlist: async (courseId, courseData = {}) => {
    try {
      const cId = typeof courseId === 'object' ? (courseId.id || courseId.courseId) : courseId;
      // 1. Check current wishlist state
      const checkRes = await wishlistApi.checkWishlist(cId);
      const inWishlist = Boolean(
        checkRes?.data?.inWishlist ?? checkRes?.inWishlist ?? false
      );

      if (inWishlist) {
        return await wishlistApi.removeFromWishlist(cId);
      } else {
        const instructorId =
          (typeof courseId === 'object' ? courseId.instructorId : null) ||
          courseData?.instructorId ||
          'c1bfb11b-ce5a-43ab-8eb4-03a50722ce7f';
        return await wishlistApi.addToWishlist({
          courseId: cId,
          instructorId,
        });
      }
    } catch (err) {
      console.warn(`[wishlistApi] toggleWishlist failed for course ${courseId}`, err);
      throw err;
    }
  },

  /**
   * GET /api/v1/wishlist
   * Get wishlist
   */
  getWishlist: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/wishlist');
      return response.data;
    } catch (err) {
      console.warn('[wishlistApi] GET /api/v1/wishlist failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/wishlist/check/{courseId}
   * Check if course in wishlist
   */
  checkWishlist: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/wishlist/check/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[wishlistApi] GET /api/v1/wishlist/check/${courseId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/wishlist/check/{courseId}
   * Returns exact unwrapped boolean status
   */
  checkWishlistStatus: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/wishlist/check/${courseId}`);
      const data = response.data;
      if (typeof data === 'boolean') return data;
      if (typeof data?.data?.inWishlist === 'boolean') return data.data.inWishlist;
      if (typeof data?.inWishlist === 'boolean') return data.inWishlist;
      if (typeof data?.data === 'boolean') return data.data;
      return Boolean(data?.data?.inWishlist ?? data?.inWishlist ?? false);
    } catch (err) {
      console.warn(`[wishlistApi] checkWishlistStatus for ${courseId} failed`, err);
      return false;
    }
  },

  /**
   * POST /api/v1/wishlist/{courseId}/move-to-cart
   * Move course to cart
   */
  moveToCart: async (courseId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/wishlist/${courseId}/move-to-cart`);
      return response.data;
    } catch (err) {
      console.warn(`[wishlistApi] POST /api/v1/wishlist/${courseId}/move-to-cart failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/wishlist/{courseId}
   * Remove from wishlist
   */
  removeFromWishlist: async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/wishlist/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[wishlistApi] DELETE /api/v1/wishlist/${courseId} failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/wishlist
   * Clear wishlist
   */
  clearWishlist: async () => {
    try {
      const response = await axiosInstance.delete('/api/v1/wishlist');
      return response.data;
    } catch (err) {
      console.warn('[wishlistApi] DELETE /api/v1/wishlist failed');
      throw err;
    }
  },
};

export default wishlistApi;
