# ASIVO LMS — VERSION 21.2
## Playwright Comprehensive Test Suite Execution Report

**File Reference:** `docs/V21_2_PLAYWRIGHT_TEST_REPORT.md`  
**Execution Script:** `scripts/v21_2_comprehensive_verification.mjs`  
**Results Data:** `scripts/v21_2_verification_results.json`  
**Execution Timestamp:** November 1, 2026, 13:06:46 UTC (18:36:46 IST)  
**Total Test Cases:** 12  
**Passed:** **12 (100%)**  
**Failed:** **0 (0%)**  
**Duration:** 69.24 seconds  
**Screenshots Generated:** 50 full-page PNG captures in `scripts/v21_2_screenshots/`

---

## 1. Test Execution Summary

The Version 21.2 verification suite was executed using Playwright against live running frontend and backend microservices:
- **Frontend Server:** Vite v5 on `http://127.0.0.1:5173`
- **API Gateway:** Spring Cloud Gateway on `http://localhost:8079`
- **User / Auth Service:** Spring Boot on `http://localhost:8091`
- **MailHog SMTP Engine:** `http://localhost:1025` (SMTP) / `http://localhost:8025` (HTTP REST API)

All 12 test suites executed in succession without mocks, mocks data, or fake fallbacks.

---

## 2. Test Execution Matrix

| Test ID | Test Case Title | Target Focus | Assertions Evaluated | Duration | Result |
|---|---|---|---|---|---|
| **`TC-RESP-01`** | Multi-Viewport Responsive Rendering | 10 viewports $\times$ 5 auth pages | 50 screenshots, 0 horizontal overflows | 44.06s | **PASS** |
| **`TC-ALIGN-01`** | Left Panel Alignment Precision | Split-screen zero-jump check | $Y_{\text{diff}}$ on Logo, Badge, Headline, Benefits | 1.74s | **PASS** |
| **`TC-LOGO-01`** | Logo Symbol Centering & Dimensions | 1:1 Symbol bounding geometry | $28 \times 28\text{px}$ in $44 \times 44\text{px}$, $8\text{px}$ equal margins | 0.00s | **PASS** |
| **`TC-A11Y-01`** | Mode Switcher Semantics & Subtitles| ARIA tabs & arrow key navigation | `tablist`, `tab`, `aria-selected`, dynamic subtitle | 1.40s | **PASS** |
| **`TC-LOGIN-01`** | Invalid Password Rejection | 401 Unauthorized handling | Error banner visible, storage completely clean | 1.25s | **PASS** |
| **`TC-LOGIN-02`** | Valid Password Login & Enter Key | Credential auth & redirection | Enter key trigger, 200 OK, land `/student/dashboard` | 1.31s | **PASS** |
| **`TC-LOGIN-03`** | Passwordless OTP Sign In | SMTP delivery & session sync | MailHog OTP `386513`, `syncSession()`, land dashboard | 3.66s | **PASS** |
| **`TC-REG-01`** | Full Registration to Activation | 5-field onboarding lifecycle | MailHog OTP `847695`, account activated, login OK | 7.22s | **PASS** |
| **`TC-REG-02`** | Duplicate Registration Handling | 409 Conflict resilience | 409 warning banner, non-sensitive inputs retained | 2.05s | **PASS** |
| **`TC-REG-03`** | Password Mismatch Validation | Dynamic validation & guard | Real-time mismatch alert, submission guarded | 1.01s | **PASS** |
| **`TC-RESET-01`**| 3-Step Password Recovery E2E | Reset lifecycle with MailHog | MailHog OTP `420919`, new password updated, sign in | 4.26s | **PASS** |
| **`TC-OAUTH-01`**| Social OAuth Truthfulness | Provider configuration check | Genuine Google redirect, honest unconfigured notices | 1.26s | **PASS** |

---

## 3. Detailed Case Findings & Evidence

### 3.1 TC-ALIGN-01: Zero-Jump Vertical Alignment
- **Login Metrics:** Logo $Y=56\text{px}$, Hero $Y=194\text{px}$
- **Registration Metrics:** Logo $Y=56\text{px}$, Hero $Y=194\text{px}$
- **Delta:** **$0.000\text{px}$** difference across all coordinates.
- **Result:** **PASS**. Transitioning between `/login` and `/register` yields zero perceptual jump.

### 3.2 TC-LOGO-01: Symbol Centering
- **Emblem Rendered Size:** $28 \times 28\text{px}$
- **Container Rendered Size:** $44 \times 44\text{px}$
- **Top Margin:** $8.0\text{px}$ | **Bottom Margin:** $8.0\text{px}$
- **Left Margin:** $8.0\text{px}$ | **Right Margin:** $8.0\text{px}$
- **Result:** **PASS**. The symbol is mathematically centered in its rounded square container.

### 3.3 TC-LOGIN-03: MailHog OTP Extraction
- **Recipient:** `anjali.mukherjee@cyberlearnix.test`
- **Subject:** `"Your Asivo Login Code"`
- **Extracted OTP:** `386513`
- **Result:** **PASS**. Successfully verified and redirected to `/student/dashboard`.

### 3.4 TC-REG-01: Registration & Activation
- **Generated Email:** `student.v21_2.1793538460365@asivo.io`
- **Extracted OTP:** `847695`
- **Activation Response:** `200 OK`
- **Result:** **PASS**. User immediately logged in and reached student dashboard.

### 3.5 TC-RESET-01: Password Recovery
- **Extracted OTP:** `420919`
- **New Password:** `NewStudentPass@2026!`
- **Reset Response:** `200 OK`
- **Re-Authentication:** Authenticated on first try with new password.
- **Result:** **PASS**.

---

## 4. Visual Capture Log

50 full-page PNG captures are stored in `scripts/v21_2_screenshots/`:
- `v21_2_login_*.png` (10 files)
- `v21_2_login_otp_mode_*.png` (10 files)
- `v21_2_register_*.png` (10 files)
- `v21_2_forgot_password_*.png` (10 files)
- `v21_2_otp_verify_*.png` (10 files)

**Overall Test Suite Status:** **100% PASS (12 of 12 Passed)**.

