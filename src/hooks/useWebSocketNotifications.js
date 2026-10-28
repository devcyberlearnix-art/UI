import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getStompClient } from '../utils/stompClient';
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications';
import { normalizeNotification } from '../utils/normalizers';
import { useSafeAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * ============================================================================
 * ASIVO / FD_LMS WEBSOCKET NOTIFICATION LISTENER
 * Subscribes to live WebSocket / STOMP broker topics:
 * - /topic/global-alerts
 * - /topic/audience/{ROLE}
 * Automatically updates TanStack Query notification cache & fires toast.
 * ============================================================================
 */
export function useWebSocketNotifications() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useSafeAuth();
  const role = (user?.role || user?.userRole || 'STUDENT').toUpperCase();
  const userId = user?.id || 'me';

  useEffect(() => {
    if (!isAuthenticated) return;

    const stomp = getStompClient();
    if (!stomp) return;

    stomp.connect();

    const handleIncomingAlert = (payload) => {
      if (!payload) return;

      const normalized = normalizeNotification({
        id: payload.id || `ws-${Date.now()}`,
        title: payload.title || 'Platform Notification',
        message: payload.message || payload.content || '',
        type: payload.type || 'SYSTEM',
        read: false,
        createdAt: payload.timestamp || new Date().toISOString(),
      });

      // Optimistically push into TanStack notifications cache
      const queryKey = [...NOTIFICATIONS_QUERY_KEY, userId];
      queryClient.setQueryData(queryKey, (old = []) => [normalized, ...old]);

      // Increment unread count
      const countKey = [...NOTIFICATIONS_QUERY_KEY, 'count', userId];
      queryClient.setQueryData(countKey, (old = 0) => Number(old) + 1);

      // Toast user with luxury notification
      toast(normalized.title, {
        icon: '🔔',
        style: {
          background: '#0F0F13',
          color: '#F5F5F7',
          border: '1px solid rgba(197, 168, 128, 0.2)',
          fontFamily: 'monospace',
          fontSize: '12px',
        },
      });
    };

    // 1. Subscribe to User-Specific Notification Channels
    const unsubUser = user?.id
      ? stomp.subscribe(`/user/${user.id}/queue/notifications`, (payload) => {
          handleIncomingAlert(payload);
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        })
      : () => {};

    // 2. Subscribe to Global Admin Broadcast Channels
    const unsubGlobal = stomp.subscribe('/topic/global-alerts', (payload) => {
      handleIncomingAlert(payload);
      if (payload?.title && payload?.message) {
        toast.error(`${payload.title}: ${payload.message}`, { duration: 6000 });
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // 3. Subscribe to role-specific audience channel
    const unsubAudience = stomp.subscribe(`/topic/audience/${role}`, (payload) => {
      handleIncomingAlert(payload);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    return () => {
      unsubUser();
      unsubGlobal();
      unsubAudience();
    };
  }, [isAuthenticated, role, userId, queryClient]);
}

export default useWebSocketNotifications;
