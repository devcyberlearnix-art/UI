import axios from 'axios';

const GATEWAY = 'http://localhost:8079';

async function testFullLearningLifecycle() {
  console.log('Testing Complete Student Learning Lifecycle (Enroll -> Resume -> Complete Lecture -> Check Progress -> Review)...');

  const loginRes = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
    email: 'student_browser_1792166505208@cyberlearnix.dev',
    password: 'Pass@Browser5208!'
  });
  const token = loginRes.data?.authentication?.accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Resume learning to find current lecture
  const resume = await axios.get(`${GATEWAY}/api/v1/progress/courses/6/resume`, { headers });
  console.log('1. Next Lecture to watch:', resume.data?.data?.nextLectureId, resume.data?.data?.nextLectureTitle);
  const lectureId = resume.data?.data?.nextLectureId || 81;

  // 2. Start lecture
  const start = await axios.post(`${GATEWAY}/api/v1/progress/lectures/${lectureId}/start`, {}, { headers });
  console.log('2. Lecture started:', start.status, start.data?.message);

  // 3. Complete lecture
  const complete = await axios.patch(`${GATEWAY}/api/v1/progress/lectures/${lectureId}/complete`, {}, { headers });
  console.log('3. Lecture completed:', complete.status, complete.data?.message);

  // 4. Check updated progress
  const progress = await axios.get(`${GATEWAY}/api/v1/progress/courses/6`, { headers });
  console.log('4. Course Progress:', {
    totalLectures: progress.data?.data?.totalLectures,
    completedLectures: progress.data?.data?.completedLectures,
    progressPercentage: progress.data?.data?.progressPercentage
  });

  // 5. Submit Course Review
  try {
    const reviewRes = await axios.post(`${GATEWAY}/api/v1/reviews`, {
      courseId: 6,
      rating: 5,
      reviewText: 'Outstanding course on clean code architecture and refactoring patterns!'
    }, { headers });
    console.log('5. Course review submitted:', reviewRes.status, reviewRes.data?.message || 'SUCCESS');
  } catch (err) {
    console.log('5. Course review response:', err.response?.status, err.response?.data?.message || err.message);
  }
}

testFullLearningLifecycle();
