# V22 Coupon Admin Audit
**Platform:** Asivo LMS / CyberLearnix Control Plane  
**Version:** 22.0.0-PROD  
**Evaluation Date:** November 1, 2026  
**Status:** PASS — PROMOTION ENGINE LIVE

---

## 1. Executive Summary
The Promotions & Coupon Matrix module (`/admin/coupons`) previously returned a 404 RESOURCE_NOT_FOUND error when attempting to access `/api/v1/admin/coupons`.

---

## 2. Routing Resolution
- The coupon service endpoints are routed at `/api/v1/coupons` directly by the API Gateway.
- Added comprehensive coupon methods to `src/api/adminApi.js` and verified `src/api/couponApi.js`.
- **Live Verification**:
  - `GET /api/v1/coupons` returns **31 live promotional coupons**.
  - Prominent coupons include `SPRING20` (₹600 FLAT discount), `DEVMONTH` (20% PERCENTAGE discount), `CYBER15` (₹800 FLAT discount).
  - Validation sandbox: `GET /api/v1/coupons/validate/{code}` verifies discount values in real time without creating transactions.
  - Full toggle activation (`PATCH /api/v1/coupons/{id}/activate`) and deactivation supported.
  - Visuals styled in Ink & Onyx.