import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true,
});

async function run() {
  console.log('======================================================');
  console.log(' ASIVO LMS — Invalid Order Error Handling Regression Test');
  console.log('======================================================\n');

  // Load test credentials
  const creds = JSON.parse(fs.readFileSync('./scripts/browser-student-creds.json', 'utf8'));
  const loginRes = await client.post('/api/v1/auth/login', {
    email: creds.email,
    password: creds.password,
  });

  const token = loginRes.data?.authentication?.accessToken;
  const userId = loginRes.data?.user?.userId || loginRes.data?.user?.id;
  const authHeaders = { Authorization: `Bearer ${token}` };

  console.log(`Authenticated Student: ${creds.email} (${userId})`);

  // Step 1: Ensure Course 1 is in Cart
  console.log('\n--- Step 1: Ensure Cart has Course 1 ---');
  await client.post('/api/v1/cart', {
    courseId: 1,
    instructorId: 'e020f1dc-08cf-4809-8edd-e64dd60e6bc9',
    courseName: 'Microservices Architecture Patterns',
    price: 7999.0,
  }, { headers: authHeaders });

  const cartBefore = await client.get('/api/v1/cart', { headers: authHeaders });
  const cartCoursesBefore = cartBefore.data?.data?.courses || [];
  console.log(`Cart courses count before test: ${cartCoursesBefore.length}`);

  // Query DB order count
  const orderCountBefore = execSync(
    `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT count(1) FROM orders WHERE user_id = '${userId}';"`
  ).toString().trim();
  console.log(`Orders in lms_order_db before test: ${orderCountBefore}`);

  // Step 2: Request order with nonexistent course ID 999999
  console.log('\n--- Step 2: Post Order with Nonexistent Course ID 999999 ---');
  const invalidOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [999999],
    totalAmount: 5000.0,
  }, { headers: authHeaders });

  console.log(`HTTP Status Code: ${invalidOrderRes.status}`);
  console.log(`Error Response Body:`, JSON.stringify(invalidOrderRes.data, null, 2));

  // Step 3: Check DB orders
  const orderCountAfter = execSync(
    `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT count(1) FROM orders WHERE user_id = '${userId}';"`
  ).toString().trim();
  console.log(`\nOrders in lms_order_db after test: ${orderCountAfter}`);

  // Step 4: Check Cart persistence
  const cartAfter = await client.get('/api/v1/cart', { headers: authHeaders });
  const cartCoursesAfter = cartAfter.data?.data?.courses || [];
  console.log(`Cart courses count after failed order: ${cartCoursesAfter.length}`);

  // Step 5: Test Empty Course List Request
  console.log('\n--- Step 5: Post Order with Empty Course List ---');
  const emptyOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [],
    totalAmount: 0.0,
  }, { headers: authHeaders });
  console.log(`Empty list order HTTP Status: ${emptyOrderRes.status}`);
  console.log(`Empty list response:`, JSON.stringify(emptyOrderRes.data, null, 2));

  // Step 6: Test Negative / Invalid Course ID
  console.log('\n--- Step 6: Post Order with Negative Course ID (-5) ---');
  const negativeOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [-5],
    totalAmount: 100.0,
  }, { headers: authHeaders });
  console.log(`Negative ID order HTTP Status: ${negativeOrderRes.status}`);
  console.log(`Negative ID response:`, JSON.stringify(negativeOrderRes.data, null, 2));

  // Assertions
  console.log('\n======================================================');
  console.log(' EVALUATION & REGRESSION ASSERTIONS');
  console.log('======================================================');

  const check1 = invalidOrderRes.status === 400;
  console.log(`[${check1 ? 'PASS' : 'FAIL'}] 1. Nonexistent course ID returns HTTP 400 Bad Request (was 500)`);

  const check2 = invalidOrderRes.data?.message?.includes('Course not found with id: 999999');
  console.log(`[${check2 ? 'PASS' : 'FAIL'}] 2. Clear sanitized error message returned ("Course not found with id: 999999")`);

  const check3 = orderCountBefore === orderCountAfter;
  console.log(`[${check3 ? 'PASS' : 'FAIL'}] 3. No order record created in PostgreSQL database (order count unchanged)`);

  const check4 = cartCoursesBefore.length === cartCoursesAfter.length && cartCoursesAfter.length > 0;
  console.log(`[${check4 ? 'PASS' : 'FAIL'}] 4. Cart is NOT cleared or corrupted by failed checkout`);

  const check5 = negativeOrderRes.status === 400;
  console.log(`[${check5 ? 'PASS' : 'FAIL'}] 5. Invalid negative course ID returns HTTP 400 Bad Request`);

  const allPassed = check1 && check2 && check3 && check4 && check5;
  console.log(`\nOverall Verdict: ${allPassed ? 'ALL TESTS PASSED (100%)' : 'FAILURES DETECTED'}`);
}

run().catch(console.error);
