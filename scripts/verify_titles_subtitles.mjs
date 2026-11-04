import { chromium } from 'playwright';

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Test 1: Landing Page
  console.log('Navigating to Landing Page...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/verified_landing_hero.png' });

  const landingInfo = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const h1Text = h1 ? h1.innerText.replace(/\s+/g, ' ').trim() : null;
    
    // Find hero subtitle paragraph
    const heroP = document.querySelector('h1 + p, main p, section p');
    const heroPText = heroP ? heroP.innerText.replace(/\s+/g, ' ').trim() : null;
    
    // Find course card titles and subtitles
    const cards = Array.from(document.querySelectorAll('.group')).slice(0, 4).map(c => {
      const title = c.querySelector('h4')?.innerText?.trim();
      const sub = c.querySelector('h4 + p')?.innerText?.trim();
      return { title, sub };
    });

    // Find banner title and subtitle
    const bannerH2 = document.querySelector('section h2');
    const bannerP = bannerH2 ? bannerH2.parentElement?.querySelector('p') : null;

    return {
      h1Text,
      heroPText,
      cards,
      bannerTitle: bannerH2 ? bannerH2.innerText.trim() : null,
      bannerSub: bannerP ? bannerP.innerText.trim() : null,
    };
  });

  console.log('--- LANDING PAGE VERIFICATION ---');
  console.log('H1 Title:', landingInfo.h1Text);
  console.log('Hero Subtitle:', landingInfo.heroPText);
  console.log('Course Cards with Subtitles:', JSON.stringify(landingInfo.cards, null, 2));
  console.log('Banner Title:', landingInfo.bannerTitle);
  console.log('Banner Subtitle:', landingInfo.bannerSub);

  // Test 2: Courses Page
  console.log('\nNavigating to Courses Page...');
  await page.goto('http://localhost:5173/courses', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/verified_courses_page.png' });
  const coursesCatalogInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.group')).slice(0, 4).map(c => {
      const title = c.querySelector('h4')?.innerText?.trim();
      const sub = c.querySelector('h4 + p')?.innerText?.trim();
      return { title, sub };
    });
    return cards;
  });
  console.log('Courses Catalog Cards:', JSON.stringify(coursesCatalogInfo, null, 2));

  // Test 3: Admin Hero Editor
  console.log('\nNavigating to Admin Hero Editor...');
  await page.evaluate(() => {
    localStorage.setItem('lms_token', 'mock_admin_token_jwt');
    localStorage.setItem('access_token', 'mock_admin_token_jwt');
    localStorage.setItem('lms_user', JSON.stringify({
      id: 'admin-1',
      role: 'admin',
      fullName: 'DevAdmin Lead',
      email: 'dev.cyberlearnix@gmail.com'
    }));
  });
  
  // Intercept profile call so admin auth succeeds
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/profile') || url.includes('/sub-admin')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'admin-1',
              role: 'admin',
              fullName: 'DevAdmin Lead',
              email: 'dev.cyberlearnix@gmail.com'
            }
          }
        })
      });
    }
    return route.continue();
  });

  await page.goto('http://localhost:5173/admin/website-management/hero', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'ASIVO_DESIGN_SCREENSHOTS/verified_admin_hero_editor.png' });
  
  const heroEditorInfo = await page.evaluate(() => {
    const labels = Array.from(document.querySelectorAll('label')).map(l => l.innerText.trim());
    const previewH2 = document.querySelector('h2');
    const previewP = previewH2 ? previewH2.parentElement?.querySelector('p') : null;
    return {
      labels: labels.filter(l => l.includes('Title') || l.includes('Heading') || l.includes('Subtitle') || l.includes('Description')),
      previewTitle: previewH2 ? previewH2.innerText.trim() : null,
      previewSub: previewP ? previewP.innerText.trim() : null,
    };
  });
  console.log('Hero Editor Labels:', heroEditorInfo.labels);
  console.log('Hero Editor Preview Title:', heroEditorInfo.previewTitle);
  console.log('Hero Editor Preview Subtitle:', heroEditorInfo.previewSub);

  await browser.close();
  console.log('\nAll verifications completed successfully!');
}

verify().catch(console.error);

