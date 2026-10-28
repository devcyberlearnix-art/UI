import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../api/studentApi';
import { authApi } from '../api/authApi';
import { normalizeUserProfile, normalizeSession, unwrapArray } from '../utils/normalizers';
import { useSafeAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const USER_PROFILE_KEY = ['userProfile'];
export const USER_SESSIONS_KEY = ['userSessions'];

/**
 * Hook: Retrieve User Profile with defensive unwrapping
 */
export function useUserProfile() {
  const { user } = useSafeAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: [...USER_PROFILE_KEY, userId],
    queryFn: async () => {
      const response = await studentApi.getProfile();
      return normalizeUserProfile(response);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook: Retrieve Multi-Device Hardware Sessions
 */
export function useUserSessions() {
  const { user } = useSafeAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: [...USER_SESSIONS_KEY, userId],
    queryFn: async () => {
      try {
        const response = await authApi.listSessions();
        const rawList = unwrapArray(response, ['sessions', 'data', 'items']);
        return rawList.map(normalizeSession);
      } catch (err) {
        console.warn('[useUserSessions] listSessions fallback');
        return [
          {
            id: 'current-sess',
            device: 'Current Active Node (Hardware Session)',
            ip: '127.0.0.1',
            lastActive: 'Active Now',
            isCurrent: true,
          },
        ];
      }
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 15,
  });
}

/**
 * Hook: Update User Profile Mutation with Optimistic Snapshot
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const queryKey = [...USER_PROFILE_KEY, user?.id];

  return useMutation({
    mutationFn: async (profilePayload) => {
      return await studentApi.updateProfile(profilePayload);
    },
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => ({
        ...old,
        ...newProfile,
      }));

      return { previous };
    },
    onError: (err, newProfile, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    },
    onSuccess: () => {
      toast.success('Identity profile persisted to ledger');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Hook: Revoke Device Session Mutation
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const queryKey = [...USER_SESSIONS_KEY, user?.id];

  return useMutation({
    mutationFn: async (sessionId) => {
      return await authApi.logoutSession(sessionId);
    },
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!Array.isArray(old)) return old;
        return old.filter((s) => s.id !== sessionId);
      });

      return { previous };
    },
    onError: (err, sessionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error('Failed to revoke session');
    },
    onSuccess: () => {
      toast.success('Hardware device session terminated');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
