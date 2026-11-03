import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600); // let framer motion finish initial animation

  const data = await page.evaluate(() => {
    const tablist = document.querySelector('div[role="tablist"]');
    const passTab = document.querySelector('#tab-password');
    const otpTab = document.querySelector('#tab-otp');
    const passPill = passTab.querySelector('div');
    const otpPill = otpTab.querySelector('div');
    return {
      tablist: tablist.getBoundingClientRect(),
      passTab: passTab.getBoundingClientRect(),
      otpTab: otpTab.getBoundingClientRect(),
      passPill: passPill ? passPill.getBoundingClientRect() : null,
      otpPill: otpPill ? otpPill.getBoundingClientRect() : null,
      passTabHTML: passTab.outerHTML,
    };
  });
  console.log(JSON.stringify(data, null, 2));

  const tablistEl = await page.locator('div[role="tablist"]');
  await tablistEl.screenshot({ path: 'scripts/tablist_settled.png' });
  console.log('Saved scripts/tablist_settled.png');

  await browser.close();
}

main().catch(console.error);

