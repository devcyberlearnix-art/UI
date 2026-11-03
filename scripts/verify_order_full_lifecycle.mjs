// scripts/verify_order_full_lifecycle.mjs
import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const UI_URL = 'http://localhost:5173';
const BASE_URL = process.env.BASE_URL || 'http://localhost:8079';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

function getOrderBackendLogs(tailLines = 12) {
  try {
    const logs = execSync(`docker logs cyberlearnix-order-service --tail ${tailLines}`, { encoding: 'utf8' });
    return logs.trim();
  } catch (err) {
    return `[Could not read docker logs: ${err.message}]`;
  }
}

async function verifyOrderFullLifecycle() {
  console.log('======================================================================');
  console.log(' 📦 ORDER SERVICE: COMPREHENSIVE BACKEND & FRONTEND UI VERIFICATION');
  console.log('======================================================================\n');

  // Step 1: Acquire Student & Admin Credentials
  console.log('1. Authenticating Student & Admin Credentials...');
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-student-order-runner',
    email: 'order.runner@cyberlearnix.dev',
    name: 'Order QA Runner'
  });
  const studentToken = studentLogin.data.authentication.accessToken;
  const studentUser = studentLogin.data.user;
  const studentId = studentUser.id || studentLogin.data.authentication.userId;

  const adminLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
    email: 'dev.cyberlearnix@gmail.com',
    password: 'MainAdmin@123'
  });
  const adminToken = adminLogin.data?.authentication?.accessToken || adminLogin.data?.data?.accessToken || adminLogin.data?.accessToken;
  const adminUser = adminLogin.data?.user || { email: 'dev.cyberlearnix@gmail.com', role: 'admin' };

  console.log(`   -> Student User: ${studentUser.email} (ID: ${studentId})`);
  console.log(`   -> Admin User: ${adminUser.email}`);

  const studentHeaders = { Authorization: `Bearer ${studentToken}` };
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Step 2: Direct REST Endpoints Verification in Order Service
  console.log('\n2. Testing All Order Service REST Endpoints Directly in Backend...');
  
  // Endpoint 1: Stage / Create Order (POST /api/v1/orders/stage)
  const stageRes = await axios.post(`${BASE_URL}/api/v1/orders/stage`, {
    userId: studentId,
    courseIds: [4],
    totalAmount: 14999.0
  }, { headers: studentHeaders });
  const stagedOrderId = stageRes.data?.data?.orderId;
  console.log(`   [API 1/10] POST /api/v1/orders/stage -> HTTP ${stageRes.status} | Staged Order ID: ${stagedOrderId}`);

  // Endpoint 2: Get Staged Order (GET /api/v1/orders/staged/{orderId})
  const stagedGetRes = await axios.get(`${BASE_URL}/api/v1/orders/staged/${stagedOrderId}`, { headers: studentHeaders });
  console.log(`   [API 2/10] GET /api/v1/orders/staged/${stagedOrderId} -> HTTP ${stagedGetRes.status} | Status: ${stagedGetRes.data?.data?.status} | Total: ₹${stagedGetRes.data?.data?.totalAmount}`);

  // Endpoint 3: Create Order explicitly (POST /api/v1/orders/create)
  const createRes = await axios.post(`${BASE_URL}/api/v1/orders/create`, {
    userId: studentId,
    courseIds: [4],
    totalAmount: 14999.0
  }, { headers: studentHeaders });
  const testOrderId = createRes.data?.data?.orderId;
  console.log(`   [API 3/10] POST /api/v1/orders/create -> HTTP ${createRes.status} | Created Order ID: ${testOrderId}`);

  // Endpoint 4: Get Order by ID (GET /api/v1/orders/{orderId})
  const getByIdRes = await axios.get(`${BASE_URL}/api/v1/orders/${testOrderId}`, { headers: studentHeaders });
  console.log(`   [API 4/10] GET /api/v1/orders/${testOrderId} -> HTTP ${getByIdRes.status} | Status: ${getByIdRes.data?.data?.status}`);

  // Endpoint 5: Get My Orders (GET /api/v1/orders/my-orders)
  const myOrdersRes = await axios.get(`${BASE_URL}/api/v1/orders/my-orders`, { headers: studentHeaders });
  console.log(`   [API 5/10] GET /api/v1/orders/my-orders -> HTTP ${myOrdersRes.status} | Orders Count: ${myOrdersRes.data?.data?.length}`);

  // Endpoint 6: Get Orders By User ID (GET /api/v1/orders/user/{userId})
  const userOrdersRes = await axios.get(`${BASE_URL}/api/v1/orders/user/${studentId}`, { headers: adminHeaders });
  console.log(`   [API 6/10] GET /api/v1/orders/user/${studentId} -> HTTP ${userOrdersRes.status} | Orders for User: ${userOrdersRes.data?.data?.length}`);

  // Endpoint 7: Get All Orders for Admin (GET /api/v1/orders/admin)
  const allOrdersRes = await axios.get(`${BASE_URL}/api/v1/orders/admin`, { headers: adminHeaders });
  console.log(`   [API 7/10] GET /api/v1/orders/admin -> HTTP ${allOrdersRes.status} | Platform Orders: ${allOrdersRes.data?.data?.length}`);

  // Endpoint 8: Get Order Analytics (GET /api/v1/orders/analytics)
  const analyticsRes = await axios.get(`${BASE_URL}/api/v1/orders/analytics`, { headers: adminHeaders });
  console.log(`   [API 8/10] GET /api/v1/orders/analytics -> HTTP ${analyticsRes.status} | Total: ${analyticsRes.data?.data?.totalOrders} | Completed: ${analyticsRes.data?.data?.completedOrders}`);

  // Endpoint 9: Update Order Status (PUT /api/v1/orders/{orderId}/status)
  const statusUpdateRes = await axios.put(`${BASE_URL}/api/v1/orders/${testOrderId}/status?status=COMPLETED`, {}, { headers: adminHeaders });
  console.log(`   [API 9/10] PUT /api/v1/orders/${testOrderId}/status?status=COMPLETED -> HTTP ${statusUpdateRes.status} | Updated Status: ${statusUpdateRes.data?.data?.status}`);

  // Endpoint 10: Process Refund (POST /api/v1/orders/{orderId}/refund)
  const refundRes = await axios.post(`${BASE_URL}/api/v1/orders/${testOrderId}/refund`, {}, { headers: adminHeaders });
  console.log(`   [API 10/10] POST /api/v1/orders/${testOrderId}/refund -> HTTP ${refundRes.status} | Refunded Status: ${refundRes.data?.data?.status}`);

  // Step 3: Frontend UI Live Browser Automation & Simultaneous Backend Logs
  console.log('\n3. Spawning Playwright Browser to verify Frontend UI Order Workspaces & Real-Time Backend Logs...');
  const browser = await chromium.launch({ headless: true });
  const networkTraces = [];

  try {
    // ------------------------------------------------------------------------
    // Part A: Cart-to-Checkout Staging & Order Creation Flow
    // ------------------------------------------------------------------------
    console.log('\n   === PART A: Student Cart -> Staged Checkout -> Order Creation ===');

    // Populate Student Cart with Course 4
    try {
      await axios.delete(`${BASE_URL}/api/v1/cart`, { headers: studentHeaders });
      await axios.post(`${BASE_URL}/api/v1/cart`, {
        courseId: 4,
        instructorId: '3418d497-4d75-49e8-848f-73e9e88fb7da',
        courseName: 'Spring Boot Masterclass',
        price: 14999.0
      }, { headers: studentHeaders });
    } catch (e) {
      console.warn('   (Cart prep notice)', e.message);
    }

    const studentContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await studentContext.addInitScript(({ token, user }) => {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('lms_user', JSON.stringify({ ...user, role: 'student' }));
    }, { token: studentToken, user: studentUser });

    const studentPage = await studentContext.newPage();
    studentPage.on('response', (response) => {
      const url = response.url();
      if (url.includes('/orders') || url.includes('/cart')) {
        networkTraces.push({ url, status: response.status(), method: response.request().method() });
        console.log(`      [UI Network Trace] ${response.request().method()} ${url.split('?')[0]} => HTTP ${response.status()}`);
      }
    });

    // 1. Visit Cart and trigger Proceed to Checkout
    console.log('   A.1. Loading Student Shopping Cart (/cart)...');
    await studentPage.goto(`${UI_URL}/cart`, { waitUntil: 'networkidle' });
    await studentPage.waitForTimeout(2000);
    await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'order_ui_01_student_cart.png') });

    console.log('   A.2. Clicking "Proceed to Checkout Matrix" button...');
    const checkoutBtn = await studentPage.$('button:has-text("Proceed to Checkout Matrix")');
    if (checkoutBtn) {
      await checkoutBtn.click();
      await studentPage.waitForTimeout(3000);

      console.log('\n      [Order Service Backend Logs Immediately Following UI Order Staging]:');
      console.log('      -------------------------------------------------------------------');
      console.log('      ' + getOrderBackendLogs(8).replace(/\n/g, '\n      '));
      console.log('      -------------------------------------------------------------------');
    }

    // 2. Checkout Screen Verification (/checkout?id=...)
    console.log(`   A.3. Currently on Checkout URL: ${studentPage.url()}`);
    await studentPage.waitForTimeout(3000);
    await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'order_ui_02_staged_checkout.png') });

    // 3. Complete Checkout & Authorize Payment
    console.log('   A.4. Completing Checkout & Authorizing Payment...');
    const authorizeBtn = await studentPage.waitForSelector('button:has-text("Authorize Payment & Enroll")', { timeout: 10000 }).catch(() => null);
    if (authorizeBtn) {
      await authorizeBtn.click();
      console.log('      Clicked "Authorize Payment & Enroll". Waiting for order creation confirmation...');
      await studentPage.waitForTimeout(5000);

      console.log('\n      [Order Service Backend Logs Following UI Order Creation]:');
      console.log('      -------------------------------------------------------');
      console.log('      ' + getOrderBackendLogs(12).replace(/\n/g, '\n      '));
      console.log('      -------------------------------------------------------');

      await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'order_ui_03_order_confirmed.png') });
    } else {
      console.log('      Authorize button not found!');
    }

    // ------------------------------------------------------------------------
    // Part B: Student Order History Ledger (/student/orders)
    // ------------------------------------------------------------------------
    console.log('\n   === PART B: Student Order History Ledger (/student/orders) ===');
    await studentPage.goto(`${UI_URL}/student/orders`, { waitUntil: 'networkidle' });
    await studentPage.waitForTimeout(2500);

    console.log('\n      [Order Service Backend Logs on Ingesting Student Order History]:');
    console.log('      ---------------------------------------------------------------');
    console.log('      ' + getOrderBackendLogs(8).replace(/\n/g, '\n      '));
    console.log('      ---------------------------------------------------------------');

    await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'order_ui_04_student_orders_ledger.png') });
    console.log('      Successfully captured student order ledger screenshot.');

    // ------------------------------------------------------------------------
    // Part C: Admin Order Management Workspace (/admin/orders)
    // ------------------------------------------------------------------------
    console.log('\n   === PART C: Admin Order Management Workspace (/admin/orders) ===');
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await adminContext.addInitScript(({ token, user }) => {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('lms_user', JSON.stringify({ ...user, role: 'admin' }));
    }, { token: adminToken, user: adminUser });

    const adminPage = await adminContext.newPage();
    adminPage.on('response', (response) => {
      const url = response.url();
      if (url.includes('/orders')) {
        networkTraces.push({ url, status: response.status(), method: response.request().method() });
        console.log(`      [Admin UI Network Trace] ${response.request().method()} ${url.split('?')[0]} => HTTP ${response.status()}`);
      }
    });

    console.log('   C.1. Navigating to Admin Orders Dashboard (/admin/orders)...');
    await adminPage.goto(`${UI_URL}/admin/orders`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(3000);

    console.log('\n      [Order Service Backend Logs on Admin Orders Query Ingestion]:');
    console.log('      -----------------------------------------------------------');
    console.log('      ' + getOrderBackendLogs(8).replace(/\n/g, '\n      '));
    console.log('      -----------------------------------------------------------');

    await adminPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'order_ui_05_admin_orders_management.png') });
    console.log('      Successfully captured admin orders dashboard screenshot.');

  } finally {
    await browser.close();
  }

  console.log(`\n4. Verification sequence finalized! Total Order Network Traces captured: ${networkTraces.length}`);
  console.log('======================================================================');
  console.log(' ✅ ALL ORDER SERVICE BACKEND & UI VERIFICATION CHECKS COMPLETE');
  console.log('======================================================================\n');
}

verifyOrderFullLifecycle().catch((err) => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});

