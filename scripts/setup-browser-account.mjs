import axios from 'axios';

const BASE_URL = 'http://localhost:8080';
const MAILHOG_URL = 'http://localhost:8025/api/v2/messages';

const client = axios.create({ baseURL: BASE_URL, timeout: 15000 });

async function setup() {
  const email = 'browser_student_checkout@cyberlearnix.dev';
  const password = 'Password@123!';

  // Check if already exists by logging in
  try {
    const login = await client.post('/api/v1/auth/login', { email, password });
    if (login.status === 200) {
      console.log('Account already exists and active:', email);
      return;
    }
  } catch (e) {}

  const formData = new FormData();
  formData.append('data', JSON.stringify({
    firstName: 'Browser',
    lastName: 'Student',
    email,
    password,
    confirmPassword: password,
  }));

  const reg = await client.post('/api/v1/auth/register', formData);
  const otpSessionId = reg.data?.otpSessionId || reg.data?.sessionId;

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

  const verify = await client.post('/api/v1/auth/verify-email', {
    email,
    otp,
    otpSessionId,
  });
  console.log('Created and verified student account:', email, 'status:', verify.status);
}

setup().catch(console.error);
