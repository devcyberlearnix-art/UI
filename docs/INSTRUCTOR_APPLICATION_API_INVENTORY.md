# INSTRUCTOR APPLICATION: API INVENTORY
**Project:** Asivo LMS (FD_LMS)  
**Microservice Primary Owner:** `user-service` (Port: 8091)  
**Gateway Routing:** `api-gateway` (Port: 8079)  
**Status:** PRODUCTION READY & FULLY INTEGRATED

---

## 1. Overview

This document provides a comprehensive inventory of all REST endpoints supporting the Asivo Instructor Application lifecycle. All endpoints are proxied through `api-gateway` on port `8079` and routed to `user-service`.

---

## 2. Public Taxonomy Endpoints

### 2.1. Get Curated Subject Taxonomy
* **Method & Route:** `GET /api/v1/instructors/subjects`
* **Access Level:** Public (No authentication required; whitelisted in `JwtAuthenticationFilter`)
* **Purpose:** Provides the authoritative list of curriculum domains for the application dropdown.
* **Response Format:** `200 OK`
```json
[
  { "id": "web-development", "name": "Web Development", "category": "Engineering" },
  { "id": "data-science", "name": "Data Science & AI", "category": "Analytics" },
  { "id": "cloud-devops", "name": "Cloud & DevOps", "category": "Infrastructure" },
  { "id": "cybersecurity", "name": "Cybersecurity", "category": "Security" },
  { "id": "mobile-development", "name": "Mobile Development", "category": "Engineering" },
  { "id": "ui-ux-design", "name": "UI/UX & Product Design", "category": "Design" },
  { "id": "blockchain", "name": "Blockchain & Web3", "category": "Emerging Tech" },
  { "id": "business-management", "name": "Business & Product Management", "category": "Business" }
]
```

---

## 3. Applicant Endpoints (`/api/v1/instructors/...`)

All applicant endpoints require an authenticated JWT token with role `STUDENT` or higher.

### 3.1. Fetch Current Application Status
* **Method & Route:** `GET /api/v1/instructors/applications/status`
* **Access Level:** Authenticated Applicant
* **Purpose:** Retrieves the current user's active application record, status, document URLs, and review notes.
* **Response `200 OK`:**
```json
{
  "id": "27f056f9-6ea2-4f3b-98e6-4f5e6e6ddf89",
  "userId": "654b136a-6b20-41f6-8e64-f31ed9984f24",
  "status": "PENDING",
  "subject": "web-development",
  "specialization": "Distributed Systems",
  "experience": "5-10",
  "bio": "Principal Software Architect with over 8 years of engineering leadership.",
  "contactPhone": "+14155552671",
  "linkedinUrl": "https://linkedin.com/in/architect",
  "websiteUrl": "https://architect.io",
  "taxPanNumber": "ABCDE1234F",
  "documents": {
    "resume": "/api/v1/instructors/applications/27f056f9-6ea2-4f3b-98e6-4f5e6e6ddf89/documents/resume",
    "governmentId": "/api/v1/instructors/applications/27f056f9-6ea2-4f3b-98e6-4f5e6e6ddf89/documents/governmentId"
  },
  "submittedAt": "2026-11-02T11:45:00Z"
}
```

### 3.2. Save Draft or Update Application (JSON Payload)
* **Method & Route:** `POST /api/v1/instructors/applications`
* **Content-Type:** `application/json`
* **Purpose:** Saves application fields in `DRAFT` state without advancing to review.
* **Request Body:**
```json
{
  "subject": "web-development",
  "specialization": "Distributed Systems",
  "experience": "5-10",
  "bio": "Principal Software Architect with over 8 years of engineering leadership.",
  "contactPhone": "+14155552671",
  "linkedinUrl": "https://linkedin.com/in/architect",
  "websiteUrl": "https://architect.io",
  "panNumber": "ABCDE1234F",
  "status": "DRAFT"
}
```

### 3.3. Submit Full Application (Multipart or JSON)
* **Method & Route:** `POST /api/v1/instructors/applications/apply`
* **Content-Type:** `application/json` or `multipart/form-data`
* **Purpose:** Transitions the application from `DRAFT` (or `NEED_MORE_INFO` / `REJECTED`) to `PENDING` for administrative review.
* **Validation Rules:**
  * `bio`: Minimum 30 characters.
  * `panNumber`: 10 alphanumeric characters conforming to uppercase PAN regex (`[A-Z]{5}[0-9]{4}[A-Z]{1}`).
  * `subject` and `experience`: Mandatory non-blank values.

### 3.4. Upload Single Document
* **Method & Route:** `POST /api/v1/instructors/applications/documents/{documentType}`
* **Content-Type:** `multipart/form-data`
* **Path Variable:** `documentType` (`resume`, `governmentId`, `degreeCertificate`, `experienceLetter`, `certifications`, `cancelledCheque`, `demoVideo`, `portfolio`)
* **Request Part:** `file` (Binary)
* **Response `200 OK`:**
```json
{
  "documentType": "resume",
  "fileName": "resume-27f056f9.pdf",
  "url": "/api/v1/instructors/applications/27f056f9-6ea2-4f3b-98e6-4f5e6e6ddf89/documents/resume",
  "uploadedAt": "2026-11-02T11:47:00Z"
}
```

### 3.5. Delete Single Document
* **Method & Route:** `DELETE /api/v1/instructors/applications/documents/{documentType}`
* **Purpose:** Removes an uploaded document from the active draft.
* **Response:** `200 OK` with updated document map.

### 3.6. Stream Secure Private Document (Applicant)
* **Method & Route:** `GET /api/v1/instructors/applications/{applicationId}/documents/{documentType}`
* **Access Control:** Verified IDOR protection. Only the application owner or an administrator can access this stream.
* **Response:** `200 OK` with binary octet stream or `application/pdf` / `image/jpeg` and `Content-Disposition: inline`.

---

## 4. Admin Review Endpoints (`/api/v1/admin/instructors/...`)

All admin review endpoints require an authenticated JWT token with role `ADMIN` or `MAIN_ADMIN`.

### 4.1. List Instructor Applications
* **Method & Route:** `GET /api/v1/admin/instructors/applications`
* **Query Parameters:**
  * `status`: Optional filter (`PENDING`, `APPROVED`, `REJECTED`, `NEED_MORE_INFO`, `DRAFT`)
  * `search`: Optional string search (name, email, subject)
  * `page`: Integer (0-indexed, default `0`)
  * `size`: Integer (default `10`)
* **Response `200 OK`:** Paginated list of applications with total counts and reviewer audit metadata.

### 4.2. Update Application Status (Approve / Reject / Request Info)
* **Method & Route:** `PUT /api/v1/admin/instructors/applications/{applicationId}/status`
* **Content-Type:** `application/json`
* **Request Body:**
```json
{
  "status": "APPROVED",
  "reason": "Outstanding engineering credentials and verified certifications."
}
```
* **State Machine Rules Enforced:**
  * Cannot approve `DRAFT` or `REJECTED` applications (`409 Conflict`).
  * Anti-self-approval: Admin cannot approve their own application (`403 Forbidden`).
  * Re-approving an already `APPROVED` application returns `200 OK` (idempotent).
  * On `APPROVED`, atomically updates application record and elevates user role in `users` table to `INSTRUCTOR`.

### 4.3. Stream Applicant Document (Admin Direct)
* **Method & Route:** `GET /api/v1/admin/instructors/applications/{applicationId}/documents/{documentType}`
* **Access Level:** Admin Only
* **Purpose:** Allows administrators to preview sensitive applicant verification files inside the admin inspection modal without exposure to external CDNs.
