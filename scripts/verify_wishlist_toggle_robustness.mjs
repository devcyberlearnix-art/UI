import { chromium } from 'playwright';
import axios from 'axios';
import path from 'path';

const UI_URL = 'http://localhost:5173';
const BASE_URL = 'http://localhost:8080';

async function testWishlistRobustness() {
  console.log('======================================================================');
  console.log(' 💖 VERIFYING WISHLIST TOGGLE ROBUSTNESS & 409 CONFLICT IMMUNITY');
  console.log('======================================================================\n');

  // Authenticate student
  const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-shiva-login',
    email: 'shiva91826025@gmail.com',
    name: 'sai shiva'
  });
  const token = loginRes.data.authentication.accessToken;
  const user = loginRes.data.user;

  // Ensure clean state: remove course 17 from wishlist if present initially
  try {
    await axios.delete(`${BASE_URL}/api/v1/wishlist/17`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✅ Cleaned initial wishlist state for course 17');
  } catch (_) {}

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const failedRequests = [];
  const consoleErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log('   ❌ [Console Error]:', msg.text());
    } else if (msg.text().includes('/wishlist')) {
      console.log('   ℹ️ [Console API]:', msg.text());
    }
  });

  page.on('requestfailed', req => {
    failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
  });

  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('jwt', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', 'STUDENT');
    sessionStorage.setItem('lms_token', token);
    sessionStorage.setItem('accessToken', token);
  }, { token, user });

  console.log('1. Navigating to http://localhost:5173/courses/17...');
  await page.goto(`${UI_URL}/courses/17`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Locate Wishlist button
  const wishlistBtn = page.locator('button:has-text("Wishlist"), button:has-text("Saved")').first();
  await wishlistBtn.waitFor({ state: 'visible', timeout: 5000 });

  console.log('\n2. Testing rapid click on Wishlist button (Simulating race / double-click)...');
  // Click twice rapidly
  await Promise.all([
    wishlistBtn.click(),
    wishlistBtn.click({ delay: 50 }).catch(() => {})
  ]);

  await page.waitForTimeout(2500);

  // Check state after add
  const isSavedAfterAdd = await page.locator('button:has-text("Saved")').count() > 0;
  console.log('   -> Button label is "Saved":', isSavedAfterAdd);

  // Verify backend check endpoint
  const checkRes1 = await axios.get(`${BASE_URL}/api/v1/wishlist/check/17`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('   -> Backend check inWishlist after add:', checkRes1.data);

  console.log('\n3. Testing toggle OFF (Remove from Wishlist)...');
  const savedBtn = page.locator('button:has-text("Saved")').first();
  await savedBtn.click();
  await page.waitForTimeout(2500);

  const isWishlistAfterRemove = await page.locator('button:has-text("Wishlist")').count() > 0;
  console.log('   -> Button label is back to "Wishlist":', isWishlistAfterRemove);

  const checkRes2 = await axios.get(`${BASE_URL}/api/v1/wishlist/check/17`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('   -> Backend check inWishlist after remove:', checkRes2.data);

  console.log('\n4. Verification Summary:');
  console.log(`   - 409 Conflict errors captured: ${consoleErrors.filter(e => e.includes('409')).length}`);
  console.log(`   - Unhandled console errors: ${consoleErrors.length}`);
  console.log(`   - Failed network requests: ${failedRequests.length}`);

  await page.screenshot({ path: path.resolve('telemetry_snapshots/wishlist_robustness_verified.png'), fullPage: true });
  console.log('   📸 Screenshot saved: telemetry_snapshots/wishlist_robustness_verified.png');

  await browser.close();

  if (consoleErrors.filter(e => e.includes('409')).length > 0) {
    throw new Error('409 Conflict was not handled gracefully!');
  }

  console.log('\n======================================================================');
  console.log(' 🏁 WISHLIST ROBUSTNESS VERIFICATION COMPLETED SUCCESSFULLY');
  console.log('======================================================================');
}

testWishlistRobustness().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});

