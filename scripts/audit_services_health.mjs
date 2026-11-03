import http from 'http';

const services = [
  { name: 'API Gateway', port: 8079, path: '/actuator/health' },
  { name: 'Cart Service', port: 8081, path: '/actuator/health' },
  { name: 'Coupon Service', port: 8082, path: '/actuator/health' },
  { name: 'Course Service', port: 8083, path: '/actuator/health' },
  { name: 'Order Service', port: 8084, path: '/actuator/health' },
  { name: 'Payment Service', port: 8085, path: '/api/v1/payments' },
  { name: 'Payment Service Actuator', port: 8085, path: '/actuator/health' },
  { name: 'Admin Service', port: 8087, path: '/actuator/health' },
  { name: 'Instructor Service', port: 8088, path: '/actuator/health' },
  { name: 'Review Service', port: 8089, path: '/actuator/health' },
  { name: 'Wishlist Service', port: 8090, path: '/actuator/health' },
  { name: 'User Service', port: 8091, path: '/actuator/health' },
  { name: 'Notification Service', port: 8093, path: '/actuator/health' }
];

async function check() {
  console.log('=== VERIFYING ALL 12 MICROSERVICES ===');
  for (const s of services) {
    await new Promise(resolve => {
      const req = http.get({ host: 'localhost', port: s.port, path: s.path, timeout: 3000 }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log(`${s.name.padEnd(26)} (:${s.port}${s.path}) -> HTTP ${res.statusCode} | ${body.slice(0, 65).replace(/\n/g, '')}`);
          resolve();
        });
      });
      req.on('error', err => {
        console.log(`${s.name.padEnd(26)} (:${s.port}${s.path}) -> ERROR: ${err.message}`);
        resolve();
      });
    });
  }
}
check();

