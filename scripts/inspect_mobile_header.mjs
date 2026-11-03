import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });

  const mobileHeader = await page.locator('.lg\\:hidden.flex.items-center.justify-between');
  if (await mobileHeader.count() > 0) {
    const box = await mobileHeader.boundingBox();
    console.log('Mobile Header BoundingBox:', box);
    await mobileHeader.screenshot({ path: 'scripts/mobile_header_test.png' });
  }

  const brandLink = await page.locator('.lg\\:hidden a[aria-label="Asivo Home"]');
  if (await brandLink.count() > 0) {
    const box = await brandLink.boundingBox();
    console.log('Brand Link BoundingBox:', box);
  }

  await browser.close();
}

main().catch(console.error);

