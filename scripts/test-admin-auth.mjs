import axios from 'axios';

const BASE_URL = 'http://localhost:8080';
const MAILHOG_URL = 'http://localhost:8025/api/v2/messages';

async function testAdmin() {
  const email = 'dev.cyberlearnix@gmail.com';
  console.log('Testing Admin OTP login for:', email);

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
    console.log('OTP verify data:', verifyRes.data);

    const token = verifyRes.data?.authentication?.accessToken || verifyRes.data?.accessToken;
    if (token) {
      console.log('Admin token obtained! Testing admin endpoints...');
      const adminHeaders = { Authorization: `Bearer ${token}` };

      const instRes = await axios.get(`${BASE_URL}/api/v1/admin/instructors`, {
        headers: adminHeaders,
        validateStatus: () => true,
      });
      console.log('Admin instructors status:', instRes.status);

      const usersRes = await axios.get(`${BASE_URL}/api/v1/admin/users`, {
        headers: adminHeaders,
        validateStatus: () => true,
      });
      console.log('Admin users status:', usersRes.status);

      const bannersRes = await axios.get(`${BASE_URL}/api/v1/admin/banners`, {
        headers: adminHeaders,
        validateStatus: () => true,
      });
      console.log('Admin banners status:', bannersRes.status);
    }
  }
}

testAdmin().catch(console.error);
