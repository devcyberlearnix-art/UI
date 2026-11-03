import fs from 'fs';

function generatePostmanCollection() {
  const collection = {
    info: {
      name: "CyberLearnix Admin Platform API (Phase 5 Master)",
      _postman_id: "cyberlearnix-admin-platform-v5",
      description: "Authoritative production Postman collection for the CyberLearnix Admin Platform. Covers 73 backend endpoints across 10 controllers in admin-service, gateway-routed to port 8079 or 8087, verified under Phase 4 E2E testing.",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    variable: [
      { key: "base_url", value: "http://localhost:8079", type: "string", description: "API Gateway Base URL" },
      { key: "admin_direct_url", value: "http://localhost:8087", type: "string", description: "Admin Service Direct Port" },
      { key: "admin_token", value: "", type: "string", description: "JWT Admin Bearer Token" },
      { key: "trace_id", value: "e2e-trace-001", type: "string", description: "Correlation Trace ID Header" },
      { key: "banner_id", value: "21", type: "string" },
      { key: "user_id", value: "7627cef9-efd3-470e-92a2-f77a1a7369e7", type: "string" },
      { key: "order_id", value: "1", type: "string" },
      { key: "payment_id", value: "1", type: "string" },
      { key: "instructor_id", value: "00000000-0000-0000-0000-000000000001", type: "string" },
      { key: "application_id", value: "1", type: "string" },
      { key: "session_id", value: "session-otp-test", type: "string" }
    ],
    item: [
      // 1. BANNER SUITE
      {
        name: "1. Promotional Banner Management Suite",
        description: "Endpoints backing BannerManagement.jsx and storefront hero promotions.",
        item: [
          {
            name: "Create Promotional Banner",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" },
                { key: "X-Trace-Id", value: "{{trace_id}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  title: "Cloud Native Kubernetes & Distributed Tracing Masterclass",
                  description: "Advanced microservices architecture with Spring Boot 3.3 and OpenTelemetry.",
                  imageUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9",
                  mobileImageUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9",
                  ctaText: "Enroll Now",
                  ctaUrl: "https://cyberlearnix.com/courses/253",
                  displayOrder: 1,
                  status: "ACTIVE",
                  targetType: "COURSE"
                }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/banners", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners"] }
            },
            response: [
              {
                name: "201 Created Response",
                status: "Created",
                code: 201,
                body: JSON.stringify({
                  success: true,
                  message: "Banner created successfully",
                  data: { id: 21, title: "Cloud Native Kubernetes Masterclass", displayOrder: 1, status: "ACTIVE" }
                }, null, 2)
              }
            ]
          },
          {
            name: "Get All Active Banners",
            request: {
              method: "GET",
              header: [
                { key: "Authorization", value: "Bearer {{admin_token}}" },
                { key: "X-Trace-Id", value: "{{trace_id}}" }
              ],
              url: { raw: "{{base_url}}/api/v1/admin/banners", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners"] }
            }
          },
          {
            name: "Get Banner By ID",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/banners/{{banner_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "{{banner_id}}"] }
            }
          },
          {
            name: "Update Banner (Full)",
            request: {
              method: "PUT",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  title: "Updated Banner Title",
                  description: "Updated description",
                  imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
                  ctaText: "Explore Track",
                  ctaUrl: "https://cyberlearnix.com/courses",
                  displayOrder: 1,
                  status: "ACTIVE",
                  targetType: "COURSE"
                }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/banners/{{banner_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "{{banner_id}}"] }
            }
          },
          {
            name: "Partial Update Banner (Patch)",
            request: {
              method: "PATCH",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ title: "Patched Title" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/banners/{{banner_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "{{banner_id}}"] }
            }
          },
          {
            name: "Update Banner Status",
            request: {
              method: "PATCH",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ status: "INACTIVE" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/banners/{{banner_id}}/status", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "{{banner_id}}", "status"] }
            }
          },
          {
            name: "Reorder Banners Matrix",
            request: {
              method: "PATCH",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  banners: [{ id: 21, displayOrder: 1 }]
                }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/banners/reorder", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "reorder"] }
            }
          },
          {
            name: "Delete Banner (Soft Delete)",
            request: {
              method: "DELETE",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/banners/{{banner_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "{{banner_id}}"] }
            }
          },
          {
            name: "Get Banner Analytics",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/banners/{{banner_id}}/analytics", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "{{banner_id}}", "analytics"] }
            }
          },
          {
            name: "Upload Banner Image (Multipart)",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              body: {
                mode: "formdata",
                formdata: [
                  { key: "file", type: "file", src: "" },
                  { key: "imageType", value: "desktop", type: "text" }
                ]
              },
              url: { raw: "{{base_url}}/api/v1/admin/banners/upload-image", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "upload-image"] }
            }
          },
          {
            name: "Validate Banner Image",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              body: {
                mode: "formdata",
                formdata: [{ key: "file", type: "file", src: "" }]
              },
              url: { raw: "{{base_url}}/api/v1/admin/banners/validate-image", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "validate-image"] }
            }
          },
          {
            name: "Get Soft-Deleted Banners",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/banners/deleted", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "deleted"] }
            }
          },
          {
            name: "Restore Soft-Deleted Banner",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/banners/{{banner_id}}/restore", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "{{banner_id}}", "restore"] }
            }
          },
          {
            name: "Get Active Banners by Target Type",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/banners/target/COURSE", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "target", "COURSE"] }
            }
          },
          {
            name: "Track Banner Conversion",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/banners/{{banner_id}}/conversion", host: ["{{base_url}}"], path: ["api", "v1", "admin", "banners", "{{banner_id}}", "conversion"] }
            }
          }
        ]
      },

      // 2. ADMIN AUTH & RECOVERY
      {
        name: "2. Admin Authentication & Password Recovery",
        description: "Authoritative admin sign-in, MFA OTP challenges, and self-service password recovery.",
        item: [
          {
            name: "Admin Direct Login",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ email: "admin@merqora.com", password: "Password@123" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/login", host: ["{{base_url}}"], path: ["api", "v1", "admin", "login"] }
            }
          },
          {
            name: "Request Login OTP",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ email: "admin@merqora.com" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/login/otp/request", host: ["{{base_url}}"], path: ["api", "v1", "admin", "login", "otp", "request"] }
            }
          },
          {
            name: "Verify Login OTP",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ email: "admin@merqora.com", otp: "123456" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/login/otp/verify", host: ["{{base_url}}"], path: ["api", "v1", "admin", "login", "otp", "verify"] }
            }
          },
          {
            name: "Resend Login OTP",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ email: "admin@merqora.com" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/login/otp/resend", host: ["{{base_url}}"], path: ["api", "v1", "admin", "login", "otp", "resend"] }
            }
          },
          {
            name: "Forgot Password (Request Reset)",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ email: "admin@merqora.com" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/forgot-password", host: ["{{base_url}}"], path: ["api", "v1", "admin", "forgot-password"] }
            }
          },
          {
            name: "Verify Password Reset OTP",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ email: "admin@merqora.com", otp: "123456" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/password/otp/verify", host: ["{{base_url}}"], path: ["api", "v1", "admin", "password", "otp", "verify"] }
            }
          },
          {
            name: "Resend Password Reset OTP",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ email: "admin@merqora.com" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/password/otp/resend", host: ["{{base_url}}"], path: ["api", "v1", "admin", "password", "otp", "resend"] }
            }
          },
          {
            name: "Reset Password (Set New)",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ email: "admin@merqora.com", resetToken: "reset-token-xyz", newPassword: "NewSecurePassword@123" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/reset-password", host: ["{{base_url}}"], path: ["api", "v1", "admin", "reset-password"] }
            }
          }
        ]
      },

      // 3. ADMIN 2FA & SECURITY MUTATIONS
      {
        name: "3. Admin 2FA & Security Mutations",
        description: "Multi-factor email and password modification sessions with state validation.",
        item: [
          {
            name: "Initiate Email Change",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ newEmail: "newadmin@merqora.com" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/email/change", host: ["{{base_url}}"], path: ["api", "v1", "admin", "email", "change"] }
            }
          },
          {
            name: "Verify Old Email OTP",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ sessionId: "{{session_id}}", otp: "123456" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/email/verify-old-otp", host: ["{{base_url}}"], path: ["api", "v1", "admin", "email", "verify-old-otp"] }
            }
          },
          {
            name: "Verify New Email OTP",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ sessionId: "{{session_id}}", otp: "654321" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/email/verify-new-otp", host: ["{{base_url}}"], path: ["api", "v1", "admin", "email", "verify-new-otp"] }
            }
          },
          {
            name: "Resend Email Change OTP",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ sessionId: "{{session_id}}", type: "old" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/email/resend-otp", host: ["{{base_url}}"], path: ["api", "v1", "admin", "email", "resend-otp"] }
            }
          },
          {
            name: "Get Email Change Session",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/email/session/{{session_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "email", "session", "{{session_id}}"] }
            }
          },
          {
            name: "Initiate Password Change",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ currentPassword: "OldPassword@123", newPassword: "NewSecurePassword@123" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/change-password", host: ["{{base_url}}"], path: ["api", "v1", "admin", "change-password"] }
            }
          },
          {
            name: "Verify Change Password OTP",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ otp: "123456" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/change-password/verify-otp", host: ["{{base_url}}"], path: ["api", "v1", "admin", "change-password", "verify-otp"] }
            }
          },
          {
            name: "Resend Change Password OTP",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/change-password/resend-otp", host: ["{{base_url}}"], path: ["api", "v1", "admin", "change-password", "resend-otp"] }
            }
          }
        ]
      },

      // 4. USER & INSTRUCTOR OPERATIONS
      {
        name: "4. User & Instructor Operations",
        description: "User directory governance, role status toggling, and instructor application approvals.",
        item: [
          {
            name: "Get Paginated Users List",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: {
                raw: "{{base_url}}/api/v1/admin/users?page=0&size=10",
                host: ["{{base_url}}"],
                path: ["api", "v1", "admin", "users"],
                query: [
                  { key: "page", value: "0" },
                  { key: "size", value: "10" }
                ]
              }
            }
          },
          {
            name: "Get User By ID",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/users/{{user_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "users", "{{user_id}}"] }
            }
          },
          {
            name: "Update User Status (Toggle Active/Inactive)",
            request: {
              method: "PUT",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ status: "ACTIVE" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/users/{{user_id}}/status", host: ["{{base_url}}"], path: ["api", "v1", "admin", "users", "{{user_id}}", "status"] }
            }
          },
          {
            name: "Delete User",
            request: {
              method: "DELETE",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/users/{{user_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "users", "{{user_id}}"] }
            }
          },
          {
            name: "Get All Instructors",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/instructors", host: ["{{base_url}}"], path: ["api", "v1", "admin", "instructors"] }
            }
          },
          {
            name: "Get Instructor By ID",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/instructors/{{instructor_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "instructors", "{{instructor_id}}"] }
            }
          },
          {
            name: "Get Instructor Applications Ledger",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: {
                raw: "{{base_url}}/api/v1/admin/instructors/applications?status=PENDING&page=0&size=10",
                host: ["{{base_url}}"],
                path: ["api", "v1", "admin", "instructors", "applications"],
                query: [
                  { key: "status", value: "PENDING" },
                  { key: "page", value: "0" },
                  { key: "size", value: "10" }
                ]
              }
            }
          },
          {
            name: "Approve Instructor Application",
            request: {
              method: "PUT",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/instructors/applications/{{application_id}}/approve", host: ["{{base_url}}"], path: ["api", "v1", "admin", "instructors", "applications", "{{application_id}}", "approve"] }
            }
          },
          {
            name: "Reject Instructor Application",
            request: {
              method: "PUT",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ reason: "Qualifications do not match minimum threshold" }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/instructors/applications/{{application_id}}/reject", host: ["{{base_url}}"], path: ["api", "v1", "admin", "instructors", "applications", "{{application_id}}", "reject"] }
            }
          },
          {
            name: "Delete Instructor Profile",
            request: {
              method: "DELETE",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/instructors/{{instructor_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "instructors", "{{instructor_id}}"] }
            }
          },
          {
            name: "Refresh User Eligibility (Internal)",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/internal/users/{{user_id}}/refresh-eligibility", host: ["{{base_url}}"], path: ["api", "v1", "admin", "internal", "users", "{{user_id}}", "refresh-eligibility"] }
            }
          },
          {
            name: "Get Current Admin Profile",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/me", host: ["{{base_url}}"], path: ["api", "v1", "admin", "me"] }
            }
          }
        ]
      },

      // 5. FINANCIAL & ORDER PROCESSING
      {
        name: "5. Financial & Order Processing",
        description: "Payment transaction ledger, order management, and refund processing.",
        item: [
          {
            name: "Get Paginated Payments Ledger",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: {
                raw: "{{base_url}}/api/v1/admin/payments?page=0&size=10",
                host: ["{{base_url}}"],
                path: ["api", "v1", "admin", "payments"],
                query: [
                  { key: "page", value: "0" },
                  { key: "size", value: "10" }
                ]
              }
            }
          },
          {
            name: "Get Payment By ID",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/payments/{{payment_id}}", host: ["{{base_url}}"], path: ["api", "v1", "admin", "payments", "{{payment_id}}"] }
            }
          },
          {
            name: "Get Paginated Orders Ledger",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: {
                raw: "{{base_url}}/api/v1/admin/orders?page=0&size=10",
                host: ["{{base_url}}"],
                path: ["api", "v1", "admin", "orders"],
                query: [
                  { key: "page", value: "0" },
                  { key: "size", value: "10" }
                ]
              }
            }
          },
          {
            name: "Process Order Refund (Transactional Boundary)",
            request: {
              method: "POST",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/orders/{{order_id}}/refund", host: ["{{base_url}}"], path: ["api", "v1", "admin", "orders", "{{order_id}}", "refund"] }
            }
          }
        ]
      },

      // 6. REPORTS & SYSTEM BROADCASTS
      {
        name: "6. Reports & System Broadcasts",
        description: "Multi-tenant aggregate analytics, system broadcast dispatches, and global platform configuration.",
        item: [
          {
            name: "Get Users Analytics Report",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/reports/users", host: ["{{base_url}}"], path: ["api", "v1", "admin", "reports", "users"] }
            }
          },
          {
            name: "Get Courses Analytics Report",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/reports/courses", host: ["{{base_url}}"], path: ["api", "v1", "admin", "reports", "courses"] }
            }
          },
          {
            name: "Get Revenue Analytics Report",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/reports/revenue", host: ["{{base_url}}"], path: ["api", "v1", "admin", "reports", "revenue"] }
            }
          },
          {
            name: "Get Orders Analytics Report",
            request: {
              method: "GET",
              header: [{ key: "Authorization", value: "Bearer {{admin_token}}" }],
              url: { raw: "{{base_url}}/api/v1/admin/reports/orders", host: ["{{base_url}}"], path: ["api", "v1", "admin", "reports", "orders"] }
            }
          },
          {
            name: "Update Platform Settings",
            request: {
              method: "PUT",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ platformName: "CyberLearnix Enterprise", maintenanceMode: false }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/settings/platform", host: ["{{base_url}}"], path: ["api", "v1", "admin", "settings", "platform"] }
            }
          },
          {
            name: "Update Payment Settings",
            request: {
              method: "PUT",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({ currency: "INR", gatewayTimeoutSeconds: 30 }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/settings/payment", host: ["{{base_url}}"], path: ["api", "v1", "admin", "settings", "payment"] }
            }
          },
          {
            name: "Dispatch System Broadcast Notification",
            request: {
              method: "POST",
              header: [
                { key: "Content-Type", value: "application/json" },
                { key: "Authorization", value: "Bearer {{admin_token}}" }
              ],
              body: {
                mode: "raw",
                raw: JSON.stringify({
                  title: "Platform Maintenance Notification",
                  message: "Routine database optimization scheduled for 02:00 UTC.",
                  channel: "EMAIL"
                }, null, 2)
              },
              url: { raw: "{{base_url}}/api/v1/admin/broadcast", host: ["{{base_url}}"], path: ["api", "v1", "admin", "broadcast"] }
            }
          }
        ]
      }
    ]
  };

  const outputLms = 'c:/Users/SHIVASAI/OneDrive/Desktop/LMS/postman/CyberLearnix_Admin_Platform.postman_collection.json';
  const outputUi = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/docs/CyberLearnix_Admin_Platform.postman_collection.json';

  fs.writeFileSync(outputLms, JSON.stringify(collection, null, 2), 'utf8');
  fs.writeFileSync(outputUi, JSON.stringify(collection, null, 2), 'utf8');
  console.log(`✅ Postman Collection written to:\n  - ${outputLms}\n  - ${outputUi}`);
}

generatePostmanCollection();

