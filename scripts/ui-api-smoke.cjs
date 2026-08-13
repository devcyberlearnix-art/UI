const axios = require('axios');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

const roleCreds = {
  student: {
    email: process.env.STUDENT_EMAIL || '',
    password: process.env.STUDENT_PASSWORD || '',
  },
  instructor: {
    email: process.env.INSTRUCTOR_EMAIL || '',
    password: process.env.INSTRUCTOR_PASSWORD || '',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  },
};

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  validateStatus: () => true,
});

const pretty = (obj) => JSON.stringify(obj, null, 2);

const getTokenFromLogin = (data) => {
  return (
    data?.authentication?.accessToken ||
    data?.authentication?.token ||
    data?.accessToken ||
    data?.token ||
    data?.access_token ||
    null
  );
};

const getUserIdFromLogin = (data) => {
  return data?.user?.id || data?.user?.userId || data?.id || data?.userId || null;
};

const runRequest = async (label, method, path, opts = {}) => {
  const res = await client.request({
    method,
    url: path,
    data: opts.data,
    params: opts.params,
    headers: opts.headers,
  });

  return {
    label,
    method: method.toUpperCase(),
    path,
    status: res.status,
    ok: res.status >= 200 && res.status < 300,
    body: res.data,
  };
};

const protectedEndpoints = [
  ['GET', '/api/v1/cart'],
  ['GET', '/api/v1/orders'],
  ['GET', '/api/v1/wishlist'],
  ['GET', '/api/v1/admin/users'],
  ['GET', '/api/v1/admin/orders'],
  ['GET', '/api/v1/admin/reports/users'],
];

const studentEndpoints = [
  ['GET', '/api/v1/cart'],
  ['GET', '/api/v1/orders'],
  ['GET', '/api/v1/wishlist'],
];

const instructorEndpoints = [
  ['GET', '/api/v1/instructors/{id}/dashboard'],
  ['GET', '/api/v1/instructors/{id}/earnings'],
  ['GET', '/api/v1/instructors/{id}/courses'],
];

const adminEndpoints = [
  ['GET', '/api/v1/admin/users'],
  ['GET', '/api/v1/admin/orders'],
  ['GET', '/api/v1/admin/reports/users'],
  ['GET', '/api/v1/admin/reports/courses'],
];

const doLogin = async (role, creds) => {
  if (!creds.email || !creds.password) {
    return { skipped: true, reason: 'missing credentials' };
  }

  const login = await runRequest(
    `${role}: login`,
    'POST',
    '/api/v1/auth/login',
    { data: { email: creds.email, password: creds.password } }
  );

  const token = getTokenFromLogin(login.body);
  const userId = getUserIdFromLogin(login.body);

  return {
    skipped: false,
    login,
    token,
    userId,
    loginOk: Boolean(token) && login.status >= 200 && login.status < 300,
  };
};

const runRoleSuite = async (role, authInfo, endpoints) => {
  if (authInfo.skipped) {
    return { role, skipped: true, reason: authInfo.reason, checks: [] };
  }

  if (!authInfo.loginOk) {
    return {
      role,
      skipped: true,
      reason: `login failed (status ${authInfo.login.status})`,
      checks: [authInfo.login],
    };
  }

  const headers = { Authorization: `Bearer ${authInfo.token}` };
  const resolved = endpoints.map(([method, path]) => {
    const effectivePath = path.includes('{id}')
      ? path.replace('{id}', String(authInfo.userId || 'me'))
      : path;
    return [method, effectivePath];
  });

  const checks = [];
  for (const [method, path] of resolved) {
    checks.push(await runRequest(`${role}: ${method} ${path}`, method, path, { headers }));
  }

  return { role, skipped: false, checks, login: authInfo.login };
};

(async () => {
  const report = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    sections: {},
  };

  const publicChecks = [];
  publicChecks.push(await runRequest('gateway: root', 'GET', '/'));
  publicChecks.push(
    await runRequest('public: login-invalid', 'POST', '/api/v1/auth/login', {
      data: { email: 'invalid@example.com', password: 'invalid' },
    })
  );
  publicChecks.push(
    await runRequest('public: request-login-otp-invalid', 'POST', '/api/v1/auth/login/otp/request', {
      data: { email: 'invalid@example.com' },
    })
  );
  publicChecks.push(
    await runRequest('public: forgot-password-invalid', 'POST', '/api/v1/auth/password/forgot', {
      data: { email: 'invalid@example.com' },
    })
  );

  report.sections.public = publicChecks;

  const unauthChecks = [];
  for (const [method, path] of protectedEndpoints) {
    unauthChecks.push(await runRequest(`unauth: ${method} ${path}`, method, path));
  }
  report.sections.unauthProtected = unauthChecks;

  const studentAuth = await doLogin('student', roleCreds.student);
  const instructorAuth = await doLogin('instructor', roleCreds.instructor);
  const adminAuth = await doLogin('admin', roleCreds.admin);

  report.sections.roleAuth = {
    studentLogin: studentAuth.skipped ? studentAuth : studentAuth.login,
    instructorLogin: instructorAuth.skipped ? instructorAuth : instructorAuth.login,
    adminLogin: adminAuth.skipped ? adminAuth : adminAuth.login,
  };

  report.sections.student = await runRoleSuite('student', studentAuth, studentEndpoints);
  report.sections.instructor = await runRoleSuite('instructor', instructorAuth, instructorEndpoints);
  report.sections.admin = await runRoleSuite('admin', adminAuth, adminEndpoints);

  const summarize = (checks) => {
    const total = checks.length;
    const ok = checks.filter((c) => c.ok).length;
    return { total, ok, failed: total - ok };
  };

  report.summary = {
    public: summarize(publicChecks),
    unauthProtected: summarize(unauthChecks),
    student: report.sections.student.skipped ? { skipped: true, reason: report.sections.student.reason } : summarize(report.sections.student.checks),
    instructor: report.sections.instructor.skipped ? { skipped: true, reason: report.sections.instructor.reason } : summarize(report.sections.instructor.checks),
    admin: report.sections.admin.skipped ? { skipped: true, reason: report.sections.admin.reason } : summarize(report.sections.admin.checks),
  };

  console.log(pretty(report));
})();
