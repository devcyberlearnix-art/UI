import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';

const BASE_URL = 'http://localhost:8080';
const results = [];

function generateServiceAuthToken() {
  const secret = 'shared-service-secret-key-2024';
  const issuer = 'cyberlearnix-service';
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(16).toString('base64url');
  const data = `${timestamp}:${nonce}:${issuer}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64');
  return `${timestamp}:${nonce}:${issuer}:${signature}`;
}

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
  console.log(`${icon} [${String(status).padEnd(3)}] ${method.padEnd(6)} ${path.padEnd(58)} -> ${name}`);
  if (!passed) {
    console.log('   Error Details:', JSON.stringify(data).slice(0, 200));
  }
}

async function run() {
  console.log('======================================================================');
  console.log(' 🚀 EXECUTING COMPLETE INSTRUCTOR & INSTRUCTOR SERVICES API TEST SUITE');
  console.log('======================================================================\n');

  // Authenticate Instructor
  const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/social-login`, {
    provider: 'GOOGLE',
    providerId: 'google-instructor-master-id',
    email: 'instructor.lead@cyberlearnix.test',
    name: 'Lead Instructor'
  });
  const token = loginRes.data.authentication.accessToken;
  const instructorId = loginRes.data.user.id;
  const authHeaders = {
    'Authorization': `Bearer ${token}`
  };

  console.log(`Instructor Authenticated: ${instructorId} (${loginRes.data.user.email})\n`);

  // 1. Dashboard
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/instructors/${instructorId}/dashboard`, { headers: authHeaders });
    recordTest('Dashboard', 'Get Instructor Dashboard', 'GET', `/api/v1/instructors/${instructorId}/dashboard`, res, [200]);
  } catch (err) {
    recordTest('Dashboard', 'Get Instructor Dashboard', 'GET', `/api/v1/instructors/${instructorId}/dashboard`, err, [200]);
  }

  // 2. Earnings
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/instructors/${instructorId}/earnings`, { headers: authHeaders });
    recordTest('Earnings', 'Get Instructor Earnings', 'GET', `/api/v1/instructors/${instructorId}/earnings`, res, [200]);
  } catch (err) {
    recordTest('Earnings', 'Get Instructor Earnings', 'GET', `/api/v1/instructors/${instructorId}/earnings`, err, [200]);
  }

  // 3. Create Course
  let courseId = null;
  try {
    const res = await axios.post(
      `${BASE_URL}/api/v1/instructors/${instructorId}/courses`,
      {
        title: 'Microservices with Spring Cloud & Event-Driven Architecture',
        description: 'Complete hands-on engineering course covering CQRS, Kafka, Docker, and Kubernetes.',
        price: 99.99,
        category: 'Software Development',
        subtitle: 'Enterprise Backend Mastery',
        tags: ['java', 'spring-boot', 'kafka', 'docker'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
        previewVideoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        level: 'ADVANCED',
        language: 'English'
      },
      { headers: authHeaders }
    );
    courseId = res.data?.data?.course?.id || res.data?.data?.id || 1;
    recordTest('Courses', 'Create Course', 'POST', `/api/v1/instructors/${instructorId}/courses`, res, [200, 201]);
  } catch (err) {
    recordTest('Courses', 'Create Course', 'POST', `/api/v1/instructors/${instructorId}/courses`, err, [200, 201]);
  }

  // 4. Get Courses by Instructor
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/instructors/${instructorId}/courses`, { headers: authHeaders });
    recordTest('Courses', 'Get Courses by Instructor', 'GET', `/api/v1/instructors/${instructorId}/courses`, res, [200]);
  } catch (err) {
    recordTest('Courses', 'Get Courses by Instructor', 'GET', `/api/v1/instructors/${instructorId}/courses`, err, [200]);
  }

  // 5. Get Course by ID
  if (courseId) {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}`, { headers: authHeaders });
      recordTest('Courses', 'Get Course by ID', 'GET', `/api/v1/instructors/${instructorId}/courses/${courseId}`, res, [200]);
    } catch (err) {
      recordTest('Courses', 'Get Course by ID', 'GET', `/api/v1/instructors/${instructorId}/courses/${courseId}`, err, [200]);
    }
  }

  // 6. Update Course
  if (courseId) {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}`,
        {
          title: 'Microservices with Spring Cloud (Updated Edition)',
          description: 'Updated comprehensive course covering CQRS and Kafka.',
          price: 119.99,
          category: 'Software Development'
        },
        { headers: authHeaders }
      );
      recordTest('Courses', 'Update Course', 'PUT', `/api/v1/instructors/${instructorId}/courses/${courseId}`, res, [200]);
    } catch (err) {
      recordTest('Courses', 'Update Course', 'PUT', `/api/v1/instructors/${instructorId}/courses/${courseId}`, err, [200]);
    }
  }

  // 7. Course Students
  if (courseId) {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/students`, { headers: authHeaders });
      recordTest('Students', 'Get Course Students', 'GET', `/api/v1/instructors/${instructorId}/courses/${courseId}/students`, res, [200]);
    } catch (err) {
      recordTest('Students', 'Get Course Students', 'GET', `/api/v1/instructors/${instructorId}/courses/${courseId}/students`, err, [200]);
    }
  }

  // 8. Assign Grade & Get Grades
  if (courseId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/grades`,
        {
          studentId: '67026582-e69b-458e-82a4-25c46927dd8a',
          grade: 98.0
        },
        { headers: authHeaders }
      );
      recordTest('Grades', 'Assign Student Grade', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/grades`, res, [200, 201]);
    } catch (err) {
      recordTest('Grades', 'Assign Student Grade', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/grades`, err, [200, 201]);
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/grades`, { headers: authHeaders });
      recordTest('Grades', 'Get Course Grades', 'GET', `/api/v1/instructors/${instructorId}/courses/${courseId}/grades`, res, [200]);
    } catch (err) {
      recordTest('Grades', 'Get Course Grades', 'GET', `/api/v1/instructors/${instructorId}/courses/${courseId}/grades`, err, [200]);
    }
  }

  // 9. Course Analytics
  if (courseId) {
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/analytics`, { headers: authHeaders });
      recordTest('Analytics', 'Get Course Analytics', 'GET', `/api/v1/instructors/${instructorId}/courses/${courseId}/analytics`, res, [200]);
    } catch (err) {
      recordTest('Analytics', 'Get Course Analytics', 'GET', `/api/v1/instructors/${instructorId}/courses/${courseId}/analytics`, err, [200]);
    }
  }

  // 10. Announcements
  if (courseId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/announcements`,
        {
          title: 'Welcome to Microservices Masterclass!',
          message: 'The module resources and assignment files have been uploaded.'
        },
        { headers: authHeaders }
      );
      recordTest('Announcements', 'Create Course Announcement', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/announcements`, res, [200, 201]);
    } catch (err) {
      recordTest('Announcements', 'Create Course Announcement', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/announcements`, err, [200, 201]);
    }
  }

  // 11. Course Messages
  if (courseId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/messages`,
        {
          subject: 'Lab Session Notice',
          message: 'Join us for live debugging this Friday.'
        },
        { headers: authHeaders }
      );
      recordTest('Messages', 'Send Course Message', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/messages`, res, [200, 201]);
    } catch (err) {
      recordTest('Messages', 'Send Course Message', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/messages`, err, [200, 201]);
    }
  }

  // 12. Modules (Add, Update, Delete)
  let moduleId = null;
  if (courseId) {
    try {
      const res = await axios.post(
        `${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/modules`,
        {
          title: 'Module 1: Hexagonal & Clean Architecture',
          description: 'Isolating domain logic from infrastructure adapters.'
        },
        { headers: authHeaders }
      );
      moduleId = res.data?.moduleId;
      recordTest('Modules', 'Add Course Module', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/modules`, res, [200, 201]);
    } catch (err) {
      recordTest('Modules', 'Add Course Module', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/modules`, err, [200, 201]);
    }

    if (moduleId) {
      try {
        const res = await axios.put(
          `${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/modules/${moduleId}`,
          {
            title: 'Module 1: Hexagonal & Clean Architecture (Updated)',
            description: 'Updated curriculum with practical coding exercises.'
          },
          { headers: authHeaders }
        );
        recordTest('Modules', 'Update Course Module', 'PUT', `/api/v1/instructors/${instructorId}/courses/${courseId}/modules/${moduleId}`, res, [200]);
      } catch (err) {
        recordTest('Modules', 'Update Course Module', 'PUT', `/api/v1/instructors/${instructorId}/courses/${courseId}/modules/${moduleId}`, err, [200]);
      }

      try {
        const res = await axios.delete(
          `${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/modules/${moduleId}`,
          { headers: authHeaders }
        );
        recordTest('Modules', 'Delete Course Module', 'DELETE', `/api/v1/instructors/${instructorId}/courses/${courseId}/modules/${moduleId}`, res, [200]);
      } catch (err) {
        recordTest('Modules', 'Delete Course Module', 'DELETE', `/api/v1/instructors/${instructorId}/courses/${courseId}/modules/${moduleId}`, err, [200]);
      }
    }
  }

  // 13. Upload Module Resource to Google Drive
  let createdContentId = null;
  if (courseId) {
    try {
      const form = new FormData();
      form.append('file', Buffer.from('%PDF-1.4 sample document stream'), {
        filename: 'architecture_guide.pdf',
        contentType: 'application/pdf'
      });
      form.append('type', 'PDF');

      const res = await axios.post(
        `${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}/modules/upload`,
        form,
        {
          headers: {
            ...authHeaders,
            ...form.getHeaders()
          }
        }
      );
      createdContentId = res.data?.contentId;
      recordTest('Resources', 'Upload Module Resource (Google Drive)', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/modules/upload`, res, [200, 201]);
    } catch (err) {
      recordTest('Resources', 'Upload Module Resource (Google Drive)', 'POST', `/api/v1/instructors/${instructorId}/courses/${courseId}/modules/upload`, err, [200, 201]);
    }
  }

  // 14. Content Publishing
  if (createdContentId) {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/v1/instructors/${instructorId}/content/${createdContentId}/publish`,
        { publish: true },
        { headers: authHeaders }
      );
      recordTest('Content', 'Publish Content', 'PATCH', `/api/v1/instructors/${instructorId}/content/${createdContentId}/publish`, res, [200]);
    } catch (err) {
      recordTest('Content', 'Publish Content', 'PATCH', `/api/v1/instructors/${instructorId}/content/${createdContentId}/publish`, err, [200]);
    }
  }

  // 15. Public Course Detail
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/courses/4`);
    recordTest('Public Courses', 'Get Public Course Details', 'GET', `/api/v1/courses/4`, res, [200]);
  } catch (err) {
    recordTest('Public Courses', 'Get Public Course Details', 'GET', `/api/v1/courses/4`, err, [200]);
  }

  // 16. Instructor Profile (User Service)
  try {
    const serviceToken = generateServiceAuthToken();
    const res = await axios.get(
      `${BASE_URL}/api/v1/instructors/${instructorId}/profile`,
      {
        headers: {
          ...authHeaders,
          'X-Service-Auth': serviceToken
        }
      }
    );
    recordTest('Profile', 'Get Instructor Profile', 'GET', `/api/v1/instructors/${instructorId}/profile`, res, [200]);
  } catch (err) {
    recordTest('Profile', 'Get Instructor Profile', 'GET', `/api/v1/instructors/${instructorId}/profile`, err, [200]);
  }

  // 17. Cleanup: Delete Course
  if (courseId) {
    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/instructors/${instructorId}/courses/${courseId}`, { headers: authHeaders });
      recordTest('Courses', 'Delete Course', 'DELETE', `/api/v1/instructors/${instructorId}/courses/${courseId}`, res, [200]);
    } catch (err) {
      recordTest('Courses', 'Delete Course', 'DELETE', `/api/v1/instructors/${instructorId}/courses/${courseId}`, err, [200]);
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  console.log('\n======================================================================');
  console.log(` 📊 INSTRUCTOR API TEST RESULTS: ${passedCount} of ${results.length} PASSED (${Math.round((passedCount/results.length)*100)}%)`);
  console.log('======================================================================');
}

run();
