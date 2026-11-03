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

async function verifyProfileWorkspace() {
  console.log('======================================================================');
  console.log(' 👤 VERIFYING PROFILE WORKSPACE RENDERING & TELEMETRY');
  console.log('======================================================================\n');

  // Authenticate student
  console.log('1. Authenticating Student...');
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-student-profile-tester',
    email: 'profile.tester@cyberlearnix.dev',
    name: 'Profile QA Tester'
  });
  const studentToken = studentLogin.data.authentication.accessToken;
  const studentUser = studentLogin.data.user;

  console.log(`   -> Student User: ${studentUser.email}`);
  console.log(`   -> Token: ${studentToken.substring(0, 20)}...\n`);

  // Launch Playwright
  console.log('2. Launching Playwright browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Inject authentication into localStorage
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', 'STUDENT');
  }, { token: studentToken, user: studentUser });

  console.log('3. Navigating to http://localhost:5173/student/profile...');
  await page.goto(`${UI_URL}/student/profile`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const screenshotPath = path.join(SNAPSHOT_DIR, 'profile_workspace_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`   📸 Screenshot saved: ${screenshotPath}\n`);

  console.log('4. Error check:');
  const typeErrors = consoleErrors.filter(e => e.includes('TypeError') || e.includes('Cannot read properties'));
  if (typeErrors.length === 0) {
    console.log('   ✅ 0 TypeError / null reference errors in console!');
  } else {
    console.log(`   ❌ Detected ${typeErrors.length} TypeErrors:`, typeErrors);
  }

  const allErrors = consoleErrors.filter(e => !e.includes('favicon'));
  console.log(`   Total Console Errors: ${allErrors.length}`);
  if (allErrors.length > 0) {
    console.log('   Errors detail:', allErrors);
  }

  await browser.close();
  console.log('\n======================================================================');
  console.log(' 🏁 PROFILE WORKSPACE VERIFICATION COMPLETE');
  console.log('======================================================================');
}

verifyProfileWorkspace().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

