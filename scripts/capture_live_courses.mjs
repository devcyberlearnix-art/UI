import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:5173/courses?category=Cyber+Security', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/SHIVASAI/.gemini/antigravity/brain/5a7cfab4-162e-4876-9cf0-07c757a14057/current_live_courses_view.png' });
  await browser.close();
  console.log('Screenshot captured successfully');
})().catch(err => {
  console.error(err);
  process.exit(1);
});

