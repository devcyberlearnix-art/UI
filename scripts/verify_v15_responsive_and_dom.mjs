import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\SHIVASAI\\.gemini\\antigravity\\brain\\e06a6087-baec-495b-8ce7-9184fb7bc2fb';
const VIEWPORTS = [
  { name: 'small-mobile', width: 320, height: 640 },
  { name: 'mobile-375', width: 375, height: 812, screenshot: true },
  { name: 'large-mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024, screenshot: true },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 900, screenshot: true },
];

async function main() {
  console.log('========================================================================');
  console.log(' 📱 EXECUTING FD_LMS VERSION 15 RESPONSIVE & DOM AUDIT (PLAYWRIGHT)');
  console.log('========================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const results = {
    timestamp: new Date().toISOString(),
    viewports: [],
    domEvidence: null,
    summary: { total: 0, passed: 0, failed: 0 }
  };

  for (const vp of VIEWPORTS) {
    console.log(`\n🔍 Testing Viewport: ${vp.name} (${vp.width}x${vp.height}) ...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('text=Enrolled Engineers', { timeout: 15000 });

    // Check 1: Horizontal Overflow
    const scrollInfo = await page.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
      const innerWidth = window.innerWidth;
      return {
        scrollWidth,
        innerWidth,
        hasHorizontalOverflow: scrollWidth > innerWidth + 1,
        overflowDelta: scrollWidth - innerWidth,
      };
    });

    const noOverflow = !scrollInfo.hasHorizontalOverflow;
    console.log(`   [Overflow Check] InnerWidth: ${scrollInfo.innerWidth}px | ScrollWidth: ${scrollInfo.scrollWidth}px | Delta: ${scrollInfo.overflowDelta}px => ${noOverflow ? '✅ PASS' : '❌ FAIL'}`);

    // Check 2: DOM Statistics Extraction
    const statsCards = await page.$$eval('div.p-3.sm\\:p-4.rounded-2xl.bg-\\[\\#0F0F13\\], div.p-4.rounded-2xl.bg-\\[\\#0F0F13\\]', cards => {
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

    // Check 3: Hero CTAs Inspection
    const heroCtas = await page.evaluate(() => {
      const heroButtons = Array.from(document.querySelectorAll('section button')).map(b => ({
        text: b.innerText.trim(),
        role: b.getAttribute('role') || 'button',
      }));
      const exploreBtn = heroButtons.find(b => b.text.includes('Explore Courses'));
      const getStartedBtn = heroButtons.find(b => b.text.includes('Get Started'));
      const loginBtn = heroButtons.find(b => b.text.toLowerCase() === 'login' || b.text === 'Login');
      return {
        hasExploreCourses: Boolean(exploreBtn),
        hasGetStarted: Boolean(getStartedBtn),
        hasDuplicateLoginInHero: Boolean(loginBtn),
        allHeroButtons: heroButtons.slice(0, 5)
      };
    });

    console.log(`   [Hero CTAs] Explore Courses: ${heroCtas.hasExploreCourses ? '✅' : '❌'} | Get Started: ${heroCtas.hasGetStarted ? '✅' : '❌'} | Duplicate Login in Hero: ${heroCtas.hasDuplicateLoginInHero ? '❌ FOUND' : '✅ NONE'}`);

    if (vp.name === 'desktop-1440') {
      results.domEvidence = { statsCards, heroCtas };
    }

    // Screenshots
    if (vp.screenshot) {
      const screenshotFilename = `v15_${vp.name}_fullpage.png`;
      const localPath = path.join('scripts', screenshotFilename);
      await page.screenshot({ path: localPath, fullPage: true });
      console.log(`   [Screenshot] Saved full-page screenshot to ${localPath}`);

      if (fs.existsSync(ARTIFACT_DIR)) {
        const artifactPath = path.join(ARTIFACT_DIR, screenshotFilename);
        fs.copyFileSync(localPath, artifactPath);
        console.log(`   [Artifact] Copied to ${artifactPath}`);
      }
    }

    const vpPass = noOverflow && !heroCtas.hasDuplicateLoginInHero && heroCtas.hasExploreCourses;
    results.summary.total++;
    if (vpPass) results.summary.passed++;
    else results.summary.failed++;

    results.viewports.push({
      viewport: vp.name,
      dimensions: `${vp.width}x${vp.height}`,
      noOverflow,
      scrollInfo,
      heroCtas,
      status: vpPass ? 'PASS' : 'FAIL',
    });

    await context.close();
  }

  await browser.close();

  // Save audit JSON
  fs.writeFileSync('scripts/v15_responsive_dom_audit.json', JSON.stringify(results, null, 2));

  console.log('\n========================================================================');
  console.log(` 🏁 RESPONSIVE AUDIT COMPLETE: ${results.summary.passed}/${results.summary.total} VIEWPORTS PASSED`);
  console.log('========================================================================\n');
  console.log('DOM Statistics Cards Captured:');
  console.log(JSON.stringify(results.domEvidence?.statsCards, null, 2));
}

main().catch(err => {
  console.error('Fatal error in responsive audit:', err);
  process.exit(1);
});

