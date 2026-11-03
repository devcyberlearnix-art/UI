// scripts/verify_statistics_cms_lifecycle.mjs
// Independent Automated Test Suite for Landing Page Statistics Management & CMS Lifecycle

import axios from 'axios';
import fs from 'fs';
import {
  DEFAULT_STATISTICS_CONFIG,
  serializeStatisticRecord,
  parseStatisticRecord,
  resolveStatisticDisplay
} from '../src/utils/statisticsCalculator.js';

const GATEWAY_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8079';
const results = {
  timestamp: new Date().toISOString(),
  environment: 'Docker Microservices (11 services)',
  tests: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function record(testName, category, status, expected, actual, notes = '') {
  const passed = status === 'PASS';
  results.summary.total++;
  if (passed) results.summary.passed++;
  else results.summary.failed++;

  results.tests.push({
    testName,
    category,
    status,
    expected,
    actual,
    notes,
    timestamp: new Date().toISOString()
  });

  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${status}] ${category} :: ${testName}`);
  if (!passed) console.log(`   Expected: ${expected} | Actual: ${actual} (${notes})`);
}

async function run() {
  console.log('========================================================================');
  console.log(' 🚀 EXECUTING LANDING PAGE STATISTICS CMS LIFECYCLE VERIFICATION');
  console.log('========================================================================\n');

  let adminToken = null;

  // TEST 1: Admin Authentication
  try {
    const res = await axios.post(`${GATEWAY_URL}/api/v1/auth/login`, {
      email: 'dev.cyberlearnix@gmail.com',
      password: 'MainAdmin@123'
    });
    adminToken = res.data?.authentication?.accessToken;
    if (adminToken && res.data?.user?.role === 'MAIN_ADMIN') {
      record('Admin Authentication', 'RBAC & Security', 'PASS', 'HTTP 200 with MAIN_ADMIN JWT', 'HTTP 200 MAIN_ADMIN authenticated');
    } else {
      record('Admin Authentication', 'RBAC & Security', 'FAIL', 'JWT Token acquired', 'Token missing or invalid role');
    }
  } catch (err) {
    record('Admin Authentication', 'RBAC & Security', 'FAIL', 'HTTP 200', err.message);
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // TEST 2: Unauthorized Access Protection on Admin Statistics
  try {
    await axios.get(`${GATEWAY_URL}/api/v1/admin/website-stats`);
    record('Unauthenticated Statistics Mutation Protection', 'Security', 'FAIL', 'HTTP 401 Unauthorized', 'Allowed without JWT');
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      record('Unauthenticated Statistics Mutation Protection', 'Security', 'PASS', 'HTTP 401/403 Forbidden', `HTTP ${err.response.status} Rejected`);
    } else {
      record('Unauthenticated Statistics Mutation Protection', 'Security', 'FAIL', 'HTTP 401/403', err.message);
    }
  }

  // TEST 3: Retrieve Existing Admin Statistics
  let currentStats = [];
  try {
    const res = await axios.get(`${GATEWAY_URL}/api/v1/admin/website-stats`, { headers: adminHeaders });
    currentStats = res.data?.data || [];
    if (res.status === 200 && Array.isArray(currentStats)) {
      record('Get Admin Statistics Draft', 'CMS API', 'PASS', 'Array of statistics records', `${currentStats.length} records retrieved`);
    } else {
      record('Get Admin Statistics Draft', 'CMS API', 'FAIL', 'Array of statistics', 'Invalid response format');
    }
  } catch (err) {
    record('Get Admin Statistics Draft', 'CMS API', 'FAIL', 'HTTP 200', err.message);
  }

  // TEST 4: Configure 4 Production Statistics with compact metadata
  const payloadToSave = DEFAULT_STATISTICS_CONFIG.map((s, idx) => serializeStatisticRecord(s, idx));

  try {
    const updateRes = await axios.put(`${GATEWAY_URL}/api/v1/admin/website-stats`, payloadToSave, { headers: adminHeaders });
    if (updateRes.status === 200 && updateRes.data?.success && updateRes.data?.data?.length === 4) {
      record('Update Statistics Draft Configuration', 'CMS Mutation', 'PASS', 'HTTP 200 with 4 saved records', `Saved ${updateRes.data.data.length} records successfully`);
    } else {
      record('Update Statistics Draft Configuration', 'CMS Mutation', 'FAIL', 'HTTP 200 with 4 items', `Count: ${updateRes.data?.data?.length}`);
    }
  } catch (err) {
    record('Update Statistics Draft Configuration', 'CMS Mutation', 'FAIL', 'HTTP 200', err.response?.data?.message || err.message);
  }

  // TEST 5: Publish Draft to Production
  let publishedVersion = null;
  try {
    const pubRes = await axios.post(`${GATEWAY_URL}/api/v1/admin/landing-page/publish`, {
      changeSummary: 'Automated statistics verification publish'
    }, { headers: adminHeaders });

    publishedVersion = pubRes.data?.data?.publishedVersion;
    if (pubRes.status === 200 && pubRes.data?.success) {
      record('Publish Draft to Production', 'CMS Publishing', 'PASS', 'HTTP 200 with new revision version', `Published revision v${publishedVersion}`);
    } else {
      record('Publish Draft to Production', 'CMS Publishing', 'FAIL', 'HTTP 200 published', 'Publication failed');
    }
  } catch (err) {
    record('Publish Draft to Production', 'CMS Publishing', 'FAIL', 'HTTP 200', err.response?.data?.message || err.message);
  }

  // TEST 6: Public Read-Only Endpoint Serves Published Statistics
  try {
    const pubRes = await axios.get(`${GATEWAY_URL}/api/v1/public/landing-page`);
    const stats = pubRes.data?.data?.statistics || [];
    const version = pubRes.data?.data?.publishedVersion;

    if (Array.isArray(stats) && stats.length === 4 && String(version) === String(publishedVersion)) {
      record('Public Landing Page Serves Published Statistics', 'Public Delivery', 'PASS', 'Published statistics array matching v' + publishedVersion, `Verified: ${stats.length} stats delivered under v${version}`);
    } else {
      record('Public Landing Page Serves Published Statistics', 'Public Delivery', 'FAIL', 'Published stats array', `Mismatch: version=${version}, count=${stats.length}`);
    }
  } catch (err) {
    record('Public Landing Page Serves Published Statistics', 'Public Delivery', 'FAIL', 'HTTP 200', err.message);
  }

  // TEST 7: Public Website Stats Endpoint Integrity
  try {
    const statsRes = await axios.get(`${GATEWAY_URL}/api/v1/public/website-stats`);
    const stats = statsRes.data?.data || [];
    if (statsRes.status === 200 && stats.length === 4) {
      record('Public Website Stats Endpoint Integrity', 'Public Delivery', 'PASS', 'HTTP 200 with 4 published items', `Retrieved ${stats.length} metrics`);
    } else {
      record('Public Website Stats Endpoint Integrity', 'Public Delivery', 'FAIL', 'HTTP 200 4 items', `Status: ${statsRes.status}, items: ${stats.length}`);
    }
  } catch (err) {
    record('Public Website Stats Endpoint Integrity', 'Public Delivery', 'FAIL', 'HTTP 200', err.message);
  }

  // Write Results
  fs.writeFileSync('scripts/statistics_verification_results.json', JSON.stringify(results, null, 2));
  console.log('\n========================================================================');
  console.log(` 📊 SUMMARY: ${results.summary.passed}/${results.summary.total} PASSED (${results.summary.failed} FAILED)`);
  console.log('========================================================================\n');
}

run().catch(console.error);
