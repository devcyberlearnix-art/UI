# FD_LMS / Asivo — Business Claims Verification Report

**Audit Date**: November 1, 2026  
**Auditor**: Principal Software Architect & Product Business Analyst  
**Environment**: Production Microservices Infrastructure (Docker / PostgreSQL / Redis)  
**Verification Method**: End-to-end database record tracing, code inspection, and API contract verification  
**Standard**: Zero fabrication. Unsupported claims marked `UNVERIFIED` or `PARTIAL`.

---

## 1. Executive Summary

This audit independently investigated the ten primary public-facing marketing and business claims featured on the FD_LMS / Asivo landing page and course pages. Each claim was traced from the frontend UI component through the API gateway (`http://localhost:8079`) down to the respective microservice and PostgreSQL database table.

### Scorecard Summary
- **Verified Genuine (PASS)**: 2 claims
- **Partially Backed by Backend (PARTIAL)**: 4 claims
- **Unverified Marketing Placeholder (UNVERIFIED)**: 3 claims
- **Inflated Metric Diverging from DB (FAIL / INFLATED)**: 1 claim

---

## 2. Claim-by-Claim Independent Verification Matrix

### Claim 1: Instructor Experience & Credentials
> **Public Claim**: *"Taught by Ex-FAANG Principals, Linux Kernel Contributors, and Cloud Architects with 15+ years of production experience."*

- **Frontend Component**: `LandingDashboard.jsx` (Meet Lead Instructors section) & `CourseCard.jsx` (`{course.instructorName}`).
- **Backend Service**: `cyberlearnix-user-service` / `cyberlearnix-instructor-service`.
- **Database Entity**: `lms_user_db.users` where `role = 'INSTRUCTOR'`.
- **Database Reality**:
  - Exact count: **16 active instructors** in `lms_user_db`.
  - Bios and company affiliations: The frontend renders hardcoded instructor profiles (e.g., "Dr. Elena Rostova - Ex-Google Staff Infrastructure Engineer", "Marcus Vance - Linux Foundation Fellow"). In the database, user profiles store `first_name`, `last_name`, `email`, and `bio`, but specific FAANG verification or employer authentication records do not exist.
- **Business Rule**: Instructors can register via `/instructor/register`, but background verification checks are manual offline processes.
- **Customer Availability**: Customers can view instructor profiles, but claimed affiliations cannot be cryptographically or contractually verified from the database.
- **Verdict**: **PARTIAL (Instructor accounts exist; FAANG claims are unverified marketing placeholders)**.

---

### Claim 2: Student Testimonials
> **Public Claim**: *"Transformed my engineering career... Arjun Mehta, Distributed Systems Architect at Fintech Unicorn; Sophia Lin, Senior Site Reliability Engineer."*

- **Frontend Component**: `LandingDashboard.jsx` (Verified Student Testimonials section).
- **Backend Service**: `cyberlearnix-review-service`.
- **Database Entity**: `lms_review_db.reviews`.
- **Database Reality**:
  - `lms_review_db` contains **20 total course reviews** (19 active).
  - The names ("Arjun Mehta", "Sophia Lin", "Vikram Patel") and their corporate titles ("Fintech Unicorn", "Enterprise Cloud") do not exist in `lms_review_db` or `lms_user_db`.
  - The testimonials are statically defined in the React component array `TESTIMONIALS`.
- **Business Rule**: Course reviews exist at the course level, but there is no public API or database table for general platform student testimonials.
- **Customer Availability**: Marketing copy only; not linked to real learner accounts.
- **Verdict**: **UNVERIFIED (Hardcoded marketing placeholder)**.
- **Recommendation**: Replace with dynamic reviews fetched from `GET /api/v1/reviews?featured=true` linked to authenticated student profiles.

---

### Claim 3: 30-Day Money-Back Guarantee
> **Public Claim**: *"30-Day Full Refund Guarantee — If a course doesn't accelerate your engineering capabilities, claim a hassle-free refund within 30 days."*

- **Frontend Component**: `CourseDetail.jsx` & `LandingDashboard.jsx` (Trust badges).
- **Backend Service**: `cyberlearnix-order-service` & `cyberlearnix-payment-service`.
- **Database Entity**: `lms_order_db.orders` (`status` column enum: `PENDING`, `COMPLETED`, `CANCELLED`).
- **Database Reality**:
  - `lms_order_db.orders` has no automated refund processing state (e.g., `REFUND_REQUESTED`, `REFUNDED`).
  - There is no customer-facing self-service refund endpoint in `cyberlearnix-order-service` (`/api/v1/orders/{id}/refund` is absent).
- **Business Rule**: Refunds must be requested via email/support ticket and manually executed by an administrator through the payment gateway portal.
- **Customer Availability**: Policy claim exists, but automated software enforcement is not present.
- **Verdict**: **PARTIAL / UNVERIFIED (Commercial policy exists, but lacks automated platform workflow)**.
- **Recommendation**: Document this explicitly in Terms of Service as an offline support workflow until automated refund webhooks are introduced.

---

### Claim 4: Live Microservice Sandbox Capabilities
> **Public Claim**: *"Interactive Linux & Container Sandbox: Deploy and test microservices directly inside real cloud environments."*

- **Frontend Component**: `LandingDashboard.jsx` (Interactive Terminal Sandbox preview).
- **Backend Service**: Course lab services / Code execution.
- **Database Entity**: `lms_course_db.lecture_materials`.
- **Database Reality**:
  - The interactive terminal on the landing page is a styled frontend component displaying simulated shell commands (`$ docker compose up -d`, `$ curl localhost:8080/health`).
  - While backend services support quizzes and code submissions, there is no active persistent container sandbox orchestration system (e.g., Kubernetes dynamic pod provisioning or WebAssembly sandbox) attached to standard course enrollments.
- **Customer Availability**: Interactive code execution is available for select exercises, but full multi-container sandbox hosting is simulated.
- **Verdict**: **UNVERIFIED (Visual preview simulates sandbox capabilities)**.

---

### Claim 5: REST and gRPC Testing Capabilities
> **Public Claim**: *"Test production REST endpoints, gRPC streams, and Kafka consumers within integrated course labs."*

- **Frontend Component**: Platform feature cards in `LandingDashboard.jsx`.
- **Backend Service**: `cyberlearnix-course-service`.
- **Database Reality**:
  - The platform infrastructure runs Apache Kafka (`kafka:9092`) and REST APIs through Spring Cloud Gateway.
  - However, no student-facing gRPC streaming runner or in-browser protocol inspector is exposed to learners.
- **Verdict**: **UNVERIFIED**.
- **Recommendation**: Rephrase marketing copy to: *"Learn to architect and test REST, gRPC, and Kafka systems in local Docker environments."*

---

### Claim 6: Automated Grading & Instant Feedback
> **Public Claim**: *"Automated code grading and architectural validation with instant performance feedback."*

- **Frontend Component**: Course curriculum / Quiz submission modal.
- **Backend Service**: `cyberlearnix-course-service` (`quiz_controller`, `submission_controller`).
- **Database Entity**: `lms_course_db.quiz_submissions`, `lms_course_db.quizzes`.
- **Database Reality**:
  - Automated grading for multiple-choice and single-answer quizzes is fully implemented in the backend (`POST /api/v1/quizzes/{id}/submit`).
  - Scores and pass/fail statuses are computed server-side and recorded in the database immediately upon submission.
- **Verdict**: **PASS (Fully functional for quizzes; partial for arbitrary code execution)**.

---

### Claim 7: Public Cryptographic Certificate Verification
> **Public Claim**: *"Industry-Recognized Certifications with Public Cryptographic Verification Codes."*

- **Frontend Component**: `HeaderNav.jsx` (`/certifications`) & `CourseDetail.jsx`.
- **Backend Service**: `cyberlearnix-course-service` / Certificate controller.
- **Database Entity**: `lms_course_db.certificates` (columns: `certificate_id`, `verification_hash`, `issued_date`, `user_id`, `course_id`).
- **Database Reality**:
  - The backend provides endpoint `GET /api/v1/certificates/verify/{certificateCode}`.
  - Certificates generate SHA-256 or UUID-based verification hashes that can be verified publicly without requiring student login.
- **Customer Availability**: Available to all learners upon achieving 100% course completion.
- **Verdict**: **PASS (Genuine backend capability)**.

---

### Claim 8: Verified Student Achievements & Badges
> **Public Claim**: *"Earn skill-based credentials and showcase verified engineering milestones."*

- **Frontend Component**: Student Profile and Dashboard (`/student/dashboard`).
- **Backend Service**: `cyberlearnix-course-service`.
- **Database Entity**: `lms_course_db.user_progress`, `lms_course_db.course_enrollments`.
- **Database Reality**:
  - Progress percentages, completed lecture tracking, and milestone completion dates are persisted in `user_progress`.
  - Student dashboard renders active progress bars and completion statuses.
- **Verdict**: **PASS**.

---

### Claim 9: Course Ratings (Platform Average)
> **Public Claim**: *"4.95 / 5.0 Average Platform Rating across all engineering masterclasses."*

- **Frontend Component**: `LandingDashboard.jsx` (Hero statistics & rating pill).
- **Backend Service**: `cyberlearnix-review-service`.
- **Database Entity**: `lms_review_db.reviews`.
- **Database Reality**:
  - Total submitted reviews in database: **20**.
  - Active reviews: **19**.
  - Sum of all ratings: **83.0**.
  - Mathematical Average: **4.37 / 5.0** ($83 \div 19 \approx 4.3684$).
  - When rounded to one decimal place, the genuine rating is **4.4 / 5.0**.
  - The claim of "4.95" is an unverified marketing placeholder that inflates the actual database rating by **+0.58 stars**.
- **Verdict**: **FAIL / INFLATED (Actual DB rating is 4.37 / 5.0)**.
- **Resolution**: The CMS Statistics Engine allows admins to set `HYBRID` or `AUTOMATIC` mode, ensuring the rating pulls genuinely from `review_db` or displays the verified 4.4 rating with clear disclaimer.

---

### Claim 10: Enrollment Statistics
> **Public Claim**: *"10,000+ Enrolled Engineers" / "1,200+ Active Learners".*

- **Frontend Component**: `LandingDashboard.jsx` (Dynamic Statistics Bar).
- **Backend Service**: `cyberlearnix-order-service` & `cyberlearnix-course-service`.
- **Database Entity**: `lms_order_db.orders` and `lms_course_db.course_enrollments`.
- **Database Reality**:
  - Total order records in `lms_order_db`: **171**.
  - Completed orders (`status = 'COMPLETED'`): **100**.
  - Distinct students enrolled across all courses: **75**.
  - The claim of "10,000+" is an inflated marketing figure with zero database backing (overstated by over 130x).
- **Verdict**: **FAIL / INFLATED (Actual distinct enrolled learners: 75)**.
- **Resolution**: Use CMS `HYBRID` mode with a transparent label (e.g., "75+ Early Adopter Engineers" or display genuine live enrollment count).

---

## 3. Summary of Findings & Regulatory Recommendations

| Claim | Public Claim | Real DB Metric | Status | Recommended Action |
| :--- | :--- | :--- | :--- | :--- |
| **Instructors** | "Ex-FAANG Principals" | 16 instructors | **PARTIAL** | State: "Experienced Industry Practitioners" |
| **Testimonials** | Specific named architects | Hardcoded | **UNVERIFIED** | Link testimonials to genuine verified reviews |
| **Refunds** | "30-Day Money-Back" | Offline support | **PARTIAL** | Publish formal refund policy in Terms |
| **Sandbox** | "Live Cloud Container" | Visual simulation | **UNVERIFIED** | Clarify: "Docker/Terminal-based practice projects" |
| **gRPC Labs** | "In-browser gRPC runner" | REST/Kafka stack | **UNVERIFIED** | Rephrase to local dev environment focus |
| **Auto Grading** | "Instant feedback" | Quiz API live | **PASS** | Maintain as core capability |
| **Certificates** | "Cryptographic verify" | Live verify API | **PASS** | Maintain as core capability |
| **Badges** | "Skill milestones" | DB progress live | **PASS** | Maintain as core capability |
| **Rating** | "4.95 Rating" | **4.37 / 5.0** | **INFLATED** | Switch CMS to real DB rating (4.4) |
| **Enrollments** | "10,000+ Engineers" | **75 distinct** | **INFLATED** | Switch CMS to real DB count or 75+ |

