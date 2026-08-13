const fs = require('fs');
const path = require('path');
const axios = require('axios');

const BASE_URL = (process.env.BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
const SRC_DIR = path.join(process.cwd(), 'src');

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  validateStatus: () => true,
});

const walk = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) files.push(full);
  }
  return files;
};

const sanitizePath = (raw) => {
  return String(raw)
    .replace(/\$\{[^}]+\}/g, '1')
    .replace(/\{[^}]+\}/g, '1')
    .replace(/\/+$/, '');
};

const extractEndpoints = (content) => {
  const out = [];
  const re = /axiosInstance\.(get|post|put|patch|delete)\(\s*(["'`])([^"'`]+)\2/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push({ method: m[1].toUpperCase(), path: sanitizePath(m[3]) || '/' });
  }
  return out;
};

const uniqBy = (arr, fn) => {
  const map = new Map();
  for (const item of arr) {
    const key = fn(item);
    if (!map.has(key)) map.set(key, item);
  }
  return Array.from(map.values());
};

(async () => {
  const files = walk(SRC_DIR);
  let endpoints = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const extracted = extractEndpoints(content);
    endpoints.push(...extracted.map((ep) => ({ ...ep, file })));
  }

  endpoints = uniqBy(endpoints, (e) => `${e.method} ${e.path}`);

  const results = [];
  for (const ep of endpoints) {
    const method = ep.method;
    const req = {
      method,
      url: ep.path,
    };

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      req.data = {};
    }

    const res = await client.request(req);
    results.push({
      method,
      path: ep.path,
      status: res.status,
      file: path.relative(process.cwd(), ep.file).replace(/\\/g, '/'),
    });
  }

  const byStatus = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const missing = results.filter((r) => r.status === 404 || r.status === 405);
  const authDenied = results.filter((r) => r.status === 401 || r.status === 403);

  const report = {
    baseUrl: BASE_URL,
    generatedAt: new Date().toISOString(),
    totalUniqueUiEndpoints: results.length,
    statusBreakdown: byStatus,
    authDeniedCount: authDenied.length,
    missingOrMethodMismatchCount: missing.length,
    missingOrMethodMismatch: missing,
  };

  console.log(JSON.stringify(report, null, 2));
})();
