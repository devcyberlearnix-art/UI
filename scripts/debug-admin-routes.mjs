// scripts/debug-admin-routes.mjs
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Error')) {
      console.log('CONSOLE:', msg.type(), msg.text());
    }
  });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.stack || err));

  // Set up Admin session
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    const adminUser = {
      id: 'admin-e2e-id',
      email: 'admin@cyberlearnix.dev',
      firstName: 'Verified',
      lastName: 'Admin',
      role: 'admin'
    };
    const mockToken = 'mock-valid-e2e-jwt-token';
    localStorage.setItem('lms_token', mockToken);
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('lms_user', JSON.stringify(adminUser));
  });

  const routesToTest = [
    '/admin/command-center',
    '/admin/certificates',
    '/admin/analytics',
    '/admin/gamification'
  ];

  for (const route of routesToTest) {
    console.log(`\nTesting: http://localhost:5173${route}`);
    await page.goto(`http://localhost:5173${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML || '');
    console.log(`Length of #root HTML: ${rootHtml.length}`);
    if (rootHtml.length < 50) {
      console.log(`Short content in #root:`, rootHtml);
    } else {
      console.log(`Snippet: ${rootHtml.substring(0, 200)}...`);
    }
  }

  await browser.close();
})();
