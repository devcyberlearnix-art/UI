import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:4173';

const VIEWPORTS = [
  { name: 'Mobile (375px)', width: 375, height: 667 },
  { name: 'Tablet (768px)', width: 768, height: 1024 },
  { name: 'Desktop (1440px)', width: 1440, height: 900 }
];

const PAGES_TO_TEST = ['/', '/courses', '/courses/6', '/cart', '/login'];

async function runAudit() {
  console.log('====================================================');
  console.log('   ASIVO LMS VERSION 20 - RESPONSIVE & A11Y AUDIT   ');
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    console.log(`\nTesting Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    for (const path of PAGES_TO_TEST) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(500);

      // Check for horizontal overflow
      const overflow = await page.evaluate(() => {
        const docElem = document.documentElement;
        return {
          scrollWidth: docElem.scrollWidth,
          clientWidth: docElem.clientWidth,
          hasHorizontalOverflow: docElem.scrollWidth > docElem.clientWidth + 1
        };
      });

      // Check a11y landmarks
      const a11y = await page.evaluate(() => {
        const main = document.querySelector('main');
        const nav = document.querySelector('nav');
        const header = document.querySelector('header');
        const buttons = Array.from(document.querySelectorAll('button'));
        const buttonsWithoutAccessibleName = buttons.filter(b => {
          const text = b.innerText?.trim();
          const ariaLabel = b.getAttribute('aria-label');
          const title = b.getAttribute('title');
          return !text && !ariaLabel && !title;
        }).length;

        const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"])'));
        const inputsWithoutLabels = inputs.filter(inp => {
          const id = inp.id;
          const hasLabel = id ? Boolean(document.querySelector(`label[for="${id}"]`)) : false;
          const ariaLabel = inp.getAttribute('aria-label');
          const placeholder = inp.getAttribute('placeholder');
          return !hasLabel && !ariaLabel && !placeholder;
        }).length;

        return {
          hasMain: Boolean(main),
          hasNav: Boolean(nav),
          hasHeader: Boolean(header),
          totalButtons: buttons.length,
          buttonsWithoutAccessibleName,
          totalInputs: inputs.length,
          inputsWithoutLabels
        };
      });

      const pass = !overflow.hasHorizontalOverflow && a11y.buttonsWithoutAccessibleName === 0;
      results.push({
        viewport: vp.name,
        path,
        overflow,
        a11y,
        pass
      });

      console.log(`[${pass ? '✅ PASS' : '⚠️ WARN'}] ${path} @ ${vp.name} | Overflow: ${overflow.hasHorizontalOverflow} (${overflow.scrollWidth}w vs ${overflow.clientWidth}c) | Unlabeled Buttons: ${a11y.buttonsWithoutAccessibleName}/${a11y.totalButtons}`);
    }
    await ctx.close();
  }

  fs.writeFileSync('scripts/v20_responsive_a11y_results.json', JSON.stringify(results, null, 2));
  console.log('\nResponsive & A11y Audit Complete. Total Viewport Probes:', results.length);
  const passed = results.filter(r => r.pass).length;
  console.log(`Summary: ${passed} / ${results.length} PASSED`);

  await browser.close();
}

runAudit();

