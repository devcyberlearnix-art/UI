# ASIVO 2.0 — DEFECT REGISTRY & REMEDIATION LOG

**Custodian:** Agent 51 — Defect Remediation Coordinator  
**Independent Auditors:** Agents 57, 58, 59, 60  
**Approved by:** Agent 01 — Chief Architect  
**Status:** ACTIVE LOGGING & REMEDIATION  

---

## Defect Summary Dashboard

| Total Identified | Critical | High | Medium | Low | Resolved & Retested | Open Pending |
|---|---|---|---|---|---|---|
| **5** | 0 | 2 | 2 | 1 | **5** | **0** |

---

## Logged Defects & Verification Status

### [DEF-001] Missing Parent Observatory Route and Role Protection in Routing Layer
- **Severity:** HIGH
- **Found by:** Agent 02 (Frontend Repository & Route Auditor)
- **Component / Route:** `src/App.jsx` (`/parent/*`)
- **Reproduction Steps:**
  1. Navigate to `/parent/dashboard` or attempt to log in as parent role.
  2. Router hits wildcard `*` fallback and redirects to root `/`.
- **Expected Result:** Dedicated authenticated `/parent/dashboard` protected route for `allowedRoles={['parent']}`.
- **Actual Result:** Route group was missing from `App.jsx`.
- **Assigned Agent:** Agent 27 (Parent Experience Lead) & Agent 02.
- **Fix Reference:** Implemented `ParentDashboard.jsx` & registered `/parent/dashboard` route in `App.jsx`.
- **Retest Status:** **VERIFIED BY AGENT 58 & 60** (Passing).

---

### [DEF-002] Hero Banner Fallback Hardcoded String Discrepancy
- **Severity:** MEDIUM
- **Found by:** Agent 25 (CMS Dynamic Banner Experience Lead)
- **Component / Route:** `src/pages/LandingDashboard.jsx` (Hero Heading)
- **Reproduction Steps:**
  1. Update hero banner heading via CMS Admin Console (`/admin/website-management/hero`).
  2. Inspect Landing page when offline or with stale draft.
- **Expected Result:** Landing page displays dynamic headline with local storage fallback override.
- **Actual Result:** Landing page had hardcoded static text in H1.
- **Assigned Agent:** Agent 25.
- **Fix Reference:** Added `renderDynamicHeading` and `asivo:hero-updated` event listener with `localStorage` sync.
- **Retest Status:** **VERIFIED BY AGENT 59** (Passing).

---

### [DEF-003] Missing Shared Experience Engine Mode Orchestration
- **Severity:** HIGH
- **Found by:** Agent 37 (Experience Engine Core Architect)
- **Component / Route:** `src/core/experience/ExperienceProvider.jsx`
- **Reproduction Steps:**
  1. Switch between catalog exploration and immersive video classroom.
  2. No unified state hook exists to toggle `EXPLORATION`, `LEARNING`, `FOCUS`, and `ACHIEVEMENT` modes.
- **Expected Result:** `useExperience()` hook providing reactive state transitions across all workspaces.
- **Actual Result:** Experience Engine infrastructure had not yet been codified.
- **Assigned Agent:** Agent 37, Agent 38, Agent 39.
- **Fix Reference:** Codified `ExperienceProvider.jsx`, `LayoutOrchestrator.jsx`, and `NavigationController.js`.
- **Retest Status:** **VERIFIED BY AGENT 57** (Passing).

---

### [DEF-004] Mobile Touch Target Optimization on Filter Buttons
- **Severity:** LOW
- **Found by:** Agent 55 (Mobile Touch & Gesture Specialist)
- **Component / Route:** `src/pages/Courses.jsx` & `src/pages/LandingDashboard.jsx`
- **Reproduction Steps:**
  1. View category pills on 375px mobile viewport.
  2. Some filter chips measured 32px height, below the recommended 44px touch target guidelines.
- **Expected Result:** All clickable filter chips and tabs must have minimum 44px tap zone or adequate padding.
- **Actual Result:** Category chips were compact on small screens.
- **Assigned Agent:** Agent 09 & Agent 55.
- **Fix Reference:** Standardized category chips with `py-2 px-3.5 min-h-[44px]`.
- **Retest Status:** **VERIFIED BY AGENT 55 & 60** (Passing).

---

### [DEF-005] Non-Standard Hex Overrides in Wishlist Action Badges
- **Severity:** MEDIUM
- **Found by:** Agent 03 (Design Token & Style Architect)
- **Component / Route:** `src/pages/student/Wishlist.jsx`
- **Reproduction Steps:**
  1. Inspect CSS styling of course cards in student wishlist.
  2. Detected raw unapproved slate `#475569` and blue `#2563EB` rather than Quiet Atelier `#5B3E57` and `#635E56`.
- **Expected Result:** 100% token parity with Quiet Atelier.
- **Actual Result:** Legacy blue classes persisted in wishlist action links.
- **Assigned Agent:** Agent 03 & Agent 13.
- **Fix Reference:** Replaced legacy classes with `--primary` (`#5B3E57`), `--text-primary` (`#282521`), and `--surface-primary` (`#FFFEFA`).
- **Retest Status:** **VERIFIED BY AGENT 11 & 57** (Passing).

---

*Governed by Agent 51 — Defect Remediation Coordinator*

