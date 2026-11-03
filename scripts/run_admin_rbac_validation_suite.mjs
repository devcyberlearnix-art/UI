import http from 'http';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SECRET = '8c4e9d2f1a7b6c5d9e3f0a1b7c8d4e5f9a2b6c1d8e7f3a4b5c9d1e6f8a2b7c3';
const ISSUER = 'cyberlearnix';
const AUDIENCE = 'cyberlearnix-clients';

function createToken({ userId, email, role, adminType, assignedService }) {
  const b64 = obj => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    iss: ISSUER,
    aud: [AUDIENCE],
    sub: userId,
    userId,
    email,
    role: role.startsWith('ROLE_') ? role : 'ROLE_' + role,
    adminType: adminType || 'NONE',
    assignedService: assignedService || 'NONE',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7200
  };
  const data = b64(header) + '.' + b64(payload);
  const sig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return data + '.' + sig;
}

function request({ method, path, token, body }) {
  return new Promise((resolve) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    
    const req = http.request({
      hostname: 'localhost',
      port: 8087,
      path,
      method,
      headers,
      timeout: 5000
    }, res => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: resBody
        });
      });
    });

    req.on('error', err => resolve({ statusCode: 0, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ statusCode: 408, error: 'Request timeout' });
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('======================================================================');
  console.log(' 🛡️ ADMIN API AUDIT - PHASE 2: RBAC & BACKEND VALIDATION SUITE');
  console.log('======================================================================\n');

  const tokens = {
    anonymous: null,
    student: createToken({
      userId: '11111111-0000-0000-0000-000000000001',
      email: 'student.audit@cyberlearnix.com',
      role: 'STUDENT'
    }),
    instructor: createToken({
      userId: '11111111-0000-0000-0000-000000000002',
      email: 'instructor.audit@cyberlearnix.com',
      role: 'INSTRUCTOR'
    }),
    courseSubAdmin: createToken({
      userId: '11111111-0000-0000-0000-000000000003',
      email: 'course.subadmin@cyberlearnix.com',
      role: 'SUB_ADMIN',
      adminType: 'SUB_ADMIN',
      assignedService: 'COURSE_SERVICE'
    }),
    mainAdmin: createToken({
      userId: '11111111-1111-1111-1111-111111111111',
      email: 'admin@merqora.com',
      role: 'MAIN_ADMIN',
      adminType: 'MAIN_ADMIN',
      assignedService: 'ALL'
    })
  };

  const testMatrix = [
    // 1. High-Risk: AdminPaymentController
    {
      group: 'AdminPaymentController',
      method: 'GET',
      path: '/api/v1/admin/payments',
      desc: 'Get all payments',
      cases: [
        { role: 'anonymous', expectedStatus: 401 },
        { role: 'student', expectedStatus: 403 },
        { role: 'instructor', expectedStatus: 403 },
        { role: 'courseSubAdmin', expectedStatus: 403, note: 'Scoped sub-admin blocked from payments' },
        { role: 'mainAdmin', expectedStatus: 200 }
      ]
    },
    {
      group: 'AdminPaymentController',
      method: 'GET',
      path: '/api/v1/admin/payments/00000000-0000-0000-0000-000000000000',
      desc: 'Get payment by non-existent ID (Negative Path)',
      cases: [
        { role: 'student', expectedStatus: 403 },
        { role: 'mainAdmin', expectedStatus: [200, 400, 404], note: 'Rejects non-existent payment safely' }
      ]
    },

    // 2. High-Risk: AdminOrderController
    {
      group: 'AdminOrderController',
      method: 'GET',
      path: '/api/v1/admin/orders',
      desc: 'Get all orders',
      cases: [
        { role: 'anonymous', expectedStatus: 401 },
        { role: 'student', expectedStatus: 403 },
        { role: 'instructor', expectedStatus: 403 },
        { role: 'courseSubAdmin', expectedStatus: 403, note: 'Scoped sub-admin blocked from orders' },
        { role: 'mainAdmin', expectedStatus: 200 }
      ]
    },
    {
      group: 'AdminOrderController',
      method: 'POST',
      path: '/api/v1/admin/orders/00000000-0000-0000-0000-000000000000/refund',
      desc: 'Process refund on non-existent order (Negative / Rollback Check)',
      cases: [
        { role: 'anonymous', expectedStatus: 401 },
        { role: 'student', expectedStatus: 403 },
        { role: 'mainAdmin', expectedStatus: [400, 404, 500], note: 'Rejects invalid refund with clean status' }
      ]
    },

    // 3. High-Risk: AdminUserController
    {
      group: 'AdminUserController',
      method: 'GET',
      path: '/api/v1/admin/users',
      desc: 'Get all users list',
      cases: [
        { role: 'anonymous', expectedStatus: 401 },
        { role: 'student', expectedStatus: 403 },
        { role: 'instructor', expectedStatus: 403 },
        { role: 'courseSubAdmin', expectedStatus: 403, note: 'Course sub-admin cannot list all users' },
        { role: 'mainAdmin', expectedStatus: 200 }
      ]
    },
    {
      group: 'AdminUserController',
      method: 'PUT',
      path: '/api/v1/admin/users/00000000-0000-0000-0000-000000000000/status',
      desc: 'Update user status',
      body: { status: 'SUSPENDED' },
      cases: [
        { role: 'anonymous', expectedStatus: 401 },
        { role: 'student', expectedStatus: 403 },
        { role: 'mainAdmin', expectedStatus: [200, 400, 404] }
      ]
    },

    // 4. Privilege Escalation Guard
    {
      group: 'Privilege Escalation Guard',
      method: 'POST',
      path: '/api/v1/admin/register',
      desc: 'Create new Sub-Admin (Requires Main Admin)',
      body: {
        email: 'test.subadmin@merqora.com',
        password: 'Password@123',
        assignedService: 'COURSE'
      },
      cases: [
        { role: 'anonymous', expectedStatus: [401, 403], note: 'Anonymous cannot register sub-admin' },
        { role: 'student', expectedStatus: 403 },
        { role: 'courseSubAdmin', expectedStatus: 403, note: 'Sub-admin cannot create other sub-admins' }
      ]
    },

    // 5. Banners & Content Moderation
    {
      group: 'AdminBannerController',
      method: 'GET',
      path: '/api/v1/admin/banners',
      desc: 'List all banners',
      cases: [
        { role: 'anonymous', expectedStatus: 401 },
        { role: 'student', expectedStatus: 403 },
        { role: 'mainAdmin', expectedStatus: 200 }
      ]
    },

    // 6. Reports & Analytics
    {
      group: 'AdminReportController',
      method: 'GET',
      path: '/api/v1/admin/reports/users',
      desc: 'Export / Retrieve users report',
      cases: [
        { role: 'anonymous', expectedStatus: 401 },
        { role: 'student', expectedStatus: 403 },
        { role: 'mainAdmin', expectedStatus: 200 }
      ]
    }
  ];

  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const test of testMatrix) {
    console.log(`\n▶ [${test.group}] ${test.method} ${test.path} - ${test.desc}`);
    for (const c of test.cases) {
      const token = tokens[c.role];
      const res = await request({
        method: test.method,
        path: test.path,
        token,
        body: test.body
      });

      const allowedStatuses = Array.isArray(c.expectedStatus) ? c.expectedStatus : [c.expectedStatus];
      const isPassed = allowedStatuses.includes(res.statusCode);

      if (isPassed) {
        passedCount++;
        console.log(`   ✅ PASS: [Role: ${c.role.padEnd(14)}] Status ${res.statusCode} (Expected: ${allowedStatuses.join('/')})${c.note ? ' - ' + c.note : ''}`);
      } else {
        failedCount++;
        console.log(`   ❌ FAIL: [Role: ${c.role.padEnd(14)}] Status ${res.statusCode} (Expected: ${allowedStatuses.join('/')}) - Body: ${res.body?.substring(0, 80)}`);
      }

      results.push({
        group: test.group,
        endpoint: `${test.method} ${test.path}`,
        role: c.role,
        statusCode: res.statusCode,
        expected: allowedStatuses,
        passed: isPassed,
        note: c.note || ''
      });
    }
  }

  console.log('\n======================================================================');
  console.log(` 🏁 TEST SUITE COMPLETED: ${passedCount} PASSED, ${failedCount} FAILED (Total: ${passedCount + failedCount})`);
  console.log('======================================================================');

  fs.writeFileSync(
    'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/scripts/admin_rbac_validation_results.json',
    JSON.stringify({ passedCount, failedCount, total: passedCount + failedCount, results }, null, 2),
    'utf8'
  );
}

runTestSuite().catch(console.error);
