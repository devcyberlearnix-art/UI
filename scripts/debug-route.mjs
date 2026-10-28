// scripts/debug-route.mjs
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR STACK:', err.stack || err));

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  console.log('URL after navigation:', page.url());
  const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML?.substring(0, 500));
  console.log('Root HTML snippet:', rootHtml);

  await browser.close();
})();
