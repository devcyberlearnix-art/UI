# ASIVO 2.0 — PHASE 2: FEATURE PRESERVATION MATRIX
**Document ID:** `docs/asivo-2/PHASE2/03_FEATURE_PRESERVATION_MATRIX.md`  
**Author:** Agent 01 (Chief Architect) & Agent 04 (Feature Preservation Lead)  
**Date:** November 4, 2026  
**Scope:** 100% Preservation of Existing Platform Capabilities  

---

## 1. Preservation Governance
Under the Asivo 2.0 Architectural Directives, no working business logic, API communication channel, or interactive capability is permitted to be deleted or regressed. The Unslop design refinement operates purely as an aesthetic and ergonomic elevation without pruning features.

---

## 2. Platform-Wide Preservation Matrix

| Feature Domain | Existing Functional Capabilities | Preserved Code Location | API / Backend Contract | Regression Verification |
|---|---|---|---|---|
| **Video Classroom** | HLS adaptive bitrate streaming, playback speed selection (0.5x–2.0x), resume timestamp persistence in `localStorage`, full-screen mode | `src/pages/student/ClassroomView.jsx`, `src/components/video/VideoPlayer.jsx` | `GET /api/v1/courses/:id/modules` | Passed — Seamless HLS stream loading |
| **Quiz Engine** | Timed assessments, single/multi-choice questions, instant score calculation, retry limits, answer explanation display | `src/pages/student/QuizPage.jsx`, `src/components/quiz/QuizPlayer.jsx` | `POST /api/v1/quizzes/:id/submit` | Passed — State preservation across tabs |
| **Assignments** | File attachment upload, submission status tracker, instructor grading feedback view, deadline countdown | `src/pages/student/Assignments.jsx`, `src/components/assignment/` | `POST /api/v1/assignments/:id/submit` | Passed — Multipart upload intact |
| **Certificates** | Verifiable credential issuance, unique cryptographic certificate hash, instant PDF download, public verification route | `src/pages/student/CertificatePage.jsx`, `src/pages/CertificateVerification.jsx` | `GET /api/v1/certificates/:id` | Passed — Hash validation verified |
| **Live Discussions** | WebSocket STOMP real-time messaging, optimistic post dispatch, community upvoting, instructor pin | `src/components/classroom/LiveDiscussionHub.jsx` | `ws://:8080/ws-connect`, `POST /api/v1/reviews` | Passed — Instant UI broadcast |
| **Course Discovery** | Full-text typeahead search, faceted filter by level/category, price filtering, sorting, wishlist toggle | `src/pages/Courses.jsx`, `src/components/search/AdvancedTypeaheadSearch.jsx` | `GET /api/v1/courses` | Passed — Debounced typeahead intact |
| **Cart & Checkout** | Local and authenticated cart persistence, coupon validation with instant discount recalculation, simulated payment lifecycle | `src/pages/Cart.jsx`, `src/pages/Checkout.jsx`, `src/context/CartContext.jsx` | `POST /api/v1/coupons/validate`, `POST /api/v1/orders` | Passed — End-to-end checkout loop verified |
| **Course Creation** | Multi-step curriculum builder, module addition/deletion, video lecture upload, quiz authoring, draft save & immediate publish | `src/pages/instructor/CreateCourse.jsx` | `POST /api/v1/instructor/courses`, `PUT /api/v1/courses/:id` | Passed — Course creation validated |
| **Instructor Analytics**| Real-time enrollment numbers, student progression metrics, revenue per course, rating breakdown | `src/pages/instructor/Analytics.jsx` | `GET /api/v1/instructor/analytics` | Passed — Chart data rendering confirmed |
| **Admin Course CMS** | Course approval/rejection workflow, partial price update (`PATCH /api/v1/courses/:id`), full course editing | `src/pages/admin/Courses.jsx` | `GET/PUT/PATCH/DELETE /api/v1/courses` | Passed — Modals & mutations verified |
| **Faculty Governance**| Instructor registration vetting, credential inspection, status suspension/reactivation | `src/pages/admin/Instructors.jsx` | `GET /api/v1/admin/instructors`, `PUT /approve`, `PUT /reject` | Passed — RBAC actions intact |
| **Promotions CMS** | Dynamic coupon creation, batch generation, coupon activation toggle, expiration enforcement | `src/pages/admin/Coupons.jsx` | `GET/POST/DELETE /api/v1/coupons` | Passed — Coupon mutations verified |
| **Hero & Banner CMS**| Real-time promotional carousel control, typography adjustments, CTA routing, live interactive preview | `src/pages/admin/HeroEditor.jsx`, `src/pages/admin/BannerManagement.jsx` | `GET/PUT /api/v1/admin/settings/hero` | Passed — Synchronized live preview |
| **Outbox & Chaos** | Transactional outbox event monitoring, partition failover simulation, manual event retry | `src/pages/admin/AdminCommandCenter.jsx` | `GET /api/v1/admin/outbox/events` | Passed — Real-time telemetry feed |
| **Parent Observatory**| Student learning activity tracking, weekly study time visualization, safe mode restrictions | `src/pages/parent/ParentDashboard.jsx` | Client Pairing / Backend Pending | Preserved — Frontend fully intact |

---

## 3. Zero-Regression Certification
All 15 domain capabilities were verified against the production build. No legacy API contracts were altered, no parameter signatures were changed, and all response payloads continue to be parsed correctly by the UI data layers.

---
*Signed: Agent 01 (Chief Architect) & Agent 04 (Feature Preservation Lead)*

