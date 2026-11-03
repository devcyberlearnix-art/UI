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

async function verifyCoverPhoto() {
  console.log('======================================================================');
  console.log(' 🖼️ VERIFYING COVER PHOTO VISIBILITY IN PROFILE WORKSPACE');
  console.log('======================================================================\n');

  // Step 1: Login as the actual user from the screenshot
  console.log('1. Authenticating as user: shiva91826025@gmail.com...');
  const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-shiva-login',
    email: 'shiva91826025@gmail.com',
    name: 'sai iiiiiiiiii'
  });
  const token = loginRes.data.authentication.accessToken;
  const user = loginRes.data.user;

  console.log(`   -> User ID: ${user.id}`);
  console.log(`   -> Email: ${user.email}`);

  // Check /api/v1/users/me response
  const meRes = await axios.get(`${BASE_URL}/api/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const meData = meRes.data?.data || meRes.data;
  console.log(`   -> profilePhoto in DB: ${meData.profilePhoto}`);
  console.log(`   -> coverPhoto in DB: ${meData.coverPhoto}`);

  // Test the public photo proxy endpoint directly
  console.log('\n2. Testing unauthenticated public access to photo proxy endpoint...');
  const fileId = '1j-pH25MrbYrQMWfe0ocfGlo7IDD1Rw4C';
  try {
    const proxyRes = await axios.get(`${BASE_URL}/api/v1/users/photo/${fileId}`, {
      responseType: 'arraybuffer'
    });
    console.log(`   ✅ Proxy endpoint Status: ${proxyRes.status} (Length: ${proxyRes.data.length} bytes, Content-Type: ${proxyRes.headers['content-type']})`);
  } catch (err) {
    console.error(`   ❌ Proxy endpoint failed: ${err.response?.status} - ${err.message}`);
  }

  // Step 3: Launch Playwright and verify UI
  console.log('\n3. Launching Headless Chromium to check Cover Photo in UI...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`   [UI Console ${msg.type()}]: ${msg.text()}`);
  });

  // Inject authentication into localStorage with exact AuthContext keys
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('jwt', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', 'STUDENT');
  }, { token, user });

  console.log('   -> Navigating to http://localhost:5173/profile...');
  await page.goto(`${UI_URL}/profile`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Check cover image element
  const coverImg = page.locator('img[alt="Obsidian Cover"]');
  const count = await coverImg.count();
  console.log(`\n   -> Found ${count} Obsidian Cover img element(s)`);

  if (count > 0) {
    const src = await coverImg.getAttribute('src');
    const isVisible = await coverImg.isVisible();
    const naturalWidth = await coverImg.evaluate(img => img.naturalWidth);
    const naturalHeight = await coverImg.evaluate(img => img.naturalHeight);

    console.log(`   -> Image src: ${src?.substring(0, 50)}...`);
    console.log(`   -> Element isVisible: ${isVisible}`);
    console.log(`   -> Natural Dimensions: ${naturalWidth} x ${naturalHeight}`);

    if (naturalWidth > 0 && naturalHeight > 0) {
      console.log('   🎉 SUCCESS: Cover photo loaded and rendered with natural dimensions > 0!');
    } else {
      console.error('   ❌ FAILURE: Cover photo image has natural dimensions of 0 (broken image)!');
    }
  }

  const screenshotPath = path.join(SNAPSHOT_DIR, 'profile_cover_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`   📸 Saved screenshot: ${screenshotPath}`);

  await browser.close();
  console.log('\n======================================================================');
  console.log(' 🏁 VERIFICATION COMPLETE');
  console.log('======================================================================');
}

verifyCoverPhoto().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
