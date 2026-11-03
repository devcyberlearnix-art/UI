# ASIVO LMS — VERSION 21: AUTHENTICATION REGRESSION REPORT

**Date:** November 1, 2026  
**Auditor:** Senior QA Engineer & Lead Security Architect  
**Scope:** Complete End-to-End Regression Matrix Across Web Client & Microservices Mesh  
**Overall Regression Verdict:** **PASS (ZERO REGRESSIONS DETECTED)**

---

## 1. Executive Summary

This regression report documents the functional and architectural verification of all authentication and identity workflows within Asivo LMS Version 21. Every workflow was validated against live backend microservices (Gateway `:8079`, User Service `:8091`, MailHog `:8025`/`:1025`) using both raw REST contracts and end-to-end headless browser automation via Playwright.

---

## 2. Regression Test Suite Execution Summary

```
Total Test Cases:       10
Test Cases Passed:      10 (100%)
Test Cases Failed:       0 (0%)
Test Cases Blocked:      0 (0%)
Production Build:       Clean (0 errors, 23.84s build time)
Docker Mesh Status:     17 / 17 Containers Healthy
```

---

## 3. Comprehensive Test Results Matrix

| Test Case ID | Workflow Description | Verified Behaviors & Assertions | Status | Execution Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **TC-VISUAL-01** | Multi-Viewport Responsive QA | Renders 5 auth pages across 7 viewports (360px to 1920px) without overflow or clipping. | **PASS** | 35 PNG screenshots generated in `scripts/v21_screenshots/` |
| **TC-BRAND-A11Y-01** | Brand & Accessibility Conformance | Confirms Asivo branding, "Learn. Build. Grow." headline, 3 benefit tiles, removes port 8080 telemetry, validates ARIA tablist. | **PASS** | `title: "Sign In \| Asivo Learning Platform"`, `tabPasswordSelected === 'true'` |
| **TC-LOGIN-01** | Invalid Password Rejection | Submits invalid password; confirms HTTP 401, displays inline alert banner, leaves browser storage clean. | **PASS** | `errorMessage: "Invalid credentials"`, `storageClean: true` |
| **TC-LOGIN-02** | Valid Password Authentication | Submits seeded student credentials (`Password13!`); validates token issuance and role redirect to `/student/dashboard`. | **PASS** | `userEmail: "anjali.mukherjee@cyberlearnix.test"`, `role: "student"`, `redirect: /student/dashboard` |
| **TC-LOGIN-03** | Passwordless OTP Authentication | Requests OTP; verifies email delivery in MailHog (`555980`); submits code; confirms session creation & student redirect. | **PASS** | `otpReceived: "555980"`, `targetUrl: ".../student/dashboard"` |
| **TC-REG-01** | Registration → Verification → Sign In | Fills 5 required fields; receives HTTP 201; verifies MailHog OTP (`306668`); activates user (`ACTIVE`); signs in with new credentials. | **PASS** | `registeredEmail: "student.v21.1793536412234@asivo.io"`, `finalDashboard: ".../student/dashboard"` |
| **TC-REG-02** | Duplicate Registration Handling | Re-attempts registration with identical email; asserts HTTP 409 Conflict, displays inline warning, preserves entered name. | **PASS** | `emailError: "...already registered"`, `preservedFirstname: "Grace"` |
| **TC-REG-03** | Inline Password Mismatch Validation | Enters differing passwords in confirmation field; asserts real-time `"Passwords do not match"` warning without network call. | **PASS** | `mismatchDetected: true` |
| **TC-RESET-01** | 3-Step Password Recovery Lifecycle | Submits recovery email; verifies MailHog OTP (`343331`); resets password to `NewSecret123!`; verifies re-authentication. | **PASS** | `recoveryOtp: "343331"`, redirects to `/login` then to `/student/dashboard` |
| **TC-OAUTH-01** | Social Authentication Integrity | Confirms Google button targets real OAuth (`/oauth2/authorization/google`), GitHub/LinkedIn marked `(Unavailable)`, 0 mock users. | **PASS** | `googleButtonRendered: true`, `noFakeSimulations: true` |

---

## 4. Absolute Restrictions Compliance Audit

| Mandate / Absolute Restriction | Audit Finding | Status |
| :--- | :--- | :--- |
| **Do not modify Payment Service** | Verified `git status`. Zero modifications made to `payment-service` backend, DTOs, or database schemas. | **COMPLIANT** |
| **Do not change existing backend contracts without proving a defect** | All existing REST endpoints preserved (`/api/v1/auth/login`, `/register`, `/verify-email`, `/login/otp/**`, `/password/**`). | **COMPLIANT** |
| **Do not break registration &rarr; OTP verification** | E2E registration lifecycle verified with live MailHog OTP extraction. | **COMPLIANT** |
| **Do not remove existing working authentication methods** | Password login, OTP login, and Google OAuth remain fully functional. | **COMPLIANT** |
| **Do not add fake social login** | All client-side mock user simulations removed from `SocialAuthButtons.jsx`. | **COMPLIANT** |
| **Do not hardcode infrastructure status** | Hardcoded port 8080, TLS 1.3, and static "Gateway Online" removed. | **COMPLIANT** |
| **Do not store passwords or OTPs in browser storage** | Audited `localStorage` and `sessionStorage`. Zero credential leakage. | **COMPLIANT** |
| **Do not replace working backend functionality with simulations** | All flows interact with live backend microservices and MailHog. | **COMPLIANT** |
| **Do not redesign the whole application** | Changes strictly isolated to authentication shell, sign-in, registration, OTP, recovery, and legal routes. | **COMPLIANT** |
| **Do not mark an untested flow as complete** | Every flow backed by Playwright automated execution and raw REST assertions. | **COMPLIANT** |

---

## 5. Architectural Remediation Summary

1. **Authentication State Race Condition (`AuthContext.jsx` & `App.jsx`):**
   - *Problem:* `login()` was calling `setLoading(true)`, causing `App.jsx` to unmount the active `<Routes>` tree to render `<PageLoader />`.
   - *Resolution:* Global `loading` in `AuthContext` now strictly tracks initial token bootstrap. Login spinners are managed locally by form components.
2. **Password Recovery Redirection Bug (`ForgotPassword.jsx`):**
   - *Problem:* Resetting a password previously redirected users to `/admin/login`.
   - *Resolution:* Fixed redirect to target `/login` with prefilled email in navigation state.
3. **Password Policy Discrepancy:**
   - *Problem:* Registration required 8 characters while recovery permitted 6.
   - *Resolution:* Standardized on 8+ character complexity across all forms and API payloads.

---

## 6. Regression Verdict

All authentication flows have passed verification with zero defects, zero regressions, and full compliance with architectural restrictions.

**Final Regression Status: PASS**

