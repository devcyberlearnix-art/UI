// scripts/verify_course_ui.mjs
import { chromium } from 'playwright';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const UI_URL = 'http://localhost:5173';
const BASE_URL = 'http://localhost:8080';
const SNAPSHOT_DIR = path.resolve('telemetry_snapshots');

if (!fs.existsSync(SNAPSHOT_DIR)) {
  fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
}

async function verifyCourseUI() {
  console.log('======================================================================');
  console.log(' 🌐 LAUNCHING PLAYWRIGHT COURSE SERVICE UI INTEGRATION VERIFICATION');
  console.log('======================================================================\n');

  // Step 1: Obtain live auth tokens
  console.log('1. Acquiring Student & Instructor authentication tokens...');
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-student-course-runner',
    email: 'learner.course.test@cyberlearnix.dev',
    name: 'Course Learner'
  });
  const studentToken = studentLogin.data.authentication.accessToken;
  const studentUser = studentLogin.data.user;

  const instructorLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-instructor-yash-id',
    email: 'yash.banerjee@cyberlearnix.test',
    name: 'Yash Banerjee'
  });
  const instructorToken = instructorLogin.data.authentication.accessToken;
  const instructorUser = instructorLogin.data.user;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  const networkTraces = [];
  page.on('response', (response) => {
    const url = response.url();
    if (url.includes('/api/v1/')) {
      networkTraces.push({
        url,
        status: response.status(),
        method: response.request().method()
      });
    }
  });

  try {
    // -------------------------------------------------------------
    // Test 1: Public Course Catalog (/courses)
    // -------------------------------------------------------------
    console.log('\n2. Testing Public Course Catalog (/courses)...');
    await page.goto(`${UI_URL}/courses`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const catalogTitle = await page.title();
    console.log(`   Page loaded: "${catalogTitle}"`);

    // Verify Course 4 rendered
    const hasCourseContent = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return bodyText.includes('Spring Boot') || bodyText.includes('Courses') || bodyText.includes('Masterclass');
    });
    console.log(`   Backend Course Catalog Content Rendered: ${hasCourseContent ? '✅ YES' : '❌ NO'}`);
    await page.screenshot({ path: path.join(SNAPSHOT_DIR, '01_course_catalog.png') });

    // -------------------------------------------------------------
    // Test 2: Course Details Page (/courses/4)
    // -------------------------------------------------------------
    console.log('\n3. Testing Course Detail Page (/courses/4)...');
    await page.goto(`${UI_URL}/courses/4`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const courseDetailContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasTitle: text.includes('Spring Boot') || text.includes('Masterclass'),
        hasCurriculum: text.includes('Curriculum') || text.includes('Section') || text.includes('Lecture'),
        textSnippet: text.slice(0, 200).replace(/\n+/g, ' ')
      };
    });
    console.log(`   Course Title Rendered: ${courseDetailContent.hasTitle ? '✅ YES' : '❌ NO'}`);
    console.log(`   Curriculum Structure Rendered: ${courseDetailContent.hasCurriculum ? '✅ YES' : '❌ NO'}`);
    await page.screenshot({ path: path.join(SNAPSHOT_DIR, '02_course_detail.png') });

    // -------------------------------------------------------------
    // Test 3: Student Enrolled Learning (/student/my-learning)
    // -------------------------------------------------------------
    console.log('\n4. Testing Student My Learning (/student/my-learning)...');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('access_token', token);
      localStorage.setItem('lms_user', JSON.stringify({ ...user, role: 'student' }));
    }, { token: studentToken, user: studentUser });

    await page.goto(`${UI_URL}/student/my-learning`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    const myLearningContent = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('My Learning') || text.includes('Spring Boot') || text.includes('Resume') || text.includes('Courses');
    });
    console.log(`   Student Enrolled Dashboard Rendered: ${myLearningContent ? '✅ YES' : '❌ NO'}`);
    await page.screenshot({ path: path.join(SNAPSHOT_DIR, '03_student_mylearning.png') });

    // -------------------------------------------------------------
    // Test 4: Student Classroom Player (/student/courses/4/classroom)
    // -------------------------------------------------------------
    console.log('\n5. Testing Classroom Learning Experience (/student/courses/4/classroom)...');
    await page.goto(`${UI_URL}/student/courses/4/classroom`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const classroomRendered = await page.evaluate(() => {
      const text = document.body.innerText;
      const hasVideo = !!document.querySelector('video') || !!document.querySelector('iframe');
      return {
        hasVideo,
        hasLectures: text.includes('Lecture') || text.includes('Introduction') || text.includes('Spring Boot') || text.includes('Overview and Setup') || text.includes('Classroom'),
        currentPath: window.location.pathname
      };
    });
    console.log(`   Classroom Route: ${classroomRendered.currentPath}`);
    console.log(`   Classroom Player & Content Loaded: ${classroomRendered.hasLectures || classroomRendered.hasVideo ? '✅ YES' : '❌ NO'}`);
    await page.screenshot({ path: path.join(SNAPSHOT_DIR, '04_classroom_view.png') });

    // -------------------------------------------------------------
    // Test 5: Certificate Verification (/verify-certificate)
    // -------------------------------------------------------------
    console.log('\n6. Testing Certificate Verification (/verify-certificate)...');
    await page.goto(`${UI_URL}/verify-certificate`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const certPageLoaded = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Certificate') || text.includes('Verify') || text.includes('Credential');
    });
    console.log(`   Certificate Verification Portal Rendered: ${certPageLoaded ? '✅ YES' : '❌ NO'}`);
    await page.screenshot({ path: path.join(SNAPSHOT_DIR, '05_certificate_verification.png') });

    // -------------------------------------------------------------
    // Test 6: Instructor Hub (/instructor/my-courses)
    // -------------------------------------------------------------
    console.log('\n7. Testing Instructor Course Workspace (/instructor/my-courses)...');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('lms_token', token);
      localStorage.setItem('lms_user', JSON.stringify({ ...user, role: 'instructor' }));
    }, { token: instructorToken, user: instructorUser });

    await page.goto(`${UI_URL}/instructor/my-courses`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    const instructorCoursesRendered = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Courses') || text.includes('Create Course') || text.includes('Spring Boot');
    });
    console.log(`   Instructor Course Workspace Rendered: ${instructorCoursesRendered ? '✅ YES' : '❌ NO'}`);
    await page.screenshot({ path: path.join(SNAPSHOT_DIR, '06_instructor_mycourses.png') });

    // Summary of captured frontend-to-backend API calls
    console.log('\n======================================================================');
    console.log(' 📡 FRONTEND NETWORK CALLS DISPATCHED TO BACKEND GATEWAY');
    console.log('======================================================================');
    const courseCalls = networkTraces.filter(t => t.url.includes('/courses') || t.url.includes('/enrollments') || t.url.includes('/dashboard') || t.url.includes('/instructors'));
    
    // Group and print distinct endpoint calls
    const distinctEndpoints = new Map();
    for (const call of courseCalls) {
      const parsed = new URL(call.url);
      const key = `${call.method} ${parsed.pathname}`;
      if (!distinctEndpoints.has(key)) {
        distinctEndpoints.set(key, call.status);
      }
    }

    for (const [endpoint, status] of distinctEndpoints.entries()) {
      console.log(`   [${status}] ${endpoint}`);
    }

    console.log(`\nTotal Course/Instructor API requests made from UI: ${distinctEndpoints.size}`);
    console.log('Screenshots saved to: telemetry_snapshots/');

  } catch (err) {
    console.error('UI Verification Error:', err.message);
  } finally {
    await browser.close();
  }
}

verifyCourseUI();
