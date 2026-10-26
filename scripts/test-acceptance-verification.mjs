// scripts/test-acceptance-verification.mjs
// Verification suite for Cart Persistence, Assignment Authorization & Gateway Routing

import axios from 'axios';
import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:8080';
const MAILHOG_URL = 'http://localhost:8025/api/v2/messages';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  validateStatus: () => true,
});

const timestamp = Date.now();
const testEmail = `student_acc_${timestamp}@cyberlearnix.dev`;
const testPassword = `Pass@Secure${timestamp % 10000}!`;
const testName = `Acceptance Student ${timestamp % 1000}`;

const testLog = [];

function recordTest(name, endpoint, status, pass, notes = '') {
  testLog.push({ name, endpoint, status, pass, notes });
  const icon = pass ? '✅' : '❌';
  console.log(`${icon} [${status}] ${name} (${endpoint}) ${notes ? ' - ' + notes : ''}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('\n======================================================');
  console.log(' ASIVO LMS — Runtime Acceptance & Contradiction Resolution');
  console.log(` Target Gateway: ${BASE_URL}`);
  console.log(` Target Test Account: ${testEmail}`);
  console.log('======================================================\n');

  // -------------------------------------------------------------------------
  // 1. Account Setup (Sanitized - No literal OTP or secrets exposed)
  // -------------------------------------------------------------------------
  console.log('--- 1. Authenticated Student Account Setup ---');

  const regFormData = new FormData();
  regFormData.append('data', JSON.stringify({
    firstName: 'Acceptance',
    lastName: 'Student',
    email: testEmail,
    password: testPassword,
    confirmPassword: testPassword,
  }));

  const regRes = await client.post('/api/v1/auth/register', regFormData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const otpSessionId = regRes.data?.otpSessionId || regRes.data?.sessionId || regRes.data?.data?.otpSessionId || '';
  recordTest('Student Registration', 'POST /api/v1/auth/register', regRes.status, (regRes.status === 200 || regRes.status === 201) && Boolean(otpSessionId), 'Registration accepted, OTP sent');

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

  // Sanitize: Do not log literal OTP
  recordTest('OTP Extraction (Mailhog)', 'GET /api/v2/messages', otp ? 200 : 404, Boolean(otp), otp ? 'OTP received (value protected: [REDACTED])' : 'OTP not found');

  const verifyRes = await client.post('/api/v1/auth/verify-email', {
    email: testEmail,
    otp: otp,
    otpSessionId: otpSessionId,
  });
  recordTest('Email Verification', 'POST /api/v1/auth/verify-email', verifyRes.status, verifyRes.status === 200, 'Account email verified successfully');

  const loginRes = await client.post('/api/v1/auth/login', {
    email: testEmail,
    password: testPassword,
  });

  const accessToken = loginRes.data?.authentication?.accessToken || loginRes.data?.accessToken || null;
  const userId = loginRes.data?.user?.id || loginRes.data?.user?.userId || loginRes.data?.id || null;

  recordTest('Student Authentication', 'POST /api/v1/auth/login', loginRes.status, loginRes.status === 200 && Boolean(accessToken) && Boolean(userId), `Authenticated. User ID: ${userId} (Token protected)`);

  if (!accessToken || !userId) {
    console.error('Fatal: Unable to obtain auth token. Halting test suite.');
    return;
  }

  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  // -------------------------------------------------------------------------
  // 2. Cart Runtime Lifecycle & Persistence Verification
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Cart Runtime Lifecycle & Persistence Verification ---');

  // Step 2a: Read cart before adding item
  const initialCartRes = await client.get('/api/v1/cart', { headers: authHeaders });
  const initialCourses = initialCartRes.data?.data?.courses || initialCartRes.data?.courses || [];
  recordTest(
    'Read Cart Before Adding Item',
    'GET /api/v1/cart',
    initialCartRes.status,
    initialCartRes.status === 200,
    `Initial cart courses: ${initialCourses.length}`
  );

  // Step 2b: Add one valid course
  const courseToAdd = {
    courseId: 1,
    instructorId: 'e020f1dc-08cf-4809-8edd-e64dd60e6bc9',
    courseName: 'Microservices Architecture Patterns',
    price: 7999.0,
  };
  const addCartRes = await client.post('/api/v1/cart', courseToAdd, { headers: authHeaders });
  recordTest(
    'Add Valid Course to Cart',
    'POST /api/v1/cart',
    addCartRes.status,
    addCartRes.status === 200 || addCartRes.status === 201,
    `Added courseId: ${addCartRes.data?.data?.courseId || courseToAdd.courseId}`
  );

  // Step 2c: Fetch cart again using the same account
  const secondCartRes = await client.get('/api/v1/cart', { headers: authHeaders });
  const secondCourses = secondCartRes.data?.data?.courses || secondCartRes.data?.courses || [];
  const itemInCart = secondCourses.find(c => String(c.courseId) === '1');
  recordTest(
    'Fetch Cart (Verify data.courses)',
    'GET /api/v1/cart',
    secondCartRes.status,
    secondCartRes.status === 200 && Boolean(itemInCart),
    `Course 1 found in data.courses: ${Boolean(itemInCart)} (Title: "${itemInCart?.title || 'N/A'}", Price: ${itemInCart?.price})`
  );

  // Step 2d: Verify persisted cart record belongs to the expected user in Postgres DB
  let dbItemCount = 0;
  let dbOwnerMatches = false;
  try {
    const psqlOutput = execSync(
      `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_cart_db -t -A -c "SELECT user_id, course_id, price FROM cart_items WHERE user_id = '${userId}';"`
    ).toString().trim();
    if (psqlOutput) {
      const rows = psqlOutput.split('\n');
      dbItemCount = rows.length;
      dbOwnerMatches = psqlOutput.includes(userId) && psqlOutput.includes('1');
    }
  } catch (err) {
    console.warn('DB check error:', err.message);
  }
  recordTest(
    'Verify Cart Persistence & User Ownership in DB',
    'Postgres lms_cart_db cart_items',
    dbOwnerMatches ? 200 : 500,
    dbOwnerMatches,
    `Persisted cart record belongs to expected userId (${userId}), items: ${dbItemCount}`
  );

  // Step 2e: Repeat after simulating frontend refresh (fresh HTTP instance reading /api/v1/cart)
  const freshClient = axios.create({ baseURL: BASE_URL, timeout: 15000, validateStatus: () => true });
  const refreshedCartRes = await freshClient.get('/api/v1/cart', { headers: authHeaders });
  const refreshedCourses = refreshedCartRes.data?.data?.courses || refreshedCartRes.data?.courses || [];
  const itemStillPersisted = refreshedCourses.some(c => String(c.courseId) === '1');
  recordTest(
    'Fetch Cart After Frontend Refresh Simulation',
    'GET /api/v1/cart',
    refreshedCartRes.status,
    refreshedCartRes.status === 200 && itemStillPersisted,
    `Cart persists across reloads: ${itemStillPersisted} (items count: ${refreshedCourses.length})`
  );

  // Step 2f: Remove test item and verify
  const removeRes = await client.delete('/api/v1/cart/1', { headers: authHeaders });
  recordTest(
    'Remove Item from Cart',
    'DELETE /api/v1/cart/1',
    removeRes.status,
    removeRes.status === 200,
    `Item removed successfully: ${removeRes.status === 200}`
  );

  const finalCartRes = await client.get('/api/v1/cart', { headers: authHeaders });
  const finalCourses = finalCartRes.data?.data?.courses || finalCartRes.data?.courses || [];
  const courseRemoved = !finalCourses.some(c => String(c.courseId) === '1');
  recordTest(
    'Verify Cart Empty After Deletion',
    'GET /api/v1/cart',
    finalCartRes.status,
    finalCartRes.status === 200 && courseRemoved,
    `Course 1 no longer in cart: ${courseRemoved}`
  );

  // -------------------------------------------------------------------------
  // 3. Assignment Authorization & Enrollment Verification
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Assignment Authorization & Enrollment Verification ---');

  // Step 3a: Verify UNENROLLED student is restricted from published assignments (HTTP 403)
  const unenrollAssignRes = await client.get('/api/v1/assignments/course/1/published', { headers: authHeaders });
  const unenrollRestricted = unenrollAssignRes.status === 403;
  recordTest(
    'Unenrolled Student Access to Assignments Restricted',
    'GET /api/v1/assignments/course/1/published',
    unenrollAssignRes.status,
    unenrollRestricted,
    `Status: ${unenrollAssignRes.status} (${unenrollAssignRes.data?.message || 'Access Denied as expected'})`
  );

  // Step 3b: Verify UNENROLLED student is restricted from submitting assignment (HTTP 403)
  const unenrollSubmitRes = await client.post('/api/v1/assignments/1/submission', { submissionText: 'Draft' }, { headers: authHeaders });
  recordTest(
    'Unenrolled Student Submission Blocked',
    'POST /api/v1/assignments/1/submission',
    unenrollSubmitRes.status,
    unenrollSubmitRes.status === 403,
    `Status: ${unenrollSubmitRes.status} (${unenrollSubmitRes.data?.message || 'Access Denied as expected'})`
  );

  // Step 3c: Perform normal enrollment workflow for the test student
  const enrollRes = await client.post('/api/v1/courses/1/enroll', {}, { headers: authHeaders });
  recordTest(
    'Student Course Enrollment Workflow',
    'POST /api/v1/courses/1/enroll',
    enrollRes.status,
    enrollRes.status === 200,
    `Enrollment status: ${enrollRes.status} (${enrollRes.data?.message || 'Enrolled'})`
  );

  // Step 3d: Verify enrollment check endpoint confirms enrollment
  const checkEnrollRes = await client.get('/api/v1/enrollments/check/1', { headers: authHeaders });
  const isEnrolled = checkEnrollRes.data?.data?.enrolled === true;
  recordTest(
    'Verify Enrollment Status via API',
    'GET /api/v1/enrollments/check/1',
    checkEnrollRes.status,
    checkEnrollRes.status === 200 && isEnrolled,
    `Enrolled status: ${isEnrolled}`
  );

  // Step 3e: Retry published-assignment endpoint with the ENROLLED student account (HTTP 200)
  const enrolledAssignRes = await client.get('/api/v1/assignments/course/1/published', { headers: authHeaders });
  const assignmentsList = enrolledAssignRes.data?.data || [];
  recordTest(
    'Enrolled Student Access to Published Assignments Allowed',
    'GET /api/v1/assignments/course/1/published',
    enrolledAssignRes.status,
    enrolledAssignRes.status === 200 && Array.isArray(assignmentsList),
    `Status: ${enrolledAssignRes.status}, Assignments count: ${assignmentsList.length} (Assignment: "${assignmentsList[0]?.title || 'None'}")`
  );

  // Step 3f: Enrolled student can fetch single published assignment detail (HTTP 200)
  const singleAssignRes = await client.get('/api/v1/assignments/1', { headers: authHeaders });
  recordTest(
    'Enrolled Student Access to Assignment Detail',
    'GET /api/v1/assignments/1',
    singleAssignRes.status,
    singleAssignRes.status === 200,
    `Title: "${singleAssignRes.data?.data?.title || 'OK'}", MaxScore: ${singleAssignRes.data?.data?.maxScore}`
  );

  // Step 3g: Enrolled student can create draft submission (HTTP 200)
  const draftRes = await client.post('/api/v1/assignments/1/submission', {
    submissionText: 'https://github.com/cyberlearnix/microservices-solution',
    fileUrl: 'https://storage.cyberlearnix.dev/submissions/sample.pdf',
  }, { headers: authHeaders });
  recordTest(
    'Enrolled Student Create Draft Submission',
    'POST /api/v1/assignments/1/submission',
    draftRes.status,
    draftRes.status === 200,
    `Status: ${draftRes.status} (${draftRes.data?.message || 'Submission saved'})`
  );

  // Step 3h: Enrolled student can retrieve their own submission (HTTP 200)
  const mySubRes = await client.get('/api/v1/assignments/1/submission', { headers: authHeaders });
  recordTest(
    'Enrolled Student Get Own Submission',
    'GET /api/v1/assignments/1/submission',
    mySubRes.status,
    mySubRes.status === 200,
    `Submission Status: ${mySubRes.data?.data?.status || 'SAVED'}`
  );

  // -------------------------------------------------------------------------
  // 4. Role Authorization Boundary Verification (Student vs Instructor/Admin)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Role Authorization Boundary Verification ---');

  // Student forbidden from creating assignments
  const createAssignRes = await client.post('/api/v1/assignments', {
    courseId: 1,
    title: 'Unauthorized Assignment',
    maxScore: 100,
  }, { headers: authHeaders });
  recordTest(
    'Student Forbidden from Creating Assignments',
    'POST /api/v1/assignments',
    createAssignRes.status,
    createAssignRes.status === 403,
    `Status: ${createAssignRes.status} (Access Denied for STUDENT role)`
  );

  // Student forbidden from publishing assignments
  const publishAssignRes = await client.patch('/api/v1/assignments/1/publish', {}, { headers: authHeaders });
  recordTest(
    'Student Forbidden from Publishing Assignments',
    'PATCH /api/v1/assignments/1/publish',
    publishAssignRes.status,
    publishAssignRes.status === 403,
    `Status: ${publishAssignRes.status} (Access Denied for STUDENT role)`
  );

  // Student forbidden from viewing all course assignments including unpublished
  const rawAssignRes = await client.get('/api/v1/assignments/course/1', { headers: authHeaders });
  recordTest(
    'Student Forbidden from Raw Course Assignment Management List',
    'GET /api/v1/assignments/course/1',
    rawAssignRes.status,
    rawAssignRes.status === 403,
    `Status: ${rawAssignRes.status} (Access Denied for STUDENT role)`
  );

  // Student forbidden from viewing instructor submissions list
  const instructorSubsRes = await client.get('/api/v1/assignments/1/submissions', { headers: authHeaders });
  recordTest(
    'Student Forbidden from Viewing All Student Submissions',
    'GET /api/v1/assignments/1/submissions',
    instructorSubsRes.status,
    instructorSubsRes.status === 403,
    `Status: ${instructorSubsRes.status} (Access Denied for STUDENT role)`
  );

  // -------------------------------------------------------------------------
  // 5. Durable Gateway Route Verification
  // -------------------------------------------------------------------------
  console.log('\n--- 5. Durable Gateway Route Verification ---');

  const routeChecks = [
    { name: 'Assignments Route', path: '/api/v1/assignments/course/1/published' },
    { name: 'Quizzes Route', path: '/api/v1/quizzes/course/1/published' },
    { name: 'Live Classes Route', path: '/api/v1/live-classes/course/1/upcoming' },
    { name: 'Progress Route', path: '/api/v1/progress/courses/1' },
    { name: 'Certificates Route', path: '/api/v1/certificates/my' },
    { name: 'Instructor Self Route', path: '/api/v1/instructors/me' },
  ];

  for (const rc of routeChecks) {
    const res = await client.get(rc.path, { headers: authHeaders });
    const isRouted = res.status !== 404 && res.status !== 502 && res.status !== 503;
    recordTest(
      `Gateway Route: ${rc.name}`,
      `GET ${rc.path}`,
      res.status,
      isRouted,
      `Status: ${res.status} (Downstream reached, not 404)`
    );
  }

  // Summary
  const passedCount = testLog.filter(t => t.pass).length;
  const totalCount = testLog.length;
  const passRate = Math.round((passedCount / totalCount) * 100);

  console.log('\n======================================================');
  console.log(` Acceptance Test Results: ${passedCount}/${totalCount} Passed (${passRate}%)`);
  console.log('======================================================\n');
}

run().catch(console.error);
