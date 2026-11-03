# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are engineering professionals, cybersecurity practitioners, and enterprise students acquiring high-level architectural, full-stack, and security engineering skills. Secondary users include lead instructors authoring live sessions, and academic administrators managing verified credential lifecycles.

## Product Purpose

FD_LMS is a mission-critical, enterprise-grade learning management and verification system designed for technical mastery. It delivers live interactive video classrooms, real-time code execution and quiz runner workspaces, verified cryptographic credentialing, and curriculum progress tracking without synthetic fluff or distraction.

## Positioning

A zero-compromise, security-first educational platform with real-world architecture tracks taught directly by verified engineering leads. Distinct from consumer tutorial portals through its live lab simulation, verifiable skill verification, and distraction-free operational focus.

## Operating Context

High-intensity technical study sessions, long-duration code and lab execution, interactive live streaming with sub-second discussion hubs, and cryptographic certificate verification. Requires a high-focus, low-fatigue dark environment tailored for prolonged screen engagement.

## Capabilities and Constraints

- **Stack**: React 18, Vite 5, Tailwind CSS, Framer Motion, TanStack Query, Axios with JWT authentication interceptors.
- **Performance**: Zero Cumulative Layout Shift (Zero-CLS) using pre-rendered skeleton frames for all asynchronous operations.
- **Physics**: Unified spring physics curves (`stiffness: 280, damping: 26`) and smooth cubic-bezier transitions (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Affordances**: Fully responsive desktop, tablet, and mobile layouts with persistent layout morphing (`layoutId`).

## Brand Commitments

- **Visual World**: "Ink & Onyx" luxury dark architecture.
- **Base Canvas**: Pure Dark Charcoal Matte (`#070709`) and Liquid Obsidian (`#0F0F13`).
- **Accent Signatures**: Translucent Muted Gold (`#C5A880`) and Raw Mercury Satin (`#E5E5E7`), framed with whisper-thin micro-borders (`rgba(255, 255, 255, 0.04)`).
- **Prohibitions**: Strict refusal of AI slop: no purple/violet/cyan gradients, no floating card-in-card nesting, no status-chip soup, no bounce/elastic easing, no gradient text, and no skipped typographic hierarchy.

## Product Principles

1. **Restraint Over Decoration**: Visual elements must earn their presence through functional clarity and scanability.
2. **Intentional Typography Hierarchy**: Typography communicates structure; weight and size determine priority without decorative text gradients or skipped heading levels.
3. **Kinetic Continuity**: UI elements transition with organic physics (`stiffness: 280, damping: 26`), morphing across layout shifts rather than popping or snapping.
4. **Predictable Layout Stability**: Reserve spatial geometry before data loads; zero content displacement during network requests.

## Accessibility & Inclusion

- WCAG AA compliant contrast ratios (≥4.5:1 for body and labels, ≥3:1 for large display elements).
- Dedicated high-visibility keyboard focus rings themed from Muted Gold (`#C5A880`).
- Themed browser selection and scrollbar surfaces.

## Live Verification & Architectural Telemetry

- **Verification Pipeline**: Verified by `scripts/platform_full_spectrum_audit.spec.js` running headless Chromium across all user life-cycles.
- **Microservice Integration**: 100% verified against live Spring Boot microservices on Gateway Port 8080.
- **Trace Propagation**: Full header inspection ensures `X-Trace-Id`, `X-User-Id`, and `X-User-Role` transit every network boundary with zero serialization faults.
- **Data Persistence**: Confirmed persistence across PostgreSQL databases (`lms_user_db`, `lms_cart_db`, `lms_order_db`, `lms_course_db`).

