// scripts/probe-endpoints.mjs
const urls = [
  ['Review Course 2', 'GET', 'http://localhost:8080/api/v1/reviews/course/2'],
  ['Wishlist Unauth', 'GET', 'http://localhost:8080/api/v1/wishlist'],
  ['Preferences Unauth', 'GET', 'http://localhost:8080/api/v1/preferences'],
  ['Admin Stats Unauth', 'GET', 'http://localhost:8080/api/v1/admin/stats'],
  ['Quizzes Course 2', 'GET', 'http://localhost:8080/api/v1/quizzes/course/2'],
  ['Live Classes Course 2', 'GET', 'http://localhost:8080/api/v1/courses/2/live-classes'],
  ['Cert Verify', 'GET', 'http://localhost:8080/api/v1/certificates/verify/NONEXISTENT'],
  ['Public Banners', 'GET', 'http://localhost:8080/api/v1/banners'],
  ['User Stats', 'GET', 'http://localhost:8080/api/v1/users/stats'],
  ['Coupon WELCOME50', 'GET', 'http://localhost:8080/api/v1/coupons/WELCOME50'],
];

async function main() {
  for (const [name, method, url] of urls) {
    try {
      const res = await fetch(url, { method });
      const text = await res.text();
      let parsed = '';
      try {
        const json = JSON.parse(text);
        parsed = json.message || json.code || JSON.stringify(json).slice(0, 100);
      } catch {
        parsed = text.slice(0, 100);
      }
      console.log(`${name} [${method} ${url}] -> Status: ${res.status} | ${parsed}`);
    } catch (e) {
      console.log(`${name} [${method} ${url}] -> ERROR: ${e.message}`);
    }
  }
}

main();
