import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:8080';
const MAILHOG_URL = 'http://localhost:8025/api/v2/messages';

async function main() {
  const ts = Date.now();
  const email = `student_browser_${ts}@cyberlearnix.dev`;
  const password = `Pass@Browser${ts % 10000}!`;

  const regFormData = new FormData();
  regFormData.append('data', JSON.stringify({
    firstName: 'Browser',
    lastName: 'Tester',
    email: email,
    password: password,
    confirmPassword: password,
  }));

  const regRes = await axios.post(`${BASE_URL}/api/v1/auth/register`, regFormData, {
    validateStatus: () => true
  });
  console.log('Register response:', regRes.status, regRes.data);

  const otpSessionId = regRes.data?.otpSessionId || regRes.data?.sessionId || regRes.data?.data?.otpSessionId || regRes.data?.data?.sessionId;
  console.log('Found otpSessionId:', otpSessionId);

  await new Promise(r => setTimeout(r, 1500));

  const mailRes = await axios.get(MAILHOG_URL);
  let otp = null;
  for (const msg of mailRes.data?.items || []) {
    const recipient = msg?.To?.[0]?.Mailbox + '@' + msg?.To?.[0]?.Domain;
    if (recipient.toLowerCase() === email.toLowerCase()) {
      const match = (msg?.Content?.Body || '').match(/otp-box["']?>(\d{6})</i) || (msg?.Content?.Body || '').match(/>(\d{6})</);
      if (match) {
        otp = match[1];
        break;
      }
    }
  }
  console.log('Found OTP:', Boolean(otp));

  const verifyRes = await axios.post(`${BASE_URL}/api/v1/auth/verify-email`, {
    email: email,
    otp: otp,
    otpSessionId: otpSessionId,
  }, { validateStatus: () => true });

  console.log('Verify response:', verifyRes.status, verifyRes.data);

  const loginRes = await axios.post(`${BASE_URL}/api/v1/auth/login`, {
    email,
    password
  }, { validateStatus: () => true });
  console.log('Login test status:', loginRes.status, 'User ID:', loginRes.data?.user?.id);

  // Write credentials to a temp json file so we can read them easily
  fs.writeFileSync('scripts/browser-student-creds.json', JSON.stringify({
    email,
    password,
    userId: loginRes.data?.user?.id,
    token: loginRes.data?.authentication?.accessToken
  }, null, 2));
}

main().catch(console.error);
