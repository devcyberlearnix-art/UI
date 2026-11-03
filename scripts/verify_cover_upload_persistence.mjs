import { chromium } from 'playwright';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';
const UI_URL = 'http://localhost:5173';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');

async function testCoverUploadFlow() {
  console.log('======================================================================');
  console.log(' 🖼️ VERIFYING COVER PHOTO UPLOAD & PERSISTENCE END-TO-END');
  console.log('======================================================================\n');

  // Authenticate
  const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-shiva-login',
    email: 'shiva91826025@gmail.com',
    name: 'sai shiva'
  });
  const token = loginRes.data.authentication.accessToken;
  const user = loginRes.data.user;

  // Create test cover banner (600x200 PNG)
  const testCoverPath = path.resolve('telemetry_snapshots/test_banner.png');
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAlgAAADIAQMAAADv0Z0SAAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAAFpJREFUeNrtwTEBAAAAwqD1T20ND6AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/BhpkwABw8jW8wAAAABJRU5ErkJggg==';
  fs.writeFileSync(testCoverPath, Buffer.from(pngBase64, 'base64'));
  console.log('   ✅ Test banner asset created:', testCoverPath);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('   ❌ [Console Error]:', msg.text());
    if (msg.text().includes('/cover-photo') || msg.text().includes('/photo/')) {
      console.log('   ℹ️ [Console Photo Call]:', msg.text());
    }
  });

  // Seed storage
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

  console.log('1. Navigating to http://localhost:5173/profile...');
  await page.goto(`${UI_URL}/profile`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('\n2. Triggering cover photo upload...');
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.locator('button:has-text("Change Cover")').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(testCoverPath);
  console.log('   -> File selected and submitted');

  // Wait for upload request to complete
  await page.waitForTimeout(4000);

  // Check toast notification
  const toastText = await page.evaluate(() => {
    const toast = document.querySelector('[role="status"]');
    return toast ? toast.innerText : 'NO TOAST';
  });
  console.log('   -> Toast status:', toastText);

  // Check cover image immediately after upload
  let coverInfo = await page.evaluate(() => {
    const img = document.querySelector('img[alt="Obsidian Cover"]');
    if (!img) return { found: false };
    return {
      found: true,
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      isVisible: img.offsetWidth > 0 && img.offsetHeight > 0
    };
  });
  console.log('   -> Immediate Cover Status:', coverInfo);

  // Reload page to verify persistence
  console.log('\n3. Reloading page to test persistence across sessions...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  coverInfo = await page.evaluate(() => {
    const img = document.querySelector('img[alt="Obsidian Cover"]');
    if (!img) return { found: false };
    return {
      found: true,
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      isVisible: img.offsetWidth > 0 && img.offsetHeight > 0
    };
  });
  console.log('   -> Reloaded Cover Status:', coverInfo);

  const screenshotPath = path.join(SNAPSHOT_DIR, 'profile_cover_persistence_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('   📸 Screenshot saved:', screenshotPath);

  const artifactDir = 'C:\\Users\\SHIVASAI\\.gemini\\antigravity\\brain\\5a7cfab4-162e-4876-9cf0-07c757a14057';
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(screenshotPath, path.join(artifactDir, 'profile_cover_persistence_verified.png'));
    console.log('   📸 Copied to artifact directory');
  }

  await browser.close();
  console.log('\n======================================================================');
  console.log(' 🏁 TEST COMPLETED');
  console.log('======================================================================');
}

testCoverUploadFlow().catch(err => {
  console.error('Fatal Upload Flow Error:', err);
  process.exit(1);
});

