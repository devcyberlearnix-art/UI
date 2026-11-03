import axios from 'axios';

const GATEWAY = 'http://localhost:8079';

async function test() {
  const loginRes = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
    email: 'student_browser_1792166505208@cyberlearnix.dev',
    password: 'Pass@Browser5208!'
  });
  const token = loginRes.data?.authentication?.accessToken;
  const headers = { Authorization: `Bearer ${token}` };

  const progress = await axios.get(`${GATEWAY}/api/v1/progress/courses/6`, { headers });
  console.log('Course 6 progress:', progress.status, progress.data);

  const resume = await axios.get(`${GATEWAY}/api/v1/progress/courses/6/resume`, { headers });
  console.log('Course 6 resume learning:', resume.status, resume.data);

  const dashboard = await axios.get(`${GATEWAY}/api/v1/progress/courses`, { headers });
  console.log('Student dashboard via progress:', dashboard.status, dashboard.data?.data?.enrolledCourses?.length);
}

test();

