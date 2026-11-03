import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi, getSharedCart, syncSharedCart, normalizeCartItem } from '../api/cartApi';
import { normalizeCart } from '../utils/normalizers';
import { useSafeAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const CART_QUERY_KEY = ['cart'];

/**
 * Hook: Retrieve live shopping cart with cache governance
 * Authentication-aware: Guests load from shared localStorage with 0 network calls.
 */
export function useCart() {
  const { user, isAuthenticated, loading: authLoading } = useSafeAuth();
  const isAuth = Boolean(!authLoading && isAuthenticated && user?.id && user?.id !== 'guest');
  const userId = isAuth ? user.id : 'guest';
  const addToCartMutation = useAddToCart();

  // Query only runs when authenticated
  const query = useQuery({
    queryKey: [...CART_QUERY_KEY, userId],
    queryFn: async () => {
      const response = await cartApi.getCart();
      return normalizeCart(response);
    },
    enabled: isAuth,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Local guest cart state
  const [localCart, setLocalCart] = useState(() => {
    if (isAuth) return null;
    const items = getSharedCart();
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    return {
      cartId: 'guest-cart',
      totalCourses: items.length,
      courses: items.map(normalizeCartItem),
      subtotal,
      discount: 0,
      tax: 0,
      total: subtotal,
      couponCode: null,
    };
  });

  // Keep guest cart synchronized when storage or events fire
  useEffect(() => {
    if (isAuth) return;
    const updateLocal = () => {
      const items = getSharedCart();
      const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
      setLocalCart({
        cartId: 'guest-cart',
        totalCourses: items.length,
        courses: items.map(normalizeCartItem),
        subtotal,
        discount: 0,
        tax: 0,
        total: subtotal,
        couponCode: null,
      });
    };
    window.addEventListener('cartUpdated', updateLocal);
    window.addEventListener('storage', updateLocal);
    return () => {
      window.removeEventListener('cartUpdated', updateLocal);
      window.removeEventListener('storage', updateLocal);
    };
  }, [isAuth]);

  return {
    ...query,
    cart: isAuth ? query.data : localCart,
    addToCart: addToCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
  };
}

/**
 * Hook: Add to Cart Mutation supporting both Guest and Authenticated users
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading: authLoading } = useSafeAuth();
  const isAuth = Boolean(!authLoading && isAuthenticated && user?.id && user?.id !== 'guest');
  const queryKey = [...CART_QUERY_KEY, isAuth ? user.id : 'guest'];

  return useMutation({
    mutationFn: async (course) => {
      const payload = {
        courseId: course.id || course.courseId,
        courseName: course.title || course.name || 'Curriculum',
        price: Number(course.price || 0),
        instructorId: course.instructorId || 1,
      };

      if (!isAuth) {
        const current = getSharedCart();
        const item = normalizeCartItem(payload);
        if (!current.some((c) => String(c.id) === String(item.id))) {
          syncSharedCart([...current, item]);
        }
        return { success: true, message: 'Added to cart', data: payload };
      }

      return await cartApi.addToCart(payload);
    },
    onMutate: async (newCourse) => {
      if (!isAuth) return;
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
      if (isAuth) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}

/**
 * Hook: Remove from Cart Mutation supporting both Guest and Authenticated users
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading: authLoading } = useSafeAuth();
  const isAuth = Boolean(!authLoading && isAuthenticated && user?.id && user?.id !== 'guest');
  const queryKey = [...CART_QUERY_KEY, isAuth ? user.id : 'guest'];

  return useMutation({
    mutationFn: async (courseId) => {
      if (!isAuth) {
        const current = getSharedCart();
        const updated = current.filter((c) => String(c.id || c.courseId) !== String(courseId));
        syncSharedCart(updated);
        return { success: true };
      }
      return await cartApi.removeFromCart(courseId);
    },
    onMutate: async (courseId) => {
      if (!isAuth) return;
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
      toast.error(err?.response?.data?.message || 'Failed to remove course from cart');
    },
    onSuccess: () => {
      toast.success('Course removed from cart');
    },
    onSettled: () => {
      if (isAuth) {
        queryClient.invalidateQueries({ queryKey });
      }
    },
  });
}
