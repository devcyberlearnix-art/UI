import axiosInstance from "./axiosInstance";

/**
 * Order Service API Client
 * Service: Order Service (Port 8084)
 * Gateway Path: /api/v1/orders
 */
export const orderApi = {
  /**
   * POST /api/v1/orders/stage
   * Stage order from cart queue before checkout payment
   */
  stageOrder: async (stagePayload) => {
    try {
      const response = await axiosInstance.post('/api/v1/orders/stage', stagePayload);
      return response.data;
    } catch (err) {
      console.warn('[orderApi] POST /api/v1/orders/stage fallback handling', err?.message);
      if (err.response?.status === 404 || err.response?.status === 405) {
        const fallbackRes = await axiosInstance.post('/api/v1/orders/create', {
          ...stagePayload,
          status: 'PENDING_PAYMENT',
        });
        return fallbackRes.data;
      }
      throw err;
    }
  },

  /**
   * GET /api/v1/orders/staged/{orderId}
   * Get staged order verification details
   */
  getStagedOrder: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/orders/staged/${orderId}`);
      return response.data;
    } catch (err) {
      console.warn(`[orderApi] GET /api/v1/orders/staged/${orderId} fallback handling`, err?.message);
      if (err.response?.status === 404 || err.response?.status === 405) {
        const fallbackRes = await axiosInstance.get(`/api/v1/orders/${orderId}`);
        return fallbackRes.data;
      }
      throw err;
    }
  },

  /**
   * POST /api/v1/orders/create
   * Create order
   */
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post('/api/v1/orders/create', orderData);
      return response.data;
    } catch (err) {
      console.warn('[orderApi] POST /api/v1/orders/create failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/orders/{orderId}
   * Get order by ID
   */
  getOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/orders/${orderId}`);
      return response.data;
    } catch (err) {
      console.warn(`[orderApi] GET /api/v1/orders/${orderId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/orders/my-orders
   * Get user orders (Standardized historical tracking ledger)
   */
  getMyOrders: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/orders/my-orders');
      return response.data;
    } catch (err) {
      console.warn('[orderApi] GET /api/v1/orders/my-orders fallback to /api/v1/orders');
      const fallbackResponse = await axiosInstance.get('/api/v1/orders');
      return fallbackResponse.data;
    }
  },

  /**
   * GET /api/v1/orders/admin
   * Get all orders (Admin)
   */
  getAllOrders: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/orders/admin');
      return response.data;
    } catch (err) {
      console.warn('[orderApi] GET /api/v1/orders/admin failed');
      throw err;
    }
  },

  /**
   * DELETE /api/v1/orders/{orderId}/cancel
   * Cancel order
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/orders/${orderId}/cancel`);
      return response.data;
    } catch (err) {
      console.warn(`[orderApi] DELETE /api/v1/orders/${orderId}/cancel failed`);
      throw err;
    }
  },
};

export default orderApi;
