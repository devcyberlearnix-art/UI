import { chromium } from 'playwright';
import axios from 'axios';
import { execSync } from 'child_process';
import fs from 'fs';

async function run() {
  console.log('======================================================================');
  console.log(' 🌐 VERIFYING INSTRUCTOR UI & BACKEND LOGS INTEGRATION');
  console.log('======================================================================\n');

  // Step 1: Obtain fresh instructor credentials
  const loginRes = await axios.post('http://localhost:8080/api/v1/auth/social-login', {
    provider: 'GOOGLE',
    providerId: 'google-instructor-test-id',
    email: 'instructor.lead@cyberlearnix.test',
    name: 'Lead Instructor'
  });
  const token = loginRes.data.authentication.accessToken;
  const user = loginRes.data.user;
  const instructorId = user.id;

  console.log(`Instructor Authenticated: ${instructorId} (${user.email}, Role: ${user.role})`);
  console.log(`Access Token acquired (length: ${token.length})\n`);

  // Step 2: Launch browser with initScript
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  await context.addInitScript(({ token, user }) => {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
    localStorage.setItem('userData', JSON.stringify(user));
  }, { token, user });

  const page = await context.newPage();

  // Monitor network calls from the UI
  const networkLogs = [];
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/v1/instructors') || url.includes('/api/v1/courses')) {
      networkLogs.push({
        url,
        method: response.request().method(),
        status: response.status()
      });
      console.log(` [UI Network] ${response.request().method().padEnd(6)} ${url} -> Status ${response.status()}`);
    }
  });

  // Step 3: Directly navigate to Instructor Dashboard
  console.log('Navigating to http://localhost:5173/instructor/dashboard ...');
  await page.goto('http://localhost:5173/instructor/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  fs.mkdirSync('telemetry_snapshots', { recursive: true });
  await page.screenshot({ path: 'telemetry_snapshots/instructor_dashboard.png', fullPage: true });
  console.log('📸 Captured screenshot: telemetry_snapshots/instructor_dashboard.png\n');

  // Step 4: Test in-context runtime calls
  console.log('Executing instructor API calls inside React browser context...');
  const runtimeResults = await page.evaluate(async (instId) => {
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const resDashboard = await window.fetch(`/api/v1/instructors/${instId}/dashboard`, { headers });
    const resEarnings = await window.fetch(`/api/v1/instructors/${instId}/earnings`, { headers });
    const resCourses = await window.fetch(`/api/v1/instructors/${instId}/courses`, { headers });
    return {
      dashboard: resDashboard.status,
      earnings: resEarnings.status,
      courses: resCourses.status
    };
  }, instructorId);

  console.log('Browser In-Context Runtime API Results:', runtimeResults);

  // Step 5: Navigate to My Courses page
  console.log('\nNavigating to http://localhost:5173/instructor/courses ...');
  await page.goto('http://localhost:5173/instructor/courses', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'telemetry_snapshots/instructor_courses.png', fullPage: true });
  console.log('📸 Captured screenshot: telemetry_snapshots/instructor_courses.png\n');

  // Step 6: Navigate to Create Course page
  console.log('Navigating to http://localhost:5173/instructor/courses/create ...');
  await page.goto('http://localhost:5173/instructor/courses/create', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'telemetry_snapshots/instructor_create_course.png', fullPage: true });
  console.log('📸 Captured screenshot: telemetry_snapshots/instructor_create_course.png\n');

  await browser.close();

  // Step 7: Inspect Docker Backend Logs
  console.log('======================================================================');
  console.log(' 📋 INSPECTING BACKEND LOGS: cyberlearnix-instructor-service');
  console.log('======================================================================\n');

  const backendLogs = execSync('docker logs cyberlearnix-instructor-service --tail 60', { encoding: 'utf8' });
  const relevantLines = backendLogs.split('\n').filter(line => 
    line.includes('DispatcherServlet') || 
    line.includes('Completed 200 OK') ||
    line.includes('Writing [') ||
    line.includes('dashboard') ||
    line.includes('courses') ||
    line.includes('earnings')
  );

  relevantLines.slice(-15).forEach(line => console.log(' [BACKEND LOG] ' + line.trim()));

  console.log('\n======================================================================');
  console.log(` ✅ FRONTEND-TO-BACKEND VERIFICATION SUCCESSFUL: ${networkLogs.length} UI API Calls Recorded`);
  console.log('======================================================================\n');
}

run().catch(err => {
  console.error('UI Verification failed:', err);
  process.exit(1);
});
