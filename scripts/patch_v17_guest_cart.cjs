const fs = require('fs');
const path = require('path');

// 1. Update AuthContext.jsx
const authPath = path.join(__dirname, '../src/context/AuthContext.jsx');
let authContent = fs.readFileSync(authPath, 'utf8');

if (!authContent.includes('authSessionExpired')) {
  // Add listener for authSessionExpired
  const targetSessionRestore = '    restoreSession();\r\n  }, []);';
  const targetSessionRestoreLF = '    restoreSession();\n  }, []);';
  
  const listenerSnippet = `
  // Listen for session expiration events dispatched by axios interceptors
  useEffect(() => {
    const handleSessionExpired = () => {
      setToken(null);
      setUser(null);
      try {
        queryClient.removeQueries({ queryKey: ['cart'] });
        queryClient.removeQueries({ queryKey: ['orders'] });
        queryClient.removeQueries({ queryKey: ['enrolled-courses'] });
        queryClient.removeQueries({ queryKey: ['wishlist'] });
      } catch (err) {}
    };

    window.addEventListener('authSessionExpired', handleSessionExpired);
    return () => window.removeEventListener('authSessionExpired', handleSessionExpired);
  }, []);
`;

  if (authContent.includes(targetSessionRestore)) {
    authContent = authContent.replace(targetSessionRestore, targetSessionRestore + listenerSnippet);
  } else if (authContent.includes(targetSessionRestoreLF)) {
    authContent = authContent.replace(targetSessionRestoreLF, targetSessionRestoreLF + listenerSnippet);
  }

  // Refine isAuthenticated
  authContent = authContent.replace(
    'isAuthenticated: !!token,',
    'isAuthenticated: Boolean(!loading && token && user && user.id && user.id !== \'guest\'),'
  );

  fs.writeFileSync(authPath, authContent, 'utf8');
  console.log('Updated AuthContext.jsx');
}

// 2. Update Navbar.jsx
const navbarPath = path.join(__dirname, '../src/layouts/Navbar.jsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');
const navbarTarget = `    if (localStorage.getItem('lms_token') || localStorage.getItem('access_token')) {
      cartApi.getCart().catch(() => {});
    }`;
const navbarTargetCRLF = navbarTarget.replace(/\n/g, '\r\n');

if (navbarContent.includes(navbarTargetCRLF)) {
  navbarContent = navbarContent.replace(navbarTargetCRLF, '    // Cart count updated via local storage and order context');
  fs.writeFileSync(navbarPath, navbarContent, 'utf8');
  console.log('Updated Navbar.jsx (CRLF)');
} else if (navbarContent.includes(navbarTarget)) {
  navbarContent = navbarContent.replace(navbarTarget, '    // Cart count updated via local storage and order context');
  fs.writeFileSync(navbarPath, navbarContent, 'utf8');
  console.log('Updated Navbar.jsx (LF)');
}

// 3. Update cartApi.js (ensure getCart doesn't execute if unauthenticated)
const cartApiPath = path.join(__dirname, '../src/api/cartApi.js');
let cartApiContent = fs.readFileSync(cartApiPath, 'utf8');
const oldGetCart = `  getCart: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/cart');
      const normalized = normalizeCart(response.data);
      syncSharedCart(normalized.courses);
      return response.data;
    } catch (err) {
      console.warn('[cartApi] GET /api/v1/cart failed');
      throw err;
    }
  },`;

const newGetCart = `  getCart: async () => {
    // Only attempt backend fetch if token exists
    const hasToken = typeof window !== 'undefined' && Boolean(
      window.localStorage.getItem('lms_token') ||
      window.localStorage.getItem('access_token') ||
      window.sessionStorage.getItem('lms_token')
    );
    if (!hasToken) {
      const local = getSharedCart();
      const subtotal = local.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
      return {
        cartId: 'guest-cart',
        totalCourses: local.length,
        courses: local.map(normalizeCartItem),
        subtotal,
        discount: 0,
        tax: 0,
        total: subtotal,
        couponCode: null,
      };
    }
    try {
      const response = await axiosInstance.get('/api/v1/cart');
      const normalized = normalizeCart(response.data);
      syncSharedCart(normalized.courses);
      return response.data;
    } catch (err) {
      console.warn('[cartApi] GET /api/v1/cart failed');
      throw err;
    }
  },`;

if (cartApiContent.includes(oldGetCart.replace(/\n/g, '\r\n'))) {
  cartApiContent = cartApiContent.replace(oldGetCart.replace(/\n/g, '\r\n'), newGetCart.replace(/\n/g, '\r\n'));
  fs.writeFileSync(cartApiPath, cartApiContent, 'utf8');
  console.log('Updated cartApi.js (CRLF)');
} else if (cartApiContent.includes(oldGetCart)) {
  cartApiContent = cartApiContent.replace(oldGetCart, newGetCart);
  fs.writeFileSync(cartApiPath, cartApiContent, 'utf8');
  console.log('Updated cartApi.js (LF)');
}

console.log('Patch script completed.');

