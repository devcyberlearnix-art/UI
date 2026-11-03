# ASIVO LMS — SHARED COMPONENT CONSISTENCY & SUITE SPECIFICATION
**Document ID:** `ACCR-20261103-V3`  
**Component Architecture:** Single Standard Design System (`src/design-system/`)  
**Design Lead:** Principal Design Systems Architect & Senior Frontend Engineer  
**Status:** 100% STANDARDIZED & EXPORTED

---

## 1. EXECUTIVE SUMMARY

To eliminate page-specific duplicate implementations and fragmented UI widgets, a centralized, enterprise-grade component suite has been established under `src/design-system/`.

Every component is built on top of the **Quiet Atelier** token architecture, natively supporting both Light Theme (Default) and Nocturnal Atelier Dark Theme with full responsive capabilities and WCAG 2.2 AA accessibility baked in.

All components are consolidated into a single unified entry point:
```javascript
import {
  Button,
  IconButton,
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Badge,
  Card,
  Modal,
  Dialog,
  Tabs,
  Table,
  Pagination,
  Breadcrumb,
  Skeleton,
  Alert,
  EmptyState,
  LoadingState,
  ErrorState,
  Tooltip,
  CourseCard
} from '../design-system';
```

---

## 2. THE CANONICAL COMPONENT INVENTORY

### 2.1 Interactive Primitives

| Component | File Path | Supported Variants / Sizes | Key Design Specifications |
| :--- | :--- | :--- | :--- |
| **`Button`** | `src/design-system/primitives/Button.jsx` | `primary`, `secondary`, `outline`, `ghost`, `danger` / `sm`, `md`, `lg` | Plum `#5B3E57` fill, soft ivory text, spring hover physics, embedded loading spinner without CLS. |
| **`IconButton`** | `src/design-system/primitives/IconButton.jsx` | `ghost`, `outline`, `primary`, `secondary`, `danger` / `sm` (32px), `md` (40px), `lg` (48px) | Enforces 44px minimum touch target on mobile viewports with accessible `aria-label`. |
| **`Input`** | `src/design-system/primitives/Input.jsx` | Default, with LeftIcon, RightElement, Error State | Soft Ivory surface `#FFFEFA`, warm border `#D8D0C5`, zero-displacement floating label, plum focus glow. |
| **`Select`** | `src/design-system/primitives/Select.jsx` | Standard dropdown with options or children | Custom styled chevron indicator, ivory background, plum focus ring, accessible `<label>`. |
| **`Textarea`** | `src/design-system/primitives/Textarea.jsx` | Multi-line text field with dynamic row sizing | Resizable vertical handle, error micro-alert support, non-glare typography. |
| **`Checkbox`** | `src/design-system/primitives/Checkbox.jsx` | Checked, Unchecked, Disabled with Label & Subtitle | Plum checkmark fill (`#5B3E57`), dual-layer focus outline, accessible hidden peer input. |
| **`Radio`** | `src/design-system/primitives/Radio.jsx` | Radio group item with Label & Description | Circular plum dot indicator (`#5B3E57`), smooth spring transitions. |
| **`Badge`** | `src/design-system/primitives/Badge.jsx` | `default`, `success`, `warning`, `danger`, `info`, `plum`, `clay` | Harmonic muted pigments (Pine, Topaz, Terracotta) over warm tinted pills; zero rainbow neon. |

---

### 2.2 Layout & Structural Containers

| Component | File Path | Supported Props / Modes | Key Design Specifications |
| :--- | :--- | :--- | :--- |
| **`Card`** | `src/design-system/primitives/Card.jsx` | Padding: `none`, `sm`, `md`, `lg`; `hover={true/false}` | Soft Ivory surface (`#FFFEFA`), hairline border (`#E3DCD3`), gentle elevated shadow. |
| **`Modal / Dialog`**| `src/design-system/primitives/Modal.jsx` | `isOpen`, `onClose`, `title`, `subtitle`, `footer`, `maxWidth` | Diffused warm backdrop (`rgba(40,37,33,0.45)`), pinned header & footer, escape key & scroll lock. |
| **`Tabs`** | `src/design-system/primitives/Tabs.jsx` | `tabs` array with `badge` and `icon` support | Warm parchment container (`#EAE5DC`), ivory active pill with plum text, horizontal scroll. |
| **`Table`** | `src/design-system/primitives/Table.jsx` | `columns`, `data`, `renderRow`, `keyExtractor` | Archival header bar (`#FAF7F2`), subtle row dividers, warm hover highlight (`#FAF7F2`/60). |
| **`Pagination`** | `src/design-system/primitives/Pagination.jsx` | `currentPage`, `totalPages`, `onPageChange`, `totalItems` | Numerical page pills, previous/next icon buttons, entries tally text. |
| **`Breadcrumb`** | `src/design-system/primitives/Breadcrumb.jsx` | `items` array with `to` and `label` | Home icon root, subtle chevron dividers, bold active leaf node in Sumi Ink. |

---

### 2.3 Feedback & State Management

| Component | File Path | Feedback Context | Key Design Specifications |
| :--- | :--- | :--- | :--- |
| **`Alert`** | `src/design-system/feedback/Alert.jsx` | `info`, `success`, `warning`, `danger` | Semantic icon, title, leading-relaxed copy, dismiss button, high contrast. |
| **`EmptyState`** | `src/design-system/feedback/EmptyState.jsx` | Custom `icon`, `title`, `description`, primary & secondary actions | Soft Ivory card, plum icon pill, clear CTAs; completely purged of legacy cyan. |
| **`LoadingState`**| `src/design-system/feedback/LoadingState.jsx`| `size` (`sm`, `md`, `lg`), `message` | Plum animated spinner (`#5B3E57`), uppercase archival tracking text. |
| **`ErrorState`** | `src/design-system/feedback/ErrorState.jsx` | `title`, `description`, `onRetry`, `retryLabel` | Terracotta warning badge (`#FAECEB`/`#9B3835`), retry button action. |
| **`Tooltip`** | `src/design-system/feedback/Tooltip.jsx` | `content`, `position` (`top`, `bottom`, `left`, `right`) | High-contrast Sumi Ink bubble (`#282521`) with ivory text, non-clipping. |
| **`Skeleton`** | `src/design-system/primitives/Skeleton.jsx` | `variant` (`text`, `circular`, `rectangular`, `card`) | Shimmer wave animation over warm neutral parchment base. |

---

## 3. COMPOSITE PATTERNS: COURSE CARD & BANNER MODAL

### 3.1 CourseCard (`src/design-system/components/CourseCard.jsx`)
- 16:9 warm thumbnail container (`#EAE5DC`) with fallback book icon.
- Category badge dynamically tinted in plum, clay, topaz, or pine.
- Sumi Ink title hierarchy, author metadata, rating stars in Topaz Amber.
- Primary plum action button ("Enroll Now" / "View Curriculum").

### 3.2 Banner Management Modal (`src/pages/admin/BannerManagement.jsx`)
- Consumes canonical modal architecture with warm diffused backdrop.
- Multipart drag-and-drop upload zone with dashed archival border (`#D8D0C5`).
- Pinned footer actions ("Cancel", "Publish Banner") that remain anchored at all viewport heights.

---

## 4. COMPONENT GOVERNANCE CHECKLIST FOR DEVELOPERS

1. **Import from the design system barrel:** Always import via `import { ... } from '@/design-system'`.
2. **Do not create redundant button styles:** Use `<Button variant="...">` instead of custom `<button className="...">`.
3. **Do not write page-specific modals:** Wrap custom dialogs in `<Modal isOpen={...} onClose={...}>`.
4. **Use standardized badges for status:** Always pass standard status variants (`success`, `warning`, `danger`).
