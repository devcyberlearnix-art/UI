// scripts/verify_coupon_ui.mjs
import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const UI_URL = 'http://localhost:5173';
const BASE_URL = 'http://localhost:8080';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

async function verifyCouponUI() {
  console.log('======================================================================');
  console.log(' 🌐 LAUNCHING PLAYWRIGHT COUPON SERVICE UI INTEGRATION VERIFICATION');
  console.log('======================================================================\n');

  // Step 1: Obtain tokens
  console.log('1. Acquiring Student & Admin authentication tokens...');
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-student-course-runner',
    email: 'learner.course.test@cyberlearnix.dev',
    name: 'Course Learner'
  });
  const studentToken = studentLogin.data.authentication.accessToken;
  const studentUser = studentLogin.data.user;

  const adminLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
    email: 'dev.cyberlearnix@gmail.com',
    password: 'MainAdmin@123'
  });
  const adminToken = adminLogin.data?.authentication?.accessToken || adminLogin.data?.data?.accessToken || adminLogin.data?.accessToken;
  const adminUser = adminLogin.data?.user || { email: 'dev.cyberlearnix@gmail.com', role: 'admin' };

  // Prepare student cart with Course 4
  try {
    await axios.post(`${BASE_URL}/api/v1/cart`, {
      courseId: 4,
      instructorId: '3418d497-4d75-49e8-848f-73e9e88fb7da',
      courseName: 'Spring Boot Masterclass',
      price: 2999.0
    }, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
  } catch (e) {
    // Already in cart or similar, non-fatal
  }

  const browser = await chromium.launch({ headless: true });
  const networkTraces = [];

  try {
    // -------------------------------------------------------------
    // Test 1: Student Cart Coupon Application & Removal (/cart)
    // -------------------------------------------------------------
    console.log('\n2. Testing Student Cart Coupon Engine (/cart)...');
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
      }
    });

    await studentPage.goto(`${UI_URL}/cart`, { waitUntil: 'networkidle' });
    await studentPage.waitForTimeout(2000);

    // Apply WELCOME50
    const promoInput = await studentPage.$('input[placeholder*="WELCOME50"], input[placeholder*="PROMO"]');
    if (promoInput) {
      await promoInput.fill('WELCOME50');
      const applyBtn = await studentPage.$('button:has-text("Apply")');
      if (applyBtn) {
        await applyBtn.click();
        await studentPage.waitForTimeout(2000);
      }
    }

    const cartText = await studentPage.evaluate(() => document.body.innerText);
    const couponApplied = cartText.includes('WELCOME50') || cartText.includes('Promotional hash applied');
    console.log(`   Coupon WELCOME50 Applied in Cart: ${couponApplied ? '✅ YES' : '❌ NO'}`);
    await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, '01_student_cart_coupon.png') });

    await studentContext.close();

    // -------------------------------------------------------------
    // Test 2: Admin Promotional Matrix & Sandbox (/admin/coupons)
    // -------------------------------------------------------------
    console.log('\n3. Testing Admin Promotional Matrix & Lifecycle (/admin/coupons)...');
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
      }
    });

    await adminPage.goto(`${UI_URL}/admin/coupons`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(2500);

    const adminPageContent = await adminPage.evaluate(() => {
      const text = document.body.innerText;
      const lower = text.toLowerCase();
      return {
        hasTitle: lower.includes('promotions & coupon matrix'),
        hasCoupons: text.includes('WELCOME50') || text.includes('SPRING20') || text.includes('CYBER15'),
        hasSandbox: lower.includes('live validation telemetry sandbox'),
        textSnippet: text.slice(0, 300).replace(/\n+/g, ' ')
      };
    });

    console.log(`   Admin Coupons Matrix Header: ${adminPageContent.hasTitle ? '✅ YES' : '❌ NO'}`);
    console.log(`   Platform Coupons Loaded from Backend: ${adminPageContent.hasCoupons ? '✅ YES' : '❌ NO'}`);
    console.log(`   Validation Telemetry Sandbox Rendered: ${adminPageContent.hasSandbox ? '✅ YES' : '❌ NO'}`);
    await adminPage.screenshot({ path: path.join(SNAPSHOT_DIR, '02_admin_coupons_matrix.png') });

    // Test Validation Sandbox
    console.log('\n4. Testing Live Coupon Validation Sandbox UI...');
    const validateBtn = await adminPage.$('button:has-text("Validate Code")');
    if (validateBtn) {
      await validateBtn.click();
      await adminPage.waitForTimeout(1500);
    }

    const sandboxValidated = await adminPage.evaluate(() => {
      return document.body.innerText.includes('VALIDATION CONFIRMED');
    });
    console.log(`   Sandbox Live Code Validation Passed: ${sandboxValidated ? '✅ YES' : '❌ NO'}`);

    const autoApplyBtn = await adminPage.$('button:has-text("Auto-Apply Best")');
    if (autoApplyBtn) {
      await autoApplyBtn.click();
      await adminPage.waitForTimeout(1500);
    }

    const sandboxAutoApplied = await adminPage.evaluate(() => {
      return document.body.innerText.includes('VALIDATION CONFIRMED') || document.body.innerText.includes('Applied:');
    });
    console.log(`   Sandbox Auto-Apply Best Discount Passed: ${sandboxAutoApplied ? '✅ YES' : '❌ NO'}`);
    await adminPage.screenshot({ path: path.join(SNAPSHOT_DIR, '03_admin_coupon_validation_sandbox.png') });

    // Test Create Coupon Modal
    console.log('\n5. Testing Create Coupon Modal...');
    const createBtn = await adminPage.$('button:has-text("Create Coupon")');
    if (createBtn) {
      await createBtn.click();
      await adminPage.waitForTimeout(800);

      const uniqueUiCode = `UIPLAY${Date.now().toString().slice(-4)}`;
      await adminPage.fill('input[placeholder="WINTER2026"]', uniqueUiCode);
      await adminPage.fill('input[placeholder="Winter Engineering Sale"]', 'Playwright Automated Deal');
      await adminPage.click('button:has-text("Deploy Coupon")');
      await adminPage.waitForTimeout(2000);

      const codeCreated = await adminPage.evaluate((code) => {
        return document.body.innerText.includes(code);
      }, uniqueUiCode);
      console.log(`   Created Coupon ${uniqueUiCode} Rendered in Table: ${codeCreated ? '✅ YES' : '❌ NO'}`);
    }

    await adminContext.close();

    // Summary of captured frontend-to-backend API calls
    console.log('\n======================================================================');
    console.log(' 📡 FRONTEND NETWORK CALLS DISPATCHED TO BACKEND GATEWAY');
    console.log('======================================================================');
    const distinctEndpoints = new Map();
    for (const call of networkTraces) {
      const parsed = new URL(call.url);
      const key = `${call.method} ${parsed.pathname}`;
      if (!distinctEndpoints.has(key)) {
        distinctEndpoints.set(key, call.status);
      }
    }

    for (const [endpoint, status] of distinctEndpoints.entries()) {
      console.log(`   [${status}] ${endpoint}`);
    }

    console.log(`\nTotal Coupon & Cart API requests made from UI: ${distinctEndpoints.size}`);
    console.log('Screenshots saved to: telemetry_snapshots/');

  } catch (err) {
    console.error('UI Verification Error:', err.message);
  } finally {
    await browser.close();
  }
}

verifyCouponUI();
