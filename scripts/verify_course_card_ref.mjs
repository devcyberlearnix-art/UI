import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const UI_URL = 'http://localhost:5173';
const BASE_URL = 'http://localhost:8080';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');

async function verifyCourseCardRef() {
  console.log('======================================================================');
  console.log(' 🃏 VERIFYING COURSECARD FORWARDREF & LANDING DASHBOARD');
  console.log('======================================================================\n');

  // Authenticate student to test wishlist/cart states as well
  const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-card-test',
    email: 'card.tester@cyberlearnix.dev',
    name: 'Card QA Tester'
  });
  const token = loginRes.data.authentication.accessToken;
  const user = loginRes.data.user;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleWarnings = [];
  const consoleErrors = [];

  page.on('console', msg => {
    const text = msg.text();
    if (msg.type() === 'warning') consoleWarnings.push(text);
    if (msg.type() === 'error') consoleErrors.push(text);
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

  console.log('1. Navigating to http://localhost:5173/...');
  await page.goto(`${UI_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  console.log('\n2. Checking for forwardRef / PopChild warnings...');
  const refWarnings = consoleWarnings.filter(w => 
    w.includes('Function components cannot be given refs') || 
    w.includes('CourseCard') || 
    w.includes('PopChild')
  );

  if (refWarnings.length === 0) {
    console.log('   ✅ 0 Function components cannot be given refs warnings!');
  } else {
    console.error(`   ❌ Detected ${refWarnings.length} ref warnings:`, refWarnings);
  }

  // Count rendered cards
  const cards = page.locator('.group.rounded-2xl');
  const cardCount = await cards.count();
  console.log(`   -> Found ${cardCount} rendered course cards on landing page`);

  const screenshotPath = path.join(SNAPSHOT_DIR, 'landing_cards_verified.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`   📸 Saved screenshot: ${screenshotPath}`);

  await browser.close();
  console.log('\n======================================================================');
  console.log(' 🏁 VERIFICATION COMPLETE');
  console.log('======================================================================');
}

verifyCourseCardRef().catch(console.error);
