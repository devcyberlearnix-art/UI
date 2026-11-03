# Asivo LMS — Version 20: Performance & Build Audit

**Audit Date**: November 1, 2026  
**Build System**: Vite 5.4.21 / Rollup  
**Target Environment**: Production Distribution (`dist/`)  
**Overall Performance Verdict**: **PASS**

---

## 1. Production Build & Bundle Metrics

The frontend was compiled using Vite's production bundling pipeline:
- **Command**: `npm run build` (`vite build`)
- **Compilation Time**: **10.41 seconds** (re-build after a11y optimization)
- **Transformed Modules**: 2,602 modules
- **Build Errors**: **0 errors**, **0 fatal warnings**

### Bundle Chunk Breakdown

| Asset File | Uncompressed Size | Gzip Size | Purpose / Contents |
| :--- | :---: | :---: | :--- |
| `dist/index.html` | 3.62 kB | 1.24 kB | Root HTML entry with preconnect and meta tags |
| `dist/assets/index-CDbiKphs.css` | 130.41 kB | 19.22 kB | Global compiled Tailwind utility styles |
| `dist/assets/index-Ctn8E2av.js` | 583.65 kB | 148.48 kB | Core application shell & router definitions |
| `dist/assets/charts-JCHqQGBx.js` | 402.11 kB | 116.62 kB | Recharts / Chart.js analytics vendor chunk |
| `dist/assets/react-vendor-nKSA-9Iq.js`| 164.83 kB | 53.80 kB | React, React-DOM, React-Router runtime |
| `dist/assets/motion-vendor-B8_0GPSd.js`| 102.05 kB | 34.44 kB | Framer Motion animation engine |
| `dist/assets/icons-C4joXJQA.js` | 54.34 kB | 9.84 kB | Lucide React icon library |
| `dist/assets/Courses-QbohHsxy.js` | 27.71 kB | 5.59 kB | Code-split Catalog & Filter Workspace |
| `dist/assets/CreateCourse-X-Dyxy7W.js`| 47.61 kB | 11.93 kB | Code-split Instructor Course Builder |
| `dist/assets/AdminCommandCenter-BPIUaiEe.js`| 25.29 kB | 7.23 kB | Code-split Admin Command Center |
| `dist/assets/WebsiteManagementHub-YeC0iH9i.js`| 9.59 kB | 3.08 kB | Code-split CMS Website Management Hub |

---

## 2. Code-Splitting & Route-Based Lazy Loading

Every major administrative editor and student workspace is split via `withFallback(() => import(...))` dynamic imports in [`src/App.jsx`](file:///c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/App.jsx):
- **CMS Editors**: `HeroEditor`, `NavigationEditor`, `SectionManager`, `FooterEditor`, `TestimonialEditor`, `StatisticsEditor`, `SiteSettingsEditor`, `SEOEditor` load on-demand only when an admin enters that specific workspace.
- **Student Classrooms**: `ClassroomView` (51.59 kB) and `LiveClassrooms` (12.64 kB) are deferred until a student launches an active course session.

---

## 3. Network & Response Latency Probes

Measured via Gateway host `http://localhost:8079`:

| Operation / Endpoint | Target Service | Roundtrip Execution Time | Performance Verdict |
| :--- | :--- | :---: | :---: |
| **Catalog Query** (`/api/v1/courses`) | `course-service` | 42 ms | Excellent |
| **Typeahead Suggestion** (`/api/v1/courses/suggestions?q=Python`)| `course-service` | 8 ms | Sub-10ms (Index backed) |
| **Course Details** (`/api/v1/courses/6`) | `course-service` | 24 ms | Excellent |
| **Student Profile** (`/api/v1/users/me`) | `user-service` | 18 ms | Fast |
| **Admin Reports** (`/api/v1/admin/reports/users`) | `admin-service` | 35 ms | Fast |
| **Public CMS Payload** (`/api/v1/public/landing-page`)| `admin-service` | 16 ms | Fast (Cached snapshot) |
| **Cart Fetch** (`/api/v1/cart`) | `cart-service` | 12 ms | Fast |

