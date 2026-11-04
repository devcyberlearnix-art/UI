import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve('ASIVO_DESIGN_SCREENSHOTS/admin');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// 25 Core Admin Pages to audit
const adminPages = [
  { path: '/admin/dashboard', name: '01_admin_dashboard.png', title: 'Global Telemetry & Executive Dashboard' },
  { path: '/admin/command-center', name: '02_admin_command_center.png', title: 'High-Stakes Architecture Command Center' },
  { path: '/admin/users', name: '03_admin_users.png', title: 'User Identity & RBAC Governance' },
  { path: '/admin/courses', name: '04_admin_courses.png', title: 'Curriculum & Catalog Management' },
  { path: '/admin/instructors', name: '05_admin_instructors.png', title: 'Faculty Accreditation & Verification' },
  { path: '/admin/instructor-applications', name: '06_admin_instructor_applications.png', title: 'Instructor Application Review Queue' },
  { path: '/admin/orders', name: '07_admin_orders.png', title: 'Commercial Order Ledger' },
  { path: '/admin/payments', name: '08_admin_payments.png', title: 'Settlement & Payment Reconciliation' },
  { path: '/admin/certificates', name: '09_admin_certificates.png', title: 'Cryptographic Certificate Verification' },
  { path: '/admin/analytics', name: '10_admin_analytics.png', title: 'Platform Analytics & Growth Telemetry' },
  { path: '/admin/reports', name: '11_admin_reports.png', title: 'Audit Intelligence & Report Generator' },
  { path: '/admin/reviews', name: '12_admin_reviews.png', title: 'Course Reviews & Discussion Moderation' },
  { path: '/admin/notifications', name: '13_admin_notifications.png', title: 'System-Wide Broadcast Notifications' },
  { path: '/admin/banners', name: '14_admin_banners.png', title: 'Promotional Banners & CMS Carousel' },
  { path: '/admin/coupons', name: '15_admin_coupons.png', title: 'Promotions & Discount Campaign Matrix' },
  { path: '/admin/admins', name: '16_admin_management.png', title: 'Administrative Access & Sub-Admin Accounts' },
  { path: '/admin/roles', name: '17_admin_roles.png', title: 'RBAC Permission Matrix' },
  { path: '/admin/settings', name: '18_admin_settings.png', title: 'Platform & Security Configuration' },
  { path: '/admin/profile', name: '19_admin_profile.png', title: 'Executive Profile & Credentials' },
  { path: '/admin/website-management', name: '20_admin_website_management_hub.png', title: 'CMS Website Management Hub' },
  { path: '/admin/website-management/hero', name: '21_admin_hero_editor.png', title: 'Dynamic Hero Section Editor' },
  { path: '/admin/website-management/navigation', name: '22_admin_navigation_editor.png', title: 'Global Navigation Menu Editor' },
  { path: '/admin/website-management/testimonials', name: '23_admin_testimonial_editor.png', title: 'Student Testimonial CMS' },
  { path: '/admin/website-management/statistics', name: '24_admin_statistics_editor.png', title: 'Platform KPI Statistics Editor' },
  { path: '/admin/website-management/seo', name: '25_admin_seo_editor.png', title: 'Metadata & SEO Configuration' },
];

async function auditAdmin() {
  console.log(`Starting Admin UI Verification of ${adminPages.length} routes...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Inject authenticated admin state into localStorage
  await page.addInitScript(() => {
    localStorage.setItem('token', 'mock_verified_admin_token_2026');
    localStorage.setItem('lms_token', 'mock_verified_admin_token_2026');
    localStorage.setItem('lms_user', JSON.stringify({
      id: 'usr_lead_admin_01',
      name: 'Dr. Aris Thorne',
      email: 'admin@asivo.internal',
      role: 'admin',
      permissions: ['*']
    }));
  });

  const results = [];

  for (const item of adminPages) {
    const fullUrl = `http://localhost:5173${item.path}`;
    const consoleLogs = [];
    const pageErrors = [];

    const onConsole = (msg) => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    };
    const onPageError = (err) => pageErrors.push(err.message);

    page.on('console', onConsole);
    page.on('pageerror', onPageError);

    try {
      console.log(`Auditing: ${item.path} - ${item.title}...`);
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(800); // Wait for animations & state

      const screenshotPath = path.join(screenshotDir, item.name);
      await page.screenshot({ path: screenshotPath, fullPage: false });

      // Check DOM health
      const bodyText = await page.evaluate(() => document.body.innerText.trim());
      const hasContent = bodyText.length > 50;
      const isBlank = bodyText.length < 20;

      results.push({
        path: item.path,
        name: item.name,
        title: item.title,
        status: isBlank ? 'FAILED (BLANK)' : 'PASSED',
        contentLength: bodyText.length,
        errors: pageErrors.length,
        consoleErrors: consoleLogs.length
      });
      console.log(`  -> Saved ${item.name} (${hasContent ? 'Content OK' : 'Empty Content'})`);
    } catch (err) {
      console.warn(`  -> Error on ${item.path}: ${err.message}`);
      results.push({
        path: item.path,
        name: item.name,
        title: item.title,
        status: `FAILED: ${err.message}`,
        contentLength: 0,
        errors: 1,
        consoleErrors: 0
      });
    } finally {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    }
  }

  await browser.close();

  fs.writeFileSync(
    'scratch/admin_audit_results.json',
    JSON.stringify(results, null, 2),
    'utf-8'
  );

  console.log('\n=== AUDIT RESULTS SUMMARY ===');
  let passed = 0;
  for (const r of results) {
    console.log(`${r.status.padEnd(16)} | ${r.path.padEnd(35)} | Chars: ${r.contentLength} | Errors: ${r.errors}`);
    if (r.status === 'PASSED') passed++;
  }
  console.log(`\nPassed: ${passed} / ${results.length}`);
}

auditAdmin().catch(console.error);
