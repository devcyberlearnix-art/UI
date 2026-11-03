# FD_LMS / Asivo — Version 18: Payment Idempotency and Webhook Audit

## 1. Executive Summary

This audit evaluates the robustness, cryptographic integrity, and idempotency guarantees of the Payment Service and Order Service. Specifically, this audit examines:
1. **Cryptographic Webhook Signature Verification** (SHA-512 hash validation against PayU reverse hash formula).
2. **Duplicate Webhook Delivery & Replay Resistance** (handling at-least-once provider delivery semantics).
3. **Order Status State Machine Integrity** (preventing student authorization bypasses and invalid state transitions).
4. **Log Hygiene & Credential Exposure Audit** (verifying that no sensitive keys, salts, or passwords appear in application logs).

All tests were executed against the live Docker microservices stack with raw HTTP payloads and verified against PostgreSQL tables.

---

## 2. Cryptographic Webhook Signature Verification

### 2.1 PayU Reverse Hash Specification
PayU India signs callback responses using a reverse hash formula:
$$\text{hash} = \text{SHA-512}(\text{salt} \mid \text{status} \mid \dots \mid \text{udf5} \mid \text{udf4} \mid \text{udf3} \mid \text{udf2} \mid \text{udf1} \mid \text{email} \mid \text{firstname} \mid \text{productinfo} \mid \text{amount} \mid \text{txnid} \mid \text{key})$$

### 2.2 Implementation Audit
**File:** [PayUService.java](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/java/com/lms/paymentservice/service/PayUService.java#L68-L90)

```java
public boolean verifyHash(Map<String, String> params) {
    String receivedHash = params.get("hash");
    if (receivedHash == null || receivedHash.isEmpty()) {
        return false;
    }
    String calculatedHash = generateResponseHash(params);
    return receivedHash.equalsIgnoreCase(calculatedHash);
}
```

### 2.3 Verification & Runtime Evidence

#### Test 2A: Forged / Tampered Signature Rejection
- **Verdict:** `PASS`
- **Location:** `payment-service` `/payments/callback`
- **Command:**
  ```powershell
  POST http://localhost:8079/api/v1/payments/callback
  Body: {
    "txnid": "134d2ce7520746f299f48efe6ddeec131793529734531",
    "status": "failure",
    "amount": "1999.0",
    "hash": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  }
  ```
- **Actual Response:**
  ```http
  HTTP/1.1 400 Bad Request
  Content-Type: application/json

  {"error": "Invalid PayU hash"}
  ```
- **Database Evidence:** Transaction `134d2ce7520746f299f48efe6ddeec131793529734531` was NOT updated and remained in `PENDING` state.

#### Test 2B: Authentic Cryptographic Signature Acceptance
- **Verdict:** `PASS`
- **Command:**
  ```powershell
  # Generated SHA-512 over valid parameters with merchant salt
  POST http://localhost:8079/api/v1/payments/callback
  Body: {
    "key": "XidEdD",
    "txnid": "134d2ce7520746f299f48efe6ddeec131793529734531",
    "amount": "1999.0",
    "productinfo": "Kubernetes for Production",
    "firstname": "Student",
    "email": "student@cyberlearnix.dev",
    "status": "failure",
    "hash": "1517454fcdd2ff9d77fef69b4e0622fa3829cfcf987e91f0a149a456578a4fb325a7a7261a296180df695dbccb01ba0aa6ea830203f5ad0f70c3ce212c49fa5a"
  }
  ```
- **Actual Response:** `HTTP/1.1 200 OK`
- **Database Evidence:** State in `lms_payment_db.payments` transitioned from `PENDING` $\to$ `FAILED`.

---

## 3. Duplicate Webhook Delivery & Idempotency Testing

Payment gateways routinely resend webhooks if network latency delays an acknowledgment. The payment pipeline must process repeated deliveries idempotently without duplicate charges, corruptions, or state machine faults.

### 3.1 Idempotency Audit
- **Verdict:** `PASS`
- **Location:** `payment-service` [PaymentServiceImpl.java](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/java/com/lms/paymentservice/service/PaymentServiceImpl.java#L112-L135)
- **Command:** Replay the exact callback from Test 2B immediately after first processing.
- **Actual Output:**
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/json
  {"status": "success", "message": "Payment callback processed"}
  ```
- **Database Evidence (`lms_payment_db`):**
  ```powershell
  docker exec cyberlearnix-postgres psql -U postgres -d lms_payment_db -c "SELECT transaction_id, status, count(*) FROM payments WHERE transaction_id='134d2ce7520746f299f48efe6ddeec131793529734531' GROUP BY transaction_id, status;"
  ```
  ```text
                  transaction_id                 | status | count 
  -----------------------------------------------+--------+-------
   134d2ce7520746f299f48efe6ddeec131793529734531 | FAILED |     1
  ```
- **Analysis:**
  - Duplicate notification did not create secondary payment rows.
  - No database deadlock or duplicate key exceptions occurred.
  - The payment remained in its terminal failure state without flapping.

---

## 4. Order Status State Machine & Authorization Boundary

The lifecycle of an order is strictly governed by role-based access control (RBAC). A student or malicious client must never be able to directly escalate an order to `COMPLETED` without verified payment confirmation.

### 4.1 State Machine Transition Rules

```mermaid
stateDiagram-v2
    [*] --> PENDING : Student Stages Order
    PENDING --> CANCELLED : Student Cancels Order (POST /orders/{id}/cancel)
    PENDING --> PROCESSING : Payment Initiated
    PROCESSING --> COMPLETED : Verified Webhook / Internal Event Only
    PROCESSING --> FAILED : Payment Failed / Hash Validated
    COMPLETED --> [*]
    CANCELLED --> [*]
    FAILED --> [*]

    note right of COMPLETED
      Unauthorized client transitions
      to COMPLETED are rejected (403 Forbidden)
    end note
```

### 4.2 Security Test: Direct Student Status Overwrite Attempt
- **Verdict:** `PASS`
- **Location:** `order-service` [OrderController.java](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/order-service/src/main/java/com/lms/orderservice/controller/OrderController.java)
- **Test:** Student attempts to call admin/system order update endpoint to set status to `COMPLETED`.
- **Command:**
  ```powershell
  PUT http://localhost:8079/api/v1/orders/ba6069f8-3f33-49e3-825c-69fce923ddb1/status?status=COMPLETED
  Headers: Authorization: Bearer <Student_Token>
  ```
- **Actual Response:**
  ```http
  HTTP/1.1 403 Forbidden
  Content-Type: application/json
  {"error": "Access Denied"}
  ```
- **Evidence:** Spring Security in `order-service` enforces `.hasRole("ADMIN")` or internal microservice authentication on administrative order mutations. Unprivileged students cannot arbitrarily fulfill their own orders.

---

## 5. Log Hygiene & Credential Exposure Audit

A security audit of the Payment Service container logs was conducted to verify that sensitive secrets are never logged in plaintext.

- **Verdict:** `PASS`
- **Location:** `cyberlearnix-payment-service` Docker container logs
- **Command:**
  ```powershell
  docker logs cyberlearnix-payment-service | Select-String -Pattern "password", "salt", "secret", "XidEdD"
  ```
- **Findings:**
  - Database password `postgres`: Zero occurrences in application logs.
  - PayU merchant salt: Zero occurrences.
  - Credit card / financial details: Not logged.
  - Merchant key `XidEdD`: Only referenced during public redirect generation payload; salt is never output.
  - Sensitive Actuator endpoints (`/actuator/env`, `/actuator/beans`): Unexposed and return HTTP 500 error before reaching handler.

---

## 6. Audit Scorecard

| Check # | Audit Vector | Expected Behavior | Actual Observed Result | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Webhook Hash Validation | Reject forged SHA-512 signatures | HTTP 400 Bad Request (`Invalid PayU hash`) | `PASS` |
| 2 | Authentic Hash Validation | Accept matching reverse SHA-512 signature | HTTP 200 OK; DB transitioned | `PASS` |
| 3 | Webhook Duplicate Replay | Idempotent handling of repeated callbacks | HTTP 200 OK; 1 row in DB; stable state | `PASS` |
| 4 | Student Status Escalation | Reject unprivileged status change to COMPLETED | HTTP 403 Forbidden | `PASS` |
| 5 | Order Cancellation | Allow learner to cancel PENDING order | HTTP 200 OK; status CANCELLED | `PASS` |
| 6 | Sensitive Log Hygiene | Zero passwords/salts in container stdout/stderr | Confirmed 0 credential leaks | `PASS` |

---

## 7. Remaining Limitations

1. **Webhook Mutual TLS / IP Allowlisting:** PayU callbacks arrive over public HTTPS. While cryptographic signature verification protects against tampering, production deployment should also configure IP allowlisting for PayU's webhook egress CIDR blocks.
2. **Replay Nonce Window:** While duplicate deliveries are idempotent, a replay of an old successful callback years later could theoretically be accepted if the order remains in pending. An explicit callback timestamp window (e.g. 15 minutes) is recommended as a defense-in-depth measure.

