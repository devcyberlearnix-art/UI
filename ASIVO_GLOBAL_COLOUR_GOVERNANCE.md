# ASIVO LMS — GLOBAL COLOUR GOVERNANCE SPECIFICATION
**Document ID:** `AGCG-20261103-V3`  
**Brand Identity:** Quiet Atelier / Scholarly Warmth  
**Version:** 3.0.0 (Authoritative Standard)  
**Status:** ACTIVE — MANDATORY PLATFORM STANDARD

---

## 1. THE SINGLE SOURCE OF TRUTH

All visual styles across Asivo LMS derive strictly from the approved tokens declared in `src/index.css` and exposed via `tailwind.config.js`. No individual page, component, or developer may introduce arbitrary hex codes, RGB literals, or unauthorized Tailwind color classes.

### 1.1 Canonical Light Theme (Default)

| Semantic Token | Hex Value | Role / Usage Context | Contrast on Surface | WCAG Compliance |
| :--- | :---: | :--- | :---: | :---: |
| **Canvas** | `#F5F2EC` | Main page background (Warm Parchment) | — | Base Canvas |
| **Primary Surface** | `#FFFEFA` | Cards, panels, modals, dropdowns (Soft Ivory) | — | Primary Container |
| **Secondary Surface** | `#EAE5DC` | Active sidebar pills, tab bars, table headers | — | Secondary Container |
| **Primary Text** | `#282521` | Headings, body copy, active labels (Deep Sumi Ink)| **15.11:1** | **Level AAA** |
| **Secondary Text** | `#635E56` | Subtitles, helper text, form labels (Slate Charcoal)| **6.37:1** | **Level AA** |
| **Muted Text** | `#756E64` | Placeholders, timestamps, borders meta (Archival) | **4.99:1** | **Level AA** |
| **Brand Primary** | `#5B3E57` | Primary buttons, active indicators, brand logo | **9.16:1** | **Level AAA** |
| **Brand Hover** | `#462D42` | Interactive hover state for brand actions | **11.45:1**| **Level AAA** |
| **Clay Accent** | `#9A6B56` | Editorial highlights, badges, secondary accents | **4.51:1** | **Level AA (UI)**|
| **Hairline Border** | `#E3DCD3` | Structural borders, card boundaries, table dividers| **1.35:1** | Structural 1px |

---

### 1.2 Canonical Dark Theme (Nocturnal Atelier)

Dark mode is preserved as an intentional, warm nocturnal study experience—never harsh pitch-black (`#000000`).

| Semantic Token | Hex Value | Role / Usage Context | Contrast on Surface | WCAG Compliance |
| :--- | :---: | :--- | :---: | :---: |
| **Canvas** | `#151413` | Main dark background (Velvet Carbon) | — | Base Canvas |
| **Primary Surface** | `#1D1C1A` | Dark cards, panels, elevated modals (Obsidian Slate)| — | Primary Container |
| **Secondary Surface** | `#272523` | Active dark pills, table headers, elevated inputs | — | Secondary Container |
| **Primary Text** | `#EDE8E1` | Dark mode body and title copy (Dark Parchment) | **13.97:1** | **Level AAA** |
| **Secondary Text** | `#A69F94` | Dark mode secondary metadata (Muted Sand) | **6.49:1** | **Level AA** |
| **Muted Text** | `#7A7368` | Dark mode placeholders, timestamps | **4.62:1** | **Level AA** |
| **Brand Primary** | `#D1A7CC` | Dark mode brand accent and actions (Thistle Bloom) | **8.20:1** | **Level AAA** |
| **Brand Hover** | `#E0BFDC` | Hover state for dark brand actions | **10.12:1**| **Level AAA** |
| **Clay Accent** | `#D9A48F` | Dark mode warm clay accent | **7.15:1** | **Level AAA** |
| **Hairline Border** | `rgba(237,232,225,0.08)` | Structural hairline border in dark mode | — | Structural 1px |

---

## 2. SEMANTIC STATUS & FEEDBACK TOKENS

Semantic feedback is strictly isolated from the brand plum accent to preserve clear, unambiguous communication:

```
+-----------------------------------------------------------------------------------------+
|                               SEMANTIC FEEDBACK MATRIX                                  |
+-----------+---------------+---------------+---------------+-----------------------------+
| State     | Foreground    | Subtle Fill   | Border Tint   | Purpose / Meaning           |
+-----------+---------------+---------------+---------------+-----------------------------+
| Success   | Pine: #2B6747 | #EBF3EE       | #B7D9C5       | Completed, Published, Pass  |
| Warning   | Topaz: #935E1E| #F9F2E7       | #E5CDA8       | Draft, Pending, Action Req  |
| Danger    | Terracotta:   | #FAECEB       | #E8B4B2       | Failed, Error, Restricted   |
|           | #9B3835       |               |               |                             |
| Info      | Steel: #365D75| #EDF3F7       | #B2CCE0       | Announcements, Notes        |
+-----------+---------------+---------------+---------------+-----------------------------+
```

---

## 3. DATA VISUALIZATION HARMONIC PALETTE

Charts and analytics must consume the harmonized Quiet Atelier 5-color series rather than neon or arbitrary primary colors:
- **Series 1 (Primary / Volume):** `#5B3E57` (Scholarly Plum)
- **Series 2 (Growth / Success):** `#37654F` (Forest Pine)
- **Series 3 (Secondary / Revenue):** `#A36750` (Warm Clay)
- **Series 4 (Technical / Sessions):** `#436A84` (Slate Blue)
- **Series 5 (Engagement / Retention):** `#A87E38` (Antique Gold)

---

## 4. TAILWIND & CSS VARIABLE CONSUMPTION RULES

### 4.1 Permitted Semantic Utility Classes
Developers must compose UI elements using the centralized semantic tokens:
- **Canvas:** `bg-canvas` or `bg-app-background`
- **Surface:** `bg-surface`, `bg-surface-secondary`, `bg-surface-card`
- **Text:** `text-primary`, `text-secondary`, `text-muted`
- **Borders:** `border-default`, `border-border`, `border-border-secondary`
- **Brand:** `bg-brand`, `text-brand`, `hover:bg-brand-hover`

### 4.2 Prohibited Anti-Patterns
1. **NO RAW HEX CODES:** Never write `bg-[#2563EB]`, `text-[#06B6D4]`, or `bg-[#070709]`.
2. **NO NEON ACCENTS:** Classes like `text-cyan-400`, `bg-cyan-500`, or `text-blue-500` are strictly forbidden.
3. **NO ARBITRARY GRADIENTS:** Do not write `bg-gradient-to-r from-purple-500 to-indigo-600` or `from-cyan-400 to-blue-500`.
4. **NO UNSCOPED DARK CLASSES IN LIGHT MODE:** Never attach `bg-slate-900` without a preceding `dark:` variant.
5. **NO RAINBOW STATUSES:** Status indicators must strictly map to `Badge` or `Alert` variants (`success`, `warning`, `danger`, `info`, `plum`, `clay`).

---

## 5. DEVELOPER LINTING & AUTOMATED GOVERNANCE

A project scanner (`scratch/scan-color-governance.mjs`) is integrated into the workspace. Any PR or branch introducing unapproved blue, cyan, or hardcoded hex literals will fail CI compliance.
