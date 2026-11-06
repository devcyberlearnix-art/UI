import { chromium } from 'playwright';

async function testUsersDirect() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Set routes BEFORE any navigation
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/me') || url.includes('/profile') || url.includes('/sub-admin') || url.includes('/auth')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'admin-1',
              role: 'admin',
              fullName: 'DevAdmin Lead',
              email: 'dev.cyberlearnix@gmail.com',
              permissions: ['*']
            }
          }
        })
      });
    }
    if (url.includes('/users') || url.includes('/dashboard')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          totalElements: 139,
          totalPages: 14,
          data: [
            { id: 'usr_01', name: 'Elena Rostova', email: 'elena.rostova@mit.edu', role: 'STUDENT', status: 'ACTIVE', createdAt: '2026-09-12', courses: 4 },
            { id: 'usr_02', name: 'Marcus Vance', email: 'marcus.v@cloudarch.io', role: 'INSTRUCTOR', status: 'ACTIVE', createdAt: '2026-08-20', courses: 8 }
          ]
        })
      });
    }
    return route.continue();
  });

  // 2. Set localStorage on init script
  await page.addInitScript(() => {
    const mockToken = 'mock-jwt-admin-token';
    localStorage.setItem('lms_token', mockToken);
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('lms_user', JSON.stringify({
      id: 'admin-1',
      role: 'admin',
      fullName: 'DevAdmin Lead',
      email: 'dev.cyberlearnix@gmail.com'
    }));
  });

  console.log('Navigating directly to /admin/users...');
  await page.goto('http://localhost:5173/admin/users', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/verified_direct_admin_users.png' });

  const result = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.innerText?.trim();
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean);
    const pageUrl = window.location.href;
    return { pageUrl, h1, buttons };
  });

  console.log('Final URL:', result.pageUrl);
  console.log('H1:', result.h1);
  console.log('Buttons:', result.buttons);

  await browser.close();
}

testUsersDirect().catch(console.error);
