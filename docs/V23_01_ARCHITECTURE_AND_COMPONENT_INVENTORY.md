# V23_01: Architecture & Administrative Component Inventory
**Project:** ASIVO LMS / FD_LMS (CyberLearnix Enterprise Platform)  
**Audit Version:** V23 (Senior Engineering Production Readiness Audit)  
**Execution Date:** 2026-11-01  
**Target Environment:** Microservices Architecture (Spring Boot 3 + React 18 + PostgreSQL 16 + Redis 7 + Docker Gateway)

---

## 1. Architectural Topology & Microservice Ownership

| Service Name | Port | Database | Primary Responsibility in Admin Matrix | Authoritative Data Domains |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway** | `8079` -> `8080` | None | Unified ingress, CORS management, JWT signature validation, route dispatching | Ingress Routing & Auth Verification |
| **User Service** | `8091` | `lms_user_db` | User identity governance, candidate registration, verification status, RBAC profiles | Students (247), Instructors (16), User Sessions |
| **Admin Service** | `8087` | `lms_admin_db` | Governance orchestration, administrative reports, sub-admin lifecycle, CMS audit | Platform Admins (2), Aggregated Telemetry, Reports |
| **Course Service** | `8083` | `lms_course_db` | Curriculum audit, syllabus governance, categories, sections, lectures, student enrollments | Courses (291: 231 Published, 29 Draft, 31 Archived), Enrollments (526) |
| **Instructor Service** | `8088` | `lms_instructor_db` | Instructor verification dossiers, applications, professional credentials | Instructor Profiles (16), Applications |
| **Order Service** | `8084` | `lms_order_db` | Order lifecycle state machine, order items, checkout execution, cancellation tracking | Orders (178: 100 Completed, 56 Pending, 19 Cancelled, 3 Refunded) |
| **Payment Service** | `8085` | `lms_payment_db` | Financial transaction processing, PayU integration, revenue reporting (*OUT OF SCOPE FOR MODIFICATION*) | Payments (110: 102 Success, 7 Failed, 1 Pending), Gross Revenue (₹374,303.04) |

---

## 2. Frontend React Administration Inventory

| Screen Route | React Component | API Client Module | State & Data Dependencies | Identified Vulnerabilities / UI Gaps |
| :--- | :--- | :--- | :--- | :--- |
| `/admin/dashboard` | `src/pages/admin/Dashboard.jsx` | `src/api/adminApi.js` | `/api/v1/admin/reports/*`, `/api/v1/admin/orders` | Hardcoded fallback constants (`usersCount = 263`, `coursesCount = 231`), currency mixing (`$0` vs `₹`), donut chart lacking legend & values, unverified monthly chart range. |
| `/admin/users` | `src/pages/admin/Users.jsx` | `src/api/adminApi.js` | `/api/v1/admin/users`, `/api/v1/admin/reports/users` | 47 pending verification accounts omitted from cards, raw UUID dominant, direct delete action without reversible state, formula injection in export. |
| `/admin/courses` | `src/pages/admin/Courses.jsx` | `src/api/adminApi.js`, `courseApi.js` | `/api/v1/admin/courses`, `/api/v1/courses/:id/students` | **Right-hand Actions column visually clipped** (`overflow-hidden` without `overflow-x-auto`), instructor UUID displayed instead of name, confusing "PATCH" badges, student counts defaulting to 0. |
| `/admin/orders` | `src/pages/admin/Orders.jsx` | `src/api/adminApi.js` | `/api/v1/admin/orders`, `/api/v1/admin/reports/orders` | Conflation of Order vs. Settlement state into single badge, 22 orders (19 cancelled, 3 refunded) excluded from summary, destructive order delete action, unformatted timestamps. |

---

## 3. Database Ownership Verification

### `lms_user_db` (PostgreSQL 16)
- **Table `users`:** 263 records total.
  - Role `STUDENT`: 247 accounts (198 `ACTIVE`, 47 `PENDING_VERIFICATION`, 1 `SUSPENDED`, 1 `DELETED`).
  - Role `INSTRUCTOR`: 16 accounts (16 `ACTIVE`).
- **Table `audit_logs`:** IAM change history and session traces.

### `lms_admin_db` (PostgreSQL 16)
- **Table `admins`:** 2 records total (`MAIN_ADMIN` role).
- **CMS Tables:** `cms_landing_pages`, `cms_sections`, `cms_navigation_items`, `cms_website_statistics`.

### `lms_course_db` (PostgreSQL 16)
- **Table `courses`:** 291 records total.
  - `PUBLISHED`: 228 + `Published`: 3 = **231 Published Courses**.
  - `DRAFT`: 29 courses.
  - `ARCHIVED`: 31 courses.
- **Table `enrollment`:** 526 records total across 283 distinct courses.

### `lms_order_db` (PostgreSQL 16)
- **Table `orders`:** 178 records total.
  - `COMPLETED`: 100 orders (Sum: ₹370,305.04).
  - `PENDING`: 56 orders (Sum: ₹428,967.50).
  - `CANCELLED`: 19 orders (Sum: ₹61,581.60).
  - `REFUNDED`: 3 orders (Sum: ₹44,997.00).
  - Total Initiated Order Volume: ₹905,851.14 (~₹905,854).

### `lms_payment_db` (PostgreSQL 16)
- **Table `payments`:** 110 records total.
  - `SUCCESS`: 102 payments (Sum: ₹374,303.04 -> **Platform Gross**).
  - `FAILED`: 7 payments (Sum: ₹37,993.00).
  - `PENDING`: 1 payment (Sum: ₹1,999.00).
  - Currency: `INR` (`₹`).

