import { chromium } from 'playwright';
import axios from 'axios';
import path from 'path';

const UI_URL = 'http://localhost:5173';
const BASE_URL = 'http://localhost:8080';

async function verifyCourseDetail() {
  console.log('======================================================================');
  console.log(' 🔍 VERIFYING COURSE DETAIL KEY WARNINGS & TAB INTERACTION');
  console.log('======================================================================\n');

  // Authenticate as student
  const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-shiva-login',
    email: 'shiva91826025@gmail.com',
    name: 'sai shiva'
  });
  const token = loginRes.data.authentication.accessToken;
  const user = loginRes.data.user;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const keyWarnings = [];
  const allConsoleWarnings = [];
  const allConsoleErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('unique "key" prop') || text.includes('warning-keys')) {
      keyWarnings.push(text);
      console.log('   🚨 [KEY WARNING]:', text);
    } else if (msg.type() === 'warning') {
      allConsoleWarnings.push(text);
    } else if (msg.type() === 'error') {
      allConsoleErrors.push(text);
      console.log('   ❌ [CONSOLE ERROR]:', text);
    }
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

  console.log('1. Navigating to http://localhost:5173/courses/2...');
  await page.goto(`${UI_URL}/courses/2`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Curriculum sections check
  const sectionCount = await page.locator('.space-y-3 > .rounded-xl').count();
  console.log(`   -> Found ${sectionCount} curriculum sections rendered`);

  // Test expanding the first section
  console.log('\n2. Toggling first curriculum section...');
  const firstSectionButton = page.locator('.space-y-3 > .rounded-xl button').first();
  await firstSectionButton.click();
  await page.waitForTimeout(1000);

  const lessonsCount = await page.locator('.divide-y > div').count();
  console.log(`   -> Lessons rendered inside expanded section: ${lessonsCount}`);

  // Test clicking other tabs
  console.log('\n3. Clicking each tab to verify all list keys...');
  const tabNames = ['Learning Outcomes', 'Prerequisites', 'Verified Reviews', 'Operational FAQs', 'Curriculum'];
  for (const name of tabNames) {
    const tabButton = page.locator(`button:has-text("${name}")`).first();
    if (await tabButton.isVisible()) {
      await tabButton.click();
      await page.waitForTimeout(600);
      console.log(`   -> Switched to tab: ${name}`);
    }
  }

  await page.waitForTimeout(1500);

  console.log('\n4. Verification Results:');
  console.log(`   - "unique key prop" warnings: ${keyWarnings.length} ${keyWarnings.length === 0 ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   - Other console errors: ${allConsoleErrors.length} ${allConsoleErrors.length === 0 ? '✅ PASSED' : '⚠️ WARNINGS EXIST'}`);

  await page.screenshot({ path: path.resolve('telemetry_snapshots/course_detail_keys_verified.png'), fullPage: true });
  console.log('   📸 Screenshot saved: telemetry_snapshots/course_detail_keys_verified.png');

  await browser.close();

  if (keyWarnings.length > 0) {
    throw new Error(`Verification failed: ${keyWarnings.length} unique key warnings detected`);
  }

  console.log('\n======================================================================');
  console.log(' 🏁 VERIFICATION COMPLETE - ALL UNIQUE KEYS VERIFIED');
  console.log('======================================================================');
}

verifyCourseDetail().catch(err => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
