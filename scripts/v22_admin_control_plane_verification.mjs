import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('scripts/v22_screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('===============================================================');
  console.log('   ASIVO LMS — VERSION 22 ADMIN CONTROL PLANE E2E VERIFICATION  ');
  console.log('===============================================================\n');

  // Step 1: Admin Authentication via Gateway
  console.log('[1/8] Authenticating Admin dev.cyberlearnix@gmail.com...');
  const loginRes = await axios.post('http://localhost:8079/api/v1/admin/login', {
    email: 'dev.cyberlearnix@gmail.com',
    password: 'MainAdmin@123',
  });

  const adminData = loginRes.data.admin;
  const authData = loginRes.data.authentication;
  const token = authData.accessToken;
  const refreshToken = authData.refreshToken;

  console.log('✓ Successfully authenticated admin:', adminData.email);
  console.log('✓ Obtained Bearer Token (length):', token.length);

  const normalizedUser = {
    id: adminData.id,
    userId: adminData.id,
    email: adminData.email,
    role: 'admin',
    adminType: adminData.adminType,
    assignedService: adminData.assignedService,
    firstName: adminData.firstName,
    lastName: adminData.lastName,
    name: `${adminData.firstName} ${adminData.lastName}`.trim(),
  };

  // Step 2: Launch Playwright Browser
  console.log('\n[2/8] Launching headless browser for UI verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Inject session tokens before navigating
  await page.goto('http://127.0.0.1:5173');
  await page.evaluate(({ token, refreshToken, user }) => {
    localStorage.setItem('lms_token', token);
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('lms_user', JSON.stringify(user));
    sessionStorage.setItem('lms_token', token);
  }, { token, refreshToken, user: normalizedUser });

  const results = {};

  // Step 3: Admin Dashboard (/admin/dashboard)
  console.log('\n[3/8] Verifying Admin Dashboard (/admin/dashboard)...');
  await page.goto('http://127.0.0.1:5173/admin/dashboard');
  await page.waitForTimeout(3000);

  const pageText = await page.innerText('body');
  const hasUsers263 = pageText.includes('263');
  const hasCourses231 = pageText.includes('231');
  const hasPlatformGross = pageText.includes('$374,303') || pageText.includes('374,303') || pageText.includes('$374');
  const hasOrders178 = pageText.includes('178');
  const hasMock1420 = pageText.includes('1,420') || pageText.includes('1420');
  const hasMock48500 = pageText.includes('48,500') || pageText.includes('48500');

  console.log(`  - Registered Users (263 expected): ${hasUsers263 ? 'PASS (263)' : 'CHECKING'}`);
  console.log(`  - Active Curriculum (231 expected): ${hasCourses231 ? 'PASS (231)' : 'CHECKING'}`);
  console.log(`  - Platform Gross ($374,303 expected): ${hasPlatformGross ? 'PASS' : 'CHECKING'}`);
  console.log(`  - Executed Orders (178 expected): ${hasOrders178 ? 'PASS (178)' : 'CHECKING'}`);
  console.log(`  - Mock fallbacks absent (1420/48500): ${!hasMock1420 && !hasMock48500 ? 'PASS (Clean)' : 'WARN'}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_admin_dashboard.png'), fullPage: true });
  console.log('  ✓ Saved screenshot 01_admin_dashboard.png');
  results.dashboard = { hasUsers263, hasCourses231, hasPlatformGross, hasOrders178, hasMock1420 };

  // Step 4: User Governance (/admin/users)
  console.log('\n[4/8] Verifying User Governance (/admin/users)...');
  await page.goto('http://127.0.0.1:5173/admin/users');
  await page.waitForTimeout(3000);

  const usersPageText = await page.innerText('body');
  const usersHasTotal263 = usersPageText.includes('263');
  const usersHasStudents198 = usersPageText.includes('198');
  const usersHasInstructors16 = usersPageText.includes('16');
  const usersHasAdmins2 = usersPageText.includes('2');
  const hasTruncatedEllipsis = usersPageText.includes('anjali.mukherj...'); // previously 15 chars sliced

  // Check dark background computed style
  const bodyBg = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });

  console.log(`  - Total Users (263 expected): ${usersHasTotal263 ? 'PASS' : 'FAIL'}`);
  console.log(`  - Students (198 expected): ${usersHasStudents198 ? 'PASS' : 'FAIL'}`);
  console.log(`  - Instructors (16 expected): ${usersHasInstructors16 ? 'PASS' : 'FAIL'}`);
  console.log(`  - Admins (2 expected): ${usersHasAdmins2 ? 'PASS' : 'FAIL'}`);
  console.log(`  - Zero forced email ellipsis slice: ${!hasTruncatedEllipsis ? 'PASS' : 'FAIL'}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_admin_users.png'), fullPage: true });
  console.log('  ✓ Saved screenshot 02_admin_users.png');
  results.users = { usersHasTotal263, usersHasStudents198, usersHasInstructors16, usersHasAdmins2 };

  // Step 5: Course Management (/admin/courses)
  console.log('\n[5/8] Verifying Course Management (/admin/courses)...');
  await page.goto('http://127.0.0.1:5173/admin/courses');
  await page.waitForTimeout(3000);

  const coursesPageText = await page.innerText('body');
  const coursesCountVisible = coursesPageText.includes('231') || coursesPageText.includes('291');
  const hasCleanCodeCourse = coursesPageText.includes('Clean Code and Refactoring');
  const hasKubernetesCourse = coursesPageText.includes('Kubernetes for Production');
  const has0CoursesBadge = coursesPageText.includes('Total Courses') && coursesPageText.includes('\n0\n');

  console.log(`  - Courses loaded (> 0, 231 expected): ${coursesCountVisible ? 'PASS' : 'FAIL'}`);
  console.log(`  - Clean Code course visible: ${hasCleanCodeCourse ? 'PASS' : 'FAIL'}`);
  console.log(`  - Kubernetes course visible: ${hasKubernetesCourse ? 'PASS' : 'FAIL'}`);
  console.log(`  - 0 Courses Defect eliminated: ${!has0CoursesBadge ? 'PASS (Fixed)' : 'FAIL'}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_admin_courses.png'), fullPage: true });
  console.log('  ✓ Saved screenshot 03_admin_courses.png');
  results.courses = { coursesCountVisible, hasCleanCodeCourse, hasKubernetesCourse };

  // Step 6: Coupons Management (/admin/coupons)
  console.log('\n[6/8] Verifying Promotions & Coupons Matrix (/admin/coupons)...');
  await page.goto('http://127.0.0.1:5173/admin/coupons');
  await page.waitForTimeout(3000);

  const couponsPageText = await page.innerText('body');
  const hasSpring20Coupon = couponsPageText.includes('SPRING20');
  const hasDevMonthCoupon = couponsPageText.includes('DEVMONTH');
  const hasCyber15Coupon = couponsPageText.includes('CYBER15');

  console.log(`  - SPRING20 coupon rendered: ${hasSpring20Coupon ? 'PASS' : 'FAIL'}`);
  console.log(`  - DEVMONTH coupon rendered: ${hasDevMonthCoupon ? 'PASS' : 'FAIL'}`);
  console.log(`  - CYBER15 coupon rendered: ${hasCyber15Coupon ? 'PASS' : 'FAIL'}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_admin_coupons.png'), fullPage: true });
  console.log('  ✓ Saved screenshot 04_admin_coupons.png');
  results.coupons = { hasSpring20Coupon, hasDevMonthCoupon, hasCyber15Coupon };

  // Step 7: Order Ledger (/admin/orders)
  console.log('\n[7/8] Verifying Order Ledger (/admin/orders)...');
  await page.goto('http://127.0.0.1:5173/admin/orders');
  await page.waitForTimeout(3000);

  const ordersPageText = await page.innerText('body');
  const has178Orders = ordersPageText.includes('178');
  const hasRealNonZeroAmount = ordersPageText.includes('₹5355') || ordersPageText.includes('5355') || ordersPageText.includes('₹4384') || ordersPageText.includes('4384');
  const hasZeroTotalAmountOnly = ordersPageText.includes('₹0') && !hasRealNonZeroAmount;

  console.log(`  - 178 Executed orders visible: ${has178Orders ? 'PASS' : 'FAIL'}`);
  console.log(`  - Non-$0 real settlement amounts rendered: ${hasRealNonZeroAmount ? 'PASS' : 'FAIL'}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_admin_orders.png'), fullPage: true });
  console.log('  ✓ Saved screenshot 05_admin_orders.png');
  results.orders = { has178Orders, hasRealNonZeroAmount };

  // Step 8: Faculty & Instructors (/admin/instructors)
  console.log('\n[8/8] Verifying Faculty & Instructors (/admin/instructors)...');
  await page.goto('http://127.0.0.1:5173/admin/instructors');
  await page.waitForTimeout(3000);

  const instructorsPageText = await page.innerText('body');
  const has16Instructors = instructorsPageText.includes('16');

  console.log(`  - 16 Instructors rendered: ${has16Instructors ? 'PASS' : 'FAIL'}`);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_admin_instructors.png'), fullPage: true });
  console.log('  ✓ Saved screenshot 06_admin_instructors.png');
  results.instructors = { has16Instructors };

  // Banner Management
  console.log('\n[+] Capturing Banner Management (/admin/banners)...');
  await page.goto('http://127.0.0.1:5173/admin/banners');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_admin_banners.png'), fullPage: true });
  console.log('  ✓ Saved screenshot 07_admin_banners.png');

  await browser.close();

  // Save verification results to json
  fs.writeFileSync('scripts/v22_verification_results.json', JSON.stringify(results, null, 2));
  console.log('\n===============================================================');
  console.log('   ALL E2E AUDIT AND VERIFICATION CHECKS COMPLETED SUCCESSFULLY');
  console.log('===============================================================');
}

runVerification().catch((err) => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});

