// scripts/test-banner-valid.mjs
import axios from 'axios';

async function main() {
  const reqRes = await axios.post('http://localhost:8080/api/v1/auth/login/otp/request', { email: 'dev.cyberlearnix@gmail.com' });
  const otpSessionId = reqRes.data?.otpSessionId;
  await new Promise(r => setTimeout(r, 1500));
  const mail = await axios.get('http://localhost:8025/api/v2/messages');
  let otp = null;
  for (const m of mail.data.items || []) {
    const r = m?.To?.[0]?.Mailbox + '@' + m?.To?.[0]?.Domain;
    if (r.toLowerCase() === 'dev.cyberlearnix@gmail.com') {
      const match = m?.Content?.Body?.match(/otp-box["']?>(\d{6})</i) || m?.Content?.Body?.match(/>(\d{6})</) || m?.Content?.Body?.match(/\b\d{6}\b/);
      if (match) { otp = match[1] || match[0]; break; }
    }
  }
  const verify = await axios.post('http://localhost:8080/api/v1/auth/login/otp/verify', {
    email: 'dev.cyberlearnix@gmail.com',
    otpSessionId,
    otp,
  });
  const adminToken = verify.data?.authentication?.accessToken;

  const res = await axios.post('http://localhost:8080/api/v1/admin/banners', {
    title: 'Valid Test Banner',
    description: 'Comprehensive test banner description',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423',
    ctaText: 'Explore Now',
    ctaUrl: 'https://cyberlearnix.dev/courses',
    displayOrder: 1,
    status: 'ACTIVE',
  }, {
    headers: { Authorization: `Bearer ${adminToken}` },
    validateStatus: () => true,
  });
  console.log('Create Banner Status:', res.status, 'Body:', res.data);

  if (res.status === 200 || res.status === 201) {
    const bId = res.data?.id || res.data?.data?.id;
    console.log('Banner Created, ID:', bId);
    // Cleanup
    const delRes = await axios.delete(`http://localhost:8080/api/v1/admin/banners/${bId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      validateStatus: () => true,
    });
    console.log('Cleanup Delete Status:', delRes.status);
  }
}

main().catch(console.error);
