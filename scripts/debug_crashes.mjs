import { chromium } from 'playwright';

async function debugCrashes() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  page.on('console', msg => {
    if (msg.type() === 'error') console.log('[CONSOLE ERROR]:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('[PAGE ERROR]:', err.message);
    console.log(err.stack);
  });

  await page.route('**/api/v1/**', route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'SUCCESS', data: [], content: [] })
    });
  });

  await page.addInitScript(() => {
    const adminUser = {
      id: 'admin-e2e-id',
      email: 'admin@asivo.internal',
      firstName: 'Dr. Aris',
      lastName: 'Thorne',
      role: 'admin',
      permissions: ['*']
    };
    const mockToken = 'mock-valid-e2e-jwt-token';
    localStorage.setItem('lms_token', mockToken);
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('lms_user', JSON.stringify(adminUser));
  });

  console.log('\n--- DEBUGGING /admin/roles ---');
  await page.goto('http://localhost:5173/admin/roles');
  await page.waitForTimeout(1000);

  console.log('\n--- DEBUGGING /admin/website-management/hero ---');
  await page.goto('http://localhost:5173/admin/website-management/hero');
  await page.waitForTimeout(1000);

  await browser.close();
}

debugCrashes();

