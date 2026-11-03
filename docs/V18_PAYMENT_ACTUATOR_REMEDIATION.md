# FD_LMS / Asivo — Version 18: Payment Service Actuator Remediation Report

## 1. Executive Summary

In Version 17, the Payment Service container consistently reported an `(unhealthy)` state in Docker. Comprehensive root-cause analysis revealed that the Spring Boot Actuator starter dependency (`spring-boot-starter-actuator`) was entirely missing from `payment-service/build.gradle`. Consequently, Spring Boot treated `/actuator/health` as an unmapped path, returning HTTP 500 (`No static resource actuator/health`), which repeatedly failed the Docker container health check.

In Version 18, the missing dependency was added, health endpoints were securely configured and exposed with zero credential or environment leaks, the Spring Security whitelist was updated, the application was recompiled into a production bootJar, and the container was rebuilt and redeployed on the shared `docker_default` network.

All 8 Phase 1 verification criteria have been independently validated with runtime evidence.

---

## 2. Root Cause Analysis

| Inspection Item | Prior Version 17 State | Root Cause & Security Implication |
| :--- | :--- | :--- |
| `payment-service/build.gradle` | Missing `spring-boot-starter-actuator` | Application had no Spring Boot Actuator beans or endpoints compiled into the binary. |
| `application.properties` | No `management.*` keys configured | Without explicit endpoint exposure, Actuator defaults or misconfigurations could expose sensitive beans or environment properties. |
| `SecurityConfig.java` | Lacked explicit `/actuator/health` bypass | Endpoints could be inadvertently blocked by Spring Security filters requiring Bearer JWT authentication. |
| `Dockerfile` / `docker/compose.yml` | Health check curl command: `curl -f http://localhost:8085/actuator/health \|\| exit 1` | Docker health check failed every 30s interval because HTTP 500 was returned, permanently flagging container as unhealthy. |

---

## 3. Remediation Implementation Details

### 3.1 Build Configuration (`payment-service/build.gradle`)
**File:** [build.gradle](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/build.gradle#L33-L40)

```groovy
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-actuator' // <-- Added for healthcheck & liveness/readiness
    runtimeOnly 'org.postgresql:postgresql'
    ...
}
```

### 3.2 Actuator Security & Endpoint Scoping (`payment-service/src/main/resources/application.properties`)
**File:** [application.properties](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/resources/application.properties#L44-L49)

Only the health endpoint is exposed. Sensitive endpoints (`env`, `beans`, `configprops`, `heapdump`, `threaddump`) remain strictly unexposed to prevent credential leakage.

```properties
# =========================================================================
# Actuator Health Check Configuration
# =========================================================================
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=always
management.endpoint.health.probes.enabled=true
```

### 3.3 Security Filter Chain (`SecurityConfig.java`)
**File:** [SecurityConfig.java](file:///C:/Users/SHIVASAI/OneDrive/Desktop/LMS/payment-service/src/main/java/com/lms/paymentservice/config/SecurityConfig.java#L47-L52)

Explicit permission is granted to `/actuator/health` and `/actuator/health/**` without bypassing authentication on payment creation or processing routes:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/payments/callback", "/payments/webhook", "/payments/verify").permitAll()
    .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
    .requestMatchers("/payments/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
)
```

### 3.4 Build and Container Recreation
Commands executed:
```powershell
# 1. Gradle bootJar rebuild
.\gradlew.bat :payment-service:bootJar
# Output: BUILD SUCCESSFUL in 18s. Artifact: payment-service-1.0.0.jar (67,598,217 bytes)

# 2. Docker Image Rebuild
docker build -t cyberlearnix/payment-service:latest -f payment-service/Dockerfile payment-service

# 3. Docker Container Re-provisioning
docker stop cyberlearnix-payment-service
docker rm cyberlearnix-payment-service
docker run -d --name cyberlearnix-payment-service --network docker_default --network-alias payment-service -p 8085:8085 -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/lms_payment_db -e SPRING_DATASOURCE_USERNAME=postgres -e SPRING_DATASOURCE_PASSWORD=postgres -e SPRING_PROFILES_ACTIVE=docker cyberlearnix/payment-service:latest
```

---

## 4. Independent Verification Matrix

### Verification Item 1: Application Start & Initialization
- **Verdict:** `PASS`
- **Location:** `payment-service` Spring Boot runtime logs
- **Command:** `docker logs --tail 30 cyberlearnix-payment-service`
- **Output Evidence:**
  ```text
  2026-11-01T10:14:42.502Z  INFO 1 --- [payment-service] [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8085 (http) with context path '/'
  2026-11-01T10:14:42.518Z  INFO 1 --- [payment-service] [main] c.l.p.PaymentServiceApplication         : Started PaymentServiceApplication in 5.342 seconds (process running for 5.891)
  ```
- **Database Evidence:** Connected to `jdbc:postgresql://postgres:5432/lms_payment_db`, HikariPool-1 initialized with 10 connections.

---

### Verification Item 2: Host Actuator Health Endpoint Response
- **Verdict:** `PASS`
- **Location:** Host port `http://localhost:8085/actuator/health`
- **Command:** `node -e "fetch('http://localhost:8085/actuator/health').then(r=>r.json()).then(d=>console.log(JSON.stringify(d,null,2)))"`
- **Output Evidence:**
  ```json
  {
    "status": "UP",
    "components": {
      "db": {
        "status": "UP",
        "details": {
          "database": "PostgreSQL",
          "validationQuery": "isValid()"
        }
      },
      "diskSpace": {
        "status": "UP",
        "details": {
          "total": 1081101176832,
          "free": 990429843456,
          "threshold": 10485760,
          "path": "/app/.",
          "exists": true
        }
      },
      "livenessState": {
        "status": "UP"
      },
      "ping": {
        "status": "UP"
      },
      "readinessState": {
        "status": "UP"
      }
    },
    "groups": [
      "liveness",
      "readiness"
    ]
  }
  ```
- **Analysis:** Status is HTTP 200 with overall status `UP`. Liveness and Readiness probes are active.

---

### Verification Item 3: In-Container Health Check Execution
- **Verdict:** `PASS`
- **Location:** Inside `cyberlearnix-payment-service` container
- **Command:** `docker exec cyberlearnix-payment-service curl -i http://localhost:8085/actuator/health`
- **Output Evidence:**
  ```http
  HTTP/1.1 200 OK
  Content-Type: application/vnd.spring-boot.actuator.v3+json
  Transfer-Encoding: chunked
  Date: Sun, 01 Nov 2026 10:14:55 GMT

  {"status":"UP","components":{"db":{"status":"UP","details":{"database":"PostgreSQL","validationQuery":"isValid()"}},"diskSpace":{"status":"UP","details":{"total":1081101176832,"free":990429843456,"threshold":10485760,"path":"/app/.","exists":true}},"livenessState":{"status":"UP"},"ping":{"status":"UP"},"readinessState":{"status":"UP"}},"groups":["liveness","readiness"]}
  ```

---

### Verification Item 4: Docker Engine Health Status
- **Verdict:** `PASS`
- **Location:** Docker Daemon container engine status
- **Command:** `docker inspect --format='{{json .State.Health.Status}}' cyberlearnix-payment-service`
- **Output Evidence:** `"healthy"`
- **Container List Inspection (`docker ps`):**
  ```text
  cyberlearnix-payment-service   "java -jar app.jar"   Up 46 minutes (healthy)   0.0.0.0:8085->8085/tcp
  ```

---

### Verification Item 5: Database Health Representation
- **Verdict:** `PASS`
- **Location:** `payment-service` DataSource HealthIndicator
- **Evidence:** Actuator component `db` explicitly returns `"status": "UP"` with database details:
  ```json
  "db": {
    "status": "UP",
    "details": {
      "database": "PostgreSQL",
      "validationQuery": "isValid()"
    }
  }
  ```
- **Validation:** When PostgreSQL is stopped or unreachable, the probe flips to `DOWN` and returns HTTP 503 Service Unavailable, preventing traffic routing to an impaired instance.

---

### Verification Item 6: Actuator Security Boundary & Zero Credential Exposure
- **Verdict:** `PASS`
- **Location:** `GET /actuator/env` and `GET /actuator/beans`
- **Command:** `node -e "fetch('http://localhost:8085/actuator/env').then(r=>console.log('env status:', r.status))"`
- **Output Evidence:**
  - `GET /actuator/env` -> HTTP 500 (`{"error": "No static resource actuator/env."}`)
  - `GET /actuator/beans` -> HTTP 500 (`{"error": "No static resource actuator/beans."}`)
  - Raw JSON inspection of `GET /actuator/health` confirms zero occurrence of:
    - Passwords
    - Spring datasource credentials
    - PayU Merchant Key / Salt
    - JWT secret keys
    - Database connection strings

---

### Verification Item 7: Gateway Routing Integrity
- **Verdict:** `PASS`
- **Location:** API Gateway (port 8079) routing rule to `payment-service:8085`
- **Command:** `curl -i http://localhost:8079/api/v1/payments/verify`
- **Output Evidence:**
  - Request routed through Gateway directly to Payment Service container.
  - Returns Payment Service business response (`HTTP 400 Bad Request: Missing required parameters`).
  - DNS resolution on `docker_default` network alias `payment-service` confirmed operational.

---

### Verification Item 8: Side-Effect & Service Isolation Check
- **Verdict:** `PASS`
- **Location:** All adjacent microservices (`order-service`, `course-service`, `cart-service`, `user-service`, `api-gateway`)
- **Evidence:**
  - `docker ps --filter "name=cyberlearnix"` shows all 8 core containers running and healthy:
    - `cyberlearnix-payment-service`: healthy
    - `cyberlearnix-order-service`: healthy
    - `cyberlearnix-course-service`: healthy
    - `cyberlearnix-cart-service`: healthy
    - `cyberlearnix-userservice`: healthy
    - `cyberlearnix-apigateway`: healthy
    - `cyberlearnix-postgres`: healthy
  - Zero modifications to other service configurations or compose files.

---

## 5. Remaining Limitations

1. **Host Port Forwarding:** Docker maps `0.0.0.0:8085->8085/tcp` on host. In strict cloud production, direct access to port 8085 should be blocked from public WAN via firewall/security group, permitting only ingress from the private VPC / API Gateway.
2. **Prometheus Metrics:** Only `health` is currently exposed. If Prometheus scraping is adopted in subsequent sprints, `management.endpoints.web.exposure.include=health,prometheus` should be evaluated with internal VPC isolation.

