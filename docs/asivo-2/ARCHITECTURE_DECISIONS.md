# ASIVO 2.0 — ARCHITECTURE DECISION RECORDS (ADR)

**Master Authority:** Agent 01 — Chief Architect  
**Status:** ACTIVE & BINDING  
**Repository:** `devcyberlearnix-art/UI`  
**Timestamp:** 2026-11-04T20:29:00Z  

---

## Index of Approved Architecture Decisions

- [ADR-001: Preservation of Single-Page Architecture & Vite Tooling](#adr-001-preservation-of-single-page-architecture--vite-tooling)
- [ADR-002: Implementation of the Shared Experience Engine](#adr-002-implementation-of-the-shared-experience-engine)
- [ADR-003: Quiet Atelier Canonical Design Token Standard](#adr-003-quiet-atelier-canonical-design-token-standard)
- [ADR-004: Parent Observatory Architecture & Relationship Cryptographic Handshake](#adr-004-parent-observatory-architecture--relationship-cryptographic-handshake)
- [ADR-005: Dual-Layer Persistence for CMS Dynamic Elements](#adr-005-dual-layer-persistence-for-cms-dynamic-elements)
- [ADR-006: Non-Destructive Mock and Fallback Resilience Pattern](#adr-006-non-destructive-mock-and-fallback-resilience-pattern)

---

### ADR-001: Preservation of Single-Page Architecture & Vite Tooling
- **Status:** APPROVED (2026-11-04)
- **Context:** The mission mandates transforming the LMS into Asivo 2.0 while preserving existing functionality and avoiding unnecessary rebuilds.
- **Decision:** Keep the existing React 18, Vite 5, Tailwind CSS, and React Router v6 setup. Do not introduce Next.js or alternate frameworks. Preserve existing Axios clients, authentication flows, and state context contracts.
- **Consequences:** Maximizes stability, guarantees sub-second HMR in development, and ensures 100% backward compatibility with backend microservices.

---

### ADR-002: Implementation of the Shared Experience Engine
- **Status:** APPROVED (2026-11-04)
- **Context:** Students, instructors, admins, and parents require cohesive spatial and cognitive modes (e.g., deep lecture study vs. catalog browsing vs. admin operations) without jarring layout shifts or losing URL context.
- **Decision:** Build a lightweight, high-performance Experience Engine located in `src/core/experience/`:
  - `ExperienceProvider`: Context wrapper supplying active mode and sensory state.
  - `ExperienceRegistry`: Route-to-mode mapping with runtime override capabilities.
  - `ExperienceStateManager`: Explicit state transitions between 4 canonical modes:
    - `EXPLORATION`: Open canvas, wide cards, discovery filters.
    - `LEARNING`: Focused two-column stage, progress sync, sticky syllabus.
    - `FOCUS`: Distraction-free theatre mode, ambient lighting, suppressed non-urgent badges.
    - `ACHIEVEMENT`: Celebratory milestone overlays, verifiable credential cards.
  - `NavigationController`: Synchronizes mode changes to URL query parameters (`?mode=focus`) and preserves browser history back/forward traversal.
  - `LayoutOrchestrator`: Dynamically shapes viewport framing, sidebar width, and header collapse without re-mounting DOM trees.
- **Consequences:** Unifies the entire platform under a seamless sensory interface without breaking browser navigation or page refresh states.

---

### ADR-003: Quiet Atelier Canonical Design Token Standard
- **Status:** APPROVED (2026-11-04)
- **Context:** Avoid generic AI blue-and-white SaaS templates. Enforce a distinctive, scholarly, warm educational aesthetic.
- **Decision:** The canonical color system is strictly locked to Quiet Atelier:
  - **Light Canvas:** `#F5F2EC` (Warm Alabaster Linen)
  - **Primary Surface:** `#FFFEFA` (Parchment White)
  - **Secondary Surface:** `#EAE5DC` (Warm Oatmeal)
  - **Primary Text:** `#282521` (Deep Espresso Ink)
  - **Secondary Text:** `#635E56` (Warm Mineral Umber)
  - **Muted Text:** `#756E64` (Subtle Editorial Stone)
  - **Brand Primary:** `#5B3E57` (Scholarly Damson Plum)
  - **Brand Hover:** `#462D42` (Deep Fig)
  - **Warm Accent:** `#9A6B56` (Terracotta Clay)
  - **Border Primary:** `#E3DCD3` (Linen Weave)
  - **Dark Canvas (Nocturnal Atelier):** `#151413`
  - **Dark Surface:** `#1D1C1A`
  - **Dark Text:** `#EDE8E1`
  - **Dark Plum Accent:** `#D1A7CC`
- **Consequences:** All components must consume these tokens via CSS variables or approved Tailwind classes. Arbitrary hex codes and random gradients are rejected at build/audit gates.

---

### ADR-004: Parent Observatory Architecture & Relationship Cryptographic Handshake
- **Status:** APPROVED (2026-11-04)
- **Context:** Parents require visibility into their linked student's academic progress, attendance, and certificates without accessing student private communications or compromising student account autonomy.
- **Decision:**
  1. Introduce a dedicated `/parent` route group with a `ParentLayout` and `ParentDashboard`.
  2. Implement a mutual cryptographic pairing handshake:
     - Student generates a temporary single-use pairing token in `ProfileWorkspace.jsx`.
     - Parent enters token in `ParentDashboard.jsx` along with student email confirmation.
     - System creates a linked relationship with explicit parental consent flags.
  3. All parent views are strictly read-only: parents can view progress bars, quiz scores, and certificate hashes, but cannot submit assignments, take quizzes, or mutate student profile data.
- **Consequences:** Full compliance with minor privacy standards (COPPA, FERPA, GDPR-K) and zero IDOR vulnerability.

---

### ADR-005: Dual-Layer Persistence for CMS Dynamic Elements
- **Status:** APPROVED (2026-11-04)
- **Context:** Administrators need dynamic real-time control over storefront banners and hero headlines, with zero downtime and offline resiliency.
- **Decision:**
  - Layer 1 (Remote): Spring Cloud API Gateway → CMS Service (`/api/v1/admin/landing-page/hero`, `/api/v1/public/landing-page`) with Redis caching and revision history.
  - Layer 2 (Local Cache): Optimistic `localStorage` cache (`asivo_admin_hero_config`) with cross-tab window event dispatch (`asivo:hero-updated`).
- **Consequences:** Instantaneous live preview, multi-tab sync, and guaranteed graceful degradation during backend service restarts.

---

### ADR-006: Non-Destructive Mock and Fallback Resilience Pattern
- **Status:** APPROVED (2026-11-04)
- **Context:** Development and testing environments may run when specific microservices are offline.
- **Decision:** Every API consumer must implement the Graceful Fallback Pattern (`Promise.allSettled` + sanitized local fallback defaults). If a microservice returns `ECONNREFUSED` or `500`, the UI renders fallback data with a subtle informative state rather than crashing with white screens of death.
- **Consequences:** Zero application fatal errors and uninterrupted development/testing workflows.

---

*Authored by Agent 01 — Chief Architect & System Director*

