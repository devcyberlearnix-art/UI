import { chromium } from 'playwright';

async function checkBanner() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  
  const banners = await page.evaluate(() => {
    const bannerSection = document.querySelector('section[aria-label="Promotional Showcase"]');
    if (!bannerSection) return 'NO_BANNER_SECTION_FOUND';
    const h2 = bannerSection.querySelector('h2')?.innerText;
    const p = bannerSection.querySelector('p')?.innerText;
    const img = bannerSection.querySelector('img')?.src;
    const h2El = bannerSection.querySelector('h2');
    const pEl = bannerSection.querySelector('p');
    const h2Color = h2El ? window.getComputedStyle(h2El).color : null;
    const pColor = pEl ? window.getComputedStyle(pEl).color : null;
    const h2Visible = h2El ? (h2El.offsetWidth > 0 && h2El.offsetHeight > 0) : false;
    const pVisible = pEl ? (pEl.offsetWidth > 0 && pEl.offsetHeight > 0) : false;
    return { h2, p, img, h2Color, pColor, h2Visible, pVisible };
  });
  console.log('Banner info:', JSON.stringify(banners, null, 2));
  await browser.close();
}

checkBanner().catch(console.error);

