const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:4173/courses', { waitUntil: 'networkidle' });
  const unlabeled = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button'))
      .filter(b => !b.innerText?.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title'))
      .map(b => ({ outerHTML: b.outerHTML.slice(0, 100), className: b.className }));
  });
  console.log('Unlabeled buttons:', JSON.stringify(unlabeled, null, 2));
  await browser.close();
})();

