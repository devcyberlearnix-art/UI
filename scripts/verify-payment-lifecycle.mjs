import axios from 'axios';
import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  validateStatus: () => true,
});

function calculatePayUCallbackHash(status, txnId, amount, productInfo, firstName, email, salt, key) {
  // PayU callback hash format: salt|status|||||||||||email|firstname|productinfo|amount|txnid|key
  const sequence = `${salt}|${status.trim()}|||||||||||${email.trim()}|${firstName.trim()}|${productInfo.trim()}|${amount.trim()}|${txnId.trim()}|${key.trim()}`;
  return crypto.createHash('sha512').update(sequence, 'utf8').digest('hex');
}

async function run() {
  console.log('======================================================');
  console.log(' ASIVO LMS — Payment Lifecycle & Order Synchronization Verification');
  console.log('======================================================\n');

  // Authenticate student A
  const creds = JSON.parse(fs.readFileSync('./scripts/browser-student-creds.json', 'utf8'));
  const loginRes = await client.post('/api/v1/auth/login', {
    email: creds.email,
    password: creds.password,
  });

  const tokenA = loginRes.data?.authentication?.accessToken;
  const userIdA = loginRes.data?.user?.userId || loginRes.data?.user?.id;
  const authHeadersA = { Authorization: `Bearer ${tokenA}` };

  console.log(`Student A: ${creds.email} (${userIdA})`);

  // --- Stage 1: Order Creation in PENDING State ---
  console.log('\n--- Stage 1: Create Valid Pending Order ---');
  const orderRes = await client.post('/api/v1/orders/create', {
    courseIds: [1],
    totalAmount: 7999.0,
  }, { headers: authHeadersA });

  const orderId = orderRes.data?.data?.orderId;
  const orderStatus = orderRes.data?.data?.status;
  console.log(`Created Order ID: ${orderId}, Status: ${orderStatus}`);
  const passOrderPending = orderRes.status === 200 && orderStatus === 'PENDING';

  // Check PostgreSQL lms_order_db
  const dbOrder = execSync(
    `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT order_id, status FROM orders WHERE order_id = '${orderId}';"`
  ).toString().trim();
  console.log(`PostgreSQL lms_order_db record: ${dbOrder}`);

  // --- Stage 2: Payment Initiation via Payment Service ---
  console.log('\n--- Stage 2: Payment Initiation (POST /api/v1/payments/create) ---');
  
  // 2a. Reject client price tampering on payment initiation
  const tamperedPaymentRes = await client.post('/api/v1/payments/create', {
    courseId: '1',
    firstName: 'Student',
    email: creds.email,
    phone: '9876543210',
    amount: 10.0, // Client attempting to dictate price
  }, { headers: authHeadersA });
  console.log(`Tampered payment create HTTP status: ${tamperedPaymentRes.status} (${tamperedPaymentRes.data?.message || 'rejected'})`);
  const passPaymentTampering = tamperedPaymentRes.status === 400;

  // 2b. Valid payment initiation (authoritative pricing)
  const createPaymentRes = await client.post('/api/v1/payments/create', {
    courseId: '1',
    firstName: 'Student',
    email: creds.email,
    phone: '9876543210',
    payerUserId: userIdA,
  }, { headers: authHeadersA });

  console.log(`Valid payment create status: ${createPaymentRes.status}`);
  const paymentData = createPaymentRes.data;
  console.log(`Payment txnId: ${paymentData?.txnId}, Amount: ${paymentData?.amount}, Action URL: ${paymentData?.payuActionUrl}`);
  const passPaymentInitiated = createPaymentRes.status === 200 && Boolean(paymentData?.txnId);

  const txnId = paymentData?.txnId;

  // Check PostgreSQL lms_payment_db
  let dbPayment = '';
  if (txnId) {
    dbPayment = execSync(
      `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_payment_db -t -A -c "SELECT txn_id, amount, status FROM payments WHERE txn_id = '${txnId}';"`
    ).toString().trim();
    console.log(`PostgreSQL lms_payment_db record: ${dbPayment}`);
  }
  const passPaymentPending = dbPayment.includes('PENDING');

  // --- Stage 3: Unverified Callback Rejection (Security Guard) ---
  console.log('\n--- Stage 3: Test Unverified/Forged Callback Rejection ---');
  const forgedCallbackRes = await client.post('/api/v1/payments/callback/success', {
    status: 'success',
    txnid: txnId,
    amount: paymentData?.amount || '7999.00',
    productinfo: paymentData?.productInfo || 'Course_1',
    firstname: 'Student',
    email: creds.email,
    hash: 'fake_forged_hash_1234567890abcdef', // Invalid hash
    mihpayid: '999888777',
  }, { headers: { 'Content-Type': 'application/json', ...authHeadersA } });

  console.log(`Forged callback response HTTP Status: ${forgedCallbackRes.status} (${forgedCallbackRes.data?.message || forgedCallbackRes.data})`);
  const passForgedCallbackRejected = forgedCallbackRes.status === 400;

  // --- Stage 4: Failed Payment Callback Handling ---
  console.log('\n--- Stage 4: Process Verified Failed Payment Callback ---');
  // PayU config from payment-service properties:
  const payuKey = 'XidEdD';
  const payuSalt = '4JPMTxOzkJMchiHLrdFcSgkcXTuzx1Bd';
  const normalizedAmt = paymentData?.amount || '7999.00';
  const prodInfo = paymentData?.productInfo || 'Course_1';

  const failedHash = calculatePayUCallbackHash('failure', txnId, normalizedAmt, prodInfo, 'Student', creds.email, payuSalt, payuKey);

  const failedCallbackRes = await client.post('/api/v1/payments/callback/failure', {
    status: 'failure',
    txnid: txnId,
    amount: normalizedAmt,
    productinfo: prodInfo,
    firstname: 'Student',
    email: creds.email,
    hash: failedHash,
    mihpayid: 'payu_fail_123',
  }, { headers: { 'Content-Type': 'application/json', ...authHeadersA } });

  console.log(`Failed callback HTTP Status: ${failedCallbackRes.status}`);

  // Verify status in lms_payment_db
  const dbPaymentFailed = execSync(
    `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_payment_db -t -A -c "SELECT txn_id, status FROM payments WHERE txn_id = '${txnId}';"`
  ).toString().trim();
  console.log(`Payment DB status after failure callback: ${dbPaymentFailed}`);
  const passPaymentFailed = dbPaymentFailed.includes('FAILED');

  // Verify order is NOT marked PAID
  const dbOrderStillPending = execSync(
    `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT order_id, status FROM orders WHERE order_id = '${orderId}';"`
  ).toString().trim();
  console.log(`Order DB status after payment failure: ${dbOrderStillPending}`);
  const passOrderNotPaidOnFailure = dbOrderStillPending.includes('PENDING');

  // --- Stage 5: Duplicate Callback Idempotency ---
  console.log('\n--- Stage 5: Test Duplicate / Repeated Callback Idempotency ---');
  const duplicateCallbackRes = await client.post('/api/v1/payments/callback/failure', {
    status: 'failure',
    txnid: txnId,
    amount: normalizedAmt,
    productinfo: prodInfo,
    firstname: 'Student',
    email: creds.email,
    hash: failedHash,
    mihpayid: 'payu_fail_123',
  }, { headers: { 'Content-Type': 'application/json', ...authHeadersA } });
  console.log(`Duplicate callback HTTP Status: ${duplicateCallbackRes.status}`);
  const passDuplicateHandled = duplicateCallbackRes.status === 200;

  // --- Stage 6: Cancelled Order Lifecycle ---
  console.log('\n--- Stage 6: Test Order Cancellation (DELETE /api/v1/orders/{orderId}/cancel) ---');
  const cancelRes = await client.delete(`/api/v1/orders/${orderId}/cancel`, { headers: authHeadersA });
  console.log(`Cancel order HTTP Status: ${cancelRes.status}`);

  const dbOrderCancelled = execSync(
    `docker exec cyberlearnix-postgres psql -U cyberlearnix -d lms_order_db -t -A -c "SELECT order_id, status FROM orders WHERE order_id = '${orderId}';"`
  ).toString().trim();
  console.log(`Order DB status after cancellation: ${dbOrderCancelled}`);
  const passOrderCancelled = dbOrderCancelled.includes('CANCELLED');

  // Test that student cannot transition cancelled order to PAID
  const illegalTransitionRes = await client.put(`/api/v1/orders/${orderId}/status?status=PAID`, {}, { headers: authHeadersA });
  console.log(`Student illegal status transition HTTP Status: ${illegalTransitionRes.status}`);
  const passIllegalTransitionBlocked = illegalTransitionRes.status === 403;

  // --- Stage 7: Unauthorized Order Access & Cross-User Isolation ---
  console.log('\n--- Stage 7: Test Cross-User Order Access Isolation ---');
  // Student B authentication (distinct registered student account)
  const testEmailB = 'student_acc_1792164997416@cyberlearnix.dev';
  const testPasswordB = 'Pass@Secure7416!';

  const loginResB = await client.post('/api/v1/auth/login', { email: testEmailB, password: testPasswordB });
  const tokenB = loginResB.data?.authentication?.accessToken;
  const userIdB = loginResB.data?.user?.userId || loginResB.data?.user?.id;
  const authHeadersB = { Authorization: `Bearer ${tokenB}` };

  console.log(`Student B logged in: ${testEmailB} (${userIdB})`);

  // Student B attempts to access Student A's order
  const crossAccessRes = await client.get(`/api/v1/orders/${orderId}`, { headers: authHeadersB });
  console.log(`Student B accessing Student A's order HTTP Status: ${crossAccessRes.status}`);
  const passCrossUserBlocked = crossAccessRes.status === 404;

  // Student B attempts to access admin order endpoints
  const adminAccessRes = await client.get('/api/v1/orders/admin', { headers: authHeadersB });
  console.log(`Student B accessing /orders/admin HTTP Status: ${adminAccessRes.status}`);
  const passAdminEndpointBlocked = adminAccessRes.status === 403;

  // Student B attempts to view instructor payments report
  const revenueAccessRes = await client.get('/api/v1/payments/revenue', { headers: authHeadersB });
  console.log(`Student accessing /payments/revenue HTTP Status: ${revenueAccessRes.status}`);

  // --- Stage 8: Verify Live Provider Gateway Verify Check ---
  console.log('\n--- Stage 8: Development Payment Provider Blocker Verification ---');
  const verifyGatewayRes = await client.post('/api/v1/payments/verify', { txnId: txnId }, { headers: authHeadersA });
  console.log(`Gateway verify HTTP status: ${verifyGatewayRes.status}`);
  console.log(`Gateway verify response:`, JSON.stringify(verifyGatewayRes.data, null, 2));

  // --- Assertions ---
  console.log('\n======================================================');
  console.log(' PAYMENT LIFECYCLE & SECURITY REGRESSION RESULTS');
  console.log('======================================================');
  console.log(`[${passOrderPending ? 'PASS' : 'FAIL'}] 1. Order initiated in PENDING status`);
  console.log(`[${passPaymentTampering ? 'PASS' : 'FAIL'}] 2. Payment creation rejects client price tampering`);
  console.log(`[${passPaymentInitiated && passPaymentPending ? 'PASS' : 'FAIL'}] 3. Payment initiated with authoritative price & PENDING in payment DB`);
  console.log(`[${passForgedCallbackRejected ? 'PASS' : 'FAIL'}] 4. Forged/unverified PayU callback rejected (HTTP 400 Invalid PayU hash)`);
  console.log(`[${passPaymentFailed ? 'PASS' : 'FAIL'}] 5. Failed payment callback transitions payment to FAILED`);
  console.log(`[${passOrderNotPaidOnFailure ? 'PASS' : 'FAIL'}] 6. Order is NOT marked paid when payment fails (confirmed unpaid)`);
  console.log(`[${passDuplicateHandled ? 'PASS' : 'FAIL'}] 7. Duplicate callback is handled cleanly/idempotently`);
  console.log(`[${passOrderCancelled ? 'PASS' : 'FAIL'}] 8. Student can cancel pending order; status transitions to CANCELLED`);
  console.log(`[${passIllegalTransitionBlocked ? 'PASS' : 'FAIL'}] 9. Student cannot manually mark order PAID/COMPLETED (HTTP 403 Forbidden)`);
  console.log(`[${passCrossUserBlocked ? 'PASS' : 'FAIL'}] 10. Student B cannot view Student A's order (HTTP 404 Not Found)`);
  console.log(`[${passAdminEndpointBlocked ? 'PASS' : 'FAIL'}] 11. Student cannot access admin order management (/orders/admin: 403 Forbidden)`);

  const allTestsPass = passOrderPending && passPaymentTampering && passPaymentInitiated &&
    passPaymentPending && passForgedCallbackRejected && passPaymentFailed &&
    passOrderNotPaidOnFailure && passDuplicateHandled && passOrderCancelled &&
    passIllegalTransitionBlocked && passCrossUserBlocked && passAdminEndpointBlocked;

  console.log(`\nOverall Payment & Security Verdict: ${allTestsPass ? 'ALL TESTS PASSED (100%)' : 'FAILURES DETECTED'}`);
}

run().catch(console.error);
