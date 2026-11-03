import { chromium } from 'playwright';
import crypto from 'crypto';
import fs from 'fs';

const BASE_URL = 'http://localhost:4173';
const SECRET = '8c4e9d2f1a7b6c5d9e3f0a1b7c8d4e5f9a2b6c1d8e7f3a4b5c9d1e6f8a2b7c3';
const ISSUER = 'cyberlearnix';
const AUDIENCE = 'cyberlearnix-clients';

function createAdminToken() {
  const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: ISSUER,
    aud: [AUDIENCE],
    sub: 'a29c46eb-4422-4898-847e-648fdab00972',
    userId: 'a29c46eb-4422-4898-847e-648fdab00972',
    email: 'dev.cyberlearnix@gmail.com',
    role: 'ROLE_MAIN_ADMIN',
    adminType: 'MAIN_ADMIN',
    assignedService: 'ALL',
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7200
  };
  const data = b64(header) + '.' + b64(payload);
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return data + '.' + sig;
}

const token = createAdminToken();
const adminUser = {
  id: 'a29c46eb-4422-4898-847e-648fdab00972',
  email: 'dev.cyberlearnix@gmail.com',
  name: 'Lead Administrator',
  role: 'admin',
  adminType: 'MAIN_ADMIN',
  approvalStatus: 'APPROVED'
};

async function runAudit() {
  const results = {
    timestamp: new Date().toISOString(),
    viewports: {},
    editors: {},
    cwv: {},
    consoleErrors: [],
    networkErrors: []
  };

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({ url: page.url(), text: msg.text() });
    }
  });

  page.on('requestfailed', req => {
    // ignore intentional 404 or expected aborts
    results.networkErrors.push({ url: req.url(), error: req.failure()?.errorText });
  });

  // Inject CWV observers
  await page.addInitScript(() => {
    window.__cwv = { lcp: 0, cls: 0, fcp: 0, inp: 0 };
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) window.__cwv.lcp = lastEntry.renderTime || lastEntry.loadTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__cwv.cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') window.__cwv.fcp = entry.startTime;
        }
      }).observe({ type: 'paint', buffered: true });
    } catch (e) {}
  });

  console.log('\n--- 1. TESTING RESPONSIVE VIEWPORTS ---');

  // 1. Desktop (1440x900)
  console.log('Testing Desktop 1440x900...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const desktopHeading = await page.locator('h1').first().textContent();
  const desktopCtaCount = await page.locator('a, button').filter({ hasText: /Get Started|Initialize Portal|Sign In|Explore/i }).count();
  const desktopNavVisible = await page.locator('header nav').isVisible();
  results.viewports.desktop = {
    resolution: '1440x900',
    heroHeading: desktopHeading?.trim(),
    ctaCount: desktopCtaCount,
    navVisible: desktopNavVisible,
    status: desktopHeading && desktopNavVisible ? 'PASS' : 'FAIL'
  };

  // 2. Tablet (768x1024)
  console.log('Testing Tablet 768x1024...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const tabletHeading = await page.locator('h1').first().textContent();
  results.viewports.tablet = {
    resolution: '768x1024',
    heroHeading: tabletHeading?.trim(),
    status: tabletHeading ? 'PASS' : 'FAIL'
  };

  // 3. Mobile (375x667)
  console.log('Testing Mobile 375x667...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const mobileHeading = await page.locator('h1').first().textContent();
  const mobileHamburger = await page.locator('button[aria-label*="menu" i], header button svg').first().isVisible();
  results.viewports.mobile = {
    resolution: '375x667',
    heroHeading: mobileHeading?.trim(),
    hamburgerVisible: mobileHamburger,
    status: mobileHeading ? 'PASS' : 'FAIL'
  };

  // Retrieve CWV measurements
  results.cwv = await page.evaluate(() => window.__cwv || {});
  console.log('In-Browser CWV metrics:', results.cwv);

  // Set auth credentials for admin testing
  await page.evaluate(({ token, adminUser }) => {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('lms_user', JSON.stringify(adminUser));
  }, { token, adminUser });

  console.log('\n--- 2. TESTING ADMIN CMS EDITORS ---');
  await page.setViewportSize({ width: 1440, height: 900 });

  const editorsToTest = [
    { name: 'WebsiteManagementHub', path: '/admin/website-management', checkSelector: 'h1, h2', expectedText: /Website Management|Landing Page/i },
    { name: 'HeroEditor', path: '/admin/website-management/hero', checkSelector: 'input[type="text"], textarea', minInputs: 3 },
    { name: 'NavigationEditor', path: '/admin/website-management/navigation', checkSelector: 'button', expectedText: /Add Nav Item|Save Order|Add/i },
    { name: 'SectionManager', path: '/admin/website-management/sections', checkSelector: 'button', expectedText: /Sections|Order|Visibility/i },
    { name: 'FooterEditor', path: '/admin/website-management/footer', checkSelector: 'input, textarea', minInputs: 2 },
    { name: 'TestimonialEditor', path: '/admin/website-management/testimonials', checkSelector: 'button', expectedText: /Add Testimonial|Testimonial/i },
    { name: 'StatisticsEditor', path: '/admin/website-management/statistics', checkSelector: 'input', minInputs: 2 },
    { name: 'SiteSettingsEditor', path: '/admin/website-management/settings', checkSelector: 'input', minInputs: 2 },
    { name: 'SEOEditor', path: '/admin/website-management/seo', checkSelector: 'input, textarea', minInputs: 2 },
    { name: 'MediaLibrary', path: '/admin/website-management/media', checkSelector: 'button, input[type="file"]', expectedText: /Upload|Media/i },
    { name: 'RevisionHistory', path: '/admin/website-management/revisions', checkSelector: 'button, table, div', expectedText: /Revision|Version|History|Restore/i }
  ];

  for (const ed of editorsToTest) {
    console.log(`Testing ${ed.name} at ${ed.path}...`);
    try {
      await page.goto(BASE_URL + ed.path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      const url = page.url();
      const title = await page.title();
      const bodyText = await page.locator('body').innerText();

      let passed = false;
      let details = '';

      if (url.includes('/login')) {
        passed = false;
        details = 'Redirected to /login (Auth failed)';
      } else {
        const inputCount = await page.locator('input, textarea, select').count();
        const buttonCount = await page.locator('button').count();
        
        let matchText = true;
        if (ed.expectedText) {
          matchText = ed.expectedText.test(bodyText);
        }
        let matchInputs = true;
        if (ed.minInputs) {
          matchInputs = inputCount >= ed.minInputs;
        }

        passed = matchText && matchInputs;
        details = `Inputs: ${inputCount}, Buttons: ${buttonCount}, Matched Text: ${matchText}`;
      }

      results.editors[ed.name] = {
        path: ed.path,
        status: passed ? 'PASS' : 'FAIL',
        details
      };
      console.log(`  -> ${ed.name}: ${passed ? 'PASS' : 'FAIL'} (${details})`);
    } catch (err) {
      results.editors[ed.name] = {
        path: ed.path,
        status: 'FAIL',
        error: err.message
      };
      console.log(`  -> ${ed.name}: FAIL (${err.message})`);
    }
  }

  await browser.close();

  fs.writeFileSync('scripts/final_e2e_browser_audit.json', JSON.stringify(results, null, 2));
  console.log('\nAudit complete! Saved to scripts/final_e2e_browser_audit.json');
}

runAudit().catch(err => {
  console.error('Audit script failed:', err);
  process.exit(1);
});
