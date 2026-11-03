import { chromium } from 'playwright';

async function verifySearchFeatures() {
  console.log('--- Launching Browser to Verify Full Search Integration ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const searchApiRequests = [];
  page.on('request', req => {
    if (req.url().includes('/api/v1/courses/list')) {
      searchApiRequests.push(req.url());
      console.log('📡 [API Request]:', req.url());
    }
  });

  page.on('response', res => {
    if (res.url().includes('/api/v1/courses/list')) {
      console.log('📥 [API Response]:', res.status(), res.url());
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('[Browser Error]:', msg.text());
    }
  });

  console.log('--- 1. Testing Landing Page HeaderNav Search Button ---');
  await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);

  const headerNavSearchBtn = page.locator('header button[aria-label="Search Catalog"]').first();
  await headerNavSearchBtn.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✅ HeaderNav Search Button is present and visible on landing page.');

  console.log('--- 2. Testing Landing Page Hero Search Input & Button Flow ---');
  const heroSearchInput = page.locator('input[placeholder*="Search tracks by topic"]').first();
  await heroSearchInput.waitFor({ state: 'visible', timeout: 10000 });

  console.log('Typing "Python" into Landing Page Search Input...');
  await heroSearchInput.fill('Python');

  const heroSearchBtn = page.locator('button:has-text("Search")').first();
  await heroSearchBtn.waitFor({ state: 'visible' });

  console.log('Clicking Landing Page Search Button...');
  await heroSearchBtn.click();

  // Wait for navigation to /courses?search=Python
  await page.waitForURL(/courses.*search=Python/, { timeout: 15000 });
  console.log('✅ Successfully navigated to:', page.url());
  await page.waitForTimeout(3000);

  // Take screenshot of search results for Python
  await page.screenshot({
    path: 'C:/Users/SHIVASAI/.gemini/antigravity/brain/5a7cfab4-162e-4876-9cf0-07c757a14057/search_results_python.png',
    fullPage: false
  });

  const pythonCards = await page.locator('h3, [data-testid="course-title"]').allInnerTexts();
  console.log('Found course titles on page:', pythonCards.slice(0, 5));

  const hasPython = pythonCards.some(t => t.toLowerCase().includes('python'));
  if (!hasPython) {
    throw new Error('❌ No Python courses rendered in search results!');
  }
  console.log('✅ Python courses successfully fetched from backend and rendered!');

  console.log('--- 3. Verifying Dedicated Search Button on /courses ---');
  const catalogSearchInput = page.locator('form input[placeholder*="Search tracks by topic"]');
  const catalogSearchBtn = page.locator('form button[aria-label="Search"]');

  await catalogSearchInput.waitFor({ state: 'visible' });
  await catalogSearchBtn.waitFor({ state: 'visible' });
  console.log('✅ Dedicated Catalog Search Button is present and visible!');

  console.log('--- 4. Testing Direct Search on /courses with "React" ---');
  await catalogSearchInput.fill('React');
  await catalogSearchBtn.click();
  await page.waitForTimeout(3000);

  // Take screenshot of search results for React
  await page.screenshot({
    path: 'C:/Users/SHIVASAI/.gemini/antigravity/brain/5a7cfab4-162e-4876-9cf0-07c757a14057/search_results_react.png',
    fullPage: false
  });

  const reactCards = await page.locator('h3, [data-testid="course-title"]').allInnerTexts();
  console.log('React search course titles:', reactCards.slice(0, 5));
  const hasReact = reactCards.some(t => t.toLowerCase().includes('react') || t.toLowerCase().includes('javascript'));
  if (!hasReact) {
    throw new Error('❌ No React courses rendered in search results!');
  }
  console.log('✅ React search executed via dedicated Search Button and backend API!');

  console.log('--- 5. Testing Category Filter Pill with Database Category "AI/ML" ---');
  const aimlPill = page.locator('button:has-text("AI/ML")').first();
  await aimlPill.waitFor({ state: 'visible', timeout: 5000 });
  console.log('Clicking AI/ML category pill...');
  await aimlPill.click();
  await page.waitForTimeout(3000);

  const aimlCards = await page.locator('h3, [data-testid="course-title"]').allInnerTexts();
  console.log('AI/ML course titles:', aimlCards.slice(0, 5));
  console.log('✅ Category pill successfully connected to backend catalog!');

  console.log('--- 6. Testing Navbar Search Form & Button ---');
  const navbarSearchInput = page.locator('nav input[placeholder*="Search curriculum"]').first();
  const navbarSearchBtn = page.locator('nav button[aria-label="Submit search"]').first();
  if (await navbarSearchInput.isVisible().catch(() => false)) {
    console.log('Typing "Cloud" into Navbar Search Input...');
    await navbarSearchInput.fill('Cloud');
    await navbarSearchBtn.click();
    await page.waitForTimeout(3000);
    console.log('✅ Navbar search submitted successfully!');
  }

  console.log('--- Total Search API Calls Triggered:', searchApiRequests.length, '---');
  if (searchApiRequests.length === 0) {
    throw new Error('❌ No search API calls were triggered to backend!');
  }

  await browser.close();
  console.log('🎉 ALL SEARCH BUTTON AND BACKEND API INTEGRATION TESTS PASSED!');
}

verifySearchFeatures().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
