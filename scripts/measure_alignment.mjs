import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/v21_2_login_desktop.png', fullPage: true });

  const loginLogo = await page.locator('a[aria-label="Asivo Home"]').first().boundingBox();
  const loginHero = await page.locator('text=Learn. Build. Grow.').first().boundingBox();
  const loginBadge = await page.locator('text=Ink & Onyx Experience').first().boundingBox();
  const loginBenefits = await page.locator('text=Structured Learning Paths').first().boundingBox();
  const loginCard = await page.locator('h1:has-text("Sign In to Asivo")').first().boundingBox();

  await page.goto('http://127.0.0.1:5173/register', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'scripts/v21_2_register_desktop.png', fullPage: true });

  const regLogo = await page.locator('a[aria-label="Asivo Home"]').first().boundingBox();
  const regHero = await page.locator('text=Learn. Build. Grow.').first().boundingBox();
  const regBadge = await page.locator('text=Ink & Onyx Experience').first().boundingBox();
  const regBenefits = await page.locator('text=Structured Learning Paths').first().boundingBox();
  const regCard = await page.locator('h1:has-text("Create Asivo Account")').first().boundingBox();

  console.log('Login Y-positions:', {
    logoY: Math.round(loginLogo?.y || 0),
    badgeY: Math.round(loginBadge?.y || 0),
    heroY: Math.round(loginHero?.y || 0),
    benefitsY: Math.round(loginBenefits?.y || 0),
    cardY: Math.round(loginCard?.y || 0)
  });

  console.log('Register Y-positions:', {
    logoY: Math.round(regLogo?.y || 0),
    badgeY: Math.round(regBadge?.y || 0),
    heroY: Math.round(regHero?.y || 0),
    benefitsY: Math.round(regBenefits?.y || 0),
    cardY: Math.round(regCard?.y || 0)
  });

  const logoDiff = Math.abs((loginLogo?.y || 0) - (regLogo?.y || 0));
  const heroDiff = Math.abs((loginHero?.y || 0) - (regHero?.y || 0));
  const badgeDiff = Math.abs((loginBadge?.y || 0) - (regBadge?.y || 0));
  const benefitsDiff = Math.abs((loginBenefits?.y || 0) - (regBenefits?.y || 0));

  console.log(`\nAlignment Diffs (Login vs Register):`);
  console.log(`- Logo Diff: ${logoDiff}px`);
  console.log(`- Badge Diff: ${badgeDiff}px`);
  console.log(`- Hero Headline Diff: ${heroDiff}px`);
  console.log(`- Benefits Diff: ${benefitsDiff}px`);

  const imgBox = await page.locator('img[alt="Asivo emblem"]').first().boundingBox();
  const containerBox = await page.locator('div:has(> img[alt="Asivo emblem"])').first().boundingBox();
  console.log('\nLogo Dimensions:');
  console.log(`- Emblem Image: ${Math.round(imgBox?.width || 0)}x${Math.round(imgBox?.height || 0)}px at (${Math.round(imgBox?.x || 0)}, ${Math.round(imgBox?.y || 0)})`);
  console.log(`- Emblem Container: ${Math.round(containerBox?.width || 0)}x${Math.round(containerBox?.height || 0)}px at (${Math.round(containerBox?.x || 0)}, ${Math.round(containerBox?.y || 0)})`);

  await browser.close();
})();
