// scripts/verify-all-pages.mjs
import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const PUBLIC_ROUTES = [
  '/',
  '/legacy-landing',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-otp',
  '/otp-login',
  '/otp-verify',
  '/admin/login',
  '/admin/registration-success',
  '/courses',
  '/courses/1',
  '/cart',
  '/wishlist',
  '/student/courses',
  '/checkout',
  '/resilient-checkout',
  '/student/resilient-checkout',
  '/legacy-checkout',
  '/orders',
  '/certifications',
  '/verify-certificate',
  '/verify-certificate/CERT-2026-X89',
  '/instructor/apply',
  '/student/instructor-application'
];

const STUDENT_ROUTES = [
  '/student/dashboard',
  '/student/profile',
  '/student/cart',
  '/student/my-learning',
  '/student/wishlist',
  '/student/orders',
  '/student/live-classes',
  '/student/assignments',
  '/student/courses/1',
  '/student/courses/1/classroom',
  '/classroom/1',
  '/student/courses/1/quiz/1',
  '/student/courses/1/certificate',
  '/student/courses/1/live-classes',
  '/student/courses/1/reviews',
  '/student/courses/1/assignments',
  '/student/notifications',
  '/student/notification-preferences',
  '/profile'
];

const INSTRUCTOR_ROUTES = [
  '/instructor/dashboard',
  '/instructor/create-course',
  '/instructor/edit-course/1',
  '/instructor/courses/1/edit',
  '/instructor/my-courses',
  '/instructor/analytics',
  '/instructor/courses/1/assignments'
];

const ADMIN_ROUTES = [
  '/admin/dashboard',
  '/admin/command-center',
  '/admin/command-center/users',
  '/admin/sub-dashboard',
  '/admin/users',
  '/admin/courses',
  '/admin/instructors',
  '/admin/instructor-applications',
  '/admin/orders',
  '/admin/orders/1',
  '/admin/payments',
  '/admin/certificates',
  '/admin/analytics',
  '/admin/reports',
  '/admin/reviews',
  '/admin/notifications',
  '/admin/banners',
  '/admin/admins',
  '/admin/register',
  '/admin/moderation',
  '/admin/support',
  '/admin/cms',
  '/admin/settings',
  '/admin/roles',
  '/admin/ai-features',
  '/admin/gamification',
  '/admin/profile'
];

async function run() {
  console.log('================================================================');
  console.log(`🚀 Starting Full Platform Route Crash Verification Suite`);
  console.log(`🌐 Target Base URL: ${BASE_URL}`);
  console.log('================================================================\n');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  async function checkRoutes(routeList, category, sessionSetup = null) {
    console.log(`\n📂 Verifying Category: [${category}] (${routeList.length} routes)`);
    console.log('----------------------------------------------------------------');

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });

    // Mock API profile call to avoid network timeouts during verification
    await context.route('**/api/v1/auth/profile**', async (route) => {
      const role = category.toLowerCase().includes('admin')
        ? 'admin'
        : (category.toLowerCase().includes('instructor') ? 'instructor' : 'student');
      const json = {
        success: true,
        data: {
          user: {
            id: 'mock-verified-user-id',
            firstName: 'Verified',
            lastName: 'User',
            email: 'verified@cyberlearnix.dev',
            role: role
          }
        }
      };
      await route.fulfill({ json });
    });

    // Initialize session state if required
    if (sessionSetup) {
      const initPage = await context.newPage();
      await initPage.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
      await initPage.evaluate(sessionSetup);
      await initPage.close();
    }

    for (const route of routeList) {
      const page = await context.newPage();
      let pageErrors = [];

      page.on('pageerror', (err) => {
        const msg = err.message || String(err);
        if (!msg.includes('ResizeObserver') && !msg.includes('favicon')) {
          pageErrors.push(msg);
        }
      });

      const targetUrl = `${BASE_URL}${route}`;
      let status = 'PASS';
      let errorDetail = '';

      try {
        await page.goto(targetUrl, {
          waitUntil: 'domcontentloaded',
          timeout: 15000
        });

        // Allow micro-tasks, lazy chunks, and React hooks to mount
        await page.waitForTimeout(1000);

        // Check if ErrorBoundary caught a crash or root is empty
        const diagnostics = await page.evaluate(() => {
          const root = document.getElementById('root');
          const rootContent = root ? root.innerHTML.trim() : '';
          const bodyText = document.body ? document.body.innerText : '';
          
          const hasCrashHeading = Array.from(document.querySelectorAll('h1, h2, h3, p')).some(el =>
            el.innerText.includes('Application Crashed') || 
            el.innerText.includes('Something went wrong') ||
            el.innerText.includes('🔥 ErrorBoundary')
          );
          const hasHydrateFail = bodyText.includes('Module failed to hydrate');
          const rootEmpty = rootContent.length === 0;

          return {
            hasCrashHeading,
            hasHydrateFail,
            rootEmpty,
            contentLength: rootContent.length,
            currentUrl: window.location.pathname
          };
        });

        if (diagnostics.hasCrashHeading) {
          status = 'FAIL';
          errorDetail = 'ErrorBoundary "Application Crashed" rendered in DOM';
        } else if (diagnostics.hasHydrateFail) {
          status = 'FAIL';
          errorDetail = 'Lazy chunk failed to hydrate';
        } else if (diagnostics.rootEmpty) {
          status = 'FAIL';
          errorDetail = 'Root container (#root) is empty (White Screen)';
        } else if (pageErrors.length > 0) {
          status = 'FAIL';
          errorDetail = pageErrors.join('; ');
        }
      } catch (err) {
        status = 'FAIL';
        errorDetail = err.message;
      } finally {
        await page.close();
      }

      const icon = status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} [${category}] ${route.padEnd(42)} -> ${status} ${errorDetail ? `(${errorDetail})` : ''}`);

      results.push({
        category,
        route,
        status,
        errorDetail
      });
    }

    await context.close();
  }

  // 1. Check Public Routes
  await checkRoutes(PUBLIC_ROUTES, 'Public');

  // 2. Check Student Routes
  await checkRoutes(STUDENT_ROUTES, 'Student Portal', () => {
    const studentUser = {
      id: 'student-e2e-id',
      email: 'student@cyberlearnix.dev',
      firstName: 'Verified',
      lastName: 'Student',
      role: 'student'
    };
    const mockToken = 'mock-valid-e2e-jwt-token';
    localStorage.setItem('lms_token', mockToken);
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('lms_user', JSON.stringify(studentUser));
  });

  // 3. Check Instructor Routes
  await checkRoutes(INSTRUCTOR_ROUTES, 'Instructor Hub', () => {
    const instUser = {
      id: 'instructor-e2e-id',
      email: 'instructor@cyberlearnix.dev',
      firstName: 'Verified',
      lastName: 'Instructor',
      role: 'instructor'
    };
    const mockToken = 'mock-valid-e2e-jwt-token';
    localStorage.setItem('lms_token', mockToken);
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('lms_user', JSON.stringify(instUser));
  });

  // 4. Check Admin Routes
  await checkRoutes(ADMIN_ROUTES, 'Admin Center', () => {
    const adminUser = {
      id: 'admin-e2e-id',
      email: 'admin@cyberlearnix.dev',
      firstName: 'Verified',
      lastName: 'Admin',
      role: 'admin'
    };
    const mockToken = 'mock-valid-e2e-jwt-token';
    localStorage.setItem('lms_token', mockToken);
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('lms_user', JSON.stringify(adminUser));
  });

  await browser.close();

  // Summary
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log('\n================================================================');
  console.log(`📊 Route Crash Verification Summary`);
  console.log(`Total Routes Tested: ${total}`);
  console.log(`Passed (No Crash):   ${passed}`);
  console.log(`Failed (Crashed):    ${failed}`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error(`🚨 Crashed Routes:`);
    results.filter(r => r.status === 'FAIL').forEach(f => {
      console.error(`  - [${f.category}] ${f.route}: ${f.errorDetail}`);
    });
    process.exit(1);
  } else {
    console.log(`🎉 ALL ${total} PAGES RENDERED CLEANLY WITHOUT CRASHES!`);
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
