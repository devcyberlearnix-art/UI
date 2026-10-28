/**
 * ============================================================================
 * ASIVO / FD_LMS PLATFORM TELEMETRY AUTOMATION SUITE
 * Script: capture_platform_telemetry.js
 * Architecture: Playwright Headless/Headed Telemetry Collector
 * Viewport: 1440x900 (Desktop Ultra-Wide Architectural Standard)
 * ============================================================================
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base Target Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const SNAPSHOTS_DIR = path.resolve(process.cwd(), 'telemetry_snapshots');

// Ensure isolated artifacts directory
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

// Deterministic Cryptographic Token Mocks
const STUDENT_SESSION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdGQtODkyIiwidXNlcklkIjoiYjNkZTdiM2EtMGFlZS00MzE3LThkMTgtZTM5OWUyYmI0ZTlmIiwiZW1haWwiOiJhbGV4Lm1lcmNlckBlbnRlcnByaXNlLmlvIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3OTIxNjY1MDcsImV4cCI6MTk5OTk5OTk5OX0.TAMPER_PROOF_STUDENT_HASH_SIG';

const ADMIN_SESSION_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG0tMDAxIiwidXNlcklkIjoiYWRtLXJvb3QtMDAxIiwiZW1haWwiOiJkZXYuY3liZXJsZWFybml4QGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc5MjE2NjUwNywiZXhwIjoxOTk5OTk5OTk5fQ.TAMPER_PROOF_ADMIN_HASH_SIG';

const STUDENT_USER = {
  id: 'std-892',
  userId: 'b3de7b3a-0aee-4317-8d18-e399e2bb4e9f',
  email: 'alex.mercer@enterprise.io',
  firstName: 'Alexandre',
  lastName: 'Mercer',
  name: 'Alexandre Mercer',
  role: 'student',
  mobileNumber: '+1-555-0199',
};

const ADMIN_USER = {
  id: 'adm-001',
  userId: 'adm-root-001',
  email: 'dev.cyberlearnix@gmail.com',
  firstName: 'System',
  lastName: 'Architect',
  name: 'System Architect',
  role: 'admin',
  actingRole: 'admin',
};

/**
 * Helper to stabilize and wait for dynamic hydration, Zero-CLS layout shifts,
 * and Framer Motion spring physics.
 */
async function stabilizeAndCapture(page, filename, options = {}) {
  // Wait for network idle to ensure TanStack Query / Axios fetches resolve
  try {
    await page.waitForLoadState('networkidle', { timeout: 7000 });
  } catch (e) {
    // Graceful fallback for streaming WebSockets or long-polling services
  }

  // Allow Framer Motion spring physics and layout shifts to settle
  await page.waitForTimeout(options.settleMs || 800);

  // Optional sensitive element masking (tokens, hashes, session keys)
  if (options.maskSelectors && options.maskSelectors.length > 0) {
    for (const sel of options.maskSelectors) {
      try {
        const items = page.locator(sel);
        const count = await items.count();
        for (let i = 0; i < count; i++) {
          await items.nth(i).evaluate((el) => {
            el.style.filter = 'blur(6px)';
            el.setAttribute('data-telemetry-masked', 'true');
          });
        }
      } catch (e) {
        // Safe fallback if selector is not present
      }
    }
  }

  const filePath = path.join(SNAPSHOTS_DIR, filename);
  await page.screenshot({
    path: filePath,
    fullPage: options.fullPage !== false,
  });

  console.log(`  [SNAPSHOT CAPTURED] -> /telemetry_snapshots/${filename}`);
  return filePath;
}

/**
 * Inject dynamic authentication payload into page local/session storage
 * and guard against transient 401-triggered session purges.
 */
async function injectAuthentication(context, user, token, actingRole = null) {
  await context.addInitScript(
    ({ userObj, sessionToken, role }) => {
      localStorage.setItem('lms_token', sessionToken);
      localStorage.setItem('access_token', sessionToken);
      localStorage.setItem('lms_user', JSON.stringify(userObj));
      sessionStorage.setItem('lms_token', sessionToken);
      if (role) {
        localStorage.setItem('lms_acting_role', role);
      } else {
        localStorage.removeItem('lms_acting_role');
      }
    },
    { userObj: user, sessionToken: token, role: actingRole }
  );

  // Catch 401 API responses on authenticated context to prevent rogue logout redirects
  await context.route('**/api/**', async (route) => {
    const url = route.request().url();
    // Allow intentional test mock overrides to handle their own routing
    if ((url.includes('/progress/courses') || url.includes('/courses/1/progress')) && route.request().method() === 'GET') {
      return route.fallback();
    }

    try {
      const response = await route.fetch({ timeout: 3000 });
      if (response.status() === 401) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'SUCCESS',
            code: 200,
            data: user,
            user,
          }),
        });
      } else {
        await route.fulfill({ response });
      }
    } catch (err) {
      // In offline/intermittent environments, gracefully fulfill with mock envelope
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          code: 200,
          data: user,
          user,
        }),
      });
    }
  });
}

/**
 * Main Telemetry Execution Pipeline
 */
async function runPlatformTelemetry() {
  console.log(`\n========================================================================`);
  console.log(` ASIVO / FD_LMS PLATFORM TELEMETRY SUITE: PLAYWRIGHT ORCHESTRATOR`);
  console.log(` Target Origin : ${BASE_URL}`);
  console.log(` Snapshots Dir : ${SNAPSHOTS_DIR}`);
  console.log(` Viewport Spec : 1440 x 900 (Desktop Architectural Standard)`);
  console.log(`========================================================================\n`);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
    ],
  });

  try {
    // ------------------------------------------------------------------------
    // JOURNEY 1: PUBLIC DISCOVERY HUB
    // ------------------------------------------------------------------------
    console.log(`\n▶ JOURNEY 1: Public Discovery Hub`);
    const publicContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });

    // Universal 401 shield on public context to block rogue logout redirects from axiosInstance
    await publicContext.route('**/api/**', async (route) => {
      try {
        const response = await route.fetch({ timeout: 3000 });
        if (response.status() === 401) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'SUCCESS', data: [] }),
          });
        } else {
          await route.fulfill({ response });
        }
      } catch (err) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'SUCCESS', data: [] }),
        });
      }
    });

    const publicPage = await publicContext.newPage();

    // 1.1 Public Landing Hero (/)
    console.log(`  Navigating to public landing (${BASE_URL}/)...`);
    // Ensure instant mock responses so Courses.jsx immediately exits loading state
    await publicPage.route('**/api/v1/courses/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          code: 200,
          data: [
            {
              id: 253,
              title: 'Full-Stack Cloud Architecture & Distributed Systems',
              category: 'Cloud & DevOps',
              level: 'Intermediate',
              price: 899,
              rating: 4.9,
              students: 1240,
              instructor: 'Alex Rivera',
            },
            {
              id: 254,
              title: 'Modern React 19, Next.js & Production TypeScript',
              category: 'Web Development',
              level: 'Beginner',
              price: 649,
              rating: 4.8,
              students: 2310,
              instructor: 'Sarah Chen',
            },
          ],
        }),
      });
    });

    await publicPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await publicPage.waitForSelector('h1', { timeout: 10000 });
    await stabilizeAndCapture(publicPage, '01_public_landing_hero.png');

    // 1.2 Courses Catalog & Search Focus State (/courses)
    console.log(`  Navigating to course catalog (${BASE_URL}/courses)...`);
    await publicPage.goto(`${BASE_URL}/courses`, { waitUntil: 'domcontentloaded' });
    await publicPage.waitForSelector('input[placeholder*="Search"]', { timeout: 15000 });

    const searchInput = publicPage.locator('input[placeholder*="Search"]').first();
    await searchInput.click();
    await searchInput.fill('Distributed Systems Architecture');
    await searchInput.press('ArrowRight'); // maintain focus state
    await publicPage.waitForTimeout(400);

    await stabilizeAndCapture(publicPage, '02_catalog_course_search_focus.png');
    await publicContext.close();

    // ------------------------------------------------------------------------
    // JOURNEY 2: AUTHENTICATED STUDENT WORKSPACE
    // ------------------------------------------------------------------------
    console.log(`\n▶ JOURNEY 2: Authenticated Student Workspace`);
    const studentContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    await injectAuthentication(studentContext, STUDENT_USER, STUDENT_SESSION_TOKEN, 'student');
    const studentPage = await studentContext.newPage();

    // 2.1 Active Classroom Layout & Resources Tab (/student/courses/1/classroom)
    console.log(`  Navigating to student classroom (${BASE_URL}/student/courses/1/classroom)...`);
    await studentPage.goto(`${BASE_URL}/student/courses/1/classroom`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForSelector('video, div[class*="aspect-video"]', { timeout: 12000 });
    await studentPage.waitForTimeout(1000); // Allow async re-render to settle

    // Expand curriculum accordion
    try {
      const accordionHeader = studentPage.locator('button:has-text("Module 1"), button:has-text("Module 2")').first();
      if (await accordionHeader.isVisible()) {
        await accordionHeader.click({ force: true });
        await studentPage.waitForTimeout(400);
      }
    } catch (e) {
      console.warn('  (Curriculum accordion already expanded)');
    }

    // Switch to Resources Package Tab ('Files & Assets')
    try {
      const resourcesTab = studentPage.locator('button:has-text("Files & Assets"), button:has-text("Resources")').first();
      await resourcesTab.waitFor({ state: 'visible', timeout: 8000 });
      await studentPage.waitForTimeout(300);
      await resourcesTab.click({ force: true });
      await studentPage.waitForTimeout(500);
    } catch (e) {
      console.warn('  (Resources tab click fallback)');
    }

    await stabilizeAndCapture(studentPage, '03_classroom_curriculum_resources.png', {
      maskSelectors: ['span.font-mono', 'code'],
    });

    // 2.2 Proctored Evaluation Engine (/student/courses/1/classroom/quiz/501)
    console.log(`  Navigating to fullscreen evaluation engine (${BASE_URL}/student/courses/1/classroom/quiz/501)...`);
    await studentPage.goto(`${BASE_URL}/student/courses/1/classroom/quiz/501`, { waitUntil: 'domcontentloaded' });
    await studentPage.waitForSelector('header:has-text("REMAINING TIME"), header:has-text("Assessment")', { timeout: 10000 });

    // Select an option to visualize interactive active-choice radio physics
    const choiceCard = studentPage.locator('button:has-text("Use consistent message partition keys")').first();
    if (await choiceCard.isVisible()) {
      await choiceCard.click();
      await studentPage.waitForTimeout(300);
    }

    await stabilizeAndCapture(studentPage, '04_evaluation_fullscreen_timeline.png');
    await studentContext.close();

    // ------------------------------------------------------------------------
    // JOURNEY 3: TAMPER-PROOF ACCREDITATIONS (LOCKED & CERTIFIED STATES)
    // ------------------------------------------------------------------------
    console.log(`\n▶ JOURNEY 3: Tamper-Proof Accreditations`);
    const certContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    await injectAuthentication(certContext, STUDENT_USER, STUDENT_SESSION_TOKEN, 'student');

    // 3.1 State 1: Cryptographic Lock Configuration (<100% Progress)
    const certPage = await certContext.newPage();
    // Route mock to guarantee deterministic <100% locked state
    await certPage.route('**/api/v1/progress/courses/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          percentage: 42,
          completedLectures: 6,
          totalLectures: 14,
          passedAssessments: 1,
          totalAssessments: 3,
          isCertified: false,
        }),
      });
    });

    console.log(`  Navigating to accreditation portal - Locked State (<100%)...`);
    await certPage.goto(`${BASE_URL}/student/courses/1/certificate`, { waitUntil: 'domcontentloaded' });
    await certPage.waitForSelector('text=Credential Issuance Locked', { timeout: 10000 });
    await stabilizeAndCapture(certPage, '05_accreditation_cryptographic_lock.png');

    // 3.2 State 2: Certified Luxury SVG Glassmorphic Certificate Frame (100% Complete)
    console.log(`  Switching to completed state (100% verification)...`);
    const simulate100Btn = certPage.locator('button:has-text("Simulate 100%"), button:has-text("Dev Override")').first();
    if (await simulate100Btn.isVisible()) {
      await simulate100Btn.click();
    } else {
      await certPage.unroute('**/api/v1/progress/courses/**');
      await certPage.route('**/api/v1/progress/courses/**', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'SUCCESS',
            percentage: 100,
            completedLectures: 14,
            totalLectures: 14,
            passedAssessments: 3,
            totalAssessments: 3,
            isCertified: true,
          }),
        });
      });
      await certPage.reload({ waitUntil: 'domcontentloaded' });
    }

    await certPage.waitForSelector('#credential-print-area', { timeout: 10000 });
    await stabilizeAndCapture(certPage, '06_accreditation_certified_svg_frame.png', {
      maskSelectors: ['p:has-text("Accreditation Code:")'],
    });
    await certContext.close();

    // ------------------------------------------------------------------------
    // JOURNEY 4: OPERATIONS COMMAND CENTER & DASHBOARDS
    // ------------------------------------------------------------------------
    console.log(`\n▶ JOURNEY 4: Operations Command Center & Dashboards`);
    const adminContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    await injectAuthentication(adminContext, ADMIN_USER, ADMIN_SESSION_TOKEN, 'admin');
    const adminPage = await adminContext.newPage();

    // 4.1 Operations Command Center (/admin/command-center)
    console.log(`  Navigating to admin command center (${BASE_URL}/admin/command-center)...`);
    await adminPage.goto(`${BASE_URL}/admin/command-center`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForSelector('h3:has-text("Platform Intake Velocity"), .recharts-wrapper', { timeout: 12000 });

    // Hover over Recharts Intake Rate / P95 Latency curve to trigger dynamic data tooltip
    const rechartsArea = adminPage.locator('.recharts-wrapper').first();
    if (await rechartsArea.isVisible()) {
      const box = await rechartsArea.boundingBox();
      if (box) {
        await adminPage.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.45);
        await adminPage.waitForTimeout(500);
      }
    }

    // Scroll and verify Telemetry stream view
    await stabilizeAndCapture(adminPage, '07_operations_command_center_telemetry.png');

    // 4.2 Tenant Access Manipulation Matrix (Scroll & Filter)
    console.log(`  Focusing on Tenant Access Manipulation Matrix...`);
    const tenantSection = adminPage.locator('h3:has-text("Tenant Access Profiles")').first();
    if (await tenantSection.isVisible()) {
      await tenantSection.scrollIntoViewIfNeeded();
      await adminPage.waitForTimeout(300);

      // Search tenant to exercise interaction
      const tenantSearchInput = adminPage.locator('input[placeholder*="Search tenant"]').first();
      if (await tenantSearchInput.isVisible()) {
        await tenantSearchInput.fill('Alexandre');
        await adminPage.waitForTimeout(400);
      }
    }
    await stabilizeAndCapture(adminPage, '08_operations_tenant_access_matrix.png');

    // 4.3 Executive Administrative Dashboard (/admin/dashboard)
    console.log(`  Navigating to executive admin dashboard (${BASE_URL}/admin/dashboard)...`);
    await adminPage.goto(`${BASE_URL}/admin/dashboard`, { waitUntil: 'domcontentloaded' });
    await adminPage.waitForSelector('h1:has-text("Command Center Overview")', { timeout: 10000 });

    // Hover over Candidate Enrollment Velocity chart
    const dashChart = adminPage.locator('.recharts-wrapper').first();
    if (await dashChart.isVisible()) {
      const box = await dashChart.boundingBox();
      if (box) {
        await adminPage.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.4);
        await adminPage.waitForTimeout(400);
      }
    }
    await stabilizeAndCapture(adminPage, '09_executive_admin_dashboard.png');

    await adminContext.close();

    console.log(`\n========================================================================`);
    console.log(` ✅ ALL 9 TELEMETRY SNAPSHOTS SUCCESSFULLY GENERATED IN:`);
    console.log(`    ${SNAPSHOTS_DIR}`);
    console.log(`========================================================================\n`);
  } catch (err) {
    console.error(`\n❌ [TELEMETRY SUITE RUNTIME EXCEPTION]:`, err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

// Native Console Execution Trigger
runPlatformTelemetry();
