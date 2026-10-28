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
   * GET /api/v1/users/me/notifications or /api/v1/notifications/user/{userId}
   * Get user-specific notifications
   */
  getNotifications: async (userId = null) => {
    try {
      try {
        const response = await axiosInstance.get('/api/v1/users/me/notifications');
        return response.data;
      } catch (meErr) {
        if (userId) {
          const response = await axiosInstance.get(`/api/v1/notifications/user/${userId}`);
          return response.data;
        }
        throw meErr;
      }
    } catch (err) {
      console.warn(`[notificationApi] GET notifications failed:`, err?.message);
      return { data: [] };
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
      return notificationApi.getNotifications(userId);
    }
  },

  /**
   * GET /api/v1/users/me/unread or /api/v1/notifications/user/{userId}
   * Get unread notifications for a user
   */
  getUnreadNotifications: async (userId = null) => {
    try {
      try {
        const response = await axiosInstance.get('/api/v1/users/me/unread');
        return response.data;
      } catch (meErr) {
        const response = await notificationApi.getNotifications(userId);
        const allNotifications = response.data?.data || response.data || [];
        return Array.isArray(allNotifications) ? allNotifications.filter(n => !n.read && n.status !== 'READ') : [];
      }
    } catch (err) {
      console.warn(`[notificationApi] GET unread notifications failed`);
      return [];
    }
  },

  /**
   * Get unread count via /api/v1/users/me/count or derived
   */
  getUnreadCount: async (userId = null) => {
    try {
      try {
        const response = await axiosInstance.get('/api/v1/users/me/count');
        const count = response.data?.data?.count ?? response.data?.count ?? (typeof response.data === 'number' ? response.data : null);
        if (count !== null) return { data: { count } };
      } catch (countErr) {
        // Fallback
      }
      const unread = await notificationApi.getUnreadNotifications(userId);
      const list = unread?.data || unread || [];
      return { data: { count: Array.isArray(list) ? list.length : 0 } };
    } catch (err) {
      console.warn('[notificationApi] getUnreadCount failed');
      return { data: { count: 0 } };
    }
  },

  /**
   * PUT /api/v1/users/me/read/{id} or /api/v1/notifications/{id}/read
   * Mark notification as read
   */
  markAsRead: async (notificationId) => {
    try {
      try {
        const response = await axiosInstance.put(`/api/v1/users/me/read/${notificationId}`);
        return response.data;
      } catch (meErr) {
        const response = await axiosInstance.put(`/api/v1/notifications/${notificationId}/read`);
        return response.data;
      }
    } catch (err) {
      console.warn(`[notificationApi] markAsRead failed:`, err?.message);
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
   * PUT /api/v1/users/me/read-all or POST /api/v1/notifications/mark-all-read
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    try {
      try {
        const response = await axiosInstance.put('/api/v1/users/me/read-all');
        return response.data;
      } catch (meErr) {
        const response = await axiosInstance.post('/api/v1/notifications/mark-all-read');
        return response.data;
      }
    } catch (err) {
      console.warn('[notificationApi] markAllAsRead failed:', err?.message);
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
