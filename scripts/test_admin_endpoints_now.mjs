import axios from 'axios';

const GATEWAY_URL = 'http://localhost:8079';
const MAILHOG_URL = 'http://localhost:8025/api/v2/messages';

async function main() {
  const email = 'dev.cyberlearnix@gmail.com';
  console.log('Logging in as admin:', email);

  // Request OTP
  const reqRes = await axios.post(`${GATEWAY_URL}/api/v1/auth/login/otp/request`, { email });
  const otpSessionId = reqRes.data?.otpSessionId;
  console.log('OTP Session:', otpSessionId);

  await new Promise(r => setTimeout(r, 1000));

  // Get OTP from MailHog
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
  console.log('Retrieved OTP:', otp);

  // Verify OTP
  const verifyRes = await axios.post(`${GATEWAY_URL}/api/v1/auth/login/otp/verify`, {
    email,
    otpSessionId,
    otp,
  });

  const payload = verifyRes.data?.data || verifyRes.data;
  const token = payload?.authentication?.accessToken || payload?.accessToken || verifyRes.data?.accessToken;
  console.log('Obtained Admin Token:', Boolean(token));

  const headers = { Authorization: `Bearer ${token}` };

  // Test endpoints
  const endpoints = [
    '/api/v1/admin/users',
    '/api/v1/admin/users?page=0&size=10',
    '/api/v1/admin/courses',
    '/api/v1/admin/courses/2',
    '/api/v1/admin/instructors',
    '/api/v1/admin/orders',
    '/api/v1/admin/reports/users',
    '/api/v1/admin/reports/courses',
    '/api/v1/admin/reports/orders',
    '/api/v1/admin/reports/revenue',
    '/api/v1/admin/banners',
    '/api/v1/admin/coupons',
    '/api/v1/coupons',
    '/api/v1/admin/reviews',
  ];

  for (const ep of endpoints) {
    try {
      const res = await axios.get(`${GATEWAY_URL}${ep}`, { headers, validateStatus: () => true });
      const bodyStr = JSON.stringify(res.data);
      console.log(`[${res.status}] GET ${ep}: ${bodyStr.slice(0, 160)}...`);
    } catch (e) {
      console.log(`[ERR] GET ${ep}: ${e.message}`);
    }
  }
}

main().catch(console.error);
