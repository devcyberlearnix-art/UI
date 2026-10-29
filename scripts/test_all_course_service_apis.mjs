import axios from 'axios';

const BASE_URL = 'http://localhost:8080';
const results = [];

function recordTest(category, name, method, path, response, expectedStatuses = [200, 201]) {
  const status = response?.status || response?.statusCode || (response?.response ? response.response.status : 500);
  const passed = expectedStatuses.includes(status);
  const data = response?.data || response?.response?.data;
  
  results.push({
    category,
    name,
    method,
    path,
    status,
    passed,
    message: data?.message || data?.error || (passed ? 'Success' : 'Failed')
  });

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${String(status).padEnd(3)}] ${method.padEnd(6)} ${path.padEnd(52)} -> ${name}`);
  if (!passed) {
    console.log('   Error:', JSON.stringify(data).slice(0, 180));
  }
}

async function run() {
  console.log('======================================================================');
  console.log(' 🚀 EXECUTING COMPREHENSIVE COURSE SERVICE BACKEND TEST SUITE');
  console.log('======================================================================\n');

  // Step 1: Obtain tokens
  // 1A. Student Token
  const studentLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-student-course-runner',
    email: 'learner.course.test@cyberlearnix.dev',
    name: 'Course Learner'
  });
  const studentToken = studentLogin.data.authentication.accessToken;
  const studentId = studentLogin.data.user.id;
  const studentHeaders = { 'Authorization': `Bearer ${studentToken}` };

  // 1B. Instructor Token
  const instructorLogin = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-instructor-test-id',
    email: 'instructor.lead@cyberlearnix.test',
    name: 'Lead Instructor'
  });
  const instructorToken = instructorLogin.data.authentication.accessToken;
  const instructorId = instructorLogin.data.user.id;
  const instructorHeaders = { 'Authorization': `Bearer ${instructorToken}` };

  // 1C. Admin Token
  const adminLogin = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
    email: 'dev.cyberlearnix@gmail.com',
    password: 'MainAdmin@123'
  });
  const adminToken = adminLogin.data.data.accessToken;
  const adminHeaders = { 'Authorization': `Bearer ${adminToken}` };

  console.log('Tokens Acquired:');
  console.log(`- Student: ${studentId}`);
  console.log(`- Instructor: ${instructorId}`);
  console.log(`- Admin: dev.cyberlearnix@gmail.com\n`);

  // Target Course ID: 4 (Spring Boot Masterclass)
  const targetCourseId = 4;

  // -------------------------------------------------------------
  // 1. PUBLIC COURSE CATALOG & DISCOVERY
  // -------------------------------------------------------------
  console.log('--- 1. Course Discovery & Catalog (Public) ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/list`);
    recordTest('Discovery', 'Get Course List (Paginated)', 'GET', '/api/v1/courses/list', res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Course List (Paginated)', 'GET', '/api/v1/courses/list', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/featured`);
    recordTest('Discovery', 'Get Featured Courses', 'GET', '/api/v1/courses/featured', res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Featured Courses', 'GET', '/api/v1/courses/featured', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/trending`);
    recordTest('Discovery', 'Get Trending Courses', 'GET', '/api/v1/courses/trending', res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Trending Courses', 'GET', '/api/v1/courses/trending', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}`);
    recordTest('Discovery', 'Get Course by ID', 'GET', `/api/v1/courses/${targetCourseId}`, res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Course by ID', 'GET', `/api/v1/courses/${targetCourseId}`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}/details`);
    recordTest('Discovery', 'Get Course Comprehensive Details', 'GET', `/api/v1/courses/${targetCourseId}/details`, res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Course Comprehensive Details', 'GET', `/api/v1/courses/${targetCourseId}/details`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}/curriculum`);
    recordTest('Discovery', 'Get Course Curriculum Tree', 'GET', `/api/v1/courses/${targetCourseId}/curriculum`, res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Course Curriculum Tree', 'GET', `/api/v1/courses/${targetCourseId}/curriculum`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}/preview`);
    recordTest('Discovery', 'Get Course Preview Media', 'GET', `/api/v1/courses/${targetCourseId}/preview`, res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Course Preview Media', 'GET', `/api/v1/courses/${targetCourseId}/preview`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}/sections`);
    recordTest('Discovery', 'Get Course Sections', 'GET', `/api/v1/courses/${targetCourseId}/sections`, res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Course Sections', 'GET', `/api/v1/courses/${targetCourseId}/sections`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/sections/13/lectures`);
    recordTest('Discovery', 'Get Section Lectures', 'GET', '/api/v1/sections/13/lectures', res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Section Lectures', 'GET', '/api/v1/sections/13/lectures', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}/requirements`);
    recordTest('Discovery', 'Get Course Requirements', 'GET', `/api/v1/courses/${targetCourseId}/requirements`, res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Course Requirements', 'GET', `/api/v1/courses/${targetCourseId}/requirements`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}/outcomes`);
    recordTest('Discovery', 'Get Learning Outcomes', 'GET', `/api/v1/courses/${targetCourseId}/outcomes`, res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Learning Outcomes', 'GET', `/api/v1/courses/${targetCourseId}/outcomes`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}/materials`);
    recordTest('Discovery', 'Get Course Materials', 'GET', `/api/v1/courses/${targetCourseId}/materials`, res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Course Materials', 'GET', `/api/v1/courses/${targetCourseId}/materials`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}/faqs`);
    recordTest('Discovery', 'Get Course FAQs', 'GET', `/api/v1/courses/${targetCourseId}/faqs`, res, [200]);
  } catch (e) { recordTest('Discovery', 'Get Course FAQs', 'GET', `/api/v1/courses/${targetCourseId}/faqs`, e, [200]); }

  try {
    const res = await axios.post(`${BASE_URL}/api/v1/courses/${targetCourseId}/impressions?source=HOME`);
    recordTest('Analytics', 'Track Course Impression', 'POST', `/api/v1/courses/${targetCourseId}/impressions`, res, [200]);
  } catch (e) { recordTest('Analytics', 'Track Course Impression', 'POST', `/api/v1/courses/${targetCourseId}/impressions`, e, [200]); }

  // -------------------------------------------------------------
  // 2. STUDENT ENROLLMENT & LEARNING PROGRESS
  // -------------------------------------------------------------
  console.log('\n--- 2. Student Enrollment & Progress ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/enrollments/check/${targetCourseId}`, { headers: studentHeaders });
    recordTest('Enrollment', 'Check Enrollment Status', 'GET', `/api/v1/enrollments/check/${targetCourseId}`, res, [200]);
  } catch (e) { recordTest('Enrollment', 'Check Enrollment Status', 'GET', `/api/v1/enrollments/check/${targetCourseId}`, e, [200]); }

  try {
    const res = await axios.post(`${BASE_URL}/api/v1/courses/${targetCourseId}/enroll`, {}, { headers: studentHeaders });
    recordTest('Enrollment', 'Enroll in Course', 'POST', `/api/v1/courses/${targetCourseId}/enroll`, res, [200, 201]);
  } catch (e) { recordTest('Enrollment', 'Enroll in Course', 'POST', `/api/v1/courses/${targetCourseId}/enroll`, e, [200, 201, 400]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/enrollments/my`, { headers: studentHeaders });
    recordTest('Enrollment', 'Get My Enrollments', 'GET', '/api/v1/enrollments/my', res, [200]);
  } catch (e) { recordTest('Enrollment', 'Get My Enrollments', 'GET', '/api/v1/enrollments/my', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/dashboard/student`, { headers: studentHeaders });
    recordTest('Learning', 'Get Student Dashboard Overview', 'GET', '/api/v1/dashboard/student', res, [200]);
  } catch (e) { recordTest('Learning', 'Get Student Dashboard Overview', 'GET', '/api/v1/dashboard/student', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/dashboard/student/courses`, { headers: studentHeaders });
    recordTest('Learning', 'Get Student Enrolled Courses', 'GET', '/api/v1/dashboard/student/courses', res, [200]);
  } catch (e) { recordTest('Learning', 'Get Student Enrolled Courses', 'GET', '/api/v1/dashboard/student/courses', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/${targetCourseId}/content`, { headers: studentHeaders });
    recordTest('Learning', 'Get Course Classroom Content', 'GET', `/api/v1/courses/${targetCourseId}/content`, res, [200]);
  } catch (e) { recordTest('Learning', 'Get Course Classroom Content', 'GET', `/api/v1/courses/${targetCourseId}/content`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/lectures/49/learn`, { headers: studentHeaders });
    recordTest('Learning', 'Get Lecture Learn Details', 'GET', '/api/v1/courses/lectures/49/learn', res, [200]);
  } catch (e) { recordTest('Learning', 'Get Lecture Learn Details', 'GET', '/api/v1/courses/lectures/49/learn', e, [200]); }

  try {
    const res = await axios.post(`${BASE_URL}/api/v1/progress/lectures/49/start`, {}, { headers: studentHeaders });
    recordTest('Progress', 'Start Lecture Progress', 'POST', '/api/v1/progress/lectures/49/start', res, [200, 201]);
  } catch (e) { recordTest('Progress', 'Start Lecture Progress', 'POST', '/api/v1/progress/lectures/49/start', e, [200, 201]); }

  try {
    const res = await axios.patch(`${BASE_URL}/api/v1/progress/lectures/49`, { playbackPositionSeconds: 120, completed: false }, { headers: studentHeaders });
    recordTest('Progress', 'Update Lecture Progress', 'PATCH', '/api/v1/progress/lectures/49', res, [200]);
  } catch (e) { recordTest('Progress', 'Update Lecture Progress', 'PATCH', '/api/v1/progress/lectures/49', e, [200]); }

  try {
    const res = await axios.patch(`${BASE_URL}/api/v1/progress/lectures/49/complete`, {}, { headers: studentHeaders });
    recordTest('Progress', 'Complete Lecture', 'PATCH', '/api/v1/progress/lectures/49/complete', res, [200]);
  } catch (e) { recordTest('Progress', 'Complete Lecture', 'PATCH', '/api/v1/progress/lectures/49/complete', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/progress/lectures/49`, { headers: studentHeaders });
    recordTest('Progress', 'Get Lecture Progress', 'GET', '/api/v1/progress/lectures/49', res, [200]);
  } catch (e) { recordTest('Progress', 'Get Lecture Progress', 'GET', '/api/v1/progress/lectures/49', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/progress/courses/${targetCourseId}`, { headers: studentHeaders });
    recordTest('Progress', 'Get Course Progress Percentage', 'GET', `/api/v1/progress/courses/${targetCourseId}`, res, [200]);
  } catch (e) { recordTest('Progress', 'Get Course Progress Percentage', 'GET', `/api/v1/progress/courses/${targetCourseId}`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/progress/courses/${targetCourseId}/resume`, { headers: studentHeaders });
    recordTest('Progress', 'Get Resume Learning Position', 'GET', `/api/v1/progress/courses/${targetCourseId}/resume`, res, [200]);
  } catch (e) { recordTest('Progress', 'Get Resume Learning Position', 'GET', `/api/v1/progress/courses/${targetCourseId}/resume`, e, [200]); }

  // -------------------------------------------------------------
  // 3. CERTIFICATES
  // -------------------------------------------------------------
  console.log('\n--- 3. Certificates ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/certificates/my`, { headers: studentHeaders });
    recordTest('Certificates', 'Get My Certificates', 'GET', '/api/v1/certificates/my', res, [200]);
  } catch (e) { recordTest('Certificates', 'Get My Certificates', 'GET', '/api/v1/certificates/my', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/certificates/courses/${targetCourseId}`, { headers: studentHeaders });
    recordTest('Certificates', 'Get Course Certificate', 'GET', `/api/v1/certificates/courses/${targetCourseId}`, res, [200, 404]);
  } catch (e) { recordTest('Certificates', 'Get Course Certificate', 'GET', `/api/v1/certificates/courses/${targetCourseId}`, e, [200, 404]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/certificates/verify/SAMPLE-CODE`);
    recordTest('Certificates', 'Verify Certificate by Code', 'GET', '/api/v1/certificates/verify/SAMPLE-CODE', res, [200, 404]);
  } catch (e) { recordTest('Certificates', 'Verify Certificate by Code', 'GET', '/api/v1/certificates/verify/SAMPLE-CODE', e, [200, 404]); }

  // -------------------------------------------------------------
  // 4. LIVE CLASSES & ATTENDANCE
  // -------------------------------------------------------------
  console.log('\n--- 4. Live Classes & Attendance ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/live-classes/course/${targetCourseId}/upcoming`, { headers: studentHeaders });
    recordTest('LiveClasses', 'Get Upcoming Live Classes', 'GET', `/api/v1/live-classes/course/${targetCourseId}/upcoming`, res, [200]);
  } catch (e) { recordTest('LiveClasses', 'Get Upcoming Live Classes', 'GET', `/api/v1/live-classes/course/${targetCourseId}/upcoming`, e, [200]); }

  let liveClassId = null;
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/live-classes`,
      {
        courseId: targetCourseId,
        sectionId: 13,
        title: 'Spring Boot Q&A Live Session',
        description: 'Interactive office hours on microservice design.',
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
        meetingUrl: 'https://meet.google.com/xyz-live-demo'
      },
      { headers: instructorHeaders }
    );
    liveClassId = res.data?.data?.id || res.data?.id;
    recordTest('LiveClasses', 'Create Live Class', 'POST', '/api/v1/live-classes', res, [200, 201]);
  } catch (e) { recordTest('LiveClasses', 'Create Live Class', 'POST', '/api/v1/live-classes', e, [200, 201]); }

  if (liveClassId) {
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/live-classes/${liveClassId}/attendance/join`, {}, { headers: studentHeaders });
      recordTest('LiveClasses', 'Join Live Class Attendance', 'POST', `/api/v1/live-classes/${liveClassId}/attendance/join`, res, [200, 201]);
    } catch (e) { recordTest('LiveClasses', 'Join Live Class Attendance', 'POST', `/api/v1/live-classes/${liveClassId}/attendance/join`, e, [200, 201]); }

    try {
      const res = await axios.patch(`${BASE_URL}/api/v1/live-classes/${liveClassId}/attendance/leave`, {}, { headers: studentHeaders });
      recordTest('LiveClasses', 'Leave Live Class Attendance', 'PATCH', `/api/v1/live-classes/${liveClassId}/attendance/leave`, res, [200]);
    } catch (e) { recordTest('LiveClasses', 'Leave Live Class Attendance', 'PATCH', `/api/v1/live-classes/${liveClassId}/attendance/leave`, e, [200]); }

    try {
      const res = await axios.get(`${BASE_URL}/api/v1/live-classes/${liveClassId}/attendance/me`, { headers: studentHeaders });
      recordTest('LiveClasses', 'Get My Live Class Attendance', 'GET', `/api/v1/live-classes/${liveClassId}/attendance/me`, res, [200]);
    } catch (e) { recordTest('LiveClasses', 'Get My Live Class Attendance', 'GET', `/api/v1/live-classes/${liveClassId}/attendance/me`, e, [200]); }
  }

  // -------------------------------------------------------------
  // 5. ASSIGNMENTS
  // -------------------------------------------------------------
  console.log('\n--- 5. Assignments ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/assignments/course/${targetCourseId}`, { headers: studentHeaders });
    recordTest('Assignments', 'Get Course Assignments', 'GET', `/api/v1/assignments/course/${targetCourseId}`, res, [200]);
  } catch (e) { recordTest('Assignments', 'Get Course Assignments', 'GET', `/api/v1/assignments/course/${targetCourseId}`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/assignments/course/${targetCourseId}/published`, { headers: studentHeaders });
    recordTest('Assignments', 'Get Published Course Assignments', 'GET', `/api/v1/assignments/course/${targetCourseId}/published`, res, [200]);
  } catch (e) { recordTest('Assignments', 'Get Published Course Assignments', 'GET', `/api/v1/assignments/course/${targetCourseId}/published`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/assignments/student/submissions`, { headers: studentHeaders });
    recordTest('Assignments', 'Get Student Submissions', 'GET', '/api/v1/assignments/student/submissions', res, [200]);
  } catch (e) { recordTest('Assignments', 'Get Student Submissions', 'GET', '/api/v1/assignments/student/submissions', e, [200]); }

  // -------------------------------------------------------------
  // 6. QUIZZES
  // -------------------------------------------------------------
  console.log('\n--- 6. Quizzes ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/quizzes/course/${targetCourseId}`, { headers: studentHeaders });
    recordTest('Quizzes', 'Get Course Quizzes', 'GET', `/api/v1/quizzes/course/${targetCourseId}`, res, [200]);
  } catch (e) { recordTest('Quizzes', 'Get Course Quizzes', 'GET', `/api/v1/quizzes/course/${targetCourseId}`, e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/quizzes/course/${targetCourseId}/published`, { headers: studentHeaders });
    recordTest('Quizzes', 'Get Published Course Quizzes', 'GET', `/api/v1/quizzes/course/${targetCourseId}/published`, res, [200]);
  } catch (e) { recordTest('Quizzes', 'Get Published Course Quizzes', 'GET', `/api/v1/quizzes/course/${targetCourseId}/published`, e, [200]); }

  // -------------------------------------------------------------
  // 7. BANNERS & MARKETING
  // -------------------------------------------------------------
  console.log('\n--- 7. Banners & Marketing ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/banners`);
    recordTest('Banners', 'Get Active Public Banners', 'GET', '/api/v1/banners', res, [200]);
  } catch (e) { recordTest('Banners', 'Get Active Public Banners', 'GET', '/api/v1/banners', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/banners/target/HOME`);
    recordTest('Banners', 'Get Target Banners', 'GET', '/api/v1/banners/target/HOME', res, [200]);
  } catch (e) { recordTest('Banners', 'Get Target Banners', 'GET', '/api/v1/banners/target/HOME', e, [200]); }

  try {
    const res = await axios.get(`${BASE_URL}/api/v1/admin/banners`, { headers: adminHeaders });
    recordTest('Banners', 'Admin Get All Banners', 'GET', '/api/v1/admin/banners', res, [200]);
  } catch (e) { recordTest('Banners', 'Admin Get All Banners', 'GET', '/api/v1/admin/banners', e, [200]); }

  // -------------------------------------------------------------
  // 8. ADMIN & METRICS
  // -------------------------------------------------------------
  console.log('\n--- 8. Admin Metrics ---');
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/stats`, { headers: adminHeaders });
    recordTest('Admin', 'Get Platform Course Stats', 'GET', '/api/v1/courses/stats', res, [200]);
  } catch (e) { recordTest('Admin', 'Get Platform Course Stats', 'GET', '/api/v1/courses/stats', e, [200]); }

  // -------------------------------------------------------------
  // 9. INSTRUCTOR COURSE AUTHORING (CREATE, UPDATE, DELETE)
  // -------------------------------------------------------------
  console.log('\n--- 9. Instructor Course Authoring Lifecycle ---');
  let newCourseId = null;
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/courses`,
      {
        title: 'Kubernetes for Cloud Native Engineers',
        subtitle: 'Production Kubernetes Cluster Management',
        description: 'Complete hands-on course covering Pods, Deployments, Ingress, and Helm charts.',
        category: 'DevOps',
        level: 'Intermediate',
        language: 'English',
        price: 4999.00,
        thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11',
        instructorId: instructorId,
        status: 'DRAFT',
        premium: false
      },
      { headers: instructorHeaders }
    );
    newCourseId = res.data?.data?.id || res.data?.id;
    recordTest('Authoring', 'Create Course via course-service', 'POST', '/api/v1/courses', res, [200, 201]);
  } catch (e) { recordTest('Authoring', 'Create Course via course-service', 'POST', '/api/v1/courses', e, [200, 201]); }

  let newSectionId = null;
  if (newCourseId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/courses/${newCourseId}/sections`,
        {
          title: 'Section 1: Architecture of Kubernetes',
          order: 1
        },
        { headers: instructorHeaders }
      );
      newSectionId = res.data?.data?.id || res.data?.id;
      recordTest('Authoring', 'Add Section to Course', 'POST', `/api/v1/courses/${newCourseId}/sections`, res, [200, 201]);
    } catch (e) { recordTest('Authoring', 'Add Section to Course', 'POST', `/api/v1/courses/${newCourseId}/sections`, e, [200, 201]); }
  }

  if (newSectionId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/sections/${newSectionId}/lectures`,
        {
          title: 'Lecture 1.1: Control Plane Components',
          description: 'Exploring kube-apiserver, etcd, kube-scheduler and controller-manager.',
          order: 1,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          duration: 360,
          isPreview: true
        },
        { headers: instructorHeaders }
      );
      recordTest('Authoring', 'Add Lecture to Section', 'POST', `/api/v1/sections/${newSectionId}/lectures`, res, [200, 201]);
    } catch (e) { recordTest('Authoring', 'Add Lecture to Section', 'POST', `/api/v1/sections/${newSectionId}/lectures`, e, [200, 201]); }
  }

  if (newCourseId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/v1/courses/${newCourseId}`,
        {
          title: 'Kubernetes for Cloud Native Engineers (2026 Edition)',
          subtitle: 'Updated Production Kubernetes Cluster Management',
          description: 'Updated complete hands-on course covering Pods, Deployments, Ingress, and Helm charts.',
          category: 'DevOps',
          level: 'Advanced',
          language: 'English',
          price: 5999.00,
          instructorId: instructorId
        },
        { headers: instructorHeaders }
      );
      recordTest('Authoring', 'Update Course Metadata', 'PUT', `/api/v1/courses/${newCourseId}`, res, [200]);
    } catch (e) { recordTest('Authoring', 'Update Course Metadata', 'PUT', `/api/v1/courses/${newCourseId}`, e, [200]); }

    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/courses/${newCourseId}`, { headers: instructorHeaders });
      recordTest('Authoring', 'Delete Course (Cleanup)', 'DELETE', `/api/v1/courses/${newCourseId}`, res, [200]);
    } catch (e) { recordTest('Authoring', 'Delete Course (Cleanup)', 'DELETE', `/api/v1/courses/${newCourseId}`, e, [200]); }
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log('\n======================================================================');
  console.log(` 📊 COURSE SERVICE TEST RESULTS: ${passedCount} of ${results.length} PASSED (${Math.round((passedCount/results.length)*100)}%)`);
  console.log('======================================================================');
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

