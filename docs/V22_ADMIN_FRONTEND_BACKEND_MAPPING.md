# V22 Admin Frontend-Backend Mapping
**Platform:** Asivo LMS / CyberLearnix Control Plane  
**Version:** 22.0.0-PROD  
**Evaluation Date:** November 1, 2026  
**Status:** PASS — VERIFIED & OPERATIONAL

---

## 1. Architectural Mapping Topology
This document details the exact mappings between React frontend pages, `src/api/adminApi.js` client methods, API Gateway routes, downstream microservices, and underlying PostgreSQL schemas.

---

## 2. Mapping Directory

### 1. Global Telemetry / Dashboard (`src/pages/admin/Dashboard.jsx`)
- **UI Elements**: KPI Metrics Strip (Registered Users, Active Curriculum, Platform Gross, Executed Orders), Domain Breakdown PieChart, Recent Settlements Table.
- **Frontend API**: `adminApi.getDashboardStats.users()`, `adminApi.getDashboardStats.courses()`, `adminApi.getDashboardStats.revenue()`, `adminApi.getOrders()`.
- **Gateway Endpoints**:
  - `GET /api/v1/admin/reports/users` $ightarrow$ `admin-service`
  - `GET /api/v1/admin/reports/courses` $ightarrow$ `admin-service`
  - `GET /api/v1/admin/reports/revenue` $ightarrow$ `admin-service`
  - `GET /api/v1/admin/orders` $ightarrow$ `admin-service`
- **Database Tables**: `lms_user_db.users`, `lms_course_db.courses`, `lms_payment_db.payments`, `lms_order_db.orders`.

### 2. User Governance (`src/pages/admin/Users.jsx`)
- **UI Elements**: Aggregate Counters (Total, Students, Instructors, Admins), Search Bar, Role Filter, Status Filter, Paginated Identity Table, User Details Modal.
- **Frontend API**: `adminApi.getUsers(params)`, `adminApi.getUserById(id)`, `adminApi.updateUserStatus(id, status)`, `adminApi.deleteUser(id)`.
- **Gateway Endpoints**:
  - `GET /api/v1/admin/users` $ightarrow$ `admin-service` $ightarrow$ `user-service`
  - `GET /api/v1/admin/users/{id}` $ightarrow$ `admin-service` $ightarrow$ `user-service`
  - `PUT /api/v1/admin/users/{id}/status` $ightarrow$ `admin-service` $ightarrow$ `user-service`
- **Database Tables**: `lms_user_db.users`.

### 3. Curriculum Audit / Courses (`src/pages/admin/Courses.jsx`)
- **UI Elements**: Total Courses, Status Filters (Published, Draft, Archived), Table of 231 Courses, Price Quick Patch Modal, Syllabus Content Inspection Modal.
- **Frontend API**: `adminApi.getCourses()`, `adminApi.getCourseContent(id)`, `courseApi.patchCourse(id, data)`, `courseApi.updateCourseStatus(id, status)`.
- **Gateway Endpoints**:
  - `GET /api/v1/admin/courses` $ightarrow$ `admin-service` $ightarrow$ `course-service`
  - `GET /api/v1/admin/content/{id}` $ightarrow$ `admin-service` $ightarrow$ `course-service`
  - `PATCH /api/v1/courses/{id}` $ightarrow$ `course-service`
- **Database Tables**: `lms_course_db.courses`, `lms_course_db.sections`, `lms_course_db.lectures`.

### 4. Promotions & Coupons (`src/pages/admin/Coupons.jsx`)
- **UI Elements**: Active Coupons Counter, Search & Campaign Filter, Coupon Cards Grid, Validation Sandbox Simulator, Create & Bulk Modals.
- **Frontend API**: `couponApi.getAllCoupons()`, `couponApi.createCoupon(data)`, `couponApi.activateCoupon(id)`, `couponApi.deactivateCoupon(id)`, `couponApi.validateByCode(code)`.
- **Gateway Endpoints**:
  - `GET /api/v1/coupons` $ightarrow$ `coupon-service`
  - `POST /api/v1/coupons` $ightarrow$ `coupon-service`
  - `PATCH /api/v1/coupons/{id}/activate` $ightarrow$ `coupon-service`
  - `GET /api/v1/coupons/validate/{code}` $ightarrow$ `coupon-service`
- **Database Tables**: `lms_coupon_db.coupons`.

### 5. Order Ledger (`src/pages/admin/Orders.jsx`)
- **UI Elements**: Executed Orders Total, Settlement Amounts, Order Details Modal, Status Filter.
- **Frontend API**: `adminApi.getOrders()`, `adminApi.getOrderById(id)`.
- **Gateway Endpoints**:
  - `GET /api/v1/admin/orders` $ightarrow$ `admin-service` $ightarrow$ `order-service`
- **Database Tables**: `lms_order_db.orders`.