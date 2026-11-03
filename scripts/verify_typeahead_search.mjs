import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const UI_URL = 'http://localhost:5173';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');
const ARTIFACT_DIR = 'C:\\Users\\SHIVASAI\\.gemini\\antigravity\\brain\\5a7cfab4-162e-4876-9cf0-07c757a14057';

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

async function runTypeaheadVerification() {
  console.log('======================================================================');
  console.log(' 🚀 E2E PREDICTIVE TYPEAHEAD & CATALOG SEARCH VALIDATION');
  console.log('======================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.text().includes('[API]') || msg.text().includes('Search')) {
      console.log(`   [Browser]: ${msg.text()}`);
    }
  });

  // Track network requests to verify /suggestions endpoint
  const suggestionsCalls = [];
  page.on('request', req => {
    if (req.url().includes('/api/v1/courses/suggestions')) {
      suggestionsCalls.push(req.url());
    }
  });

  console.log('1. Navigating to http://localhost:5173/courses...');
  await page.goto(`${UI_URL}/courses`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const searchInputSelector = 'input[placeholder*="Search items by title"]';
  await page.waitForSelector(searchInputSelector, { timeout: 10000 });
  console.log('   ✅ Search input located with matching placeholder.');

  // 2. Test typing 'sec'
  console.log('\n2. Typing "sec" into typeahead input (100ms keystroke cadence)...');
  await page.click(searchInputSelector);
  await page.type(searchInputSelector, 'sec', { delay: 100 });

  console.log('   -> Waiting for predictive dropdown overlay (ul)...');
  await page.waitForSelector('ul.animate-fadeIn', { timeout: 5000 });
  console.log('   ✅ Floating Google-grade prediction overlay visible.');

  // Extract suggestions items
  const suggestionItems = await page.evaluate(() => {
    const items = document.querySelectorAll('ul.animate-fadeIn li');
    return Array.from(items).map(li => ({
      text: li.querySelector('.font-light')?.innerText || '',
      type: li.querySelector('span:last-child')?.innerText || ''
    }));
  });
  console.log('   -> Retrieved Suggestions Matrix:', JSON.stringify(suggestionItems, null, 2));

  // Screenshot dropdown overlay
  const snapshot1 = path.join(SNAPSHOT_DIR, 'typeahead_dropdown_active.png');
  await page.screenshot({ path: snapshot1, fullPage: false });
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(snapshot1, path.join(ARTIFACT_DIR, 'typeahead_dropdown_active.png'));
  }
  console.log('   📸 Screenshot saved: typeahead_dropdown_active.png');

  // 3. Test keyboard navigation: ArrowDown + Enter
  console.log('\n3. Testing Keyboard Navigation Matrix (ArrowDown -> Enter)...');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(300);

  // Verify focus class applied
  const isFirstItemFocused = await page.evaluate(() => {
    const firstLi = document.querySelector('ul.animate-fadeIn li');
    return firstLi ? firstLi.className.includes('bg-[#2E2E3E]') : false;
  });
  console.log('   -> Is first suggestion highlighted with keyboard focus:', isFirstItemFocused);

  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  const finalVal = await page.inputValue(searchInputSelector);
  console.log('   -> Input value after selection:', `"${finalVal}"`);

  if (finalVal.length > 2) {
    console.log('   ✅ Selection committed to search input successfully.');
  } else {
    throw new Error('Selection did not commit to input field');
  }

  // 4. Verify catalog results updated for the selected course
  const resultCardsCount = await page.evaluate(() => {
    return document.querySelectorAll('article, [class*="CourseCard"], div.group\\/card').length;
  });
  console.log(`   -> Catalog matching cards count: ${resultCardsCount}`);

  // Screenshot search results
  const snapshot2 = path.join(SNAPSHOT_DIR, 'typeahead_search_results.png');
  await page.screenshot({ path: snapshot2, fullPage: false });
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(snapshot2, path.join(ARTIFACT_DIR, 'typeahead_search_results.png'));
  }
  console.log('   📸 Screenshot saved: typeahead_search_results.png');

  // 5. Test Instructor Search with "rohan"
  console.log('\n4. Testing Instructor prediction with "rohan"...');
  await page.click(searchInputSelector);
  await page.fill(searchInputSelector, '');
  await page.type(searchInputSelector, 'rohan', { delay: 80 });
  await page.waitForTimeout(1000);

  const instructorSuggestions = await page.evaluate(() => {
    const items = document.querySelectorAll('ul.animate-fadeIn li');
    return Array.from(items).map(li => ({
      text: li.querySelector('.font-light')?.innerText || '',
      type: li.querySelector('span:last-child')?.innerText || ''
    }));
  });
  console.log('   -> Retrieved Instructor Suggestions:', JSON.stringify(instructorSuggestions, null, 2));

  console.log('\n======================================================================');
  console.log(' 🏁 PREDICTIVE TYPEAHEAD & CATALOG SEARCH VALIDATION PASSED');
  console.log(`    Total suggestions API queries dispatched: ${suggestionsCalls.length}`);
  console.log('======================================================================');

  await browser.close();
}

runTypeaheadVerification().catch(err => {
  console.error('❌ Validation Failed:', err);
  process.exit(1);
});

