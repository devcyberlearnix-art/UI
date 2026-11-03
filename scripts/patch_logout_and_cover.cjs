const fs = require('fs');
const path = require('path');

const uiSrc = path.join(__dirname, '..', 'src');

// 1. Patch axiosInstance.js
const axiosPath = path.join(uiSrc, 'api', 'axiosInstance.js');
let axiosContent = fs.readFileSync(axiosPath, 'utf8');

const oldAxiosTarget = `      const isRefreshEndpoint = config?.url?.includes('/auth/refresh');

      // Attempt token refresh on 401 for protected endpoints
      if (status === 401 && !isPublicAuthCall && !isRefreshEndpoint) {`;

const newAxiosTarget = `      const isRefreshEndpoint = config?.url?.includes('/auth/refresh');
      const hasRefreshToken = Boolean(
        localStorage.getItem('refresh_token') ||
        sessionStorage.getItem('refresh_token')
      );

      // Attempt token refresh on 401 for protected endpoints ONLY if a refresh token exists
      if (status === 401 && !isPublicAuthCall && !isRefreshEndpoint && hasRefreshToken) {`;

if (axiosContent.includes(oldAxiosTarget)) {
  axiosContent = axiosContent.replace(oldAxiosTarget, newAxiosTarget);
  fs.writeFileSync(axiosPath, axiosContent, 'utf8');
  console.log('✅ Patched axiosInstance.js');
} else {
  // Try CRLF replacement
  const oldAxiosTargetCRLF = oldAxiosTarget.replace(/\n/g, '\r\n');
  const newAxiosTargetCRLF = newAxiosTarget.replace(/\n/g, '\r\n');
  if (axiosContent.includes(oldAxiosTargetCRLF)) {
    axiosContent = axiosContent.replace(oldAxiosTargetCRLF, newAxiosTargetCRLF);
    fs.writeFileSync(axiosPath, axiosContent, 'utf8');
    console.log('✅ Patched axiosInstance.js (CRLF)');
  } else {
    console.warn('⚠️ axiosInstance.js target not found');
  }
}

// 2. Patch AuthContext.jsx
const authPath = path.join(uiSrc, 'context', 'AuthContext.jsx');
let authContent = fs.readFileSync(authPath, 'utf8');

if (!authContent.includes("import { queryClient } from '../core/queryClient'")) {
  authContent = "import { queryClient } from '../core/queryClient';\n" + authContent;
}

const oldLogoutTarget = `  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
    } finally {
      localStorage.removeItem('lms_token');`;

const newLogoutTarget = `  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
    } finally {
      // Immediately cancel and clear all cached queries to prevent authenticated queries from re-fetching
      try {
        queryClient.cancelQueries();
        queryClient.clear();
      } catch (qErr) {
        console.warn('[AuthProvider] QueryClient clear warning:', qErr);
      }

      localStorage.removeItem('lms_token');`;

if (authContent.includes(oldLogoutTarget)) {
  authContent = authContent.replace(oldLogoutTarget, newLogoutTarget);
  fs.writeFileSync(authPath, authContent, 'utf8');
  console.log('✅ Patched AuthContext.jsx');
} else {
  const oldLogoutTargetCRLF = oldLogoutTarget.replace(/\n/g, '\r\n');
  const newLogoutTargetCRLF = newLogoutTarget.replace(/\n/g, '\r\n');
  if (authContent.includes(oldLogoutTargetCRLF)) {
    authContent = authContent.replace(oldLogoutTargetCRLF, newLogoutTargetCRLF);
    fs.writeFileSync(authPath, authContent, 'utf8');
    console.log('✅ Patched AuthContext.jsx (CRLF)');
  } else {
    console.warn('⚠️ AuthContext.jsx logout target not found');
  }
}

// 3. Patch useStudentData.js
const studentDataPath = path.join(uiSrc, 'hooks', 'useStudentData.js');
let studentDataContent = fs.readFileSync(studentDataPath, 'utf8');

// A: useStudentWishlist
const oldWishlistQuery = `  const wishlistQuery = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      // Safely unwrap backend envelope data structures
      const rawPayload = res?.data || res || [];
      const rawList = Array.isArray(rawPayload) ? rawPayload : (rawPayload.items || rawPayload.courses || []);
      return rawList.map(item => {
        if (item?.course) {
          return {
            ...item.course,
            wishlistId: item.wishlistId || item.id,
            id: item.course.id || item.courseId || item.id
          };
        }
        return item;
      });
    },
    staleTime: 1000 * 60 * 5
  });`;

const newWishlistQuery = `  const wishlistQuery = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      if (!user || !user.id || user.id === 'guest') return [];
      const res = await wishlistApi.getWishlist();
      // Safely unwrap backend envelope data structures
      const rawPayload = res?.data || res || [];
      const rawList = Array.isArray(rawPayload) ? rawPayload : (rawPayload.items || rawPayload.courses || []);
      return rawList.map(item => {
        if (item?.course) {
          return {
            ...item.course,
            wishlistId: item.wishlistId || item.id,
            id: item.course.id || item.courseId || item.id
          };
        }
        return item;
      });
    },
    enabled: Boolean(user && user.id && user.id !== 'guest'),
    staleTime: 1000 * 60 * 5
  });`;

if (studentDataContent.includes(oldWishlistQuery)) {
  studentDataContent = studentDataContent.replace(oldWishlistQuery, newWishlistQuery);
} else {
  const oldWishlistQueryCRLF = oldWishlistQuery.replace(/\n/g, '\r\n');
  const newWishlistQueryCRLF = newWishlistQuery.replace(/\n/g, '\r\n');
  if (studentDataContent.includes(oldWishlistQueryCRLF)) {
    studentDataContent = studentDataContent.replace(oldWishlistQueryCRLF, newWishlistQueryCRLF);
  }
}

// B: useCourseWishlistCheck
const oldCheckQuery = `  return useQuery({
    queryKey: ['wishlist-check', userId, courseId],
    queryFn: async () => {
      if (!courseId) return false;
      try {
        const res = await wishlistApi.checkWishlistStatus(courseId);
        // Backend returns direct native boolean literals or wrapped response entities
        return typeof res === 'boolean'
          ? res
          : res?.data === true || res?.data?.inWishlist === true || res?.inWishlist === true || res === 'true';
      } catch (e) {
        return false;
      }
    },`;

const newCheckQuery = `  return useQuery({
    queryKey: ['wishlist-check', userId, courseId],
    queryFn: async () => {
      if (!courseId || !user || !user.id || user.id === 'guest') return false;
      try {
        const res = await wishlistApi.checkWishlistStatus(courseId);
        // Backend returns direct native boolean literals or wrapped response entities
        return typeof res === 'boolean'
          ? res
          : res?.data === true || res?.data?.inWishlist === true || res?.inWishlist === true || res === 'true';
      } catch (e) {
        return false;
      }
    },
    enabled: Boolean(courseId && user && user.id && user.id !== 'guest'),`;

if (studentDataContent.includes(oldCheckQuery)) {
  studentDataContent = studentDataContent.replace(oldCheckQuery, newCheckQuery);
} else {
  const oldCheckQueryCRLF = oldCheckQuery.replace(/\n/g, '\r\n');
  const newCheckQueryCRLF = newCheckQuery.replace(/\n/g, '\r\n');
  if (studentDataContent.includes(oldCheckQueryCRLF)) {
    studentDataContent = studentDataContent.replace(oldCheckQueryCRLF, newCheckQueryCRLF);
  }
}

// C: useStudentDashboard
const oldDashQuery = `  const dashboardQuery = useQuery({
    queryKey: ['student', 'dashboard', user?.id || 'guest'],
    queryFn: async () => {
      const res = await courseApi.getStudentDashboard();
      return res?.data || res || { enrolledCourses: [], overallProgress: 0, completedCoursesCount: 0, activeStreak: 12 };
    },
    staleTime: 1000 * 60 * 5,
  });`;

const newDashQuery = `  const dashboardQuery = useQuery({
    queryKey: ['student', 'dashboard', user?.id || 'guest'],
    queryFn: async () => {
      if (!user || !user.id || user.id === 'guest') {
        return { enrolledCourses: [], overallProgress: 0, completedCoursesCount: 0, activeStreak: 0 };
      }
      const res = await courseApi.getStudentDashboard();
      return res?.data || res || { enrolledCourses: [], overallProgress: 0, completedCoursesCount: 0, activeStreak: 12 };
    },
    enabled: Boolean(user && user.id && user.id !== 'guest'),
    staleTime: 1000 * 60 * 5,
  });`;

if (studentDataContent.includes(oldDashQuery)) {
  studentDataContent = studentDataContent.replace(oldDashQuery, newDashQuery);
} else {
  const oldDashQueryCRLF = oldDashQuery.replace(/\n/g, '\r\n');
  const newDashQueryCRLF = newDashQuery.replace(/\n/g, '\r\n');
  if (studentDataContent.includes(oldDashQueryCRLF)) {
    studentDataContent = studentDataContent.replace(oldDashQueryCRLF, newDashQueryCRLF);
  }
}

fs.writeFileSync(studentDataPath, studentDataContent, 'utf8');
console.log('✅ Patched useStudentData.js');

// 4. Patch useCart.js
const cartPath = path.join(uiSrc, 'hooks', 'useCart.js');
let cartContent = fs.readFileSync(cartPath, 'utf8');

const oldUseCartTarget = `export function useCart() {
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
  });`;

const newUseCartTarget = `export function useCart() {
  const { user } = useSafeAuth();
  const userId = user?.id || 'guest';
  const addToCartMutation = useAddToCart();

  const query = useQuery({
    queryKey: [...CART_QUERY_KEY, userId],
    queryFn: async () => {
      if (!user || !user.id || user.id === 'guest') {
        return {
          cartId: null,
          totalCourses: 0,
          courses: [],
          subtotal: 0,
          discount: 0,
          tax: 0,
          total: 0,
        };
      }
      const response = await cartApi.getCart();
      return normalizeCart(response);
    },
    enabled: Boolean(user && user.id && user.id !== 'guest'),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });`;

if (cartContent.includes(oldUseCartTarget)) {
  cartContent = cartContent.replace(oldUseCartTarget, newUseCartTarget);
  fs.writeFileSync(cartPath, cartContent, 'utf8');
  console.log('✅ Patched useCart.js');
} else {
  const oldUseCartTargetCRLF = oldUseCartTarget.replace(/\n/g, '\r\n');
  const newUseCartTargetCRLF = newUseCartTarget.replace(/\n/g, '\r\n');
  if (cartContent.includes(oldUseCartTargetCRLF)) {
    cartContent = cartContent.replace(oldUseCartTargetCRLF, newUseCartTargetCRLF);
    fs.writeFileSync(cartPath, cartContent, 'utf8');
    console.log('✅ Patched useCart.js (CRLF)');
  } else {
    console.warn('⚠️ useCart.js target not found');
  }
}

// 5. Patch OrderContext.jsx
const orderCtxPath = path.join(uiSrc, 'context', 'OrderContext.jsx');
let orderCtxContent = fs.readFileSync(orderCtxPath, 'utf8');

const oldCartQueryOrderCtx = `  const {
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
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });`;

const newCartQueryOrderCtx = `  const {
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
      if (!user || !user.id || user.id === 'guest') {
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
    enabled: Boolean(user && user.id && user.id !== 'guest'),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });`;

if (orderCtxContent.includes(oldCartQueryOrderCtx)) {
  orderCtxContent = orderCtxContent.replace(oldCartQueryOrderCtx, newCartQueryOrderCtx);
} else {
  const oldCartQueryOrderCtxCRLF = oldCartQueryOrderCtx.replace(/\n/g, '\r\n');
  const newCartQueryOrderCtxCRLF = newCartQueryOrderCtx.replace(/\n/g, '\r\n');
  if (orderCtxContent.includes(oldCartQueryOrderCtxCRLF)) {
    orderCtxContent = orderCtxContent.replace(oldCartQueryOrderCtxCRLF, newCartQueryOrderCtxCRLF);
  }
}

// OrderContext orders query
const oldOrdersQueryOrderCtx = `  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    refetch: loadUserOrders,
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];`;

const newOrdersQueryOrderCtx = `  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    refetch: loadUserOrders,
  } = useQuery({
    queryKey: ['orders', user?.id],
    enabled: Boolean(user && user.id && user.id !== 'guest'),
    queryFn: async () => {
      if (!user) return [];`;

if (orderCtxContent.includes(oldOrdersQueryOrderCtx)) {
  orderCtxContent = orderCtxContent.replace(oldOrdersQueryOrderCtx, newOrdersQueryOrderCtx);
} else {
  const oldOrdersQueryOrderCtxCRLF = oldOrdersQueryOrderCtx.replace(/\n/g, '\r\n');
  const newOrdersQueryOrderCtxCRLF = newOrdersQueryOrderCtx.replace(/\n/g, '\r\n');
  if (orderCtxContent.includes(oldOrdersQueryOrderCtxCRLF)) {
    orderCtxContent = orderCtxContent.replace(oldOrdersQueryOrderCtxCRLF, newOrdersQueryOrderCtxCRLF);
  }
}

fs.writeFileSync(orderCtxPath, orderCtxContent, 'utf8');
console.log('✅ Patched OrderContext.jsx');

// 6. Patch ProfileWorkspace.jsx
const profilePath = path.join(uiSrc, 'pages', 'student', 'ProfileWorkspace.jsx');
let profileContent = fs.readFileSync(profilePath, 'utf8');

// Ensure image never renders raw drive.google.com and never displays broken alt text
const oldImgTag = `<img
                src={coverPhotoUrl}
                alt="Obsidian Cover"
                referrerPolicy="no-referrer"
                onError={async () => {
                  if (profile?.coverPhoto && !coverPhotoUrl.startsWith('blob:')) {
                    const fallback = await fetchPhotoAsBlob(profile.coverPhoto);
                    if (fallback && fallback !== coverPhotoUrl) {
                      setCoverPhotoUrl(fallback);
                      return;
                    }
                  }
                  // If all resolution fails, clear to gracefully show textured Obsidian gradient banner
                  setCoverPhotoUrl(null);
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />`;

const newImgTag = `<img
                src={coverPhotoUrl}
                alt=""
                aria-hidden="true"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Silently suppress broken element immediately
                  e.currentTarget.style.display = 'none';
                  setCoverPhotoUrl(null);
                }}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />`;

if (profileContent.includes(oldImgTag)) {
  profileContent = profileContent.replace(oldImgTag, newImgTag);
} else {
  const oldImgTagCRLF = oldImgTag.replace(/\n/g, '\r\n');
  const newImgTagCRLF = newImgTag.replace(/\n/g, '\r\n');
  if (profileContent.includes(oldImgTagCRLF)) {
    profileContent = profileContent.replace(oldImgTagCRLF, newImgTagCRLF);
  }
}

// In handleCoverPhotoUpload: preserve preview blob if network error occurs
const oldCatchBlock = `    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to commit cover banner');
      setCoverPhotoUrl(profile?.coverPhoto || null);
    }`;

const newCatchBlock = `    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to commit cover banner');
      if (!coverPhotoUrl) {
        setCoverPhotoUrl(preview || null);
      }
    }`;

if (profileContent.includes(oldCatchBlock)) {
  profileContent = profileContent.replace(oldCatchBlock, newCatchBlock);
} else {
  const oldCatchBlockCRLF = oldCatchBlock.replace(/\n/g, '\r\n');
  const newCatchBlockCRLF = newCatchBlock.replace(/\n/g, '\r\n');
  if (profileContent.includes(oldCatchBlockCRLF)) {
    profileContent = profileContent.replace(oldCatchBlockCRLF, newCatchBlockCRLF);
  }
}

fs.writeFileSync(profilePath, profileContent, 'utf8');
console.log('✅ Patched ProfileWorkspace.jsx');
