# ASIVO 2.0 — DESIGN SYSTEM REGISTRY (QUIET ATELIER)

**Director:** Agent 07 — Quiet Atelier Design Director  
**Specialists:** Agent 03 (Tokens), Agent 08 (Spatial Layout), Agent 09 (Components), Agent 10 (Motion)  
**Approved by:** Agent 01 — Chief Architect  
**Status:** CANONICAL & ENFORCED  

---

## 1. Aesthetic Identity: Scholarly Warmth & Quiet Atelier

Asivo 2.0 rejects the sterile, repetitive, high-saturation look of generic AI-generated dashboards in favor of an **editorial, scholarly, warm, and highly focused learning environment**. The sensory experience is inspired by high-end reading rooms, architectural ateliers, and boutique publication libraries.

---

## 2. Master Color Tokens

### Light Theme (Default)
| Token Name | Hex Code | Semantic Role | Tailwind Equivalence |
|---|---|---|---|
| `--app-background` | `#F5F2EC` | Main canvas / linen backdrop | `bg-[#F5F2EC]` |
| `--surface-primary` | `#FFFEFA` | Cards, active panels, modals | `bg-[#FFFEFA]` |
| `--surface-secondary` | `#EAE5DC` | Nested panels, table headers | `bg-[#EAE5DC]` |
| `--surface-tertiary` | `#DFD8CD` | Active pill tabs, borders | `bg-[#DFD8CD]` |
| `--text-primary` | `#282521` | Headings, primary reading text | `text-[#282521]` |
| `--text-secondary` | `#635E56` | Subtitles, descriptions, labels | `text-[#635E56]` |
| `--text-muted` | `#756E64` | Microcopy, timestamps, metadata | `text-[#756E64]` |
| `--primary` | `#5B3E57` | Primary buttons, brand plum | `bg-[#5B3E57]` / `text-[#5B3E57]` |
| `--primary-hover` | `#462D42` | Primary button hover | `hover:bg-[#462D42]` |
| `--accent-clay` | `#9A6B56` | Warm clay badges, underlines | `text-[#9A6B56]` / `border-[#9A6B56]` |
| `--border-primary` | `#E3DCD3` | Standard structural borders | `border-[#E3DCD3]` |
| `--border-focus` | `#5B3E57` | Keyboard focus ring | `ring-[#5B3E57]` |
| `--success` | `#2B6747` | Verified indicators, passes | `bg-[#2B6747]` / `text-[#2B6747]` |
| `--warning` | `#B45309` | Caution states, draft badges | `bg-[#B45309]` / `text-[#B45309]` |
| `--danger` | `#A82828` | Error states, destructive acts | `bg-[#A82828]` / `text-[#A82828]` |

### Nocturnal Atelier (Dark Theme Preference)
| Token Name | Hex Code | Semantic Role | Tailwind Equivalence |
|---|---|---|---|
| `--app-background-dark` | `#151413` | Deep nocturnal canvas | `dark:bg-[#151413]` |
| `--surface-primary-dark` | `#1D1C1A` | Dark card surface | `dark:bg-[#1D1C1A]` |
| `--surface-secondary-dark` | `#272523` | Dark nested panel | `dark:bg-[#272523]` |
| `--text-primary-dark` | `#EDE8E1` | High contrast parchment text | `dark:text-[#EDE8E1]` |
| `--text-secondary-dark` | `#A8A196` | Warm muted text | `dark:text-[#A8A196]` |
| `--primary-dark` | `#D1A7CC` | Luminous plum accent | `dark:text-[#D1A7CC]` |
| `--border-primary-dark` | `rgba(255,255,255,0.08)` | Subtle border seam | `dark:border-white/10` |

---

## 3. Typography Hierarchy

- **Font Family:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace Family (Telemetry, Code, Hashes):** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- **Scale:**
  - `Hero Display H1:` `text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]`
  - `Section H2:` `text-2xl sm:text-3xl font-bold tracking-tight text-[#282521] dark:text-[#EDE8E1]`
  - `Card Title H3:` `text-lg sm:text-xl font-bold tracking-tight text-[#282521] dark:text-[#EDE8E1]`
  - `Body Standard:` `text-sm sm:text-base text-[#635E56] dark:text-[#A8A196] leading-relaxed`
  - `Caption / Metadata:` `text-xs font-mono uppercase tracking-wider text-[#756E64] dark:text-[#7A7368]`

---

## 4. Spatial Geometry & Corner Radii

- **Cards & Banners:** `rounded-2xl` (16px) or `rounded-3xl` (24px) for prominent showcase canvases.
- **Buttons & Inputs:** `rounded-xl` (12px) for comfortable tactile touch targets.
- **Pills & Status Badges:** `rounded-full` (9999px) with `px-3 py-1 text-xs`.
- **Modals & Dialogs:** `rounded-3xl` with backdrop blur `backdrop-blur-xl bg-[#FFFEFA]/95 dark:bg-[#1D1C1A]/95`.

---

## 5. Motion Curves & Tactile Physics

- **Default Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` (`LUXURY_EASING`)
- **Hover Transitions:** `duration-200 ease-out transition-all`
- **Modal Transitions:** `duration-300 ease-[0.16,1,0.3,1]` with subtle `scale: 0.98 -> 1` and `opacity: 0 -> 1`
- **Reduced Motion:** When `prefers-reduced-motion: reduce` is detected, all transitions snap immediately without layout transform physics.

---

*Governed by Agent 07 & Agent 01*
