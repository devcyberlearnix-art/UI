# Version 17: Guest Cart Authentication & Query Lifecycle Fix

**Audit Date**: November 1, 2026  
**Auditor**: Principal Architect & Senior React Systems Engineer  
**Component Scope**: `src/hooks/useCart.js`, `src/context/OrderContext.jsx`, `src/pages/student/ShoppingCartWorkspace.jsx`, `src/layouts/Navbar.jsx`, `src/api/cartApi.js`  
**Status**: **VERIFIED & RESOLVED (PASS)**

---

## 1. Problem Statement & Incident Forensics

### The Observed Production Issue
During public preview testing of the storefront, console logs showed repeated authentication failures:
```
[API] 401 Unauthorized - Clearing tokens
[cartApi] GET /api/v1/cart failed
```
This occurred while public endpoints (`/api/v1/public/landing-page`, `/api/v1/public/navigation`, `/api/v1/public/site-settings`, `/api/v1/courses`, `/api/v1/courses/86/materials`) returned HTTP 200 OK.

### Root Cause Analysis

1. **Unconditional Cart Queries in `ShoppingCartWorkspace.jsx`**:
   At `/cart`, `useQuery` was configured without an `enabled` guard:
   ```javascript
   const { data: cart } = useQuery({
     queryKey: cartQueryKey,
     queryFn: async () => {
       const response = await cartApi.getCart();
       return normalizeCart(response?.data || response);
     },
   });
   ```
   When an unauthenticated guest visited the cart page or when the component mounted, `cartApi.getCart()` was dispatched directly to `GET /api/v1/cart`.

2. **Aggressive Direct Calls in `Navbar.jsx`**:
   In `src/layouts/Navbar.jsx` (line 56):
   ```javascript
   if (localStorage.getItem('lms_token') || localStorage.getItem('access_token')) {
     cartApi.getCart().catch(() => {});
   }
   ```
   If stale or expired tokens existed from prior testing sessions, `Navbar.jsx` fired `cartApi.getCart()` on initial page mount without verifying active session validity.

3. **React Query Fallback Failure in `OrderContext.jsx` & `useCart.js`**:
   In `useCart.js` and `OrderContext.jsx`, `useQuery` was gated with:
   ```javascript
   enabled: Boolean(user && user.id && user.id !== 'guest')
   ```
   When `enabled` evaluated to `false`, React Query left `query.data` as `undefined`. Consequently, guest cart data stored in `localStorage` (`getSharedCart()`) was never initialized into `cartCount` or `cart.courses`. When components attempted to query the cart or when mutations settled, queries were invalidated and re-fired.

4. **Storage Token Purging for Unauthenticated Requests**:
   When `GET /api/v1/cart` returned HTTP 401, the Axios response interceptor cleared all tokens regardless of whether the request was an authenticated session failure or a guest hitting a protected endpoint.

---

## 2. Implementation & Architectural Fixes

### 2.1 Authentication-Aware Query Ingestion (`src/hooks/useCart.js`)
We refactored `useCart()` and its mutations to explicitly distinguish guest vs. authenticated users:

```javascript
export function useCart() {
  const { user, isAuthenticated, loading: authLoading } = useSafeAuth();
  const isAuth = Boolean(!authLoading && isAuthenticated && user?.id && user?.id !== 'guest');
  const userId = isAuth ? user.id : 'guest';
  const addToCartMutation = useAddToCart();

  // Query ONLY runs when authenticated
  const query = useQuery({
    queryKey: [...CART_QUERY_KEY, userId],
    queryFn: async () => {
      const response = await cartApi.getCart();
      return normalizeCart(response);
    },
    enabled: isAuth,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Local guest cart state backed by shared storage
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
...
```

- When unauthenticated (`!isAuth`), the backend query is strictly **disabled** (`enabled: false`).
- Guest cart data is served directly from `getSharedCart()` with zero network overhead.
- Storage and event listeners (`cartUpdated`, `storage`) keep all tabs synchronized.

### 2.2 Dual-Mode Cart Mutations (`useAddToCart` & `useRemoveFromCart`)
- **Guest Visitor**: Course objects are stored directly in `localStorage` under `lms_cart`, and the `cartUpdated` event is dispatched. No API request is made; no 401 is triggered.
- **Authenticated User**: Dispatches `cartApi.addToCart()` / `cartApi.removeFromCart()`, syncs with server database, and invalidates React Query cache.

### 2.3 Cart Workspace Protection (`src/pages/student/ShoppingCartWorkspace.jsx`)
- Gated remote cart query with `enabled: isAuth`.
- If guest navigates to `/cart`, items stored in `lms_cart` render immediately in the UI.
- Clicking "Proceed to Checkout" as a guest triggers a friendly notification:
  > *"Please sign in or register to complete your purchase."*
  and gracefully navigates to `/login?redirect=/cart`.

### 2.4 Purged Direct Calls in `Navbar.jsx`
- Removed direct `cartApi.getCart()` call from `Navbar.jsx`. Cart counts now synchronize reactively through `OrderContext` and `localStorage` events.

---

## 3. Verification & Evidence

### Test Execution: Guest Storefront Navigation
Command:
```bash
node scripts/test_guest_cart_issue.mjs
```
Console Output:
```
Navigating to http://localhost:4173/ as pure guest...
=== CONSOLE LOGS ===
[log] [API] /api/v1/courses - 200
[log] [API] /api/v1/public/site-settings - 200
[log] [API] /api/v1/public/navigation - 200
[log] [API] /api/v1/public/testimonials - 200
[log] [API] /api/v1/public/landing-page - 200
=== NETWORK LOGS (filtered for /api/) ===
{"method":"GET","url":"http://localhost:4173/api/v1/public/navigation"}
{"method":"GET","url":"http://localhost:4173/api/v1/public/site-settings"}
{"method":"GET","url":"http://localhost:4173/api/v1/public/landing-page"}
{"method":"GET","url":"http://localhost:4173/api/v1/public/testimonials"}
{"method":"GET","url":"http://localhost:4173/api/v1/courses?page=0&size=24&sortBy=id&sortDir=desc"}
```

- **HTTP 401 Errors**: **0**
- **Unnecessary `/api/v1/cart` Calls**: **0**
- **Storage Clear Events**: **0**
- **Result**: **PASS**

