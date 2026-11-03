import { chromium } from 'playwright';
import axios from 'axios';

async function main() {
  const loginRes = await axios.post('http://localhost:8080/api/v1/auth/social-login', {
    provider: 'GOOGLE',
    providerId: 'google-shiva-login',
    email: 'shiva91826025@gmail.com',
    name: 'sai iiiiiiiiii'
  });
  const token = loginRes.data.authentication.accessToken;
  const user = loginRes.data.user;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[Browser ${msg.type()}]:`, msg.text());
  });

  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('jwt', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', 'STUDENT');
    sessionStorage.setItem('lms_token', token);
    sessionStorage.setItem('accessToken', token);
  }, { token, user });

  await page.goto('http://localhost:5173/profile', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  const bannerInfo = await page.evaluate(() => {
    const banner = document.querySelector('.h-44');
    const img = banner?.querySelector('img');
    return {
      currentUrl: window.location.href,
      bannerExists: !!banner,
      bannerHTML: banner?.outerHTML,
      imgExists: !!img,
      imgSrc: img?.src,
      imgAlt: img?.alt,
      complete: img?.complete,
      naturalWidth: img?.naturalWidth,
      naturalHeight: img?.naturalHeight,
      display: img ? window.getComputedStyle(img).display : null,
      opacity: img ? window.getComputedStyle(img).opacity : null
    };
  });

  console.log('BANNER INFO:\n', JSON.stringify(bannerInfo, null, 2));
  await page.screenshot({ path: 'telemetry_snapshots/inspect_banner_result.png', fullPage: true });
  await browser.close();
}

main().catch(console.error);
