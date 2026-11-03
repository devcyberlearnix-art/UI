import { chromium } from 'playwright';
import sharp from 'sharp';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#tab-password');

  const tablist = await page.locator('div[role="tablist"]');
  await tablist.screenshot({ path: 'scripts/tablist_test.png' });

  // Read pixel colors from the screenshot using sharp
  const image = sharp('scripts/tablist_test.png');
  const { width, height } = await image.metadata();
  const raw = await image.raw().toBuffer();

  // Sample pixel at center of left tab (x = width / 4, y = height / 2)
  const leftX = Math.floor(width / 4);
  const leftY = Math.floor(height / 2);
  const leftOffset = (leftY * width + leftX) * 4;
  const leftR = raw[leftOffset];
  const leftG = raw[leftOffset + 1];
  const leftB = raw[leftOffset + 2];

  // Sample pixel at center of right tab (x = 3 * width / 4, y = height / 2)
  const rightX = Math.floor((3 * width) / 4);
  const rightY = Math.floor(height / 2);
  const rightOffset = (rightY * width + rightX) * 4;
  const rightR = raw[rightOffset];
  const rightG = raw[rightOffset + 1];
  const rightB = raw[rightOffset + 2];

  console.log(`Tablist dimensions: ${width}x${height}`);
  console.log(`Left tab pixel (center): RGB(${leftR}, ${leftG}, ${leftB})`);
  console.log(`Right tab pixel (center): RGB(${rightR}, ${rightG}, ${rightB})`);

  await browser.close();
}

main().catch(console.error);
