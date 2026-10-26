// scripts/test-order-persistence.mjs
import axios from 'axios';
import { execSync } from 'child_process';

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

async function run() {
  console.log('=== Step 1: Setting up authorized test student account ===');
  const timestamp = Date.now();
  const testEmail = `student_order_${timestamp}@cyberlearnix.dev`;
  const testPassword = `Pass@Secure${timestamp % 10000}!`;

  const regFormData = new FormData();
  regFormData.append('data', JSON.stringify({
    firstName: 'OrderTest',
    lastName: 'Student',
    email: testEmail,
    password: testPassword,
    confirmPassword: testPassword,
  }));

  const regRes = await client.post('/api/v1/auth/register', regFormData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  console.log('Registration status:', regRes.status);
  const otpSessionId = regRes.data?.otpSessionId || regRes.data?.sessionId || regRes.data?.data?.otpSessionId;

  await sleep(1500);

  const mailRes = await axios.get(MAILHOG_URL);
  const messages = mailRes.data?.items || [];
  let otp = null;
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

  console.log('OTP received:', Boolean(otp));

  const verifyRes = await client.post('/api/v1/auth/verify-email', {
    email: testEmail,
    otp: otp,
    otpSessionId: otpSessionId,
  });
  console.log('Email verify status:', verifyRes.status);

  const loginRes = await client.post('/api/v1/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  console.log('Login status:', loginRes.status);

  const accessToken = loginRes.data?.authentication?.accessToken || loginRes.data?.accessToken;
  const userId = loginRes.data?.user?.id || loginRes.data?.user?.userId || loginRes.data?.id;
  console.log('Authenticated userId:', userId);

  const authHeaders = { Authorization: `Bearer ${accessToken}` };

  console.log('\n=== Step 2: Add Course 1 to Cart ===');
  const addCartRes = await client.post('/api/v1/cart', {
    courseId: 1,
    instructorId: 'e020f1dc-08cf-4809-8edd-e64dd60e6bc9',
    courseName: 'Microservices Architecture Patterns',
    price: 7999.0,
  }, { headers: authHeaders });
  console.log('Add to cart status:', addCartRes.status);

  console.log('\n=== Step 3: Test POST /api/v1/orders/create with valid contract ===');
  const orderPayload = {
    courseIds: [1],
    totalAmount: 7999.0,
  };
  const createOrderRes = await client.post('/api/v1/orders/create', orderPayload, { headers: authHeaders });
  console.log('Create order status:', createOrderRes.status);
  console.log('Create order response:', JSON.stringify(createOrderRes.data, null, 2));

  const orderId = createOrderRes.data?.data?.orderId;
  console.log('Created orderId:', orderId);

  if (orderId) {
    console.log('\n=== Step 4: Retrieve Order via GET /api/v1/orders/{orderId} ===');
    const getOrderRes = await client.get(`/api/v1/orders/${orderId}`, { headers: authHeaders });
    console.log('Get order by ID status:', getOrderRes.status);
    console.log('Get order by ID data:', JSON.stringify(getOrderRes.data, null, 2));

    console.log('\n=== Step 5: Retrieve Orders via GET /api/v1/orders ===');
    const getMyOrdersRes = await client.get('/api/v1/orders', { headers: authHeaders });
    console.log('Get my orders status:', getMyOrdersRes.status);
    console.log('Get my orders data:', JSON.stringify(getMyOrdersRes.data, null, 2));

    console.log('\n=== Step 6: Query PostgreSQL lms_order_db tables ===');
    try {
      const orderSql = execSync(
        `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -c "SELECT order_id, user_id, total_amount, status, created_at FROM orders WHERE order_id = '${orderId}';"`
      ).toString();
      console.log('DB orders table:\n', orderSql);

      const itemsSql = execSync(
        `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -c "SELECT id, order_id, course_id FROM order_item WHERE order_id = '${orderId}';"`
      ).toString();
      console.log('DB order_item table:\n', itemsSql);
    } catch (e) {
      console.error('DB query error:', e.message);
    }
  }

  console.log('\n=== Step 7: Test Failed Requests & Duplicate Order Prevention ===');
  const initialOrderCountSql = execSync(
    `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT count(*) FROM orders WHERE user_id = '${userId}';"`
  ).toString().trim();
  console.log(`Initial order count for user ${userId}:`, initialOrderCountSql);

  const invalidOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [999999], // non-existent course
    totalAmount: 5000.0,
  }, { headers: authHeaders });
  console.log('Invalid order creation status:', invalidOrderRes.status);
  console.log('Invalid order error message:', invalidOrderRes.data?.message || invalidOrderRes.data);

  const postFailOrderCountSql = execSync(
    `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT count(*) FROM orders WHERE user_id = '${userId}';"`
  ).toString().trim();
  console.log(`Order count after failed request for user ${userId}:`, postFailOrderCountSql);
  console.log('Did failure create duplicate or corrupt order?', initialOrderCountSql === postFailOrderCountSql ? 'NO (Clean & Safe)' : 'YES (Defect)');

  console.log('\n=== Step 8: Test Client-Supplied User ID Tampering ===');
  const spoofedUserId = '00000000-0000-0000-0000-000000000000';
  const spoofOrderRes = await client.post('/api/v1/orders/create', {
    userId: spoofedUserId,
    courseIds: [1],
    totalAmount: 7999.0,
  }, { headers: authHeaders });
  console.log('Spoofed user ID order status:', spoofOrderRes.status);
  console.log('Spoofed order actual owner:', spoofOrderRes.data?.data?.userId);
  console.log('Did backend accept foreign userId?', spoofOrderRes.data?.data?.userId === spoofedUserId ? 'YES (VULNERABLE)' : 'NO (SECURE)');

  console.log('\n=== Step 9: Test Client-Supplied Price Tampering ===');
  const tamperedOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [1],
    totalAmount: 1.0, // Attempted tampering (Course 1 is 7999.0)
  }, { headers: authHeaders });
  console.log('Tampered price order status:', tamperedOrderRes.status);
  console.log('Tampered price response:', tamperedOrderRes.data?.message || tamperedOrderRes.data);
  console.log('Did backend reject price tampering?', tamperedOrderRes.status === 400 ? 'YES (SECURE)' : 'NO');
}

run().catch(console.error);
