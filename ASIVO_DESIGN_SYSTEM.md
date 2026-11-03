# ASIVO LMS — ENTERPRISE DESIGN SYSTEM SPECIFICATION
**Version:** 2.0.0 (Distinctive Brand Architecture & Quiet Atelier)  
**Status:** Living Design System Standard  

---

## 1. DESIGN PHILOSOPHY & TOKENS ARCHITECTURE

The Asivo Design System embodies **Scholarly Warmth & Quiet Atelier**. It treats educational software not as an alarming notifications engine, but as an elegant, focused study pavilion.

### 1.1 Global CSS Custom Properties Specification

```css
/* =========================================================================
   ASIVO DESIGN SYSTEM: LIGHT THEME (DEFAULT)
   ========================================================================= */
:root,
html.light,
html[data-theme="light"] {
  /* Surfaces & Canvas */
  --color-canvas: #F5F2EC;
  --color-surface: #FFFEFA;
  --color-surface-raised: #FFFFFF;
  --color-surface-secondary: #EAE5DC;
  --color-surface-tertiary: #E1DBD0;

  /* Typography */
  --color-text-primary: #282521;
  --color-text-secondary: #635E56;
  --color-text-muted: #756E64;
  --color-text-inverse: #FFFEFA;

  /* Structural Hairlines & Borders */
  --color-border: #E3DCD3;
  --color-border-subtle: #EBE5DC;
  --color-border-strong: #C8BFB2;

  /* Brand Signature Accent: Muted Scholarly Plum */
  --color-brand-primary: #5B3E57;
  --color-brand-hover: #462D42;
  --color-brand-active: #382335;
  --color-brand-subtle: #F2ECF1;
  --color-brand-border: #D5C0D1;

  /* Secondary Editorial Accent: Warm Clay */
  --color-accent-clay: #9A6B56;
  --color-accent-clay-hover: #835744;
  --color-accent-clay-subtle: #F6EFEA;

  /* Semantic Feedback Tokens */
  --color-success: #2B6747;
  --color-success-subtle: #EBF3EE;
  --color-success-border: #B7D9C5;

  --color-warning: #935E1E;
  --color-warning-subtle: #F9F2E7;
  --color-warning-border: #E5CDA8;

  --color-danger: #9B3835;
  --color-danger-subtle: #FAECEB;
  --color-danger-border: #E8B4B2;

  --color-info: #365D75;
  --color-info-subtle: #EDF3F7;
  --color-info-border: #B2CCE0;

  /* Interactive Form Tokens */
  --color-input-bg: #FFFEFA;
  --color-input-border: #D8D0C5;
  --color-input-focus-border: #5B3E57;
  --color-input-focus-ring: rgba(91, 62, 87, 0.15);

  /* Navigation & Workspace Chrome */
  --color-sidebar-bg: #FAF7F2;
  --color-sidebar-text: #4F4A43;
  --color-sidebar-hover: #EFE9E0;
  --color-sidebar-active-bg: #F2ECF1;
  --color-sidebar-active-text: #5B3E57;
  --color-header-bg: rgba(255, 254, 250, 0.92);

  /* Data Visualization Series */
  --color-chart-1: #5B3E57; /* Plum */
  --color-chart-2: #37654F; /* Juniper */
  --color-chart-3: #A36750; /* Terracotta Clay */
  --color-chart-4: #436A84; /* Slate Cerulean */
  --color-chart-5: #A87E38; /* Warm Ochre */

  /* Shadows (Restrained, Warm Ambient) */
  --shadow-sm: 0 1px 2px 0 rgba(40, 37, 33, 0.04);
  --shadow-card: 0 1px 3px 0 rgba(40, 37, 33, 0.05), 0 1px 2px -1px rgba(40, 37, 33, 0.05);
  --shadow-hover: 0 4px 12px -2px rgba(40, 37, 33, 0.08), 0 2px 4px -2px rgba(40, 37, 33, 0.04);
  --shadow-modal: 0 20px 40px -10px rgba(40, 37, 33, 0.15);
}

/* =========================================================================
   ASIVO DESIGN SYSTEM: DARK THEME (NOCTURNAL ATELIER)
   ========================================================================= */
html.dark,
html[data-theme="dark"] {
  /* Surfaces & Canvas */
  --color-canvas: #151413;
  --color-surface: #1D1C1A;
  --color-surface-raised: #242220;
  --color-surface-secondary: #2B2926;
  --color-surface-tertiary: #35322F;

  /* Typography */
  --color-text-primary: #EDE8E1;
  --color-text-secondary: #A69F94;
  --color-text-muted: #7A7368;
  --color-text-inverse: #151413;

  /* Structural Hairlines & Borders */
  --color-border: rgba(237, 232, 225, 0.09);
  --color-border-subtle: rgba(237, 232, 225, 0.05);
  --color-border-strong: rgba(237, 232, 225, 0.16);

  /* Brand Signature Accent: Soft Thistle Bloom */
  --color-brand-primary: #D1A7CC;
  --color-brand-hover: #E0BFDC;
  --color-brand-active: #C092BB;
  --color-brand-subtle: rgba(209, 167, 204, 0.12);
  --color-brand-border: rgba(209, 167, 204, 0.28);

  /* Secondary Accent: Luminous Sand Clay */
  --color-accent-clay: #D9A48F;
  --color-accent-clay-hover: #E8B6A3;
  --color-accent-clay-subtle: rgba(217, 164, 143, 0.12);

  /* Semantic Feedback Tokens */
  --color-success: #529E73;
  --color-success-subtle: rgba(82, 158, 115, 0.14);
  --color-success-border: rgba(82, 158, 115, 0.3);

  --color-warning: #D19447;
  --color-warning-subtle: rgba(209, 148, 71, 0.14);
  --color-warning-border: rgba(209, 148, 71, 0.3);

  --color-danger: #D66B67;
  --color-danger-subtle: rgba(214, 107, 103, 0.14);
  --color-danger-border: rgba(214, 107, 103, 0.3);

  --color-info: #6499BE;
  --color-info-subtle: rgba(100, 153, 190, 0.14);
  --color-info-border: rgba(100, 153, 190, 0.3);

  /* Interactive Form Tokens */
  --color-input-bg: #1D1C1A;
  --color-input-border: rgba(237, 232, 225, 0.12);
  --color-input-focus-border: #D1A7CC;
  --color-input-focus-ring: rgba(209, 167, 204, 0.2);

  /* Navigation & Workspace Chrome */
  --color-sidebar-bg: #1A1917;
  --color-sidebar-text: #A69F94;
  --color-sidebar-hover: #242220;
  --color-sidebar-active-bg: rgba(209, 167, 204, 0.12);
  --color-sidebar-active-text: #D1A7CC;
  --color-header-bg: rgba(29, 28, 26, 0.88);

  /* Data Visualization Series */
  --color-chart-1: #D1A7CC;
  --color-chart-2: #65AF88;
  --color-chart-3: #D9A48F;
  --color-chart-4: #6499BE;
  --color-chart-5: #E2AD5D;

  /* Shadows (Deep Umber Nocturnal) */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-card: 0 2px 6px 0 rgba(0, 0, 0, 0.4);
  --shadow-hover: 0 8px 24px -4px rgba(0, 0, 0, 0.55);
  --shadow-modal: 0 24px 48px -12px rgba(0, 0, 0, 0.7);
}
```

---

## 2. TYPOGRAPHIC HIERARCHY

Typographic rhythm follows a harmonious 1.25 scale (Major Third) with optical kerning and balanced heading wrapping.

| Style Level | Font Family | Size / Line Height | Weight | Letter Spacing | Use Case |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Display 1** | Plus Jakarta Sans | 36px / 44px | 700 | -0.025em | Main Landing Hero Headline |
| **Heading 1** | Plus Jakarta Sans | 28px / 36px | 600 | -0.02em | Dashboard & Workspace Titles |
| **Heading 2** | Plus Jakarta Sans | 22px / 28px | 600 | -0.015em | Section Titles, Major Card Headers |
| **Heading 3** | Plus Jakarta Sans | 18px / 24px | 600 | -0.01em | Table Group Headers, Modal Titles |
| **Subhead** | Plus Jakarta Sans | 15px / 22px | 500 | -0.005em | Synopsis, Card Descriptions |
| **Body Primary**| Plus Jakarta Sans | 14px / 20px | 400 | normal | Main Data Cells, Paragraphs |
| **Caption / Meta**| Plus Jakarta Sans| 12px / 16px | 500 | +0.01em | Timestamps, Badges, Table Headers |
| **Mono / Code** | JetBrains Mono | 12px / 18px | 400 | -0.01em | IDs, Transaction Hashes, Metrics |

---

## 3. SPACING & LAYOUT GEOMETRY

To prevent cluttered dashboards and promote comfortable long sessions:
- **Spatial Unit**: 4px base increment (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`).
- **Container Maximum Widths**: `max-w-7xl` (1280px) for standard workspace, `max-w-5xl` for focused learning & reading.
- **Card Padding**:
  - Compact (KPI widgets): `16px` (`p-4`)
  - Standard (Data tables, course cards): `24px` (`p-6`)
  - Spacious (Hero sections, detailed editors): `32px` (`p-8`)
- **Corner Radii**:
  - Buttons & Inputs: `8px` (`rounded-lg`)
  - Cards & Modal Panels: `12px` to `16px` (`rounded-xl` to `rounded-2xl`)
  - Badges & Pills: `9999px` (`rounded-full`)

---

## 4. COMPONENT STATE MATRIX

| Component State | Light Theme Specification | Dark Theme Specification |
| :--- | :--- | :--- |
| **Primary Button: Default** | Background `#5B3E57`, Text `#FFFEFA` | Background `#D1A7CC`, Text `#151413` |
| **Primary Button: Hover** | Background `#462D42`, Text `#FFFEFA` | Background `#E0BFDC`, Text `#151413` |
| **Primary Button: Focus** | `box-shadow: 0 0 0 2px #FFFEFA, 0 0 0 4px #5B3E57` | `box-shadow: 0 0 0 2px #1D1C1A, 0 0 0 4px #D1A7CC` |
| **Primary Button: Disabled**| Background `#EAE5DC`, Text `#9C958A`, cursor not-allowed | Background `#2B2926`, Text `#6E675E`, cursor not-allowed |
| **Secondary Button: Default**| Background `#FFFEFA`, Border `1px solid #E3DCD3`, Text `#282521` | Background `#1D1C1A`, Border `1px solid rgba(237,232,225,0.12)`, Text `#EDE8E1` |
| **Secondary Button: Hover** | Background `#F5F2EC`, Border `1px solid #D5CCC0` | Background `#272523`, Border `1px solid rgba(237,232,225,0.2)` |
| **Text Input: Idle** | Background `#FFFEFA`, Border `#D8D0C5`, Text `#282521` | Background `#1D1C1A`, Border `rgba(237,232,225,0.12)`, Text `#EDE8E1` |
| **Text Input: Focus** | Border `#5B3E57`, Ring `2px rgba(91,62,87,0.15)` | Border `#D1A7CC`, Ring `2px rgba(209,167,204,0.25)` |
| **Table Row: Idle** | Background `#FFFEFA`, Border `#E3DCD3` | Background `#1D1C1A`, Border `rgba(237,232,225,0.06)` |
| **Table Row: Hover** | Background `#F7F4EE` (Subtle warmth) | Background `#242220` |

---

## 5. RESTRAINED ACCENT APPLICATION RULES

1. **The 80/15/5 Rule**: 80% warm neutral canvas/surfaces, 15% structural typography/borders, 5% brand signature/semantic indicators.
2. **No Rainbow Dashboards**: Every metric card does NOT receive an arbitrary colored icon background (e.g. no random bright yellow, violet, cyan boxes). Metric cards use clean ivory backgrounds with deep sumi ink counts and subtle muted captions.
3. **Semantic Integrity**:
   - Green is strictly reserved for "Enrolled", "Published", "Paid", "Completed".
   - Amber is strictly reserved for "Pending Verification", "Draft", "Action Needed".
   - Red is strictly reserved for "Failed", "Rejected", "Overdue", "Destructive Action".
   - Plum (`#5B3E57`) is the brand signature used for platform actions and selected navigation.
