import axios from 'axios';

const BASE_URL = 'http://localhost:8080';
const MAILHOG_URL = 'http://localhost:8025/api/v2/messages';

async function testInstructor() {
  const email = 'priyanka.zacharia@cyberlearnix.test';
  console.log('Testing Instructor OTP login for:', email);

  const reqRes = await axios.post(`${BASE_URL}/api/v1/auth/login/otp/request`, { email });
  console.log('OTP request status:', reqRes.status, reqRes.data);
  const otpSessionId = reqRes.data?.otpSessionId;

  await new Promise(r => setTimeout(r, 1500));

  const mailRes = await axios.get(MAILHOG_URL);
  const messages = mailRes.data?.items || [];
  let otp = null;
  for (const msg of messages) {
    const recipient = msg?.To?.[0]?.Mailbox + '@' + msg?.To?.[0]?.Domain;
    if (recipient.toLowerCase() === email.toLowerCase()) {
      const body = msg?.Content?.Body || '';
      const match = body.match(/otp-box["']?>(\d{6})</i) || body.match(/>(\d{6})</) || body.match(/\b\d{6}\b/);
      if (match) {
        otp = match[1] || match[0];
        break;
      }
    }
  }

  console.log('OTP found:', Boolean(otp));

  if (otp) {
    const verifyRes = await axios.post(`${BASE_URL}/api/v1/auth/login/otp/verify`, {
      email,
      otpSessionId,
      otp,
    }, { validateStatus: () => true });

    console.log('OTP verify status:', verifyRes.status);
    console.log('OTP verify data:', JSON.stringify(verifyRes.data, null, 2));

    const token = verifyRes.data?.authentication?.accessToken || verifyRes.data?.accessToken;
    const instructorId = verifyRes.data?.user?.id || verifyRes.data?.user?.userId;
    if (token) {
      console.log(`Instructor token obtained! Instructor ID: ${instructorId}`);
      const headers = { Authorization: `Bearer ${token}` };

      // Test instructor courses
      const coursesRes = await axios.get(`${BASE_URL}/api/v1/instructors/${instructorId}/courses`, {
        headers,
        validateStatus: () => true,
      });
      console.log('Instructor courses status:', coursesRes.status);

      // Test instructor dashboard
      const dashRes = await axios.get(`${BASE_URL}/api/v1/instructors/${instructorId}/dashboard`, {
        headers,
        validateStatus: () => true,
      });
      console.log('Instructor dashboard status:', dashRes.status);

      // Test instructor can create an assignment
      const createAssignRes = await axios.post(`${BASE_URL}/api/v1/assignments`, {
        courseId: 1,
        title: 'Instructor Test Assignment',
        description: 'Verifying instructor role authorization boundary',
        maxScore: 100,
      }, {
        headers,
        validateStatus: () => true,
      });
      console.log('Instructor create assignment status:', createAssignRes.status, createAssignRes.data?.message || createAssignRes.data);
    }
  }
}

testInstructor().catch(console.error);
