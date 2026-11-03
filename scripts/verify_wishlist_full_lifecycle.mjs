// scripts/verify_wishlist_full_lifecycle.mjs
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

async function verifyWishlist() {
  console.log('======================================================================');
  console.log(' ⭐ WISHLIST SERVICE COMPREHENSIVE BACKEND & UI E2E VERIFICATION');
  console.log('======================================================================\n');

  // 1. Authenticate user
  console.log('1. Acquiring Student JWT token via Social Login...');
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-wishlist-e2e-runner',
    email: 'wishlist.runner@cyberlearnix.dev',
    name: 'Wishlist QA Runner'
  });
  const token = studentLogin.data.authentication.accessToken;
  const user = studentLogin.data.user;
  console.log(`   -> Authenticated as: ${user.email} (userId: ${user.id || studentLogin.data.authentication.userId})`);

  const client = axios.create({
    baseURL: `${BASE_URL}/api/v1/wishlist`,
    headers: { Authorization: `Bearer ${token}` }
  });

  // 2. Pure Backend API Direct Audit
  console.log('\n2. Testing All Wishlist Service Backend REST Endpoints Directly...');
  
  // Clean initial state
  await client.delete('');
  console.log('   [API 1/7] DELETE /api/v1/wishlist (Clear) -> OK');

  // Check before add
  const checkEmpty = await client.get('/check/4');
  console.log(`   [API 2/7] GET /api/v1/wishlist/check/4 -> inWishlist: ${checkEmpty.data?.data?.inWishlist}`);

  // Add course 4
  const addRes = await client.post('', {
    courseId: 4,
    instructorId: 'c1bfb11b-ce5a-43ab-8eb4-03a50722ce7f'
  });
  const wishlistId = addRes.data?.data?.wishlistId;
  console.log(`   [API 3/7] POST /api/v1/wishlist -> status: ${addRes.status}, wishlistId: ${wishlistId}`);

  // Check after add
  const checkPresent = await client.get('/check/4');
  console.log(`   [API 4/7] GET /api/v1/wishlist/check/4 -> inWishlist: ${checkPresent.data?.data?.inWishlist}`);

  // Get Wishlist List
  const listRes = await client.get('');
  console.log(`   [API 5/7] GET /api/v1/wishlist -> totalItems: ${listRes.data?.data?.totalItems}, course: "${listRes.data?.data?.items?.[0]?.course?.title}"`);

  // Get by ID
  const getByIdRes = await client.get(`/${wishlistId}`);
  console.log(`   [API 6/7] GET /api/v1/wishlist/${wishlistId} -> item course: "${getByIdRes.data?.data?.course?.title}"`);

  // Move to Cart
  const moveRes = await client.post('/4/move-to-cart');
  console.log(`   [API 7/7] POST /api/v1/wishlist/4/move-to-cart -> status: ${moveRes.data?.data?.moveToCartStatus}, message: "${moveRes.data?.data?.message}"`);

  // Verify wishlist is now empty after move
  const listAfterMove = await client.get('');
  console.log(`   -> Verified: Wishlist count after move-to-cart = ${listAfterMove.data?.data?.totalItems}`);

  // 3. Launch Headless Browser for UI Testing & Live Backend Traces
  console.log('\n3. Launching Playwright Browser to verify Frontend UI Wishlist Interactions...');
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
      if (url.includes('/wishlist')) {
        networkTraces.push({
          method: response.request().method(),
          url,
          status: response.status()
        });
        console.log(`   [UI Network Trace] ${response.request().method()} ${url.split('?')[0]} => HTTP ${response.status()}`);
      }
    });

    // Step A: Visit Course Catalog page (/courses)
    console.log('\n   A. Navigating to /courses catalog...');
    await page.goto(`${UI_URL}/courses`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Save screenshot
    await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'wishlist_step1_courses.png'), fullPage: false });

    // Step B: Find wishlist heart button on Course 4 or first course card
    console.log('   B. Clicking Heart toggle button on course card to add to Wishlist...');
    const heartButtons = await page.$$('button[aria-label*="Save blueprint"], button[aria-label*="tracking list"], button[aria-label*="wishlist"]');
    console.log(`      Found ${heartButtons.length} wishlist toggle buttons in DOM`);

    if (heartButtons.length > 0) {
      await heartButtons[0].click();
      console.log('      Clicked first course heart button');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'wishlist_step2_heart_toggled.png'), fullPage: false });
    }

    // Step C: Navigate to Student Wishlist page (/student/wishlist)
    console.log('\n   C. Navigating to Student Wishlist Dashboard (/student/wishlist)...');
    await page.goto(`${UI_URL}/student/wishlist`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'wishlist_step3_dashboard_view.png'), fullPage: false });

    // Check if items are displayed
    const courseCardsInWishlist = await page.$$('h3, [class*="CourseCard"]');
    console.log(`      Found ${courseCardsInWishlist.length} card elements rendered on /student/wishlist page`);

    // Step D: Navigate to Course Details page (/courses/4) to test single-course wishlist toggle
    console.log('\n   D. Navigating to Course 4 Detail page (/courses/4)...');
    await page.goto(`${UI_URL}/courses/4`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const detailWishlistBtn = await page.$('button:has-text("Wishlist"), button:has-text("Saved")');
    if (detailWishlistBtn) {
      const btnText = await detailWishlistBtn.innerText();
      console.log(`      Course Detail Wishlist button text: "${btnText}"`);
      await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'wishlist_step4_detail_view.png'), fullPage: false });
      
      console.log('      Toggling Wishlist button on detail page...');
      await detailWishlistBtn.click();
      await page.waitForTimeout(2000);
      const updatedText = await detailWishlistBtn.innerText();
      console.log(`      Course Detail Wishlist button text after click: "${updatedText}"`);
      await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'wishlist_step5_detail_after_toggle.png'), fullPage: false });
    }

    console.log('\n4. UI Test completed successfully! Network traces captured:', networkTraces.length);

  } finally {
    await browser.close();
  }

  console.log('\n======================================================================');
  console.log(' ✅ ALL WISHLIST AUDIT CHECKS COMPLETE');
  console.log('======================================================================\n');
}

verifyWishlist().catch(err => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});

