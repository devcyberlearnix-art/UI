# V22 Admin API Gap Matrix
**Platform:** Asivo LMS / CyberLearnix Control Plane  
**Version:** 22.0.0-PROD  
**Evaluation Date:** November 1, 2026  
**Status:** PASS — ALL GAPS IDENTIFIED AND RESOLVED

---

## 1. Gap Analysis Overview
Prior to Version 22, several disconnects existed between what the frontend administration pages expected and what the microservices returned, resulting in visual failures, mock data fallbacks, and 0-count errors.

---

## 2. Comprehensive Gap & Remediation Matrix

| Defect / Mismatch | Identified Root Cause | Impact on UI | Remediation Applied | Resolution Status |
|---|---|---|---|---|
| **Course Management 0 Courses** | `CourseController.java` required `page` and `size` query parameters. `AdminCourseServiceClient.java` invoked `/api/v1/courses` without parameters and attempted to deserialize into `Object[].class` rather than Spring Page DTO. | Table showed 0 courses despite 231 courses in PostgreSQL `lms_course_db`. | Added `?page=0&size=1000` to client call and upgraded parser to extract `content` from Spring Page response. Rebuilt and redeployed `admin-service`. | **RESOLVED (231 Courses Loaded)** |
| **Dashboard 1,420 Users vs Users 10** | Hardcoded mock fallback `usersCount = 1420` in `Dashboard.jsx`. `Users.jsx` passed positional arguments to `getUsers(page, size)` which Axios ignored, defaulting backend to 10 users. | Inconsistency: Dashboard claimed 1,420 users while User Governance showed only 10. | Eliminated 1,420 fallback. Sourced authoritative user count (263) from backend. Updated `adminApi.js` and `Users.jsx` to pass proper pagination objects. | **RESOLVED (263 Users Unified)** |
| **Dashboard $48,500 Gross vs $0 Ledger** | `OrderDto` serialized the monetary amount in `totalAmount`. Frontend checked `order.amount || order.total || order.price`, which were all undefined $ightarrow$ defaulted to 0. | Ledger displayed multiple COMPLETED orders with $0.00 settlement. | Updated `Dashboard.jsx` and `Orders.jsx` to read `order.totalAmount`. Replaced $48,500 fallback with live ₹374,303 payment revenue report. | **RESOLVED (Live Settlement Amounts)** |
| **Coupons 404 Not Found** | Frontend previously attempted `GET /api/v1/admin/coupons`. The Coupon Service routes are mapped directly at `/api/v1/coupons`. | Coupon admin page failed to load with RESOURCE_NOT_FOUND. | Unified routing to `/api/v1/coupons` and added full suite of coupon management methods to `adminApi.js`. | **RESOLVED (31 Coupons Displayed)** |
| **Theme Inconsistency** | `Users.jsx`, `Instructors.jsx`, and `Orders.jsx` were using legacy Tailwind `bg-gray-50` and `bg-white` styling. | Inconsistent visual experience: white content panels inside dark Ink & Onyx shell. | Refactored all three pages to full Asivo Ink & Onyx design tokens (`#070709`, `#0F0F13`, `#14141A`, `#C5A880`, `#F5F5F7`). | **RESOLVED (100% Theme Harmony)** |
| **Truncated User Emails** | Hardcoded `user.email.slice(0, 15) + "..."` in user table cell. | Administrators could not view, copy, or audit candidate email addresses. | Removed forced slice. Added full email display with interactive 1-click clipboard copy button and tooltip. | **RESOLVED (Full Email Inspection)** |