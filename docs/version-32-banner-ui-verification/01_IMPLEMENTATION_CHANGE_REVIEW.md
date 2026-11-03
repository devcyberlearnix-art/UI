# ASIVO LMS — Version 32: Implementation Change & Architectural Review

**Document ID:** `01_IMPLEMENTATION_CHANGE_REVIEW.md`  
**Execution Timestamp:** 2026-11-03T00:21:00+05:30  
**Status:** COMPLETE & VERIFIED

---

## 1. Architectural Overview & Component-to-API Mapping

The Landing Page Promotional Banner subsystem connects administrative campaign management with the public storefront showcase across the microservices ecosystem.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND (React 18)                                  │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│   Public Landing Page                     │   Admin Console                            │
│   • LandingDashboard.jsx                  │   • BannerManagement.jsx                   │
│   • BannerSlider.jsx (Promotional Hero)   │   • Create / Edit Modal (Sticky Layout)    │
│   • Quick Action Pill (Admin Only)        │   • Image Dropzone & File Input            │
└─────────────────────┬─────────────────────┴──────────────────────┬─────────────────────┘
                      │                                            │
                      │ GET /api/v1/banners                        │ POST /api/v1/admin/banners/upload-image
                      │ POST /api/v1/banners/{id}/click            │ POST /api/v1/admin/banners
                      │ (Public Traffic)                           │ (Admin Bearer JWT Auth)
                      ▼                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                             SPRING CLOUD API GATEWAY (:8079)                           │
│  • Route: courseservice-banners-admin  -> Path=/api/v1/admin/banners/** (course-service)│
│  • Route: courseservice-banners-public -> Path=/api/v1/banners/**       (course-service)│
│  • JwtAuthenticationFilter: /api/v1/banners/** is marked PUBLIC                         │
│  • JwtAuthenticationFilter: /api/v1/admin/banners/** enforces ADMIN / MAIN_ADMIN role │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              COURSE SERVICE (:8083)                                    │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│   Controllers:                            │   Services & Repositories:                 │
│   • BannerController.java                 │   • BannerService.java (CRUD, Cache)       │
│   • PublicBannerController.java           │   • BannerImageService.java (16:9, 1MB)    │
│                                           │   • GoogleDriveService.java (Cloud CDN)    │
│                                           │   • BannerRepository.java (Spring Data JPA)│
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL DATABASE (lms_course_db)                            │
│   • Table: `public.banners` (All timestamps, UUIDs, soft-deletes, constraints)         │
│   • Volume: `lms_pgdata` (Persistent on physical host disk)                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Component-to-API Mapping Matrix

| UI Component | User Action | API Client Method | Endpoint | HTTP Method | Content-Type | Target Microservice |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `BannerManagement.jsx` | Pick file from disk | `adminApi.validateBannerImage` | `/api/v1/admin/banners/validate-image` | `POST` | `multipart/form-data` | `course-service:8083` |
| `BannerManagement.jsx` | Upload image file | `adminApi.uploadBannerImage` | `/api/v1/admin/banners/upload-image` | `POST` | `multipart/form-data` | `course-service:8083` |
| `BannerManagement.jsx` | Load active banners | `adminApi.getAllBanners` | `/api/v1/admin/banners` | `GET` | `application/json` | `course-service:8083` |
| `BannerManagement.jsx` | Load deleted banners | `adminApi.getDeletedBanners` | `/api/v1/admin/banners/deleted` | `GET` | `application/json` | `course-service:8083` |
| `BannerManagement.jsx` | Save new banner | `adminApi.createBanner` | `/api/v1/admin/banners` | `POST` | `application/json` | `course-service:8083` |
| `BannerManagement.jsx` | Update banner | `adminApi.updateBanner` | `/api/v1/admin/banners/{id}` | `PUT` | `application/json` | `course-service:8083` |
| `BannerManagement.jsx` | Reorder banners | `adminApi.reorderBanners` | `/api/v1/admin/banners/reorder` | `PATCH` | `application/json` | `course-service:8083` |
| `BannerManagement.jsx` | Soft-delete banner | `adminApi.deleteBanner` | `/api/v1/admin/banners/{id}` | `DELETE` | `application/json` | `course-service:8083` |
| `BannerManagement.jsx` | Restore banner | `adminApi.restoreBanner` | `/api/v1/admin/banners/{id}/restore` | `PATCH` | `application/json` | `course-service:8083` |
| `BannerSlider.jsx` | Load hero showcase | `courseApi.getActiveBanners` | `/api/v1/banners` | `GET` | `application/json` | `course-service:8083` |
| `BannerSlider.jsx` | Slide impression | `courseApi.trackBannerImpression` | `/api/v1/banners/{id}/impression` | `POST` | `application/json` | `course-service:8083` |
| `BannerSlider.jsx` | Click CTA button | `courseApi.trackBannerClick` | `/api/v1/banners/{id}/click` | `POST` | `application/json` | `course-service:8083` |

---

## 3. Implementation Changes & Regression Analysis

### Recent Changes Inspected:
1. **Modal Layout Refactoring (`BannerManagement.jsx`):**
   - **Previous State:** The entire modal was inside a single container `max-h-[90vh] overflow-y-auto`. When users opened the modal on standard or lower laptop screens, the form content pushed the `Cancel` and `Publish Banner` buttons completely out of the viewport, leading to confusion where users believed there was no submit button.
   - **Updated State:** Modal refactored to a rigid Flexbox structure:
     - `flex flex-col max-h-[90vh] overflow-hidden`
     - Fixed Header (`flex-shrink-0 p-6 pb-4 border-b`)
     - Scrollable Body (`overflow-y-auto flex-1 p-6 space-y-4`)
     - Fixed Footer (`flex-shrink-0 p-4 sm:p-5 border-t bg-[#0F0F13]/95 backdrop-blur-md`)
   - **Regression Check:** Form inputs, validation handlers, and submit events remain directly bound to the parent `<form onSubmit={handleSubmit}>`. Zero event listeners were severed.

2. **Admin Quick Action Pill (`BannerSlider.jsx`):**
   - **Previous State:** The public landing page banner showcase had no administrative awareness. An admin browsing the landing page had to manually navigate to `/admin/banners`.
   - **Updated State:** Added conditional rendering using `useAuth()`:
     ```jsx
     const { user } = useAuth();
     const isAdmin = user?.role === "MAIN_ADMIN" || user?.role === "SUB_ADMIN" || user?.role === "ADMIN";
     ```
     When `isAdmin === true`, a floating Obsidian-Gold pill `Upload / Manage Banners` appears at the top-right corner of the banner slider.
   - **Security Check:** Anonymous visitors and students do NOT see the pill (`isAdmin === false`). Furthermore, the backend endpoint `/api/v1/admin/banners/**` is cryptographically protected by `JwtAuthenticationFilter` on the API Gateway; unauthorized requests receive HTTP 401/403.

3. **Pure JPA Standardization (`Banner.java`):**
   - Removed proprietary `org.hibernate.annotations.SQLDelete` and `@Where(clause = "deleted_at IS NULL")` which were previously interfering with explicit deleted banner recovery queries (`WHERE b.deletedAt IS NOT NULL`).
   - Repository queries now use 100% standard Spring Data JPA JPQL.

