# Deliverable 02: Modal Field Validation Results

## 1. Overview & Verification Matrix

The Create/Edit Banner modal in `BannerManagement.jsx` provides administrative controls for managing promotional banners displayed across the ASIVO LMS application. To guarantee data integrity, prevent client-side application crashes, and secure the application against Cross-Site Scripting (XSS) and injection attacks, each input field was subjected to boundary condition testing, sanitization verification, and schema validation.

| Field Name | Test Case Scenario | Input Value / Payload | Client-Side Validation | Backend API Status | Render / Persistence Result | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Banner Headline** | Empty headline submission | `""` (empty string) | HTML5 `required` attribute triggered; toast: "Please enter a banner title." | Blocked (no API call made) | Form submission prevented; modal remained open | **PASS** |
| **Banner Headline** | Boundary: Minimum length (1 char) | `"A"` | Allowed | HTTP 200 / 201 | Persisted correctly as single character | **PASS** |
| **Banner Headline** | Boundary: Maximum length (200 chars) | 200 alphanumeric string | Allowed | HTTP 200 / 201 | Truncated/Validated against 200-char constraint | **PASS** |
| **Banner Headline** | Script tag / XSS injection | `<script>alert('xss')</script> & 特殊字符 #@!` | Allowed as raw text input | HTTP 200 / 201 | Safely escaped and rendered as text literal in React DOM; zero execution | **PASS** |
| **Target Placement Type** | Target type selector | `COURSE`, `CATEGORY`, `EXTERNAL_URL`, `CUSTOM_PAGE` | Dropdown selector strictly bound to enumeration | HTTP 200 / 201 | Enum matched database check constraint `banners_target_type_check` | **PASS** |
| **Campaign Synopsis** | Multi-line synopsis with unicode | `"Master enterprise microservices, cloud telemetry & zero-trust.\nSpecial tier: ⚡ 🚀"` | Allowed | HTTP 200 / 201 | Persisted to Postgres `description` (TEXT column) and rendered with formatting | **PASS** |
| **Banner Media URL** | Empty media upload | `""` (empty string) | Toast: "Please provide or upload a banner image URL." | Blocked (no API call made) | Form submission prevented | **PASS** |
| **Banner Media URL** | Cloud CDN URL (Google Drive) | `https://drive.google.com/uc?id=...` | Allowed, verified regex `^(https?|ftp)://...` | HTTP 200 / 201 | Stored in `banners.image_url` | **PASS** |
| **CTA Button Label** | Default label fallback | `""` (empty string) | Defaults to `"Explore Curriculum"` | HTTP 200 / 201 | Stored in `banners.cta_text` as `"Explore Curriculum"` | **PASS** |
| **CTA Destination Route** | Dangerous `javascript:` URI | `javascript:alert(document.cookie)` | Sanitized on CTA click via React Router `navigate` | HTTP 200 / 201 | Internal routing treats as relative route `/javascript:alert(...)`, never executes arbitrary JS | **PASS** |
| **CTA Destination Route** | Standard internal route | `"/courses"` | Allowed | HTTP 200 / 201 | Direct route transition via SPA router | **PASS** |
| **Display Order** | Auto-computation fallback | `null` / `""` | Evaluated to `max(display_order) + 1` | HTTP 200 / 201 | Persisted uniquely into `banners.display_order` without collision | **PASS** |

---

## 2. Deep-Dive Field Validation Analysis

### 2.1 Banner Headline
- **DOM Selector:** `input[placeholder*="Master Distributed Systems"]`
- **Validation Rules:** Required field, maximum length 200 characters (`@Size(max = 200)` in `BannerCreateRequest.java`).
- **Sanitization:** All text inputs are rendered via standard React JSX expressions (`{banner.title}`), preventing unescaped innerHTML injection. Raw strings containing `<script>` tags are treated strictly as string literals by the React reconciliation engine.

### 2.2 Target Placement Type
- **DOM Selector:** `select[value=formData.targetType]`
- **Supported Enums:**
  1. `COURSE`: Direct deep-link to specific course curriculum.
  2. `CATEGORY`: Links to catalog filtered by domain/category.
  3. `EXTERNAL_URL`: Links to external partner or certification authority.
  4. `CUSTOM_PAGE`: Links to internal institutional custom pages.
- **Database Alignment:** Strictly adheres to PostgreSQL table constraint:
  ```sql
  CHECK (target_type::text = ANY (ARRAY['COURSE', 'CATEGORY', 'EXTERNAL_URL', 'CUSTOM_PAGE']))
  ```

### 2.3 Banner Media Upload
- **Validation Engine:** Multi-stage client and server validation:
  1. Client MIME type check: `image/jpeg`, `image/png`, `image/webp`.
  2. Client file size check: max 1MB (1,048,576 bytes).
  3. Server-side Apache Tika / image header dimension verification: 16:9 ratio with minimum resolution 800×450.

### 2.4 Pinned Action Bar
- The modal form utilizes a sticky header and sticky bottom bar (`bg-[#0F0F13]/95 backdrop-blur-md border-t border-white/[0.06]`), ensuring that the primary action `Publish Banner` and `Cancel` remain accessible even on short viewports (down to 320px mobile).

