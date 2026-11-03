// scripts/verify_review_full_lifecycle.mjs
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

function getReviewBackendLogs(tailLines = 15) {
  try {
    const logs = execSync(`docker logs cyberlearnix-review-service --tail ${tailLines}`, { encoding: 'utf8' });
    return logs.trim();
  } catch (err) {
    return `[Could not read docker logs: ${err.message}]`;
  }
}

async function verifyReviewFullLifecycle() {
  console.log('======================================================================');
  console.log(' ⭐ REVIEW SERVICE: COMPREHENSIVE BACKEND & FRONTEND UI VERIFICATION');
  console.log('======================================================================\n');

  // Step 1: Acquire Credentials
  console.log('1. Authenticating Student & Admin Credentials...');
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-student-review-runner',
    email: 'review.runner@cyberlearnix.dev',
    name: 'Review QA Runner'
  });
  const studentToken = studentLogin.data.authentication.accessToken;
  const studentUser = studentLogin.data.user;
  const studentId = studentUser.id || studentLogin.data.authentication.userId;

  const adminLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
    email: 'dev.cyberlearnix@gmail.com',
    password: 'MainAdmin@123'
  });
  const adminToken = adminLogin.data?.authentication?.accessToken || adminLogin.data?.data?.accessToken || adminLogin.data?.accessToken;
  const adminUser = adminLogin.data?.user || { email: 'dev.cyberlearnix@gmail.com', role: 'admin' };

  console.log(`   -> Student User: ${studentUser.email} (ID: ${studentId})`);
  console.log(`   -> Admin User: ${adminUser.email}`);

  const studentHeaders = { Authorization: `Bearer ${studentToken}` };
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // Ensure student is enrolled in Course 4 so review submission is authorized
  try {
    await axios.post(`${BASE_URL}/api/v1/enrollments/internal/enroll`, {
      courseId: 4,
      userId: studentId
    }, { headers: studentHeaders });
    console.log('   -> Confirmed student enrollment in Course 4 for verified review permission');
  } catch (e) {
    console.log('   -> Enrollment notice:', e.response?.data?.message || e.message);
  }

  // Step 2: Direct REST Endpoints Audit in Review Service
  console.log('\n2. Auditing All Review Service REST Endpoints Directly in Backend...');

  // Endpoint 1: Get Course Reviews (Public)
  const pubReviews = await axios.get(`${BASE_URL}/api/v1/reviews/course/4`);
  console.log(`   [API 1/12] GET /api/v1/reviews/course/4 -> HTTP ${pubReviews.status} | Reviews Count: ${pubReviews.data?.totalElements || pubReviews.data?.content?.length}`);

  // Endpoint 2: Get Course Rating Summary (Public)
  const summaryRes = await axios.get(`${BASE_URL}/api/v1/reviews/course/4/summary`);
  console.log(`   [API 2/12] GET /api/v1/reviews/course/4/summary -> HTTP ${summaryRes.status} | Avg Rating: ${summaryRes.data?.averageRating}★ | Total: ${summaryRes.data?.totalReviews}`);

  // Endpoint 3: Create Review for Course 4
  let testReviewUuid = null;
  let testReviewLongId = null;
  try {
    const createRes = await axios.post(`${BASE_URL}/api/v1/reviews`, {
      courseId: 4,
      rating: 5,
      comment: 'Superb comprehensive curriculum covering reactive design & enterprise patterns!'
    }, { headers: studentHeaders });
    testReviewUuid = createRes.data?.data?.reviewId;
    testReviewLongId = createRes.data?.data?.id;
    console.log(`   [API 3/12] POST /api/v1/reviews -> HTTP ${createRes.status} | Created Review UUID: ${testReviewUuid} | ID: ${testReviewLongId}`);
  } catch (err) {
    if (err.response?.status === 409) {
      console.log('   [API 3/12] POST /api/v1/reviews -> Review already exists for student (Conflict 409 handled)');
    } else {
      console.warn('   [API 3/12] POST /api/v1/reviews error:', err.response?.status, err.response?.data);
    }
  }

  // Endpoint 4: Get My Review for Course
  const myReviewRes = await axios.get(`${BASE_URL}/api/v1/reviews/my/course/4`, { headers: studentHeaders });
  testReviewUuid = myReviewRes.data?.data?.reviewId;
  testReviewLongId = myReviewRes.data?.data?.id;
  console.log(`   [API 4/12] GET /api/v1/reviews/my/course/4 -> HTTP ${myReviewRes.status} | Rating: ${myReviewRes.data?.data?.rating}★ | Comment: "${myReviewRes.data?.data?.comment?.slice(0, 45)}..."`);

  // Endpoint 5: Get Review by UUID
  const getByUuidRes = await axios.get(`${BASE_URL}/api/v1/reviews/${testReviewUuid}`, { headers: studentHeaders });
  console.log(`   [API 5/12] GET /api/v1/reviews/${testReviewUuid} (by UUID) -> HTTP ${getByUuidRes.status} | Rating: ${getByUuidRes.data?.rating}★`);

  // Endpoint 6: Update Review by UUID
  const updateUuidRes = await axios.put(`${BASE_URL}/api/v1/reviews/${testReviewUuid}`, {
    rating: 5,
    comment: 'Updated review verification: Outstanding instructor clarity and lab assignments.'
  }, { headers: studentHeaders });
  console.log(`   [API 6/12] PUT /api/v1/reviews/${testReviewUuid} (by UUID) -> HTTP ${updateUuidRes.status} | ${updateUuidRes.data?.message}`);

  // Endpoint 7: Update Review by Long ID
  const updateLongRes = await axios.put(`${BASE_URL}/api/v1/reviews/${testReviewLongId}`, {
    rating: 5,
    comment: 'Dual-identifier test: Updated via Long numeric ID smoothly.'
  }, { headers: studentHeaders });
  console.log(`   [API 7/12] PUT /api/v1/reviews/${testReviewLongId} (by Long ID) -> HTTP ${updateLongRes.status} | ${updateLongRes.data?.message}`);

  // Endpoint 8: Admin - Get All Reviews (Paginated)
  const adminAllRes = await axios.get(`${BASE_URL}/api/v1/admin/reviews?size=20`, { headers: adminHeaders });
  console.log(`   [API 8/12] GET /api/v1/admin/reviews -> HTTP ${adminAllRes.status} | Total Platform Reviews: ${adminAllRes.data?.totalElements}`);

  // Endpoint 9: Admin - Get Review by ID
  const adminGetRes = await axios.get(`${BASE_URL}/api/v1/admin/reviews/${testReviewUuid}`, { headers: adminHeaders });
  console.log(`   [API 9/12] GET /api/v1/admin/reviews/${testReviewUuid} -> HTTP ${adminGetRes.status} | Status: ${adminGetRes.data?.status}`);

  // Endpoint 10: Admin - Hide Review
  const hideRes = await axios.patch(`${BASE_URL}/api/v1/admin/reviews/${testReviewUuid}/hide`, {}, { headers: adminHeaders });
  console.log(`   [API 10/12] PATCH /api/v1/admin/reviews/${testReviewUuid}/hide -> HTTP ${hideRes.status} | ${hideRes.data?.message}`);

  // Endpoint 11: Admin - Unhide Review
  const unhideRes = await axios.patch(`${BASE_URL}/api/v1/admin/reviews/${testReviewUuid}/unhide`, {}, { headers: adminHeaders });
  console.log(`   [API 11/12] PATCH /api/v1/admin/reviews/${testReviewUuid}/unhide -> HTTP ${unhideRes.status} | ${unhideRes.data?.message}`);

  // Step 3: Frontend UI Live Browser Automation & Simultaneous Backend Logs
  console.log('\n3. Spawning Playwright Browser to verify Frontend UI Review Workspaces & Real-Time Backend Logs...');
  const browser = await chromium.launch({ headless: true });
  const networkTraces = [];

  try {
    // ------------------------------------------------------------------------
    // Part A: Public Course Details - Reviews Tab (/courses/4)
    // ------------------------------------------------------------------------
    console.log('\n   === PART A: Course Detail Verified Reviews Tab (/courses/4) ===');
    const studentContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await studentContext.addInitScript(({ token, user }) => {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('lms_user', JSON.stringify({ ...user, role: 'student' }));
    }, { token: studentToken, user: studentUser });

    const studentPage = await studentContext.newPage();
    studentPage.on('response', (response) => {
      const url = response.url();
      if (url.includes('/reviews')) {
        networkTraces.push({ url, status: response.status(), method: response.request().method() });
        console.log(`      [UI Network Trace] ${response.request().method()} ${url.split('?')[0]} => HTTP ${response.status()}`);
      }
    });

    console.log('   A.1. Loading Course 4 Detail page (/courses/4)...');
    await studentPage.goto(`${UI_URL}/courses/4`, { waitUntil: 'networkidle' });
    await studentPage.waitForTimeout(2000);

    console.log('   A.2. Clicking "Verified Reviews" navigation tab...');
    const reviewsTab = await studentPage.$('button:has-text("Verified Reviews")');
    if (reviewsTab) {
      await reviewsTab.click();
      await studentPage.waitForTimeout(2000);

      console.log('\n      [Review Service Backend Logs Immediately Following Verified Reviews Tab Click]:');
      console.log('      -----------------------------------------------------------------------------');
      console.log('      ' + getReviewBackendLogs(8).replace(/\n/g, '\n      '));
      console.log('      -----------------------------------------------------------------------------');

      await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'review_ui_01_course_detail_reviews_tab.png') });
    }

    // ------------------------------------------------------------------------
    // Part B: Student Course Reviews Workspace (/student/courses/4/reviews)
    // ------------------------------------------------------------------------
    console.log('\n   === PART B: Student Dedicated Reviews Workspace (/student/courses/4/reviews) ===');
    await studentPage.goto(`${UI_URL}/student/courses/4/reviews`, { waitUntil: 'networkidle' });
    await studentPage.waitForTimeout(3000);

    console.log('\n      [Review Service Backend Logs on Ingesting Student Review Workspace]:');
    console.log('      -------------------------------------------------------------------');
    console.log('      ' + getReviewBackendLogs(8).replace(/\n/g, '\n      '));
    console.log('      -------------------------------------------------------------------');

    await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'review_ui_02_student_reviews_workspace.png') });

    // Test Edit Review Form Trigger
    console.log('   B.2. Clicking "Edit Review" or "Write a Review" button in UI...');
    const editReviewBtn = await studentPage.$('button:has-text("Edit Review"), button:has-text("Write a Review")');
    if (editReviewBtn) {
      await editReviewBtn.click();
      await studentPage.waitForTimeout(1500);

      const commentTextarea = await studentPage.$('textarea');
      if (commentTextarea) {
        await commentTextarea.fill('Live UI Automation verified: Excellent structure and high-yield code walkthroughs!');
        const submitBtn = await studentPage.$('button[type="submit"], button:has-text("Update Review"), button:has-text("Submit Review")');
        if (submitBtn) {
          console.log('      Submitting updated review comment from UI form...');
          await submitBtn.click();
          await studentPage.waitForTimeout(3000);

          console.log('\n      [Review Service Backend Logs Following UI Review Form Submission]:');
          console.log('      ----------------------------------------------------------------');
          console.log('      ' + getReviewBackendLogs(8).replace(/\n/g, '\n      '));
          console.log('      ----------------------------------------------------------------');
        }
      }
      await studentPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'review_ui_03_student_review_edit_form.png') });
    }

    // ------------------------------------------------------------------------
    // Part C: Admin Reviews Governance & Moderation (/admin/reviews)
    // ------------------------------------------------------------------------
    console.log('\n   === PART C: Admin Reviews Moderation Workspace (/admin/reviews) ===');
    const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await adminContext.addInitScript(({ token, user }) => {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('lms_user', JSON.stringify({ ...user, role: 'admin' }));
    }, { token: adminToken, user: adminUser });

    const adminPage = await adminContext.newPage();
    adminPage.on('response', (response) => {
      const url = response.url();
      if (url.includes('/reviews')) {
        networkTraces.push({ url, status: response.status(), method: response.request().method() });
        console.log(`      [Admin UI Network Trace] ${response.request().method()} ${url.split('?')[0]} => HTTP ${response.status()}`);
      }
    });

    console.log('   C.1. Navigating to Admin Reviews Dashboard (/admin/reviews)...');
    await adminPage.goto(`${UI_URL}/admin/reviews`, { waitUntil: 'networkidle' });
    await adminPage.waitForTimeout(3000);

    console.log('\n      [Review Service Backend Logs on Ingesting Admin Reviews Moderation Feed]:');
    console.log('      ------------------------------------------------------------------------');
    console.log('      ' + getReviewBackendLogs(8).replace(/\n/g, '\n      '));
    console.log('      ------------------------------------------------------------------------');

    await adminPage.screenshot({ path: path.join(SNAPSHOT_DIR, 'review_ui_04_admin_reviews_moderation.png') });

  } finally {
    await browser.close();
  }

  // Endpoint 12: Delete Review (Admin Purge)
  const deleteRes = await axios.delete(`${BASE_URL}/api/v1/admin/reviews/${testReviewUuid}`, { headers: adminHeaders });
  console.log(`\n   [API 12/12] DELETE /api/v1/admin/reviews/${testReviewUuid} -> HTTP ${deleteRes.status} | ${deleteRes.data?.message}`);

  console.log(`\n4. Review Service verification sequence finalized! Captured ${networkTraces.length} UI network traces.`);
  console.log('======================================================================');
  console.log(' ✅ ALL REVIEW SERVICE BACKEND & UI VERIFICATION CHECKS COMPLETE');
  console.log('======================================================================\n');
}

verifyReviewFullLifecycle().catch((err) => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});

