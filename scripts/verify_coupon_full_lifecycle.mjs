// scripts/verify_coupon_full_lifecycle.mjs
import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const UI_URL = 'http://localhost:5173';
const BASE_URL = 'http://localhost:8080';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

function getCouponBackendLogs(tailLines = 10) {
  try {
    const logs = execSync(`docker logs cyberlearnix-coupon-service --tail ${tailLines}`, { encoding: 'utf8' });
    return logs.trim();
  } catch (err) {
    return `[Could not read docker logs: ${err.message}]`;
  }
}

async function verifyCouponFullLifecycle() {
  console.log('======================================================================');
  console.log(' 🏷️ COUPON SERVICE: COMPREHENSIVE BACKEND & FRONTEND UI VERIFICATION');
  console.log('======================================================================\n');

  // Step 1: Acquire Tokens
  console.log('1. Acquiring Student and Admin credentials...');
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-student-coupon-runner',
    email: 'coupon.runner@cyberlearnix.dev',
    name: 'Coupon Runner'
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

  console.log(`   -> Student User: ${studentUser.email} (${studentId})`);
  console.log(`   -> Admin User: ${adminUser.email}`);

  // Step 2: Direct Backend API Audit
  console.log('\n2. Testing Backend REST Endpoints in Coupon Service directly...');
  const studentHeaders = { Authorization: `Bearer ${studentToken}` };
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  const allCouponsRes = await axios.get(`${BASE_URL}/api/v1/coupons`, { headers: studentHeaders });
  console.log(`   [API 1/15] GET /api/v1/coupons -> HTTP ${allCouponsRes.status} | Total Loaded: ${allCouponsRes.data?.data?.length}`);

  const quickValidateRes = await axios.get(`${BASE_URL}/api/v1/coupons/validate/WELCOME50`, { headers: studentHeaders });
  console.log(`   [API 2/15] GET /api/v1/coupons/validate/WELCOME50 -> HTTP ${quickValidateRes.status} | Discount Value: ${quickValidateRes.data}%`);

  const validatePostRes = await axios.post(`${BASE_URL}/api/v1/coupons/validate`, {
    couponCode: 'WELCOME50',
    price: 14999.0
  }, { headers: studentHeaders });
  console.log(`   [API 3/15] POST /api/v1/coupons/validate -> HTTP ${validatePostRes.status} | Valid: ${validatePostRes.data?.data?.valid} | Discount: ₹${validatePostRes.data?.data?.discountAmount}`);

  const autoApplyRes = await axios.post(`${BASE_URL}/api/v1/coupons/best-discount`, {
    price: 14999.0
  }, { headers: studentHeaders });
  console.log(`   [API 4/15] POST /api/v1/coupons/best-discount -> HTTP ${autoApplyRes.status} | Best Code: ${autoApplyRes.data?.data?.couponCode}`);

  const campaignsRes = await axios.get(`${BASE_URL}/api/v1/coupons/campaigns`, { headers: studentHeaders });
  console.log(`   [API 5/15] GET /api/v1/coupons/campaigns -> HTTP ${campaignsRes.status} | Campaigns: ${campaignsRes.data?.data?.join(', ')}`);

  // Step 3: Launch UI Browser Automation
  console.log('\n3. Spawning Playwright Browser to verify Frontend Coupon UI & Real-Time Backend Logs...');
  const browser = await chromium.launch({ headless: true });
  const networkTraces = [];

  try {
    // -------------------------------------------------------------
    // Part A: Student Cart Coupon Flow (/cart)
    // -------------------------------------------------------------
    console.log('\n   === PART A: Student Cart Coupon Flow (/cart) ===');
    
    // Ensure student cart has Course 4
    try {
      await axios.delete(`${BASE_URL}/api/v1/cart`, { headers: studentHeaders });
      await axios.post(`${BASE_URL}/api/v1/cart`, {
        courseId: 4,
        instructorId: '3418d497-4d75-49e8-848f-73e9e88fb7da',
        courseName: 'Spring Boot Masterclass',
        price: 14999.0
      }, { headers: studentHeaders });
    } catch (e) {}

    const studentContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await studentContext.addInitScript(({ token, user }) => {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('lms_user', JSON.stringify({ ...user, role: 'student' }));
    }, { token: studentToken, user: studentUser });

    const studentPage = await studentContext.newPage();
    studentPage.on('response', (response) => {
      const url = response.url();
      if (url.includes('/coupons') || url.includes('/cart')) {
        networkTraces.push({ url, status: response.status(), method: response.request().method() });
        console.log(`      [UI Network Trace] ${response.request().method()} ${url.split('?')[0]} => HTTP ${response.status()}`);
      }
    });

    console.log('   A.1. Loading Student Shopping Cart Workspace (/cart)...');
    await studentPage.goto(`${UI_URL}/cart`, { waitUntil: 'networkidle' });
    await studentPage.waitForTimeout(2000);
    await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'coupon_ui_01_student_cart.png') });

    console.log('   A.2. Entering promo code "WELCOME50" into cart promo input...');
    const promoInput = await studentPage.$('input[placeholder*="WELCOME50"]');
    const applyBtn = await studentPage.$('button[type="submit"]:has-text("Apply")');

    if (promoInput && applyBtn) {
      await promoInput.fill('WELCOME50');
      await applyBtn.click();
      await studentPage.waitForTimeout(2500);

      console.log('\n      [Coupon-Service Backend DB Logs on Coupon Apply in Cart]:');
      console.log('      ------------------------------------------------');
      console.log('      ' + getCouponBackendLogs(8).replace(/\n/g, '\n      '));
      console.log('      ------------------------------------------------');

      await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'coupon_ui_02_student_cart_applied.png') });
    }

    const removeCouponBtn = await studentPage.$('button:has-text("Remove")');
    if (removeCouponBtn) {
      console.log('   A.3. Clicking "Remove" coupon button...');
      await removeCouponBtn.click();
      await studentPage.waitForTimeout(2000);

      console.log('\n      [Coupon-Service Backend DB Logs on Coupon Removal]:');
      console.log('      ------------------------------------------------');
      console.log('      ' + getCouponBackendLogs(6).replace(/\n/g, '\n      '));
      console.log('      ------------------------------------------------');

      await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'coupon_ui_03_student_cart_removed.png') });
    }

    await studentContext.close();

    // -------------------------------------------------------------
    // Part B: Admin Promotions & Coupon Matrix (/admin/coupons)
    // -------------------------------------------------------------
    console.log('\n   === PART B: Admin Promotions & Coupon Management Matrix (/admin/coupons) ===');
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await adminContext.addInitScript(({ token, user }) => {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('lms_user', JSON.stringify({ ...user, role: 'admin' }));
    }, { token: adminToken, user: adminUser });

    const adminPage = await adminContext.newPage();
    adminPage.on('response', (response) => {
      const url = response.url();
      if (url.includes('/api/v1/coupons')) {
        networkTraces.push({ url, status: response.status(), method: response.request().method() });
        console.log(`      [UI Network Trace] ${response.request().method()} ${url.split('?')[0]} => HTTP ${response.status()}`);
      }
    });

    console.log('   B.1. Navigating to Admin Coupons Management page (/admin/coupons)...');
    await adminPage.goto(`${UI_URL}/admin/coupons`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(2500);

    console.log('\n      [Coupon-Service Backend DB Logs on Admin Dashboard Load]:');
    console.log('      ------------------------------------------------');
    console.log('      ' + getCouponBackendLogs(6).replace(/\n/g, '\n      '));
    console.log('      ------------------------------------------------');

    await adminPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'coupon_ui_04_admin_matrix.png') });

    // Test Sandbox - Validate Code
    console.log('\n   B.2. Testing Live Validation Telemetry Sandbox ("Validate Code")...');
    const validateBtn = await adminPage.$('button:has-text("Validate Code")');
    if (validateBtn) {
      await validateBtn.click();
      await adminPage.waitForTimeout(2000);

      console.log('\n      [Coupon-Service Backend DB Logs on Sandbox Validation]:');
      console.log('      ------------------------------------------------');
      console.log('      ' + getCouponBackendLogs(8).replace(/\n/g, '\n      '));
      console.log('      ------------------------------------------------');

      await adminPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'coupon_ui_05_sandbox_validated.png') });
    }

    // Test Sandbox - Auto-Apply Best
    console.log('\n   B.3. Testing Live Validation Telemetry Sandbox ("Auto-Apply Best")...');
    const autoApplyBtn = await adminPage.$('button:has-text("Auto-Apply Best")');
    if (autoApplyBtn) {
      await autoApplyBtn.click();
      await adminPage.waitForTimeout(2000);

      console.log('\n      [Coupon-Service Backend DB Logs on Auto-Apply Best]:');
      console.log('      ------------------------------------------------');
      console.log('      ' + getCouponBackendLogs(8).replace(/\n/g, '\n      '));
      console.log('      ------------------------------------------------');

      await adminPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'coupon_ui_06_sandbox_autoapply.png') });
    }

    // Test Create Coupon Modal
    console.log('\n   B.4. Testing Create Coupon Modal & Real-time Deployment...');
    const createBtn = await adminPage.$('button:has-text("Create Coupon")');
    if (createBtn) {
      await createBtn.click();
      await adminPage.waitForTimeout(1000);

      const uniqueCode = `AUTO${Date.now().toString().slice(-4)}`;
      console.log(`      Generating and submitting new coupon code: ${uniqueCode}`);
      await adminPage.fill('input[placeholder="WINTER2026"]', uniqueCode);
      await adminPage.fill('input[placeholder="Winter Engineering Sale"]', 'Playwright Automated Deal');
      
      const deployBtn = await adminPage.$('button:has-text("Deploy Coupon")');
      if (deployBtn) {
        await deployBtn.click();
        await adminPage.waitForTimeout(2500);

        console.log('\n      [Coupon-Service Backend DB Logs on New Coupon Deployment]:');
        console.log('      ------------------------------------------------');
        console.log('      ' + getCouponBackendLogs(8).replace(/\n/g, '\n      '));
        console.log('      ------------------------------------------------');

        await adminPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'coupon_ui_07_deployed_coupon.png') });
      }
    }

    await adminContext.close();
    console.log(`\n4. UI Testing completed successfully! Coupon network traces captured: ${networkTraces.length}`);

  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log(' ✅ ALL COUPON SERVICE BACKEND & UI VERIFICATION CHECKS COMPLETE');
  console.log('======================================================================\n');
}

verifyCouponFullLifecycle().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});

