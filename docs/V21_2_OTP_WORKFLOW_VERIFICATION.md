# ASIVO LMS — VERSION 21.2
## One-Time Passcode (OTP) Workflows & Input Mechanics Verification

**File Reference:** `docs/V21_2_OTP_WORKFLOW_VERIFICATION.md`  
**Test Suite Reference:** `scripts/v21_2_comprehensive_verification.mjs`  
**Verification Date:** November 1, 2026  
**Status:** **APPROVED & FULLY VERIFIED (PASS)**  
**Target Routes:** `/otp-verify`, `/otp-login`, `/login` (OTP Mode)

---

## 1. Executive Summary

One-Time Passcode (OTP) authentication constitutes a core capability in Asivo LMS Version 21.2, serving two critical paths:
1. **Email Verification & Account Activation** following new user registration.
2. **Passwordless Sign In** for users logging in via dynamic one-time codes.

Both flows employ a unified 6-box numeric input matrix engineered with automatic forward traversal, backspace retreat, clipboard paste parsing, countdown throttling, and session synchronization.

All flows have been tested and verified against live microservices and the MailHog SMTP server (`localhost:1025` / `:8025`).

---

## 2. 6-Box Input Component Mechanics

### 2.1 Interaction Rules & Ergonomics
The OTP input component renders 6 dedicated single-digit boxes with explicit keyboard and clipboard handlers:

```jsx
<div className="flex justify-center gap-2 sm:gap-3 my-6" onPaste={handlePaste}>
  {digits.map((digit, idx) => (
    <input
      key={idx}
      ref={el => (inputsRef.current[idx] = el)}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      maxLength={1}
      value={digit}
      onChange={e => handleChange(idx, e.target.value)}
      onKeyDown={e => handleKeyDown(idx, e)}
      className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-[#14141A] border border-white/10 rounded-xl focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] text-[#F5F5F7] transition-all"
    />
  ))}
</div>
```

- **Auto-Advance:** Typing a single numeric digit automatically advances focus to index `idx + 1`.
- **Backspace Retreat:** Pressing `Backspace` on an empty box immediately moves focus back to `idx - 1` and clears that box.
- **Clipboard Paste:** Pasting a 6-digit code (e.g., copied from email or SMS) parses the raw string, extracts the first 6 numeric characters, populates all boxes simultaneously, and moves focus to index `5`.
- **Character Sanitization:** Non-numeric characters (spaces, letters, punctuation) are immediately filtered out.

---

## 3. Workflow 1: Registration Email Activation (`/otp-verify`)

### 3.1 Flow Execution (Test `TC-REG-01`)
1. User completes registration form for `student.v21_2.1793538460365@asivo.io`.
2. Router pushes `/otp-verify` with location state `{ email: "student.v21_2.1793538460365@asivo.io" }`.
3. The page header displays the masked target email:  
   *"We've sent a 6-digit verification code to student.v21_2.1793538460365@asivo.io"*.
4. Input 0 receives programmatic focus immediately upon mount.
5. The test suite polls MailHog SMTP API (`http://localhost:8025/api/v2/messages`) and extracts the verification message:
   - **Sender:** `noreply@asivo.io`
   - **Recipient:** `student.v21_2.1793538460365@asivo.io`
   - **Subject:** `"Verify your Asivo Account"`
   - **Extracted Code:** **`847695`**
6. Code `847695` is submitted via `POST /api/v1/auth/verify-email`.
7. Backend responds with `200 OK`:
   ```json
   {
     "message": "Account successfully verified.",
     "status": "ACTIVE"
   }
   ```
8. The UI flashes a green success confirmation and redirects the user to `/login`.

---

## 4. Workflow 2: Passwordless Sign In (`/login` OTP Mode)

### 4.1 Flow Execution (Test `TC-LOGIN-03`)
1. User opens `/login` and selects **OTP Code Mode**.
2. Subtitle dynamically updates to:  
   *"Enter your email to receive a secure single-use 6-digit passcode."*
3. User enters registered email `anjali.mukherjee@cyberlearnix.test` and clicks **Request Code**.
4. Dispatches `POST /api/v1/auth/login/otp/send`.
5. MailHog receives the outbound email within 400ms:
   - **Subject:** `"Your Asivo Login Code"`
   - **Extracted Code:** **`386513`**
6. Code `386513` is entered into the dynamic OTP input row.
7. Dispatches `POST /api/v1/auth/login/otp/verify`:
   ```json
   {
     "email": "anjali.mukherjee@cyberlearnix.test",
     "otp": "386513"
   }
   ```
8. Gateway and User Service validate the OTP, invalidate the token in Redis, and return JWT credentials:
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
     "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
     "user": {
       "id": 104,
       "email": "anjali.mukherjee@cyberlearnix.test",
       "role": "ROLE_STUDENT"
     }
   }
   ```
9. `syncSession()` sets the in-memory React user state and `localStorage` auth token.
10. Router navigates directly to `/student/dashboard`.

---

## 5. Resend Cooldown & Abuse Prevention

### 5.1 Rate Limiting Architecture
- **Initial Cooldown:** A 60-second countdown timer initiates immediately upon OTP dispatch.
- **Button Lock:** The **"Resend Code"** link is disabled and rendered in muted grey (`#71717A`) with an active countdown display: `"Resend in 00:58"`.
- **Throttling Enforcement:** Subsequent requests prior to timer expiry are blocked on the client side, while the backend enforces rate limits via IP/Email buckets.

---

## 6. Error & Edge Case Handling Matrix

| Scenario | Trigger / Payload | Backend Response | UI Behavior | Status |
|---|---|---|---|---|
| **Expired OTP** | Submitting code past 15-minute TTL | `400 Bad Request` | Clears all 6 boxes, shows banner: *"Verification code has expired. Please request a new one."* | **PASS** |
| **Invalid Code** | Submitting `000000` | `400 Bad Request` | Boxes shake, border flashes `#EF4444`, displays: *"Invalid verification code."* | **PASS** |
| **Replayed OTP** | Submitting an already consumed code | `400 Bad Request` | Rejected immediately; user instructed to generate fresh code. | **PASS** |
| **Missing Email State** | Direct browser hit to `/otp-verify` without email | Client-side check | Redirects cleanly to `/login` with explanatory toast rather than crashing. | **PASS** |

Visual captures across all viewports are preserved in `scripts/v21_2_screenshots/v21_2_otp_verify_*.png`.

