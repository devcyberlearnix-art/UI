import { chromium } from 'playwright';

async function testDom() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('request', req => {
    if (req.url().includes('/api/v1/courses/list')) {
      console.log('API Request:', req.url());
    }
  });

  console.log('Navigating to http://localhost:5173/courses?search=Python...');
  await page.goto('http://localhost:5173/courses?search=Python', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const catalogCards = await page.evaluate(() => {
    // Select cards in the main catalog section (after toolbar)
    const toolbar = document.querySelector('form input[placeholder*="Search tracks"]');
    const container = toolbar ? toolbar.closest('.max-w-7xl') : document.body;
    const cards = Array.from(container.querySelectorAll('.grid .group'));
    return cards.map(c => {
      const h3 = c.querySelector('h3');
      const cat = c.querySelector('span');
      return {
        title: h3 ? h3.innerText : '',
        category: cat ? cat.innerText : ''
      };
    });
  });

  console.log('Catalog Grid Cards found:', catalogCards.length);
  console.log(catalogCards.slice(0, 5));

  await browser.close();
}

testDom().catch(console.error);

