# ASIVO LMS — VERSION 21.2
## Baseline Authentication UI/UX Inspection & Root Cause Audit Report

**Date:** November 1, 2026  
**Role:** Senior Product Designer, Principal Frontend Engineer & UI Architect  
**Scope:** Pre-modification Baseline Audit of Asivo Authentication Subsystem  
**Overall Status:** **BASELINE INSPECTION COMPLETED (ZERO CODE MODIFICATIONS YET)**

---

## 1. Executive Summary

In accordance with Version 21.2 directives, a thorough baseline inspection of the existing Asivo LMS authentication codebase was conducted across layout engines, responsive containers, component hierarchies, visual design tokens, logo assets, form controls, and microservice API integration layers.

This audit establishes the empirical evidence baseline before executing targeted architectural and visual refinements.

---

## 2. Baseline Evidence & Defect Analysis Matrix

| Area | Current Implementation | Defect | Required Correction |
| :--- | :--- | :--- | :--- |
| **Logo Asset & Rendering** | Raw file `/assets/asivo-logo.png` (`2131 x 738` px) and scaled variant `asivo-logo-sm.png` (`231 x 80` px). Both files are horizontal combination lockups with significant transparent margins (`minX: 289, minY: 128, maxX: 1863, maxY: 616`). Squeezed into a `w-10 h-10` container with `w-7 h-7 object-contain`. | Because a 2.88:1 wide asset containing both icon mark and text was forced into a 28x28px square, the image scaled down to 28x9.7px, reducing the actual brand symbol to an illegible ~8x8px speck. Redundant HTML text ("Asivo LEARNING PLATFORM") was displayed adjacent to this squashed lockup. | 1. Isolate the exact standalone Asivo emblem symbol (`500 x 489` px, 0px margin) as `asivo-symbol.png`.<br>2. Center this symbol inside a polished `w-11 h-11 rounded-2xl bg-[#14141A] border border-[#C5A880]/30` badge with crisp `w-7 h-7` dimensions.<br>3. Align with high-contrast, perfectly tracked typography wordmark ("Asivo" / "LEARNING PLATFORM").<br>4. Provide full trimmed lockup `asivo-logo-trimmed.png` for wide branding. |
| **Left Panel Vertical Layout** | `section.hidden.lg:flex` uses `flex-col justify-between`. Inside it, the hero block uses `my-auto py-8 max-w-lg space-y-6`. | 1. `justify-between` combined with `my-auto` creates an enormous empty gap between the top logo and the hero block.<br>2. Because Registration has 5 form fields (~950px card height) and Login has 2 fields (~650px card height), the flex-row stretches the left panel to different heights.<br>3. `my-auto` centers the hero block at different vertical coordinates on Login vs. Registration, causing the entire left content to jump vertically by ~120px when navigating between pages. | 1. Remove `justify-between` and `my-auto`.<br>2. Implement a fixed, deliberate top vertical rhythm: top padding `pt-10 lg:pt-12 xl:pt-14 px-10 xl:px-14 pb-8 lg:pb-10`.<br>3. Position the hero block at a fixed top offset `mt-8 lg:mt-12 xl:mt-14` so its vertical start coordinate is 100% identical between Login and Registration.<br>4. Pin the trust & legal footer to the bottom using `mt-auto pt-8 border-t border-white/[0.04]`. |
| **Login Card Dimensions & Alignment** | Container: `<div className="w-full max-w-md my-auto">`. Outer section has conflicting classes: `flex flex-col justify-between p-6 sm:p-10 lg:p-12 items-center justify-center relative min-h-screen`. | Outer flex properties conflict (`justify-between` vs `justify-center`). Subtitle in card header is static ("Enter your credentials...") rather than adapting to Password Mode vs. OTP Code Mode instructions. | 1. Cleanse outer right section to `flex flex-col items-center justify-center min-h-screen p-6 sm:p-8 lg:p-12 relative`.<br>2. Unify card container width to `max-w-[460px]`.<br>3. Introduce mode-specific dynamic card subtitles:<br>- *Password Mode:* "Enter your email and master password to access your courses and workspace."<br>- *OTP Mode:* "Enter your email to receive a secure single-use 6-digit passcode." |
| **Registration Card & Field Hierarchy** | Form contains 5 required fields. Registration card uses `wide` prop which adds `sm:max-w-lg`, while parent container uses `max-w-md` (448px), creating conflicting constraints. Grid for First/Last name does not reserve uniform space for errors. | Width mismatch between card and container. Uneven column heights when error occurs on only one name field. Password strength checklist can be more compact and visually integrated. | 1. Harmonize container width to `max-w-[460px]` matching Login.<br>2. Standardize field spacing to `space-y-4`.<br>3. Align name field error containers to preserve grid symmetry.<br>4. Render password strength bar and requirement checklist with compact, elegant tokens and live ARIA announcements. |
| **Typography & Sizing Hierarchy** | Headings use Plus Jakarta Sans (`font-extrabold`). Passcodes and badges use JetBrains Mono (`font-mono`). | Inconsistent card header subtitle sizes and icon containers across pages (`w-12 h-12` vs `w-10 h-10` vs `w-14 h-14`). | 1. Unify all authentication card headers to `w-12 h-12 rounded-2xl bg-[#14141A] border border-[#C5A880]/30` with `w-5 h-5` gold icon.<br>2. Unify title to `text-2xl font-extrabold text-[#F5F5F7] tracking-tight`.<br>3. Unify subtitle to `text-xs text-[#A1A1AA]`.<br>4. Standardize field labels to `text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider`. |
| **Form Controls & Interactive States** | `lms-input` defined in `src/index.css` with `@apply w-full rounded-xl border border-white/[0.06] bg-[#0F0F13]/90 px-4 py-3 text-sm`. | Height of inputs varies slightly when icons are embedded vs plain. Focus rings require consistent champagne gold styling across all inputs and tab buttons. | 1. Standardize form inputs to consistent `48px` (`h-12`) height with vertically centered `16px` leading icons.<br>2. Standardize submit buttons to `48px` (`h-12`) height with clear disabled, hover, active, and loading spinner states.<br>3. Ensure all interactive controls have visible `focus-visible:ring-2 focus-visible:ring-[#C5A880]`. |
| **API Integration & Contracts** | Endpoints mapped in `src/api/authApi.js`: `/api/v1/auth/login`, `/register`, `/verify-email`, `/login/otp/**`, `/password/**`. | In previous session, `AuthContext.login()` called `setLoading(true)`, causing `App.jsx` to unmount routes. Fixed in V21, but OTP verify role normalization needed refinement. | 1. Maintain zero-duplicate API policy.<br>2. Keep `AuthContext` loading scoped strictly to `restoreSession`.<br>3. Ensure all role assignments pass through `normalizeRole(...)` (lowercase `student`).<br>4. Preserve session tokens in `localStorage` without leaking sensitive secrets. |
| **Responsiveness & Breakpoints** | Breakpoints tested at standard 7 viewports in V21. | Need to verify 10 distinct viewports specified in V21.2: `320x700`, `360x740`, `375x667`, `390x844`, `430x932`, `768x1024`, `1024x768`, `1280x800`, `1440x900`, `1920x1080`. Mobile layout requires optimized logo display and compact spacing. | 1. Test all 10 viewport configurations.<br>2. Ensure left branding panel collapses gracefully on mobile/tablet viewports (<1024px).<br>3. Provide accessible touch targets $\ge 44\text{px}$ across all mobile sizes.<br>4. Eliminate all horizontal scrolling (`overflow-x: hidden`). |

---

## 3. Image Asset Audit Evidence

Using Node.js and the `sharp` image processing engine, the assets in `public/assets/` were analyzed:

```
public/assets/asivo-logo.png:
  Format: PNG
  Dimensions: 2131 x 738 px
  Color Channels: 4 (RGBA, hasAlpha: true)
  Non-transparent Content Bounding Box:
    minX: 289, minY: 128, maxX: 1863, maxY: 616
    contentWidth: 1575 px, contentHeight: 489 px
  Transparent Padding Overhead:
    Left: 289 px, Right: 268 px, Top: 128 px, Bottom: 122 px

Sub-Component Boundaries (within content):
  Symbol Icon Mark: x: 0 to 500 px (Width: 500 px, Height: 489 px, ~1:1 Aspect Ratio)
  Gap: x: 500 to 514 px (Width: 15 px)
  Wordmark ("Asivo"): x: 514 to 1575 px (Width: 1061 px)
```

**Diagnostic Conclusion:**
The asset contains a high-resolution square brand symbol followed by the wordmark. When the combined asset was loaded into a square container, the letterforms forced the symbol to shrink by a factor of 3. Extracting the standalone symbol resolves the visual defect without introducing unapproved artwork.

---

## 4. Next Actions

With the baseline inspection complete, the following sequential implementation steps are authorized:
1. Generate `asivo-symbol.png` and `asivo-logo-trimmed.png` in `public/assets/`.
2. Refactor `src/components/ui/AuthShell.jsx` to eliminate `my-auto` / `justify-between`, establish uniform top positioning, and embed the crisp brand symbol.
3. Refine `src/pages/Login.jsx` (mode-specific subtitles, 460px card, 48px inputs).
4. Refine `src/pages/Register.jsx` (460px card, compact checklist, symmetrical name grid).
5. Refine `src/components/ui/SocialAuthButtons.jsx` (visual unavailability badges).
6. Verify and polish `OtpVerify.jsx`, `ForgotPassword.jsx`, and `ResetOtp.jsx`.
7. Execute full 10-viewport Playwright automated suite.
8. Author all 15 required deliverables.

