# V23_03: Global Telemetry Data Reconciliation
**Document:** Telemetry Data Audit & Exact Entity Reconciliation  
**Audit Standard:** Cross-Service Authoritative Verification  

---

## 1. User Population Reconciliation (The "47 Missing Users" Solved)

### The Discrepancy Noticed
- Dashboard & User Directory Total: **263**
- Candidate Students: **198**
- Verified Instructors: **16**
- Platform Administrators: **2**
- Sum of role cards: $198 + 16 + 2 = 216$. Unexplained difference: **47 accounts**.

### Authoritative Database Audit (`lms_user_db.users` & `lms_admin_db.admins`)
1. **`lms_user_db.users` contains 263 total accounts:**
   - Role `STUDENT`, Status `ACTIVE`: **198**
   - Role `STUDENT`, Status `PENDING_VERIFICATION`: **47**
   - Role `STUDENT`, Status `DELETED`: **1**
   - Role `STUDENT`, Status `SUSPENDED`: **1**
   - Role `INSTRUCTOR`, Status `ACTIVE`: **16**
   - Total Students: $198 + 47 + 1 + 1 = 247$.
   - Total Instructors: $16$.
   - Sum in `user-service`: $247 + 16 = \mathbf{263}$.
2. **`lms_admin_db.admins` contains 2 total accounts:**
   - Role `MAIN_ADMIN`: **2** (dev.cyberlearnix@gmail.com and root admin).
3. **Conclusion & UI Resolution:**
   The 47 unexplained accounts were students in the `PENDING_VERIFICATION` onboarding state. The UI card previously labeled "Candidate Students: 198" was actually only displaying the *Active* students ($198$).  
   The UI is now updated to transparently display:
   - **Total Platform Users:** 263
   - **Active Learners:** 198 (Candidate Students: 247 total)
   - **Verified Instructors:** 16
   - **Pending Verification:** 47
   - **Restricted / Suspended:** 2
   - **Platform Administrators:** 2 (Admin Service Authority)

---

## 2. Curriculum Reconciliation (231 vs 291 Courses)

### The Authoritative Database Audit (`lms_course_db.courses`)
- `PUBLISHED`: 228 courses
- `Published`: 3 courses
- Total Published Courses: $228 + 3 = \mathbf{231}$
- `DRAFT`: 29 courses
- `ARCHIVED`: 31 courses
- **Total Course Records in System:** $231 + 29 + 31 = \mathbf{291}$ courses.

### Reconciliation Verdict
Both the Global Telemetry dashboard ("Active Curriculum: 231") and the Course Management page ("Published Courses: 231") correctly represent the active, published curriculum. The Course Management filter cards now display the complete catalog lifecycle: Total Courses: 291 (or 231 Published active slice), 29 Draft, 31 Archived.

---

## 3. Order & Financial Reconciliation (₹374,303 vs ₹905,854)

### The Issue Investigated
- Platform Gross: **₹374,303**
- Recent completed settlements table: **₹27,880** (6 rows)
- Order Ledger Settlement Volume: **₹905,854**
- Completed/Paid Orders: **100**
- Pending Settlements: **56**
- Total Orders: **178** ($178 - 156 = \mathbf{22}$ unexplained orders)

### Authoritative Database Audit (`lms_order_db.orders` & `lms_payment_db.payments`)

#### Orders Breakdown (`lms_order_db.orders`):
| Order Status | Count | Total Amount (INR) | Business Meaning |
| :--- | :--- | :--- | :--- |
| `COMPLETED` | 100 | ₹370,305.04 | Successfully paid and fulfilled orders |
| `PENDING` | 56 | ₹428,967.50 | Initiated orders awaiting payment gateway callback |
| `CANCELLED` | 19 | ₹61,581.60 | Cancelled/abandoned checkouts |
| `REFUNDED` | 3 | ₹44,997.00 | Fulfilled orders subsequently refunded |
| **Total Orders** | **178** | **₹905,851.14** (~**₹905,854**) | **Gross Initiated Order Pipeline** |

*All 22 previously unexplained orders are accounted for: 19 Cancelled + 3 Refunded = 22.*

#### Payments Breakdown (`lms_payment_db.payments`):
| Payment Status | Count | Amount (INR) | Definition |
| :--- | :--- | :--- | :--- |
| `SUCCESS` | 102 | ₹374,303.04 | **Platform Gross Revenue** (collected funds) |
| `FAILED` | 7 | ₹37,993.00 | Failed card/UPI transactions |
| `PENDING` | 1 | ₹1,999.00 | In-flight gateway transaction |
| **Total Payments**| **110** | **₹414,295.04** | Total gateway attempts |

### Financial Definitions
1. **Platform Gross (₹374,303):** Authoritative successful payment collections processed by Payment Service (`/api/v1/payments/revenue`).
2. **Settled Order Value (₹370,305):** Net value of the 100 completed and fulfilled customer orders.
3. **Gross Initiated Pipeline Volume (₹905,854):** Cumulative sum of all 178 orders ever created (including pending callback, cancelled, and refunded). It is NOT "settled volume", and the UI is updated to reflect this precise financial term.
4. **Recent Settlements Table:** Displays the 6 most recent individual completed payments from the ledger (`₹5,355 + ₹4,384 + ₹5,414 + ₹2,944 + ₹4,380 + ₹5,403 = ₹27,880`). It represents the latest activity slice, formatted in `₹` (INR).

