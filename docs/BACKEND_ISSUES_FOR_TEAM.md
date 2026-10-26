# Backend Issues Requiring Team Attention

**Date**: 2026-10-13
**Frontend Repository**: C:\Users\SHIVASAI\OneDrive\Desktop\FD_LMS\UI
**Backend Repository**: C:\Users\SHIVASAI\OneDrive\Desktop\LMS
**Report From**: Frontend API Integration Work

---

## Purpose

This document lists backend issues discovered during frontend API integration that require the backend team's attention. These issues cannot be fixed from the frontend and must be addressed by the backend team.

---

## Critical Issues (Fix Before Testing)

### 1. Gateway File Size Limit Too Small

**Severity**: CRITICAL
**Impact**: Video uploads will fail with 413 Payload Too Large error

**Current Configuration**:
- Gateway file size limit: 10MB
- Course Service file size limit: 500MB (for videos)
- User Service file size limit: 25MB (instructor docs), 10MB (profile photos)
- Admin Service file size limit: 5MB (banner images)

**Location**: API Gateway configuration

**Problem**: Large file uploads (especially course videos) will fail at gateway level before reaching the service.

**Recommendation**: Increase gateway file size limit to match the largest service limit (500MB).

**Files to Check**:
- `api-gateway/src/main/resources/application.yml`
- Gateway file upload configuration

---

### 2. CORS Configuration Missing Port 5173

**Severity**: CRITICAL
**Impact**: CORS errors in development environment

**Current Configuration**:
```yaml
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Frontend Configuration**:
- Frontend runs on port 5173 (Vite default)
- Vite proxy configured to proxy `/api` to `http://localhost:8080`

**Problem**: Frontend on port 5173 is not in the allowed origins list, causing CORS errors in development.

**Recommendation**: Add `http://localhost:5173` to CORS allowed origins.

**Files to Check**:
- `api-gateway/src/main/resources/application.yml`
- Gateway CORS configuration
- `CorsConfig.java` if using programmatic CORS

---

### 3. Instructor Service Gateway Routing Limitation

**Severity**: HIGH
**Impact**: Instructor features may be incomplete or inaccessible

**Current Gateway Routes**:
Gateway only routes these specific paths to Instructor Service (Port 8088):
- `/api/v1/instructors/{id}/courses`
- `/api/v1/instructors/{id}/courses/**`
- `/api/v1/instructors/{id}/dashboard`
- `/api/v1/instructors/{id}/earnings`

**Problem**: Other instructor endpoints in Instructor Service may not be accessible through the gateway from the browser.

**Conflicting Route**: `/api/v1/instructors/**` is routed to User Service (Port 8091), while Instructor Service (Port 8088) has its own controllers.

**Recommendation**:
1. Audit Instructor Service to identify all endpoints
2. Add missing gateway routes for all instructor endpoints
3. Clarify architectural intent: Are instructor operations in User Service or Instructor Service?
4. If both, document which endpoints go where
5. Consider consolidating or clearly separating concerns

**Files to Check**:
- `api-gateway/src/main/resources/application.yml` (lines 226-231)
- Instructor Service controllers (7 controller files)
- User Service instructor controllers

---

## High Priority Issues

### 4. Response Envelope Inconsistency

**Severity**: HIGH
**Impact**: Frontend must handle multiple response formats, increasing complexity and error risk

**Affected Endpoints**:
- `POST /api/v1/auth/verify-email` - Returns Map (LoginResponse) directly
- `POST /api/v1/auth/login` - Returns LoginResponse directly
- `GET /api/v1/users/me` - Returns ApiResponse<UserProfileResponse>
- Most endpoints in UserController - Return ApiResponse<T>

**Problem**: Some endpoints return ApiResponse envelope, others return direct DTO or Map.

**Recommendation**: Standardize all responses to use ApiResponse envelope across all services.

**Files to Check**:
- All controller classes
- Global exception handler
- Response wrapper interceptor

---

### 5. Public Photo Upload Not Implemented

**Severity**: MEDIUM
**Impact**: Public photo upload feature not available

**Endpoint**: `POST /api/v1/users/public/upload-photo`

**Current Behavior**: Returns 501 Not Implemented

**Evidence**: UserController line 170-182 returns 501 status

**Recommendation**:
1. Either implement the endpoint
2. Or remove it from the API
3. Or document as deprecated

**Files to Check**:
- `user-service/src/main/java/com/user/register/controller/UserController.java`

---

### 6. Mobile Field Name Incompatibility

**Severity**: MEDIUM
**Impact**: Field name mapping required in frontend

**Backend**: UserProfileResponse uses 'mobile' field
**Frontend**: Expects 'mobileNumber' field

**Current Frontend Workaround**:
```javascript
mobileNumber: data.mobileNumber || data.mobile || currentUser.mobileNumber || '',
```

**Recommendation**: Standardize field naming across backend and frontend DTOs.

**Files to Check**:
- UserProfileResponse DTO
- UpdateUserProfileRequest DTO
- All user-related DTOs

---

## Medium Priority Issues

### 7. Date/Time Format Not Standardized

**Severity**: MEDIUM
**Impact**: Date parsing may fail if formats differ between services

**Backend Evidence**: Code inspection shows LocalDateTime usage, but serialization format not verified.

**Assumption**: ISO 8601 format assumed but not verified across all services.

**Recommendation**:
1. Verify Jackson date serialization configuration across all services
2. Test date formats across all services
3. Document date format standard
4. Add date normalization utility in frontend if needed

**Files to Check**:
- All application.properties/application.yml files
- Jackson configuration
- LocalDateTime serialization

---

### 8. Pagination Structure Variance

**Severity**: MEDIUM
**Impact**: Frontend pagination logic may need to handle multiple formats

**Backend Evidence**: Some endpoints may use custom pagination structures.

**Assumption**: All paginated endpoints use Spring Page structure.

**Recommendation**:
1. Audit all paginated endpoints
2. Standardize pagination structure
3. Document pagination format

**Files to Check**:
- All controller methods with pagination
- Custom pagination DTOs
- Spring Page configuration

---

### 9. Error Response Structure Inconsistency

**Severity**: MEDIUM
**Impact**: Frontend error handling must account for multiple formats

**Backend Evidence**: Different controllers handle errors differently.

**Recommendation**:
1. Standardize error response structure
2. Use global exception handler
3. Document error response format

**Files to Check**:
- Global exception handler
- Controller error handling
- Exception DTOs

---

## Low Priority Issues

### 10. OAuth2 Configuration Incomplete

**Severity**: LOW
**Impact**: Social login will not work in production

**Backend Evidence**: User Service application.properties lines 48-69 show dummy values.

**Current Configuration**:
- Dummy Google client ID and secret
- Dummy GitHub client ID and secret
- Dummy LinkedIn client ID and secret

**Recommendation**:
1. Configure real OAuth2 credentials for each provider
2. Test OAuth2 flow with each provider
3. Document OAuth2 setup requirements

**Files to Check**:
- `user-service/src/main/resources/application.properties`
- OAuth2 provider dashboards

---

### 11. Session Management Edge Cases

**Severity**: LOW
**Impact**: User experience issues with session management

**Unknown Behavior**:
- What happens when session expires during active use?
- How are concurrent sessions handled?
- What happens if session is deleted but token is still valid?

**Recommendation**:
1. Document session lifecycle completely
2. Add tests for edge cases
3. Consider adding session heartbeat mechanism

**Files to Check**:
- SessionController
- Session management logic
- Redis session storage

---

### 12. Service-to-Service Authentication Unverified

**Severity**: MEDIUM
**Impact**: Inter-service calls may fail if authentication misconfigured

**Backend Evidence**: Configuration exists but not tested.

**Configuration**: Shared secret authentication via `X-Service-Auth` header

**Recommendation**:
1. Test service-to-service calls with proper authentication
2. Verify shared secret configuration
3. Add integration tests for service communication

**Files to Check**:
- All application.properties files
- Service authentication filters
- Inter-service Feign clients

---

### 13. Kafka Event Publishing Unverified

**Severity**: MEDIUM
**Impact**: User login notifications may not be sent

**Backend Evidence**: Configuration exists but event flow not tested.

**Configuration**: Kafka for user login events

**Recommendation**:
1. Test Kafka event publishing
2. Verify consumer receives events
3. Add error handling for Kafka failures

**Files to Check**:
- Kafka configuration
- Event publishers
- Event consumers

---

## Additional Issues from API_CONTRACT_GAPS.md

The following issues were already documented in `API_CONTRACT_GAPS.md` and are included here for completeness:

### 14. Secrets in Configuration Files (CRITICAL - SECURITY)

**Severity**: CRITICAL
**Impact**: Security risk if configuration files are exposed

**Issue**: JWT secrets, Gmail passwords, Google Drive credentials hardcoded in configuration files.

**Recommendation**: Move all secrets to environment variables or secret management.

**Files to Check**:
- All application.properties files
- All application.yml files
- Environment variable configuration

---

### 15. Google Drive Service Account Credentials (CRITICAL - SECURITY)

**Severity**: CRITICAL
**Impact**: Security risk if credentials exposed

**Issue**: Google Drive service account credentials in configuration files.

**Recommendation**: Move credentials to secure secret management.

**Files to Check**:
- User Service configuration
- Course Service configuration
- Instructor Service configuration

---

### 16. Token Refresh Behavior Unverified (HIGH)

**Severity**: HIGH
**Impact**: Security vulnerability if refresh token rotation doesn't work correctly

**Unknown Behavior**:
- Does old refresh token get blacklisted?
- Does refresh token rotation work correctly?
- What happens if refresh token is used multiple times?

**Recommendation**:
1. Write integration tests for refresh token scenarios
2. Verify token blacklisting in Redis
3. Test refresh token reuse scenarios

**Files to Check**:
- UnifiedAuthenticationController
- Token refresh logic
- Redis token blacklist

---

### 17. Notification Service Security Verification Routes Unverified (LOW)

**Severity**: LOW
**Impact**: Unknown - endpoints may be for email CTA links or other security features

**Gateway Routes**: `/api/v1/security/**` routed to Notification Service

**Recommendation**:
1. Audit Notification Service security verification controller
2. Document endpoint purpose and behavior
3. Test if endpoints are needed for frontend

**Files to Check**:
- Notification Service security controller
- Gateway configuration

---

### 18. Payment Service Test Routes Exposed (LOW)

**Severity**: LOW
**Impact**: Test endpoints may be exposed in production if not secured

**Gateway Routes**: `/test/**` routed to Payment Service

**Recommendation**:
1. Verify if test routes should be removed in production
2. Add environment-based route filtering
3. Secure test routes with authentication

**Files to Check**:
- Payment Service test controller
- Gateway configuration

---

## Summary Statistics

| Severity | Count | Issues |
|----------|-------|--------|
| CRITICAL | 3 | Gateway file size, CORS, secrets in config |
| HIGH | 3 | Instructor routing, response envelope, token refresh |
| MEDIUM | 6 | Photo upload, field names, date format, pagination, error response, service auth, Kafka |
| LOW | 4 | OAuth2, session edge cases, notification routes, payment test routes |
| **Total** | **16** | **All documented** |

---

## Priority Order for Backend Team

### Immediate (Before Frontend Testing)

1. Increase gateway file size limit to 500MB
2. Add `http://localhost:5173` to CORS allowed origins
3. Remove secrets from configuration files (move to environment variables)

### High Priority

4. Resolve instructor service gateway routing limitation
5. Standardize response envelope across all endpoints
6. Verify token refresh behavior

### Medium Priority

7. Implement or remove public photo upload endpoint
8. Standardize mobile field name to mobileNumber
9. Verify and standardize date/time format
10. Audit and standardize pagination structure
11. Standardize error response structure
12. Test service-to-service authentication
13. Test Kafka event publishing

### Low Priority

14. Complete OAuth2 configuration
15. Document session lifecycle edge cases
16. Audit notification service security routes
17. Remove or secure payment service test routes

---

## Files to Review

### Gateway Configuration
- `api-gateway/src/main/resources/application.yml`
- `api-gateway/src/main/java/.../CorsConfig.java`

### User Service
- `user-service/src/main/resources/application.properties`
- `user-service/src/main/java/com/user/register/controller/UserController.java`
- `user-service/src/main/java/com/user/register/controller/UnifiedAuthenticationController.java`
- `user-service/src/main/java/com/user/register/controller/SessionController.java`

### Course Service
- `course-service/src/main/resources/application.properties`
- All controller classes

### Notification Service
- `notification-service/src/main/resources/application.properties`
- Security verification controller

### Payment Service
- `payment-service/src/main/resources/application.properties`
- Test controller

### All Services
- All application.properties files (for secrets)
- All application.yml files (for secrets)
- Global exception handlers
- Jackson configuration

---

## Questions for Backend Team

1. **Instructor Service Architecture**: Should instructor operations be in User Service or Instructor Service? How should this be separated?

2. **Response Envelope**: Should all endpoints return ApiResponse<T> envelope, or is the current mixed approach intentional?

3. **File Size Limits**: What should the gateway file size limit be? Should it match the largest service limit (500MB)?

4. **Field Naming**: Should we standardize on 'mobile' or 'mobileNumber' across all DTOs?

5. **Public Photo Upload**: Should the public photo upload endpoint be implemented or removed?

6. **OAuth2**: When will OAuth2 be configured with real credentials?

7. **Session Management**: What is the expected behavior for session expiration and concurrent sessions?

---

## Frontend Integration Status

**Completed Work**:
- Fixed refresh token request format (now sends in Authorization header)
- Integrated 11 missing API endpoints
- Created 1 new API module (assignmentApi)
- Updated 2 existing API modules (authApi, notificationApi)
- Created comprehensive documentation (3 files)

**Frontend Issues Addressed**:
- Refresh token format mismatch
- Missing session management endpoints
- Missing email change endpoints
- Missing assignment endpoints
- Missing notification preference endpoints
- Missing device token registration

**Frontend Issues Remaining**:
- UI components not created for new integrations
- Runtime verification not performed
- No end-to-end testing with running backend

---

## Contact

**Frontend Team**: Available for questions about the frontend integration work.
**Backend Team**: Please review this document and prioritize the issues listed above.

**Documentation Location**: `C:\Users\SHIVASAI\OneDrive\Desktop\FD_LMS\UI\docs\`

---

**Report Generated**: 2026-10-13
**Status**: Backend issues documented and prioritized
**Next Step**: Backend team to review and address issues
