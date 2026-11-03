import axios from 'axios';

async function test() {
  const email = 'dev.cyberlearnix@gmail.com';
  const reqRes = await axios.post('http://localhost:8079/api/v1/admin/login/otp/request', { email });
  const otpSessionId = reqRes.data?.data?.otpSessionId || reqRes.data?.otpSessionId;
  console.log('Session ID:', otpSessionId);
  await new Promise(r => setTimeout(r, 1200));
  const mailRes = await axios.get('http://localhost:8025/api/v2/messages');
  let otp = null;
  for (const m of mailRes.data.items) {
    const to = m.To[0].Mailbox + '@' + m.To[0].Domain;
    if (to.toLowerCase() === email.toLowerCase()) {
      const match = m.Content.Body.match(/otp-box["']?>(\d{6})</i) || m.Content.Body.match(/>(\d{6})</) || m.Content.Body.match(/\b\d{6}\b/);
      if (match) { otp = match[1] || match[0]; break; }
    }
  }
  console.log('OTP:', otp);
  const verifyRes = await axios.post('http://localhost:8079/api/v1/admin/login/otp/verify', { email, otpSessionId, otp });
  const payload = verifyRes.data?.data || verifyRes.data;
  console.log('Verify Response:', payload);
  const token = payload?.accessToken || payload?.token;
  console.log('Admin token:', !!token);
  try {
    const res = await axios.get('http://localhost:8079/api/v1/coupons', { headers: { Authorization: 'Bearer ' + token } });
    console.log('Coupons count:', res.data?.data?.length, res.data);
  } catch (err) {
    console.log('Coupon error:', err.response?.status, err.response?.data);
  }
}
test();
