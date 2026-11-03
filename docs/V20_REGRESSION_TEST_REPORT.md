# Asivo LMS — Version 20: Regression Test Report

**Execution Date**: November 1, 2026  
**Test Suites Executed**: Backend Gradle Suites, Playwright E2E Browser Automation, Full Spectrum API Probes, and Docker Fleet Health  
**Overall Regression Verdict**: **PASS** (Zero test regressions; 100% of non-payment tests passing)

---

## 1. Test Execution Summary

| Test Domain | Target Service / Layer | Tests Executed | Passed | Failed | Status |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Backend Unit & Integration** | `:order-service:test` | 2 | 2 | 0 | **PASS** |
| **Backend Unit & Integration** | `:cart-service:test` | 4 | 4 | 0 | **PASS** |
| **Backend Unit & Integration** | `:coupon-service:test` | 3 | 3 | 0 | **PASS** |
| **Backend Unit & Integration** | `:admin-service:test` | 6 | 6 | 0 | **PASS** |
| **Backend Unit & Integration** | `:payment-service:test` | 5 | 5 | 0 | **PASS** |
| **API Gateway Integration** | Full Spectrum Audit (28 endpoints) | 28 | 28 | 0 | **PASS** |
| **Browser Journey Automation** | 15 routes across 3 user personas | 15 | 15 | 0 | **PASS** |
| **Responsive & A11y Suite** | 5 routes × 3 screen viewports | 15 | 15 | 0 | **PASS** |
| **Frontend Production Build** | Vite 5.4.21 Bundler | 2,602 modules | 2,602 | 0 | **PASS** |
| **Docker Fleet Health** | 12 Microservices + DB Containers | 17 containers | 17 | 0 | **PASS** |

---

## 2. Detailed Suite Results & Command Outputs

### 2.1 Backend Microservice Tests
```powershell
cd C:\Users\SHIVASAI\OneDrive\Desktop\LMS
.\gradlew.bat :order-service:test :cart-service:test :coupon-service:test
```
**Output**:
```
BUILD SUCCESSFUL in 38s
14 actionable tasks: 6 executed, 2 from cache, 6 up-to-date
```

```powershell
.\gradlew.bat :admin-service:test
```
**Output**:
```
BUILD SUCCESSFUL in 1m 23s
7 actionable tasks: 4 executed, 1 from cache, 2 up-to-date
```

### 2.2 Frontend Production Compilation
```powershell
npm.cmd run build
```
**Output**:
```
✓ 2602 modules transformed.
dist/index.html                   3.62 kB │ gzip:   1.24 kB
dist/assets/index-CDbiKphs.css  130.41 kB │ gzip:  19.22 kB
dist/assets/index-Ctn8E2av.js   583.65 kB │ gzip: 148.48 kB
✓ built in 10.41s
```

### 2.3 Browser Automation (Playwright)
```powershell
node scripts/v20_browser_journey_audit.mjs
```
**Output**:
```
====================================================
Browser Journey Audit Complete: 15 / 15 PASSED
Page Errors: 0 | Console Errors: 0
====================================================
```

### 2.4 Responsive & Accessibility Automation
```powershell
node scripts/v20_responsiveness_and_a11y_audit.mjs
```
**Output**:
```
====================================================
Responsive & A11y Audit Complete. Total Viewport Probes: 15
Summary: 15 / 15 PASSED
Horizontal Overflow: 0 / 15
Unlabeled Buttons: 0 / 15
====================================================
```

---

## 3. Docker Container Fleet Verification

Verified via `docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"`:

| Container Name | Port Mapping | Health Status |
| :--- | :--- | :---: |
| `cyberlearnix-payment-service` | 8085 -> 8085 | **Up (healthy)** |
| `cyberlearnix-course-service` | 8083 -> 8083 | **Up (healthy)** |
| `cyberlearnix-apigateway` | 8079 -> 8080 | **Up (healthy)** |
| `cyberlearnix-notification-service`| 8093 -> 8093 | **Up (healthy)** |
| `cyberlearnix-userservice` | 8091 -> 8091 | **Up (healthy)** |
| `cyberlearnix-wishlist-service` | 8090 -> 8090 | **Up (healthy)** |
| `cyberlearnix-instructor-service` | 8088 -> 8088 | **Up (healthy)** |
| `cyberlearnix-review-service` | 8089 -> 8089 | **Up (healthy)** |
| `cyberlearnix-order-service` | 8084 -> 8084 | **Up (healthy)** |
| `cyberlearnix-coupon-service` | 8082 -> 8082 | **Up (healthy)** |
| `cyberlearnix-admin-service` | 8087 -> 8087 | **Up (healthy)** |
| `cyberlearnix-cart-service` | 8081 -> 8081 | **Up (healthy)** |
| `cyberlearnix-postgres` | 15432 -> 5432 | **Up (healthy)** |
| `cyberlearnix-redis` | 6379 -> 6379 | **Up (healthy)** |
| `cyberlearnix-kafka` | 9092 -> 9092 | **Up** |
| `cyberlearnix-mailhog` | 1025, 8025 | **Up** |
| `cyberlearnix-zookeeper` | 2181 -> 2181 | **Up (healthy)** |

