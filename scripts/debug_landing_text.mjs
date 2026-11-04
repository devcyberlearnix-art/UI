import { chromium } from 'playwright';
import path from 'path';

async function checkLanding() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/debug_landing.png', fullPage: true });
  
  const textInfo = await page.evaluate(() => {
    const h1 = document.querySelector('h1')?.innerText;
    const pUnderH1 = document.querySelector('h1 + p, main section p')?.innerText;
    const allH2 = Array.from(document.querySelectorAll('h2')).map(h => h.innerText);
    const allH3 = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
    return { h1, pUnderH1, allH2, allH3 };
  });
  
  console.log('Landing page text inspection:', JSON.stringify(textInfo, null, 2));
  
  await browser.close();
}

checkLanding().catch(console.error);

