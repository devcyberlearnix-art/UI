import axiosInstance from "./axiosInstance";

/**
 * Shared Cart Synchronization Helper
 * Keeps localStorage('lms_cart') and window 'cartUpdated' event in sync across tabs and navbars.
 */
export const getSharedCart = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem("lms_cart");
      return stored ? JSON.parse(stored) : [];
    }
  } catch (err) {
    console.warn("[cartApi] Could not read shared cart", err);
  }
  return [];
};

export const syncSharedCart = (courses) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      if (Array.isArray(courses)) {
        window.localStorage.setItem("lms_cart", JSON.stringify(courses));
      } else {
        window.localStorage.removeItem("lms_cart");
      }
      window.dispatchEvent(new Event("cartUpdated"));
    }
  } catch (err) {
    console.warn("[cartApi] Could not sync shared cart", err);
  }
};

/**
 * Normalize a single cart item from the backend.
 * Ensures consistent `id`, `courseId`, `title`, `price`, `quantity`, `thumbnail`, and `instructor`.
 */
export const normalizeCartItem = (course, index = 0) => {
  const courseId = String(course?.courseId || course?.id || `course-${index}`);
  return {
    id: courseId,
    courseId: courseId,
    title: course?.title || course?.courseName || course?.name || "Untitled Course",
    price: Number(course?.price || course?.coursePrice || course?.amount || 0),
    originalPrice: course?.originalPrice ? Number(course.originalPrice) : null,
    quantity: Number(course?.quantity || 1),
    thumbnail: course?.thumbnail || course?.image || course?.imageUrl || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300",
    instructor:
      course?.instructor?.name ||
      course?.instructorName ||
      (typeof course?.instructor === "string" ? course.instructor : "Instructor"),
  };
};

/**
 * Normalize the cart response from GET /api/v1/cart.
 * Handles API envelope: { success, message, data: { cartId, totalCourses, courses: [...] } }
 * and unwrap fallbacks matching the actual API contract.
 */
export const normalizeCart = (response) => {
  if (!response) {
    return {
      cartId: null,
      totalCourses: 0,
      courses: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      couponCode: null,
    };
  }

  // Extract data payload from envelope if wrapped
  const data = response?.data && typeof response.data === "object" && !Array.isArray(response.data) && ("courses" in response.data || "cartId" in response.data)
    ? response.data
    : response;

  const rawCourses = Array.isArray(data?.courses)
    ? data.courses
    : Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  const courses = rawCourses.map((c, idx) => normalizeCartItem(c, idx));
  const subtotal = courses.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const totalCourses = typeof data?.totalCourses === "number" ? data.totalCourses : courses.length;

  return {
    cartId: data?.cartId || null,
    totalCourses,
    courses,
    subtotal,
    discount: Number(data?.discount || 0),
    tax: Number(data?.tax || 0),
    total: typeof data?.totalAmount === "number"
      ? Number(data.totalAmount)
      : typeof data?.total === "number"
      ? Number(data.total)
      : subtotal,
    couponCode: data?.couponCode || null,
  };
};

/**
 * Cart Service API Client
 * Service: Cart Service (Port 8081)
 * Gateway Path: /api/v1/cart
 */
export const cartApi = {
  /**
   * POST /api/v1/cart
   * Add course to cart
   * Requires: courseId, instructorId, courseName, price
   */
  addToCart: async (courseData) => {
    try {
      // Backend requires courseId, instructorId, courseName, and price
      const response = await axiosInstance.post('/api/v1/cart', courseData);
      try {
        const fresh = await axiosInstance.get('/api/v1/cart');
        const normalized = normalizeCart(fresh.data);
        syncSharedCart(normalized.courses);
      } catch {
        const current = getSharedCart();
        const item = normalizeCartItem(courseData);
        if (!current.some((c) => String(c.id) === String(item.id))) {
          syncSharedCart([...current, item]);
        }
      }
      return response.data;
    } catch (err) {
      console.warn('[cartApi] POST /api/v1/cart failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/cart
   * Get cart
   */
  getCart: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/cart');
      const normalized = normalizeCart(response.data);
      syncSharedCart(normalized.courses);
      return response.data;
    } catch (err) {
      console.warn('[cartApi] GET /api/v1/cart failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/cart/summary
   * Get cart summary
   */
  getCartSummary: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/cart/summary');
      return response.data;
    } catch (err) {
      console.warn('[cartApi] GET /api/v1/cart/summary failed');
      throw err;
    }
  },

  /**
   * PUT /api/v1/cart/coupon
   * Apply coupon
   */
  applyCoupon: async (couponCode) => {
    try {
      const response = await axiosInstance.put('/api/v1/cart/coupon', { couponCode });
      return response.data;
    } catch (err) {
      console.warn('[cartApi] PUT /api/v1/cart/coupon failed');
      throw err;
    }
  },

  /**
   * DELETE /api/v1/cart/coupon
   * Remove coupon
   */
  removeCoupon: async () => {
    try {
      const response = await axiosInstance.delete('/api/v1/cart/coupon');
      return response.data;
    } catch (err) {
      console.warn('[cartApi] DELETE /api/v1/cart/coupon failed');
      throw err;
    }
  },

  /**
   * DELETE /api/v1/cart/{courseId}
   * Remove course from cart
   */
  removeFromCart: async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/cart/${courseId}`);
      const remaining = getSharedCart().filter(
        (c) => String(c.id) !== String(courseId) && String(c.courseId) !== String(courseId)
      );
      syncSharedCart(remaining);
      return response.data;
    } catch (err) {
      console.warn(`[cartApi] DELETE /api/v1/cart/${courseId} failed`);
      throw err;
    }
  },

  /**
   * PUT /api/v1/cart/{itemId}
   * Update cart item quantity
   */
  updateCartQuantity: async (itemId, quantity) => {
    try {
      const response = await axiosInstance.put(`/api/v1/cart/${itemId}`, { quantity });
      return response.data;
    } catch (err) {
      console.warn(`[cartApi] PUT /api/v1/cart/${itemId} failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/cart
   * Clear cart
   */
  clearCart: async () => {
    try {
      const response = await axiosInstance.delete('/api/v1/cart');
      syncSharedCart([]);
      return response.data;
    } catch (err) {
      console.warn('[cartApi] DELETE /api/v1/cart failed');
      throw err;
    }
  },
};

export default cartApi;
