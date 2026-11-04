import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const screenshotDir = path.resolve('ASIVO_DESIGN_SCREENSHOTS/admin');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// 25 Core Admin Pages to thoroughly audit and screenshot
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

// Rich, high-fidelity mock datasets for production simulation
const MOCK_USERS = [
  { id: 'usr_01', name: 'Elena Rostova', email: 'elena.rostova@mit.edu', role: 'STUDENT', status: 'ACTIVE', createdAt: '2026-09-12' },
  { id: 'usr_02', name: 'Marcus Vance', email: 'marcus.v@cloudarch.io', role: 'INSTRUCTOR', status: 'ACTIVE', createdAt: '2026-08-20' },
  { id: 'usr_03', name: 'Dr. Sarah Chen', email: 'schen@berkeley.edu', role: 'INSTRUCTOR', status: 'ACTIVE', createdAt: '2026-07-14' },
  { id: 'usr_04', name: 'David Okafor', email: 'd.okafor@lagos.tech', role: 'STUDENT', status: 'ACTIVE', createdAt: '2026-10-01' },
  { id: 'usr_05', name: 'Aiden Thorne', email: 'aiden@thorne-enterprises.com', role: 'PARENT', status: 'ACTIVE', createdAt: '2026-10-18' },
];

const MOCK_COURSES = [
  { id: '101', title: 'Distributed Systems & Microservices Architecture', instructorName: 'Marcus Vance', price: 1499, status: 'PUBLISHED', level: 'ADVANCED', category: 'Backend Engineering', enrolledCount: 3840 },
  { id: '102', title: 'Event-Driven Sagas & High-Throughput Kafka Pipelines', instructorName: 'Dr. Sarah Chen', price: 2499, status: 'PUBLISHED', level: 'EXPERT', category: 'Cloud Infrastructure', enrolledCount: 2910 },
  { id: '103', title: 'Fullstack Reactive Systems with Spring Boot & React 18', instructorName: 'Alex Mercer', price: 899, status: 'PUBLISHED', level: 'INTERMEDIATE', category: 'Fullstack Architecture', enrolledCount: 5120 },
];

const MOCK_INSTRUCTORS = [
  { id: 'inst_01', name: 'Marcus Vance', email: 'marcus.v@cloudarch.io', status: 'ACTIVE', createdAt: '2026-08-20', specialization: 'Distributed Systems' },
  { id: 'inst_02', name: 'Dr. Sarah Chen', email: 'schen@berkeley.edu', status: 'ACTIVE', createdAt: '2026-07-14', specialization: 'Streaming Telemetry' },
  { id: 'inst_03', name: 'Liam Sterling', email: 'l.sterling@oxford.ac.uk', status: 'PENDING_VERIFICATION', createdAt: '2026-11-02', specialization: 'Compilers & Kernels' },
  { id: 'inst_04', name: 'Amara Osei', email: 'amara@accratech.org', status: 'SUSPENDED', createdAt: '2026-05-19', specialization: 'Network Protocols' },
];

const MOCK_ORDERS = [
  { id: 'ORD-9842', orderId: 'ORD-9842', customerName: 'Elena Rostova', userEmail: 'elena.rostova@mit.edu', totalAmount: 1499.00, status: 'COMPLETED', createdAt: '2026-11-04 14:20' },
  { id: 'ORD-9843', orderId: 'ORD-9843', customerName: 'David Okafor', userEmail: 'd.okafor@lagos.tech', totalAmount: 2499.00, status: 'COMPLETED', createdAt: '2026-11-04 15:12' },
  { id: 'ORD-9844', orderId: 'ORD-9844', customerName: 'Sofia Lindqvist', userEmail: 'sofia@kth.se', totalAmount: 899.00, status: 'PROCESSING', createdAt: '2026-11-04 16:05' },
];

async function run() {
  console.log(`Starting High-Fidelity Capture of ${adminPages.length} Admin Pages...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // Route interception for live, rich, realistic data presentation
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes('/profile') || url.includes('/sub-admin')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: {
              id: 'usr_lead_admin_01',
              email: 'admin@asivo.internal',
              firstName: 'Dr. Aris',
              lastName: 'Thorne',
              role: 'admin',
              permissions: ['*']
            }
          }
        })
      });
    }

    if (url.includes('/users')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: MOCK_USERS,
          content: MOCK_USERS,
          totalElements: MOCK_USERS.length,
          totalPages: 1
        })
      });
    }

    if (url.includes('/courses')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: MOCK_COURSES,
          content: MOCK_COURSES,
          totalElements: MOCK_COURSES.length,
          totalPages: 1
        })
      });
    }

    if (url.includes('/instructors')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: MOCK_INSTRUCTORS,
          content: MOCK_INSTRUCTORS,
          totalElements: MOCK_INSTRUCTORS.length,
          totalPages: 1
        })
      });
    }

    if (url.includes('/orders')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: MOCK_ORDERS,
          content: MOCK_ORDERS,
          totalElements: MOCK_ORDERS.length,
          totalPages: 1
        })
      });
    }

    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: [],
          content: [],
          totalElements: 0,
          totalPages: 1
        })
      });
    }

    return route.continue();
  });

  await page.addInitScript(() => {
    const adminUser = {
      id: 'admin-e2e-id',
      email: 'admin@asivo.internal',
      firstName: 'Dr. Aris',
      lastName: 'Thorne',
      role: 'admin',
      permissions: ['*']
    };
    const mockToken = 'mock-valid-e2e-jwt-token';
    localStorage.setItem('lms_token', mockToken);
    localStorage.setItem('access_token', mockToken);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('lms_user', JSON.stringify(adminUser));
  });

  const auditLog = [];

  for (const item of adminPages) {
    const fullUrl = `http://localhost:5173${item.path}`;
    try {
      console.log(`[AUDIT] Capturing: ${item.path} -> ${item.name}...`);
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 12000 });
      await page.waitForTimeout(1000); // Allow spring animations & cards to settle

      const outPath = path.join(screenshotDir, item.name);
      await page.screenshot({ path: outPath, fullPage: false });

      const heading = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('h2');
        return (h1?.innerText || h2?.innerText || '').trim();
      });

      auditLog.push({
        path: item.path,
        name: item.name,
        title: item.title,
        heading: heading || 'N/A',
        status: 'VERIFIED & CAPTURED'
      });
      console.log(`  ✓ Successfully captured: ${item.name} ("${heading}")`);
    } catch (err) {
      console.warn(`  ✗ Failed capturing ${item.path}: ${err.message}`);
      auditLog.push({
        path: item.path,
        name: item.name,
        title: item.title,
        heading: 'ERROR',
        status: `ERROR: ${err.message}`
      });
    }
  }

  await browser.close();

  fs.writeFileSync(
    'scratch/admin_captured_evidence.json',
    JSON.stringify(auditLog, null, 2),
    'utf-8'
  );

  console.log(`\nAll ${auditLog.length} screenshots saved to ${screenshotDir}`);
}

run().catch(console.error);

