import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const UI_URL = 'http://localhost:5173';
const BASE_URL = 'http://localhost:8080';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');

async function debugCover() {
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
    console.log(`[Browser Console ${msg.type()}]:`, msg.text());
  });

  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', 'STUDENT');
  }, { token, user });

  console.log('Navigating to http://localhost:5173/profile...');
  await page.goto(`${UI_URL}/profile`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  const bannerHtml = await page.evaluate(() => {
    const el = document.querySelector('.h-44');
    return el ? el.outerHTML : 'NOT FOUND';
  });
  console.log('Banner HTML:', bannerHtml);

  await page.screenshot({ path: path.join(SNAPSHOT_DIR, 'profile_cover_debug.png'), fullPage: true });
  await browser.close();
}

debugCover().catch(console.error);

