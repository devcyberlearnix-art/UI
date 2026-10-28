import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { normalizeNotification, unwrapArray } from '../utils/normalizers';
import toast from 'react-hot-toast';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

/**
 * ============================================================================
 * ASIVO / FD_LMS NOTIFICATION TELEMETRY HOOK ECOSYSTEM
 * Real-Time Telemetry Polling, Optimistic Mutation Handlers & Contract Alignment
 * Microservice: Notification Service (Port 8093 via Gateway 8080)
 * ============================================================================
 */

/**
 * Hook: Retrieve User Notifications with Autonomous Polling Telemetry
 */
export function useNotifications(userId = null) {
  const queryClient = useQueryClient();
  const queryKey = [...NOTIFICATIONS_QUERY_KEY, userId || 'me'];

  const notificationsQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await notificationApi.getNotifications(userId);
      const rawList = unwrapArray(response, ['notifications', 'content', 'items', 'data']);
      return rawList.map((item, idx) => normalizeNotification(item, idx));
    },
    refetchInterval: 15000, // Dynamic telemetry polling every 15s
    staleTime: 1000 * 5,
    gcTime: 1000 * 60 * 15,
  });

  const unreadCountQuery = useQuery({
    queryKey: [...NOTIFICATIONS_QUERY_KEY, 'count', userId || 'me'],
    queryFn: async () => {
      const res = await notificationApi.getUnreadCount(userId);
      return Number(res?.data?.count ?? 0);
    },
    refetchInterval: 15000,
    staleTime: 1000 * 5,
  });

  const unreadCount = unreadCountQuery.data ?? (
    Array.isArray(notificationsQuery.data)
      ? notificationsQuery.data.filter(n => !n.read && n.status !== 'READ').length
      : 0
  );

  return {
    notifications: notificationsQuery.data || [],
    unreadCount,
    isLoading: notificationsQuery.isLoading,
    isFetching: notificationsQuery.isFetching,
    error: notificationsQuery.error,
    refetch: notificationsQuery.refetch,
  };
}

/**
 * Hook: Mark Single Notification as Read with Optimistic Cache Snapshot
 */
export function useMarkNotificationAsRead(userId = null) {
  const queryClient = useQueryClient();
  const queryKey = [...NOTIFICATIONS_QUERY_KEY, userId || 'me'];
  const countKey = [...NOTIFICATIONS_QUERY_KEY, 'count', userId || 'me'];

  return useMutation({
    mutationFn: async (notificationId) => {
      return await notificationApi.markAsRead(notificationId);
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: countKey });

      const previousNotifications = queryClient.getQueryData(queryKey);
      const previousCount = queryClient.getQueryData(countKey);

      // Optimistically morph notification status
      queryClient.setQueryData(queryKey, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((n) =>
          String(n.id) === String(notificationId) || String(n.notificationId) === String(notificationId)
            ? { ...n, read: true, status: 'READ' }
            : n
        );
      });

      // Optimistically decrement unread count
      queryClient.setQueryData(countKey, (old) => Math.max(0, Number(old || 1) - 1));

      return { previousNotifications, previousCount };
    },
    onError: (err, notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKey, context.previousNotifications);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(countKey, context.previousCount);
      }
      toast.error('Failed to sync notification state');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: countKey });
    },
  });
}

/**
 * Hook: Mark All Notifications as Read with Immediate Cache Mutation
 */
export function useMarkAllNotificationsAsRead(userId = null) {
  const queryClient = useQueryClient();
  const queryKey = [...NOTIFICATIONS_QUERY_KEY, userId || 'me'];
  const countKey = [...NOTIFICATIONS_QUERY_KEY, 'count', userId || 'me'];

  return useMutation({
    mutationFn: async () => {
      return await notificationApi.markAllAsRead();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: countKey });

      const previousNotifications = queryClient.getQueryData(queryKey);
      const previousCount = queryClient.getQueryData(countKey);

      // Optimistically mark all read
      queryClient.setQueryData(queryKey, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((n) => ({ ...n, read: true, status: 'READ' }));
      });

      queryClient.setQueryData(countKey, 0);

      return { previousNotifications, previousCount };
    },
    onError: (err, vars, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKey, context.previousNotifications);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(countKey, context.previousCount);
      }
      toast.error('Failed to clear unread notifications');
    },
    onSuccess: () => {
      toast.success('All notifications marked as read', { icon: '✓' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: countKey });
    },
  });
}

/**
 * Hook: Notification Preferences
 */
export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const preferencesQuery = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: async () => {
      const res = await notificationApi.getPreferences();
      return res?.data || res || {};
    },
    staleTime: 1000 * 60 * 10,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs) => {
      return await notificationApi.updatePreferences(prefs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'preferences'] });
      toast.success('Notification preferences updated successfully');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update preferences');
    },
  });

  return {
    preferences: preferencesQuery.data,
    isLoading: preferencesQuery.isLoading,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdating: updatePreferencesMutation.isPending,
  };
}
