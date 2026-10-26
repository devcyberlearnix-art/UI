import axiosInstance from "./axiosInstance";

/**
 * Coupon Service API Client
 * Service: Coupon Service (Port 8082)
 * Gateway Path: /api/v1/coupons
 */
export const couponApi = {
  /**
   * POST /api/v1/coupons/validate
   * Validate coupon
   */
  validateCoupon: async (couponData) => {
    try {
      const response = await axiosInstance.post('/api/v1/coupons/validate', couponData);
      return response.data;
    } catch (err) {
      console.warn('[couponApi] POST /api/v1/coupons/validate failed');
      throw err;
    }
  },

  /**
   * POST /api/v1/coupons/best-discount
   * Get best discount (auto-apply)
   */
  getBestDiscount: async (couponData) => {
    try {
      const response = await axiosInstance.post('/api/v1/coupons/best-discount', couponData);
      return response.data;
    } catch (err) {
      console.warn('[couponApi] POST /api/v1/coupons/best-discount failed');
      throw err;
    }
  },
};

export default couponApi;
