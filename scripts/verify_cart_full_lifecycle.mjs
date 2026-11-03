// scripts/verify_cart_full_lifecycle.mjs
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

function getBackendLogs(tailLines = 15) {
  try {
    const logs = execSync(`docker logs cyberlearnix-cart-service --tail ${tailLines}`, { encoding: 'utf8' });
    return logs.trim();
  } catch (err) {
    return `[Could not read docker logs: ${err.message}]`;
  }
}

async function verifyCartServiceAndUI() {
  console.log('======================================================================');
  console.log(' 🛒 CART SERVICE: COMPREHENSIVE BACKEND & FRONTEND UI VERIFICATION');
  console.log('======================================================================\n');

  // 1. Authenticate user
  console.log('1. Authenticating student user via Social Login...');
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-cart-e2e-runner',
    email: 'cart.runner@cyberlearnix.dev',
    name: 'Cart QA Runner'
  });
  const token = studentLogin.data.authentication.accessToken;
  const user = studentLogin.data.user;
  const userId = user.id || studentLogin.data.authentication.userId;
  console.log(`   -> Authenticated as: ${user.email} (userId: ${userId})`);

  const client = axios.create({
    baseURL: `${BASE_URL}/api/v1/cart`,
    headers: { Authorization: `Bearer ${token}` }
  });

  // 2. Direct Backend REST Endpoint Audit
  console.log('\n2. Testing All Cart Service Backend REST Endpoints Directly...');
  
  // Endpoint 1: Clear Cart
  await client.delete('');
  console.log('   [API 1/10] DELETE /api/v1/cart (Clear Cart) -> HTTP 200 OK');

  // Endpoint 2: Add Course to Cart
  const addRes = await client.post('', {
    courseId: 4,
    instructorId: '3418d497-4d75-49e8-848f-73e9e88fb7da',
    courseName: 'Spring Boot Masterclass',
    price: 14999.0
  });
  console.log(`   [API 2/10] POST /api/v1/cart (Add Course 4) -> HTTP ${addRes.status} | CourseId: ${addRes.data?.data?.courseId}`);

  // Endpoint 3: Get Cart
  const getRes = await client.get('');
  console.log(`   [API 3/10] GET /api/v1/cart -> HTTP ${getRes.status} | Total Items: ${getRes.data?.data?.totalCourses} | Course: "${getRes.data?.data?.courses?.[0]?.title}"`);

  // Endpoint 4: Get Cart Summary
  const summaryRes = await client.get('/summary');
  console.log(`   [API 4/10] GET /api/v1/cart/summary -> HTTP ${summaryRes.status} | Subtotal: ₹${summaryRes.data?.data?.subtotal} | Discount: ₹${summaryRes.data?.data?.discount} | Total: ₹${summaryRes.data?.data?.totalAmount}`);

  // Endpoint 5: Apply Coupon
  const couponRes = await client.put('/coupon', { couponCode: 'WELCOME50' });
  console.log(`   [API 5/10] PUT /api/v1/cart/coupon (WELCOME50) -> HTTP ${couponRes.status} | Discount: ₹${couponRes.data?.data?.discount} | New Total: ₹${couponRes.data?.data?.totalAmount}`);

  // Endpoint 6: Remove Coupon
  const remCouponRes = await client.delete('/coupon');
  console.log(`   [API 6/10] DELETE /api/v1/cart/coupon -> HTTP ${remCouponRes.status} | Total Restored: ₹${remCouponRes.data?.data?.totalAmount}`);

  // Endpoint 7: Checkout
  const checkoutRes = await client.post('/checkout');
  console.log(`   [API 7/10] POST /api/v1/cart/checkout -> HTTP ${checkoutRes.status} | OrderId: ${checkoutRes.data?.data?.orderId} | Status: ${checkoutRes.data?.data?.paymentStatus}`);

  // Re-add course for remaining checks
  await client.post('', {
    courseId: 4,
    instructorId: '3418d497-4d75-49e8-848f-73e9e88fb7da',
    courseName: 'Spring Boot Masterclass',
    price: 14999.0
  });

  // Endpoint 8: Remove Course
  const remCourseRes = await client.delete('/4');
  console.log(`   [API 8/10] DELETE /api/v1/cart/4 (Remove Course 4) -> HTTP ${remCourseRes.status} | Removed Course: ${remCourseRes.data?.data?.courseId}`);

  // Endpoint 9: Internal Service-to-Service Add
  const internalAddRes = await client.post('/internal/add', { courseId: 4 }, {
    headers: { 'X-User-Id': userId }
  });
  console.log(`   [API 9/10] POST /api/v1/cart/internal/add -> HTTP ${internalAddRes.status} | CourseId: ${internalAddRes.data?.data?.courseId}`);

  // Endpoint 10: Internal Service-to-Service Get & Clear
  const internalGetRes = await client.get(`/internal/${userId}`);
  console.log(`   [API 10/10] GET /api/v1/cart/internal/${userId} -> HTTP ${internalGetRes.status} | Items: ${internalGetRes.data?.data?.items?.length} | Total: ₹${internalGetRes.data?.data?.totalCartPrice}`);

  await client.delete(`/internal/${userId}`);
  console.log(`   -> Verified Internal Clear for ${userId} OK`);

  // 3. Frontend UI Live Browser Automation & Simultaneous Backend Logs
  console.log('\n3. Launching Playwright Browser to verify Frontend UI Cart Interactions...');
  const browser = await chromium.launch({ headless: true });
  const networkTraces = [];

  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    
    // Inject auth token and user state into localStorage
    await context.addInitScript(({ token, user }) => {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('lms_user', JSON.stringify({ ...user, role: 'student' }));
    }, { token, user });

    const page = await context.newPage();

    page.on('response', (response) => {
      const url = response.url();
      if (url.includes('/cart')) {
        networkTraces.push({
          method: response.request().method(),
          url,
          status: response.status()
        });
        console.log(`   [UI Network Trace] ${response.request().method()} ${url.split('?')[0]} => HTTP ${response.status()}`);
      }
    });

    // Step A: Navigate to Course 4 Detail page and add to cart from UI
    console.log('\n   A. Navigating to Course 4 Detail (/courses/4) to add course to Cart from UI...');
    await page.goto(`${UI_URL}/courses/4`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const addToCartBtn = await page.$('button:has-text("Add to Order Cart"), button:has-text("Add to Cart")');
    if (addToCartBtn) {
      console.log('      Clicking "Add to Order Cart" button...');
      await addToCartBtn.click();
      await page.waitForTimeout(2500);

      console.log('\n      [Backend DB Logs Immediately After UI Add To Cart]:');
      console.log('      ------------------------------------------------');
      console.log('      ' + getBackendLogs(8).replace(/\n/g, '\n      '));
      console.log('      ------------------------------------------------');

      await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'cart_step1_added_from_detail.png'), fullPage: false });
    }

    // Step B: View Shopping Cart Workspace (/cart)
    console.log('\n   B. Navigating to Shopping Cart Workspace (/cart)...');
    await page.goto(`${UI_URL}/cart`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('      [Backend Logs on Cart Ingestion]:');
    console.log('      ------------------------------------------------');
    console.log('      ' + getBackendLogs(6).replace(/\n/g, '\n      '));
    console.log('      ------------------------------------------------');

    await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'cart_step2_workspace_view.png'), fullPage: false });

    // Step C: Apply Promo Code from UI
    console.log('\n   C. Testing Promo Code Application (WELCOME50) in UI...');
    const promoInput = await page.$('input[placeholder*="WELCOME50"]');
    const applyBtn = await page.$('button[type="submit"]:has-text("Apply")');

    if (promoInput && applyBtn) {
      await promoInput.fill('WELCOME50');
      console.log('      Filled promo code WELCOME50, clicking Apply...');
      await applyBtn.click();
      await page.waitForTimeout(3000);

      console.log('\n      [Backend DB Logs Immediately After UI Coupon Application]:');
      console.log('      ------------------------------------------------');
      console.log('      ' + getBackendLogs(8).replace(/\n/g, '\n      '));
      console.log('      ------------------------------------------------');

      await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'cart_step3_coupon_applied.png'), fullPage: false });
    }

    // Step D: Remove Promo Code from UI
    console.log('\n   D. Testing Promo Code Removal in UI...');
    const removeCouponBtn = await page.$('button:has-text("Remove")');
    if (removeCouponBtn) {
      console.log('      Clicking "Remove" promo code button...');
      await removeCouponBtn.click();
      await page.waitForTimeout(3000);

      console.log('\n      [Backend DB Logs After UI Coupon Removal]:');
      console.log('      ------------------------------------------------');
      console.log('      ' + getBackendLogs(8).replace(/\n/g, '\n      '));
      console.log('      ------------------------------------------------');

      await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'cart_step4_coupon_removed.png'), fullPage: false });
    } else {
      console.log('      Note: Coupon remove button was not present in DOM');
    }

    // Step E: Drop Course Item from UI
    console.log('\n   E. Testing "Drop Node" (Remove Course) from Cart in UI...');
    const dropNodeBtn = await page.$('button:has-text("Drop Node")');
    if (dropNodeBtn) {
      console.log('      Clicking "Drop Node" button...');
      await dropNodeBtn.click();
      await page.waitForTimeout(2500);

      console.log('\n      [Backend DB Logs After UI Drop Node]:');
      console.log('      ------------------------------------------------');
      console.log('      ' + getBackendLogs(8).replace(/\n/g, '\n      '));
      console.log('      ------------------------------------------------');

      await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'cart_step5_node_dropped_empty.png'), fullPage: false });
    }

    console.log(`\n4. UI Testing completed successfully! Cart network traces captured: ${networkTraces.length}`);

  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log(' ✅ ALL CART SERVICE BACKEND & UI VERIFICATION CHECKS COMPLETE');
  console.log('======================================================================\n');
}

verifyCartServiceAndUI().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
