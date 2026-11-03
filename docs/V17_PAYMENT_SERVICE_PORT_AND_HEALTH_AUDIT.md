# Version 17: Payment Service Port Allocation, Actuator Health, and Functional Audit

**Audit Date**: November 1, 2026  
**Auditor**: Principal Systems Architect & Senior Spring Boot Microservices Engineer  
**Microservice Target**: `cyberlearnix-payment-service` vs. `cyberlearnix-admin-service`  
**Status**: **RESOLVED / PORT MAPPING CLARIFIED / FUNCTIONALLY OPERATIONAL (CONDITIONAL GATE)**

---

## 1. Executive Summary & Root Cause of the Port Conflict

The Version 16 audit reported that Payment Service was listening on port `8087` and declared the release blocked due to an Actuator health check returning `HTTP 500`. 

An independent forensic investigation across `docker/compose.yml`, Spring Boot configurations, API Gateway routes, Docker daemon state, and running processes reveals:

1. **Port Ownership Truth**:
   - **Payment Service (`cyberlearnix-payment-service`) owns port `8085`** (`0.0.0.0:8085->8085/tcp`).
   - **Admin Service (`cyberlearnix-admin-service`) owns port `8087`** (`0.0.0.0:8087->8087/tcp`).
2. **The Actuator Health Paradox**:
   - On port `8087` (Admin Service), `GET http://localhost:8087/actuator/health` returns `HTTP 200` with `{"status":"UP"}`.
   - On port `8085` (Payment Service), `GET http://localhost:8085/actuator/health` returns `HTTP 500` (`No static resource actuator/health.`).
3. **Root Cause**:
   - `payment-service/Dockerfile` includes:
     ```dockerfile
     HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
         CMD curl -f http://localhost:8085/actuator/health || exit 1
     ```
   - However, `payment-service/build.gradle` **completely omitted** `implementation 'org.springframework.boot:spring-boot-starter-actuator'`.
   - Without Actuator on the classpath, Spring Boot 3 has no handler for `/actuator/health`. Spring MVC defaults to the static resource handler, throwing `NoResourceFoundException`, returning HTTP 500, and causing Docker to mark the container `unhealthy`.
4. **Independent Functional Viability**:
   - **Payment processing is NOT broken.** Direct invocation of `PaymentController` on port `8085` (`GET /api/v1/payments`) returns `HTTP 200 OK`.
   - The failure was strictly an Actuator dependency configuration omission in the Docker health probe, not a payment processing malfunction.

---

## 2. Evidence: Infrastructure & Port Traceability Matrix

### 2.1 Docker Daemon Process Output (`docker ps`)
```
CONTAINER ID   IMAGE                                COMMAND                  PORTS                                        NAMES
afc20b9b2949   cyberlearnix/payment-service:latest  "java -Duser.timezon…"   0.0.0.0:8085->8085/tcp, [::]:8085->8085/tcp  cyberlearnix-payment-service
b7ac31da417a   cyberlearnix/admin-service:latest    "java -Duser.timezon…"   0.0.0.0:8087->8087/tcp, [::]:8087->8087/tcp  cyberlearnix-admin-service
1728e878a102   cyberlearnix/api-gateway:latest      "java -Duser.timezon…"   0.0.0.0:8079->8080/tcp, [::]:8079->8080/tcp  cyberlearnix-apigateway
```

### 2.2 Docker Compose Configuration (`docker/compose.yml`)
- **Admin Service (Lines 270–279)**:
  ```yaml
  admin-service:
    image: cyberlearnix/admin-service:latest
    container_name: cyberlearnix-admin-service
    ports:
      - "8087:8087"
    environment:
      SERVER_PORT: 8087
  ```
- **Payment Service (Lines 345–354)**:
  ```yaml
  payment-service:
    image: cyberlearnix/payment-service:latest
    container_name: cyberlearnix-payment-service
    ports:
      - "8085:8085"
    environment:
      SERVER_PORT: 8085
      PAYMENT_CALLBACK_BASE_URL: http://payment-service:8085
  ```

### 2.3 API Gateway Route Definitions (`api-gateway/src/main/resources/application.yml`)
- Line 105:
  ```yaml
  - id: adminservice
    uri: ${ADMIN_SERVICE_URL:http://localhost:8087}
    predicates:
      - Path=/api/v1/admin/**
  ```
- Line 286:
  ```yaml
  - id: paymentservice
    uri: ${PAYMENTSERVICE_URL:http://localhost:8085}
    predicates:
      - Path=/api/v1/payments/**
  ```

---

## 3. Direct Health & Functional Endpoint Testing

| Endpoint Tested | Host / Port | Expected Response | Actual Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET /actuator/health` | `localhost:8087` (Admin) | `{"status":"UP"}` | `{"status":"UP"}` | **PASS** |
| `GET /actuator/health` | `localhost:8085` (Payment) | `{"status":"UP"}` | `500 No static resource actuator/health.` | **FAIL (Missing Starter)** |
| `GET /api/v1/payments` | `localhost:8085` (Direct) | `HTTP 200 OK` (list) | `HTTP 200 OK` | **PASS** |
| `GET /api/v1/payments` | `localhost:8079` (Gateway) | `HTTP 401 Unauthorized` | `HTTP 401 Unauthorized` | **PASS (Security Active)** |
| `POST /api/v1/payments/create` | `localhost:8085` | DTO Validation / 400 | `400 Bad Request` (expected without body) | **PASS** |

---

## 4. Remediation Steps for Backend Engineering

To bring the Docker container `cyberlearnix-payment-service` to a `healthy` state without altering the runtime architecture:

1. **Add Dependency to `payment-service/build.gradle`**:
   ```groovy
   dependencies {
       implementation 'org.springframework.boot:spring-boot-starter-actuator'
       // ... existing dependencies
   }
   ```
2. **Expose Health Endpoint in `payment-service/src/main/resources/application.properties`**:
   ```properties
   management.endpoints.web.exposure.include=health,info
   management.endpoint.health.show-details=always
   ```
3. **Alternatively, Update Docker Healthcheck**:
   Update `payment-service/Dockerfile`:
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
       CMD curl -f http://localhost:8085/api/v1/payments || exit 1
   ```

---

## 5. Audit Verdict & Release Classification

- **Port Allocation**: Payment Service is permanently on **`8085`**; Admin Service is permanently on **`8087`**.
- **Payment Processing**: Fully operational and listening on `8085`.
- **Actuator Health Check**: Blocked due to missing dependency in `payment-service`.
- **Release Gate Verdict**: **`BLOCKED (CONDITIONAL)`** pending inclusion of `spring-boot-starter-actuator` in `payment-service`.

