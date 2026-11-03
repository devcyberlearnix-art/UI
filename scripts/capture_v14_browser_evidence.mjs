import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

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
        description: textSpans[2] || '',
        rawText: c.innerText.trim()
      };
    });
  });

  console.log('Captured statistics cards from DOM:');
  console.log(JSON.stringify(statsCards, null, 2));

  // Output card findings
  const activeCoursesCard = statsCards.find(c => c.label.includes('Active Courses'));
  const enrolledCard = statsCards.find(c => c.label.includes('Enrolled Engineers'));
  const ratingCard = statsCards.find(c => c.label.includes('Average Rating'));
  const instructorsCard = statsCards.find(c => c.label.includes('Lead Instructors'));

  console.log('\n--- VERIFIED DOM DATA ---');
  console.log('Active Courses:', activeCoursesCard);
  console.log('Enrolled Engineers:', enrolledCard);
  console.log('Average Rating:', ratingCard);
  console.log('Lead Instructors:', instructorsCard);

  // Take screenshot of the entire hero section including statistics bar
  const heroElement = await page.$('section.relative');
  const screenshotPath = 'scripts/v14_hero_statistics_screenshot.png';
  if (heroElement) {
    await heroElement.screenshot({ path: screenshotPath });
    console.log(`Saved hero screenshot to ${screenshotPath}`);
  } else {
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved full page screenshot to ${screenshotPath}`);
  }

  // Also copy screenshot to artifact directory if available
  const artifactDir = 'C:\\Users\\SHIVASAI\\.gemini\\antigravity\\brain\\e06a6087-baec-495b-8ce7-9184fb7bc2fb';
  if (fs.existsSync(artifactDir)) {
    const dest = path.join(artifactDir, 'v14_hero_statistics_screenshot.png');
    fs.copyFileSync(screenshotPath, dest);
    console.log(`Copied screenshot to artifact directory: ${dest}`);
  }

  // Save captured DOM JSON
  fs.writeFileSync('scripts/v14_dom_statistics_evidence.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    statsCards,
    url: 'http://localhost:4173',
  }, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error('Error running browser capture:', err);
  process.exit(1);
});

