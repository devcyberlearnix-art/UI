import { chromium } from 'playwright';
import axios from 'axios';
import path from 'path';

async function test() {
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
    console.log(`[Browser ${msg.type()}]: ${msg.text()}`);
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

  console.log('Navigating to http://localhost:5173/profile...');
  await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  const coverImg = await page.evaluate(() => {
    const img = document.querySelector('img[alt="Obsidian Cover"]');
    if (!img) return { found: false };
    return {
      found: true,
      src: img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      currentSrc: img.currentSrc
    };
  });

  console.log('Cover Img Info:', JSON.stringify(coverImg, null, 2));
  await page.screenshot({ path: path.resolve('telemetry_snapshots/current_cover_state.png'), fullPage: true });
  await browser.close();
}

test().catch(console.error);
