import axios from 'axios';
import fs from 'fs';

const GATEWAY = 'http://localhost:8079';

async function runAudit() {
  console.log('====================================================');
  console.log('   ASIVO LMS VERSION 20 - FULL SPECTRUM API AUDIT   ');
  console.log('====================================================\n');

  const results = [];

  const record = (moduleName, endpoint, method, role, status, expected, passed, details = '') => {
    results.push({
      moduleName,
      endpoint,
      method,
      role,
      status,
      expected,
      passed,
      details
    });
    const mark = passed ? '✅ PASS' : (status === 'BLOCKED' ? '⚠️ BLOCKED' : '❌ FAIL');
    console.log(`[${mark}] ${moduleName} | ${method} ${endpoint} (${role}) => HTTP ${status} (expected ${expected}) ${details ? '— ' + details : ''}`);
  };

  // 1. Obtain Tokens
  let adminToken = null;
  let instructorToken = null;
  let studentToken = null;
  let instructorId = null;
  let studentId = null;

  try {
    const res = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
      email: 'dev.cyberlearnix@gmail.com',
      password: 'MainAdmin@123'
    });
    adminToken = res.data?.authentication?.accessToken;
    record('User/Auth', '/api/v1/auth/login', 'POST', 'ADMIN', res.status, 200, true, 'Admin authenticated');
  } catch (err) {
    record('User/Auth', '/api/v1/auth/login', 'POST', 'ADMIN', err.response?.status || 500, 200, false, err.message);
  }

  try {
    const res = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
      email: 'rohan.malhotra@cyberlearnix.test',
      password: 'Password13!'
    });
    instructorToken = res.data?.authentication?.accessToken;
    instructorId = res.data?.user?.id || '6c43288f-a454-4abf-b946-b5abc5d99ee5';
    record('User/Auth', '/api/v1/auth/login', 'POST', 'INSTRUCTOR', res.status, 200, true, 'Instructor authenticated');
  } catch (err) {
    record('User/Auth', '/api/v1/auth/login', 'POST', 'INSTRUCTOR', err.response?.status || 500, 200, false, err.message);
  }

  try {
    const res = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
      email: 'student_browser_1792166505208@cyberlearnix.dev',
      password: 'Pass@Browser5208!'
    });
    studentToken = res.data?.authentication?.accessToken;
    studentId = res.data?.user?.id || 'b3de7b3a-0aee-4317-8d18-e399e2bb4e9f';
    record('User/Auth', '/api/v1/auth/login', 'POST', 'STUDENT', res.status, 200, true, 'Student authenticated');
  } catch (err) {
    record('User/Auth', '/api/v1/auth/login', 'POST', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  const authHeader = (token) => token ? { Authorization: `Bearer ${token}` } : {};

  // ==========================================
  // MODULE: USER SERVICE
  // ==========================================
  try {
    const res = await axios.get(`${GATEWAY}/api/v1/users/me`, { headers: authHeader(studentToken) });
    record('User Service', '/api/v1/users/me', 'GET', 'STUDENT', res.status, 200, true, `Profile: ${res.data?.email || res.data?.data?.email}`);
  } catch (err) {
    record('User Service', '/api/v1/users/me', 'GET', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  try {
    const res = await axios.put(`${GATEWAY}/api/v1/users/me`, {
      firstName: 'Student',
      lastName: 'Verified',
      bio: 'High-stakes engineering student at Asivo LMS',
      city: 'Hyderabad',
      country: 'India'
    }, { headers: authHeader(studentToken) });
    record('User Service', '/api/v1/users/me', 'PUT', 'STUDENT', res.status, 200, true, 'Updated student profile metadata');
  } catch (err) {
    record('User Service', '/api/v1/users/me', 'PUT', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  try {
    const res = await axios.get(`${GATEWAY}/api/v1/users/me/sessions`, { headers: authHeader(studentToken) });
    record('User Service', '/api/v1/users/me/sessions', 'GET', 'STUDENT', res.status, 200, true, `Active sessions count: ${Array.isArray(res.data) ? res.data.length : 'OK'}`);
  } catch (err) {
    record('User Service', '/api/v1/users/me/sessions', 'GET', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  // ==========================================
  // MODULE: COURSE SERVICE - PUBLIC & DISCOVERY
  // ==========================================
  let firstCourseId = null;
  try {
    const res = await axios.get(`${GATEWAY}/api/v1/courses?page=0&size=5`);
    const courses = res.data?.content || res.data?.courses || (Array.isArray(res.data) ? res.data : []);
    if (courses.length > 0) firstCourseId = courses[0].id;
    record('Course Service', '/api/v1/courses', 'GET', 'ANONYMOUS', res.status, 200, true, `Retrieved ${courses.length} courses catalog page`);
  } catch (err) {
    record('Course Service', '/api/v1/courses', 'GET', 'ANONYMOUS', err.response?.status || 500, 200, false, err.message);
  }

  if (firstCourseId) {
    try {
      const res = await axios.get(`${GATEWAY}/api/v1/courses/${firstCourseId}`);
      record('Course Service', `/api/v1/courses/${firstCourseId}`, 'GET', 'ANONYMOUS', res.status, 200, true, `Details for: ${res.data?.title}`);
    } catch (err) {
      record('Course Service', `/api/v1/courses/${firstCourseId}`, 'GET', 'ANONYMOUS', err.response?.status || 500, 200, false, err.message);
    }
  }

  try {
    const res = await axios.get(`${GATEWAY}/api/v1/courses/search/typeahead?query=Python`);
    record('Course Service', '/api/v1/courses/search/typeahead', 'GET', 'ANONYMOUS', res.status, 200, true, `Typeahead results: ${Array.isArray(res.data) ? res.data.length : 'OK'}`);
  } catch (err) {
    record('Course Service', '/api/v1/courses/search/typeahead', 'GET', 'ANONYMOUS', err.response?.status || 500, 200, false, err.message);
  }

  try {
    const res = await axios.get(`${GATEWAY}/api/v1/banners`);
    record('Course Service', '/api/v1/banners', 'GET', 'ANONYMOUS', res.status, 200, true, `Public active banners: ${Array.isArray(res.data) ? res.data.length : 'OK'}`);
  } catch (err) {
    record('Course Service', '/api/v1/banners', 'GET', 'ANONYMOUS', err.response?.status || 500, 200, false, err.message);
  }

  // ==========================================
  // MODULE: STUDENT ENROLLMENT & PROGRESS
  // ==========================================
  try {
    const res = await axios.get(`${GATEWAY}/api/v1/dashboard/student/courses`, { headers: authHeader(studentToken) });
    const enrolled = res.data?.courses || (Array.isArray(res.data) ? res.data : []);
    record('Course Service', '/api/v1/dashboard/student/courses', 'GET', 'STUDENT', res.status, 200, true, `Enrolled courses count: ${enrolled.length}`);
  } catch (err) {
    record('Course Service', '/api/v1/dashboard/student/courses', 'GET', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  if (firstCourseId) {
    try {
      const res = await axios.get(`${GATEWAY}/api/v1/progress/${firstCourseId}`, { headers: authHeader(studentToken) });
      record('Course Service', `/api/v1/progress/${firstCourseId}`, 'GET', 'STUDENT', res.status, 200, true, `Progress retrieved: ${res.data?.percentage ?? 0}%`);
    } catch (err) {
      record('Course Service', `/api/v1/progress/${firstCourseId}`, 'GET', 'STUDENT', err.response?.status || 500, [200, 404], [200, 404].includes(err.response?.status), err.response?.data?.message || err.message);
    }
  }

  // ==========================================
  // MODULE: CART SERVICE
  // ==========================================
  try {
    const res = await axios.get(`${GATEWAY}/api/v1/cart`, { headers: authHeader(studentToken) });
    record('Cart Service', '/api/v1/cart', 'GET', 'STUDENT', res.status, 200, true, `Cart items: ${res.data?.courses?.length || 0}`);
  } catch (err) {
    record('Cart Service', '/api/v1/cart', 'GET', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  if (firstCourseId) {
    try {
      const res = await axios.post(`${GATEWAY}/api/v1/cart`, {
        courseId: firstCourseId,
        instructorId: instructorId || '6c43288f-a454-4abf-b946-b5abc5d99ee5',
        price: 499.00
      }, { headers: authHeader(studentToken) });
      record('Cart Service', '/api/v1/cart', 'POST', 'STUDENT', res.status, 200, true, 'Item added to authenticated cart');
    } catch (err) {
      record('Cart Service', '/api/v1/cart', 'POST', 'STUDENT', err.response?.status || 500, 200, false, err.message);
    }
  }

  // ==========================================
  // MODULE: COUPON SERVICE
  // ==========================================
  try {
    const res = await axios.post(`${GATEWAY}/api/v1/coupons/validate`, {
      code: 'WELCOME10',
      totalAmount: 1000
    }, { headers: authHeader(studentToken) });
    record('Coupon Service', '/api/v1/coupons/validate', 'POST', 'STUDENT', res.status, 200, true, `Validation result: discount ${res.data?.discountAmount || res.data?.discount}`);
  } catch (err) {
    record('Coupon Service', '/api/v1/coupons/validate', 'POST', 'STUDENT', err.response?.status || 500, [200, 400], [200, 400].includes(err.response?.status), err.response?.data?.message || err.message);
  }

  try {
    const res = await axios.get(`${GATEWAY}/api/v1/coupons`, { headers: authHeader(adminToken) });
    record('Coupon Service', '/api/v1/coupons', 'GET', 'ADMIN', res.status, 200, true, `Coupons count: ${Array.isArray(res.data) ? res.data.length : (res.data?.content?.length || 0)}`);
  } catch (err) {
    record('Coupon Service', '/api/v1/coupons', 'GET', 'ADMIN', err.response?.status || 500, 200, false, err.message);
  }

  // ==========================================
  // MODULE: WISHLIST SERVICE
  // ==========================================
  try {
    const res = await axios.get(`${GATEWAY}/api/v1/wishlist`, { headers: authHeader(studentToken) });
    record('Wishlist Service', '/api/v1/wishlist', 'GET', 'STUDENT', res.status, 200, true, `Wishlist items: ${Array.isArray(res.data) ? res.data.length : (res.data?.courses?.length || 0)}`);
  } catch (err) {
    record('Wishlist Service', '/api/v1/wishlist', 'GET', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  // ==========================================
  // MODULE: ORDER SERVICE (NON-PAYMENT)
  // ==========================================
  try {
    const res = await axios.get(`${GATEWAY}/api/v1/orders/my-orders`, { headers: authHeader(studentToken) });
    const orders = Array.isArray(res.data) ? res.data : (res.data?.content || []);
    record('Order Service', '/api/v1/orders/my-orders', 'GET', 'STUDENT', res.status, 200, true, `Orders count: ${orders.length}`);
  } catch (err) {
    record('Order Service', '/api/v1/orders/my-orders', 'GET', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  // ==========================================
  // MODULE: REVIEW SERVICE
  // ==========================================
  if (firstCourseId) {
    try {
      const res = await axios.get(`${GATEWAY}/api/v1/reviews/course/${firstCourseId}`);
      record('Review Service', `/api/v1/reviews/course/${firstCourseId}`, 'GET', 'ANONYMOUS', res.status, 200, true, `Reviews count: ${Array.isArray(res.data) ? res.data.length : (res.data?.content?.length || 0)}`);
    } catch (err) {
      record('Review Service', `/api/v1/reviews/course/${firstCourseId}`, 'GET', 'ANONYMOUS', err.response?.status || 500, 200, false, err.message);
    }
  }

  // ==========================================
  // MODULE: NOTIFICATION SERVICE
  // ==========================================
  try {
    const res = await axios.get(`${GATEWAY}/api/v1/users/me/notifications`, { headers: authHeader(studentToken) });
    record('Notification Service', '/api/v1/users/me/notifications', 'GET', 'STUDENT', res.status, 200, true, 'User notifications retrieved');
  } catch (err) {
    record('Notification Service', '/api/v1/users/me/notifications', 'GET', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  try {
    const res = await axios.get(`${GATEWAY}/api/v1/users/me/unread`, { headers: authHeader(studentToken) });
    record('Notification Service', '/api/v1/users/me/unread', 'GET', 'STUDENT', res.status, 200, true, `Unread count: ${res.data?.count ?? res.data?.unreadCount ?? 0}`);
  } catch (err) {
    record('Notification Service', '/api/v1/users/me/unread', 'GET', 'STUDENT', err.response?.status || 500, 200, false, err.message);
  }

  // ==========================================
  // MODULE: INSTRUCTOR SERVICE
  // ==========================================
  if (instructorId) {
    try {
      const res = await axios.get(`${GATEWAY}/api/v1/instructors/${instructorId}/courses`, { headers: authHeader(instructorToken) });
      record('Instructor Service', `/api/v1/instructors/${instructorId}/courses`, 'GET', 'INSTRUCTOR', res.status, 200, true, `Instructor courses: ${Array.isArray(res.data) ? res.data.length : 'OK'}`);
    } catch (err) {
      record('Instructor Service', `/api/v1/instructors/${instructorId}/courses`, 'GET', 'INSTRUCTOR', err.response?.status || 500, 200, false, err.message);
    }

    try {
      const res = await axios.get(`${GATEWAY}/api/v1/instructors/${instructorId}/dashboard`, { headers: authHeader(instructorToken) });
      record('Instructor Service', `/api/v1/instructors/${instructorId}/dashboard`, 'GET', 'INSTRUCTOR', res.status, 200, true, 'Instructor dashboard metrics retrieved');
    } catch (err) {
      record('Instructor Service', `/api/v1/instructors/${instructorId}/dashboard`, 'GET', 'INSTRUCTOR', err.response?.status || 500, 200, false, err.message);
    }
  }

  // ==========================================
  // MODULE: ADMIN SERVICE & CMS
  // ==========================================
  try {
    const res = await axios.get(`${GATEWAY}/api/v1/admin/dashboard`, { headers: authHeader(adminToken) });
    record('Admin Service', '/api/v1/admin/dashboard', 'GET', 'ADMIN', res.status, 200, true, 'Admin dashboard statistics retrieved');
  } catch (err) {
    record('Admin Service', '/api/v1/admin/dashboard', 'GET', 'ADMIN', err.response?.status || 500, 200, false, err.message);
  }

  try {
    const res = await axios.get(`${GATEWAY}/api/v1/admin/users`, { headers: authHeader(adminToken) });
    record('Admin Service', '/api/v1/admin/users', 'GET', 'ADMIN', res.status, 200, true, `Admin users list count: ${Array.isArray(res.data) ? res.data.length : (res.data?.content?.length || 0)}`);
  } catch (err) {
    record('Admin Service', '/api/v1/admin/users', 'GET', 'ADMIN', err.response?.status || 500, 200, false, err.message);
  }

  try {
    const res = await axios.get(`${GATEWAY}/api/v1/public/landing-page`);
    record('Admin Service (CMS)', '/api/v1/public/landing-page', 'GET', 'ANONYMOUS', res.status, 200, true, `Public CMS title: ${res.data?.siteSettings?.platformName || res.data?.title || 'CyberLearnix'}`);
  } catch (err) {
    record('Admin Service (CMS)', '/api/v1/public/landing-page', 'GET', 'ANONYMOUS', err.response?.status || 500, 200, false, err.message);
  }

  // ==========================================
  // MODULE: PAYMENT SERVICE (EXCLUDED / BLOCKED)
  // ==========================================
  try {
    const res = await axios.get('http://localhost:8085/actuator/health');
    record('Payment Service', '/actuator/health', 'GET', 'SYSTEM', res.status, 200, true, `Health: ${res.data?.status} (Commercial payment blocked pending PayU credentials)`);
  } catch (err) {
    record('Payment Service', '/actuator/health', 'GET', 'SYSTEM', err.response?.status || 500, 200, false, err.message);
  }

  // RBAC Negative Test: Student accessing Admin endpoint
  try {
    const res = await axios.get(`${GATEWAY}/api/v1/admin/users`, { headers: authHeader(studentToken) });
    record('Security / RBAC', '/api/v1/admin/users', 'GET', 'STUDENT (FORBIDDEN)', res.status, 403, false, 'Security violation: Student accessed Admin route!');
  } catch (err) {
    const status = err.response?.status;
    const passed = status === 403 || status === 401;
    record('Security / RBAC', '/api/v1/admin/users', 'GET', 'STUDENT (BLOCKED)', status, 403, passed, passed ? 'Protected: Student rejected with 403/401' : 'Unexpected status');
  }

  // Save audit results
  fs.writeFileSync('scripts/v20_audit_results.json', JSON.stringify(results, null, 2));
  console.log('\nAudit complete. Total probed:', results.length);
  const passedCount = results.filter(r => r.passed).length;
  console.log(`Summary: ${passedCount} / ${results.length} PASSED`);
}

runAudit();

