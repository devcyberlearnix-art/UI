# V23_02: Complete Administrative API Capability & Gap Matrix
**Audit Phase:** Phase 2 API Verification  
**Standard:** Enterprise REST API Audit (Strict OWASP Least Privilege, RBAC Enforcement)  

---

## Complete API Capability Matrix

| Screen | Feature | Existing API Endpoint | Backend Owner | HTTP Method | Auth & RBAC | Status | Identified Gap / Required Correction |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Telemetry** | User Counts & Breakdown | `/api/v1/admin/reports/users` | `admin-service` -> `user-service` | `GET` | Bearer JWT (`MAIN_ADMIN`) | **PASS** | Returns `{ totalUsers: 263, totalStudents: 247, totalInstructors: 16, statusBreakdown: { active: 214, pendingVerification: 47 } }`. Frontend must use these live keys instead of fallback `263`. |
| **Telemetry** | Active Curriculum Counts | `/api/v1/admin/reports/courses` | `admin-service` -> `course-service` | `GET` | Bearer JWT (`MAIN_ADMIN`) | **PASS** | Returns `{ totalCourses: 291, publishedCourses: 231, draftCourses: 29, archivedCourses: 31 }`. Authoritative published count is 231. |
| **Telemetry** | Gross Platform Revenue | `/api/v1/admin/reports/revenue` | `admin-service` -> `payment-service` | `GET` | Service Auth (`payment:view`) | **PASS** | Returns `{ totalRevenue: 374303.04, successfulPayments: 102 }`. Display as `₹374,303`. Fix `$0` fallback. |
| **Telemetry** | Enrollment Velocity Chart | Aggregated monthly telemetry | Frontend / `course-service` | N/A | Authenticated | **PARTIAL** | Hardcoded mock `Jan-Jun` replaced with defined 2026 academic intake range, explicit IST timezone, and learner enrollment metrics. |
| **Telemetry** | Curriculum Domain Breakdown | `/api/v1/admin/courses` | `admin-service` | `GET` | Bearer JWT | **PARTIAL** | Donut chart lacked visible legend, category names, counts, and percentages. Added comprehensive legend with top course domains. |
| **User Governance** | User Directory & Pagination | `/api/v1/admin/users?page=0&size=10` | `admin-service` -> `user-service` | `GET` | Bearer JWT (`user:manage`) | **PASS** | Returns paginated user records. |
| **User Governance** | User Detail Inspection | `/api/v1/admin/users/{id}` | `admin-service` -> `user-service` | `GET` | Bearer JWT (`user:manage`) | **PASS** | Connect to comprehensive modal with account state, verification, roles, and registration metadata. |
| **User Governance** | Account Status Toggle | `/api/v1/admin/users/{id}/status` | `admin-service` -> `user-service` | `PUT` | Bearer JWT (`user:edit`) | **PASS** | Reversible status transitions (`ACTIVE` <-> `SUSPENDED`). Protect last administrator. |
| **User Governance** | Destruction Safety | `/api/v1/admin/users/{id}` | `admin-service` -> `user-service` | `DELETE` | Bearer JWT (`MAIN_ADMIN`) | **FAIL (Policy)** | Permanent deletion breaks order/enrollment relational integrity. UI must prefer suspension with strict confirmation dialog. |
| **User Governance** | CSV Export | Client-side export helper | Frontend | N/A | Authorized Admin | **PARTIAL** | Must sanitize CSV cells against formula injection (`=`, `+`, `-`, `@`) and export current filter slice. |
| **Curriculum** | Course Directory | `/api/v1/admin/courses` | `admin-service` -> `course-service` | `GET` | Bearer JWT (`course:manage`) | **PASS** | Returns all courses. |
| **Curriculum** | Table Actions Visibility | Frontend Table CSS | Frontend | N/A | N/A | **FAIL (UI)** | **Clipped Actions Column**: `overflow-hidden` container without `overflow-x-auto`. Fix container styling and responsive button layout. |
| **Curriculum** | Instructor Resolution | `/api/v1/admin/instructors` | `admin-service` -> `instructor-service` | `GET` | Bearer JWT | **PARTIAL** | Course records had raw UUIDs displayed. Map instructor IDs to human names (`Geeta Kapoor`, `Priyanka Zacharia`, etc.). |
| **Curriculum** | Authoritative Student Count | `/api/v1/courses/{id}/students` | `course-service` | `GET` | Bearer JWT | **PASS** | Live endpoint returns enrolled student count and identities. Load active counts and wire up student inspection modal. |
| **Curriculum** | Price & PATCH metadata | Course Table Row | Frontend | N/A | N/A | **FAIL (UI)** | Remove confusing "PATCH" badges. Display clean `₹{price}` with accessible edit actions. |
| **Curriculum** | Publication Workflow | `/api/v1/admin/courses/{id}/approve` | `admin-service` -> `course-service` | `PUT` | Bearer JWT (`course:manage`) | **PASS** | Transitions course status to Published. Include explicit confirmation. |
| **Order Ledger** | Ledger Table | `/api/v1/admin/orders` | `admin-service` -> `order-service` | `GET` | Bearer JWT (`report:view`) | **PASS** | Returns 178 order records. Sort by `createdAt DESC` by default. |
| **Order Ledger** | State Separation | Order Table Badges | Frontend | N/A | N/A | **FAIL (Logic)** | Order, payment, and settlement states conflated into single badge. Separate Order Status, Payment Status, and Settlement Status. |
| **Order Ledger** | Reconciliation Cards | Summary KPI Cards | Frontend | N/A | N/A | **FAIL (Logic)** | Account for all 178 orders (100 Completed, 56 Pending, 19 Cancelled, 3 Refunded). Define Gross Initiated Volume vs Settled Revenue. |
| **Order Ledger** | Destructive Action Removal | Delete Order Action | `order-service` | `DELETE` | N/A | **FAIL (Audit)** | Destructive physical delete button removed from UI. Orders are immutable financial records; replace with Audit Details Modal. |

