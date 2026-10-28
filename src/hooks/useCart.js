import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';
import { normalizeCart } from '../utils/normalizers';
import { useSafeAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const CART_QUERY_KEY = ['cart'];

/**
 * Hook: Retrieve live shopping cart with cache governance
 */
export function useCart() {
  const { user } = useSafeAuth();
  const userId = user?.id || 'guest';
  const addToCartMutation = useAddToCart();

  const query = useQuery({
    queryKey: [...CART_QUERY_KEY, userId],
    queryFn: async () => {
      const response = await cartApi.getCart();
      return normalizeCart(response);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  return {
    ...query,
    cart: query.data,
    addToCart: addToCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
  };
}

/**
 * Hook: Optimistic Add to Cart Mutation with Snapshot Rollback
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const queryKey = [...CART_QUERY_KEY, user?.id || 'guest'];

  return useMutation({
    mutationFn: async (course) => {
      const payload = {
        courseId: course.id || course.courseId,
        courseName: course.title || course.name || 'Curriculum',
        price: Number(course.price || 0),
        instructorId: course.instructorId || 1,
      };
      return await cartApi.addToCart(payload);
    },
    onMutate: async (newCourse) => {
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData(queryKey);

      const optimisticItem = {
        id: String(newCourse.id || newCourse.courseId),
        courseId: String(newCourse.id || newCourse.courseId),
        title: newCourse.title || newCourse.name || 'Curriculum',
        price: Number(newCourse.price || 0),
        quantity: 1,
        thumbnail: newCourse.thumbnail || newCourse.image || null,
        instructor: newCourse.instructor || 'Faculty Lead',
      };

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const existing = old.courses || [];
        if (existing.some((c) => String(c.id) === String(optimisticItem.id))) {
          return old;
        }
        const updatedCourses = [...existing, optimisticItem];
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
    onError: (err, newCourse, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(queryKey, context.previousCart);
      }
      toast.error(err?.response?.data?.message || 'Failed to add course to cart');
    },
    onSuccess: () => {
      toast.success('Course added to cart');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Hook: Optimistic Remove from Cart Mutation with Snapshot Rollback
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const queryKey = [...CART_QUERY_KEY, user?.id || 'guest'];

  return useMutation({
    mutationFn: async (courseId) => {
      return await cartApi.removeFromCart(courseId);
    },
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
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
        queryClient.setQueryData(queryKey, context.previousCart);
      }
      toast.error('Failed to sync cart modification');
    },
    onSuccess: () => {
      toast.success('Course removed from cart');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Hook: Coupon Application & Invalidation
 */
export function useApplyCoupon() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const queryKey = [...CART_QUERY_KEY, user?.id || 'guest'];

  return useMutation({
    mutationFn: async (couponCode) => {
      return await cartApi.applyCoupon(couponCode);
    },
    onSuccess: (data, code) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`Coupon "${code}" applied successfully`);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Invalid or expired promo code');
    },
  });
}

export function useRemoveCoupon() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const queryKey = [...CART_QUERY_KEY, user?.id || 'guest'];

  return useMutation({
    mutationFn: async () => {
      return await cartApi.removeCoupon();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Promo code removed');
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const queryKey = [...CART_QUERY_KEY, user?.id || 'guest'];

  return useMutation({
    mutationFn: async () => {
      return await cartApi.clearCart();
    },
    onSuccess: () => {
      queryClient.setQueryData(queryKey, {
        cartId: null,
        totalCourses: 0,
        courses: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        couponCode: null,
      });
    },
  });
}
