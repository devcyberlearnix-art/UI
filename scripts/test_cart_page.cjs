const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('http://localhost:4173/cart', { waitUntil: 'networkidle' });
  console.log('Current URL:', page.url());
  const bodyText = await page.innerText('body');
  console.log('Errors:', errors);
  console.log('Body snippet:', bodyText.slice(0, 300));
  await browser.close();
})();

