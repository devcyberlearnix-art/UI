# ASIVO LMS — VERSION 27
## Deliverable 4: Document Storage Audit
**Component:** `DocumentStorageService.java` (`user-service`)  
**Storage Path:** Non-Web-Root Isolated Local Directory (`uploads/instructor-applications/{userId}/`)  
**Standard:** Enterprise Data Privacy & Defense-in-Depth Malware Protection

---

## 1. Storage Architecture Overview

Sensitive applicant verification documents (government identity proofs, PAN cards, educational transcripts, and bank statements) contain confidential personal identifiable information (PII). Exposing these files via public web roots or direct cloud storage URLs represents an unacceptable compliance and privacy risk.

Version 27 implements an isolated, sandboxed private storage model where:
1. Files are stored entirely outside any public web server directory.
2. Direct URL paths are never generated or returned to clients.
3. Access is mediated exclusively by authenticated, server-side RBAC proxy endpoints.

---

## 2. Multi-Layer File Validation Pipeline

```
[ Upload Attempt ]
       │
       ▼
1. Size Limit Check (≤ 25MB)
       │
       ▼
2. Extension Whitelist Check (pdf, doc, docx, jpg, png, webp, ppt, pptx, mp4)
       │
       ▼
3. Dangerous Extension Blacklist (exe, sh, bat, cmd, js, php, html, vbs, etc.)
       │
       ▼
4. Binary Header Magic-Byte Verification (%PDF-, JPEG, PNG, WebP, Office)
       │
       ▼
5. Anti-Executable Header Check (MZ, ELF, #!, CAFEBABE)
       │
       ▼
6. Deep Content Heuristic Scan (Searches first 8KB for embedded script polyglots)
       │
       ▼
7. Archive Bomb Inspection (Entry count, uncompressed size limit, ratio ≤ 100:1)
       │
       ▼
8. Cryptographic Random UUID Renaming & Isolated Tenant Directory Storage
```

---

## 3. Storage Sandboxing & Anti-Traversal Measures

* **Tenant Isolation:** Files are written to subdirectories keyed by the applicant's UUID:
  `uploads/instructor-applications/{userId}/{userId}_{docType}_{timestamp}_{uuid}.{ext}`
* **Path Traversal Immunity:** Filenames containing `..`, `/`, or `\` are stripped using Spring's `StringUtils.cleanPath()` and verified against directory traversal patterns.
* **Storage Path Identifier:** Stored paths in PostgreSQL are recorded as internal opaque identifiers:
  `local:{userId}/{uniqueFileName}`.

---

## 4. Streaming RBAC & Zero Public URL Leakage

* **DTO URL Transformation:** In API responses, document paths are translated into relative proxy routes:
  `/api/v1/instructors/applications/{applicationId}/documents/{docType}`.
* **Authorization Verification:**
  ```java
  boolean isOwner = requestingUserId != null && application.getUserId().equals(requestingUserId);
  boolean isAdmin = requestingRole != null && (requestingRole.contains("ADMIN") || requestingRole.contains("MAIN_ADMIN") || requestingRole.contains("SUB_ADMIN"));
  if (!isOwner && !isAdmin) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to sensitive document.");
  }
  ```
* **Security Headers:** Files are streamed with:
  * `Content-Type: application/pdf` or `image/jpeg`
  * `Content-Disposition: inline; filename="{safeName}"`
  * Zero public filesystem information leaked in headers or body.
