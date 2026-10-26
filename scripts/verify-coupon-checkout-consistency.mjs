import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  validateStatus: () => true,
});

async function run() {
  console.log('======================================================');
  console.log(' ASIVO LMS — Coupon-to-Checkout Consistency Verification');
  console.log('======================================================\n');

  // Authenticate student
  const creds = JSON.parse(fs.readFileSync('./scripts/browser-student-creds.json', 'utf8'));
  const loginRes = await client.post('/api/v1/auth/login', {
    email: creds.email,
    password: creds.password,
  });

  const token = loginRes.data?.authentication?.accessToken;
  const userId = loginRes.data?.user?.userId || loginRes.data?.user?.id;
  const authHeaders = { Authorization: `Bearer ${token}` };

  console.log(`Authenticated Student: ${creds.email} (${userId})\n`);

  // --- Test A: Cart Coupon API: Invalid Coupon ---
  console.log('--- Test A: Apply Invalid Coupon to Cart (PUT /api/v1/cart/coupon) ---');
  // Ensure item in cart
  await client.post('/api/v1/cart', {
    courseId: 1,
    instructorId: 'e020f1dc-08cf-4809-8edd-e64dd60e6bc9',
    courseName: 'Microservices Architecture Patterns',
    price: 7999.0,
  }, { headers: authHeaders });

  const invalidCartCouponRes = await client.put('/api/v1/cart/coupon', {
    couponCode: 'FAKE_EXPIRED_999',
  }, { headers: authHeaders });

  console.log(`Invalid coupon HTTP Status: ${invalidCartCouponRes.status}`);
  console.log(`Invalid coupon message:`, invalidCartCouponRes.data?.message || invalidCartCouponRes.data);
  const passInvalidCart = invalidCartCouponRes.status === 400 || invalidCartCouponRes.status === 422;

  // --- Test B: Cart Coupon API: Valid Coupon WELCOME50 ---
  console.log('\n--- Test B: Apply Valid Coupon WELCOME50 to Cart (PUT /api/v1/cart/coupon) ---');
  const validCartCouponRes = await client.put('/api/v1/cart/coupon', {
    couponCode: 'WELCOME50',
  }, { headers: authHeaders });

  console.log(`Valid coupon HTTP Status: ${validCartCouponRes.status}`);
  console.log(`Valid coupon data:`, JSON.stringify(validCartCouponRes.data, null, 2));

  const cartDiscount = validCartCouponRes.data?.data?.discount;
  const cartExpectedTotal = validCartCouponRes.data?.data?.totalAmount;
  console.log(`Cart discount: ${cartDiscount}, Cart total with discount: ${cartExpectedTotal}`);
  const passValidCart = validCartCouponRes.status === 200 && cartDiscount > 0;

  // --- Test C: Checkout Price Tampering with Coupon ---
  console.log('\n--- Test C: Client Total Tampering with Coupon (Submit totalAmount = 1.0) ---');
  const tamperedCouponOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [1],
    couponCode: 'WELCOME50',
    totalAmount: 1.0, // Tampered price
  }, { headers: authHeaders });

  console.log(`Tampered price order status: ${tamperedCouponOrderRes.status}`);
  console.log(`Tampered price error message:`, tamperedCouponOrderRes.data?.message || tamperedCouponOrderRes.data);
  const passTamperingRejected = tamperedCouponOrderRes.status === 400;

  // --- Test D: Order Creation with Invalid Coupon ---
  console.log('\n--- Test D: Create Order with Invalid Coupon Code ---');
  const invalidCouponOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [1],
    couponCode: 'INVALID_CODE_XYZ',
    totalAmount: 7999.0,
  }, { headers: authHeaders });

  console.log(`Invalid coupon order status: ${invalidCouponOrderRes.status}`);
  console.log(`Invalid coupon order error:`, invalidCouponOrderRes.data?.message || invalidCouponOrderRes.data);
  const passInvalidOrderCouponRejected = invalidCouponOrderRes.status === 400;

  // --- Test E: Valid Order Creation with Server-Validated Discount ---
  console.log('\n--- Test E: Create Order with Valid Coupon & Authoritative Total ---');
  const validOrderRes = await client.post('/api/v1/orders/create', {
    courseIds: [1],
    couponCode: 'WELCOME50',
    totalAmount: cartExpectedTotal, // Correct server-computed total
  }, { headers: authHeaders });

  console.log(`Order creation status: ${validOrderRes.status}`);
  console.log(`Order creation data:`, JSON.stringify(validOrderRes.data, null, 2));

  const orderId = validOrderRes.data?.data?.orderId;
  const savedTotal = validOrderRes.data?.data?.totalAmount;
  const savedStatus = validOrderRes.data?.data?.status;
  const passOrderCreated = validOrderRes.status === 200 && Boolean(orderId);

  // --- Test F: Database Persistence & Verification in PostgreSQL ---
  console.log('\n--- Test F: Query PostgreSQL lms_order_db ---');
  let dbOrderRow = null;
  let dbItemRows = null;
  if (orderId) {
    try {
      dbOrderRow = execSync(
        `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT order_id, user_id, total_amount, status FROM orders WHERE order_id = '${orderId}';"`
      ).toString().trim();
      console.log(`DB orders record: ${dbOrderRow}`);

      dbItemRows = execSync(
        `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT id, order_id, course_id FROM order_item WHERE order_id = '${orderId}';"`
      ).toString().trim();
      console.log(`DB order_item record: ${dbItemRows}`);
    } catch (e) {
      console.error('DB query error:', e.message);
    }
  }

  // --- Test G: Retrieve Order via GET /api/v1/orders/{orderId} ---
  console.log(`\n--- Test G: Fetch Order via API (GET /api/v1/orders/${orderId}) ---`);
  const getOrderRes = await client.get(`/api/v1/orders/${orderId}`, { headers: authHeaders });
  console.log(`Get order status: ${getOrderRes.status}`);
  console.log(`Retrieved order data:`, JSON.stringify(getOrderRes.data, null, 2));

  // --- Summary & Assertions ---
  console.log('\n======================================================');
  console.log(' COUPON-TO-CHECKOUT ASSERTION RESULTS');
  console.log('======================================================');
  console.log(`[${passInvalidCart ? 'PASS' : 'FAIL'}] 1. Cart rejects invalid coupon with HTTP 400/422`);
  console.log(`[${passValidCart ? 'PASS' : 'FAIL'}] 2. Cart applies valid coupon WELCOME50 with verified discount`);
  console.log(`[${passTamperingRejected ? 'PASS' : 'FAIL'}] 3. Order creation rejects client price/total tampering (HTTP 400)`);
  console.log(`[${passInvalidOrderCouponRejected ? 'PASS' : 'FAIL'}] 4. Order creation rejects invalid coupon (HTTP 400)`);
  console.log(`[${passOrderCreated ? 'PASS' : 'FAIL'}] 5. Order successfully created with valid coupon discount (HTTP 200)`);
  const passDbTotal = dbOrderRow && dbOrderRow.includes(String(cartExpectedTotal));
  console.log(`[${passDbTotal ? 'PASS' : 'FAIL'}] 6. Persisted total in PostgreSQL reflects server-validated price (${cartExpectedTotal})`);
  const passInitialPending = savedStatus === 'PENDING' && dbOrderRow.includes('PENDING');
  console.log(`[${passInitialPending ? 'PASS' : 'FAIL'}] 7. Saved order initial status is PENDING (not marked paid before payment)`);

  const allPass = passInvalidCart && passValidCart && passTamperingRejected && passInvalidOrderCouponRejected && passOrderCreated && passDbTotal && passInitialPending;
  console.log(`\nOverall Coupon Consistency Verdict: ${allPass ? 'ALL TESTS PASSED (100%)' : 'FAILURES DETECTED'}`);
}

run().catch(console.error);
