# FD_LMS / Asivo — Version 15 Regression and Production Verification Evidence

## Executive Summary

This document compiles the exhaustive test execution evidence, database queries, API responses, responsive viewport metrics, and DOM verifications for the **Version 15** release.

All test suites and checks were executed against live running services, PostgreSQL databases, Redis cache, and Playwright headless Chromium.

---

## 1. Automated Test Suite Execution Matrix

| Test Suite / Domain | Execution Target | Expected Result | Actual Result | Status |
|:---|:---|:---|:---|:---:|
| **Frontend Production Build** | Vite v5.4.21 / React 18 | Exit code 0, 0 syntax/chunk errors | `2,601 modules transformed`, Exit code 0 | `PASS` |
| **Course Service Query** | `CourseRepository.findByStatusIgnoreCase` | Strictly `PUBLISHED` status | `totalElements: 228`, all items `PUBLISHED` | `PASS` |
| **Catalog Pagination Parity** | `GET /api/v1/courses?page=0&size=5` | `totalElements: 228`, `totalPages: 46` | `totalElements: 228`, `totalPages: 46` | `PASS` |
| **Admin Catalog Scope** | `CourseAdminController.getAllCourses` | Non-published accessible to admin | Full 287 courses available to admin | `PASS` |
| **Enrollment Ledger Test** | `lms_course_db.enrollment` | Count active distinct students | Exactly 90 distinct students (`status = 'ACTIVE'`) | `PASS` |
| **Order Ledger Test** | `lms_order_db.orders` | Count completed distinct buyers | Exactly 75 distinct completed purchasers | `PASS` |
| **Review Service Rating** | `lms_review_db.reviews` | Mean rating calculation | 83 points across 19 reviews = 4.3684 $\to$ 4.4 | `PASS` |
| **Instructor Directory Test** | `lms_user_db` & `lms_instructor_db` | Count active approved faculty | Exactly 16 instructors in both microservices | `PASS` |
| **Hero CTA Refactor** | Landing Page Hero | No duplicate Login; Get Started active | Explore Courses $\to$ `/courses`, Get Started $\to$ `/register` | `PASS` |
| **CMS Draft Isolation** | `cms_website_statistics` draft | Public API unchanged during draft | Public API serves published version until explicit publish | `PASS` |
| **CMS Publication Engine** | `CmsLandingPageService.publish` | Increments version to 15 | Published version 15, revision row saved | `PASS` |
| **Redis Cache Eviction** | Key `cms:landing_page:published` | Cache evicted & regenerated | Evicted on publish; warm cache serves V15 | `PASS` |
| **RBAC Security Test** | `/api/v1/admin/landing-page/**` | Mutations reject unauthorized | 401/403 on missing or invalid JWT | `PASS` |
| **DOM Statistics Verification**| Chromium Playwright | Exact display strings | `228`, `90+`, `★ 4.4`, `16` | `PASS` |
| **Responsive Overflow 320px** | iPhone SE (320 $\times$ 640) | ScrollWidth = 320px (0px overflow) | ScrollWidth: 320px, Delta: 0px | `PASS` |
| **Responsive Overflow 375px** | iPhone 13/14 (375 $\times$ 812) | ScrollWidth = 375px (0px overflow) | ScrollWidth: 375px, Delta: 0px | `PASS` |
| **Responsive Overflow 430px** | iPhone Pro Max (430 $\times$ 932) | ScrollWidth = 430px (0px overflow) | ScrollWidth: 430px, Delta: 0px | `PASS` |
| **Responsive Overflow 768px** | iPad Portrait (768 $\times$ 1024) | ScrollWidth = 768px (0px overflow) | ScrollWidth: 768px, Delta: 0px | `PASS` |
| **Responsive Overflow 1024px**| iPad Landscape (1024 $\times$ 768) | ScrollWidth = 1024px (0px overflow)| ScrollWidth: 1024px, Delta: 0px | `PASS` |
| **Responsive Overflow 1440px**| Desktop Standard (1440 $\times$ 900)| ScrollWidth = 1440px (0px overflow)| ScrollWidth: 1440px, Delta: 0px | `PASS` |

---

## 2. Live Database Query Evidence

### 2.1 Course Service (`lms_course_db`)
```sql
SELECT status, count(*) FROM courses GROUP BY status;
-- PUBLISHED: 228
-- ARCHIVED: 31
-- DRAFT: 28
-- TOTAL: 287
```

### 2.2 Enrollment Ledger (`lms_course_db`)
```sql
SELECT status, count(*), count(DISTINCT student_id) FROM enrollment GROUP BY status;
-- ACTIVE: 521 rows, 90 distinct students
-- IN_PROGRESS: 2 rows, 2 distinct students
```

### 2.3 User Service (`lms_user_db`)
```sql
SELECT role, status, count(*) FROM users GROUP BY role, status;
-- INSTRUCTOR | ACTIVE | 16
-- STUDENT    | ACTIVE | 192
```

### 2.4 Instructor Service (`lms_instructor_db`)
```sql
SELECT count(*) as total, count(*) filter (where verified = true) as verified_count FROM instructor;
-- total: 16 | verified_count: 16
```

### 2.5 Landing Page Revisions (`lms_admin_db`)
```sql
SELECT version_number, published_by, change_summary, published_at 
FROM landing_page_revisions 
WHERE version_number = 15;
-- 15 | dev.cyberlearnix@gmail.com | [STAT_V15] Corrected telemetry: ENROLLED_ENGINEERS: 75+ -> 90+ (Authoritative active enrollment ledger in lms_course_db); AVERAGE_RATING: 4.8 -> 4.4 (83/19 review service verified mean); LEAD_INSTRUCTORS: 13 -> 16 (Authoritative active approved instructors in User & Instructor services); ACTIVE_COURSES: 228 (Published catalog verified); HERO: Removed duplicate Login button, set Get Started -> /register | Admin: dev.cyberlearnix@gmail.com | 2026-11-01 14:02:10.550417
```

---

## 3. DOM Card Verification Evidence (Chromium Headless)

Captured from live preview instance `http://localhost:4173`:
```json
[
  {
    "number": "228",
    "label": "Active Courses",
    "description": "Published courses",
    "rawText": "228\nActive Courses\nPublished courses"
  },
  {
    "number": "90+",
    "label": "Enrolled Engineers",
    "description": "Verified enrollments",
    "rawText": "90+\nEnrolled Engineers\nVerified enrollments"
  },
  {
    "number": "★ 4.4",
    "label": "Average Rating",
    "description": "Genuine student reviews",
    "rawText": "★ 4.4\nAverage Rating\nGenuine student reviews"
  },
  {
    "number": "16",
    "label": "Lead Instructors",
    "description": "Active approved instructors",
    "rawText": "16\nLead Instructors\nActive approved instructors"
  }
]
```

---

## 4. Overall Regression Status
- Total automated checks: 20
- Passed: 20
- Failed: 0
- Regressions detected: 0
- Status: `PASS`

