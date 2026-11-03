# V23_08: Admin Security & Audit Architecture

**Document Reference:** `docs/V23_08_ADMIN_SECURITY_AND_AUDIT.md`  
**Execution Timestamp:** 2026-11-01  
**Target Services:** `api-gateway` (8079), `admin-service` (8087), `user-service` (8091), `order-service` (8084), `payment-service` (8085)  
**Compliance Standards:** OWASP Top 10 (2021), CWE-1236, Financial Data Immutability, Role-Based Access Control (RBAC)  

---

## 1. Authentication & Session Security

### 1.1 JWT Bearer Token Architecture
Administrative authentication is mediated through the API Gateway (`http://localhost:8079/api/v1/auth/login`).
- Administrative credentials: `dev.cyberlearnix@gmail.com`
- Gateway validates the Bearer token signature, expiration timestamp, and claims before routing downstream to microservices.
- All administrative requests pass via `src/api/axiosInstance.js`, which attaches the authorization header and handles token lifecycle:
```javascript
config.headers.Authorization = `Bearer ${token}`;
```

### 1.2 Protection of Platform Administrators
In `src/pages/admin/Users.jsx`, explicit client and API checks prevent the deactivation, modification, or deletion of root administrators:
```javascript
if (user.role === "PLATFORM_ADMIN" || user.role === "MAIN_ADMIN") {
  toast.error("Root platform administrator accounts cannot be deleted or suspended.");
  return;
}
```
This protects against administrative lockout scenarios where the last active root administrator is accidentally removed.

---

## 2. Non-Destructive Administrative Actions

### 2.1 User Governance Directory
- **Reversible Deactivation:** Instead of permanent destructive deletion, administrators toggle user status between `ACTIVE` and `SUSPENDED` via `PUT /api/v1/admin/users/{id}/status`.
- **Audit Preservation:** Suspending an account preserves all historical enrollments, submitted assignments, certificates, and order ledgers for legal and audit compliance.

### 2.2 Financial Order Ledger
- **Financial Immutability:** In financial ledgers, physical deletion is strictly forbidden. The `deleteOrder` trash icon has been permanently removed from `Orders.jsx`.
- **Reversal Workflows:** Orders in `PENDING` can transition to `CANCELLED`; orders in `COMPLETED` require formal refund authorization (`POST /api/v1/admin/orders/{id}/refund`), creating an audit log rather than wiping database records.

---

## 3. Defense Against CSV Formula Injection (CWE-1236)

### 3.1 Vulnerability Context
When administrative tables export data to CSV files, malicious users may register with usernames or course titles beginning with formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`). If opened in spreadsheet software (Microsoft Excel, LibreOffice Calc), these strings can execute arbitrary formula commands or exfiltrate data.

### 3.2 Implemented Sanitization Filter
Both `Users.jsx` and `Orders.jsx` incorporate strict sanitization routines:
```javascript
const sanitize = (val) => {
  const str = String(val ?? "").trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  return `"${str.replace(/"/g, '""')}"`;
};
```
Every exported field is checked; formula prefixes are neutralized with a leading single quote (`'`), ensuring spreadsheets treat the cell strictly as plain text.

---

## 4. Sensitive Data Exposure & Privacy Controls

### 4.1 Internal Technical Identifiers
- Display of 36-character raw UUIDs is minimized in primary table views to reduce clutter.
- UUIDs are formatted cleanly (e.g. `d290f1ee...`) with copy-to-clipboard buttons and full revelation only within authenticated modal inspection views.

### 4.2 Single Domestic Currency Policy
- All financial metrics strictly enforce Indian Rupee (`₹` / `INR`) formatting.
- Eliminates accidental mixing of `$` and `₹` symbols, preventing currency conversion ambiguities in accounting ledgers.

