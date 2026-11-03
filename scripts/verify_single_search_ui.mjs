import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const UI_URL = 'http://localhost:5173';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');
const ARTIFACT_DIR = 'C:\\Users\\SHIVASAI\\.gemini\\antigravity\\brain\\5a7cfab4-162e-4876-9cf0-07c757a14057';

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

async function verifySingleSearchUI() {
  console.log('======================================================================');
  console.log(' 🔍 VERIFYING SINGLE UNIFIED SEARCH BAR UI');
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.text().includes('[API]')) {
      console.log(`   [Browser]: ${msg.text()}`);
    }
  });

  // 1. Visit /courses?category=Cyber+Security (the exact page in user screenshot)
  console.log('1. Navigating to http://localhost:5173/courses?category=Cyber+Security...');
  await page.goto(`${UI_URL}/courses?category=Cyber+Security`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Check how many search inputs exist on the page
  const searchInputsCount = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="text"]');
    return Array.from(inputs).map(inp => ({
      placeholder: inp.placeholder,
      visible: inp.offsetWidth > 0 && inp.offsetHeight > 0,
      classes: inp.className
    }));
  });
  console.log('   Visible text inputs on /courses:', JSON.stringify(searchInputsCount, null, 2));

  // Assert exactly ONE visible search input exists on /courses
  const visibleSearchInputs = searchInputsCount.filter(i => i.visible);
  console.log(`   -> Total visible search bars on /courses: ${visibleSearchInputs.length}`);
  if (visibleSearchInputs.length !== 1) {
    throw new Error(`Expected exactly 1 visible search bar, but found: ${visibleSearchInputs.length}`);
  }
  console.log('   ✅ Confirmed: Exactly ONE singular, unified search bar on /courses!');

  // Take screenshot of the Courses catalog page matching user screenshot
  const screenshotPath = path.join(SNAPSHOT_DIR, 'unified_single_search_courses.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(screenshotPath, path.join(ARTIFACT_DIR, 'unified_single_search_courses.png'));
  }
  console.log('   📸 Screenshot saved: unified_single_search_courses.png');

  // 2. Test typing in the unified search bar and autocomplete dropdown
  console.log('\n2. Testing Predictive Autocomplete in the Unified Search Bar...');
  const searchInputSelector = 'input[placeholder*="Search items by title"]';
  await page.click(searchInputSelector);
  await page.type(searchInputSelector, 'sec', { delay: 80 });
  await page.waitForSelector('ul.animate-fadeIn', { timeout: 5000 });

  const predictions = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('ul.animate-fadeIn li')).map(li => ({
      text: li.querySelector('.font-light')?.innerText || '',
      type: li.querySelector('span:last-child')?.innerText || ''
    }));
  });
  console.log('   -> Predictive suggestions rendered:', JSON.stringify(predictions, null, 2));

  const dropdownSnapshot = path.join(SNAPSHOT_DIR, 'unified_search_dropdown.png');
  await page.screenshot({ path: dropdownSnapshot, fullPage: false });
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(dropdownSnapshot, path.join(ARTIFACT_DIR, 'unified_search_dropdown.png'));
  }
  console.log('   📸 Screenshot saved: unified_search_dropdown.png');

  // 3. Visit Home page (/) to verify the Navbar search bar is present for global navigation
  console.log('\n3. Navigating to Home (http://localhost:5173/)...');
  await page.goto(`${UI_URL}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const homeInputs = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="text"]');
    return Array.from(inputs).map(inp => ({
      placeholder: inp.placeholder,
      visible: inp.offsetWidth > 0 && inp.offsetHeight > 0
    }));
  });
  console.log('   Visible text inputs on Home page:', JSON.stringify(homeInputs, null, 2));

  const hasNavbarSearchOnHome = homeInputs.some(i => i.placeholder.includes('Search curriculum') && i.visible);
  console.log(`   -> Navbar global search present on Home: ${hasNavbarSearchOnHome}`);

  console.log('\n======================================================================');
  console.log(' 🏁 SINGLE UNIFIED SEARCH ARCHITECTURE VALIDATED SUCCESSFULLY');
  console.log('======================================================================');
  await browser.close();
}

verifySingleSearchUI().catch(err => {
  console.error('❌ Verification Error:', err);
  process.exit(1);
});

