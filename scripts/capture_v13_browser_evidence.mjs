import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  console.log('Launching headless browser via Playwright...');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    console.error('Playwright launch error:', err.message);
    process.exit(1);
  }

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for the statistics bar to be visible
  await page.waitForSelector('text=Enrolled Engineers', { timeout: 15000 });

  // Inspect the statistics container
  const statsCards = await page.$$eval('div.p-4.rounded-2xl.bg-\\[\\#0F0F13\\]', cards => {
    return cards.map(c => {
      const textSpans = Array.from(c.querySelectorAll('span')).map(s => s.innerText.trim());
      return {
        number: textSpans[0] || '',
        label: textSpans[1] || '',
        subtext: textSpans[2] || '',
        rawText: c.innerText.trim()
      };
    });
  });

  console.log('Captured statistics cards from DOM:');
  console.log(JSON.stringify(statsCards, null, 2));

  // Find the exact enrolled engineers card
  const enrolledCard = statsCards.find(c => c.label.includes('Enrolled Engineers') || c.rawText.includes('Enrolled Engineers'));
  console.log('Enrolled Engineers Card Details:', enrolledCard);

  // Take screenshot of the entire hero section including statistics bar
  const heroElement = await page.$('section.relative');
  if (heroElement) {
    await heroElement.screenshot({ path: 'scripts/v13_hero_statistics_screenshot.png' });
    console.log('Saved hero screenshot to scripts/v13_hero_statistics_screenshot.png');
  } else {
    await page.screenshot({ path: 'scripts/v13_hero_statistics_screenshot.png', fullPage: false });
    console.log('Saved page screenshot to scripts/v13_hero_statistics_screenshot.png');
  }

  await browser.close();
  console.log('Browser check complete.');
}

main().catch(err => {
  console.error('Fatal error during browser capture:', err);
  process.exit(1);
});

