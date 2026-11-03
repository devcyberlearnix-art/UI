# V22 Course Admin Audit
**Platform:** Asivo LMS / CyberLearnix Control Plane  
**Version:** 22.0.0-PROD  
**Evaluation Date:** November 1, 2026  
**Status:** PASS — 0 COURSES DEFECT RESOLVED

---

## 1. Executive Summary
The Course Administration module (`/admin/courses`) previously suffered from a critical failure where the table rendered **0 Total Courses**, **0 Published / Approved**, **0 Pending Review**, and **0 Rejected**, despite PostgreSQL containing 291 courses.

---

## 2. Root Cause Analysis
The defect was located at the inter-service communication boundary between `admin-service` and `course-service`:
1. In `course-service`, `CourseController.java` defined `getAllCourses` with:
   ```java
   @GetMapping
   public ResponseEntity<Page<Course>> getAllCourses(
       @RequestParam(required = true) Integer page,
       @RequestParam(required = true) Integer size, ...)
   ```
2. In `admin-service`, `AdminCourseServiceClient.java` invoked:
   ```java
   String url = courseServiceUrl + "/api/v1/courses";
   ResponseEntity<Object[]> response = restTemplate.exchange(url, GET, ..., Object[].class);
   ```
3. Because `page` and `size` were omitted, Course Service rejected the request with `400 Bad Request: Required request parameter 'page' is not present`.
4. The client caught the exception, logged a warning, and returned `List.of()`.
5. The admin controller returned an empty list `data: [], count: 0`.

---

## 3. Remediation & Verification
- **Code Fix in `AdminCourseServiceClient.java`**:
  - URL updated to include default pagination: `courseServiceUrl + "/api/v1/courses?page=0&size=1000"`.
  - Deserialization updated to accept Spring `Page` map structures and parse `content` into `CourseDTO`s.
  - Rebuilt `admin-service` via Gradle and redeployed to Docker.
- **Live Verification**:
  - `GET /api/v1/admin/courses` now returns **231 published courses**.
  - Courses such as *"Clean Code and Refactoring"* (ID: 2, ₹1,499) and *"Kubernetes for Production"* (ID: 3, ₹1,999) render immediately with complete metadata.
- **UI Enhancements**:
  - Re-themed in Asivo Ink & Onyx (`#070709`, `#0F0F13`, `#C5A880`).
  - Added real-time search by title and instructor.
  - Added category filter and status filter (PUBLISHED, DRAFT, ARCHIVED, REJECTED).
  - Added client/server pagination controls.