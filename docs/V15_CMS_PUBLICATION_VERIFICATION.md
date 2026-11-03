# FD_LMS / Asivo — Version 15 CMS Publication & Lifecycle Verification

## Executive Summary

This document certifies the end-to-end verification of the **Landing Page Content Management System (CMS)** across Version 14 to Version 15 lifecycle transitions. 

The audit verified draft isolation, publication versioning, Redis cache invalidation, RBAC security, audit logging, and payload integrity.

---

## 1. CMS Calculation Modes & Governance

| Calculation Mode | Key Rules & Constraints | Implementation in V15 |
|:---|:---|:---|
| **`AUTOMATIC`** | Strictly derives display value from authoritative service telemetry. Precision and rounding rules applied. | `ACTIVE_COURSES` (228), `AVERAGE_RATING` (★ 4.4), `LEAD_INSTRUCTORS` (16) |
| **`HYBRID`** | Administrator configures a conservative milestone floor with suffix (e.g. `90+`). **Strict Invariant**: Displayed value must NEVER exceed verified source ceiling (`configuredVal <= verifiedSource`). | `ENROLLED_ENGINEERS` (Floor: 90, Source: 90 $\to$ `90+`) |
| **`MANUAL`** | Administrator enters value directly. **Strict Governance**: Mandatory audit justification ($\ge 10$ chars), previous vs new value logging in revision history. | Verified with compliance validation rules |

---

## 2. Publication Lifecycle Audit & Evidence

### 2.1 Draft & Published Isolation
- **Test**: Modified draft statistics (`PUT /api/v1/admin/website-stats`) and draft hero (`PUT /api/v1/admin/landing-page/hero`).
- **Assertion**: Public endpoint `GET /api/v1/public/landing-page` must serve only the current published snapshot (Version 14) and must NOT leak uncommitted draft changes.
- **Result**: `PASS`. Public API returned `publishedVersion: 14` with unchanged values until explicitly published.

### 2.2 Versioning & Revision History
- **Action**: Published revision via `POST /api/v1/admin/landing-page/publish`.
- **Assertion**: Increments `publishedVersion` from 14 to 15; creates an immutable record in `landing_page_revisions`.
- **Database Evidence (`lms_admin_db.landing_page_revisions`)**:
  ```sql
  SELECT version_number, published_by, change_summary, published_at 
  FROM landing_page_revisions 
  WHERE version_number = 15;
  ```
  ```
  version_number: 15
  published_by:   dev.cyberlearnix@gmail.com
  change_summary: [STAT_V15] Corrected telemetry: ENROLLED_ENGINEERS: 75+ -> 90+ (Authoritative active enrollment ledger in lms_course_db); AVERAGE_RATING: 4.8 -> 4.4 (83/19 review service verified mean); LEAD_INSTRUCTORS: 13 -> 16 (Authoritative active approved instructors in User & Instructor services); ACTIVE_COURSES: 228 (Published catalog verified); HERO: Removed duplicate Login button, set Get Started -> /register | Admin: dev.cyberlearnix@gmail.com
  published_at:   2026-11-01 14:02:10.550417
  ```
- **Result**: `PASS`.

### 2.3 Redis Cache Invalidation
- **Action**: On publication, `CmsLandingPageService` executes:
  ```java
  redisTemplate.delete("cms:landing_page:published");
  ```
- **Assertion**: Subsequent `GET /api/v1/public/landing-page` request regenerates the cache with Version 15 data.
- **CLI Verification**:
  ```bash
  docker exec cyberlearnix-redis redis-cli GET cms:landing_page:published
  ```
  Confirmed fresh cache contains `"publishedVersion":15`.
- **Result**: `PASS`.

### 2.4 Cold Restart & Warm Cache Behavior
1. **Cold Start (Cache Miss)**: If Redis is flushed (`redis-cli FLUSHDB`), `CmsLandingPageService` falls back to reading `published_snapshot` from PostgreSQL, deserializes the JSON payload, warms the Redis cache with a 10-minute TTL, and returns HTTP 200.
2. **Warm Cache (Cache Hit)**: Subsequent requests are served directly from Redis in $< 2$ms without hitting the PostgreSQL database.
- **Result**: `PASS`.

### 2.5 Role-Based Access Control (RBAC)
- Public endpoints (`/api/v1/public/**`) serve only published snapshots without authentication.
- Admin endpoints (`/api/v1/admin/landing-page/**`, `/api/v1/admin/website-stats`) require `ROLE_MAIN_ADMIN` or `ROLE_ADMIN` JWT.
- Unauthenticated requests return `HTTP 401 / 403`.
- **Result**: `PASS`.

---

## 3. Public API Payload Verification (Version 15)

```json
{
  "pageKey": "HOME_PAGE",
  "pageStatus": "PUBLISHED",
  "publishedVersion": 15,
  "publishedAt": "2026-11-01T14:02:10.548",
  "hero": {
    "badgeText": "Curriculum",
    "verificationLabel": "Production Standards",
    "heading": "Build Production-Ready Engineering Skills.",
    "headingEmphasis": "Production-Ready",
    "description": "Master backend engineering, distributed systems, cloud architecture, and application security through practical projects and real-world engineering workflows.",
    "primaryCta": {
      "label": "Explore Courses",
      "destination": "/courses",
      "visible": true
    },
    "secondaryCta": {
      "label": "Get Started",
      "destination": "/register",
      "visible": true
    },
    "searchPlaceholder": "Search courses by topic, distributed architecture, or instructor...",
    "searchVisible": true,
    "textAlignment": "center",
    "sectionVisible": true
  },
  "statistics": [
    {
      "label": "Active Courses",
      "value": "228",
      "subtext": "{\"m\":\"A\",\"k\":\"ACTIVE_COURSES\",\"p\":\"\",\"s\":\"\",\"d\":0,\"txt\":\"Published courses\"}",
      "iconName": "BookOpen",
      "displayOrder": 0,
      "isVisible": true
    },
    {
      "label": "Enrolled Engineers",
      "value": "90",
      "subtext": "{\"m\":\"H\",\"k\":\"ENROLLED_ENGINEERS\",\"p\":\"\",\"s\":\"+\",\"d\":0,\"txt\":\"Verified enrollments\"}",
      "iconName": "Users",
      "displayOrder": 1,
      "isVisible": true
    },
    {
      "label": "Average Rating",
      "value": "4.4",
      "subtext": "{\"m\":\"A\",\"k\":\"AVERAGE_RATING\",\"p\":\"★ \",\"s\":\"\",\"d\":1,\"txt\":\"Genuine student reviews\"}",
      "iconName": "Star",
      "displayOrder": 2,
      "isVisible": true
    },
    {
      "label": "Lead Instructors",
      "value": "16",
      "subtext": "{\"m\":\"A\",\"k\":\"LEAD_INSTRUCTORS\",\"p\":\"\",\"s\":\"\",\"d\":0,\"txt\":\"Active approved instructors\"}",
      "iconName": "GraduationCap",
      "displayOrder": 3,
      "isVisible": true
    }
  ]
}
```

---

## 4. Sign-Off & Verification Status
- **CMS Draft/Publish Separation**: `PASS`
- **Redis Cache Invalidation**: `PASS`
- **Cold Restart Resilience**: `PASS`
- **Revision Audit Trail**: `PASS`
- **RBAC Mutation Protection**: `PASS`
- **Status**: `PASS`

