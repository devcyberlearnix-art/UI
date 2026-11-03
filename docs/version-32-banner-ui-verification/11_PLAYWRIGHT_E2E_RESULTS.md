# Deliverable 11: Playwright E2E Results

## 1. Test Suite Execution Summary

An automated end-to-end verification suite was executed using Playwright against the live running application stack. All test cases directly engaged the live frontend UI, API Gateway, Course Service, and PostgreSQL database without mocks or stubs.

- **Suite Runner Scripts:** `scratch/v32-runner.mjs`, `scratch/test-create-workflow.mjs`
- **Frontend Target:** `http://localhost:5173`
- **Backend API Gateway:** `http://localhost:8079`
- **PostgreSQL Database:** Port 15432 (`lms_course_db`)
- **Total Assertions Executed:** 32
- **Assertions Passed:** 32 (100%)
- **Assertions Failed:** 0 (0%)
- **Execution Verdict:** **ALL PHASES PASSED**

---

## 2. Granular Test Phase Breakdown

### Phase 1: Authentication & Navigation
- Admin sign-in (`dev.cyberlearnix@gmail.com`): **PASS**
- Navigation to `/admin/banners`: **PASS**

### Phase 2: Create Modal Field Validations
- Empty headline submission blocked by HTML5 validation: **PASS**
- Special characters & XSS payload escaped and preserved: **PASS**
- Placement options dropdown matches backend enum (`COURSE`, `CATEGORY`, `EXTERNAL_URL`, `CUSTOM_PAGE`): **PASS**
- Synopsis multi-line unicode input: **PASS**
- CTA label and destination route sanitization: **PASS**

### Phase 3: Multipart Uploads with Test Assets
- `valid_1920x1080.jpg`: HTTP 200 (Success, Google Drive CDN URL returned): **PASS**
- `valid_1280x720.png`: HTTP 200 (Success, Google Drive CDN URL returned): **PASS**
- `invalid_text_file.txt`: Client blocked MIME type: **PASS**
- `fake_image.jpg`: Backend ImageIO rejected invalid magic bytes: **PASS**
- `oversized_banner.png`: Client blocked file size > 1MB: **PASS**
- `low_res_400x225.jpg`: Backend rejected resolution below 800×450: **PASS**
- `wrong_ratio_1000x1000.jpg`: Backend rejected 1:1 aspect ratio: **PASS**
- `corrupted.jpg`: Backend ImageIO rejected broken byte stream: **PASS**

### Phase 4 & 5: Responsive Viewports & Pinned Action Bar
- Desktop 1440×900: Header, Publish, Cancel visible without scrolling: **PASS**
- Tablet Landscape 1024×768: Header, Publish, Cancel visible without scrolling: **PASS**
- Tablet Portrait 768×1024: Header, Publish, Cancel visible without scrolling: **PASS**
- Mobile iPhone 390×844: Header, Publish, Cancel visible without scrolling: **PASS**
- Small Mobile 320×700: Header, Publish, Cancel visible without scrolling: **PASS**

### Phase 6: Complete Create & Publish Workflow
- Upload 720p PNG asset via multipart endpoint: **PASS**
- Form submission to `POST /api/v1/admin/banners`: HTTP 201 Created: **PASS**
- Auto-assigned `display_order = 909`: **PASS**
- Newly created banner visible in Admin active table: **PASS**
- Persisted in PostgreSQL table `banners` with ID 10: **PASS**

### Phase 7: Public Landing Page Verification
- Anonymous user view renders banner carousel: **PASS**
- Admin Quick Action Pill hidden from anonymous visitors: **PASS**
- Admin Quick Action Pill visible for authenticated admin: **PASS**
- Click CTA button tracks click and navigates to `/courses`: **PASS**

### Phase 8: Admin Management Actions
- Soft-delete banner (ID 9 archived with `deleted_at` timestamp): **PASS**
- Archived tab displays archived banner with restore button: **PASS**
- Restore banner (ID 9 restored with `deleted_at = NULL`): **PASS**
- Reorder display priority batch update: **PASS**

---

## 3. Screenshot Artifact Index

All screenshots were captured live during test execution and saved to `scratch/v32-screenshots/`:

1. `01_modal_field_validations.png` — Field boundary and sanitization tests in modal
2. `02_upload_valid_preview.png` — Valid 1920×1080 image uploaded and live 16:9 preview rendered
3. `03_upload_rejected_aspect_ratio.png` — Square 1:1 ratio image rejected with warning
4. `04_responsive_Desktop_1440x900.png` — Fixed header and pinned footer on desktop
5. `04_responsive_Tablet_Landscape_1024x768.png` — Pinned actions on landscape tablet
6. `04_responsive_Tablet_Portrait_768x1024.png` — Pinned actions on portrait tablet
7. `04_responsive_Mobile_iPhone_390x844.png` — Pinned actions on mobile iPhone
8. `04_responsive_Small_Mobile_320x700.png` — Pinned actions on compact mobile screen
9. `05_create_modal_ready_to_publish.png` — Completed form with Google Drive CDN URL before submit
10. `06_admin_list_with_new_banner.png` — Admin catalog table showing new Banner ID 10
11. `07_public_landing_page_carousel.png` — Public landing page promotional carousel
12. `08_admin_landing_page_with_quick_pill.png` — Admin quick action pill visible on landing page
13. `09_archived_banners_tab.png` — Archived/Deleted banners view with restore action
14. `10_restored_active_tab.png` — Active banners table after successful restore

