# FD_LMS / Asivo — Version 16 Business Claims & Truth-in-Advertising Audit

**Audit Baseline**: Version 16 Platform Release  
**Auditor**: Principal Systems Architect & Compliance Lead  
**Scope**: Verification of every commercial statement, trust signal, instructor qualification, platform differentiator, and marketing metric against live implementation evidence  

---

## 1. Executive Summary

A learning platform storefront cannot succeed solely on visual design; it requires commercial truthfulness, unforgeable credentials, and credible technical claims. Promising features that the backend cannot execute introduces severe regulatory, legal, and reputation risks.

In Version 16, every marketing claim was subjected to code-level inspection, Docker process audit, and PostgreSQL query validation. Where claims previously overreached (e.g. labeling all faculty "Senior Architects"), the copy and presentation were aligned to verified facts: **16 approved lead instructors** actively authoring courses across 11 running Spring Boot microservices.

---

## 2. Business Claims Verification Matrix

| Platform Claim | Display Location | Implementation Evidence & Runtime Verification | Source Files / Services | Truthfulness Status |
| :--- | :--- | :--- | :--- | :---: |
| **"Live Microservice Sandboxes"** | Production Standards Pillar #1 | 11 Spring Boot services, Redis 7, Kafka 7.5, and PostgreSQL 16 run in Docker. Hands-on coding exercises deploy to sample endpoints. | `docker-compose.prod.yml`<br/>Docker container topology | `PASS` |
| **"Role-Based Access & Security"** | Production Standards Pillar #2 | Spring Security 6.x filter chains enforce strict role boundaries across `STUDENT`, `INSTRUCTOR`, `ADMIN`, `MAIN_ADMIN` using signed JWT tokens and BCrypt password hashing. | `SecurityConfig.java`<br/>`JwtAuthFilter.java` | `PASS` |
| **"Verifiable Master Credentials"** | Production Standards Pillar #3 | Certificates carry a unique UUID and are publicly verifiable without login at `/certifications` and `/verify-certificate/:certificateId`. | `CertificateVerification.jsx`<br/>`course-service` | `PASS` |
| **"Build. Deploy. Verify."** | Workflow Showcase Banner | Practical capstone assignments evaluated against automated unit and integration test suites before certificate generation. | `StudentAssignments.jsx`<br/>`AssignmentsController` | `PASS` |
| **"Active Courses: 228"** | Telemetry Bar Card #1 | `SELECT count(*) FROM courses WHERE status = 'PUBLISHED'` yields exactly 228. Archived (31) and Draft (28) courses are strictly excluded. | `lms_course_db.courses`<br/>`CourseRepository` | `PASS` |
| **"Enrolled Engineers: 90+"** | Telemetry Bar Card #2 | `SELECT count(distinct student_id) FROM enrollment WHERE status = 'ACTIVE'` confirms 90 distinct active students across 521 active enrollment records. | `lms_course_db.enrollment` | `PASS` |
| **"Average Rating: ★ 4.4"** | Telemetry Bar Card #3 | Verified mathematical mean of approved qualifying student reviews in `lms_review_db.reviews`: 83 total rating points across 19 qualifying reviews = 4.3684 $\to$ rounded to 4.4. | `lms_review_db.reviews`<br/>`ReviewService` | `PASS` |
| **"Lead Instructors: 16"** | Telemetry Bar Card #4 | Exactly 16 verified instructors in `lms_instructor_db.instructor` and 16 active instructors in `lms_user_db.users`. | `lms_instructor_db.instructor`<br/>`lms_user_db.users` | `PASS` |
| **"Active Lead Instructors" (Faculty)** | Faculty Showcase Section | Four featured faculty members (`Geeta Kapoor`, `Priyanka Zacharia`, `Suman Chopra`, `Rajendra Mathew`) have published between 15 and 20 real courses on the platform. | `lms_instructor_db`<br/>`lms_course_db` | `PASS` |
| **"Engineers Leveling Up in Real Roles"** | Testimonials Section | Student feedback is backed by approved review records in `lms_review_db.reviews` and managed via CMS (`cms_testimonials`). | `lms_review_db`<br/>`cms_testimonials` | `PASS` |
| **"30-Day Money-Back Guarantee"** | FAQ & Policy Pages | Explicit policy defined: 100% refund within 30 calendar days if $<30\%$ lectures completed and no certificate claimed. Resolves to `/refund`. | `TermsAndPolicies.jsx`<br/>`LandingDashboard.jsx` | `PASS` |

---

## 3. Deep Dive: Architectural Sandbox Verification

### 3.1 Docker Runtime Topology
Running services verified via `docker ps`:
1. `cyberlearnix-apigateway` (Port 8079) — Spring Cloud Gateway
2. `cyberlearnix-admin-service` (Port 8087) — CMS & Administration
3. `cyberlearnix-course-service` (Port 8083) — Catalog, Lessons & Quizzes
4. `cyberlearnix-userservice` (Port 8091) — Auth, Profiles & Applications
5. `cyberlearnix-instructor-service` (Port 8088) — Instructor Hub & Analytics
6. `cyberlearnix-review-service` (Port 8089) — Reviews & Ratings
7. `cyberlearnix-cart-service` (Port 8081) — Shopping Cart
8. `cyberlearnix-order-service` (Port 8084) — Orders & Invoicing
9. `cyberlearnix-wishlist-service` (Port 8090) — Saved Courses
10. `cyberlearnix-coupon-service` (Port 8082) — Discounts & Promotions
11. `cyberlearnix-notification-service` (Port 8093) — WebSocket & Email
12. `cyberlearnix-postgres` (Port 15432) — PostgreSQL 16 Multi-Database
13. `cyberlearnix-redis` (Port 6379) — Redis 7 In-Memory Cache
14. `cyberlearnix-kafka` (Port 9092) — Event Bus & Streaming
15. `cyberlearnix-zookeeper` (Port 2181) — Distributed Coordination

### 3.2 Sandbox Boundary Clarification
- **What is Supported**: Learners interact with real, containerized distributed microservices, inspect live REST endpoints, query PostgreSQL instances, and receive real-time notifications over WebSockets.
- **What is Not Claimed**: We do NOT claim arbitrary per-student virtual machine hypervisors or cloud tenant isolation. The landing page copy was audited to ensure it accurately promises "containerized Spring Boot microservices and live PostgreSQL/Redis persistence" rather than unprovisioned cloud VMs.

---

## 4. Deep Dive: Faculty Credential Audit

| Instructor Name | Database Record ID | Verified Status | Headline in DB | Published Courses in DB | Featured Track |
| :--- | :--- | :---: | :--- | :---: | :--- |
| **Geeta Kapoor** | `ad1a3d02-7caa-4aa6-b1cc-3c2c98324074` | `true` | Software Development | **15 Courses** | Software Engineering & Clean Code |
| **Priyanka Zacharia** | `e7cc7544-0d0e-4e51-b56e-34e9705ce863` | `true` | Software Development | **15 Courses** | Cloud Systems & Kubernetes Infrastructure |
| **Suman Chopra** | `6eeb41db-8431-40a4-a993-c51be65ff030` | `true` | Software Development | **16 Courses** | Distributed Systems & Event Streaming |
| **Rajendra Mathew** | `d62a0438-a787-403b-9ad1-bee320b49eb8` | `true` | Software Development | **20 Courses** | Enterprise Persistence & High-Concurrency DBs |

**Audit Conclusion**: Every displayed faculty member is a verified instructor with a substantial body of real published courses on the platform. Learners clicking an instructor profile are taken to `/courses?search={Name}` where their real catalog tracks are immediately browsable.

---

## 5. Trust Signals & Testimonial Integrity

1. **Origin of Displayed Testimonials**:
   - `Elena Rostova`: Review submitted on course completion; approved in `cms_testimonials`.
   - `Maya Patel`: Real review for Clean Code and Architecture Track (Rating 5.0) in `lms_review_db.reviews`.
   - `Liam O'Connor`: Real review for ETL and Data Warehousing (Rating 5.0) in `lms_review_db.reviews`.
2. **Fabricated Career Claims Avoidance**:
   - We removed unverified salary percentage increases or synthetic company logos.
   - Testimonials accurately highlight curriculum depth, hands-on debugging, and PR review preparation.

