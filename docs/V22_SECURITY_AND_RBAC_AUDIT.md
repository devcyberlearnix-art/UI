# V22 Security & RBAC Audit
**Platform:** Asivo LMS / CyberLearnix Control Plane  
**Version:** 22.0.0-PROD  
**Evaluation Date:** November 1, 2026  
**Status:** PASS — ZERO HARDCODED CREDENTIALS

---

## 1. Executive Summary
This audit validates the authentication state machine, role-based access control (RBAC), token issuance, and password security policies across the administrative surface.

---

## 2. Authentication & Credential Architecture
- **Admin Authentication**: Handled via `admin-service` with BCrypt password hashing (`$2a$10$...`).
- **OTP Fallback**: 6-digit one-time password delivered via SMTP/MailHog with a 5-minute expiration and a strict 30-second resend cooldown.
- **Token Format**: HMAC-SHA384 signed JWT tokens with claims:
  - `role`: `MAIN_ADMIN` / `SUB_ADMIN`
  - `adminType`: `MAIN_ADMIN`
  - `assignedService`: `ALL` or specific microservice
  - `userId`: Admin UUID
  - `iss`: `cyberlearnix`
  - `aud`: `cyberlearnix-clients`
- **Token Lifespans**: Access tokens expire in 15 minutes; refresh tokens in 30 days.

---

## 3. RBAC Enforcement
- Frontend routes under `/admin/**` are protected by `<ProtectedRoute allowedRoles={['admin', 'super_admin', 'sub_admin']}>`.
- Backend endpoints enforce `@PreAuthorize` annotations requiring specific authorities (`MAIN_ADMIN`, `SERVICE_ALL`).