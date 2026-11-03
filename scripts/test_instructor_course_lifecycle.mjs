import axios from 'axios';

const GATEWAY = 'http://localhost:8079';

async function testInstructorLifecycle() {
  console.log('Testing Complete Instructor Course Lifecycle (Create -> Section -> Lecture -> Submit -> Admin Approve -> Public Verify)...');

  // 1. Authenticate Instructor
  const instLogin = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
    email: 'rohan.malhotra@cyberlearnix.test',
    password: 'Password13!'
  });
  const instToken = instLogin.data?.authentication?.accessToken;
  const instHeaders = { Authorization: `Bearer ${instToken}` };
  const instructorId = instLogin.data?.user?.id;
  console.log('1. Instructor authenticated:', instructorId);

  // 2. Authenticate Admin
  const adminLogin = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
    email: 'dev.cyberlearnix@gmail.com',
    password: 'MainAdmin@123'
  });
  const adminToken = adminLogin.data?.authentication?.accessToken;
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  console.log('2. Admin authenticated');

  // 3. Create Course as Instructor
  const coursePayload = {
    instructorId: instructorId,
    title: `Advanced Microservices Architecture & High-Scale Resilience ${Date.now()}`,
    subtitle: 'Production Patterns with Spring Cloud, Kafka, and Kubernetes',
    description: 'Master microservice resilience patterns, circuit breakers, event sourcing, and distributed tracing.',
    category: 'Software Engineering',
    level: 'ADVANCED',
    language: 'English',
    price: 3499.00
  };

  let courseId = null;
  try {
    const createRes = await axios.post(`${GATEWAY}/api/v1/courses`, coursePayload, { headers: instHeaders });
    courseId = createRes.data?.id || createRes.data?.data?.id || createRes.data?.courseId;
    console.log('3. Course created:', createRes.status, 'Course ID:', courseId);
  } catch (err) {
    console.log('3. Course create error:', err.response?.status, err.response?.data);
    return;
  }

  // 4. Add Section
  let sectionId = null;
  try {
    const secRes = await axios.post(`${GATEWAY}/api/v1/courses/${courseId}/sections`, {
      title: 'Module 1: Distributed Transactions & Sagas',
      orderIndex: 1
    }, { headers: instHeaders });
    sectionId = secRes.data?.data?.sectionId || secRes.data?.sectionId || secRes.data?.id;
    console.log('4. Section added:', secRes.status, 'Section ID:', sectionId);
  } catch (err) {
    console.log('4. Section add error:', err.response?.status, err.response?.data);
  }

  // 5. Add Lecture
  let lectureId = null;
  if (sectionId) {
    try {
      const lecRes = await axios.post(`${GATEWAY}/api/v1/sections/${sectionId}/lectures`, {
        title: 'Choreography vs Orchestration Sagas in Action',
        description: 'Deep dive into distributed transactions with Kafka and Camunda',
        videoUrl: 'https://cdn.cyberlearnix.dev/lectures/sagas-deep-dive.mp4',
        duration: 1800,
        orderIndex: 1,
        previewEnabled: true,
        type: 'VIDEO'
      }, { headers: instHeaders });
      lectureId = lecRes.data?.data?.lectureId || lecRes.data?.data?.id || lecRes.data?.id;
      console.log('5. Lecture added:', lecRes.status, 'Lecture ID:', lectureId);
    } catch (err) {
      console.log('5. Lecture add error:', err.response?.status, err.response?.data);
    }
  }

  // 6. Submit Course for Approval
  try {
    const submitRes = await axios.post(`${GATEWAY}/api/v1/courses/${courseId}/submit-for-approval`, {}, { headers: instHeaders });
    console.log('6. Course submitted for approval:', submitRes.status, submitRes.data?.message || 'SUBMITTED');
  } catch (err) {
    console.log('6. Submit error:', err.response?.status, err.response?.data);
  }

  // 7. Admin Approves Course via PUT
  try {
    const approveRes = await axios.put(`${GATEWAY}/api/v1/admin/courses/${courseId}/approve`, {}, { headers: adminHeaders });
    console.log('7. Admin approved course:', approveRes.status, approveRes.data?.message || 'APPROVED');
  } catch (err) {
    console.log('7. Admin approve error:', err.response?.status, err.response?.data);
  }

  // 8. Verify Public Visibility of newly approved course
  try {
    const publicRes = await axios.get(`${GATEWAY}/api/v1/courses/${courseId}`);
    console.log('8. Public course verified:', publicRes.status, {
      title: publicRes.data?.title,
      isPublished: publicRes.data?.isPublished,
      status: publicRes.data?.status
    });
  } catch (err) {
    console.log('8. Public verify error:', err.response?.status, err.response?.data);
  }
}

testInstructorLifecycle();
