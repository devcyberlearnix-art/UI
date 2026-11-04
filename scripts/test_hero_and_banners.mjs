import { chromium } from 'playwright';

async function testHeroAndBanners() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // 1. Check /admin/website-management/hero
  await page.addInitScript(() => {
    localStorage.setItem('lms_token', 'mock-token');
    localStorage.setItem('access_token', 'mock-token');
    localStorage.setItem('lms_user', JSON.stringify({
      id: 'admin-id',
      email: 'admin@asivo.internal',
      role: 'admin',
      permissions: ['*']
    }));
  });

  console.log('Navigating to /admin/website-management/hero...');
  await page.goto('http://localhost:5173/admin/website-management/hero', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/debug_hero_editor.png', fullPage: true });

  const heroEditorState = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input, textarea')).map(el => ({
      label: el.closest('div')?.querySelector('label')?.innerText,
      value: el.value,
      placeholder: el.placeholder
    }));
    const previewH2 = document.querySelector('h2')?.innerText;
    const previewP = document.querySelector('h2 + p, p.text-xs')?.innerText;
    return { inputs, previewH2, previewP };
  });

  console.log('Hero Editor state:', JSON.stringify(heroEditorState, null, 2));

  // 2. Check /admin/banners
  console.log('Navigating to /admin/banners...');
  await page.goto('http://localhost:5173/admin/banners', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/debug_admin_banners.png', fullPage: true });

  const bannerState = await page.evaluate(() => {
    const bannerCards = Array.from(document.querySelectorAll('h3, h4')).map(el => el.innerText);
    const tableRows = Array.from(document.querySelectorAll('tbody tr')).map(tr => tr.innerText);
    return { bannerCards, tableRows };
  });

  console.log('Banner Admin state:', JSON.stringify(bannerState, null, 2));

  await browser.close();
}

testHeroAndBanners().catch(console.error);

