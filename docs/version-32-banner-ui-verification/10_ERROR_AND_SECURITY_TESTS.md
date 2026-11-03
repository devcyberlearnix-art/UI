# Deliverable 10: Error & Security Tests

## 1. Executive Summary & Security Matrix

Security and robustness verification was conducted across client boundaries, network protocols, Spring Security filters, and database constraints. The promotional banner management system successfully resisted injection, tampering, spoofing, and privilege escalation attacks.

| Test Category | Attack Vector / Scenario | Injected Payload | Defense Mechanism | System Behavior | Security Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **XSS Injection** | Stored XSS in Headline | `<script>alert('xss')</script> & 特殊字符` | React JSX text escaping + Content Security Policy | Rendered as plain text string literal; 0 execution | **DEFENDED** |
| **XSS Injection** | DOM-based XSS in CTA URL | `javascript:alert(document.cookie)` | React Router SPA sanitized route handler | Treated as relative route string, never passed to `window.location` | **DEFENDED** |
| **MIME Spoofing** | Disguised executable / text | `fake_image.jpg` (ASCII text renamed) | Apache Tika / Java `ImageIO.read()` magic byte check | Backend returns `valid: false` ("Image data is unreadable") | **DEFENDED** |
| **Aspect Ratio Attack**| Non-standard banner ratio | `wrong_ratio_1000x1000.jpg` (1:1 square) | Aspect ratio validator (`16.0 / 9.0`) | Rejected with clear admin guidance | **DEFENDED** |
| **DoS via Oversized File**| Payload > 1 MB | `oversized_banner.png` (6.2 MB) | Client pre-check + Spring `max-file-size` | Upload halted at browser level before network transmission | **DEFENDED** |
| **Quality Degradation**| Sub-standard low-res image | `low_res_400x225.jpg` | Dimension check (`width >= 800 && height >= 450`) | Rejected by `BannerImageService.java` | **DEFENDED** |
| **Privilege Escalation**| Anonymous access to Admin API | `GET /api/v1/admin/banners` without JWT | Spring Security JWT Authentication Filter | HTTP 401 Unauthorized / 403 Forbidden | **DEFENDED** |
| **Privilege Escalation**| Anonymous view of Admin Pill | Inspecting Public Landing Page | React Context `useAuth()` role gate (`isAdmin`) | Element completely omitted from DOM tree | **DEFENDED** |
| **SQL Injection**| SQL injection in search / filters | `' OR 1=1; --` | Spring Data JPA parameterized queries | Escaped as SQL string literal; 0 SQL syntax modification | **DEFENDED** |

---

## 2. Detailed Threat Vector Analysis

### 2.1 Cross-Site Scripting (XSS) Sanitization
- When submitting `<script>alert('xss')</script>`, the client persists the verbatim string into PostgreSQL.
- During rendering on both the Admin Table (`BannerManagement.jsx`) and the Public Carousel (`BannerSlider.jsx`), React automatically uses `textContent` rather than `innerHTML`. The browser displays the exact characters as text without executing the script tag.

### 2.2 Image Header & Magic Byte Validation
Renaming a file with `.jpg` extension does not fool the backend validator.
`BannerImageService.java` reads the input stream into `BufferedImage`. If the file header lacks the JPEG SOI marker (`0xFFD8`), PNG magic bytes (`0x89504E47`), or WebP RIFF headers, `ImageIO.read()` returns `null`, triggering immediate rejection:
```java
BufferedImage image = ImageIO.read(file.getInputStream());
if (image == null) {
    return BannerImageValidationResult.builder()
            .valid(false)
            .errorMessage("Image data is corrupted or in an unsupported format")
            .build();
}
```

### 2.3 Role-Based Authorization Isolation
- Protected Admin Endpoints:
  - `POST /api/v1/admin/banners`
  - `DELETE /api/v1/admin/banners/{id}`
  - `POST /api/v1/admin/banners/{id}/restore`
  - `POST /api/v1/admin/banners/reorder`
  - `POST /api/v1/admin/banners/upload-image`
- API Gateway routes these endpoints to `course-service`, which enforces `hasAnyRole('ADMIN', 'MAIN_ADMIN', 'SUB_ADMIN')`. Any request lacking a valid JWT principal is immediately terminated with HTTP 401/403.

