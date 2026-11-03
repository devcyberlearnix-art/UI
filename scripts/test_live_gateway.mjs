import axios from 'axios';

const GATEWAY = 'http://localhost:8079';
const VITE_PROXY = 'http://localhost:5173/api';

async function testEndpoint(name, url) {
  try {
    const res = await axios.get(url, { timeout: 4000, validateStatus: () => true });
    console.log(`[${res.status}] ${name} -> ${url}`);
    if (res.status === 200) {
      const isArr = Array.isArray(res.data);
      const isObj = typeof res.data === 'object' && res.data !== null;
      let count = '';
      if (isArr) count = `(${res.data.length} items)`;
      else if (res.data?.courses) count = `(${res.data.courses.length} courses)`;
      else if (res.data?.content) count = `(${res.data.content.length} content items)`;
      console.log(`       Data keys/type: ${isArr ? 'Array' : Object.keys(res.data).slice(0, 6).join(', ')} ${count}`);
    } else {
      console.log(`       Response snippet:`, JSON.stringify(res.data).slice(0, 100));
    }
  } catch (err) {
    console.log(`[ERR] ${name} -> ${err.message}`);
  }
}

async function run() {
  console.log('--- TESTING GATEWAY PUBLIC ENDPOINTS (http://localhost:8079) ---');
  await testEndpoint('Courses List', `${GATEWAY}/api/v1/courses`);
  await testEndpoint('Featured Courses', `${GATEWAY}/api/v1/courses/featured`);
  await testEndpoint('Trending Courses', `${GATEWAY}/api/v1/courses/trending`);
  await testEndpoint('Active Banners', `${GATEWAY}/api/v1/banners/active`);
  await testEndpoint('User Stats', `${GATEWAY}/api/v1/users/stats`);
  await testEndpoint('Public Coupon Validate', `${GATEWAY}/api/v1/coupons/validate?code=TEST`);

  console.log('\n--- TESTING VIA VITE PROXY (http://localhost:5173/api) ---');
  await testEndpoint('Vite Proxy Courses', `${VITE_PROXY}/v1/courses`);
  await testEndpoint('Vite Proxy Banners', `${VITE_PROXY}/v1/banners/active`);
}

run();

