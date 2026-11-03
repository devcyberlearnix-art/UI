import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:4173';

async function auditBrowserJourneys() {
  console.log('====================================================');
  console.log('   ASIVO LMS VERSION 20 - BROWSER JOURNEY AUDIT     ');
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const results = [];
  const pageErrors = [];
  const consoleErrors = [];

  const visit = async (page, path, roleName, expectedSelectors = []) => {
    console.log(`Navigating to ${path} as ${roleName}...`);
    try {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      const title = await page.title();
      const currentUrl = page.url();
      const bodyText = await page.innerText('body');
      const hasCrashed = bodyText.includes('Application Crashed') || bodyText.includes('useEffect is not defined');

      let foundSelectors = 0;
      for (const sel of expectedSelectors) {
        const count = await page.locator(sel).count();
        if (count > 0) foundSelectors++;
      }

      const pass = !hasCrashed && (expectedSelectors.length === 0 || foundSelectors > 0);
      results.push({
        path,
        roleName,
        currentUrl,
        title,
        pass,
        hasCrashed,
        foundSelectors,
        totalExpected: expectedSelectors.length,
        snippet: bodyText.slice(0, 150).replace(/\n/g, ' ')
      });

      console.log(`[${pass ? '✅ PASS' : '❌ FAIL'}] ${path} (${roleName}) | Title: "${title}" | Crashed: ${hasCrashed}`);
    } catch (err) {
      console.error(`[❌ FAIL] ${path} (${roleName}) Error: ${err.message}`);
      results.push({
        path,
        roleName,
        pass: false,
        error: err.message
      });
    }
  };

  const setupLogging = (page) => {
    page.on('pageerror', (err) => {
      console.error(`[PAGE ERROR] ${err.message}`);
      pageErrors.push({ url: page.url(), message: err.message });
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon.ico')) {
          console.error(`[CONSOLE ERROR] ${text}`);
          consoleErrors.push({ url: page.url(), message: text });
        }
      }
    });
  };

  // 1. GUEST CONTEXT
  console.log('--- 1. GUEST JOURNEY ---');
  const guestCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const guestPage = await guestCtx.newPage();
  setupLogging(guestPage);

  await visit(guestPage, '/', 'Guest', ['header', 'nav']);
  await visit(guestPage, '/courses', 'Guest', ['input', 'button']);
  await visit(guestPage, '/courses/6', 'Guest', ['button']);
  await visit(guestPage, '/cart', 'Guest', ['button']);
  await visit(guestPage, '/login', 'Guest', ['input[type="email"]', 'input[type="password"]']);
  await guestCtx.close();

  // 2. STUDENT CONTEXT
  console.log('\n--- 2. STUDENT JOURNEY ---');
  const studentCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const studentPage = await studentCtx.newPage();
  setupLogging(studentPage);

  await studentPage.goto(`${BASE_URL}/login`);
  await studentPage.fill('input[type="email"]', 'student_browser_1792166505208@cyberlearnix.dev');
  await studentPage.fill('input[type="password"]', 'Pass@Browser5208!');
  await studentPage.click('button[type="submit"]');
  await studentPage.waitForTimeout(3000);

  await visit(studentPage, '/profile', 'Student');
  await visit(studentPage, '/my-courses', 'Student');
  await visit(studentPage, '/cart', 'Student');
  await studentCtx.close();

  // 3. ADMIN CONTEXT
  console.log('\n--- 3. ADMIN JOURNEY ---');
  const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const adminPage = await adminCtx.newPage();
  setupLogging(adminPage);

  await adminPage.goto(`${BASE_URL}/login`);
  await adminPage.fill('input[type="email"]', 'dev.cyberlearnix@gmail.com');
  await adminPage.fill('input[type="password"]', 'MainAdmin@123');
  await adminPage.click('button[type="submit"]');
  await adminPage.waitForTimeout(3000);

  await visit(adminPage, '/admin/dashboard', 'Admin');
  await visit(adminPage, '/admin/courses', 'Admin');
  await visit(adminPage, '/admin/users', 'Admin');
  await visit(adminPage, '/admin/instructors', 'Admin');
  await visit(adminPage, '/admin/coupons', 'Admin');
  await visit(adminPage, '/admin/banners', 'Admin');
  await visit(adminPage, '/admin/website-management', 'Admin');
  await adminCtx.close();

  // Summary
  fs.writeFileSync('scripts/v20_browser_journey_results.json', JSON.stringify({
    results,
    pageErrors,
    consoleErrors
  }, null, 2));

  console.log('\n====================================================');
  console.log(`Browser Journey Audit Complete: ${results.filter(r => r.pass).length} / ${results.length} PASSED`);
  console.log(`Page Errors: ${pageErrors.length} | Console Errors: ${consoleErrors.length}`);
  console.log('====================================================');

  await browser.close();
}

auditBrowserJourneys();
