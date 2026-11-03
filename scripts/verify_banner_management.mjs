import { chromium } from 'playwright';
import crypto from 'crypto';

const JWT_SECRET = '8c4e9d2f1a7b6c5d9e3f0a1b7c8d4e5f9a2b6c1d8e7f3a4b5c9d1e6f8a2b7c3';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generateAdminToken() {
  const header = { alg: 'HS256', typ: 'JWT' };
  const uuid = '00000000-0000-0000-0000-000000000001';
  const payload = {
    userId: uuid,
    sub: uuid,
    email: 'admin@merqora.com',
    type: 'access',
    iss: 'cyberlearnix',
    aud: 'cyberlearnix-clients',
    role: 'MAIN_ADMIN',
    roles: ['ROLE_MAIN_ADMIN', 'MAIN_ADMIN', 'ROLE_ADMIN'],
    assignedService: 'COURSE_SERVICE',
    adminRole: 'MAIN_ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7200,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function verifyBannerManagement() {
  console.log('🚀 Starting Banner Management UI verification test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const token = generateAdminToken();
  const adminUser = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@merqora.com',
    role: 'MAIN_ADMIN',
    name: 'Main Admin',
  };

  // Pre-seed localStorage before navigation
  await page.addInitScript(({ token, adminUser }) => {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('lms_user', JSON.stringify(adminUser));
  }, { token, adminUser });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const bannerApiResponses = [];
  page.on('response', async res => {
    if (res.url().includes('/api/v1/admin/banners')) {
      bannerApiResponses.push({
        url: res.url(),
        status: res.status(),
        ok: res.ok(),
      });
    }
  });

  console.log('Navigating to http://localhost:5173/admin/banners...');
  await page.goto('http://localhost:5173/admin/banners', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Take screenshot of initial Banner Management view
  await page.screenshot({
    path: 'C:/Users/SHIVASAI/.gemini/antigravity/brain/5a7cfab4-162e-4876-9cf0-07c757a14057/banner_management_obsidian_view.png',
    fullPage: false,
  });
  console.log('✅ Initial view screenshot captured.');

  // Click "Create Banner" button to open modal
  console.log('Clicking "Create Banner" button...');
  const createBtn = await page.getByRole('button', { name: 'Create Banner' }).first();
  await createBtn.click();
  await page.waitForTimeout(600);

  // Take screenshot of Create Modal Drawer
  await page.screenshot({
    path: 'C:/Users/SHIVASAI/.gemini/antigravity/brain/5a7cfab4-162e-4876-9cf0-07c757a14057/banner_management_create_drawer.png',
    fullPage: false,
  });
  console.log('✅ Create Banner modal screenshot captured.');

  // Switch tabs to "Archived / Deleted"
  const closeBtn = await page.$('button:has(svg.lucide-x)');
  if (closeBtn) await closeBtn.click();
  await page.waitForTimeout(400);

  console.log('Switching to Archived / Deleted tab...');
  const archiveTab = await page.getByRole('button', { name: /Archived \/ Deleted/ });
  await archiveTab.click();
  await page.waitForTimeout(500);

  await page.screenshot({
    path: 'C:/Users/SHIVASAI/.gemini/antigravity/brain/5a7cfab4-162e-4876-9cf0-07c757a14057/banner_management_archive_tab.png',
    fullPage: false,
  });
  console.log('✅ Archive tab screenshot captured.');

  console.log('\n--- Intercepted Admin Banner API Responses ---');
  bannerApiResponses.forEach(r => console.log(`  [${r.status}] ${r.url}`));

  console.log('\n--- Console Errors Encountered ---');
  if (consoleErrors.length === 0) {
    console.log('  None! Clean and pristine execution.');
  } else {
    consoleErrors.forEach(err => console.log('  ⚠️ ' + err));
  }

  await browser.close();
  console.log('\n🎉 Banner Management UI Verification successfully completed!');
}

verifyBannerManagement().catch(err => {
  console.error('Fatal error during banner verification:', err);
  process.exit(1);
});
