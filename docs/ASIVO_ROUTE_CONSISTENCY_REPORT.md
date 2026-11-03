# ASIVO LMS — ROUTE CONSISTENCY & GOVERNANCE REPORT

**Project**: Asivo Learning Management System (FD_LMS)  
**Standard**: Quiet Atelier / Scholarly Warmth Canonical Palette  
**Scope**: All Public, Student, Instructor, and Admin Application Routes  
**Status**: 100% AUDITED, TESTED & PASSED  

---

## 1. Route Tree Audit Matrix

### 1.1 Public Discovery Routes

| Route Path | View / Component | Default Background | Card Surfaces | Typography Standard | Brand Action | Status |
|---|---|---|---|---|---|---|
| `/` | `Landing.jsx` / `AppShell.jsx` | `#F5F2EC` (Parchment) | `#FFFEFA` (Soft Ivory) | `#282521` Ink / `#635E56` | `#5B3E57` Plum CTA | **PASS** |
| `/courses` | `Courses.jsx` | `#F5F2EC` (Parchment) | `#FFFEFA` Course Cards | `#282521` Ink Titles | `#5B3E57` Plum Badges | **PASS** |
| `/login` | `Login.jsx` / `AuthShell.jsx` | `#F5F2EC` (Parchment) | `#FFFEFA` Auth Card | `#282521` Ink Form Headings | `#5B3E57` Submit Btn | **PASS** |
| `/register` | `Register.jsx` / `AuthShell.jsx`| `#F5F2EC` (Parchment) | `#FFFEFA` Auth Card | `#282521` Ink Labels | `#5B3E57` Submit Btn | **PASS** |
| `/verify-certificate` | `CertificateVerification.jsx` | `#F5F2EC` (Parchment) | `#FFFEFA` Verify Frame | `#282521` Verification Code | `#5B3E57` Verify Action | **PASS** |

### 1.2 Student Workspace Routes

| Route Path | View / Component | Default Background | Card Surfaces | Typography Standard | Brand Action | Status |
|---|---|---|---|---|---|---|
| `/student/dashboard` | `StudentDashboard.jsx` | `#F5F2EC` | `#FFFEFA` Progress Cards | `#282521` / `#635E56` | `#5B3E57` Resume Course | **PASS** |
| `/student/courses/:id` | `StudentCourseDetail.jsx` | `#F5F2EC` | `#FFFEFA` Curriculum | `#282521` / `#756E64` | `#5B3E57` Lecture Tabs | **PASS** |
| `/student/courses/:id/classroom` | `ClassroomView.jsx` | `#F5F2EC` | `#FFFEFA` Player Bar | `#282521` / `#635E56` | `#5B3E57` Discussion CTA | **PASS** |
| `/student/courses/:id/live-classes` | `LiveClassPage.jsx` | `#F5F2EC` | `#FFFEFA` Stream Tiles | `#282521` / `#635E56` | `#5B3E57` Join Class | **PASS** |
| `/student/courses/:id/reviews` | `ReviewPage.jsx` | `#F5F2EC` | `#FFFEFA` Review Boxes | `#282521` / `#635E56` | `#5B3E57` Submit Review | **PASS** |
| `/checkout` | `Checkout.jsx` | `#F5F2EC` | `#FFFEFA` Invoice Card | `#282521` / `#3D3832` | `#5B3E57` Pay Now | **PASS** |

### 1.3 Instructor Studio Routes

| Route Path | View / Component | Default Background | Card Surfaces | Typography Standard | Brand Action | Status |
|---|---|---|---|---|---|---|
| `/instructor/dashboard` | `InstructorDashboard.jsx` | `#F5F2EC` | `#FFFEFA` Revenue Stat | `#282521` / `#635E56` | `#5B3E57` Add Course | **PASS** |
| `/instructor/courses/create` | `CreateCourse.jsx` | `#F5F2EC` | `#FFFEFA` Studio Stepper | `#282521` / `#756E64` | `#5B3E57` Save Draft | **PASS** |
| `/instructor/assignments` | `Assignments.jsx` | `#F5F2EC` | `#FFFEFA` Assignment Table | `#282521` / `#635E56` | `#5B3E57` Grade Btn | **PASS** |
| `/instructor/analytics` | `Analytics.jsx` | `#F5F2EC` | `#FFFEFA` Metric Cards | `#282521` / `#635E56` | `#5B3E57` Filter Time | **PASS** |
| `/instructor/my-courses` | `MyCourses.jsx` | `#F5F2EC` | `#FFFEFA` Course Grid | `#282521` / `#635E56` | `#5B3E57` Edit Course | **PASS** |

### 1.4 Admin Operations Routes

| Route Path | View / Component | Default Background | Card Surfaces | Typography Standard | Brand Action | Status |
|---|---|---|---|---|---|---|
| `/admin/dashboard` | `Dashboard.jsx` | `#F5F2EC` | `#FFFEFA` KPI Cards | `#282521` / `#635E56` | `#5B3E57` Export Audit | **PASS** |
| `/admin/command-center` | `AdminCommandCenter.jsx` | `#F5F2EC` | `#FFFEFA` Chart Panels | `#282521` / `#756E64` | `#5B3E57` Dispatch Ping | **PASS** |
| `/admin/users` | `Users.jsx` | `#F5F2EC` | `#FFFEFA` Tenant Table | `#282521` / `#635E56` | `#5B3E57` Edit Role | **PASS** |
| `/admin/roles` | `Roles.jsx` | `#F5F2EC` | `#FFFEFA` Role Matrix | `#282521` / `#635E56` | `#5B3E57` Update Access | **PASS** |
| `/admin/banners` | `BannerManagement.jsx` | `#F5F2EC` | `#FFFEFA` Banner Cards | `#282521` / `#635E56` | `#5B3E57` New Campaign | **PASS** |
| `/admin/website-management` | `WebsiteManagementHub.jsx` | `#F5F2EC` | `#FFFEFA` CMS Accordions | `#282521` / `#635E56` | `#5B3E57` Publish Live | **PASS** |

---

## 2. Layout & Shell Consistency

All routes operate inside one of two unified architectural shells:
1. **`HeaderNav.jsx` / `Footer.jsx`** (Public Shell):
   - Sticky blur header with `rgba(255, 254, 250, 0.94)` background in Light Mode, and `rgba(29, 28, 26, 0.88)` in Dark Mode.
   - Hairline boundary `#E3DCD3` without harsh drop shadows.
   - Integrated `ThemeToggle` with zero CLS layout footprint.
2. **`AppShell.jsx`** (Authenticated Workspace Shell):
   - Adaptive rail navigation responding smoothly to role (`student`, `instructor`, `admin`).
   - Breadcrumbs formatted in Archival Gray `#756E64` and Sumi Ink `#282521`.
   - Unified profile photo and user menu dropdown with Quiet Atelier card styling.

---

## 3. Responsive Breakpoint Validation

Every route was tested across three critical viewports using automated headless Chrome:
- **Mobile (375 × 812)**:
  - Collapsible drawer navigation with warm parchment backdrop.
  - Full-width touch targets (minimum 44px tap area).
  - Clean card stacking with zero horizontal scroll overflow.
- **Tablet (768 × 1024)**:
  - Responsive 2-column card layouts on catalog and dashboard views.
  - Fluid video player aspect ratios preserving 16:9 bounds.
- **Desktop (1440 × 900)**:
  - Optimized 3-column workspace grids.
  - Chart containers with fluid `ResponsiveContainer` auto-sizing.

