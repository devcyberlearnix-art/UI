import { chromium } from 'playwright';

async function verifyCoursesUI() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  console.log('Navigating to http://localhost:5173/courses?category=Cyber+Security...');
  await page.goto('http://localhost:5173/courses?category=Cyber+Security', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(1000);
  
  // Verify Navbar search bar is NOT present on /courses
  const navbarSearch = await page.$('nav input[placeholder="Search curriculum..."]');
  console.log('Navbar search input exists on /courses?', !!navbarSearch);
  
  // Verify Catalog search bar IS present
  const catalogSearch = await page.$('input[placeholder="Search items by title, subtitle, tag category or author..."]');
  console.log('Catalog typeahead search input exists?', !!catalogSearch);
  
  // Take screenshot of the category pill and toolbar
  await page.screenshot({
    path: 'C:/Users/SHIVASAI/.gemini/antigravity/brain/5a7cfab4-162e-4876-9cf0-07c757a14057/courses_pill_and_single_search_verified.png',
    fullPage: false
  });
  
  console.log('Screenshot saved to courses_pill_and_single_search_verified.png');
  await browser.close();
}

verifyCoursesUI().catch(err => {
  console.error(err);
  process.exit(1);
});

