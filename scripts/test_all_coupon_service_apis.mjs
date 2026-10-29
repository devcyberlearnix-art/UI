// scripts/test_all_coupon_service_apis.mjs
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

const results = [];

function recordTest(category, name, method, endpoint, resOrErr, expectedStatuses = [200, 201]) {
  const status = resOrErr.status || resOrErr.response?.status || 'ERR';
  const passed = expectedStatuses.includes(status);
  const data = resOrErr.data || resOrErr.response?.data;
  const isExpected = passed ? '✅' : '❌';
  
  console.log(`${isExpected} [${status}] ${method.padEnd(6)} ${endpoint.padEnd(52)} -> ${name}`);
  if (!passed && data) {
    console.log(`   Error: ${JSON.stringify(data).slice(0, 180)}`);
  }

  results.push({ category, name, method, endpoint, status, passed });
}

async function run() {
  console.log('======================================================================');
  console.log(' 🚀 EXECUTING COMPREHENSIVE COUPON SERVICE BACKEND TEST SUITE');
  console.log('======================================================================\n');

  // Step 1: Acquire Tokens
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-student-course-runner',
    email: 'learner.course.test@cyberlearnix.dev',
    name: 'Course Learner'
  });
  const studentToken = studentLogin.data.authentication.accessToken;
  const studentId = studentLogin.data.user.id;
  const studentHeaders = { 'Authorization': `Bearer ${studentToken}` };

  const instructorLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-instructor-yash-id',
    email: 'yash.banerjee@cyberlearnix.test',
    name: 'Yash Banerjee'
  });
  const instructorToken = instructorLogin.data.authentication.accessToken;
  const instructorHeaders = { 'Authorization': `Bearer ${instructorToken}` };

  const adminLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
    email: 'dev.cyberlearnix@gmail.com',
    password: 'MainAdmin@123'
  });
  const adminToken = adminLogin.data?.authentication?.accessToken || adminLogin.data?.data?.accessToken || adminLogin.data?.accessToken;
  const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

  console.log('Tokens Acquired:');
  console.log(`- Student: ${studentId}`);
  console.log(`- Instructor: yash.banerjee@cyberlearnix.test`);
  console.log(`- Admin: dev.cyberlearnix@gmail.com\n`);

  // -------------------------------------------------------------
  // 1. COUPON DISCOVERY & RETRIEVAL
  // -------------------------------------------------------------
  console.log('--- 1. Coupon Discovery & Listing ---');
  let firstCouponId = null;
  let firstCouponCode = 'WELCOME50';

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/coupons`, { headers: studentHeaders });
    const list = res.data?.data || res.data || [];
    if (list.length > 0) {
      firstCouponId = list[0].couponId || list[0].id;
      firstCouponCode = list[0].code;
    }
    recordTest('Discovery', 'Get All Coupons', 'GET', '/api/v1/coupons', res, [200]);
  } catch (e) { recordTest('Discovery', 'Get All Coupons', 'GET', '/api/v1/coupons', e, [200]); }

  if (firstCouponId) {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/coupons/${firstCouponId}`, { headers: studentHeaders });
      recordTest('Discovery', 'Get Coupon Details by ID', 'GET', `/api/v1/coupons/${firstCouponId}`, res, [200]);
    } catch (e) { recordTest('Discovery', 'Get Coupon Details by ID', 'GET', `/api/v1/coupons/${firstCouponId}`, e, [200]); }
  }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/coupons/validate/${firstCouponCode}`, { headers: studentHeaders });
    recordTest('Validation', 'Quick Validate by Code (Path Param)', 'GET', `/api/v1/coupons/validate/${firstCouponCode}`, res, [200]);
  } catch (e) { recordTest('Validation', 'Quick Validate by Code (Path Param)', 'GET', `/api/v1/coupons/validate/${firstCouponCode}`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/coupons/campaigns`, { headers: studentHeaders });
    recordTest('Campaigns', 'Get All Campaign Names', 'GET', '/api/v1/coupons/campaigns', res, [200]);
  } catch (e) { recordTest('Campaigns', 'Get All Campaign Names', 'GET', '/api/v1/coupons/campaigns', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/coupons/my`, { headers: studentHeaders });
    recordTest('User', 'Get My Assigned Coupons', 'GET', '/api/v1/coupons/my', res, [200]);
  } catch (e) { recordTest('User', 'Get My Assigned Coupons', 'GET', '/api/v1/coupons/my', e, [200]); }

  // -------------------------------------------------------------
  // 2. COUPON VALIDATION & AUTO-APPLY
  // -------------------------------------------------------------
  console.log('\n--- 2. Coupon Validation & Auto-Apply ---');
  try {
    const res = await axios.post(`${BASE_URL}/api/v1/coupons/validate`, {
      couponCode: firstCouponCode,
      price: 2999.00
    }, { headers: studentHeaders });
    recordTest('Validation', 'Validate Coupon with Price', 'POST', '/api/v1/coupons/validate', res, [200]);
  } catch (e) { recordTest('Validation', 'Validate Coupon with Price', 'POST', '/api/v1/coupons/validate', e, [200]); }

  try {
    const res = await axios.post(`${BASE_URL}/api/v1/coupons/best-discount`, {
      price: 4999.00
    }, { headers: studentHeaders });
    recordTest('AutoApply', 'Get Best Discount (Auto-Apply)', 'POST', '/api/v1/coupons/best-discount', res, [200]);
  } catch (e) { recordTest('AutoApply', 'Get Best Discount (Auto-Apply)', 'POST', '/api/v1/coupons/best-discount', e, [200]); }

  // -------------------------------------------------------------
  // 3. COUPON AUTHORING & LIFECYCLE (ADMIN / INSTRUCTOR)
  // -------------------------------------------------------------
  console.log('\n--- 3. Coupon Authoring & Lifecycle ---');
  const uniqueCode = `CYBER${Date.now().toString().slice(-5)}`;
  let createdCouponId = null;

  try {
    const now = new Date();
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const res = await axios.post(`${BASE_URL}/api/v1/coupons`, {
      code: uniqueCode,
      title: 'Spring Automation Discount',
      description: 'Exclusive 25% discount for verified learners.',
      discountType: 'PERCENTAGE',
      discountValue: 25.0,
      minimumOrderAmount: 500.0,
      maximumDiscountAmount: 2000.0,
      usageLimit: 100,
      usageLimitPerUser: 1,
      validFrom: now.toISOString(),
      validUntil: expiry.toISOString(),
      applicableTo: 'ALL',
      stackable: false,
      status: 'ACTIVE'
    }, { headers: adminHeaders });

    createdCouponId = res.data?.data?.couponId || res.data?.couponId || res.data?.data?.id || res.data?.id;
    recordTest('Lifecycle', 'Create Coupon (Admin)', 'POST', '/api/v1/coupons', res, [200, 201]);
  } catch (e) { recordTest('Lifecycle', 'Create Coupon (Admin)', 'POST', '/api/v1/coupons', e, [200, 201]); }

  if (createdCouponId) {
    try {
      const res = await axios.put(`${BASE_URL}/api/v1/coupons/${createdCouponId}`, {
        title: 'Updated Spring Automation Discount',
        description: 'Updated 30% discount for verified learners.',
        discountValue: 30.0,
        status: 'ACTIVE'
      }, { headers: adminHeaders });
      recordTest('Lifecycle', 'Update Coupon Metadata', 'PUT', `/api/v1/coupons/${createdCouponId}`, res, [200]);
    } catch (e) { recordTest('Lifecycle', 'Update Coupon Metadata', 'PUT', `/api/v1/coupons/${createdCouponId}`, e, [200]); }

    try {
      const res = await axios.patch(`${BASE_URL}/api/v1/coupons/${createdCouponId}/deactivate`, {}, { headers: adminHeaders });
      recordTest('Lifecycle', 'Deactivate Coupon', 'PATCH', `/api/v1/coupons/${createdCouponId}/deactivate`, res, [200]);
    } catch (e) { recordTest('Lifecycle', 'Deactivate Coupon', 'PATCH', `/api/v1/coupons/${createdCouponId}/deactivate`, e, [200]); }

    try {
      const res = await axios.patch(`${BASE_URL}/api/v1/coupons/${createdCouponId}/activate`, {}, { headers: adminHeaders });
      recordTest('Lifecycle', 'Activate Coupon', 'PATCH', `/api/v1/coupons/${createdCouponId}/activate`, res, [200]);
    } catch (e) { recordTest('Lifecycle', 'Activate Coupon', 'PATCH', `/api/v1/coupons/${createdCouponId}/activate`, e, [200]); }

    try {
      const res = await axios.post(`${BASE_URL}/api/v1/coupons/assign-user`, {
        couponCode: uniqueCode,
        userId: studentId
      }, { headers: adminHeaders });
      recordTest('Assignment', 'Assign Coupon to Student User', 'POST', '/api/v1/coupons/assign-user', res, [200]);
    } catch (e) { recordTest('Assignment', 'Assign Coupon to Student User', 'POST', '/api/v1/coupons/assign-user', e, [200]); }

    try {
      const res = await axios.post(`${BASE_URL}/api/v1/coupons/redeem`, {
        couponCode: uniqueCode,
        courseId: 4
      }, { headers: studentHeaders });
      recordTest('Redemption', 'Redeem Coupon upon Checkout', 'POST', '/api/v1/coupons/redeem', res, [200]);
    } catch (e) { recordTest('Redemption', 'Redeem Coupon upon Checkout', 'POST', '/api/v1/coupons/redeem', e, [200]); }

    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/coupons/${createdCouponId}`, { headers: adminHeaders });
      recordTest('Lifecycle', 'Delete Coupon (Cleanup)', 'DELETE', `/api/v1/coupons/${createdCouponId}`, res, [200]);
    } catch (e) { recordTest('Lifecycle', 'Delete Coupon (Cleanup)', 'DELETE', `/api/v1/coupons/${createdCouponId}`, e, [200]); }
  }

  // -------------------------------------------------------------
  // 4. BULK GENERATION (CAMPAIGNS)
  // -------------------------------------------------------------
  console.log('\n--- 4. Bulk Coupon Campaign Generation ---');
  try {
    const expiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
    const res = await axios.post(`${BASE_URL}/api/v1/coupons/bulk`, {
      campaignName: 'SUMMERFEST',
      discountType: 'PERCENTAGE',
      discountValue: 15.0,
      totalCoupons: 3,
      expiryDate: expiry,
      creatorRole: 'MAIN_ADMIN'
    }, { headers: adminHeaders });
    recordTest('Bulk', 'Bulk Generate Campaign Coupons', 'POST', '/api/v1/coupons/bulk', res, [200, 201]);
  } catch (e) { recordTest('Bulk', 'Bulk Generate Campaign Coupons', 'POST', '/api/v1/coupons/bulk', e, [200, 201]); }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const rate = Math.round((passed / total) * 100);

  console.log('\n======================================================================');
  console.log(` 📊 COUPON SERVICE TEST RESULTS: ${passed} of ${total} PASSED (${rate}%)`);
  console.log('======================================================================\n');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
