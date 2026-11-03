import axios from 'axios';

const GATEWAY = 'http://localhost:8079';

async function testAuth() {
  console.log('Testing authentication against Gateway on 8079...');
  
  // 1. Admin login
  try {
    const res = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
      email: 'dev.cyberlearnix@gmail.com',
      password: 'MainAdmin@123'
    });
    console.log('Admin login SUCCESS:', {
      role: res.data?.role || res.data?.user?.role,
      tokenPresent: Boolean(res.data?.authentication?.accessToken || res.data?.token || res.data?.accessToken)
    });
  } catch (err) {
    console.error('Admin login FAILED:', err.response?.status, err.response?.data || err.message);
  }

  // 2. Instructor login
  try {
    const res = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
      email: 'rohan.malhotra@cyberlearnix.test',
      password: 'Password13!'
    });
    console.log('Instructor login SUCCESS:', {
      role: res.data?.role || res.data?.user?.role,
      tokenPresent: Boolean(res.data?.authentication?.accessToken || res.data?.token || res.data?.accessToken)
    });
  } catch (err) {
    console.error('Instructor login FAILED:', err.response?.status, err.response?.data || err.message);
  }

  // 3. Student login
  try {
    const res = await axios.post(`${GATEWAY}/api/v1/auth/login`, {
      email: 'student_browser_1792166505208@cyberlearnix.dev',
      password: 'Pass@Browser5208!'
    });
    console.log('Student login SUCCESS:', {
      role: res.data?.role || res.data?.user?.role,
      tokenPresent: Boolean(res.data?.authentication?.accessToken || res.data?.token || res.data?.accessToken)
    });
  } catch (err) {
    console.error('Student login FAILED:', err.response?.status, err.response?.data || err.message);
  }
}

testAuth();

