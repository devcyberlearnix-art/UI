import { chromium } from 'playwright';

async function checkScreens() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
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
  
  // 1. Settings
  await page.goto('http://localhost:5173/admin/settings', { waitUntil: 'networkidle' });
  console.log('Settings Page URL:', page.url());
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/debug_admin_settings_now.png' });
  const siteNameVal = await page.evaluate(() => {
    const input = document.querySelector('input');
    return input ? input.value : 'none';
  });
  console.log('Admin Settings Site Name:', siteNameVal);

  // 2. Courses
  await page.goto('http://localhost:5173/admin/courses', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/debug_admin_courses_now.png' });
  const firstCourseInstructor = await page.evaluate(() => {
    const row = document.querySelector('tbody tr td:nth-child(2)');
    return row ? row.innerText.trim() : 'none';
  });
  console.log('Admin Courses First Instructor:', firstCourseInstructor);

  // 3. Orders
  await page.goto('http://localhost:5173/admin/orders', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/debug_admin_orders_now.png' });
  const firstOrderTitle = await page.evaluate(() => {
    const row = document.querySelector('tbody tr td:nth-child(3)');
    return row ? row.innerText.trim() : 'none';
  });
  console.log('Admin Orders First Curriculum:', firstOrderTitle);

  // 4. Reports
  await page.goto('http://localhost:5173/admin/reports', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/debug_admin_reports_now.png' });
  console.log('Admin Reports captured.');

  await browser.close();
}

checkScreens().catch(console.error);
