// scripts/test_all_user_service_apis.mjs
import axios from 'axios';

const BASE_URL = process.env.USER_SERVICE_URL || 'http://localhost:8080';
const MAILHOG_URL = 'http://localhost:8025';

console.log(`\n=============================================================`);
console.log(` 🧪 EXHAUSTIVE USER SERVICE API VERIFICATION SUITE`);
console.log(` 🌐 Target Gateway / Service URL: ${BASE_URL}`);
console.log(`=============================================================\n`);

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true,
});

async function getRealOtpFromMailHog(toEmail) {
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise(r => setTimeout(r, 600));
    try {
      const res = await axios.get(`${MAILHOG_URL}/api/v2/messages`);
      const messages = res.data?.items || [];
      for (const msg of messages) {
        const recipient = msg.To?.[0]?.Mailbox + '@' + msg.To?.[0]?.Domain;
        if (recipient.toLowerCase() === toEmail.toLowerCase()) {
          const body = msg.Content?.Body || '';
          const match = body.match(/class=3D["']otp-box["'][^>]*>([\s\S]*?)<\/div>/i);
          if (match) {
            return match[1].replace(/[^0-9]/g, '');
          }
        }
      }
    } catch { /* ignore */ }
  }
  return null;
}

const report = [];

function recordTest(category, name, method, path, response, expectedStatuses = [200, 201]) {
  const isSuccess = expectedStatuses.includes(response.status);
  const result = {
    category,
    name,
    method,
    path,
    status: response.status,
    success: isSuccess,
    dataSnippet: typeof response.data === 'object' 
      ? (response.data?.message || (response.data?.success !== undefined ? `success: ${response.data.success}` : JSON.stringify(response.data).slice(0, 80))) 
      : String(response.data).slice(0, 80),
  };
  report.push(result);
  const icon = isSuccess ? '✅' : '❌';
  console.log(`${icon} [${method}] ${path} -> HTTP ${response.status} (${name}) | ${result.dataSnippet}`);
  return response;
}

async function run() {
  const timestamp = Date.now().toString(36);
  const testEmail = `user.${timestamp}@cyberlearnix.io`;
  const testPassword = 'Password@123';
  let token = null;
  let refreshToken = null;
  let userId = null;
  let otpSessionId = null;

  // 1. Health & OAuth Metadata
  console.log('\n--- 1. Health & OAuth Metadata ---');
  let res = await client.get('/actuator/health');
  recordTest('Health', 'Actuator Health Check', 'GET', '/actuator/health', res, [200]);

  res = await client.get('/api/v1/auth/oauth/providers');
  recordTest('OAuth', 'Get OAuth Providers', 'GET', '/api/v1/auth/oauth/providers', res, [200]);

  // 2. Social Authentication
  console.log('\n--- 2. Social Authentication Endpoints ---');
  const googlePayload = {
    provider: 'google',
    email: `google.${timestamp}@cyberlearnix.io`,
    firstName: 'Google',
    lastName: 'User',
    providerId: `g-${timestamp}`
  };
  res = await client.post('/api/v1/auth/social-login', googlePayload);
  recordTest('Social Auth', 'Social Login (Google)', 'POST', '/api/v1/auth/social-login', res, [200, 201]);

  const githubPayload = {
    provider: 'github',
    email: `github.${timestamp}@cyberlearnix.io`,
    firstName: 'GitHub',
    lastName: 'Developer',
    providerId: `gh-${timestamp}`
  };
  res = await client.post('/api/v1/auth/social-login/github', githubPayload);
  recordTest('Social Auth', 'Social Login Path Variant (GitHub)', 'POST', '/api/v1/auth/social-login/github', res, [200, 201]);

  const linkedinPayload = {
    provider: 'linkedin',
    email: `linkedin.${timestamp}@cyberlearnix.io`,
    firstName: 'LinkedIn',
    lastName: 'Professional',
    providerId: `li-${timestamp}`
  };
  res = await client.post('/api/v1/auth/social-login/linkedin', linkedinPayload);
  recordTest('Social Auth', 'Social Login Path Variant (LinkedIn)', 'POST', '/api/v1/auth/social-login/linkedin', res, [200, 201]);

  res = await client.post('/api/v1/auth/oauth/continue', googlePayload);
  recordTest('Social Auth', 'OAuth Continue Alias', 'POST', '/api/v1/auth/oauth/continue', res, [200]);

  // 3. Registration Flow with Live OTP
  console.log('\n--- 3. Registration Flow ---');
  res = await client.post('/api/v1/auth/register', {
    firstName: 'Automation',
    lastName: 'Tester',
    email: testEmail,
    password: testPassword,
    confirmPassword: testPassword
  });
  recordTest('Registration', 'Register Account (JSON)', 'POST', '/api/v1/auth/register', res, [200, 201]);
  otpSessionId = res.data?.otpSessionId || res.data?.data?.otpSessionId;

  // Intercept OTP from MailHog
  const liveOtp = await getRealOtpFromMailHog(testEmail);

  // Verify Email with real OTP
  res = await client.post('/api/v1/auth/verify-email', {
    email: testEmail,
    otp: liveOtp || '123456',
    otpSessionId
  });
  recordTest('Registration', 'Verify Email OTP', 'POST', '/api/v1/auth/verify-email', res, [200]);

  // 4. Unified Authentication & Login
  console.log('\n--- 4. Authentication & Token Management ---');
  res = await client.post('/api/v1/auth/login', {
    email: testEmail,
    password: testPassword
  });
  recordTest('Authentication', 'Login with Verified Account', 'POST', '/api/v1/auth/login', res, [200]);
  token = res.data?.authentication?.accessToken;
  refreshToken = res.data?.authentication?.refreshToken;
  userId = res.data?.user?.id;

  const authHeaders = { Authorization: `Bearer ${token}` };

  // Negative validation test
  res = await client.post('/api/v1/auth/login', { email: testEmail, password: 'wrong_password' });
  recordTest('Authentication', 'Invalid Credentials Validation', 'POST', '/api/v1/auth/login', res, [401]);

  // Request Login OTP
  res = await client.post('/api/v1/auth/login/otp/request', { email: testEmail });
  recordTest('Authentication', 'Request Login OTP', 'POST', '/api/v1/auth/login/otp/request', res, [200]);
  const loginOtpSessionId = res.data?.otpSessionId || res.data?.data?.otpSessionId;

  // Intercept login OTP
  const loginOtp = await getRealOtpFromMailHog(testEmail);
  if (loginOtp && loginOtpSessionId) {
    res = await client.post('/api/v1/auth/login/otp/verify', {
      email: testEmail,
      otp: loginOtp,
      otpSessionId: loginOtpSessionId
    });
    recordTest('Authentication', 'Verify Login OTP Code', 'POST', '/api/v1/auth/login/otp/verify', res, [200]);
  }

  // Refresh Token
  if (refreshToken) {
    res = await client.post('/api/v1/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` }
    });
    recordTest('Authentication', 'Refresh Access Token', 'POST', '/api/v1/auth/refresh', res, [200]);
    if (res.data?.authentication?.accessToken) {
      token = res.data.authentication.accessToken;
      authHeaders.Authorization = `Bearer ${token}`;
    }
  }

  // Switch Role
  res = await client.post('/api/v1/auth/switch-role', { role: 'STUDENT' }, { headers: authHeaders });
  recordTest('Authentication', 'Switch User Role', 'POST', '/api/v1/auth/switch-role', res, [200, 400]);

  // 5. Password Reset Flow
  console.log('\n--- 5. Password Reset Flow ---');
  res = await client.post('/api/v1/auth/password/forgot', { email: testEmail });
  recordTest('Password Reset', 'Forgot Password Request', 'POST', '/api/v1/auth/password/forgot', res, [200]);
  const resetOtpSessionId = res.data?.otpSessionId || res.data?.data?.otpSessionId;

  const resetOtp = await getRealOtpFromMailHog(testEmail);
  if (resetOtp && resetOtpSessionId) {
    res = await client.post('/api/v1/auth/password/verify-otp', {
      email: testEmail,
      otp: resetOtp,
      otpSessionId: resetOtpSessionId
    });
    recordTest('Password Reset', 'Verify Reset OTP', 'POST', '/api/v1/auth/password/verify-otp', res, [200]);

    res = await client.post('/api/v1/auth/password/reset', {
      email: testEmail,
      otp: resetOtp,
      otpSessionId: resetOtpSessionId,
      newPassword: 'UpdatedPassword@2026',
      confirmPassword: 'UpdatedPassword@2026'
    });
    recordTest('Password Reset', 'Submit Password Reset', 'POST', '/api/v1/auth/password/reset', res, [200]);
  }

  // 6. User Profile & Management
  console.log('\n--- 6. User Profile & Management ---');
  res = await client.get('/api/v1/users/me', { headers: authHeaders });
  recordTest('User Profile', 'Get Current Profile (Me)', 'GET', '/api/v1/users/me', res, [200]);

  res = await client.put('/api/v1/users/me', {
    firstName: 'UpdatedAutomation',
    lastName: 'Engineer'
  }, { headers: authHeaders });
  recordTest('User Profile', 'Update Current Profile (Me)', 'PUT', '/api/v1/users/me', res, [200]);

  res = await client.get('/api/v1/users', { headers: authHeaders });
  recordTest('User Management', 'List All Users', 'GET', '/api/v1/users', res, [200]);

  if (userId) {
    res = await client.get(`/api/v1/users/${userId}`, { headers: authHeaders });
    recordTest('User Management', 'Get User by ID', 'GET', `/api/v1/users/${userId}`, res, [200]);

    res = await client.put(`/api/v1/users/${userId}/status`, { status: 'ACTIVE' }, { headers: authHeaders });
    recordTest('User Management', 'Update User Status', 'PUT', `/api/v1/users/${userId}/status`, res, [200]);
  }

  // 7. Active Sessions Management
  console.log('\n--- 7. Session Management ---');
  res = await client.get('/api/v1/users/me/sessions', { headers: authHeaders });
  recordTest('Sessions', 'Get Active Sessions', 'GET', '/api/v1/users/me/sessions', res, [200]);

  let activeSessionId = null;
  if (Array.isArray(res.data) && res.data.length > 0) activeSessionId = res.data[0]?.id;
  else if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) activeSessionId = res.data.data[0]?.id;

  if (activeSessionId) {
    res = await client.delete(`/api/v1/users/me/sessions/${activeSessionId}`, { headers: authHeaders });
    recordTest('Sessions', 'Revoke Specific Session', 'DELETE', `/api/v1/users/me/sessions/${activeSessionId}`, res, [200]);
  }

  // 8. Instructor Applications
  console.log('\n--- 8. Instructor Applications ---');
  res = await client.get('/api/v1/instructors/applications/me', { headers: authHeaders });
  recordTest('Instructor', 'Get My Instructor Application', 'GET', '/api/v1/instructors/applications/me', res, [200, 404]);

  // 9. Logout
  console.log('\n--- 9. Logout & Token Revocation ---');
  res = await client.post('/api/v1/auth/logout', { refreshToken: refreshToken || '' }, { headers: authHeaders });
  recordTest('Authentication', 'Logout (Revoke Tokens)', 'POST', '/api/v1/auth/logout', res, [200]);

  // Final Summary
  const total = report.length;
  const passed = report.filter(r => r.success).length;
  const failed = total - passed;

  console.log(`\n=============================================================`);
  console.log(` 📊 USER SERVICE TEST EXECUTION SUMMARY`);
  console.log(`=============================================================`);
  console.log(` Total APIs Tested:    ${total}`);
  console.log(` Succeeded / Handled:  ${passed} (${Math.round((passed/total)*100)}%)`);
  console.log(` Failed / Anomalous:   ${failed}`);
  console.log(`=============================================================\n`);
}

run().catch(console.error);
