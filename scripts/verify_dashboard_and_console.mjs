import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const UI_URL = 'http://localhost:5173';
const BASE_URL = 'http://localhost:8080';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

function getCourseBackendLogs(tailLines = 15) {
  try {
    const logs = execSync(`docker logs cyberlearnix-course-service --tail ${tailLines}`, { encoding: 'utf8' });
    return logs.trim();
  } catch (err) {
    return `[Could not read docker logs: ${err.message}]`;
  }
}

async function verifyDashboardAndConsole() {
  console.log('======================================================================');
  console.log(' 🎓 STUDENT DASHBOARD & API TELEMETRY VERIFICATION');
  console.log('======================================================================\n');

  // Step 1: Authenticate Student
  console.log('1. Authenticating Student via Social Login...');
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-student-dashboard-runner',
    email: 'dashboard.student@cyberlearnix.dev',
    name: 'Dashboard QA Student'
  });
  const studentToken = studentLogin.data.authentication.accessToken;
  const studentUser = studentLogin.data.user;
  const studentId = studentUser.id || studentLogin.data.authentication.userId;

  console.log(`   -> Student User: ${studentUser.email} (ID: ${studentId})`);
  console.log(`   -> Token Acquired: ${studentToken.substring(0, 25)}...\n`);

  const studentHeaders = { Authorization: `Bearer ${studentToken}` };

  // Step 2: Direct REST verification of both endpoints
  console.log('2. Verifying Backend Endpoints directly with Student Token...');

  // 2a. GET /api/v1/dashboard/student
  try {
    const dashRes = await axios.get(`${BASE_URL}/api/v1/dashboard/student`, { headers: studentHeaders });
    console.log(`   ✅ GET /api/v1/dashboard/student -> Status: ${dashRes.status} ${dashRes.statusText}`);
    console.log(`      Payload success: ${dashRes.data.success}, message: "${dashRes.data.message}"`);
  } catch (err) {
    console.error(`   ❌ GET /api/v1/dashboard/student failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
  }

  // 2b. GET /api/v1/progress/courses
  try {
    const progRes = await axios.get(`${BASE_URL}/api/v1/progress/courses`, { headers: studentHeaders });
    console.log(`   ✅ GET /api/v1/progress/courses -> Status: ${progRes.status} ${progRes.statusText}`);
    console.log(`      Payload success: ${progRes.data.success}, message: "${progRes.data.message}"`);
  } catch (err) {
    console.error(`   ❌ GET /api/v1/progress/courses failed: ${err.response?.status} - ${JSON.stringify(err.response?.data)}`);
  }

  // Step 3: Launch Playwright to verify UI rendering and Console Telemetry
  console.log('\n3. Launching Headless Chromium to verify UI & Console Telemetry...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const consoleLogs = [];
  const consoleErrors = [];
  const networkResponses = [];

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    consoleLogs.push({ type, text });
    if (type === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('response', resp => {
    const url = resp.url();
    if (url.includes('/api/v1/')) {
      networkResponses.push({
        url: url.replace('http://localhost:5173', '').replace('http://localhost:8080', ''),
        status: resp.status()
      });
    }
  });

  // Inject authentication into localStorage before initial navigation
  await page.addInitScript(({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('jwt', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userRole', 'STUDENT');
  }, { token: studentToken, user: studentUser });

  console.log('   -> Navigating to http://localhost:5173/student/dashboard...');
  await page.goto(`${UI_URL}/student/dashboard`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const screenshotPath = path.join(SNAPSHOT_DIR, 'student_dashboard_live.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`   📸 Screenshot saved: ${screenshotPath}`);

  // Summary of Telemetry
  console.log('\n4. Telemetry Audit Report:');
  console.log('   --- API Network Responses in Browser ---');
  networkResponses.forEach(req => {
    const icon = (req.status === 200 || req.status === 201) ? '✅' : (req.status === 403 ? '❌' : '⚠️');
    console.log(`   ${icon} [${req.status}] ${req.url}`);
  });

  console.log('\n   --- Console Errors Check ---');
  const forbiddenErrors = consoleErrors.filter(e => e.includes('403') || e.includes('Forbidden'));
  const wsErrors = consoleErrors.filter(e => e.includes('WebSocket') || e.includes('stompClient'));

  if (forbiddenErrors.length === 0) {
    console.log('   ✅ 0 HTTP 403 Forbidden errors detected in UI console!');
  } else {
    console.log(`   ❌ Detected ${forbiddenErrors.length} Forbidden errors in UI console:`, forbiddenErrors);
  }

  if (wsErrors.length === 0) {
    console.log('   ✅ 0 WebSocket/STOMP connection errors detected in UI console!');
  } else {
    console.log(`   ⚠️ Detected ${wsErrors.length} WebSocket errors in UI console:`, wsErrors);
  }

  console.log('\n   --- Backend Service Logs (cyberlearnix-course-service) ---');
  console.log(getCourseBackendLogs(8));

  await browser.close();
  console.log('\n======================================================================');
  console.log(' 🏁 VERIFICATION RUN COMPLETED');
  console.log('======================================================================');
}

verifyDashboardAndConsole().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
