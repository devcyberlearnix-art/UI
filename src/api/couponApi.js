import axiosInstance from "./axiosInstance";

/**
 * Coupon Service API Client
 * Service: Coupon Service (Port 8082)
 * Gateway Path: /api/v1/coupons
 */
export const couponApi = {
  /**
   * GET /api/v1/coupons
   * Retrieve all coupons (Platform catalog & management)
   */
  getAllCoupons: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/coupons');
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('[couponApi] GET /api/v1/coupons failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/coupons/{couponId}
   * Get coupon details by ID
   */
  getCouponDetails: async (couponId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/coupons/${couponId}`);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[couponApi] GET /api/v1/coupons/${couponId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/coupons/validate/{code}
   * Quick validation by code, returns discount number
   */
  validateByCode: async (code) => {
    try {
      const response = await axiosInstance.get(`/api/v1/coupons/validate/${code}`);
      return response.data;
    } catch (err) {
      console.warn(`[couponApi] GET /api/v1/coupons/validate/${code} failed`);
      throw err;
    }
  },

  /**
   * POST /api/v1/coupons/validate
   * Comprehensive coupon validation with price & course context
   */
  validateCoupon: async (couponData) => {
    try {
      const response = await axiosInstance.post('/api/v1/coupons/validate', couponData);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[couponApi] POST /api/v1/coupons/validate failed');
      throw err;
    }
  },

  /**
   * POST /api/v1/coupons/best-discount
   * Auto-apply best available coupon
   */
  getBestDiscount: async (couponData) => {
    try {
      const response = await axiosInstance.post('/api/v1/coupons/best-discount', couponData);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[couponApi] POST /api/v1/coupons/best-discount failed');
      throw err;
    }
  },

  /**
   * POST /api/v1/coupons
   * Create a new coupon (Staff / Admin / Instructor)
   */
  createCoupon: async (couponData) => {
    try {
      const response = await axiosInstance.post('/api/v1/coupons', couponData);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[couponApi] POST /api/v1/coupons failed');
      throw err;
    }
  },

  /**
   * POST /api/v1/coupons/bulk
   * Bulk generate promotional campaign coupons
   */
  bulkGenerate: async (bulkData) => {
    try {
      const response = await axiosInstance.post('/api/v1/coupons/bulk', bulkData);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[couponApi] POST /api/v1/coupons/bulk failed');
      throw err;
    }
  },

  /**
   * PUT /api/v1/coupons/{couponId}
   * Update existing coupon specifications
   */
  updateCoupon: async (couponId, couponData) => {
    try {
      const response = await axiosInstance.put(`/api/v1/coupons/${couponId}`, couponData);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[couponApi] PUT /api/v1/coupons/${couponId} failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/coupons/{couponId}
   * Delete coupon
   */
  deleteCoupon: async (couponId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/coupons/${couponId}`);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[couponApi] DELETE /api/v1/coupons/${couponId} failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/coupons/{couponId}/activate
   * Activate coupon
   */
  activateCoupon: async (couponId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/coupons/${couponId}/activate`);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[couponApi] PATCH /api/v1/coupons/${couponId}/activate failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/coupons/{couponId}/deactivate
   * Deactivate coupon
   */
  deactivateCoupon: async (couponId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/coupons/${couponId}/deactivate`);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn(`[couponApi] PATCH /api/v1/coupons/${couponId}/deactivate failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/coupons/my
   * Retrieve coupons assigned to the logged-in user
   */
  getMyCoupons: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/coupons/my');
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('[couponApi] GET /api/v1/coupons/my failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/coupons/campaigns
   * Retrieve active campaign names
   */
  getCampaigns: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/coupons/campaigns');
      return response.data?.data || response.data || [];
    } catch (err) {
      console.warn('[couponApi] GET /api/v1/coupons/campaigns failed');
      throw err;
    }
  },

  /**
   * POST /api/v1/coupons/redeem
   * Redeem coupon on checkout
   */
  redeemCoupon: async (redeemData) => {
    try {
      const response = await axiosInstance.post('/api/v1/coupons/redeem', redeemData);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[couponApi] POST /api/v1/coupons/redeem failed');
      throw err;
    }
  },

  /**
   * POST /api/v1/coupons/assign-user
   * Assign targeted coupon to specific student
   */
  assignCouponToUser: async (assignData) => {
    try {
      const response = await axiosInstance.post('/api/v1/coupons/assign-user', assignData);
      return response.data?.data || response.data;
    } catch (err) {
      console.warn('[couponApi] POST /api/v1/coupons/assign-user failed');
      throw err;
    }
  },
};

export default couponApi;
