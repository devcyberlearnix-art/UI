import axios from 'axios';
async function test() {
  const email = 'dev.cyberlearnix@gmail.com';
  const reqRes = await axios.post('http://localhost:8079/api/v1/auth/login/otp/request', { email });
  const otpSessionId = reqRes.data?.otpSessionId;
  await new Promise(r => setTimeout(r, 1000));
  const mailRes = await axios.get('http://localhost:8025/api/v2/messages');
  let otp = null;
  for (const m of mailRes.data.items) {
    if (m.To[0].Mailbox + '@' + m.To[0].Domain === email) {
      const match = m.Content.Body.match(/otp-box["']?>(\d{6})</i) || m.Content.Body.match(/>(\d{6})</) || m.Content.Body.match(/\b\d{6}\b/);
      if (match) { otp = match[1] || match[0]; break; }
    }
  }
  const verifyRes = await axios.post('http://localhost:8079/api/v1/auth/login/otp/verify', { email, otpSessionId, otp });
  const payload = verifyRes.data?.data || verifyRes.data;
  const token = payload?.authentication?.accessToken || payload?.accessToken;
  const res = await axios.get('http://localhost:8079/api/v1/admin/courses', { headers: { Authorization: 'Bearer ' + token } });
  console.log('Courses count:', res.data.count, 'data length:', res.data.data?.length);
  console.log('First course:', res.data.data?.[0]?.title);
}
test();

