const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // 1. Login as admin
  await page.goto('http://localhost:5173/admin/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', 'dev.cyberlearnix@gmail.com');
  await page.fill('input[type="password"]', 'MainAdmin@123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  console.log('Logged in, current URL:', page.url());

  // 2. Navigate to /admin/banners
  await page.goto('http://localhost:5173/admin/banners');
  await page.waitForTimeout(3000);
  console.log('Navigated to /admin/banners, current URL:', page.url());

  const title = await page.title();
  const pageText = await page.innerText('body');
  console.log('Page title:', title);
  console.log('Contains Banner Management:', pageText.includes('Banner Management') || pageText.includes('Banners'));
  console.log('Has banners rendered:', pageText.includes('Java and Python') || pageText.includes('Algorithms'));

  await page.screenshot({ path: 'C:/Users/SHIVASAI/.gemini/antigravity/brain/1af55def-0ef5-4fa2-9389-ff708389a60c/admin_banners_page.png' });
  console.log('Screenshot saved to admin_banners_page.png');

  await browser.close();
})();

