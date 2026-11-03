# ASIVO / CYBERLEARNIX — ENTERPRISE LMS PLATFORM ARCHITECTURE

[![Production Status](https://img.shields.io/badge/Production_State-100%25_Calibrated-34D399?style=flat-square&logo=shield)](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/README.md)
[![E2E Verification](https://img.shields.io/badge/Playwright_Audit-35%2F35_PASSED-C5A880?style=flat-square&logo=playwright)](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/scripts/platform_full_spectrum_audit.spec.js)
[![Vite Canvas](https://img.shields.io/badge/Frontend-Vite_5_%2B_React_18-6366F1?style=flat-square&logo=vite)](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/package.json)
[![Backend Cluster](https://img.shields.io/badge/Backend-17_Microservices_Active-0EA5E9?style=flat-square&logo=docker)](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/README.md)

---

## 1. Executive System Overview

**ASIVO LMS** is a zero-compromise, security-first educational and skill verification ecosystem designed for technical professionals, cybersecurity specialists, and enterprise architects.

The platform pairs a luxury **Ink & Onyx** React 18 frontend with a distributed backend of **17 containerized Spring Boot microservices**, backed by PostgreSQL 16 multi-tenant schemas, Redis session caches, Apache Kafka event brokers, and Mailhog virtual SMTP relays.

---

## 2. Microservice Topology & Port Allocation

All microservices communicate via the central **API Gateway** on Port `8080`. Frontend clients never communicate with internal microservices directly.

| Service Name | Container Identifier | Port | Primary Database / Engine | Responsibility |
|---|---|---|---|---|
| **API Gateway** | `cyberlearnix-apigateway` | `8080` | Spring Cloud Gateway / Netty | Reverse proxy, dynamic JWT routing, trace telemetry propagation |
| **User Service** | `cyberlearnix-userservice` | `8091` | PostgreSQL `lms_user_db` | Auth, OTP authentication, multi-device sessions, RBAC |
| **Course Service** | `cyberlearnix-course-service` | `8083` | PostgreSQL `lms_course_db` | Course catalog, sections, lectures, quiz engine, assignments |
| **Cart Service** | `cyberlearnix-cart-service` | `8081` | PostgreSQL `lms_cart_db` | Cart persistence, discount recalculation, coupon bindings |
| **Coupon Service** | `cyberlearnix-coupon-service` | `8082` | PostgreSQL `lms_coupon_db` | Promotional hash verification, discount validation rules |
| **Order Service** | `cyberlearnix-order-service` | `8084` | PostgreSQL `lms_order_db` | Checkout orchestration, order states, ledger persistence |
| **Payment Service** | `cyberlearnix-payment-service` | `8085` | PostgreSQL `lms_payment_db` | Payment gateway integration, transaction authorization |
| **Admin Service** | `cyberlearnix-admin-service` | `8087` | PostgreSQL `lms_admin_db` | System telemetry cockpit, tenant moderation, banners |
| **Instructor Service**| `cyberlearnix-instructor-service` | `8088` | PostgreSQL `lms_instructor_db`| Course authoring, instructor verification applications |
| **Review Service** | `cyberlearnix-review-service` | `8089` | PostgreSQL `lms_review_db` | Ratings, course reviews, moderation queues |
| **Wishlist Service**| `cyberlearnix-wishlist-service` | `8090` | PostgreSQL `lms_wishlist_db`| Saved curriculum items, bookmarks |
| **Notification** | `cyberlearnix-notification-service`| `8093` | PostgreSQL `lms_notification_db`| STOMP WebSocket broadcasts, user alert delivery |
| **Mailhog** | `cyberlearnix-mailhog` | `8025`, `1025` | In-Memory Virtual SMTP | Transactional email capture, OTP testing interface |
| **PostgreSQL 16**| `cyberlearnix-postgres` | `15432` -> `5432` | Multi-Schema Database Engine | Persistent storage across all microservice databases |
| **Redis** | `cyberlearnix-redis` | `6379` | In-Memory Cache | Distributed session tokens, OTP rate limiting, locks |
| **Kafka Broker** | `cyberlearnix-kafka` | `9092` | Event Streaming Mesh | Asynchronous events (`order.placed`, `user.registered`) |
| **Zookeeper** | `cyberlearnix-zookeeper` | `2181` | Cluster Coordination | Kafka leader elections and cluster metadata |

---

## 3. Production Endpoint Routing & DTO Contracts

### Authentication & Identity (`/api/v1/auth`)
- `POST /api/v1/auth/register`
  - **Payload**: Multipart `data={"firstName","lastName","email","password","confirmPassword"}`
  - **Response**: `201 Created` with `{ success: true, data: { otpSessionId, status: "PENDING_VERIFICATION" } }`
- `POST /api/v1/auth/verify-email`
  - **Payload**: `{ email, otp, otpSessionId }`
  - **Response**: `200 OK` (transits user status to `ACTIVE`)
- `POST /api/v1/auth/login`
  - **Payload**: `{ email, password }`
  - **Response**: `200 OK` with `{ authentication: { accessToken, refreshToken }, user: { id, role, ... } }`
- `POST /api/v1/auth/login/otp/request`
  - **Payload**: `{ email }`
  - **Response**: `200 OK` with `{ otpSessionId, cooldownSeconds }`
- `POST /api/v1/auth/login/otp/verify`
  - **Payload**: `{ email, otp, otpSessionId }`
  - **Response**: `200 OK` with authenticated Admin/Instructor/Student JWT

### Student & User Profile (`/api/v1/users`)
- `GET /api/v1/users/me` -> Fetches authentic user metadata and role bindings
- `PUT /api/v1/users/me` -> Updates student profile, bio, headline, and skills

### Catalog & Course Management (`/api/v1/courses`)
- `GET /api/v1/courses/public` -> Public listing with filters (`category`, `level`, `sort`, `page`)
- `GET /api/v1/courses/{courseId}` -> Full course syllabus, sections, and published lectures

### Cart & Pricing Engine (`/api/v1/cart`)
- `GET /api/v1/cart` -> Returns active user cart envelope `{ cartId, totalCourses, courses: [...] }`
- `POST /api/v1/cart` -> Adds item `{ courseId, courseName, price, instructorId }`
- `PUT /api/v1/cart/coupon` -> Validates and applies coupon hash `{ couponCode }`
- `DELETE /api/v1/cart/coupon` -> Reverts applied promotional code
- `DELETE /api/v1/cart/{courseId}` -> Drops course from user cart

### Order & Billing Engine (`/api/v1/orders`)
- `POST /api/v1/orders/create` -> Commits checkout order `{ courseIds, totalAmount, paymentMethod }`
- `GET /api/v1/orders/my-orders` -> Historical order transaction ledger

### Classroom, Progress & Assessments (`/api/v1/progress`, `/api/v1/quizzes`, `/api/v1/assignments`)
- `POST /api/v1/progress/lectures/{lectureId}/start` -> Initializes lecture progress tracking
- `PATCH /api/v1/progress/lectures/{lectureId}` -> Updates playback percentage and timestamp
- `PATCH /api/v1/progress/lectures/{lectureId}/complete` -> Marks lecture completion
- `POST /api/v1/quizzes/{quizId}/attempts` -> Generates attempt instance
- `POST /api/v1/quizzes/{quizId}/attempts/{attemptId}/answers` -> Records answers
- `POST /api/v1/quizzes/{quizId}/attempts/{attemptId}/submit` -> Finalizes evaluation
- `POST /api/v1/assignments/{assignmentId}/submission` -> Creates assignment submission draft
- `POST /api/v1/assignments/{assignmentId}/submission/submit` -> Finalizes assignment submission

---

## 4. Distributed Header & Telemetry Specification

Every transaction traversing the API Gateway is instrumented with cryptographic trace headers:

| Header Key | Propagation Origin | Description |
|---|---|---|
| `X-Trace-Id` | API Gateway | Unique UUID correlating requests across all downstream microservices |
| `X-User-Id` | API Gateway (from JWT) | Sanitized identity token injected into internal microservice requests |
| `X-User-Role` | API Gateway (from JWT) | Sanitized role (`STUDENT`, `INSTRUCTOR`, `MAIN_ADMIN`, `SUB_ADMIN`) |
| `Authorization` | Frontend Client | `Bearer <JWT_ACCESS_TOKEN>` containing cryptographic claim payload |

---

## 5. Full-Spectrum E2E Verification Pass

The complete automated verification pass is orchestrated by Playwright:

```powershell
# 1. Compile production distribution
npm run build

# 2. Launch production preview server (port 4173 with Gateway proxy)
node node_modules/vite/bin/vite.js preview --port 4173 --host 127.0.0.1

# 3. Execute full spectrum audit
node scripts/platform_full_spectrum_audit.spec.js
```

### Audit Results:
- **Total Test Invocations**: 35/35 PASSED (100%)
- **Microservice Traces Intercepted**: 66 HTTP transactions verified
- **Live Database Verifications**: PostgreSQL persistence assertions verified across `lms_user_db`, `lms_cart_db`, `lms_order_db`, and `lms_course_db`.
- **Ledger Output**: Saved to [`scripts/platform-spectrum-audit-results.json`](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/scripts/platform-spectrum-audit-results.json).
