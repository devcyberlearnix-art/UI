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
      // Backend requires courseId and instructorId
      const response = await axiosInstance.post('/api/v1/wishlist', courseData);
      return response.data;
    } catch (err) {
      console.warn('[wishlistApi] POST /api/v1/wishlist failed');
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
