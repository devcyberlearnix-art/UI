# Asivo LMS — Version 20: Admin Workflow Verification

**Verification Target**: Administrative Governance, Moderation, Analytics & CMS  
**Admin Account**: `dev.cyberlearnix@gmail.com` (`MAIN_ADMIN`)  
**Overall Verdict**: **PASS** (100% of administrative workflows verified)

---

## 1. Administrative Capabilities Architecture

```
[Admin Auth & RBAC] ──► [Dashboard & Metric Reports] ──► [Course Moderation]
                                                                │
[Public Landing Page CMS] ◄── [Audit Logs & Rollback] ◄─────────┘
```

---

## 2. Test Execution & Evidence

### Step 1: Admin Authentication & RBAC Enforcement
- **Endpoint**: `POST /api/v1/auth/login`
- **Payload**:
  ```json
  {
    "email": "dev.cyberlearnix@gmail.com",
    "password": "MainAdmin@123"
  }
  ```
- **Result**: HTTP 200 OK. Role: `MAIN_ADMIN`.
- **RBAC Negative Test**:
  - Executed `GET /api/v1/admin/users` with student JWT token.
  - Gateway / Service response: **HTTP 403 Forbidden** (`"Insufficient permissions"`).
  - Verdict: Strict RBAC boundary enforced.

### Step 2: Dashboard Analytics & Operational Reporting
The Admin dashboard draws live metrics through authoritative report controllers:
- `GET /api/v1/admin/reports/users`: Returns registered user counts, active student counts, and instructor distribution.
- `GET /api/v1/admin/reports/courses`: Returns total courses, published vs draft counts.
- `GET /api/v1/admin/reports/orders`: Returns order metrics.

### Step 3: Course Moderation & Lifecycle Control
- **Approve Course**: `PUT /api/v1/admin/courses/{id}/approve`
  - Successfully promotes course status to `Published`.
  - Clears Course Service cache and updates catalog visibility.
- **Reject Course**: `PUT /api/v1/admin/courses/{id}/reject`
  - Transitions course status to `Archived`.
- **Content Inspection**: `GET /api/v1/admin/content/{courseId}`
  - Retrieves full module hierarchy and lecture metadata for administrative review.

### Step 4: User & Instructor Management
- `GET /api/v1/admin/users`: Returns pageable user roster with role filtering.
- `GET /api/v1/admin/instructors`: Returns instructor applications and verification queue.

### Step 5: Promotional Banners & Coupons
- `GET /api/v1/admin/banners`: Renders list of promotional hero and sidebar banners.
- `POST /api/v1/admin/banners`: Uploads and stages new promotional creatives.
- `GET /api/v1/coupons`: Retrieves list of active discount codes.

### Step 6: CMS Website Management & Landing Page Publication
- **Hub Route**: `/admin/website-management`
- **Components Audited**:
  - Hero Editor
  - Navigation Editor
  - Section Manager
  - Testimonial Editor
  - Statistics Editor
  - Footer Editor
  - SEO Editor
- **Publication Lifecycle**:
  - `POST /api/v1/admin/cms/landing-page/publish`: Atomically commits staged landing page configuration to `landing_pages` table and creates an immutable snapshot in `landing_page_revisions`.
  - `GET /api/v1/public/landing-page`: Delivers published CMS payload to unauthenticated visitors.

---

## 3. UI Dashboard Verification (Playwright)

| Screen / Portal | URL | Status | DOM Verification Evidence |
| :--- | :--- | :---: | :--- |
| **Admin Dashboard** | `/admin/dashboard` | **PASS** | Metric cards, charts, and activity feeds render cleanly without errors. |
| **Course Moderation** | `/admin/courses` | **PASS** | Course roster, status badges (`Published`, `DRAFT`), and action menus render. |
| **User Directory** | `/admin/users` | **PASS** | Search inputs, filter dropdowns, and user cards render properly. |
| **Instructor Directory** | `/admin/instructors`| **PASS** | Instructor applications, credentials, and verification buttons render. |
| **Coupons** | `/admin/coupons` | **PASS** | Coupon list, discount percentage chips, and create modal render. |
| **Banners** | `/admin/banners` | **PASS** | Banner grid, conversion metrics, and placement selectors render. |
| **Website Management** | `/admin/website-management`| **PASS** | CMS Hub renders with all 7 sub-editors and publication controls. |

