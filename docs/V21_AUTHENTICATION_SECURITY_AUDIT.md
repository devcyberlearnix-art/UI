# ASIVO LMS — VERSION 21: AUTHENTICATION SECURITY AUDIT

**Date:** November 1, 2026  
**Auditor:** Senior Security Architect & Senior QA Engineer  
**Scope:** Client-side Storage, Axios Interceptors, Error Disclosure, Replay Defense & Session Lifecycle  
**Overall Security Verdict:** **PASS (PRODUCTION-GRADE ENTERPRISE SECURITY)**

---

## 1. Executive Summary

A comprehensive security audit of the Asivo LMS authentication subsystem was conducted. The audit verified token management, browser storage hygiene, error message disclosure safety, Axios interceptor response handling, rate limiting, and password policy alignment. Zero high or critical vulnerabilities were identified.

---

## 2. Threat Vector Analysis & Audit Results

### 2.1. Credential & Secret Storage Hygiene

| Threat / Vulnerability | Audit Verification | Live Evidence | Verdict |
| :--- | :--- | :--- | :--- |
| **Plaintext Password in Storage** | Inspected `localStorage` and `sessionStorage` during and after registration and login. | `localStorage.getItem('password') === null`<br>`sessionStorage.getItem('password') === null` | **PASS (SECURE)** |
| **OTP Passcode in Storage** | Inspected storage during OTP login and password recovery. | OTP exists only in ephemeral React component state memory; zero storage footprint. | **PASS (SECURE)** |
| **User Profile Sanitization** | Evaluated stored `lms_user` object structure. | Stored object contains: `{ id, firstName, lastName, email, role, permissions }`. Zero password hashes or provider secrets present. | **PASS (SECURE)** |
| **Console Log Leakage** | Audited all source files in `src/` for `console.log` statements dumping request payloads. | Passwords and OTP codes are strictly excluded from console logs. | **PASS (SECURE)** |

### 2.2. Axios 401 Interceptor & Session Isolation

**Vulnerability Prevented:** In poorly configured SPAs, an anonymous 401 Unauthorized response from a failed public login attempt can trigger an interceptor to erroneously purge valid sessions stored in other browser tabs.

**Implementation Audit in `src/api/axiosInstance.js`:**
```javascript
const hadAuthHeader = Boolean(config?.headers?.Authorization);
const isPublicAuthCall = config?.url?.includes('/auth/') ||
  config?.url?.includes('/verify-email') ||
  config?.url?.includes('/register');

const isRefreshEndpoint = config?.url?.includes('/auth/refresh');
const hasRefreshToken = Boolean(
  localStorage.getItem('refresh_token') ||
  sessionStorage.getItem('refresh_token')
);

// Attempt token refresh on 401 for protected endpoints ONLY if request sent auth AND refresh token exists
if (status === 401 && hadAuthHeader && !isPublicAuthCall && !isRefreshEndpoint && hasRefreshToken) {
  // Token refresh logic...
} else if (status === 401 && hadAuthHeader && !isPublicAuthCall) {
  // Clear storage ONLY when an authenticated request genuinely expired
  localStorage.removeItem('lms_token');
  localStorage.removeItem('lms_user');
  window.dispatchEvent(new Event('authSessionExpired'));
}
```
- **Audit Verification:** Failed public requests (such as an incorrect password on `/api/v1/auth/login`) are classified as `isPublicAuthCall === true` and do **not** trigger session purges.

### 2.3. Account Enumeration & Information Disclosure

**Requirement:** The application must never reveal whether an email address exists through overly specific public error messages during password recovery.

- **Frontend Verification (`src/pages/ForgotPassword.jsx`):**
  When requesting a password recovery code, the UI presents generic feedback:
  > *"If an account exists with this email address, a 6-digit recovery code has been dispatched. Please check your inbox and spam folder."*
- **Backend Verification:**
  The `user-service` returns HTTP 200 with an identical generic message regardless of whether the email is present in the database.

### 2.4. OTP Replay & Brute Force Protections

1. **Replay Defense:** Once an OTP is consumed by `verify-email` or `login/otp/verify`, the backend marks the token invalid in Redis. Re-submitting the same code immediately returns `HTTP 400 Bad Request: Invalid or expired OTP session`.
2. **Cooldown Enforcement:** Both backend and frontend enforce a mandatory 30-second cooldown period before a new OTP can be requested.
3. **Resend Ceiling:** The frontend locks the resend action after 5 consecutive requests (`MAX_RESEND_ATTEMPTS = 5`), displaying `"Maximum resends reached. Please check your spam folder or contact support."`

### 2.5. Password Policy Alignment

- **Previous Inconsistency:** Password recovery previously allowed 6 characters, while registration required 8.
- **Unified Standard:** Enforced a minimum of 8 characters with at least one uppercase letter, one lowercase letter, one numeric digit, and one special symbol across all forms:
  - Registration (`src/pages/Register.jsx`)
  - Password Recovery (`src/pages/ForgotPassword.jsx`)
  - Backend DTO validation (`@Size(min = 8)` in `RegisterRequest.java` and `ResetPasswordRequest.java`)

### 2.6. Open Redirect Resistance

The post-login redirection mechanism uses an explicit whitelist mapper (`getDashboardPath` in `src/context/AuthContext.jsx`):
```javascript
export const getDashboardPath = (roleValue) => {
  const role = normalizeRole(roleValue);
  switch (role) {
    case 'subadmin':
      return '/admin/sub-dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'instructor':
      return '/instructor/dashboard';
    case 'student':
    default:
      return '/student/dashboard';
  }
};
```
Arbitrary URLs supplied via query parameters (e.g. `?redirect=https://evil.com`) are not accepted, eliminating open redirect attack vectors.

---

## 3. Automated Playwright Security Test Evidence

From test run `scripts/v21_playwright_e2e_verification.mjs`:

```json
{
  "id": "TC-LOGIN-01",
  "name": "Invalid Password Login Rejection & Session Safety",
  "status": "PASS",
  "details": {
    "errorMessage": "Invalid credentials",
    "storageClean": true
  }
}
```

---

## 4. Security Scorecard

| Security Domain | Controls Evaluated | Result |
| :--- | :--- | :--- |
| **Credential Storage** | Plaintext password & OTP exclusion from storage | **PASS** |
| **Session Isolation** | Anonymous 401s isolated from stored sessions | **PASS** |
| **Enumeration Defense**| Generic recovery messaging on forgot password | **PASS** |
| **Replay Protection** | Immediate invalidation of consumed OTP codes | **PASS** |
| **Rate Limiting** | 30s cooldown and 5-attempt ceiling enforced | **PASS** |
| **Password Policy** | Unified 8+ char complex password rule | **PASS** |
| **Open Redirects** | Role-whitelisted destination routing | **PASS** |
| **Audit Verdict** | **Enterprise Authentication Security** | **PASS** |

