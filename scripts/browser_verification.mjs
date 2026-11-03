import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\SHIVASAI\\.gemini\\antigravity\\brain\\1af55def-0ef5-4fa2-9389-ff708389a60c';
const BASE_URL = 'http://localhost:4173';

async function runBrowserVerification() {
  console.log('='.repeat(80));
  console.log('STARTING AUTOMATED PLAYWRIGHT BROWSER VERIFICATION');
  console.log('='.repeat(80));

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('requestfailed', (req) => {
    networkErrors.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText}`);
  });

  // 1. Desktop Landing Page
  console.log('\n[1] Testing Desktop Landing Page (1440x900)...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Check title
  const title = await page.title();
  console.log(`Page Title: "${title}"`);

  // Verify Hero heading
  const heroHeading = await page.locator('h1').first().textContent();
  console.log(`Live Hero Heading rendered in DOM: "${heroHeading?.trim()}"`);

  // Verify Navigation links in Header
  const navLinks = await page.locator('header nav a, header a').allTextContents();
  console.log(`Header Navigation items found:`, navLinks.map(s => s.trim()).filter(Boolean).slice(0, 8));

  // Verify Search input
  const searchInput = page.locator('input[type="text"], input[placeholder*="Search"]').first();
  const searchCount = await searchInput.count();
  console.log(`Search Input Element present: ${searchCount > 0}`);

  // Check Horizontal Overflow on Desktop
  const desktopOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Desktop Horizontal Overflow: ${desktopOverflow ? 'DETECTED (FAIL)' : 'NONE (PASS)'}`);

  // Screenshot Desktop
  const desktopShot = path.join(ARTIFACT_DIR, 'browser_desktop_landing.png');
  await page.screenshot({ path: desktopShot, fullPage: false });
  console.log(`Saved screenshot: ${desktopShot}`);

  // 2. Mobile Landing Page Viewport (iPhone SE / 375x667)
  console.log('\n[2] Testing Mobile Viewport (375x667)...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const mobileOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  console.log(`Mobile Horizontal Overflow: ${mobileOverflow ? 'DETECTED (FAIL)' : 'NONE (PASS)'}`);

  // Screenshot Mobile
  const mobileShot = path.join(ARTIFACT_DIR, 'browser_mobile_landing.png');
  await page.screenshot({ path: mobileShot, fullPage: false });
  console.log(`Saved screenshot: ${mobileShot}`);

  // 3. Admin Authentication & Website Management Hub
  console.log('\n[3] Testing Admin Website Management Hub...');
  await page.setViewportSize({ width: 1440, height: 900 });

  // Inject authenticated admin token into localStorage
  const loginRes = await fetch('http://localhost:8079/api/v1/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'dev.cyberlearnix@gmail.com', password: 'MainAdmin@123' })
  });
  const loginData = await loginRes.json();
  const token = loginData?.authentication?.accessToken;
  const adminObj = loginData?.admin;

  await page.evaluate(({ token, adminObj }) => {
    const adminUser = { ...adminObj, role: 'super_admin' };
    localStorage.setItem('lms_token', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('lms_user', JSON.stringify(adminUser));
  }, { token, adminObj });

  // Navigate to Website Management Hub
  await page.goto(`${BASE_URL}/admin/website-management`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const hubHeading = await page.locator('h1').textContent().catch(() => 'None');
  console.log(`Website Management Hub Heading: "${hubHeading?.trim()}"`);

  // Screenshot Admin Hub
  const hubShot = path.join(ARTIFACT_DIR, 'browser_admin_cms_hub.png');
  await page.screenshot({ path: hubShot, fullPage: false });
  console.log(`Saved screenshot: ${hubShot}`);

  // 4. Test Hero Editor Route
  console.log('\n[4] Testing Hero Editor Route in Browser...');
  await page.goto(`${BASE_URL}/admin/website-management/hero`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const heroEditorHeading = await page.locator('h1').textContent().catch(() => 'None');
  console.log(`Hero Editor Route Heading: "${heroEditorHeading?.trim()}"`);

  const heroEditorShot = path.join(ARTIFACT_DIR, 'browser_hero_editor.png');
  await page.screenshot({ path: heroEditorShot, fullPage: false });
  console.log(`Saved screenshot: ${heroEditorShot}`);

  // Filter ignorable console warnings/errors
  const relevantConsoleErrors = consoleErrors.filter(e => 
    !e.includes('favicon') && !e.includes('chrome-extension') && !e.includes('404 (Not Found)')
  );

  console.log('\n' + '='.repeat(80));
  console.log(`Console Errors: ${relevantConsoleErrors.length}`);
  if (relevantConsoleErrors.length > 0) {
    relevantConsoleErrors.slice(0, 5).forEach((e, idx) => console.log(`  [${idx+1}] ${e}`));
  }
  console.log(`Network Failures: ${networkErrors.length}`);
  if (networkErrors.length > 0) {
    networkErrors.slice(0, 5).forEach((e, idx) => console.log(`  [${idx+1}] ${e}`));
  }
  console.log('='.repeat(80));

  await browser.close();
  console.log('BROWSER VERIFICATION COMPLETE.');
}

runBrowserVerification().catch(err => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
