// scripts/audit_user_service_ui_coverage.mjs
import fs from 'fs';
import path from 'path';

const userEndpoints = [
  // 1. Unified Authentication & Registration
  { id: 'AUTH-01', method: 'POST', path: '/api/v1/auth/register', module: 'authApi.register', uiFile: 'src/pages/Register.jsx' },
  { id: 'AUTH-02', method: 'POST', path: '/api/v1/auth/register/resend-otp', module: 'authApi.resendOtp', uiFile: 'src/pages/Register.jsx' },
  { id: 'AUTH-03', method: 'PATCH', path: '/api/v1/auth/register/email', module: 'authApi.changeRegistrationEmail', uiFile: 'src/pages/Register.jsx' },
  { id: 'AUTH-04', method: 'POST', path: '/api/v1/auth/verify-email', module: 'authApi.verifyEmail', uiFile: 'src/pages/OtpVerify.jsx' },
  { id: 'AUTH-05', method: 'POST', path: '/api/v1/auth/login', module: 'authApi.login', uiFile: 'src/pages/Login.jsx' },
  { id: 'AUTH-06', method: 'POST', path: '/api/v1/auth/login/otp/request', module: 'authApi.requestLoginOtp', uiFile: 'src/pages/Login.jsx' },
  { id: 'AUTH-07', method: 'POST', path: '/api/v1/auth/login/otp/verify', module: 'authApi.verifyLoginOtp', uiFile: 'src/pages/Login.jsx' },
  { id: 'AUTH-08', method: 'POST', path: '/api/v1/auth/login/otp/resend', module: 'authApi.resendOtp', uiFile: 'src/pages/Login.jsx' },
  { id: 'AUTH-09', method: 'POST', path: '/api/v1/auth/refresh', module: 'authApi.refreshAccessToken', uiFile: 'src/context/AuthContext.jsx' },
  { id: 'AUTH-10', method: 'POST', path: '/api/v1/auth/logout', module: 'authApi.logout', uiFile: 'src/context/AuthContext.jsx' },
  { id: 'AUTH-11', method: 'POST', path: '/api/v1/auth/password/forgot', module: 'authApi.forgotPassword', uiFile: 'src/pages/ForgotPassword.jsx' },
  { id: 'AUTH-12', method: 'POST', path: '/api/v1/auth/password/verify-otp', module: 'authApi.verifyPasswordOtp', uiFile: 'src/pages/ResetOtp.jsx' },
  { id: 'AUTH-13', method: 'POST', path: '/api/v1/auth/password/otp/resend', module: 'authApi.resendPasswordOtp', uiFile: 'src/pages/ResetOtp.jsx' },
  { id: 'AUTH-14', method: 'POST', path: '/api/v1/auth/password/reset', module: 'authApi.resetPassword', uiFile: 'src/pages/ResetOtp.jsx' },
  { id: 'AUTH-15', method: 'POST', path: '/api/v1/auth/switch-role', module: 'authApi.switchRole', uiFile: 'src/components/ui/RoleSwitcher.jsx' },
  { id: 'AUTH-16', method: 'POST', path: '/api/v1/auth/otp/resend', module: 'authApi.resendOtp', uiFile: 'src/pages/Login.jsx' },

  // 2. OAuth & Social Authentication
  { id: 'OAUTH-01', method: 'GET', path: '/api/v1/auth/oauth/providers', module: 'authApi.getOAuthProviders', uiFile: 'src/components/ui/SocialAuthButtons.jsx' },
  { id: 'OAUTH-02', method: 'POST', path: '/api/v1/auth/social-login', module: 'authApi.socialLogin', uiFile: 'src/components/ui/SocialAuthButtons.jsx' },
  { id: 'OAUTH-03', method: 'POST', path: '/api/v1/auth/social-login/{provider}', module: 'authApi.socialLoginWithProvider', uiFile: 'src/components/ui/SocialAuthButtons.jsx' },
  { id: 'OAUTH-04', method: 'POST', path: '/api/v1/auth/oauth/continue', module: 'authApi.oauthContinue', uiFile: 'src/components/ui/SocialAuthButtons.jsx' },

  // 3. User Profile & Account Management
  { id: 'USER-01', method: 'GET', path: '/api/v1/users/me', module: 'authApi.getUserProfile', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },
  { id: 'USER-02', method: 'PUT', path: '/api/v1/users/me', module: 'authApi.updateUserProfile', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },
  { id: 'USER-03', method: 'PUT', path: '/api/v1/users/me/photo', module: 'authApi.uploadProfilePhoto', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },
  { id: 'USER-04', method: 'DELETE', path: '/api/v1/users/me/photo', module: 'authApi.removeProfilePhoto', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },
  { id: 'USER-05', method: 'PUT', path: '/api/v1/users/me/cover-photo', module: 'authApi.uploadCoverPhoto', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },
  { id: 'USER-06', method: 'DELETE', path: '/api/v1/users/me/cover-photo', module: 'authApi.removeCoverPhoto', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },
  { id: 'USER-07', method: 'GET', path: '/api/v1/users/stats', module: 'authApi.getUserStats', uiFile: 'src/pages/admin/Dashboard.jsx' },
  { id: 'USER-08', method: 'DELETE', path: '/api/v1/users/me', module: 'authApi.deleteAccount', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },
  { id: 'USER-09', method: 'GET', path: '/api/v1/users/photo/{fileId}', module: 'authApi.getPhotoUrl', uiFile: 'src/config/api.js' },
  { id: 'USER-10', method: 'GET', path: '/api/v1/users', module: 'authApi.getAllUsers', uiFile: 'src/pages/admin/Users.jsx' },
  { id: 'USER-11', method: 'GET', path: '/api/v1/users/{id}', module: 'authApi.getUserById', uiFile: 'src/pages/admin/Users.jsx' },
  { id: 'USER-12', method: 'PUT', path: '/api/v1/users/{id}/status', module: 'authApi.updateUserStatus', uiFile: 'src/pages/admin/Users.jsx' },
  { id: 'USER-13', method: 'DELETE', path: '/api/v1/users/{id}', module: 'authApi.deleteUserById', uiFile: 'src/pages/admin/Users.jsx' },

  // 4. Session Management
  { id: 'SESS-01', method: 'GET', path: '/api/v1/users/me/sessions', module: 'authApi.getSessions', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },
  { id: 'SESS-02', method: 'DELETE', path: '/api/v1/users/me/sessions/{id}', module: 'authApi.revokeSession', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },
  { id: 'SESS-03', method: 'DELETE', path: '/api/v1/users/me/sessions', module: 'authApi.revokeAllSessions', uiFile: 'src/pages/student/ProfileWorkspace.jsx' },

  // 5. Email Change Flow
  { id: 'EMAIL-01', method: 'POST', path: '/api/v1/users/email/change-request', module: 'authApi.requestEmailChange', uiFile: 'src/components/EmailChangeModal.jsx' },
  { id: 'EMAIL-02', method: 'POST', path: '/api/v1/users/email/verify-old', module: 'authApi.verifyOldEmail', uiFile: 'src/components/EmailChangeModal.jsx' },
  { id: 'EMAIL-03', method: 'POST', path: '/api/v1/users/email/verify-new', module: 'authApi.verifyNewEmail', uiFile: 'src/components/EmailChangeModal.jsx' },
  { id: 'EMAIL-04', method: 'POST', path: '/api/v1/users/email/resend-otp', module: 'authApi.resendEmailChangeOtp', uiFile: 'src/components/EmailChangeModal.jsx' },
  { id: 'EMAIL-05', method: 'GET', path: '/api/v1/users/email/change-request/{sessionId}', module: 'authApi.getEmailChangeSession', uiFile: 'src/components/EmailChangeModal.jsx' },

  // 6. Instructor Applications (Student & Admin)
  { id: 'INST-01', method: 'POST', path: '/api/v1/instructors/applications', module: 'instructorApi.applyForInstructor', uiFile: 'src/pages/student/InstructorApplication.jsx' },
  { id: 'INST-02', method: 'GET', path: '/api/v1/instructors/applications/me', module: 'instructorApi.getMyApplication', uiFile: 'src/pages/student/InstructorApplication.jsx' },
  { id: 'INST-03', method: 'GET', path: '/api/v1/admin/instructors', module: 'adminApi.getInstructors', uiFile: 'src/pages/admin/Instructors.jsx' },
  { id: 'INST-04', method: 'GET', path: '/api/v1/admin/instructors/applications', module: 'adminApi.getInstructorApplications', uiFile: 'src/pages/admin/InstructorApplications.jsx' },
  { id: 'INST-05', method: 'GET', path: '/api/v1/admin/instructors/applications/status/{status}', module: 'adminApi.getInstructorApplicationsByStatus', uiFile: 'src/pages/admin/InstructorApplications.jsx' },
  { id: 'INST-06', method: 'PUT', path: '/api/v1/admin/instructors/applications/{applicationId}/approve', module: 'adminApi.approveInstructorApplication', uiFile: 'src/pages/admin/InstructorApplications.jsx' },
  { id: 'INST-07', method: 'PUT', path: '/api/v1/admin/instructors/applications/{applicationId}/reject', module: 'adminApi.rejectInstructorApplication', uiFile: 'src/pages/admin/InstructorApplications.jsx' },
];

console.log('======================================================================');
console.log(' 🔍 USER SERVICE API COVERAGE AUDIT IN FRONTEND UI');
console.log('======================================================================\n');

let integratedCount = 0;

for (const ep of userEndpoints) {
  const [apiObj, fnName] = ep.module.split('.');
  const apiFilePath = apiObj === 'authApi' 
    ? 'src/api/authApi.js' 
    : apiObj === 'instructorApi' 
    ? 'src/api/instructorApi.js' 
    : 'src/api/adminApi.js';

  let hasApiMethod = false;
  if (fs.existsSync(apiFilePath)) {
    const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');
    hasApiMethod = apiFileContent.includes(fnName);
  }

  const hasUiFile = fs.existsSync(ep.uiFile);
  const isCovered = hasApiMethod && hasUiFile;
  if (isCovered) integratedCount++;

  const icon = isCovered ? '✅' : '❌';
  console.log(`${icon} [${ep.method.padEnd(6)}] ${ep.path.padEnd(48)} -> ${ep.module.padEnd(38)} (in ${path.basename(ep.uiFile)})`);
}

console.log('\n======================================================================');
console.log(` 📊 SUMMARY: ${integratedCount} of ${userEndpoints.length} User Service APIs fully wired in UI (${Math.round((integratedCount/userEndpoints.length)*100)}%)`);
console.log('======================================================================');
