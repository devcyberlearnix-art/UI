# FD_LMS / Asivo — Version 19: PayU Sandbox Configuration & Integration Audit

## 1. Executive Summary

This document presents the Phase 1 audit of the PayU India Payment Gateway configuration across the Payment Service, Order Service, API Gateway, Docker deployment environment, and Frontend checkout components.

In Version 19, the Payment Service configuration was updated to support standard PayU India environment variables (`PAYU_KEY`, `PAYU_SALT`, `PAYU_BASE_URL`), handle trailing `/_payment` URL paths idempotently, and properly resolve the internal Course Service URL (`COURSE_SERVICE_URL=http://course-service:8083`) for containerized enrollment dispatch.

In accordance with strict release instructions: **Live sandbox payment execution is designated as `BLOCKED`** because no active, merchant-provisioned PayU Test Sandbox Key or Salt exists in the project `.env` file. Zero simulated payments were accepted as proof of commercial readiness.

---

## 2. Configuration Inspection Matrix

| Configuration Component | Location | Parameter / Variable | Supported State | Audit Finding |
| :--- | :--- | :--- | :---: | :--- |
| **Merchant Key** | `payment-service/application.properties` | `payu.key=${PAYU_KEY:${PAYU_MERCHANT_KEY:XidEdD}}` | `YES` | Supports both standard `PAYU_KEY` and legacy `PAYU_MERCHANT_KEY`. Defaults to `XidEdD`. |
| **Merchant Salt** | `payment-service/application.properties` | `payu.salt=${PAYU_SALT:4JPMTxOzkJMchiHLrdFcSgkcXTuzx1Bd}` | `YES` | Ingests `PAYU_SALT` from environment. |
| **Gateway Base URL** | `payment-service/application.properties` | `payu.base-url=${PAYU_BASE_URL:https://test.payu.in}` | `YES` | Defaults to PayU Test Gateway. |
| **Action URL Normalization** | [PaymentService.java](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/java/com/lms/paymentservice/service/PaymentService.java#L290) | `payuBaseUrl.endsWith("/_payment") ? ...` | `YES` | Handles whether `PAYU_BASE_URL` contains `/_payment` without path duplication. |
| **Course Service URL** | `payment-service/application.properties` | `course-service.url=${COURSE_SERVICE_URL:...}` | `YES` | Routes to internal Docker container `http://course-service:8083` for auto-enrollment. |
| **Active Sandbox Credentials** | `C:\Users\SHIVASAI\OneDrive\Desktop\LMS\.env` | `PAYU_KEY`, `PAYU_SALT` | `NO` | **BLOCKED:** Active merchant sandbox keys are not provisioned in `.env`. |

---

## 3. Audited Source Files & Implementation

### 3.1 Payment Service Configuration (`application.properties`)
**File:** [application.properties](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/resources/application.properties#L14-L26)

```properties
# =========================================================================
# PayU Configuration (Test Sandbox Default)
# =========================================================================
payu.key=${PAYU_KEY:${PAYU_MERCHANT_KEY:XidEdD}}
payu.salt=${PAYU_SALT:4JPMTxOzkJMchiHLrdFcSgkcXTuzx1Bd}
payu.base-url=${PAYU_BASE_URL:https://test.payu.in}
payu.postservice-path=${PAYU_POSTSERVICE_PATH:/merchant/postservice}
payu.payment-links.base-url=${PAYU_PAYMENT_LINKS_BASE_URL:https://uatoneapi.payu.in}

# Course Service Integration for Post-Payment Enrollment
course-service.url=${COURSE_SERVICE_URL:http://course-service:8083}
```

### 3.2 Action URL Idempotent Construction
**File:** [PaymentService.java](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/java/com/lms/paymentservice/service/PaymentService.java#L285-L295) and [PaymentController.java](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/java/com/lms/paymentservice/controller/PaymentController.java#L304)

```java
// Prevents malformed URLs such as https://test.payu.in/_payment/_payment
String payuActionUrl = payuBaseUrl.endsWith("/_payment") ? payuBaseUrl : (payuBaseUrl + "/_payment");
```

### 3.3 Gateway Payment Routes
**File:** `api-gateway/src/main/resources/application.yml`
- Path `/api/v1/payments/**` $\to$ `http://payment-service:8085`
- Permitted unauthenticated callback routes: `/api/v1/payments/callback/**`, `/api/v1/payments/webhook`, `/api/v1/payments/verify`.
- Protected admin routes: `/api/v1/payments/admin/**` (enforces `ROLE_ADMIN`).

### 3.4 Frontend Checkout Handshake
**File:** [CheckoutContainer.jsx](file:///C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/student/CheckoutContainer.jsx#L150-L195)
- Ingests staged order from `GET /api/v1/orders/staged/{orderId}`.
- Displays authoritative order amount calculated by `order-service`.
- Initiates transaction via `POST /api/v1/payments/create`, receiving `txnId`, `hash`, and `payuActionUrl`.

---

## 4. Independent Verification Findings

### Finding 1.1: Configuration Parameter Support
- **Verdict:** `PASS`
- **Location:** [application.properties](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/resources/application.properties#L14-L26)
- **Command:** `node scripts/v19_verification_suite.mjs`
- **Output Evidence:**
  ```json
  {
    "supportsPayuKey": true,
    "supportsPayuSalt": true,
    "supportsPayuBaseUrl": true,
    "supportsCourseServiceUrl": true
  }
  ```
- **Analysis:** The Payment Service accurately recognizes `PAYU_KEY`, `PAYU_SALT`, `PAYU_BASE_URL`, and `COURSE_SERVICE_URL`.

---

### Finding 1.2: Active Sandbox Credentials Availability
- **Verdict:** `BLOCKED`
- **Location:** `C:\Users\SHIVASAI\OneDrive\Desktop\LMS\.env`
- **Command:** `Get-Content C:\Users\SHIVASAI\OneDrive\Desktop\LMS\.env | Select-String "PAYU"`
- **Output Evidence:** `(empty / zero matches)`
- **Reason:** No active PayU Sandbox Merchant Key or Salt has been provisioned. Placeholder key `XidEdD` cannot complete live 3D Secure bank redirects on `https://test.payu.in`.
- **Mandate Enforcement:** In accordance with Version 19 audit rules, live provider sandbox testing is marked `BLOCKED`. Zero simulated payments were accepted as substitutes for real provider integration.

---

## 5. Required Missing Configuration for Production Readiness

To unblock the live sandbox checkout lifecycle, the operations/merchant team must populate the following values in `C:\Users\SHIVASAI\OneDrive\Desktop\LMS\.env`:

```properties
# PayU India Sandbox Merchant Credentials
PAYU_KEY=<merchant_test_key_from_payu_dashboard>
PAYU_SALT=<merchant_test_salt_from_payu_dashboard>
PAYU_BASE_URL=https://test.payu.in/_payment
```

---

## 6. Remaining Limitations

1. **Merchant Onboarding:** Without valid credentials issued by PayU India's test merchant onboarding portal, live end-to-end sandbox authorization loops cannot be executed against the actual PayU acquiring switch.
2. **Secret Governance:** The merchant key and salt must never be committed to source code or logged in stdout/stderr; they must be provided strictly via container environment variables.

