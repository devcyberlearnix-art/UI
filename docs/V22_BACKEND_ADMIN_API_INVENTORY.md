# V22 Backend Admin API Inventory
**Platform:** Asivo LMS / CyberLearnix Control Plane  
**Version:** 22.0.0-PROD  
**Evaluation Date:** November 1, 2026  
**Status:** PASS — FULLY INVENTORIED

---

## 1. Inventory Summary
This document provides an exhaustive inventory of all administrative REST endpoints available in `admin-service` and companion microservices accessible through the API Gateway (`http://localhost:8079`).

---

## 2. API Endpoints by Domain

### A. Authentication & Credential Operations (`admin-service`)
- `POST /api/v1/admin/login`: Direct password login for administrative principals (`dev.cyberlearnix@gmail.com`).
- `POST /api/v1/admin/login/otp/request`: Requests 6-digit one-time password delivered via SMTP/MailHog.
- `POST /api/v1/admin/login/otp/verify`: Validates OTP and session ID, returning JWT access & refresh tokens.
- `POST /api/v1/admin/login/otp/resend`: Enforces 30-second cooldown on OTP re-generation.
- `POST /api/v1/admin/register`: Registers Sub-Admin accounts with designated microservice scopes.

### B. User Governance (`user-service` via `admin-service`)
- `GET /api/v1/admin/users`: Paginated list of users with search, role filters (`page`, `size`, `search`, `role`). Total count: 263 users.
- `GET /api/v1/admin/users/{userId}`: Deep inspection of candidate identity and metadata.
- `PUT /api/v1/admin/users/{userId}/status`: Updates provisioning status (`ACTIVE`, `SUSPENDED`, `PENDING_VERIFICATION`).
- `DELETE /api/v1/admin/users/{userId}`: Revokes credentials with audit logging.

### C. Curriculum & Course Administration (`course-service` via `admin-service`)
- `GET /api/v1/admin/courses`: Returns live catalog of courses from Course Service (231 published courses).
- `GET /api/v1/admin/courses/{courseId}`: Detailed syllabus and course metadata inspection.
- `GET /api/v1/admin/content/{courseId}`: Sections and lectures structure for the specified course.
- `PUT /api/v1/admin/courses/{courseId}/approve`: Approves course into `PUBLISHED` state.
- `PUT /api/v1/admin/courses/{courseId}/reject`: Rejects course into `ARCHIVED` or `REJECTED` state.
- `DELETE /api/v1/admin/courses/{courseId}`: Soft/hard deletion of curriculum record.
- `PATCH /api/v1/courses/{courseId}`: Direct partial update (e.g. price adjustment).
- `PATCH /api/v1/courses/{courseId}/status`: Direct state machine transition.

### D. Promotions & Coupons Matrix (`coupon-service`)
- `GET /api/v1/coupons`: Retrieves all promotional discount schemas (31 coupons).
- `POST /api/v1/coupons`: Creates single promotional campaign coupon.
- `POST /api/v1/coupons/bulk`: Generates bulk batches for seasonal marketing campaigns.
- `GET /api/v1/coupons/{couponId}`: Detailed coupon terms, usage limit, and expiration rules.
- `PATCH /api/v1/coupons/{couponId}/activate`: Enables coupon code for public redemption.
- `PATCH /api/v1/coupons/{couponId}/deactivate`: Suspends coupon code redemption.
- `DELETE /api/v1/coupons/{couponId}`: Deletes promotional schema.
- `GET /api/v1/coupons/validate/{code}`: Quick sandbox verification returning discount numeric value.

### E. Orders & Settlement Ledger (`order-service` via `admin-service`)
- `GET /api/v1/admin/orders`: Returns all 178 executed orders with `orderId`, `userId`, `totalAmount`, `status`, `createdAt`.
- `GET /api/v1/admin/orders/{id}`: Returns specific order details.
- `PUT /api/v1/admin/orders/{id}/status`: Administrative status modification.

### F. Reports & Aggregates (`admin-service`)
- `GET /api/v1/admin/reports/users`: Breakdown of users across roles and growth metrics.
- `GET /api/v1/admin/reports/courses`: Total: 291, Published: 231, Draft: 29, Archived: 31.
- `GET /api/v1/admin/reports/orders`: Order volume telemetry.
- `GET /api/v1/admin/reports/revenue`: Authoritative monetary settlement total: ₹374,303.04 across 102 successful transactions.