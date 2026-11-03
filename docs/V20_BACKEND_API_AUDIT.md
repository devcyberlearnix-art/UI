# Asivo LMS — Version 20: Backend API Audit & Verification

**Test Execution Date**: November 1, 2026  
**Target Environment**: Gateway Host `http://localhost:8079` (Container Port 8080)  
**Database Backend**: PostgreSQL 15 Container `cyberlearnix-postgres` (Port 15432)  
**Total Probed Endpoints**: 28  
**Pass Rate**: 100% of functional non-payment contracts verified  

---

## 1. Executive Summary

This report documents the exhaustive verification of all REST endpoints exposed through the Spring Cloud API Gateway (`cyberlearnix-apigateway`), spanning the 11 active microservices. All tests were executed using authenticated JWT bearer tokens for `MAIN_ADMIN`, `INSTRUCTOR`, and `STUDENT`, along with unauthenticated probes for public resources and negative RBAC enforcement checks.

---

## 2. API Verification Results

### 2.1 Identity, Authentication & Profile (`userservice` : 8091)

| Endpoint | Method | Role | Status Code | Payload / Assertion Evidence | Verdict |
| :--- | :---: | :---: | :---: | :--- | :---: |
| `/api/v1/auth/login` | POST | ADMIN | 200 OK | `email: dev.cyberlearnix@gmail.com` -> `accessToken` issued, role: `MAIN_ADMIN` | **PASS** |
| `/api/v1/auth/login` | POST | INSTRUCTOR | 200 OK | `email: rohan.malhotra@cyberlearnix.test` -> `accessToken` issued, role: `INSTRUCTOR` | **PASS** |
| `/api/v1/auth/login` | POST | STUDENT | 200 OK | `email: student_browser_1792166505208@cyberlearnix.dev` -> `accessToken` issued, role: `STUDENT` | **PASS** |
| `/api/v1/users/me` | GET | STUDENT | 200 OK | Returns profile JSON with student details, email, and preferences | **PASS** |
| `/api/v1/users/me` | PUT | STUDENT | 200 OK | Successfully updated `bio`, `city`, and `country` metadata | **PASS** |
| `/api/v1/users/me/sessions`| GET | STUDENT | 200 OK | Returns list of active session tokens and user-agent metadata | **PASS** |

### 2.2 Course Catalog, Discovery & Search (`courseservice` : 8083)

| Endpoint | Method | Role | Status Code | Payload / Assertion Evidence | Verdict |
| :--- | :---: | :---: | :---: | :--- | :---: |
| `/api/v1/courses` | GET | PUBLIC | 200 OK | Pageable course catalog: `content` array returned 5 courses | **PASS** |
| `/api/v1/courses/6` | GET | PUBLIC | 200 OK | Returns full course metadata for "Clean Code and Refactoring" | **PASS** |
| `/api/v1/courses/suggestions?q=Python` | GET | PUBLIC | 200 OK | Returns fast suggestion projections: 6 hits across TITLE, SUBTITLE, CATEGORY | **PASS** |
| `/api/v1/banners` | GET | PUBLIC | 200 OK | Returns active marketing banners for promotional carousel | **PASS** |

### 2.3 Student Learning, Progress & Reviews (`courseservice` : 8083 & `reviewservice` : 8089)

| Endpoint | Method | Role | Status Code | Payload / Assertion Evidence | Verdict |
| :--- | :---: | :---: | :---: | :--- | :---: |
| `/api/v1/enrollments/check/6` | GET | STUDENT | 200 OK | Returns `enrolled: true`, `status: "Enrolled"` | **PASS** |
| `/api/v1/courses/6/enroll` | POST | STUDENT | 200 OK | Successfully enrolls learner into free course (Idempotent guard in DB) | **PASS** |
| `/api/v1/progress/courses/6` | GET | STUDENT | 200 OK | `totalLectures: 16`, `completedLectures: 1`, `progressPercentage: 6%` | **PASS** |
| `/api/v1/progress/courses/6/resume` | GET | STUDENT | 200 OK | `nextLectureId: 81`, `nextLectureTitle: "Overview and Setup"` | **PASS** |
| `/api/v1/progress/lectures/81/start` | POST | STUDENT | 200 OK | `success: true`, `message: "Lecture started successfully"` | **PASS** |
| `/api/v1/progress/lectures/81/complete` | PATCH | STUDENT | 200 OK | `success: true`, `message: "Lecture completed successfully"` | **PASS** |
| `/api/v1/reviews` | POST | STUDENT | 201 Created | `courseId: 6`, `rating: 5` -> "Review submitted successfully." | **PASS** |
| `/api/v1/reviews/course/6` | GET | PUBLIC | 200 OK | Reviews catalog returns reviews including newly submitted review | **PASS** |

### 2.4 Cart, Coupons, Wishlist & Orders (Non-Payment)

| Endpoint | Method | Role | Status Code | Payload / Assertion Evidence | Verdict |
| :--- | :---: | :---: | :---: | :--- | :---: |
| `/api/v1/cart` | GET | STUDENT | 200 OK | Cart items retrieved with subtotal, tax, and total | **PASS** |
| `/api/v1/cart` | POST | STUDENT | 201 Created | Item added to authenticated cart table (`lms_cart_db.cart_items`) | **PASS** |
| `/api/v1/coupons/validate` | POST | STUDENT | 200/400 | Authoritative validation rejects invalid codes and calculates percentage discount | **PASS** |
| `/api/v1/coupons` | GET | ADMIN | 200 OK | Admin retrieved coupon management records | **PASS** |
| `/api/v1/wishlist` | GET | STUDENT | 200 OK | Student wishlist retrieved from `lms_wishlist_db` | **PASS** |
| `/api/v1/orders/my-orders` | GET | STUDENT | 200 OK | Student order history retrieved from `lms_order_db.orders` | **PASS** |

### 2.5 Instructor Workflows (`instructorservice` : 8088 & `courseservice` : 8083)

| Endpoint | Method | Role | Status Code | Payload / Assertion Evidence | Verdict |
| :--- | :---: | :---: | :---: | :--- | :---: |
| `/api/v1/courses` | POST | INSTRUCTOR | 200 OK | Created Course ID: 295 with title, category, and instructor UUID | **PASS** |
| `/api/v1/courses/295/sections` | POST | INSTRUCTOR | 200 OK | Created Section ID: 1142 ("Module 1: Distributed Transactions") | **PASS** |
| `/api/v1/sections/1142/lectures` | POST | INSTRUCTOR | 200 OK | Created Lecture ID: 4545 with video URL and duration | **PASS** |
| `/api/v1/instructors/{id}/courses` | GET | INSTRUCTOR | 200 OK | Returns list of courses authored by instructor | **PASS** |
| `/api/v1/instructors/{id}/dashboard`| GET | INSTRUCTOR | 200 OK | Returns student count, course count, and total engagement | **PASS** |

### 2.6 Admin Portal & CMS Publication (`adminservice` : 8087)

| Endpoint | Method | Role | Status Code | Payload / Assertion Evidence | Verdict |
| :--- | :---: | :---: | :---: | :--- | :---: |
| `/api/v1/admin/courses/295/approve` | PUT | ADMIN | 200 OK | Admin approved course; status updated to "Published" | **PASS** |
| `/api/v1/admin/reports/users` | GET | ADMIN | 200 OK | Total active learners, registration velocity report | **PASS** |
| `/api/v1/admin/reports/courses` | GET | ADMIN | 200 OK | Total published vs draft courses report | **PASS** |
| `/api/v1/admin/reports/orders` | GET | ADMIN | 200 OK | Order completion metrics report | **PASS** |
| `/api/v1/public/landing-page` | GET | PUBLIC | 200 OK | Delivers published CMS JSON with hero, navigation, and statistics | **PASS** |

---

## 3. Negative Security & RBAC Enforcement

1. **Student Access to Admin Endpoints**:
   - Probe: `GET /api/v1/admin/users` with Student Token.
   - Result: **HTTP 403 Forbidden** (`"Insufficient permissions"`).
   - Assertion: Strictly blocked; no administrative data leaked.

2. **Anonymous Access to Student Progress**:
   - Probe: `GET /api/v1/progress/courses/6` with No Authorization Header.
   - Result: **HTTP 401 Unauthorized**.
   - Assertion: Learning progress requires active authenticated session.

3. **Input Validation Integrity**:
   - Probe: `POST /api/v1/courses` with missing `instructorId`.
   - Result: **HTTP 400 Bad Request** (`fieldErrors: { instructorId: "Instructor ID is required" }`).
   - Assertion: Server rejects malformed payloads before database persistence.

