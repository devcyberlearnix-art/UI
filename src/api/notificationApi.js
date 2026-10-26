import axiosInstance from "./axiosInstance";

/**
 * Notification Service API Client
 * Service: Notification Service (Port 8093)
 * Gateway Path: /api/v1/notifications, /api/v1/preferences
 */
export const notificationApi = {
  // ============================================
  // Notification Management APIs
  // ============================================

  /**
   * GET /api/v1/notifications/user/{userId}
   * Get user-specific notifications
   */
  getNotifications: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/notifications/user/${userId}`);
      return response.data;
    } catch (err) {
      console.warn(`[notificationApi] GET /api/v1/notifications/user/${userId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/notifications/user/{userId}/combined
   * Get combined notifications (all + unread) for a user
   */
  getCombinedNotifications: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/notifications/user/${userId}/combined`);
      return response.data;
    } catch (err) {
      console.warn(`[notificationApi] GET /api/v1/notifications/user/${userId}/combined failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/notifications/user/{userId}/unread
   * Get unread notifications for a user
   */
  getUnreadNotifications: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/notifications/user/${userId}`);
      const allNotifications = response.data?.data || response.data || [];
      return allNotifications.filter(n => n.status !== 'READ');
    } catch (err) {
      console.warn(`[notificationApi] GET /api/v1/notifications/user/${userId}/unread failed`);
      throw err;
    }
  },

  /**
   * Get unread count (helper method)
   */
  getUnreadCount: async (userId) => {
    try {
      const unread = await notificationApi.getUnreadNotifications(userId);
      return { data: { count: unread.length } };
    } catch (err) {
      console.warn('[notificationApi] getUnreadCount failed');
      return { data: { count: 0 } };
    }
  },

  /**
   * PUT /api/v1/notifications/{id}/read
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await axiosInstance.put(`/api/v1/notifications/${notificationId}/read`);
      return response.data;
    } catch (err) {
      console.warn(`[notificationApi] PUT /api/v1/notifications/${notificationId}/read failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/notifications/{id}
   * Delete notification
   */
  deleteNotification: async (notificationId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/notifications/${notificationId}`);
      return response.data;
    } catch (err) {
      console.warn(`[notificationApi] DELETE /api/v1/notifications/${notificationId} failed`);
      throw err;
    }
  },

  /**
   * POST /api/v1/notifications/mark-all-read
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      const response = await axiosInstance.post('/api/v1/notifications/mark-all-read');
      return response.data;
    } catch (err) {
      console.warn('[notificationApi] POST /api/v1/notifications/mark-all-read failed');
      throw err;
    }
  },

  // ============================================
  // Device Token APIs (Push Notifications)
  // ============================================

  /**
   * POST /api/v1/notifications/device-token
   * Register device token for push notifications
   */
  registerDeviceToken: async (deviceToken) => {
    try {
      const response = await axiosInstance.post('/api/v1/notifications/device-token', {
        deviceToken
      });
      return response.data;
    } catch (err) {
      console.warn('[notificationApi] POST /api/v1/notifications/device-token failed');
      throw err;
    }
  },

  // ============================================
  // Notification Preference APIs
  // ============================================

  /**
   * GET /api/v1/preferences
   * Get notification preferences
   */
  getPreferences: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/preferences');
      return response.data;
    } catch (err) {
      console.warn('[notificationApi] GET /api/v1/preferences failed');
      throw err;
    }
  },

  /**
   * PUT /api/v1/preferences
   * Update notification preferences
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await axiosInstance.put('/api/v1/preferences', preferences);
      return response.data;
    } catch (err) {
      console.warn('[notificationApi] PUT /api/v1/preferences failed');
      throw err;
    }
  },
};

export default notificationApi;
