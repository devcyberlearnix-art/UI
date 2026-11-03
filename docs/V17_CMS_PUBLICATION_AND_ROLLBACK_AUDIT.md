# Version 17: CMS Publication, Cache Invalidation, and Rollback Procedures

**Audit Date**: November 1, 2026  
**Auditor**: Principal Enterprise Architect & Database Operations Lead  
**Component Scope**: Admin Service (:8087), Redis (:6379), `lms_admin_db`  
**Current Active Version**: **Version 16**  
**Status**: **VERIFIED & OPERATIONAL (PASS)**

---

## 1. Executive Summary

This document verifies the CMS content management architecture, Redis caching governance, RBAC enforcement on admin channels, and version rollback capabilities for the storefront.

---

## 2. Active Publication State

### 2.1 Public Endpoint Validation
Endpoint: `GET /api/v1/public/landing-page`  
Host: `http://localhost:8079/api/v1/public/landing-page` (via API Gateway) or `http://localhost:8087/api/v1/public/landing-page` (direct)  
Output Status: `HTTP 200 OK`  
Key Verification Fields:
```json
{
  "publishedVersion": 16,
  "hero": {
    "headline": "Production-Ready Engineering Skills & Architecture",
    "primaryCta": { "label": "Explore Courses", "destination": "#catalog" },
    "secondaryCta": { "label": "Get Started", "destination": "/register" }
  },
  "statistics": [
    { "id": "courses", "value": 228, "label": "Active Courses" },
    { "id": "learners", "value": 90, "suffix": "+", "label": "Enrolled Engineers" },
    { "id": "rating", "value": 4.4, "label": "Average Rating", "context": "19 reviews" },
    { "id": "instructors", "value": 16, "label": "Lead Instructors" }
  ]
}
```

- **Draft Content Protection**: Draft sections edited in the Admin Workspace (`/admin/website-management`) are stored with `is_published = false` in `lms_admin_db` and are **never** returned by `/public/landing-page`.
- **Purge of Test Records**: Test data items (`Cloud Matrix #...` pointing to `/cloud`) have been completely purged from `cms_navigation_items`.

---

## 3. Redis Caching & Invalidation Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Platform Admin
    participant AdminUI as Admin Hub
    participant AdminSvc as Admin Service (:8087)
    participant Redis as Redis Cache (:6379)
    participant DB as PostgreSQL (lms_admin_db)
    actor Visitor as Storefront Visitor

    Admin->>AdminUI: Modifies Hero Copy & Clicks "Publish Changes"
    AdminUI->>AdminSvc: POST /api/v1/admin/landing-page/publish
    AdminSvc->>DB: INSERT INTO cms_page_versions (version=17, snapshot=...)
    AdminSvc->>DB: UPDATE cms_page_sections SET is_published=true
    AdminSvc->>Redis: DEL cms:landing_page:published
    AdminSvc-->>AdminUI: HTTP 200 { publishedVersion: 17 }

    Visitor->>AdminSvc: GET /api/v1/public/landing-page
    AdminSvc->>Redis: GET cms:landing_page:published (Cache Miss)
    AdminSvc->>DB: SELECT * FROM cms_page_sections WHERE is_published=true
    AdminSvc->>Redis: SET cms:landing_page:published (TTL=86400s)
    AdminSvc-->>Visitor: HTTP 200 { publishedVersion: 17 }
```

- **Cache Key**: `cms:landing_page:published`
- **Cache Eviction**: Dispatched synchronously upon successful transaction commit in `CmsAdminService.publishLandingPage()`.
- **TTL**: 24 hours (86,400 seconds) with fallback revalidation.

---

## 4. Rollback Procedures & Version History

### 4.1 Historical Version Snapshots (`lms_admin_db.cms_page_versions`)
Every publication creates an immutable snapshot of all published sections:
```sql
SELECT version_number, published_at, published_by, description 
FROM cms_page_versions 
ORDER BY version_number DESC;
```
Result:
```
 version_number |        published_at         | published_by |             description              
----------------+-----------------------------+--------------+--------------------------------------
             16 | 2026-11-01 14:45:00.128456  | admin@asivo  | Version 16 Production Storefront Alignment
             15 | 2026-11-01 13:30:12.894120  | admin@asivo  | Version 15 Telemetry Reconciliation
             14 | 2026-10-31 22:15:45.340112  | admin@asivo  | Initial CMS Configuration
```

### 4.2 Step-by-Step Emergency Rollback Runbook
If an emergency rollback to Version 15 is required:

1. **Option A: Via Admin REST API**:
   ```bash
   curl -X POST http://localhost:8079/api/v1/admin/landing-page/rollback/15 \
     -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
   ```
   *The Admin Service reads Version 15 snapshot, overwrites current tables, evicts Redis, and publishes Version 15.*

2. **Option B: Via SQL & Redis Direct CLI**:
   ```bash
   # 1. Update version pointer in PostgreSQL
   psql -U cyberlearnix -h localhost -p 15432 -d lms_admin_db -c "
     UPDATE cms_settings SET current_version = 15;
   "
   # 2. Flush Redis published cache
   redis-cli -h localhost -p 6379 DEL cms:landing_page:published
   ```

3. **Verification**:
   ```bash
   curl -s http://localhost:8079/api/v1/public/landing-page | grep "publishedVersion"
   ```

---

## 5. Audit Verdict

CMS publication, Redis cache invalidation, and version rollback mechanisms are verified and production-ready.

