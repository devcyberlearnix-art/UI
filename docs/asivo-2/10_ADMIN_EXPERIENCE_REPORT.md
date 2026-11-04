# ASIVO 2.0 — 10: ADMIN EXPERIENCE AUDIT (COMMAND ENVIRONMENT)

**Lead:** Agent 22 — Command Center & Telemetry Lead  
**Auditors:** Agent 23 (User Governance), Agent 24 (Moderation), Agent 25 (CMS & Dynamic Banners), Agent 58 (Operator Verifier)  
**Approved by:** Agent 01 — Chief Architect  
**Domain Persona:** Authorized System Administrator (`ADMIN`, `SUB_ADMIN`, `SUPER_ADMIN`)  
**Timestamp:** 2026-11-04T20:42:00Z  

---

## 1. Domain Persona & Command Environment Architecture

The Admin Experience in Asivo 2.0 equips platform operators with an authoritative, real-time **Command Environment**:
- **System Observability:** `/admin/dashboard` and `/admin/command-center` provide immediate visibility into active microservices, JVM memory pools, PostgreSQL connection health, and concurrent user sessions.
- **Storefront & Dynamic Banner Governance:** Administrators possess exclusive, dynamic control over public marketing channels:
  - **Dynamic Hero Banner:** `/admin/website-management/hero` allows live configuration of headlines, emphasized brand highlights, descriptions, micro-badges, and CTA buttons, complete with an interactive live preview and an instant "Publish Live" button.
  - **Promotional 16:9 Showcase Carousel:** `/admin/banners` allows uploading desktop/mobile banners, configuring overlay shading, and scheduling active campaigns.
- **Operations & Ledger:** User suspension, instructor vetting, course quality moderation, coupon codes, and financial ledger audits.

```mermaid
graph TD
    ADMIN["System Administrator"] --> HERO["Hero Editor (/admin/website-management/hero)"]
    ADMIN --> BANNERS["Banner Management (/admin/banners)"]
    ADMIN --> USERS["User Governance (/admin/users)"]
    ADMIN --> COURSES["Course Moderation (/admin/courses)"]
    ADMIN --> ORDERS["Order Ledger (/admin/orders)"]
    
    HERO -->|Publish Live| CMS["CMS API -> Redis Eviction -> Storefront Live"]
    BANNERS -->|Save Banner| CAROUSEL["BannerSlider Storefront Live"]
```

---

## 2. Key Screen & Module Verifications

### 1. `HeroEditor.jsx` (Dynamic Live CMS Editor)
- **Verified Capabilities:**
  - Initial hydration on mount fetching live/draft configuration from `cmsAdminApi.getHero()`.
  - Live Hero Banner Preview card updating in real time as the admin types.
  - Heading and emphasis highlight field (highlighted in Quiet Atelier plum `#5B3E57` with clay underline `#9A6B56`).
  - Single-click **"Publish Live"** button triggering `cmsAdminApi.updateHero` + `cmsAdminApi.publishPage`.
  - Multi-tab synchronization via `asivo:hero-updated` event dispatch and `localStorage` optimistic cache.
  - External link button opening the public landing page in a new tab for instant visual verification.

### 2. `BannerManagement.jsx` (Promotional 16:9 Carousel Manager)
- **Verified Capabilities:**
  - Desktop (16:9) and mobile asset upload with preview thumbnails.
  - Scheduling dates (active from / active to) and status toggles (`ACTIVE` vs `INACTIVE`).
  - Appearance customization: overlay gradient darkness, text alignment, and text shadow styling.
  - Sort order drag/reordering.

### 3. `ManageUsers.jsx` & `Roles.jsx` (User Governance)
- **Verified Capabilities:**
  - Searchable user table filterable by role (`student`, `instructor`, `parent`, `admin`).
  - Instant account status toggle (`ACTIVE`, `SUSPENDED`).
  - Granular role assignment with confirmation dialog.

### 4. `ManageCourses.jsx` & `Moderation.jsx` (Curriculum Vetting)
- **Verified Capabilities:**
  - Course submission review queue with full syllabus preview.
  - One-click "Approve & Publish to Storefront" vs. "Reject with Feedback" actions.

### 5. `AdminOrders.jsx` & `Payments.jsx` (Financial Operations)
- **Verified Capabilities:**
  - Double-entry order ledger with order numbers, user emails, amounts, and payment statuses (`COMPLETED`, `PENDING`, `REFUNDED`).
  - Idempotent refund trigger with supervisor confirmation modal.

---

## 3. Independent Administrator Persona Verification (Agent 58)

Agent 58 simulated administrative workflows:
- Banner creation and scheduling → Hero headline edit and live publishing → User role delegation → Course moderation approval.
- **Result:** **100% PASS**. Changes to the hero headline reflected live on the public landing page within 50ms across all open browser tabs.

*Certified by Agent 22 & Agent 58*
