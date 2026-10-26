import axiosInstance from "./axiosInstance";

/**
 * Payment Service API Client
 * Service: Payment Service (Port 8085)
 * Gateway Path: /api/v1/payments
 */
export const paymentApi = {
  /**
   * POST /api/v1/payments/create
   * Create payment (Public - no auth)
   */
  createPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post('/api/v1/payments/create', paymentData);
      return response.data;
    } catch (err) {
      console.warn('[paymentApi] POST /api/v1/payments/create failed');
      throw err;
    }
  },

  /**
   * POST /api/v1/payments/verify
   * Verify payment (Public)
   */
  verifyPayment: async (txnId) => {
    try {
      const response = await axiosInstance.post('/api/v1/payments/verify', { txnId });
      return response.data;
    } catch (err) {
      console.warn('[paymentApi] POST /api/v1/payments/verify failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/payments/{txnId}/invoice
   * Get invoice (PDF) (Public)
   */
  getInvoicePDF: async (txnId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/payments/${txnId}/invoice`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (err) {
      console.warn(`[paymentApi] GET /api/v1/payments/${txnId}/invoice failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/payments/{txnId}/invoice-json
   * Get invoice (JSON) (Public)
   */
  getInvoiceJSON: async (txnId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/payments/${txnId}/invoice-json`);
      return response.data;
    } catch (err) {
      console.warn(`[paymentApi] GET /api/v1/payments/${txnId}/invoice-json failed`);
      throw err;
    }
  },
};

export default paymentApi;
