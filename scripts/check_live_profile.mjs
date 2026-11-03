import { chromium } from 'playwright';
import axios from 'axios';

async function checkLiveProfile() {
  const BASE_URL = 'http://localhost:8080';
  const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
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
    if (msg.text().includes('cover') || msg.text().includes('Photo') || msg.text().includes('Error')) {
      console.log('Browser log:', msg.text());
    }
  });

  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('jwt', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', 'STUDENT');
  }, { token, user });

  // Navigate to profile
  await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  // Check cover photo element
  const coverImg = await page.evaluate(() => {
    const banner = document.querySelector('.h-44');
    const img = banner ? banner.querySelector('img') : null;
    return {
      bannerFound: !!banner,
      imgFound: !!img,
      imgSrc: img ? img.src : null,
      naturalWidth: img ? img.naturalWidth : null,
      naturalHeight: img ? img.naturalHeight : null,
      complete: img ? img.complete : null,
      alt: img ? img.alt : null
    };
  });
  console.log('Cover status in live browser:', JSON.stringify(coverImg, null, 2));

  await page.screenshot({ path: 'C:/Users/SHIVASAI/.gemini/antigravity/brain/5a7cfab4-162e-4876-9cf0-07c757a14057/profile_live_current_check.png' });
  console.log('Screenshot saved to profile_live_current_check.png');
  await browser.close();
}

checkLiveProfile().catch(console.error);
