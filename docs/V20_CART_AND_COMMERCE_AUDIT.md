# Asivo LMS — Version 20: Cart & Commerce Audit (Non-Payment)

**Audit Target**: Cart Persistence, Guest Merge, Coupon Validation & Order Staging  
**Overall Verdict**: **PASS** (100% of non-payment commerce operations verified)  
**Scope Boundary**: Paid commercial checkout remains blocked pending PayU sandbox credentials.

---

## 1. Commerce Lifecycle Architecture (Non-Payment)

```
[Guest Cart in localStorage] ──► [User Authentication] ──► [Merge & Deduplicate]
                                                                    │
[Order Staging & History] ◄── [Coupon Validation] ◄──────── [Database Cart Sync]
```

---

## 2. Cart Persistence & Scenarios A–E Verification

### Scenario A: Union Merge Without Data Loss
- **Guest Cart**: Course A (ID 6), Course B (ID 7)
- **User Database Cart**: Course C (ID 8)
- **Merge Behavior**: Upon login, `OrderContext.jsx` invokes `cartApi.mergeGuestCart([A, B])`.
- **Observed Result**: Database cart contains A, B, and C with quantity = 1 each. Subtotal calculated accurately without item omission.

### Scenario B: Deduplication
- **Guest Cart**: Course A (ID 6)
- **User Database Cart**: Course A (ID 6)
- **Observed Result**: `CartService.java` enforces unique constraint on `(user_id, course_id)`. The resulting cart contains exactly one instance of Course A.

### Scenario C: Enrolled Course Skipping
- **Scenario**: Guest adds Course 6 to cart while logged out. The user is already enrolled in Course 6.
- **Observed Result**: Prior to merging, `OrderContext.jsx` queries `/api/v1/dashboard/student/courses` to fetch enrolled course IDs. Course 6 is filtered out, preventing duplicate purchase attempts.

### Scenario D: Fault-Tolerant Backup
- **Scenario**: Network interruption occurs during post-login cart synchronization.
- **Observed Result**: Guest items are backed up to `localStorage('lms_guest_cart_backup')` before the API call. If the sync fails, items remain recoverable and are not lost.

### Scenario E: Cross-User Session Isolation
- **Scenario**: Student A logs out; Student B logs in on the same browser.
- **Observed Result**: `AuthContext.jsx`'s `logout()` explicitly removes `lms_cart` and `lms_guest_cart_backup`, and fires `window.dispatchEvent(new Event('cartUpdated'))`. Student B sees only their own cart data.

---

## 3. UI Remediation & Screenshot Bug Fix

In earlier builds, visiting `/cart` produced an application error:
```
Application Crashed
Error Message: useEffect is not defined
```
- **Root Cause**: `src/pages/student/ShoppingCartWorkspace.jsx` had imported `{ useState }` from React, but called `useEffect` for local guest cart synchronization without destructured import.
- **Remediation**: Added `useEffect` to `import React, { useState, useEffect } from 'react';` and rebuilt the production bundle (`dist/`).
- **Browser Verification**: Tested with Playwright on `http://localhost:4173/cart`.
  - HTTP Status: 200 OK.
  - Page Errors: 0.
  - Console Errors: 0.
  - DOM Output: Renders "Shopping Cart Matrix" empty state or populated cart items cleanly.

---

## 4. Coupon Validation & Order Staging

### Coupon Validation (`coupon-service` : 8082)
- Endpoint: `POST /api/v1/coupons/validate`
- Request:
  ```json
  {
    "code": "WELCOME10",
    "totalAmount": 1000
  }
  ```
- Result: Authoritative validation recalculates discount and total, rejecting expired or non-existent coupon codes with HTTP 400.

### Order Staging & History (`order-service` : 8084)
- Student Order History: `GET /api/v1/orders/my-orders`
- Returns user orders staged in `lms_order_db.orders`.
- Paid completion lifecycle is held in `PENDING` state until payment provider verification.

