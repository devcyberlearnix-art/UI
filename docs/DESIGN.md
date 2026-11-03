---
name: "FD_LMS Ink & Onyx Design System"
description: "Luxury dark architectural design system built on Pure Dark Charcoal Matte, Liquid Obsidian, Muted Gold, and Raw Mercury Satin."
colors:
  canvas-matte: "#070709"
  canvas-obsidian: "#0F0F13"
  canvas-surface: "#14141A"
  canvas-surface-raised: "#1B1B24"
  accent-gold: "#C5A880"
  accent-gold-muted: "rgba(197, 168, 128, 0.14)"
  accent-mercury: "#E5E5E7"
  text-primary: "#F5F5F7"
  text-secondary: "#A1A1AA"
  text-muted: "#71717A"
  border-subtle: "rgba(255, 255, 255, 0.04)"
  border-highlight: "rgba(255, 255, 255, 0.08)"
  border-accent: "rgba(197, 168, 128, 0.4)"
  status-success: "#34D399"
  status-warning: "#FBBF24"
  status-danger: "#F87171"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.04em"
  caption:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
  micro:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.05em"
  mono:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent-gold}"
    textColor: "{colors.canvas-matte}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-secondary:
    backgroundColor: "{colors.canvas-obsidian}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
---

# FD_LMS Ink & Onyx Design System

## Overview
The **Ink & Onyx** design system defines the aesthetic and structural identity of FD_LMS. Rejecting generic AI templates—such as saturated cyan/magenta gradients, nested card wrappers, decorative hairline grids, and chaotic motion—Ink & Onyx embraces architectural discipline, high-density clarity, and tactile physics.

## Colors
- **Canvas Base**: `#070709` (Dark Charcoal Matte) provides the foundational ground layer.
- **Surface Elevation**: `#0F0F13` (Liquid Obsidian) defines containers, panels, and sidebars. Elevated floating layers utilize `#14141A` and `#1B1B24`.
- **Signatures & Accents**: `#C5A880` (Muted Gold) is reserved for active state highlights, primary button triggers, and keyboard focus outlines. `#E5E5E7` (Raw Mercury Satin) provides high-clarity contrast for primary typography and crisp iconography.
- **Borders & Micro-Separators**: `rgba(255, 255, 255, 0.04)` for quiet boundary definition. Interactive hover state upgrades to `rgba(255, 255, 255, 0.09)`.
- **Text Palette**: Solid `#F5F5F7` for headings and primary copy; `#A1A1AA` for secondary metadata; `#71717A` for tertiary captions.

## Typography
- **Font Stack**: Headings and body set in Plus Jakarta Sans. Tabular data, code tokens, and metrics set in JetBrains Mono.
- **Hierarchy Floor**: Strict refusal of skipped heading levels (e.g., jumping from h1 directly to h3). Heading spacing enforces `heading-rhythm`: space above a heading always exceeds space below it.
- **Line Length**: Main paragraph and reading containers are constrained between `65ch` and `75ch` to maintain natural tracking ergonomics.
- **Text Balancing**: Display titles apply `text-wrap: balance`; paragraphs employ `text-wrap: pretty` to eliminate orphaned single-word stragglers.

## Layout
- **Scaffolding**: Single-depth containment. Avoid wrapping cards inside cards.
- **App Shell**: Persistent, collapsible obsidian sidebar on desktop; full drawer navigation on mobile with fixed top bar.
- **Grid Systems**: Clean, asymmetrical or balanced 3-column catalog grids with uniform card aspect ratios (`16:9` media containers).

## Elevation & Depth
- **Depth Hierarchy**: Established through tonal value layering rather than intense drop shadows or faux neobrutalist block shadows.
  - Floor 0: `#070709` Canvas
  - Floor 1: `#0F0F13` Sidebar / Main Panels
  - Floor 2: `#14141A` Card Surfaces
  - Floor 3: `#1B1B24` Popovers, Dropdowns, and Dialogs
- **Shadow Profile**: Soft, diffused shadows (`box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.7)`) with an ambient gold focus glow when activated.

## Shapes
- **Corner Radii**:
  - `rounded-lg` (`12px`) for interactive buttons, inputs, and chips.
  - `rounded-2xl` (`16px`) for primary cards and modular panels.
  - `rounded-3xl` (`24px`) for the application shell frame.
- **Borders**: Uniform `1px` borders with `rgba(255, 255, 255, 0.04)` opacity. Thick side-stripes (such as `border-l-4`) are strictly prohibited.

## Components
- **Buttons**:
  - `primary`: Muted Gold (`#C5A880`) background with Dark Charcoal (`#070709`) text and font-bold weight.
  - `secondary`: Liquid Obsidian (`#0F0F13`) background with Mercury Satin (`#E5E5E7`) text and subtle `rgba(255, 255, 255, 0.06)` border.
  - `ghost`: Transparent with subtle hover wash.
- **Badges**: Monochromatic pills with muted background tints (`rgba(197, 168, 128, 0.1)` for gold, `rgba(255, 255, 255, 0.05)` for neutral).
- **Inputs**: Floating labels with zero displacement; focus state displays a crisp 1px Gold border and subtle glow.
- **Skeleton Shimmer**: Pre-rendered layout frames utilizing `#0F0F13` base with a quiet `rgba(255, 255, 255, 0.03)` shimmer pass.

## Do's and Don'ts
- **DO**:
  - Use exact spring physics (`stiffness: 280, damping: 26`) or `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Use `layoutId` on dynamic tabs and active navigation markers for seamless layout morphing.
  - Reserve space before asynchronous content renders to guarantee Zero-CLS.
  - Use solid, high-contrast typography.
- **DON'T**:
  - NEVER use purple-to-cyan or pink-to-blue gradient fills on text or backgrounds.
  - NEVER use `border-l-4` side-color bars on cards or alerts.
  - NEVER use bounce, elastic, or overshoot easing on standard UI interactions.
  - NEVER use decorative background grid lines unless displaying a literal schematic, canvas, or blueprint.
  - NEVER nest cards inside cards.
