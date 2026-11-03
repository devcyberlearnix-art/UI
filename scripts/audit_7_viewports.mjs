import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: 'Mobile Mini', width: 320, height: 568 },
  { name: 'Mobile Standard (iPhone SE)', width: 375, height: 667 },
  { name: 'Mobile Large (iPhone 15 Pro Max)', width: 430, height: 932 },
  { name: 'Tablet (iPad Mini)', width: 768, height: 1024 },
  { name: 'Laptop Small', width: 1024, height: 768 },
  { name: 'Desktop Standard', width: 1280, height: 800 },
  { name: 'Desktop Widescreen', width: 1440, height: 900 }
];

async function auditViewports() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const docMetrics = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const clientW = document.documentElement.clientWidth;
      const overflow = Math.max(0, scrollW - clientW);
      
      const cards = Array.from(document.querySelectorAll('[data-testid="course-card"], .group')).filter(el => el.querySelector('h3'));
      const cardWidth = cards.length > 0 ? cards[0].getBoundingClientRect().width : 0;
      
      // Check column counts
      let cardsInRow = 1;
      if (cards.length > 1) {
        const top0 = cards[0].getBoundingClientRect().top;
        const top1 = cards[1].getBoundingClientRect().top;
        if (Math.abs(top0 - top1) < 10) {
          cardsInRow = 2;
          if (cards.length > 2 && Math.abs(top0 - cards[2].getBoundingClientRect().top) < 10) {
            cardsInRow = 3;
            if (cards.length > 3 && Math.abs(top0 - cards[3].getBoundingClientRect().top) < 10) {
              cardsInRow = 4;
            }
          }
        }
      }

      return {
        overflow,
        pageHeight: document.documentElement.scrollHeight,
        cardCount: cards.length,
        cardWidth: Math.round(cardWidth),
        cardsInRow
      };
    });

    results.push({ ...vp, ...docMetrics });
    console.log(`[VIEWPORT ${vp.width}px] Overflow: ${docMetrics.overflow}px | Height: ${docMetrics.pageHeight}px | Cards/Row: ${docMetrics.cardsInRow} | Card Width: ${docMetrics.cardWidth}px`);
    await page.close();
  }

  await browser.close();
}

auditViewports().catch(console.error);

