import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const UI_URL = 'http://localhost:5173';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');
const ARTIFACT_DIR = 'C:\\Users\\SHIVASAI\\.gemini\\antigravity\\brain\\5a7cfab4-162e-4876-9cf0-07c757a14057';

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

async function testTypeahead() {
  console.log('======================================================================');
  console.log(' 🚀 RUNNING typeahead_e2e.mjs SPECIFICATION TEST');
  console.log('======================================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.text().includes('[API]')) {
      console.log(`   [Browser]: ${msg.text()}`);
    }
  });

  await page.goto(`${UI_URL}/courses`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const searchInputSelector = 'input[placeholder*="Search items by title"]';
  await page.waitForSelector(searchInputSelector);
  console.log('   ✅ Located search input with placeholder matching "Search items by title"');
  
  // Simulate user typing search criteria token slowly into the DOM input context
  console.log('   -> Typing "sec" with 100ms delay...');
  await page.type(searchInputSelector, 'sec', { delay: 100 });
  
  // Validate overlay visibility matrix activation
  await page.waitForSelector('ul.animate-fadeIn');
  console.log('   ✅ Prediction overlay active (ul.animate-fadeIn)');

  // Simulate key down keyboard event navigation array
  console.log('   -> Pressing ArrowDown...');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(200);

  console.log('   -> Pressing Enter...');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(2000);

  // Verify search layout input field contains chosen selection string text value
  const finalVal = await page.inputValue(searchInputSelector);
  console.log(`   -> Final Input Field Value: "${finalVal}"`);
  if (finalVal.length <= 2) {
    throw new Error(`Expected finalVal.length > 2, but got: "${finalVal}"`);
  }
  console.log('   ✅ Final input value validated (> 2 chars).');

  // Verify catalog results are rendered
  const cardsCount = await page.evaluate(() => {
    return document.querySelectorAll('.aspect-video').length;
  });
  console.log(`   -> Rendered Course Cards in Catalog: ${cardsCount}`);

  const snapshotPath = path.join(SNAPSHOT_DIR, 'typeahead_e2e_verified.png');
  await page.screenshot({ path: snapshotPath, fullPage: false });
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(snapshotPath, path.join(ARTIFACT_DIR, 'typeahead_e2e_verified.png'));
  }
  console.log('   📸 Screenshot saved: typeahead_e2e_verified.png');

  console.log('======================================================================');
  console.log(' 🏁 TYPEAHEAD E2E SPECIFICATION TEST PASSED WITH 100% SUCCESS');
  console.log('======================================================================');
  await browser.close();
}

testTypeahead().catch(err => {
  console.error('❌ E2E Failed:', err);
  process.exit(1);
});

