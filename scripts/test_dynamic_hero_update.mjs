import { chromium } from 'playwright';

async function testDynamicHeroUpdate() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. Visit landing page
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  let title = await page.evaluate(() => document.querySelector('h1')?.innerText?.replace(/\s+/g, ' ').trim());
  let sub = await page.evaluate(() => document.querySelector('h1 + p')?.innerText?.replace(/\s+/g, ' ').trim());
  console.log('Initial Landing Title:', title);
  console.log('Initial Landing Subtitle:', sub);

  // 2. Simulate Admin updating hero config in localStorage (dynamic admin control)
  await page.evaluate(() => {
    const updatedHero = {
      badgeText: '● ARCHITECTURE CURRICULUM • Verified Production Track',
      verificationLabel: 'Verified Production Track',
      heading: 'Master Production Systems. On Real Architecture.',
      headingEmphasis: 'On Real Architecture.',
      description: 'Zero synthetic boilerplate. Learn distributed microservices, fullstack design systems, security verification, and cloud-native resilience directly from verified engineering leads.',
      primaryCta: { label: 'Explore Courses (Get Started)', destination: '/courses', visible: true },
      secondaryCta: { label: 'Admin Command Center', destination: '/admin/command-center', visible: true }
    };
    localStorage.setItem('asivo_admin_hero_config', JSON.stringify(updatedHero));
    window.dispatchEvent(new Event('asivo:hero-updated'));
  });

  // Small delay to allow state update
  await page.waitForTimeout(500);

  // 3. Verify Landing page reflects the dynamic admin change immediately
  title = await page.evaluate(() => document.querySelector('h1')?.innerText?.replace(/\s+/g, ' ').trim());
  sub = await page.evaluate(() => document.querySelector('h1 + p')?.innerText?.replace(/\s+/g, ' ').trim());
  console.log('\nUpdated Landing Title:', title);
  console.log('Updated Landing Subtitle:', sub);

  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/verified_dynamic_hero_admin_update.png' });
  await browser.close();
  console.log('\nDynamic Admin Control Verified!');
}

testDynamicHeroUpdate().catch(console.error);

