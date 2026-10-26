// scripts/e2e-live-runtime-test.mjs
// End-to-End Live Runtime Verification for ASIVO LMS

import axios from 'axios';

const BASE_URL = 'http://localhost:8080';
const MAILHOG_URL = 'http://localhost:8025/api/v2/messages';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  validateStatus: () => true,
});

const timestamp = Date.now();
const testEmail = `student_${timestamp}@cyberlearnix.dev`;
const testPassword = `Student@Pass${timestamp % 10000}!`;
const testName = `Runtime Student ${timestamp % 1000}`;

const results = [];

function record(name, endpoint, status, pass, notes = '') {
  results.push({ name, endpoint, status, pass, notes });
  const icon = pass ? '✅' : '❌';
  console.log(`${icon} [${status}] ${name} (${endpoint}) ${notes ? ' - ' + notes : ''}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log(`\n======================================================`);
  console.log(` Starting ASIVO LMS Live Runtime Integration Tests`);
  console.log(` Gateway: ${BASE_URL}`);
  console.log(` Test User: ${testEmail}`);
  console.log(`======================================================\n`);

  // 1. Health check / Root
  const publicCourses = await client.get('/api/v1/courses', { params: { page: 0, size: 5 } });
  record(
    'Course Catalog (Public)',
    'GET /api/v1/courses',
    publicCourses.status,
    publicCourses.status === 200,
    `Courses found: ${publicCourses.data?.data?.content?.length || publicCourses.data?.content?.length || 0}`
  );

  // 2. Register new student
  const regPayload = {
    firstName: 'Runtime',
    lastName: 'Student',
    email: testEmail,
    password: testPassword,
    confirmPassword: testPassword,
  };
  const formData = new FormData();
  formData.append('data', JSON.stringify(regPayload));

  const regRes = await client.post('/api/v1/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const otpSessionId = regRes.data?.otpSessionId || regRes.data?.sessionId || regRes.data?.data?.otpSessionId || '';
  record(
    'User Registration',
    'POST /api/v1/auth/register',
    regRes.status,
    (regRes.status === 200 || regRes.status === 201) && Boolean(otpSessionId),
    `OTP Session: ${otpSessionId}`
  );

  // 3. Retrieve OTP from Mailhog
  await sleep(1500);
  let otp = null;
  try {
    const mailRes = await axios.get(MAILHOG_URL);
    const messages = mailRes.data?.items || [];
    for (const msg of messages) {
      const recipient = msg?.To?.[0]?.Mailbox + '@' + msg?.To?.[0]?.Domain;
      if (recipient.toLowerCase() === testEmail.toLowerCase()) {
        const body = msg?.Content?.Body || '';
        const match = body.match(/otp-box["']?>(\d{6})</i) || body.match(/>(\d{6})</);
        if (match) {
          otp = match[1];
          break;
        }
      }
    }
  } catch (err) {
    console.warn('Mailhog query error:', err.message);
  }

  record(
    'OTP Extraction from Mailhog',
    'GET /api/v2/messages (Mailhog)',
    otp ? 200 : 404,
    Boolean(otp),
    otp ? 'OTP retrieved successfully (value protected: [REDACTED])' : 'Could not find OTP in Mailhog messages'
  );

  // 4. Verify Email
  if (otp) {
    const verifyRes = await client.post('/api/v1/auth/verify-email', {
      email: testEmail,
      otp: otp,
      otpSessionId: otpSessionId,
    });
    record(
      'Verify Email with OTP',
      'POST /api/v1/auth/verify-email',
      verifyRes.status,
      verifyRes.status === 200,
      verifyRes.data?.message || 'Email verified'
    );
  }

  // 5. Login
  const loginRes = await client.post('/api/v1/auth/login', {
    email: testEmail,
    password: testPassword,
  });

  const accessToken =
    loginRes.data?.authentication?.accessToken ||
    loginRes.data?.accessToken ||
    loginRes.data?.token ||
    loginRes.data?.access_token ||
    null;

  const refreshToken =
    loginRes.data?.authentication?.refreshToken ||
    loginRes.data?.refreshToken ||
    loginRes.data?.refresh_token ||
    null;

  const userId =
    loginRes.data?.user?.id ||
    loginRes.data?.user?.userId ||
    loginRes.data?.id ||
    null;

  record(
    'Student Login',
    'POST /api/v1/auth/login',
    loginRes.status,
    loginRes.status === 200 && Boolean(accessToken),
    accessToken ? `Token received, UserId: ${userId}` : 'No token received'
  );

  if (!accessToken) {
    console.error('\nCannot proceed without accessToken. Ending authenticated test.');
    printSummary();
    return;
  }

  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
  };

  // 6. Get User Profile
  const profileRes = await client.get('/api/v1/users/me', { headers: authHeaders });
  record(
    'Get Profile (/users/me)',
    'GET /api/v1/users/me',
    profileRes.status,
    profileRes.status === 200,
    `Email: ${profileRes.data?.data?.email || profileRes.data?.email || 'N/A'}`
  );

  // 7. Get Active Sessions
  const sessionsRes = await client.get('/api/v1/users/me/sessions', { headers: authHeaders });
  record(
    'Get Active Sessions',
    'GET /api/v1/users/me/sessions',
    sessionsRes.status,
    sessionsRes.status === 200,
    `Sessions count: ${Array.isArray(sessionsRes.data?.data) ? sessionsRes.data.data.length : 'N/A'}`
  );

  // 8. Get Single Course Details
  const courseDetailRes = await client.get('/api/v1/courses/1');
  record(
    'Get Course Detail',
    'GET /api/v1/courses/1',
    courseDetailRes.status,
    courseDetailRes.status === 200 || courseDetailRes.status === 404,
    courseDetailRes.status === 200 ? `Title: ${courseDetailRes.data?.data?.title || 'OK'}` : 'Course 1 not seeded'
  );

  // 9. Add to Wishlist
  const addWishlistRes = await client.post('/api/v1/wishlist', { courseId: 1, instructorId: 1 }, { headers: authHeaders });
  record(
    'Add to Wishlist',
    'POST /api/v1/wishlist',
    addWishlistRes.status,
    addWishlistRes.status === 200 || addWishlistRes.status === 201,
    `Wishlist response: ${addWishlistRes.status}`
  );

  // 10. Get Wishlist
  const getWishlistRes = await client.get('/api/v1/wishlist', { headers: authHeaders });
  record(
    'Get Wishlist',
    'GET /api/v1/wishlist',
    getWishlistRes.status,
    getWishlistRes.status === 200,
    `Wishlist items: ${getWishlistRes.data?.data?.items?.length || getWishlistRes.data?.length || 0}`
  );

  // 11. Add to Cart (requires courseId and instructorId)
  const addCartRes = await client.post('/api/v1/cart', { courseId: 1, instructorId: 1 }, { headers: authHeaders });
  record(
    'Add to Cart',
    'POST /api/v1/cart',
    addCartRes.status,
    addCartRes.status === 200 || addCartRes.status === 201,
    `Cart response: ${addCartRes.status}`
  );

  // 12. Get Cart
  const getCartRes = await client.get('/api/v1/cart', { headers: authHeaders });
  const cartCourses = getCartRes.data?.data?.courses || getCartRes.data?.courses || [];
  record(
    'Get Cart',
    'GET /api/v1/cart',
    getCartRes.status,
    getCartRes.status === 200 && cartCourses.length > 0,
    `Cart items: ${cartCourses.length} (Course: "${cartCourses[0]?.title || cartCourses[0]?.courseName || 'N/A'}")`
  );

  // 13. Get Notification Preferences
  const getPrefsRes = await client.get('/api/v1/preferences', { headers: authHeaders });
  record(
    'Get Notification Preferences',
    'GET /api/v1/preferences',
    getPrefsRes.status,
    getPrefsRes.status === 200 || getPrefsRes.status === 404,
    getPrefsRes.status === 200 ? 'Preferences retrieved' : 'Default preferences'
  );

  // 14. Update Notification Preferences
  const updatePrefsRes = await client.put(
    '/api/v1/preferences',
    {
      emailNotifications: true,
      pushNotifications: false,
      inAppNotifications: true,
      courseUpdates: true,
    },
    { headers: authHeaders }
  );
  record(
    'Update Notification Preferences',
    'PUT /api/v1/preferences',
    updatePrefsRes.status,
    updatePrefsRes.status === 200 || updatePrefsRes.status === 201,
    `Status: ${updatePrefsRes.status}`
  );

  // 15. Check Assignments Authorization: Unenrolled student restricted (403)
  const unenrollAssignRes = await client.get('/api/v1/assignments/course/1/published', { headers: authHeaders });
  record(
    'Unenrolled Student Access to Assignments Restricted',
    'GET /api/v1/assignments/course/1/published',
    unenrollAssignRes.status,
    unenrollAssignRes.status === 403,
    `Status: ${unenrollAssignRes.status} (Access restricted as expected)`
  );

  // 16. Enroll student in Course 1
  const enrollRes = await client.post('/api/v1/courses/1/enroll', {}, { headers: authHeaders });
  record(
    'Student Course Enrollment',
    'POST /api/v1/courses/1/enroll',
    enrollRes.status,
    enrollRes.status === 200,
    `Enrollment status: ${enrollRes.status}`
  );

  // 17. Check Assignments Routing through Gateway (Enrolled student: 200)
  const assignRes = await client.get('/api/v1/assignments/course/1/published', { headers: authHeaders });
  const assignmentsFound = assignRes.data?.data || [];
  record(
    'Enrolled Student Access to Published Assignments',
    'GET /api/v1/assignments/course/1/published',
    assignRes.status,
    assignRes.status === 200 && Array.isArray(assignmentsFound),
    `Status: ${assignRes.status} (Routed through Gateway, found: ${assignmentsFound.length} assignments)`
  );

  // 16. Refresh Token
  if (refreshToken) {
    const refreshRes = await client.post(
      '/api/v1/auth/refresh',
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    record(
      'Refresh Access Token',
      'POST /api/v1/auth/refresh',
      refreshRes.status,
      refreshRes.status === 200,
      refreshRes.status === 200 ? 'New access token issued' : 'Refresh failed'
    );
  }

  // 17. Logout
  const logoutRes = await client.post('/api/v1/auth/logout', {}, { headers: authHeaders });
  record(
    'User Logout',
    'POST /api/v1/auth/logout',
    logoutRes.status,
    logoutRes.status === 200,
    logoutRes.status === 200 ? 'Logged out successfully' : 'Logout failed'
  );

  printSummary();
}

function printSummary() {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;
  const rate = Math.round((passed / total) * 100);

  console.log(`\n======================================================`);
  console.log(` Live Runtime Test Results: ${passed}/${total} Passed (${rate}%)`);
  console.log(`======================================================\n`);
}

run().catch(err => {
  console.error('Fatal test error:', err);
});
