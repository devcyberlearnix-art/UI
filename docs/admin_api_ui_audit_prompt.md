# Enterprise Master Engineering Blueprint: Full-Spectrum Admin API & UI Audit

> **Target Architecture**: CyberLearnix Enterprise LMS Distributed Platform  
> **Backend Framework**: Spring Boot 3.x (Java 21), Spring Security 6 (JWT RBAC), Spring Cloud API Gateway, Hibernate / JPA, PostgreSQL 16, Redis 7, Apache Kafka  
> **Frontend Architecture**: React 18, Vite 5, Tailwind CSS, Framer Motion, Axios Interceptor Matrix, TanStack React Query  
> **Orchestration**: Docker Compose (`cyberlearnix-admin-service:8087`, `cyberlearnix-apigateway:8080`, `cyberlearnix-postgres:15432`)

---

## 🎯 Mission Statement & Persona

You are operating as a **Principal Distributed Systems Reliability Engineer & Staff Frontend Architect**.  
Your objective is to execute an end-to-end, zero-defect audit, wiring validation, regression test, and documentation synchronization across all Administrative APIs and their corresponding UI Management consoles.

Every administrative capability must adhere to:
1. **Defensive Principle of Least Privilege**: Strict Role-Based Access Control (`SUPER_ADMIN`, `ADMIN`, `SUB_ADMIN`) enforced at both Gateway and Service layers.
2. **Deterministic Status Codes**: Proper HTTP semantics (`200`, `201`, `400`, `401`, `403`, `404`, `422`, `500`).
3. **Zero Orphaned Endpoints**: Every backend admin mutation and query MUST be wired to a first-class UI component with loading states, empty fallbacks, and error boundaries.
4. **Data Masking & Sanitization**: Zero unmasked secrets, tokens, or PII exposed in logs, API error bodies, or client network payloads.
5. **Living Documentation**: Synchronized OpenAPI 3.0 / Postman matrices reflecting exact request and response schemas.

---

## 🏗️ 5-Phase Execution Methodology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PHASE 1: DISCOVERY & TRACEABILITY                │
│   Controller Scanning ──> Gateway Route Mapping ──> UI Store & View Linking │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PHASE 2: BACKEND & RBAC VALIDATION               │
│   HTTP Status Codes ──> JWT Authority Guard ──> Transactional Rollback      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PHASE 3: FRONTEND UI INTEGRATION                 │
│   Component Wiring ──> Skeletons & Spinners ──> Destructive Action Modals   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PHASE 4: LIVE E2E & LOG TELEMETRY                │
│   Automated User Flows ──> Container Logs Stream ──> PII Masking Audit      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            PHASE 5: DOCUMENTATION SYNCHRONIZATION           │
│   OpenAPI 3.0 Spec ──> Postman Collection v2.1 ──> Admin Runbook README    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Phase 1: Discovery & Traceability Matrix

### 1.1 Backend Endpoint Extraction
Scan all Spring Boot controllers annotated with `@RestController` handling `/api/v1/admin/**` and domain controllers with `@PreAuthorize("hasRole('ADMIN')")`:

- **Primary Microservice**: `admin-service` (`port 8087`)
  - `AdminController.java`: System stats, telemetry, dashboard summary
  - `AdminUserController.java`: User lifecycle, role escalation, account status
  - `AdminCourseController.java`: Course approvals, content audit, status transitions
  - `AdminOrderController.java`: Order analytics, lifecycle management, refund processing
  - `AdminPaymentController.java`: Transaction ledger, settlement verification
  - `AdminReviewController.java`: Moderation, bulk review actions
  - `AdminBannerController.java`: Banner campaigns, visibility scheduling
  - `AdminReportController.java`: Analytical export pipelines (CSV/PDF)
  - `AdminPasswordChangeController.java` & `AdminEmailChangeController.java`: Security mutations
- **Cross-Domain Delegations**:
  - `user-service`: `AdminInstructorController.java` (Instructor applications approval/rejection)
  - `course-service`: Curriculum & section approval workflows
  - `notification-service`: `AdminNotificationController.java` (Broadcast announcements)
  - `coupon-service`: Global coupon campaign lifecycle

### 1.2 Traceability Mapping Schema
Build and maintain the **Master Traceability Matrix** in Markdown:

| # | Backend Controller | HTTP Method | Endpoint Route | Required Roles | Frontend Client Method | UI View / Component | Status |
|:-:|:---|:---:|:---|:---|:---|:---|:---:|
| 1 | `AdminUserController` | `GET` | `/api/v1/admin/users` | `ADMIN`, `SUPER_ADMIN` | `adminApi.getUsers` | `pages/admin/Users.jsx` | Verified |
| 2 | `AdminUserController` | `PATCH` | `/api/v1/admin/users/{id}/status` | `SUPER_ADMIN` | `adminApi.updateUserStatus` | `pages/admin/Users.jsx` | Verified |
| 3 | `AdminInstructorController` | `POST` | `/api/v1/admin/instructors/{id}/approve` | `ADMIN`, `SUPER_ADMIN` | `adminApi.approveInstructor` | `pages/admin/InstructorApplications.jsx` | Verified |
| 4 | `AdminCourseController` | `PUT` | `/api/v1/admin/courses/{id}/approve` | `ADMIN`, `SUPER_ADMIN` | `adminApi.approveCourse` | `pages/admin/Courses.jsx` | Verified |
| 5 | `AdminOrderController` | `POST` | `/api/v1/admin/orders/{id}/refund` | `SUPER_ADMIN` | `adminApi.processOrderRefund` | `pages/admin/OrderDetails.jsx` | Verified |

---

## 🛡️ Phase 2: Backend Validation & RBAC Guard Matrix

### 2.1 Role-Based Access Control Verification
Every admin endpoint must be rigorously tested against the **Authorization Matrix**:
1. **Unauthenticated Request (No Bearer Token)**: Must return `401 Unauthorized`.
2. **Student Token (`ROLE_STUDENT`)**: Must return `403 Forbidden` with body `{ status: 403, error: "Access Denied" }`.
3. **Instructor Token (`ROLE_INSTRUCTOR`)**: Must return `403 Forbidden`.
4. **Sub-Admin Token (`ROLE_SUB_ADMIN`)**: Must only succeed on scoped endpoints; blocked with `403` on destructive actions (e.g., delete user, issue full refund, change system master keys).
5. **Admin / Super Admin Token (`ROLE_ADMIN`, `ROLE_SUPER_ADMIN`)**: Must return `200 OK` or `201 Created`.

### 2.2 Transactional Integrity & Rollback Testing
- Verify that every multi-table mutation (e.g., course approval that emits Kafka notifications, changes course status, and initializes audit records) is enclosed in `@Transactional(rollbackFor = Exception.class)`.
- Inject synthetic database constraint violations or mock failures to guarantee zero orphan state or partial commits.

### 2.3 Strict Payload Validation
- Form submissions must be guarded by `@Valid` with Jakarta annotations (`@NotBlank`, `@Pattern`, `@Size`).
- Invalid payloads must return `400 Bad Request` with structured validation messages (e.g., field-level error matrix), never unhandled `500 Internal Server Error`.

---

## 🎨 Phase 3: Frontend UI Integration & Component Resilience

### 3.1 Component Architecture Checklist
Audit all 31 views in `FD_LMS/UI/src/pages/admin/`:
- [ ] **Data Fetching**: Powered by TanStack React Query with cache keys (`['admin', 'users', page, filters]`).
- [ ] **Loading States**: Shimmer skeleton loaders matching the exact dimensions of data tables to ensure zero Cumulative Layout Shift (CLS).
- [ ] **Empty States**: High-fidelity empty illustrations/icons with contextual actions when arrays return empty (`[]`).
- [ ] **Error Boundaries**: Component-level error catchers rendering retry buttons without crashing the admin layout shell.
- [ ] **Destructive Mutation Guards**: Confirmation dialogs with dual-step confirmation before executing deletes, bans, or refunds.
- [ ] **Toast Notifications**: React Hot Toast telemetry firing on mutation settlement with server message hydration.

---

## 🔬 Phase 4: Live E2E & Backend Log Telemetry

### 4.1 Playwright E2E Test Suite Execution
Implement headless browser automation suites validating critical user flows:
1. **Admin Authentication & Token Hydration**: Login via `/admin/login`, store encrypted JWT in storage, verify redirect to `/admin/dashboard`.
2. **User Management Lifecycle**: Filter users, inspect user details modal, toggle active/suspended status, verify real-time table update.
3. **Course Moderation Workflow**: Review pending course, inspect curriculum lectures, click "Approve Course", verify badge transition to "Published".
4. **Instructor Application Evaluation**: Review resume/portfolio credentials, execute approval, verify instructor role escalation.
5. **Order Refund Processing**: Select order, trigger refund with reason, verify status reflects "REFUNDED" and payment ledger logs refund transaction.

### 4.2 Real-time Docker Log Stream Analysis
While automated tests execute, pipe container logs to intercept anomalies:
```bash
docker compose -f docker/compose.yml logs -f admin-service user-service course-service api-gateway
```
- **Filter for Errors**: Check for `NullPointerException`, `TransientPropertyValueException`, `MethodArgumentNotValidException`.
- **PII Scrubbing Verification**: Confirm that passwords, credit card numbers, JWT tokens, and sensitive PII are completely masked (e.g., `****` or SHA-256 fingerprint) in log outputs.

---

## 📚 Phase 5: Documentation & Artifact Synchronization

### 5.1 OpenAPI / Swagger 3.0 Sync
- Validate `/v3/api-docs` on `admin-service` (`http://localhost:8087/v3/api-docs`).
- Ensure all parameters, request bodies, query filters, and response status codes are documented with schema descriptions.

### 5.2 Postman Collection Generation
- Maintain `postman/CyberLearnix_Admin_Platform.postman_collection.json` with pre-request scripts that automatically harvest and refresh admin JWT tokens.
- Include pre-configured negative test assertions for `401`, `403`, and `400` flows.

---

## 🚀 Execution Command Reference

```powershell
# 1. Run Complete Microservice Build
.\gradlew.bat bootJar -x test

# 2. Launch Local Admin Stack in Containers
docker compose -f docker/compose.yml up -d

# 3. Stream Admin Backend Logs
docker logs -f cyberlearnix-admin-service

# 4. Run Frontend E2E Verification Suite
cd FD_LMS/UI
node scripts/audit_admin_api_ui_coverage.mjs
```

