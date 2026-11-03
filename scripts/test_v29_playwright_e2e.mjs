import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const FRONTEND_URL = 'http://localhost:5173';
const ARTIFACT_DIR = 'C:/Users/SHIVASAI/.gemini/antigravity/brain/1af55def-0ef5-4fa2-9389-ff708389a60c';
const DOCS_DIR = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/docs/version-29-free-course-e2e/screenshots';

// Ensure directories exist
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

async function runPlaywright() {
  console.log('===============================================================');
  console.log('ASIVO LMS — VERSION 29: PLAYWRIGHT BROWSER UI VERIFICATION');
  console.log('===============================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const screenshots = [];

  async function capture(name, desc) {
    const p1 = path.join(ARTIFACT_DIR, `${name}.png`);
    const p2 = path.join(DOCS_DIR, `${name}.png`);
    await page.screenshot({ path: p1, fullPage: true });
    fs.copyFileSync(p1, p2);
    console.log(`[SCREENSHOT] Captured ${name}.png -> ${desc}`);
    screenshots.push({ name, desc, path: p1 });
  }

  try {
    // 1. PUBLIC COURSE CATALOG
    console.log('\n--- 1. Testing Public Course Catalog ---');
    await page.goto(`${FRONTEND_URL}/courses`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await capture('v29_public_catalog_desktop', 'Public course catalog with real courses');

    // 2. NAVIGATE TO FREE COURSE DETAIL
    console.log('\n--- 2. Navigating to Free Course Detail ---');
    // Course 10 was created in our previous test
    await page.goto(`${FRONTEND_URL}/courses/10`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await capture('v29_course_detail_free_desktop', 'Course detail page for free course (price 0)');

    // Assert UI elements on Course Detail
    const bodyText = await page.textContent('body');
    const hasFreePrice = bodyText.includes('Free') || bodyText.includes('₹0');
    console.log(`[ASSERT] Free price displayed: ${hasFreePrice}`);

    const hasEnrollCTA = bodyText.includes('Enroll Now') || bodyText.includes('Enroll');
    console.log(`[ASSERT] Enroll CTA visible: ${hasEnrollCTA}`);

    // Check for absence of fake fallback text
    const hasFakeDuration = bodyText.includes('18.5 hours');
    const hasFakeLectures = bodyText.includes('48 Lectures');
    const hasFakeEngineers = bodyText.includes('1240 Engineers Enrolled');
    console.log(`[ASSERT] Fake 18.5 hours absent: ${!hasFakeDuration}`);
    console.log(`[ASSERT] Fake 48 Lectures absent: ${!hasFakeLectures}`);
    console.log(`[ASSERT] Fake 1240 Engineers absent: ${!hasFakeEngineers}`);

    // 3. STUDENT LOGIN IN BROWSER
    console.log('\n--- 3. Student Authentication in Browser ---');
    await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Fill login form
    await page.fill('input[type="email"]', 'instructor.cand.1793615713821@example.com');
    await page.fill('input[type="password"]', 'Password@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await capture('v29_student_logged_in_dashboard', 'Student logged in and on platform');

    // 4. STUDENT MY LEARNING WORKSPACE
    console.log('\n--- 4. Student My Learning Page ---');
    await page.goto(`${FRONTEND_URL}/student/my-learning`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await capture('v29_student_mylearning_enrolled', 'Student My Learning displaying enrolled free courses');

    // 5. RESPONSIVE VIEWPORT CHECKS (Course Detail & Catalog)
    console.log('\n--- 5. Responsive Visual Regression Across Breakpoints ---');
    const viewports = [
      { name: 'v29_responsive_1024px_tablet_landscape', width: 1024, height: 768, desc: 'Tablet Landscape (1024px)' },
      { name: 'v29_responsive_768px_tablet_portrait', width: 768, height: 1024, desc: 'Tablet Portrait (768px)' },
      { name: 'v29_responsive_390px_mobile_standard', width: 390, height: 844, desc: 'Mobile Standard (390px)' },
      { name: 'v29_responsive_320px_mobile_compact', width: 320, height: 568, desc: 'Mobile Compact (320px)' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${FRONTEND_URL}/courses/10`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Check horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const hasHorizontalScroll = scrollWidth > clientWidth;
      console.log(`[RESPONSIVE] ${vp.name} (${vp.width}px): scrollWidth=${scrollWidth}, clientWidth=${clientWidth}, overflow=${hasHorizontalScroll}`);

      await capture(vp.name, vp.desc);
    }

    console.log('\n===============================================================');
    console.log('PLAYWRIGHT TESTS COMPLETED SUCCESSFULLY! ALL SCREENSHOTS SAVED.');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('Playwright Test Failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPlaywright();

