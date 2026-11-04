import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Intercept profile and users API for seamless mock preview
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/profile') || url.includes('/sub-admin')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'admin-1',
              role: 'admin',
              fullName: 'DevAdmin Lead',
              email: 'dev.cyberlearnix@gmail.com'
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
            { id: 'usr_01_77a9', name: 'Elena Rostova', email: 'elena.rostova@mit.edu', role: 'STUDENT', status: 'ACTIVE', createdAt: '2026-09-12', courses: 4 },
            { id: 'usr_02_44bc', name: 'Marcus Vance', email: 'marcus.v@cloudarch.io', role: 'INSTRUCTOR', status: 'ACTIVE', createdAt: '2026-08-20', courses: 8 },
            { id: 'usr_03_88ff', name: 'Dr. Sarah Chen', email: 'schen@berkeley.edu', role: 'INSTRUCTOR', status: 'ACTIVE', createdAt: '2026-07-14', courses: 12 },
            { id: 'usr_04_11aa', name: 'David Okafor', email: 'd.okafor@lagos.tech', role: 'STUDENT', status: 'ACTIVE', createdAt: '2026-10-01', courses: 2 },
          ]
        })
      });
    }
    return route.continue();
  });

  await page.goto('http://localhost:5173/');
  await page.evaluate(() => {
    localStorage.setItem('lms_token', 'mock_admin_token_jwt');
    localStorage.setItem('access_token', 'mock_admin_token_jwt');
    localStorage.setItem('lms_user', JSON.stringify({
      id: 'admin-1',
      role: 'admin',
      fullName: 'DevAdmin Lead',
      email: 'dev.cyberlearnix@gmail.com'
    }));
  });

  await page.goto('http://localhost:5173/admin/users', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/admin/03_admin_users.png' });
  await page.screenshot({ path: 'docs/asivo-2/PHASE2/screenshots/03_admin_users.png' });

  const buttonTexts = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
    return btns;
  });
  console.log('Detected button texts:', buttonTexts);

  await browser.close();
  console.log('Captured fresh 03_admin_users.png');
}

capture().catch(console.error);

