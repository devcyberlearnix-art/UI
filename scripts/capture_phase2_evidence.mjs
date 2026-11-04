import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const targetDir = path.resolve('docs/asivo-2/PHASE2/screenshots');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Seed authentication in localStorage
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock_jwt_verified_phase2');
    localStorage.setItem('lms_token', 'mock_jwt_verified_phase2');
    localStorage.setItem('lms_user', JSON.stringify({
      id: 'usr_admin_01',
      name: 'Dr. Aris Thorne',
      email: 'admin@asivo.internal',
      role: 'admin',
      permissions: ['*']
    }));
  });

  const routesToCapture = [
    { url: 'http://localhost:5173/courses', name: '05_catalog_discovery.png' },
    { url: 'http://localhost:5173/student/dashboard', name: '06_student_universe_dashboard.png' },
    { url: 'http://localhost:5173/instructor/create-course', name: '07_instructor_teaching_studio.png' },
    { url: 'http://localhost:5173/admin/command-center', name: '08_admin_command_center.png' },
    { url: 'http://localhost:5173/parent/dashboard', name: '09_parent_observatory.png' },
  ];

  for (const item of routesToCapture) {
    try {
      console.log(`Navigating to ${item.url}...`);
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 8000 });
      await page.waitForTimeout(1000); // Allow animations to settle
      const outPath = path.join(targetDir, item.name);
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved screenshot: ${item.name}`);
    } catch (err) {
      console.warn(`Failed capturing ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Capture run complete.');
}

run().catch(console.error);

