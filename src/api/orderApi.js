import axiosInstance from "./axiosInstance";

/**
 * Order Service API Client
 * Service: Order Service (Port 8084)
 * Gateway Path: /api/v1/orders
 */
export const orderApi = {
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
   * GET /api/v1/orders
   * Get user orders
   */
  getMyOrders: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/orders');
      return response.data;
    } catch (err) {
      console.warn('[orderApi] GET /api/v1/orders failed');
      throw err;
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
