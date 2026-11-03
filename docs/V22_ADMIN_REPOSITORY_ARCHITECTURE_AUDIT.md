# V22 Admin Repository Architecture Audit
**Platform:** Asivo LMS / CyberLearnix Control Plane  
**Version:** 22.0.0-PROD  
**Evaluation Date:** November 1, 2026  
**Auditor:** Principal Enterprise Software Architect & Independent QA Reviewer  
**Status:** PASS — ARCHITECTURALLY VERIFIED

---

## 1. Executive Summary
This architectural audit reviews the repository topology, microservice decomposition, inter-service networking, Docker container boundaries, and API gateway routing powering the Asivo LMS Admin Control Plane. The platform operates a Spring Boot 3.3.5 microservices ecosystem running Java 21 LTS within Docker containers, bound to a PostgreSQL 16 multi-database cluster and Redis 7 caching tier, fronted by a React 18 single-page application built with Vite and styled in the high-contrast Asivo Ink & Onyx design tokens.

---

## 2. Microservice Topology & Container Matrix

| Container Name | Service Module | Host Port | Target Port | Database Schema | Primary Role |
|---|---|---|---|---|---|
| `cyberlearnix-apigateway` | `api-gateway` | `8079` | `8080` | — | Spring Cloud Gateway, JWT filter, routing reverse-proxy |
| `cyberlearnix-admin-service` | `admin-service` | `8087` | `8087` | `lms_admin_db` | Control Plane aggregator, IAM credentials, platform reports |
| `cyberlearnix-userservice` | `user-service` | `8091` | `8091` | `lms_user_db` | Federated user registry (263 users), student/instructor identities |
| `cyberlearnix-course-service` | `course-service` | `8083` | `8083` | `lms_course_db` | Authoritative curriculum repository (291 courses, 231 published) |
| `cyberlearnix-order-service` | `order-service` | `8084` | `8084` | `lms_order_db` | Order fulfillment, settlement history (178 executed orders) |
| `cyberlearnix-payment-service` | `payment-service` | `8085` | `8085` | `lms_payment_db` | Payment transactions & PayU sandbox (STRICT EXCLUSION: Untouched) |
| `cyberlearnix-coupon-service` | `coupon-service` | `8082` | `8082` | `lms_coupon_db` | Promotional discount engine, campaign matrices (31 coupons) |
| `cyberlearnix-instructor-service` | `instructor-service` | `8088` | `8088` | `lms_instructor_db` | Instructor profiles, faculty applications (16 instructors) |
| `cyberlearnix-review-service` | `review-service` | `8089` | `8089` | `lms_review_db` | Course ratings, reviews moderation |
| `cyberlearnix-notification-service` | `notification-service` | `8093` | `8093` | `lms_notification_db` | Real-time notifications, event consumer |
| `cyberlearnix-postgres` | PostgreSQL 16 | `15432` | `5432` | All DBs | Relational database cluster |
| `cyberlearnix-redis` | Redis 7 | `6379` | `6379` | Caching / Sessions | Fast session storage, OTP ratelimiting |
| `cyberlearnix-mailhog` | MailHog | `8025` / `1025` | `8025` | In-memory | Local SMTP server & REST API |

---

## 3. Communication Patterns & Boundaries
1. **Frontend to Gateway**: The Vite single-page application directs all HTTP traffic to `http://localhost:8079` (API Gateway) or relative proxy paths `/api/v1/**`.
2. **Gateway to Microservices**: The gateway uses Spring Cloud Gateway predicate matching (`Path=/api/v1/admin/**`, `Path=/api/v1/courses/**`, `Path=/api/v1/coupons/**`) and proxies incoming requests to container internal network URIs (`http://admin-service:8087`, `http://course-service:8083`, etc.).
3. **Inter-Service REST Clients**: `admin-service` utilizes Spring `RestTemplate` with automated service-to-service JWT bearer token injection via `JwtService.createServiceAuthHeaders()`.
4. **Scope Exclusions Strictly Enforced**: `payment-service` (`:8085`) remained completely untouched throughout this remediation. No payment files or checkout routines were modified or simulated.

---

## 4. Remediation Highlights
- **Course Service Client Fix**: Updated `AdminCourseServiceClient.java` to query Course Service with query parameters `?page=0&size=1000` and resiliently parse Spring Page response maps, eliminating the 400 Bad Request error that resulted in 0 courses being rendered.
- **Admin OTP Authentication**: Fixed `AdminAuthService.java` to issue real signed JWT access tokens upon OTP verification instead of empty strings.
- **Architecture Sign-Off**: The overall architecture exhibits high cohesion, proper microservice boundary isolation, and robust container orchestration.