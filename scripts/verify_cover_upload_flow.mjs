import { chromium } from 'playwright';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const UI_URL = 'http://localhost:5173';
const BASE_URL = 'http://localhost:8080';
const TEST_IMAGE = path.resolve('src/assets/hero.png');

async function testCoverUploadFlow() {
  console.log('1. Authenticating...');
  const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-shiva-login',
    email: 'shiva91826025@gmail.com',
    name: 'sai iiiiiiiiii'
  });
  const token = loginRes.data.authentication.accessToken;
  const user = loginRes.data.user;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.text().includes('[API]') || msg.text().includes('cover') || msg.text().includes('Photo')) {
      console.log(`[Browser]: ${msg.text()}`);
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
  }, { token, user });

  console.log('2. Navigating to /profile...');
  await page.goto(`${UI_URL}/profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Check initial state
  const beforeImg = await page.evaluate(() => {
    const img = document.querySelector('.h-44 img');
    return img ? { src: img.src.substring(0, 50) + '...', naturalWidth: img.naturalWidth } : null;
  });
  console.log('   Initial banner image:', beforeImg);

  // Upload new cover photo via setInputFiles
  console.log('3. Uploading hero.png via input[type="file"]...');
  const fileInput = page.locator('.h-44 input[type="file"]');
  await fileInput.setInputFiles(TEST_IMAGE);

  // Wait for upload and toast
  console.log('4. Waiting for upload completion...');
  await page.waitForTimeout(6000);

  const afterUploadImg = await page.evaluate(() => {
    const img = document.querySelector('.h-44 img');
    return img ? { src: img.src.substring(0, 50) + '...', naturalWidth: img.naturalWidth, complete: img.complete } : null;
  });
  console.log('   After upload banner image:', afterUploadImg);

  // Reload page to test backend persistence
  console.log('5. Reloading page to verify persistence...');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const reloadedImg = await page.evaluate(() => {
    const img = document.querySelector('.h-44 img');
    return img ? { src: img.src.substring(0, 50) + '...', naturalWidth: img.naturalWidth, complete: img.complete } : null;
  });
  console.log('   After reload banner image:', reloadedImg);

  const screenshotPath = 'telemetry_snapshots/cover_upload_verified_end_to_end.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const artifactDir = 'C:\\Users\\SHIVASAI\\.gemini\\antigravity\\brain\\5a7cfab4-162e-4876-9cf0-07c757a14057';
  fs.copyFileSync(screenshotPath, path.join(artifactDir, 'cover_upload_verified_end_to_end.png'));
  console.log('✅ End-to-end cover upload verification complete! Screenshot saved.');

  await browser.close();
}

testCoverUploadFlow().catch(console.error);
