# ASIVO 2.0 — 04: ROLE & PERMISSION MATRIX (RBAC)

**Auditor:** Agent 23 — User Governance & RBAC Specialist  
**Security Verifier:** Agent 43 — Role-Based Authorization Specialist  
**Approved by:** Agent 01 — Chief Architect  
**Enforcement Mechanism:** JWT Claims (`user.role`) + Route Guards (`ProtectedRoute.jsx`) + Gateway Security Filters  
**Timestamp:** 2026-11-04T20:41:00Z  

---

## 1. Role Definitions & Canonical Normalized Keys

| External / Stored Value | Normalized Internal Key | Domain Persona | Primary Dashboard |
|---|---|---|---|
| `ROLE_STUDENT`, `STUDENT` | `student` | Enrolled Learner | `/student/dashboard` |
| `ROLE_INSTRUCTOR`, `INSTRUCTOR` | `instructor` | Course Creator / Educator | `/instructor/dashboard` |
| `ROLE_ADMIN`, `MAIN_ADMIN` | `admin` | Global Administrator | `/admin/dashboard` |
| `ROLE_SUB_ADMIN`, `SUB_ADMIN` | `sub_admin` | Delegated Administrator | `/admin/sub-dashboard` |
| `ROLE_SUPER_ADMIN` | `super_admin` | Root Infrastructure Officer | `/admin/dashboard` |
| `ROLE_PARENT`, `PARENT` | `parent` | Academic Guardian / Observer | `/parent/dashboard` |

---

## 2. Granular Capability & Permission Matrix

| Capability / Operational Action | Student | Instructor | Parent | Admin / Sub-Admin | Public (Guest) |
|---|---|---|---|---|---|
| **Browse Courses & Public Catalog** | ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read |
| **Purchase & Enroll in Courses** | ✅ Execute | ❌ Blocked | ❌ Blocked | ❌ Blocked | 🔑 Login Required |
| **Stream Lectures & Download Notes** | ✅ Enrolled Only | ✅ Authored Only | ❌ Blocked | ✅ Global Read | ❌ Blocked |
| **Take Quizzes & Submit Labs** | ✅ Enrolled Only | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **Generate Parent Pairing Code** | ✅ Self Profile | ❌ Blocked | ❌ Blocked | ❌ Blocked | ❌ Blocked |
| **View Linked Student Progress** | ❌ Blocked | ❌ Blocked | ✅ Linked Only | ✅ Global Read | ❌ Blocked |
| **Create & Edit Course Curriculum** | ❌ Blocked | ✅ Authored Only | ❌ Blocked | ✅ Global Edit | ❌ Blocked |
| **Publish Courses to Live Catalog** | ❌ Blocked | 📝 Submit Draft | ❌ Blocked | ✅ Approve & Publish | ❌ Blocked |
| **Grade Student Submissions** | ❌ Blocked | ✅ Authored Only | ❌ Blocked | ✅ Global Edit | ❌ Blocked |
| **View Financial Revenue & Payouts** | ❌ Blocked | ✅ Own Earnings | ❌ Blocked | ✅ Global Ledger | ❌ Blocked |
| **Edit Hero Banner & CMS Content** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full Control | ❌ Blocked |
| **Upload Promotional Image Banners** | ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full Control | ❌ Blocked |
| **Moderate Users & Suspend Accounts**| ❌ Blocked | ❌ Blocked | ❌ Blocked | ✅ Full Control | ❌ Blocked |
| **Verify Public Cryptographic Hashes**| ✅ Read | ✅ Read | ✅ Read | ✅ Read | ✅ Read |

---

## 3. Privilege Escalation & IDOR Defense

1. **Client-Side:** `ProtectedRoute.jsx` checks `normalizeRole(user.role)` against `allowedRoles`. Non-matching sessions are redirected to their authorized dashboard via `getDashboardPath(user.role)`.
2. **Server-Side:** Spring Cloud Gateway extracts `role` from the signed RS256 JWT header before routing downstream. Microservices enforce `@PreAuthorize("hasRole('ADMIN')")` or verify ownership (`studentId == authentication.principal.id`).
3. **Parent Isolation Guard:** Parent queries to `/api/v1/parent/students/{id}/progress` strictly verify in the database that a verified relationship record exists between the authenticated parent ID and the target student ID. Any attempt to inspect an unlinked student results in `403 Forbidden`.

---

*Verified by Agent 23 & Agent 43*

