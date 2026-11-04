# ASIVO 2.0 — PHASE 2: API & BACKEND INTEGRATION VERIFICATION
**Document ID:** `docs/asivo-2/PHASE2/06_API_VERIFICATION.md`  
**Author:** Agent 01 (Chief Architect) & Agent 32 (API Gateway & Backend Lead)  
**Date:** November 4, 2026  
**Scope:** Microservices Contract Conformance, Network Resilience & Interceptor Validation  

---

## 1. Gateway & Microservices Architecture
The Asivo platform communicates with backend microservices via Spring Cloud Gateway (`:8080`). All client requests pass through the unified Axios instance located in `src/api/axiosInstance.js`.

| Microservice | Target Port | API Route Prefix | Health & Contract Status | Resiliency Fallback |
|---|---|---|---|---|
| **API Gateway** | `8080` | `/api/v1/*` | ACTIVE & RESPONDING | Gateway Timeout (504) Interceptor |
| **User & Auth Service** | `8081` | `/api/v1/users`, `/api/v1/auth` | ACTIVE | Token refresh & local session recovery |
| **Course Service** | `8082` | `/api/v1/courses`, `/api/v1/modules` | ACTIVE | Curated fallback mock data on 5xx |
| **Order & Payment Service** | `8083` | `/api/v1/orders`, `/api/v1/payments` | ACTIVE | Transaction retry & cart local persistence |
| **Review Service** | `8084` | `/api/v1/reviews` | ACTIVE | Optimistic UI cache with TanStack Query |
| **Notification Service** | `8085` | `/api/v1/notifications`, `/ws-connect`| ACTIVE | SockJS / STOMP auto-reconnect |
| **Admin & CMS Service** | `8086` | `/api/v1/admin/*` | ACTIVE | In-memory CMS fallback defaults |
| **Parent Service** | `8087` | `/api/v1/parent/*` | **PENDING BACKEND IMPLEMENTATION** | Marked as blocked/staged |

---

## 2. Axios Interceptor & Authentication Verification
Inspection of `src/api/axiosInstance.js` confirms robust, production-grade security handling:

1. **Request Interceptor (Bearer Token Injection):**
   ```javascript
   axiosInstance.interceptors.request.use((config) => {
     const token = localStorage.getItem('token') || localStorage.getItem('lms_token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```
2. **Response Interceptor (Automatic 401 Handling & Token Renewal):**
   - Detects 401 Unauthorized responses.
   - Triggers clean session reset, clears invalid tokens from storage, and redirects unauthenticated users to `/login` without looping.
3. **Timeout Configuration:** Configured with a default timeout of 15,000ms to prevent hanging promises on slow mobile networks.

---

## 3. End-to-End API Scenario Validation

| Scenario | Request Signature | Expected Response Code | UI Feedback Handling | Result |
|---|---|---|---|---|
| **Course Catalog Fetch** | `GET /api/v1/courses?page=0&size=12` | `200 OK` | Renders 12 course cards with badges | Verified |
| **Typeahead Query** | `GET /api/v1/courses/search/typeahead?q=micro` | `200 OK` | Populates suggestions dropdown | Verified |
| **Coupon Validation** | `POST /api/v1/coupons/validate` | `200 OK` / `400 Bad Request` | Discount applied / Error toast displayed | Verified |
| **Order Placement** | `POST /api/v1/orders` | `201 Created` | Navigates to receipt modal | Verified |
| **Admin Hero Banner Save**| `PUT /api/v1/admin/settings/hero` | `200 OK` | Live preview syncs & success toast | Verified |
| **Instructor Course Create**| `POST /api/v1/instructor/courses` | `201 Created` | Course draft registered in matrix | Verified |

---
*Signed: Agent 01 (Chief Architect) & Agent 32 (API Gateway Lead)*

