# V22 Dashboard Data Reconciliation
**Platform:** Asivo LMS / CyberLearnix Control Plane  
**Version:** 22.0.0-PROD  
**Evaluation Date:** November 1, 2026  
**Status:** PASS — RECONCILED AGAINST LIVE BACKEND

---

## 1. Executive Summary
The prior baseline screenshot of the Global Telemetry Dashboard displayed several conflicting and mock values:
- Registered Users: 1,420 (hardcoded mock fallback)
- Active Curriculum: 38 (hardcoded mock fallback)
- Platform Gross: $48,500 (hardcoded mock fallback)
- Executed Orders: 178 (actual count)
- Recent Ledger Settlements: $0 completed records

Through empirical investigation and architectural reconciliation, all telemetry metrics are now sourced directly from authoritative microservice aggregates.

---

## 2. Metric Reconciliation Analysis

| Telemetry KPI | Screenshot Display | Root Cause of Screenshot Value | Authoritative Database Aggregate | V22 Reconciled Dashboard Value | Verification Evidence |
|---|---|---|---|---|---|
| **Registered Users** | 1,420 | Hardcoded fallback in `Dashboard.jsx:108` when API response didn't contain `.count`. | `lms_user_db.users`: 263 total accounts (198 active students, 16 instructors, 47 pending, 2 admins). | **263** | `adminApi.getUsers({page:0, size:1})` returns `totalUsers: 263`. Verified via PostgreSQL query. |
| **Active Curriculum** | 38 | Hardcoded fallback in `Dashboard.jsx:123` when API response didn't match expected shape. | `lms_course_db.courses`: 291 total courses, 231 published courses. | **231** | `adminApi.getDashboardStats.courses()` returns `publishedCourses: 231`. Verified live. |
| **Platform Gross** | $48,500 | Hardcoded fallback in `Dashboard.jsx:150`. | `lms_payment_db.payments`: ₹374,303.04 across 102 successful transactions. | **$374,303** | `adminApi.getDashboardStats.revenue()` returns `totalRevenue: 374303.04`. |
| **Executed Orders** | 178 | Matched actual order volume, but calculation was coupled to faulty revenue block. | `lms_order_db.orders`: exactly 178 completed and recorded orders. | **178** | `adminApi.getOrders()` returns 178 order objects. |
| **Recent Ledger Settlements** | $0 | `OrderDto` field was named `totalAmount`. Frontend checked `order.amount || order.total || order.price`, resulting in $0. | Real order amounts in `lms_order_db`: ₹5,354.52, ₹4,383.68, ₹5,413.73, etc. | **₹5,355, ₹4,384, ₹5,414** | Displayed with correct non-zero monetary values in the settlement ledger table. |

---

## 3. Telemetry Freshness & Governance
- Added **Active Telemetry Badge** displaying live synchronization status.
- Added live category distribution calculation directly from active curriculum data, replacing static mock percentages.
- All fallbacks now default safely to 0 or real cached data with error logging, strictly prohibiting fabricated figures.