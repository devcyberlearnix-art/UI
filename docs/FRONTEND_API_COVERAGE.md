# Frontend API Coverage Report

**Date**: 2026-10-13
**Frontend Repository**: C:\Users\SHIVASAI\OneDrive\Desktop\FD_LMS\UI
**Backend Repository**: C:\Users\SHIVASAI\OneDrive\Desktop\LMS
**Backend Branch**: shivasai
**Frontend Branch**: shivasai

---

## Executive Summary

This document records discovered discrepancies between the backend API documentation and the actual integration coverage in the Asivo LMS frontend.

**Key Findings**:
- **Total Backend Endpoints Documented**: 127+
- **Frontend API Modules**: 18 modules
- **Browser-Consumable Endpoints**: 114+
- **Frontend-Integrated Endpoints**: Estimated 80-90 (needs verification)
- **Missing Frontend Integrations**: TBD
- **Known Backend Contract Issues**: 30 documented in API_CONTRACT_GAPS.md

---

## Backend API Documentation Status

### Documentation Files Analyzed

1. **README.md** - Overview and architecture (SOURCE VERIFIED)
2. **COMPLETE_API_REFERENCE.md** - Detailed endpoint documentation (SOURCE VERIFIED)
3. **API_ENDPOINT_INVENTORY.csv** - Complete endpoint inventory (SOURCE VERIFIED)
4. **REQUEST_RESPONSE_EXAMPLES.md** - Copyable examples (SOURCE VERIFIED)
5. **AUTHENTICATION_AND_AUTHORIZATION.md** - Auth documentation (SOURCE VERIFIED)
6. **GATEWAY_AND_MICROSERVICE_MAP.md** - Gateway routing (SOURCE VERIFIED)
7. **API_CONTRACT_GAPS.md** - Known issues (30 issues identified)
8. **OPENAPI_SPEC.yaml** - OpenAPI specification (SOURCE VERIFIED)
9. **FINAL_AUDIT_REPORT.md** - Audit summary (SOURCE VERIFIED)

### Documentation Confidence

- **Source Verified**: 127+ endpoints (100%)
- **Test Verified**: Unknown (requires test execution)
- **Runtime Verified**: 0 (requires running infrastructure)
- **Contract Unconfirmed**: 0

---

## Discrepancies and Issues

### 1. Response Envelope Inconsistency (HIGH PRIORITY)

**Issue**: Some endpoints return ApiResponse envelope, others return direct DTO or Map.

**Affected Endpoints**:
- `POST /api/v1/auth/verify-email` - Returns Map (LoginResponse) directly
- `POST /api/v1/auth/login` - Returns LoginResponse directly
- `GET /api/v1/users/me` - Returns ApiResponse<UserProfileResponse>
- Most endpoints in UserController - Return ApiResponse<T>

**Impact**: Frontend must handle multiple response formats, increasing complexity and error risk.

**Frontend Handling**: The frontend code attempts to handle both formats:
```javascript
// From AuthContext.jsx
let data = profileData?.data?.user || profileData?.data?.admin || profileData?.data?.instructor || profileData?.data || profileData;
```

**Recommendation**: Standardize all responses to use ApiResponse envelope across all services.

---

### 2. Instructor Service Gateway Routing Limitation (HIGH PRIORITY)

**Issue**: Gateway only routes specific instructor paths to Instructor Service (Port 8088).

**Routed Paths**:
- `/api/v1/instructors/{id}/courses`
- `/api/v1/instructors/{id}/courses/**`
- `/api/v1/instructors/{id}/dashboard`
- `/api/v1/instructors/{id}/earnings`

**Problem**: Other instructor endpoints in Instructor Service may not be accessible through the gateway from the browser.

**Gateway Configuration**: `api-gateway/src/main/resources/application.yml` lines 226-231

**Frontend Impact**: Instructor features beyond these 4 paths may fail or require routing through User Service.

**Conflicting Route**: `/api/v1/instructors/**` is routed to User Service (Port 8091), while Instructor Service (Port 8088) has its own controllers.

**Recommendation**:
1. Audit Instructor Service to identify all endpoints
2. Add missing gateway routes
3. Clarify architectural intent: Are instructor operations in User Service or Instructor Service?

---

### 3. File Upload Size Limit Mismatch (MEDIUM PRIORITY)

**Issue**: Gateway file size limit (10MB) is smaller than service limits.

**Size Limits**:
- Gateway: 10MB
- Course Service: 500MB (videos)
- User Service: 25MB (instructor docs), 10MB (profile photos)
- Admin Service: 5MB (banner images)

**Impact**: Large file uploads (especially course videos) will fail at gateway level before reaching the service.

**Frontend Impact**: Video uploads for courses will fail with 413 Payload Too Large error.

**Recommendation**: Increase gateway file size limit to match largest service limit (500MB).

---

### 4. Date/Time Format Not Standardized (MEDIUM PRIORITY)

**Issue**: Not verified if all dates use ISO 8601 format consistently across services.

**Backend Evidence**: Code inspection shows LocalDateTime usage, but serialization format not verified.

**Frontend Impact**: Date parsing may fail if formats differ between services.

**Frontend Handling**: No explicit date parsing normalization found in frontend code.

**Recommendation**:
1. Verify Jackson date serialization configuration across all services
2. Test date formats across all services
3. Document date format standard
4. Add date normalization utility in frontend

---

### 5. Pagination Structure Variance (MEDIUM PRIORITY)

**Issue**: Not verified if all paginated endpoints use Spring Page structure consistently.

**Backend Evidence**: Some endpoints may use custom pagination structures.

**Frontend Impact**: Frontend pagination logic may need to handle multiple formats.

**Frontend Handling**: Course API uses standard pagination params:
```javascript
getAllCourses: async (params = { page: 0, size: 10, sortBy: 'id', sortDir: 'asc' })
```

**Recommendation**:
1. Audit all paginated endpoints
2. Standardize pagination structure
3. Document pagination format

---

### 6. Error Response Structure Inconsistency (MEDIUM PRIORITY)

**Issue**: Error responses may use different structures (ApiResponse vs direct error object).

**Backend Evidence**: Different controllers handle errors differently.

**Frontend Impact**: Frontend error handling must account for multiple formats.

**Frontend Handling**: Frontend has apiErrorParser utility to handle various error formats.

**Recommendation**:
1. Standardize error response structure
2. Use global exception handler in backend
3. Document error response format

---

### 7. Public Photo Upload Not Implemented (MEDIUM PRIORITY)

**Issue**: Endpoint `POST /api/v1/users/public/upload-photo` returns 501 Not Implemented.

**Backend Evidence**: UserController line 170-182 returns 501 status.

**Frontend Impact**: Public photo upload feature not available.

**Recommendation**:
1. Either implement the endpoint
2. Or remove it from the API
3. Or document as deprecated

---

### 8. Token Refresh Behavior Unverified (HIGH PRIORITY)

**Issue**: Runtime behavior of token refresh not verified.

**Unknown Behavior**:
- Does old refresh token get blacklisted?
- Does refresh token rotation work correctly?
- What happens if refresh token is used multiple times?

**Backend Evidence**: Source code shows token blacklisting logic, but runtime behavior not tested.

**Frontend Impact**: Security vulnerability if refresh token rotation doesn't work correctly.

**Frontend Handling**: Frontend has comprehensive token refresh logic in axiosInstance.js with queue management.

**Recommendation**:
1. Write integration tests for refresh token scenarios
2. Verify token blacklisting in Redis
3. Test refresh token reuse scenarios

---

### 9. Service-to-Service Authentication Unverified (MEDIUM PRIORITY)

**Issue**: Service-to-service authentication via `X-Service-Auth` header not verified at runtime.

**Backend Evidence**: Configuration exists but not tested.

**Frontend Impact**: Inter-service calls may fail if authentication misconfigured, affecting data consistency.

**Recommendation**:
1. Test service-to-service calls with proper authentication
2. Verify shared secret configuration
3. Add integration tests for service communication

---

### 10. Kafka Event Publishing Unverified (MEDIUM PRIORITY)

**Issue**: Kafka event publishing for user login notifications not verified.

**Backend Evidence**: Configuration exists but event flow not tested.

**Frontend Impact**: User login notifications may not be sent.

**Recommendation**:
1. Test Kafka event publishing
2. Verify consumer receives events
3. Add error handling for Kafka failures

---

### 11. OAuth2 Configuration Incomplete (LOW PRIORITY)

**Issue**: OAuth2 provider configuration in application.properties may not match actual OAuth2 provider requirements.

**Backend Evidence**: User Service application.properties lines 48-69 show dummy values.

**Frontend Impact**: Social login will not work in production without proper configuration.

**Recommendation**:
1. Configure real OAuth2 credentials for each provider
2. Test OAuth2 flow with each provider
3. Document OAuth2 setup requirements

---

### 12. Notification Service Security Verification Routes Unverified (LOW PRIORITY)

**Issue**: Gateway routes `/api/v1/security/**` to Notification Service, but actual endpoint behavior not documented.

**Backend Evidence**: Gateway config lines 271-276

**Frontend Impact**: Unknown - endpoints may be for email CTA links or other security features.

**Recommendation**:
1. Audit Notification Service security verification controller
2. Document endpoint purpose and behavior
3. Test if endpoints are needed for frontend

---

### 13. Payment Service Test Routes Exposed (LOW PRIORITY)

**Issue**: Gateway routes `/test/**` to Payment Service, but these may be for development only.

**Backend Evidence**: Gateway config lines 218-223

**Frontend Impact**: Test endpoints may be exposed in production if not secured.

**Recommendation**:
1. Verify if test routes should be removed in production
2. Add environment-based route filtering
3. Secure test routes with authentication

---

## Frontend API Module Status

### Existing API Modules

1. **authApi.js** - Authentication and user profile endpoints
2. **courseApi.js** - Course catalog, details, enrollment, progress
3. **instructorApi.js** - Instructor-specific operations
4. **studentApi.js** - Student-specific operations
5. **cartApi.js** - Shopping cart operations
6. **couponApi.js** - Coupon and discount operations
7. **orderApi.js** - Order management
8. **paymentApi.js** - Payment processing
9. **reviewApi.js** - Course reviews and ratings
10. **wishlistApi.js** - Course wishlist
11. **notificationApi.js** - Notifications
12. **liveClassApi.js** - Live class management
13. **quizApi.js** - Quiz management
14. **adminApi.js** - Admin operations
15. **landingApi.js** - Landing page data
16. **contractApi.js** - Contract management (unclear purpose)
17. **contractApiTree.js** - Contract tree (unclear purpose)
18. **generatedApiClient.js** - Generated API client (unclear purpose)

### API Module Completeness Assessment

| Module | Backend Service | Estimated Completeness | Notes |
|--------|-----------------|------------------------|-------|
| authApi | User Service | High | Covers most auth endpoints |
| courseApi | Course Service | High | Comprehensive course operations |
| instructorApi | User Service | Medium | May be affected by routing issues |
| studentApi | Course Service | Medium | Student dashboard and enrollment |
| cartApi | Cart Service | High | Cart operations |
| couponApi | Coupon Service | High | Coupon operations |
| orderApi | Order Service | High | Order operations |
| paymentApi | Payment Service | High | Payment operations |
| reviewApi | Review Service | High | Review operations |
| wishlistApi | Wishlist Service | High | Wishlist operations |
| notificationApi | Notification Service | Low | Partially documented |
| liveClassApi | Course Service | Medium | Live class operations |
| quizApi | Course Service | Medium | Quiz operations |
| adminApi | Admin Service | Medium | Admin operations |
| landingApi | Multiple | Low | Landing page data |
| contractApi | Unknown | Unknown | Purpose unclear |
| contractApiTree | Unknown | Unknown | Purpose unclear |
| generatedApiClient | Unknown | Unknown | Purpose unclear |

---

## Frontend Configuration

### Development Configuration

**Vite Proxy**: Configured to proxy `/api` requests to `http://localhost:8080` (API Gateway)

```javascript
// vite.config.js
server: {
  port: 5173,
  open: true,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false
    }
  }
}
```

**Environment Variables**:
- Development: Empty string (uses Vite proxy)
- Production: `VITE_API_BASE_URL` (fallback to ngrok URL)

### Axios Instance Configuration

**Features**:
- Automatic token injection from localStorage/sessionStorage/cookies
- Automatic token refresh on 401 errors
- Request queue for concurrent refresh attempts
- Comprehensive error handling
- FormData support for file uploads
- 30-second timeout
- withCredentials: true (for cookies)

**Public Endpoints**: Explicitly skip auth header for:
- `/auth/register`
- `/auth/verify-email`
- `/auth/login`
- `/auth/login/otp/request`
- `/auth/login/otp/verify`
- `/auth/password/forgot`
- `/auth/password/verify-otp`
- `/auth/password/reset`
- `/auth/refresh`

### Authentication Context

**AuthContext Features**:
- Session persistence (localStorage + sessionStorage)
- Automatic profile fetching on login
- Role normalization (handles various role formats)
- Profile photo normalization (Google Drive URL conversion)
- Token refresh integration
- Profile photo change event listeners

**Role Handling**:
- Normalizes roles: 'super_admin', 'sub_admin', 'admin', 'instructor', 'student'
- Maps role to dashboard path
- Handles effectiveRole field

---

## Known Frontend Issues

### 1. Refresh Token Endpoint Issue

**Issue**: The refresh token endpoint expects the refresh token in the Authorization header, but the frontend sends it in the request body.

**Backend Contract**: `Authorization: Bearer <refresh_token>`
**Frontend Implementation**: Sends `{ refreshToken }` in request body

**Location**: `src/api/authApi.js` line 42
```javascript
const response = await axiosInstance.post('/api/v1/auth/refresh', { refreshToken });
```

**Recommendation**: Update frontend to send refresh token in Authorization header instead of request body.

---

### 2. Profile Photo URL Normalization

**Issue**: Backend returns Google Drive URLs in various formats, frontend converts to thumbnail format.

**Backend Formats**:
- `https://drive.google.com/uc?id=FILE_ID`
- `https://drive.google.com/file/d/FILE_ID/view`

**Frontend Conversion**: Converts to `https://drive.google.com/thumbnail?id=FILE_ID&sz=w1280-h1280`

**Location**: `src/config/api.js` lines 19-34

**Recommendation**: Verify this conversion works for all Google Drive URL formats returned by backend.

---

### 3. Mobile Field Name Incompatibility

**Issue**: Backend uses 'mobile' field, frontend expects 'mobileNumber'.

**Backend**: UserProfileResponse uses 'mobile'
**Frontend**: AuthContext normalizes to 'mobileNumber'

**Location**: `src/context/AuthContext.jsx` line 115
```javascript
mobileNumber: data.mobileNumber || data.mobile || currentUser.mobileNumber || '',
```

**Recommendation**: Ensure consistent field naming across backend and frontend DTOs.

---

## Missing Frontend Integrations

### Based on Backend Inventory

The following backend endpoints may not have corresponding frontend integrations (needs verification):

1. **Session Management Endpoints**:
   - `GET /api/v1/users/me/sessions` - List active sessions
   - `DELETE /api/v1/users/me/sessions/{id}` - Logout from specific device
   - `DELETE /api/v1/users/me/sessions` - Logout from all devices

2. **Email Change Endpoints**:
   - `POST /api/v1/users/me/change-email/request` - Request email change
   - `POST /api/v1/users/me/change-email/verify` - Verify email change

3. **Switch Role Endpoint**:
   - `POST /api/v1/auth/switch-role` - Switch between user roles

4. **Social Login Endpoints**:
   - `POST /api/v1/auth/social-login` - Social login
   - `POST /api/v1/auth/social-login/{provider}` - Provider-specific social login
   - `POST /api/v1/auth/oauth/continue` - OAuth continue
   - `GET /api/v1/auth/oauth/providers` - Get OAuth providers

5. **Live Class Endpoints** (may be partially integrated):
   - `POST /api/v1/live-classes/{liveClassId}/join` - Join live class
   - `POST /api/v1/live-classes/{liveClassId}/attendance` - Mark attendance
   - `GET /api/v1/live-classes/{liveClassId}/attendance/summary` - Attendance summary

6. **Assignment Endpoints** (may be partially integrated):
   - `POST /api/v1/assignments/{assignmentId}/submission` - Submit assignment
   - `GET /api/v1/assignments/{assignmentId}/submission` - Get submission
   - `PUT /api/v1/assignments/{assignmentId}/submission/{submissionId}/grade` - Grade submission

7. **Notification Service Endpoints** (partially documented):
   - Various notification templates and preferences endpoints

8. **Banner Admin Endpoints**:
   - `POST /api/v1/admin/banners` - Create banner
   - `PUT /api/v1/admin/banners/{id}` - Update banner
   - `DELETE /api/v1/admin/banners/{id}` - Delete banner

---

## Security Concerns

### 1. Secrets in Configuration Files (CRITICAL)

**Backend Issue**: JWT secrets, Gmail passwords, Google Drive credentials hardcoded in configuration files.

**Frontend Impact**: If frontend calls internal service URLs directly, secrets may be exposed.

**Recommendation**: Ensure frontend only calls API Gateway, never internal service URLs.

---

### 2. Token Storage (MEDIUM)

**Frontend Implementation**: Tokens stored in localStorage and sessionStorage.

**Security Risk**: localStorage vulnerable to XSS attacks.

**Recommendation**: Consider using HttpOnly cookies for token storage (backend already sets cookies).

---

### 3. CORS Configuration (LOW)

**Backend Configuration**: CORS handled programmatically via CorsWebFilter bean.

**Frontend Impact**: Ensure CORS origins match frontend deployment URLs.

**Allowed Origins**:
- `http://localhost:3000`
- `http://localhost:3001`
- `https://*.ngrok-free.app`
- `https://*.ngrok-free.dev`
- `https://*.ngrok.io`

**Note**: Frontend runs on port 5173, which is not in the allowed origins list.

**Recommendation**: Add `http://localhost:5173` to CORS allowed origins.

---

## Testing Gaps

### Unverified Areas

1. **Runtime behavior** - No actual API requests executed
2. **Database schema details** - Tables and indexes not audited
3. **Test coverage** - Integration test coverage not measured
4. **Performance** - No load testing or query optimization audit
5. **Kafka event flow** - Event publishing not tested
6. **OAuth2 provider integration** - Not tested with real providers
7. **Payment gateway integration** - PayU integration not tested
8. **Google Drive file operations** - Not tested with real credentials
9. **Email delivery** - SMTP configuration not tested
10. **Redis caching** - Cache behavior not verified

---

## Recommendations

### Immediate (Before Integration)

1. **Fix CORS Origins**: Add `http://localhost:5173` to backend CORS allowed origins
2. **Fix Refresh Token Request**: Update frontend to send refresh token in Authorization header
3. **Increase Gateway File Size Limit**: Increase from 10MB to 500MB
4. **Clarify Instructor Routing**: Resolve User Service vs Instructor Service routing conflict

### High Priority

5. **Standardize Response Envelope**: All endpoints should return ApiResponse<T>
6. **Verify Token Refresh**: Test refresh token rotation and blacklisting
7. **Test Service-to-Service Auth**: Verify inter-service communication
8. **Verify Kafka Events**: Test user login notification flow

### Medium Priority

9. **Standardize Date Format**: Verify ISO 8601 across all services
10. **Standardize Pagination**: Audit and standardize pagination structure
11. **Standardize Error Responses**: Use global exception handler
12. **Document Password Requirements**: Clarify password strength rules

### Low Priority

13. **Document All Instructor Endpoints**: Complete instructor service documentation
14. **Document All Admin Endpoints**: Complete admin service documentation
15. **Document All Notification Endpoints**: Complete notification service documentation
16. **Measure Test Coverage**: Audit integration test coverage
17. **Define API Versioning Strategy**: Plan for v2, v3 APIs

---

## Next Steps

1. **Create Integration Matrix**: Map all 127+ backend endpoints to frontend features
2. **Audit Frontend API Modules**: Verify each module matches backend contract
3. **Fix Critical Issues**: Address CORS, refresh token, and routing issues
4. **Implement Missing Integrations**: Add frontend functions for missing endpoints
5. **Test Each Integration**: Runtime verification of each endpoint
6. **Update Documentation**: Record actual integration status and issues

---

**Report Generated**: 2026-10-13
**Status**: Initial coverage analysis complete
**Next Document**: FRONTEND_API_INTEGRATION_MATRIX.md
