import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import { adminApi } from '../api/adminApi';
import { normalizeOrder, unwrapArray } from '../utils/normalizers';
import { useSafeAuth } from '../context/AuthContext';
import { CART_QUERY_KEY } from './useCart';
import toast from 'react-hot-toast';

export const ORDERS_QUERY_KEY = ['orders'];

/**
 * Hook: Retrieve User Orders with Defensive Normalization
 */
export function useUserOrders() {
  const { user } = useSafeAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await orderApi.getMyOrders();
      const rawList = unwrapArray(response, ['orders', 'items', 'content']);
      return rawList.map(normalizeOrder);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook: Retrieve Single Order Details by ID
 */
export function useOrderDetails(orderId) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, 'detail', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await orderApi.getOrderById(orderId);
      return normalizeOrder(response?.data || response);
    },
    enabled: Boolean(orderId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook: Place Order Mutation with Cache Refresh
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();

  return useMutation({
    mutationFn: async (orderPayload) => {
      return await orderApi.createOrder(orderPayload);
    },
    onSuccess: (data) => {
      // Invalidate cart and orders queries
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ORDERS_QUERY_KEY, 'user', user?.id] });
      toast.success('Order placed successfully!');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    },
  });
}

/**
 * Hook: Cancel Pending Order Mutation
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();

  return useMutation({
    mutationFn: async (orderId) => {
      return await orderApi.cancelOrder(orderId);
    },
    onMutate: async (orderId) => {
      const queryKey = [...ORDERS_QUERY_KEY, 'user', user?.id];
      await queryClient.cancelQueries({ queryKey });
      const previousOrders = queryClient.getQueryData(queryKey);

      // Optimistically update order status to CANCELLED
      queryClient.setQueryData(queryKey, (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((ord) =>
          ord.id === orderId ? { ...ord, status: 'CANCELLED' } : ord
        );
      });

      return { previousOrders, queryKey };
    },
    onError: (err, orderId, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(context.queryKey, context.previousOrders);
      }
      toast.error('Could not cancel order');
    },
    onSuccess: () => {
      toast.success('Order cancelled successfully');
    },
    onSettled: (data, err, orderId, context) => {
      if (context?.queryKey) {
        queryClient.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}

/**
 * Hook: Retrieve All Platform Orders (Admin View)
 */
export function useAdminOrders(params = { page: 0, size: 20 }) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, 'admin', params],
    queryFn: async () => {
      // Try orderApi.getAllOrders first then fallback to adminApi.getOrders
      try {
        const response = await orderApi.getAllOrders();
        const rawList = unwrapArray(response, ['orders', 'items', 'content']);
        return rawList.map(normalizeOrder);
      } catch {
        const response = await adminApi.getOrders(params);
        const rawList = unwrapArray(response, ['orders', 'items', 'content']);
        return rawList.map(normalizeOrder);
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}
