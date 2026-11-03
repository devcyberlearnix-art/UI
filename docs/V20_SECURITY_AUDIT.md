# Asivo LMS — Version 20: Security & Access Control Audit

**Audit Date**: November 1, 2026  
**Scope**: Microservices Fleet Security, Gateway Routing, RBAC Boundaries, and Data Isolation  
**Overall Security Verdict**: **PASS** (Zero critical vulnerabilities; strict role isolation verified)

---

## 1. Authentication & Session Architecture

### 1.1 Password Hashing & Storage
- Passwords stored in `lms_user_db.users` and `lms_admin_db.admins` utilize **BCrypt** with 10 work rounds (`$2a$10$...`).
- Zero plaintext passwords exist in configuration files, databases, or application logs.

### 1.2 JWT Token Mechanics
- **Signature Algorithm**: HMAC-SHA256 (`HS256`).
- **Access Token TTL**: 15 minutes (or 24h development override).
- **Refresh Token Rotation**: Issued with secure HTTP-only cookies and validated against active Redis session entries.
- **Claims Verification**: Tokens strictly bundle `sub` (User UUID), `email`, `role`, and `iss` (`cyberlearnix`).

---

## 2. Role-Based Access Control (RBAC) Verification

Negative testing was conducted to verify that lower-privileged or anonymous actors cannot access restricted endpoints.

| Tested Attack Vector | Actor | Target Endpoint | Expected | Observed | Verdict |
| :--- | :---: | :--- | :---: | :---: | :---: |
| **Admin Route Escalation** | `STUDENT` | `GET /api/v1/admin/users` | 403 Forbidden | 403 Forbidden | **PASS** |
| **Admin Route Escalation** | `ANONYMOUS`| `GET /api/v1/admin/reports/users` | 401 Unauthorized | 401 Unauthorized | **PASS** |
| **Student Progress Snooping** | `ANONYMOUS`| `GET /api/v1/progress/courses/6` | 401 Unauthorized | 401 Unauthorized | **PASS** |
| **Course Creation by Student** | `STUDENT` | `POST /api/v1/courses` | 403 Forbidden | 403 Forbidden | **PASS** |
| **Direct DB Role Modification** | Injection | `PUT /api/v1/users/me` (`role: "ADMIN"`) | Ignored/Rejected | Ignored | **PASS** |

---

## 3. Input Validation & SQL Injection Defenses

### 3.1 ORM Parameterization
- All persistence logic across `course-service`, `user-service`, `admin-service`, and `order-service` uses **Spring Data JPA** with Hibernate parameter binding.
- Probed search queries with SQL meta-characters (`' OR 1=1 --`, `"; DROP TABLE courses;--`). All queries were safely parameterized by `CourseRepository.fetchFastSuggestions(cleanQuery)` without SQL syntax errors or data corruption.

### 3.2 Request Validation (`jakarta.validation`)
- Strict DTO annotations (`@NotNull`, `@NotBlank`, `@Size`, `@Min`) validate request bodies prior to execution.
- Testing `POST /api/v1/courses` without `instructorId` returned HTTP 400 with structured validation errors:
  ```json
  {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "Instructor ID is required",
    "fieldErrors": { "instructorId": "Instructor ID is required" }
  }
  ```

---

## 4. Cross-Origin Resource Sharing (CORS) & Gateway Filters

- **CORS Configuration**: Gateway enforces programmatic `CorsWebFilter` permitting authorized frontend origins (`http://localhost:5173`, `http://localhost:4173`).
- **Sensitive Headers**: Credentials, server versions, and database connection strings are stripped from outbound HTTP headers.
- **Actuator Security**: Sensitive endpoints (`/actuator/env`, `/actuator/beans`, `/actuator/configprops`) are completely disabled; only `/actuator/health` is exposed for container liveness monitoring.

