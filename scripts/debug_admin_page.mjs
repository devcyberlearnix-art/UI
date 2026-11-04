import { chromium } from 'playwright';

async function check() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Mock API routes to avoid 401 kicks when backend is not actively running
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/profile') || url.includes('/sub-admin')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'admin_01',
              email: 'admin@asivo.internal',
              firstName: 'Dr. Aris',
              lastName: 'Thorne',
              role: 'admin',
              permissions: ['*']
            }
          }
        })
      });
    }
    // For other endpoints, if it's GET return empty list or valid mock
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: [],
          content: [],
          totalElements: 0
        })
      });
    }
    return route.continue();
  });

  await page.addInitScript(() => {
    const adminUser = {
      id: 'admin-e2e-id',
      email: 'admin@cyberlearnix.dev',
      firstName: 'Verified',
      lastName: 'Admin',
      role: 'admin',
      permissions: ['*']
    };
    const mockToken = 'mock-valid-e2e-jwt-token';
    localStorage.setItem('lms_token', mockToken);
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('lms_user', JSON.stringify(adminUser));
  });

  await page.goto('http://localhost:5173/admin/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());
  const rootText = await page.evaluate(() => document.body.innerText);
  console.log('Body Text Snippet (first 400 chars):\n', rootText.substring(0, 400));
  await browser.close();
}

check();
