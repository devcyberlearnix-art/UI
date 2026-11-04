# ASIVO 2.0 — PHASE 2: BACKEND & ROLE AUTHORIZATION SECURITY REVIEW
**Document ID:** `docs/asivo-2/PHASE2/07_BACKEND_SECURITY_REVIEW.md`  
**Author:** Agent 01 (Chief Architect) & Agent 43 (Security & Compliance Specialist)  
**Date:** November 4, 2026  
**Security Standard:** OWASP Top 10 (2021/2026) & Student Privacy Assessment  

---

## 1. Authentication & JWT Token Security
1. **Token Transport:** JWT tokens are transmitted via the HTTP `Authorization: Bearer <token>` header across all authenticated calls.
2. **Key Signature Verification:** The API Gateway (`:8080`) validates token signatures against public RS256 keys issued by the User Service (`:8081`).
3. **Role Claims Extraction:** Roles (`ROLE_STUDENT`, `ROLE_INSTRUCTOR`, `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`) are parsed directly from claims on the server side. The UI uses client-side route guards (`RequireRole`) only for navigation UX; backend microservices enforce authorization independently.

---

## 2. Parent-Child Relationship & Legal Compliance Reality Check

> [!IMPORTANT]
> **Definitive Security Verdict on Parent Backend Architecture**  
> In accordance with Phase 2 Directives, an exhaustive verification of backend microservices was conducted.  
> **Finding:** The backend microservices do NOT currently implement a dedicated Parent Authorization Service (`:8087`) or database relationship tables (`parent_student_link`, `guardian_consent_ledger`).  
> **Status:** The Parent Observatory frontend (`/parent/dashboard`) is fully built and responsive, but backend pairing is marked:  
> **`BLOCKED — BACKEND AUTHORIZATION & COMPLIANCE PENDING`**.

### Legal & Technical Compliance Assessment: FERPA & COPPA
- **FERPA (Family Educational Rights and Privacy Act):** Requires verified parental relationship identity and educational institution data release audit logging before disclosing student educational records, quiz scores, or video watch timestamps.
- **COPPA (Children's Online Privacy Protection Act):** Requires verifiable parental consent (VPC) before collecting or viewing personal data of students under 13.
- **Conclusion:** Asivo 2.0 does NOT make false claims of FERPA or COPPA compliance. The frontend maintains an architectural placeholder with client-side pairing demonstration while the backend engineering roadmap implements the required database schemas and compliance mechanisms.

### Parent Service Implementation Blueprint (Target Phase 3):
1. **Service:** `asivo-parent-service` on port `8087`.
2. **Schema:**
   ```sql
   CREATE TABLE guardian_student_relationships (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     guardian_id UUID NOT NULL REFERENCES users(id),
     student_id UUID NOT NULL REFERENCES users(id),
     consent_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_VERIFICATION',
     verification_method VARCHAR(64) NOT NULL, -- e.g., 'CREDIT_CARD', 'SIGNED_FORM'
     verified_at TIMESTAMP WITH TIME ZONE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     CONSTRAINT uk_guardian_student UNIQUE (guardian_id, student_id)
   );
   ```
3. **Enforcement:** Method-level `@PreAuthorize("@parentAuthService.canAccessStudentData(principal, #studentId)")` across all student telemetry endpoints.

---

## 3. IDOR (Insecure Direct Object Reference) Protection
- **Order Retrieval:** `GET /api/v1/orders/:id` validates that the authenticated `userId` matches the order owner or possesses `ROLE_ADMIN`.
- **Course Editing:** `PUT /api/v1/courses/:id` strictly checks that the authenticated instructor ID matches `course.instructorId`. Submitting updates for another instructor's course produces `403 Forbidden`.
- **Cart Mutation:** Cart operations are scoped to the authenticated session context; cart item IDs cannot be manipulated across sessions.

---

## 4. CORS, XSS & Security Headers
- **CORS Configuration:** Configured on Spring Cloud Gateway to allow only verified origins (`http://localhost:5173`, `https://*.asivo.internal`). `Access-Control-Allow-Credentials: true` is strictly enforced with origin whitelisting.
- **XSS Mitigation:** React's JSX auto-escaping sanitizes user-generated strings in course titles, descriptions, and discussion comments. `dangerouslySetInnerHTML` is prohibited except in audited markdown code highlighters with DOMPurify sanitization.
- **Security Headers:** Spring Security provides `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=31536000`, and `Content-Security-Policy`.

---
*Signed: Agent 01 (Chief Architect) & Agent 43 (Security Lead)*

