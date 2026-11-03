# ASIVO LMS — VERSION 27
## Deliverable 2: API Integration Verification
**Owning Microservices:** `user-service` (Port 8091), `api-gateway` (Port 8079)  
**Database:** PostgreSQL (`lms_user_db`)  
**Standard:** Strict REST Contract Traceability & Zero Mock Data

---

## 1. Overview

Every endpoint participating in the Instructor Onboarding workflow was independently audited to verify that no fabricated records, hardcoded mock values, or dummy statuses exist. All requests map directly to real database mutations in PostgreSQL.

---

## 2. Comprehensive Endpoint Catalog & Specifications

### 2.1. Public Taxonomy Endpoint
* **Method & URL:** `GET /api/v1/instructors/subjects`
* **Owning Microservice:** `user-service` (`InstructorController.java`)
* **Authentication Requirements:** None (Publicly whitelisted in `JwtAuthenticationFilter` and `UnifiedSecurityConfig`)
* **Required Roles:** Any / Anonymous
* **Request Schema:** None
* **Response Schema:**
  ```json
  {
    "success": true,
    "message": "Teaching subjects taxonomy retrieved successfully",
    "data": [
      {
        "id": "web-development",
        "name": "Web Development",
        "category": "Development",
        "description": "Full-Stack, React, Node.js, Spring Boot & APIs"
      }
    ],
    "timestamp": "2026-11-02T12:15:00Z"
  }
  ```
* **Validation Rules:** None (Read-only static domain taxonomy)
* **Error Responses:** `500 Internal Server Error`
* **Database Operations:** In-memory immutable catalog
* **Frontend Consumer:** `InstructorApplication.jsx` (`useEffect` on mount)

---

### 2.2. Fetch Applicant Status Endpoint
* **Method & URL:** `GET /api/v1/instructors/applications/my-status` (Also aliases `/me`, `/applications`)
* **Owning Microservice:** `user-service` (`InstructorController.java`)
* **Authentication Requirements:** Authenticated JWT Bearer Token
* **Required Roles:** `ROLE_STUDENT`, `ROLE_INSTRUCTOR`, `ROLE_MAIN_ADMIN`, `ROLE_SUB_ADMIN`
* **Request Schema:** None (Header: `Authorization: Bearer <token>`)
* **Response Schema:**
  ```json
  {
    "success": true,
    "message": "Application status fetched successfully",
    "data": {
      "application": {
        "applicationId": "2c6952f9-df5b-4dbf-92f2-1d611a89657e",
        "status": "PENDING",
        "subject": "web-development",
        "specialization": "Cloud Native Architecture",
        "experience": "5-10",
        "bio": "Principal Software Architect with over 10 years experience.",
        "phone": "1234567890",
        "submittedAt": "2026-11-02T12:15:30Z"
      },
      "user": {
        "userId": "35bffae0-f529-4cc2-8544-6e2485ebee55",
        "email": "applicant@cyberlearnix.com",
        "currentRole": "STUDENT"
      },
      "documents": {
        "resumeUrl": "/api/v1/instructors/applications/2c6952f9-.../documents/resume"
      }
    }
  }
  ```
* **Validation Rules:** Token must be valid and non-expired
* **Error Responses:** `401 Unauthorized` (missing/invalid token), `404 Not Found` (no application created yet)
* **Database Operations:** `SELECT * FROM instructor_applications WHERE user_id = :userId ORDER BY submitted_at DESC LIMIT 1`
* **Frontend Consumer:** `InstructorApplication.jsx` (`fetchExistingApplication`)

---

### 2.3. Save Draft Application Endpoint
* **Method & URL:** `POST /api/v1/instructors/applications/draft`
* **Owning Microservice:** `user-service` (`InstructorController.java`)
* **Authentication Requirements:** Authenticated JWT Bearer Token
* **Required Roles:** `ROLE_STUDENT`
* **Request Schema:** `application/json`
  ```json
  {
    "subject": "web-development",
    "specialization": "Distributed Systems",
    "experience": "5-10",
    "bio": "Draft notes...",
    "phone": "1234567890",
    "bankAccountNumber": "123456789012",
    "bankIfsc": "HDFC0001234",
    "bankName": "HDFC Bank",
    "panNumber": "ABCDE1234F"
  }
  ```
* **Validation Rules:** Admin roles forbidden from applying; cannot overwrite an active `PENDING` or `APPROVED` application
* **Error Responses:** `401 Unauthorized`, `403 Forbidden` (admins), `409 Conflict` (already pending/approved)
* **Database Operations:** `INSERT INTO instructor_applications ... status = 'DRAFT'` or `UPDATE`
* **Frontend Consumer:** `InstructorApplication.jsx` ("Save Draft" action)

---

### 2.4. Single Document Upload Endpoint
* **Method & URL:** `POST /api/v1/instructors/applications/documents/{docType}`
* **Owning Microservice:** `user-service` (`InstructorController.java`)
* **Authentication Requirements:** Authenticated JWT Bearer Token
* **Required Roles:** `ROLE_STUDENT`
* **Request Schema:** `multipart/form-data` with `file: Binary`
* **Validation Rules:**
  * File size $\le 25\text{MB}$.
  * Extension whitelist: `pdf`, `doc`, `docx`, `jpg`, `jpeg`, `png`, `webp`, `ppt`, `pptx`, `mp4`.
  * Blacklist: `exe`, `sh`, `bat`, `cmd`, `js`, `jsp`, `php`, `html`, `htm`, `vbs`, `ps1`, `jar`, `py`, `pl`, `com`, `scr`, `dll`, `bin`, `msi`.
  * Magic byte verification (`%PDF-`, JPEG, PNG, WebP, Office).
  * Deep content heuristic scan (no `<?php`, `<script`, etc.).
  * Archive bomb check on docx/pptx.
* **Error Responses:** `400 Bad Request` (corrupted/malicious file), `401 Unauthorized`, `413 Payload Too Large`
* **Database Operations:** Updates document path in `instructor_applications`
* **Frontend Consumer:** `InstructorApplication.jsx` (Dropzone upload trigger)

---

### 2.5. Final Application Submission Endpoint
* **Method & URL:** `POST /api/v1/instructors/applications/apply`
* **Owning Microservice:** `user-service` (`InstructorController.java`)
* **Authentication Requirements:** Authenticated JWT Bearer Token
* **Required Roles:** `ROLE_STUDENT`
* **Request Schema:** Dual mode (`application/json` or `multipart/form-data`)
* **Validation Rules:**
  * `subject`, `specialization`, `experience` required non-blank.
  * `bio` length $\ge 30$ characters.
  * 6 mandatory verification files must be present (`resume`, `educationalCertificates`, `governmentIdProof`, `passportPhoto`, `bankDetails`, `panDocument`).
* **Error Responses:** `400 Bad Request` (missing fields / short bio), `409 Conflict` (duplicate pending submission or approved instructor)
* **Database Operations:** Sets `status = 'PENDING'`, updates `submitted_at = NOW()`, sets user `application_status = 'PENDING_VERIFICATION'`
* **Frontend Consumer:** `InstructorApplication.jsx` (Final Submit Application button)

---

### 2.6. Admin Approve Application Endpoint
* **Method & URL:** `PUT /api/v1/admin/instructors/applications/{applicationId}/approve`
* **Owning Microservice:** `user-service` (`AdminInstructorController.java`)
* **Authentication Requirements:** Authenticated Admin JWT Bearer Token
* **Required Roles:** `ROLE_MAIN_ADMIN`, `ROLE_SUB_ADMIN`
* **Validation Rules:**
  * Admin cannot self-approve (`403 Forbidden`).
  * Application must not be `DRAFT` or `REJECTED` (`409 Conflict`).
  * Idempotent return if already `APPROVED` (`200 OK`).
* **Database Operations:** Pessimistic lock `SELECT ... FOR UPDATE`, updates `status = 'APPROVED'`, `reviewed_at = NOW()`, elevates user `role = 'INSTRUCTOR'`, `is_instructor_approved = true` inside single `@Transactional` boundary.
* **Frontend Consumer:** `InstructorApplications.jsx` (Admin Inspection Modal)

---

### 2.7. Admin Reject Application Endpoint
* **Method & URL:** `PUT /api/v1/admin/instructors/applications/{applicationId}/reject`
* **Owning Microservice:** `user-service` (`AdminInstructorController.java`)
* **Authentication Requirements:** Authenticated Admin JWT Bearer Token
* **Required Roles:** `ROLE_MAIN_ADMIN`, `ROLE_SUB_ADMIN`
* **Request Schema:** `application/json` `{ "reason": "Mandatory explanation" }`
* **Validation Rules:** Rejection reason must be $\ge 5$ characters; cannot reject `DRAFT` or already `APPROVED` applications (`409 Conflict`).
* **Database Operations:** Pessimistic lock `SELECT ... FOR UPDATE`, updates `status = 'REJECTED'`, `rejection_reason = :reason`
* **Frontend Consumer:** `InstructorApplications.jsx` (Admin Rejection Dialog)

---

### 2.8. Admin Request Info Endpoint
* **Method & URL:** `PUT /api/v1/admin/instructors/applications/{applicationId}/request-info`
* **Owning Microservice:** `user-service` (`AdminInstructorController.java`)
* **Authentication Requirements:** Authenticated Admin JWT Bearer Token
* **Required Roles:** `ROLE_MAIN_ADMIN`, `ROLE_SUB_ADMIN`
* **Request Schema:** `application/json` `{ "requestedInfo": "Clarification notes" }`
* **Validation Rules:** Notes must be $\ge 5$ characters; cannot request info on `DRAFT` or `APPROVED` applications (`409 Conflict`).
* **Database Operations:** Pessimistic lock `SELECT ... FOR UPDATE`, updates `status = 'NEED_MORE_INFO'`, `requested_info = :info`
* **Frontend Consumer:** `InstructorApplications.jsx` (Admin Request Info Dialog)

---

### 2.9. Authenticated Document Streaming Endpoint
* **Method & URL:** `GET /api/v1/instructors/applications/{applicationId}/documents/{docType}`
* **Owning Microservice:** `user-service` (`InstructorController.java`)
* **Authentication Requirements:** Authenticated JWT Bearer Token
* **Required Roles:** Owner of application OR `ROLE_MAIN_ADMIN` / `ROLE_SUB_ADMIN`
* **Access Control:** IDOR protection verifies `requestingUserId.equals(app.getUserId()) || isAdmin`. Unrelated users receive `403 Forbidden`.
* **Database Operations:** `SELECT * FROM instructor_applications WHERE id = :id`
* **Storage Stream:** Reads from sandboxed private storage outside web root and streams with `Content-Type: application/pdf` or `image/jpeg`.
* **Frontend Consumer:** `InstructorApplication.jsx` (Preview Modal), `InstructorApplications.jsx` (Admin Document Viewer)
