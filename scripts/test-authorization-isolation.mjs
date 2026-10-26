import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';
const MAILHOG_URL = 'http://localhost:8025/api/v2/messages';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  validateStatus: () => true,
});

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getOtp(email) {
  await sleep(1500);
  const mailRes = await axios.get(MAILHOG_URL);
  const messages = mailRes.data?.items || [];
  for (const msg of messages) {
    const recipient = msg?.To?.[0]?.Mailbox + '@' + msg?.To?.[0]?.Domain;
    if (recipient.toLowerCase() === email.toLowerCase()) {
      const body = msg?.Content?.Body || '';
      const match = body.match(/otp-box["']?>(\d{6})</i) || body.match(/>(\d{6})</) || body.match(/\b\d{6}\b/);
      if (match) return match[1] || match[0];
    }
  }
  return null;
}

async function createStudent(tag) {
  const ts = Date.now();
  const email = `student_${tag}_${ts}@cyberlearnix.dev`;
  const password = `Student@Pass${ts % 10000}!`;

  const form = new FormData();
  form.append('data', JSON.stringify({
    firstName: `Student${tag}`,
    lastName: 'Test',
    email,
    password,
    confirmPassword: password,
  }));

  const regRes = await client.post('/api/v1/auth/register', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const otpSessionId = regRes.data?.otpSessionId || regRes.data?.sessionId || regRes.data?.data?.otpSessionId;
  const otp = await getOtp(email);

  await client.post('/api/v1/auth/verify-email', { email, otp, otpSessionId });

  const loginRes = await client.post('/api/v1/auth/login', { email, password });
  const token = loginRes.data?.authentication?.accessToken;
  const userId = loginRes.data?.user?.id || loginRes.data?.user?.userId;
  return { email, userId, token, headers: { Authorization: `Bearer ${token}` } };
}

async function getAdmin() {
  const email = 'dev.cyberlearnix@gmail.com';
  const reqRes = await client.post('/api/v1/auth/login/otp/request', { email });
  const otp = await getOtp(email);
  const verifyRes = await client.post('/api/v1/auth/login/otp/verify', {
    email,
    otpSessionId: reqRes.data?.otpSessionId,
    otp,
  });
  const token = verifyRes.data?.authentication?.accessToken;
  return { email, token, headers: { Authorization: `Bearer ${token}` } };
}

async function getInstructor() {
  const email = 'priyanka.zacharia@cyberlearnix.test';
  const reqRes = await client.post('/api/v1/auth/login/otp/request', { email });
  const otp = await getOtp(email);
  const verifyRes = await client.post('/api/v1/auth/login/otp/verify', {
    email,
    otpSessionId: reqRes.data?.otpSessionId,
    otp,
  });
  const token = verifyRes.data?.authentication?.accessToken;
  const userId = verifyRes.data?.user?.id || verifyRes.data?.user?.userId;
  return { email, userId, token, headers: { Authorization: `Bearer ${token}` } };
}

async function run() {
  console.log('======================================================');
  console.log(' ASIVO LMS — Non-Payment Final Acceptance & Security Audit');
  console.log('======================================================\n');

  const suiteResults = [];
  function record(category, testName, passed, details) {
    suiteResults.push({ category, testName, passed, details });
    const mark = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${mark}] [${category}] ${testName} - ${details}`);
  }

  // 1. Setup Student A and Student B
  console.log('--- Step 1: Provisioning Student A and Student B ---');
  const studentA = await createStudent('A');
  const studentB = await createStudent('B');
  console.log(`Student A: ${studentA.email} (${studentA.userId})`);
  console.log(`Student B: ${studentB.email} (${studentB.userId})`);

  // 2. Setup Admin and Instructor
  console.log('\n--- Step 2: Authenticating Admin and Instructor ---');
  const admin = await getAdmin();
  console.log(`Admin Authenticated: ${admin.email}`);
  const instructor = await getInstructor();
  console.log(`Instructor Authenticated: ${instructor.email} (${instructor.userId})`);

  // 3. Cart Operations & Coupon Lifecycle
  console.log('\n--- Step 3: Cart Operations, Coupon Apply & Remove ---');
  // Add to cart
  const addCartRes = await client.post('/api/v1/cart', {
    courseId: 1,
    instructorId: 'e020f1dc-08cf-4809-8edd-e64dd60e6bc9',
    courseName: 'Microservices Architecture Patterns',
    price: 7999.0,
  }, { headers: studentA.headers });
  record('Cart Operations', 'Add Course to Cart', addCartRes.status === 201 || addCartRes.status === 200, `Status: ${addCartRes.status}`);

  // Apply valid coupon WELCOME50
  const applyCouponRes = await client.put('/api/v1/cart/coupon', { couponCode: 'WELCOME50' }, { headers: studentA.headers });
  const couponDiscount = applyCouponRes.data?.data?.discount;
  record('Coupon Lifecycle', 'Apply Valid Coupon (WELCOME50)', applyCouponRes.status === 200 && couponDiscount === 799.9, `Status: ${applyCouponRes.status}, Discount: ${couponDiscount}`);

  // Remove coupon
  const removeCouponRes = await client.delete('/api/v1/cart/coupon', { headers: studentA.headers });
  record('Coupon Lifecycle', 'Remove Coupon from Cart', removeCouponRes.status === 200 && removeCouponRes.data?.data?.discount === 0, `Status: ${removeCouponRes.status}, Cleared Discount: ${removeCouponRes.data?.data?.discount}`);

  // Re-apply coupon for discounted order creation
  await client.put('/api/v1/cart/coupon', { couponCode: 'WELCOME50' }, { headers: studentA.headers });

  // 4. Order Creation, Persistence & Validation
  console.log('\n--- Step 4: Order Creation & Server-Authoritative Price Validation ---');
  // Price tampering attempt (client submits 100 instead of 7199.1)
  const tamperRes = await client.post('/api/v1/orders/create', {
    courseIds: [1],
    couponCode: 'WELCOME50',
    totalAmount: 100.0,
  }, { headers: studentA.headers });
  record('Price Protection', 'Reject Client Price Manipulation', tamperRes.status === 400, `Status: ${tamperRes.status}, Msg: ${tamperRes.data?.message}`);

  // Valid order creation with coupon
  const createOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [1],
    couponCode: 'WELCOME50',
    totalAmount: 7199.1,
  }, { headers: studentA.headers });
  const orderIdA = createOrderRes.data?.data?.orderId;
  record('Order Creation', 'Create Valid Discounted Order', createOrderRes.status === 200 && Boolean(orderIdA), `Status: ${createOrderRes.status}, OrderId: ${orderIdA}, Total: ${createOrderRes.data?.data?.totalAmount}`);

  // Verify PostgreSQL DB persistence for Student A's order
  let dbOrderPersisted = false;
  try {
    const dbOut = execSync(
      `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT total_amount, status FROM orders WHERE order_id = '${orderIdA}' AND user_id = '${studentA.userId}';"`
    ).toString().trim();
    dbOrderPersisted = dbOut.includes('7199.1') && dbOut.includes('PENDING');
  } catch (e) {
    console.error('DB query error:', e.message);
  }
  record('Database Persistence', 'Order & Items Persisted in PostgreSQL', dbOrderPersisted, `DB Status & Price Verified in lms_order_db`);

  // Order Details retrieval by owner
  const orderDetailRes = await client.get(`/api/v1/orders/${orderIdA}`, { headers: studentA.headers });
  record('Order Retrieval', 'Owner Can Retrieve Order Details', orderDetailRes.status === 200 && orderDetailRes.data?.data?.orderId === orderIdA, `Status: ${orderDetailRes.status}`);

  // Order History retrieval by owner
  const orderHistoryRes = await client.get('/api/v1/orders', { headers: studentA.headers });
  const historyList = orderHistoryRes.data?.data || [];
  const foundInHistory = historyList.some(o => o.orderId === orderIdA);
  record('Order History', 'Order Appears in Owner Order History', orderHistoryRes.status === 200 && foundInHistory, `History Count: ${historyList.length}, Found: ${foundInHistory}`);

  // 5. Cross-User Data Isolation (Student B vs Student A)
  console.log('\n--- Step 5: Cross-User Data Isolation ---');
  // Student B tries to retrieve Student A's order
  const crossGetRes = await client.get(`/api/v1/orders/${orderIdA}`, { headers: studentB.headers });
  record('Data Isolation', 'Student B Cannot Access Student A Order Details', crossGetRes.status === 404, `Status: ${crossGetRes.status} (Not Found / Isolated)`);

  // Student B tries to cancel Student A's order
  const crossCancelRes = await client.delete(`/api/v1/orders/${orderIdA}/cancel`, { headers: studentB.headers });
  record('Data Isolation', 'Student B Cannot Cancel Student A Order', crossCancelRes.status === 404 || crossCancelRes.status === 403, `Status: ${crossCancelRes.status}`);

  // Student B checks their own order history
  const historyBRes = await client.get('/api/v1/orders', { headers: studentB.headers });
  const historyBList = historyBRes.data?.data || [];
  const aInBHistory = historyBList.some(o => o.orderId === orderIdA);
  record('Data Isolation', 'Student A Order Does Not Appear in Student B History', !aInBHistory, `Student B History items: ${historyBList.length}, Contains A: ${aInBHistory}`);

  // 6. Invalid Course Handling & Cart Preservation
  console.log('\n--- Step 6: Invalid Course Handling & Cart Preservation ---');
  // Ensure student B has course 1 in cart
  await client.post('/api/v1/cart', {
    courseId: 1,
    instructorId: 'e020f1dc-08cf-4809-8edd-e64dd60e6bc9',
    courseName: 'Microservices Architecture Patterns',
    price: 7999.0,
  }, { headers: studentB.headers });

  const invalidCourseOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [999999],
    totalAmount: 5000.0,
  }, { headers: studentB.headers });
  record('Error Handling', 'Nonexistent Course Returns HTTP 400 Bad Request', invalidCourseOrderRes.status === 400, `Status: ${invalidCourseOrderRes.status}, Msg: ${invalidCourseOrderRes.data?.message}`);

  // Verify Student B's cart was preserved
  const cartBCheck = await client.get('/api/v1/cart', { headers: studentB.headers });
  const cartBCourses = cartBCheck.data?.data?.courses || [];
  record('Cart Preservation', 'Cart Preserved on Validation Failure', cartBCourses.length > 0 && cartBCourses[0].courseId == 1, `Cart courses count: ${cartBCourses.length}`);

  // 7. Role Authorization Boundaries
  console.log('\n--- Step 7: Role Authorization Boundaries ---');
  // Student accesses Admin Orders
  const studentAdminOrders = await client.get('/api/v1/orders/admin', { headers: studentA.headers });
  record('Role Boundaries', 'Student Blocked from Admin Orders (/orders/admin)', studentAdminOrders.status === 403, `Status: ${studentAdminOrders.status}`);

  // Student accesses Admin Users
  const studentAdminUsers = await client.get('/api/v1/admin/users', { headers: studentA.headers });
  record('Role Boundaries', 'Student Blocked from Admin Users (/admin/users)', studentAdminUsers.status === 403, `Status: ${studentAdminUsers.status}`);

  // Student accesses Admin Instructors
  const studentAdminInst = await client.get('/api/v1/admin/instructors', { headers: studentA.headers });
  record('Role Boundaries', 'Student Blocked from Admin Instructors (/admin/instructors)', studentAdminInst.status === 403, `Status: ${studentAdminInst.status}`);

  // Student accesses Instructor Self Dashboard
  const studentInstMe = await client.get('/api/v1/instructors/me', { headers: studentA.headers });
  record('Role Boundaries', 'Student Blocked from Instructor Self (/instructors/me)', studentInstMe.status === 403, `Status: ${studentInstMe.status}`);

  // Student creates assignment
  const studentCreateAssign = await client.post('/api/v1/assignments', {
    courseId: 1,
    title: 'Unauthorized',
    maxScore: 100,
  }, { headers: studentA.headers });
  record('Role Boundaries', 'Student Blocked from Creating Assignments', studentCreateAssign.status === 403, `Status: ${studentCreateAssign.status}`);

  // Student attempts direct order status manipulation to PAID
  const studentStatusPut = await client.put(`/api/v1/orders/${orderIdA}/status?status=PAID`, {}, { headers: studentA.headers });
  record('Role Boundaries', 'Student Blocked from Directly Modifying Order Status to PAID', studentStatusPut.status === 403, `Status: ${studentStatusPut.status}`);

  // Instructor accesses Admin Users
  const instAdminUsers = await client.get('/api/v1/admin/users', { headers: instructor.headers });
  record('Role Boundaries', 'Instructor Blocked from Admin Users', instAdminUsers.status === 403, `Status: ${instAdminUsers.status}`);

  // Instructor attempts to create assignment for unowned course
  const instUnownedAssign = await client.post('/api/v1/assignments', {
    courseId: 1,
    title: 'Unowned Course Assignment',
    maxScore: 100,
  }, { headers: instructor.headers });
  record('Course Ownership', 'Instructor Blocked from Modifying Unowned Course', instUnownedAssign.status === 400 && String(instUnownedAssign.data?.message || '').includes('Instructor does not own this course'), `Status: ${instUnownedAssign.status}, Msg: ${instUnownedAssign.data?.message}`);

  // Admin accesses Admin Endpoints
  const adminUsersRes = await client.get('/api/v1/admin/users', { headers: admin.headers });
  record('Admin Authorization', 'Admin Accesses Admin Users Endpoint', adminUsersRes.status === 200, `Status: ${adminUsersRes.status}`);

  const adminInstRes = await client.get('/api/v1/admin/instructors', { headers: admin.headers });
  record('Admin Authorization', 'Admin Accesses Admin Instructors Endpoint', adminInstRes.status === 200, `Status: ${adminInstRes.status}`);

  const adminBannersRes = await client.get('/api/v1/admin/banners', { headers: admin.headers });
  record('Admin Authorization', 'Admin Accesses Admin Banners Endpoint', adminBannersRes.status === 200, `Status: ${adminBannersRes.status}`);

  // Summary
  const passed = suiteResults.filter(r => r.passed).length;
  const total = suiteResults.length;
  console.log('\n======================================================');
  console.log(` AUDIT SUITE FINISHED: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log('======================================================');

  // Save report JSON
  fs.writeFileSync('./scripts/non-payment-audit-results.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    total,
    passed,
    failed: total - passed,
    results: suiteResults,
  }, null, 2));
}

run().catch(console.error);
