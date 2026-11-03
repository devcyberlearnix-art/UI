# V22 E2E Regression Report
**Platform:** Asivo LMS / CyberLearnix Control Plane  
**Version:** 22.0.0-PROD  
**Evaluation Date:** November 1, 2026  
**Status:** PASS — 100% SUITE EXECUTION

---

## 1. Automated Test Suite Execution
Automated end-to-end regression tests were executed using Playwright in headless Chromium against the live backend stack:
`scripts/v22_admin_control_plane_verification.mjs`

---

## 2. Test Execution Results

| Test Step | Target Route | Expected Criteria | Result | Evidence Screenshot |
|---|---|---|---|---|
| **1. Admin Authentication** | `POST /api/v1/admin/login` | Valid signed JWT access token returned for `dev.cyberlearnix@gmail.com` | **PASS** | Token length: 549 chars |
| **2. Global Telemetry** | `/admin/dashboard` | Registered Users: 263, Active Curriculum: 231, Gross: $374,303, Orders: 178 | **PASS** | `01_admin_dashboard.png` |
| **3. User Governance** | `/admin/users` | 263 total, 198 students, 16 instructors, 2 admins, zero email slicing, Ink & Onyx theme | **PASS** | `02_admin_users.png` |
| **4. Course Management** | `/admin/courses` | 231 courses loaded, 0 courses defect eliminated, Clean Code & Kubernetes courses visible | **PASS** | `03_admin_courses.png` |
| **5. Promotions & Coupons** | `/admin/coupons` | 31 coupons loaded, `SPRING20`, `DEVMONTH`, `CYBER15` rendered | **PASS** | `04_admin_coupons.png` |
| **6. Order Ledger** | `/admin/orders` | 178 executed orders, non-$0 real settlement amounts (₹5,355, ₹4,384) | **PASS** | `05_admin_orders.png` |
| **7. Faculty Governance** | `/admin/instructors` | 16 instructors rendered in dark Ink & Onyx theme | **PASS** | `06_admin_instructors.png` |
| **8. Banner Management** | `/admin/banners` | Active banners rendered with analytics telemetry | **PASS** | `07_admin_banners.png` |

---

## 3. Exit Code & Artifacts
- **Test Exit Code**: `0` (Clean Exit)
- **Production Build Exit Code**: `0` (`built in 33.92s`)
- **Screenshots Archived**: 7 high-resolution screenshots in `scripts/v22_screenshots/`