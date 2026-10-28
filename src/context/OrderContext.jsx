import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi, normalizeCart, normalizeCartItem, getSharedCart, syncSharedCart } from '../api/cartApi';
import { orderApi } from '../api/orderApi';
import { useSafeAuth } from './AuthContext';
import toast from 'react-hot-toast';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const { user } = useSafeAuth();
  const queryClient = useQueryClient();

  // =========================================================================
  // 1. QUERY: Cart State with Fallback
  // =========================================================================
  const {
    data: cart = {
      cartId: null,
      totalCourses: 0,
      courses: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      couponCode: null,
    },
    isLoading: isCartLoading,
    isFetching: isCartFetching,
    refetch: refetchCart,
  } = useQuery({
    queryKey: ['cart', user?.id || 'guest'],
    queryFn: async () => {
      try {
        const response = await cartApi.getCart();
        return normalizeCart(response?.data || response);
      } catch (err) {
        // Fallback to shared localStorage cart for guest or offline mode
        const localItems = getSharedCart();
        const subtotal = localItems.reduce((acc, item) => acc + (item.price || 0), 0);
        return {
          cartId: 'local-cart',
          totalCourses: localItems.length,
          courses: localItems.map(normalizeCartItem),
          subtotal,
          discount: 0,
          tax: 0,
          total: subtotal,
          couponCode: null,
        };
      }
    },
    staleTime: 1000 * 60 * 2, // 2 minutes fresh
  });

  // Keep localStorage & other tabs synchronized
  useEffect(() => {
    if (cart?.courses) {
      syncSharedCart(cart.courses);
    }
  }, [cart]);

  // =========================================================================
  // 2. QUERY: User Orders
  // =========================================================================
  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    refetch: loadUserOrders,
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await orderApi.getMyOrders();
        const raw = response?.data || response || [];
        const userOrders = Array.isArray(raw) ? raw : raw.orders || [];
        return userOrders.map((o) => ({
          ...o,
          id: o.orderId || o.id,
          items:
            o.items ||
            (o.courseIds || []).map((cid) => ({
              courseId: cid,
              title: `Course #${cid}`,
              price: Number(o.totalAmount || 0) / (o.courseIds?.length || 1),
              quantity: 1,
            })),
        }));
      } catch (err) {
        console.warn('[OrderContext] Orders query error:', err.message);
        return [];
      }
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 3,
  });

  // =========================================================================
  // 3. MUTATION: Add to Cart with Instant Optimistic Cache Snapshot
  // =========================================================================
  const addToCartMutation = useMutation({
    mutationFn: async (courseData) => {
      const payload = {
        courseId: courseData.id || courseData.courseId,
        courseName: courseData.title || courseData.name || 'Course',
        price: Number(courseData.price || 0),
        instructorId: courseData.instructorId || 1,
      };
      return await cartApi.addToCart(payload);
    },
    onMutate: async (newCourse) => {
      // 1. Cancel ongoing outgoing queries so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['cart', user?.id || 'guest'] });

      // 2. Snapshot previous value for rollback
      const previousCart = queryClient.getQueryData(['cart', user?.id || 'guest']);

      // 3. Optimistically update TanStack Query cache
      const optimisticItem = normalizeCartItem(newCourse);
      queryClient.setQueryData(['cart', user?.id || 'guest'], (old) => {
        const existing = old?.courses || [];
        if (existing.some((c) => String(c.id) === String(optimisticItem.id))) {
          return old; // already present
        }
        const updatedCourses = [...existing, optimisticItem];
        const subtotal = updatedCourses.reduce((sum, item) => sum + (item.price || 0), 0);
        return {
          ...old,
          totalCourses: updatedCourses.length,
          courses: updatedCourses,
          subtotal,
          total: Math.max(0, subtotal - (old?.discount || 0)),
        };
      });

      return { previousCart };
    },
    onError: (err, newCourse, context) => {
      // Rollback to snapshot on failure
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', user?.id || 'guest'], context.previousCart);
      }
      toast.error(err?.response?.data?.message || 'Failed to add course to cart');
    },
    onSuccess: () => {
      toast.success('Course added to cart!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });
    },
  });

  // =========================================================================
  // 4. MUTATION: Remove from Cart with Instant Optimistic Update
  // =========================================================================
  const removeFromCartMutation = useMutation({
    mutationFn: async (courseId) => {
      return await cartApi.removeFromCart(courseId);
    },
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ['cart', user?.id || 'guest'] });
      const previousCart = queryClient.getQueryData(['cart', user?.id || 'guest']);

      // Optimistically filter item out
      queryClient.setQueryData(['cart', user?.id || 'guest'], (old) => {
        if (!old) return old;
        const updatedCourses = (old.courses || []).filter(
          (c) => String(c.id) !== String(courseId) && String(c.courseId) !== String(courseId)
        );
        const subtotal = updatedCourses.reduce((sum, item) => sum + (item.price || 0), 0);
        return {
          ...old,
          totalCourses: updatedCourses.length,
          courses: updatedCourses,
          subtotal,
          total: Math.max(0, subtotal - (old.discount || 0)),
        };
      });

      return { previousCart };
    },
    onError: (err, courseId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart', user?.id || 'guest'], context.previousCart);
      }
      toast.error('Failed to remove item from cart');
    },
    onSuccess: () => {
      toast.success('Item removed from cart');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });
    },
  });

  // =========================================================================
  // 5. MUTATION: Apply Promo Code
  // =========================================================================
  const applyCouponMutation = useMutation({
    mutationFn: async (couponCode) => {
      const result = await cartApi.applyCoupon(couponCode);
      return result;
    },
    onSuccess: (data, couponCode) => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });
      toast.success(`Coupon "${couponCode}" applied successfully!`);
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || 'Invalid or expired promo code';
      toast.error(msg);
      throw new Error(msg);
    },
  });

  // =========================================================================
  // 6. MUTATION: Remove Coupon
  // =========================================================================
  const removeCouponMutation = useMutation({
    mutationFn: async () => {
      return await cartApi.removeCoupon();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });
      toast.success('Promo code removed');
    },
    onError: () => {
      toast.error('Could not remove coupon');
    },
  });

  // =========================================================================
  // 7. MUTATION: Create Order
  // =========================================================================
  const createOrderMutation = useMutation({
    mutationFn: async (orderPayload) => {
      return await orderApi.createOrder(orderPayload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cart', user?.id || 'guest'] });
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
    },
  });

  // =========================================================================
  // Legacy Helpers & Aliases
  // =========================================================================
  const handleCancelOrder = async (orderId) => {
    try {
      await orderApi.cancelOrder(orderId);
      loadUserOrders();
      return true;
    } catch {
      return false;
    }
  };

  const handleRefundOrder = async () => true;
  const updateOrderStatus = async () => true;

  const value = useMemo(
    () => ({
      // Cart state
      cart,
      cartCount: cart?.totalCourses || cart?.courses?.length || 0,
      isCartLoading,
      isCartFetching,
      refetchCart,

      // Cart mutations
      addToCart: (course) => addToCartMutation.mutateAsync(course),
      removeFromCart: (courseId) => removeFromCartMutation.mutateAsync(courseId),
      applyCoupon: (code) => applyCouponMutation.mutateAsync(code),
      removeCoupon: () => removeCouponMutation.mutateAsync(),
      createOrder: (payload) => createOrderMutation.mutateAsync(payload),

      addToCartMutation,
      removeFromCartMutation,
      applyCouponMutation,
      removeCouponMutation,
      createOrderMutation,

      // Currency utility
      formatCurrency: (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`,

      // Orders state
      orders,
      isOrdersLoading,
      loading: isOrdersLoading,
      loadUserOrders,
      handleCancelOrder,
      handleRefundOrder,
      updateOrderStatus,
    }),
    [
      cart,
      isCartLoading,
      isCartFetching,
      orders,
      isOrdersLoading,
      addToCartMutation,
      removeFromCartMutation,
      applyCouponMutation,
      removeCouponMutation,
      createOrderMutation,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const useOrder = useOrders;

export default OrderContext;