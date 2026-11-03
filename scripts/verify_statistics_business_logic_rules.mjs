// scripts/verify_statistics_business_logic_rules.mjs
// Authoritative End-to-End Verification of Statistics CMS Business Logic Corrections

import axios from 'axios';
import {
  STATISTIC_KEYS,
  DATA_MODES,
  VERIFIED_SOURCE_BASELINES,
  formatMetricNumber,
  parseStatisticRecord,
  serializeStatisticRecord,
  resolveStatisticDisplay,
} from '../src/utils/statisticsCalculator.js';

const GATEWAY_URL = process.env.VITE_API_BASE_URL || 'http://localhost:8079';

const testResults = {
  timestamp: new Date().toISOString(),
  environment: 'Local Docker Microservices / Spring Cloud Gateway',
  assertions: [],
  summary: { total: 0, passed: 0, failed: 0 }
};

function assertTest(name, category, status, expected, actual, notes = '') {
  const isPass = status === 'PASS';
  testResults.summary.total++;
  if (isPass) testResults.summary.passed++;
  else testResults.summary.failed++;

  testResults.assertions.push({ name, category, status, expected, actual, notes });
  const icon = isPass ? '✅' : '❌';
  console.log(`${icon} [${status}] ${category} :: ${name}`);
  if (!isPass) console.log(`   Expected: ${expected} | Actual: ${actual} (${notes})`);
}

async function runVerification() {
  console.log('========================================================================');
  console.log(' 🔬 EXECUTING STATISTICS CMS BUSINESS LOGIC & INTEGRITY VERIFICATION');
  console.log('========================================================================\n');

  let adminToken = null;
  let initialPublishedVersion = null;

  // 1. Admin Authentication
  console.log('--- Step 1: Administrator Authentication & RBAC ---');
  try {
    const loginRes = await axios.post(`${GATEWAY_URL}/api/v1/auth/login`, {
      email: 'dev.cyberlearnix@gmail.com',
      password: 'MainAdmin@123'
    });
    adminToken = loginRes.data?.authentication?.accessToken;
    if (adminToken) {
      assertTest('Admin Login', 'Authentication', 'PASS', 'JWT Access Token', 'Acquired valid admin token');
    } else {
      assertTest('Admin Login', 'Authentication', 'FAIL', 'JWT Access Token', 'Missing token in response');
    }
  } catch (err) {
    assertTest('Admin Login', 'Authentication', 'FAIL', 'HTTP 200', err.message);
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // 2. Unauthorized Security Checks
  console.log('\n--- Step 2: Security & Authorization Guards ---');
  try {
    await axios.put(`${GATEWAY_URL}/api/v1/admin/website-stats`, []);
    assertTest('Anonymous Update Protection', 'Security', 'FAIL', 'HTTP 401/403', 'Allowed update without token');
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      assertTest('Anonymous Update Protection', 'Security', 'PASS', 'HTTP 401/403 Rejected', `HTTP ${err.response.status} Authorization Required`);
    } else {
      assertTest('Anonymous Update Protection', 'Security', 'FAIL', 'HTTP 401/403', err.message);
    }
  }

  try {
    await axios.post(`${GATEWAY_URL}/api/v1/admin/landing-page/publish`, {});
    assertTest('Anonymous Publish Protection', 'Security', 'FAIL', 'HTTP 401/403', 'Allowed publish without token');
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      assertTest('Anonymous Publish Protection', 'Security', 'PASS', 'HTTP 401/403 Rejected', `HTTP ${err.response.status} Authorization Required`);
    } else {
      assertTest('Anonymous Publish Protection', 'Security', 'FAIL', 'HTTP 401/403', err.message);
    }
  }

  // 3. Current Published Configuration Inspection
  console.log('\n--- Step 3: Inspect Current Published Configuration ---');
  try {
    const pubRes = await axios.get(`${GATEWAY_URL}/api/v1/public/landing-page`);
    initialPublishedVersion = pubRes.data?.data?.publishedVersion;
    const stats = pubRes.data?.data?.statistics || [];
    assertTest('Current Published State', 'Public API', 'PASS', 'Published version retrieved', `Active Version: ${initialPublishedVersion}, Metrics: ${stats.length}`);
    console.log('   Current values in production:');
    stats.forEach(s => console.log(`     - ${s.label}: ${s.value}`));
  } catch (err) {
    assertTest('Current Published State', 'Public API', 'FAIL', 'HTTP 200', err.message);
  }

  // 4. Test Hybrid Mode Mathematical Ceiling Enforcement
  console.log('\n--- Step 4: Hybrid Mode Ceiling Enforcement Rule ---');
  const hybridTestConfig = {
    statisticKey: STATISTIC_KEYS.ENROLLED_ENGINEERS,
    label: 'Enrolled Engineers',
    dataMode: DATA_MODES.HYBRID,
    displayValue: '1200', // Administrator configured floor of 1200
    prefix: '',
    suffix: '+',
  };

  // Live telemetry has 75 distinct students
  const resolvedHybrid = resolveStatisticDisplay(hybridTestConfig, { enrolledStudentsCount: 75 });
  if (resolvedHybrid.rawNumber <= 75 && resolvedHybrid.formattedNumber === '75') {
    assertTest('Hybrid Ceiling Clamp', 'Business Logic', 'PASS', 'Clamped to verified ceiling 75', `Displayed: ${resolvedHybrid.fullDisplayString} (Clamped: ${resolvedHybrid.isClamped})`);
  } else {
    assertTest('Hybrid Ceiling Clamp', 'Business Logic', 'FAIL', 'Displayed <= 75', `Inflated to: ${resolvedHybrid.fullDisplayString}`);
  }

  // 5. Test Milestone Downward Rounding (truthful lower bound)
  const hybridMilestoneConfig = {
    statisticKey: STATISTIC_KEYS.ACTIVE_COURSES,
    label: 'Active Courses',
    dataMode: DATA_MODES.HYBRID,
    displayValue: '280', // Admin configured milestone 280 for 287
    prefix: '',
    suffix: '+',
    roundingMode: 'FLOOR',
  };
  const resolvedMilestone = resolveStatisticDisplay(hybridMilestoneConfig, { activeCoursesCount: 287 });
  if (resolvedMilestone.rawNumber <= 287 && resolvedMilestone.fullDisplayString === '280+') {
    assertTest('Hybrid Milestone Lower Bound', 'Business Logic', 'PASS', '280+ <= 287', 'Truthful conservative lower bound displayed');
  } else {
    assertTest('Hybrid Milestone Lower Bound', 'Business Logic', 'FAIL', '280+', resolvedMilestone.fullDisplayString);
  }

  // 6. Test Automatic Mode with Exact Verified Source
  console.log('\n--- Step 5: Automatic Mode Real Database Values ---');
  const autoCourses = resolveStatisticDisplay({ statisticKey: STATISTIC_KEYS.ACTIVE_COURSES, dataMode: DATA_MODES.AUTOMATIC, label: 'Active Courses' }, { activeCoursesCount: 287 });
  const autoStudents = resolveStatisticDisplay({ statisticKey: STATISTIC_KEYS.ENROLLED_ENGINEERS, dataMode: DATA_MODES.AUTOMATIC, label: 'Enrolled Engineers' }, { enrolledStudentsCount: 75 });
  const autoRating = resolveStatisticDisplay({ statisticKey: STATISTIC_KEYS.AVERAGE_RATING, dataMode: DATA_MODES.AUTOMATIC, label: 'Average Rating', decimalPrecision: 1, prefix: '★ ' }, { averageRating: 4.4 });
  const autoInstructors = resolveStatisticDisplay({ statisticKey: STATISTIC_KEYS.LEAD_INSTRUCTORS, dataMode: DATA_MODES.AUTOMATIC, label: 'Lead Instructors' }, { instructorsCount: 16 });

  assertTest('Active Courses Auto Truth', 'Metrics', autoCourses.formattedNumber === '287' ? 'PASS' : 'FAIL', '287', autoCourses.formattedNumber);
  assertTest('Enrolled Students Auto Truth', 'Metrics', autoStudents.formattedNumber === '75' ? 'PASS' : 'FAIL', '75', autoStudents.formattedNumber);
  assertTest('Average Rating Auto Truth', 'Metrics', autoRating.formattedNumber === '4.4' ? 'PASS' : 'FAIL', '4.4', autoRating.formattedNumber);
  assertTest('Lead Instructors Auto Truth', 'Metrics', autoInstructors.formattedNumber === '16' ? 'PASS' : 'FAIL', '16', autoInstructors.formattedNumber);

  // 7. Test Serializer & PostgreSQL VARCHAR(100) Compliance
  console.log('\n--- Step 6: Serializer & Database Constraint Compliance ---');
  const correctedStats = [
    {
      statisticKey: STATISTIC_KEYS.ACTIVE_COURSES,
      label: 'Active Courses',
      description: 'Production-grade tracks',
      dataMode: DATA_MODES.AUTOMATIC,
      prefix: '',
      suffix: '',
      displayValue: '287',
      decimalPrecision: 0,
      iconName: 'BookOpen',
      displayOrder: 0,
      isVisible: true,
    },
    {
      statisticKey: STATISTIC_KEYS.ENROLLED_ENGINEERS,
      label: 'Enrolled Engineers',
      description: 'Distinct verified engineers',
      dataMode: DATA_MODES.HYBRID,
      prefix: '',
      suffix: '+',
      displayValue: '75',
      decimalPrecision: 0,
      iconName: 'Users',
      displayOrder: 1,
      isVisible: true,
    },
    {
      statisticKey: STATISTIC_KEYS.AVERAGE_RATING,
      label: 'Average Rating',
      description: 'Verified student reviews',
      dataMode: DATA_MODES.AUTOMATIC,
      prefix: '★ ',
      suffix: '',
      displayValue: '4.4',
      decimalPrecision: 1,
      iconName: 'Star',
      displayOrder: 2,
      isVisible: true,
    },
    {
      statisticKey: STATISTIC_KEYS.LEAD_INSTRUCTORS,
      label: 'Lead Instructors',
      description: 'Active senior architects',
      dataMode: DATA_MODES.AUTOMATIC,
      prefix: '',
      suffix: '',
      displayValue: '16',
      decimalPrecision: 0,
      iconName: 'GraduationCap',
      displayOrder: 3,
      isVisible: true,
    },
  ];

  const serializedList = correctedStats.map((s, idx) => serializeStatisticRecord(s, idx));
  let allLengthsSafe = true;
  serializedList.forEach((item, i) => {
    const len = item.subtext.length;
    console.log(`   Item ${i} (${item.label}) subtext length: ${len} chars (<= 95 safe threshold)`);
    if (len > 95) allLengthsSafe = false;
  });

  assertTest('Postgres VARCHAR(100) Length Safety', 'Data Integrity', allLengthsSafe ? 'PASS' : 'FAIL', 'All lengths <= 95', `Max length observed: ${Math.max(...serializedList.map(s => s.subtext.length))}`);

  // 8. Admin Saves Corrected Draft
  console.log('\n--- Step 7: Admin Draft Mutation & Isolation Check ---');
  try {
    const updateRes = await axios.put(`${GATEWAY_URL}/api/v1/admin/website-stats`, serializedList, { headers: adminHeaders });
    assertTest('Save Corrected Draft', 'CMS Draft', updateRes.status === 200 ? 'PASS' : 'FAIL', 'HTTP 200 OK', `Status: ${updateRes.status}`);

    // Verify Draft Isolation: Public endpoint MUST STILL return previous version!
    const publicCheck = await axios.get(`${GATEWAY_URL}/api/v1/public/landing-page`);
    const pubVersionDuringDraft = publicCheck.data?.data?.publishedVersion;
    if (pubVersionDuringDraft === initialPublishedVersion) {
      assertTest('Draft Isolation from Public Viewport', 'CMS Draft', 'PASS', `Version ${initialPublishedVersion} preserved`, `Public still sees v${pubVersionDuringDraft}`);
    } else {
      assertTest('Draft Isolation from Public Viewport', 'CMS Draft', 'FAIL', `Version ${initialPublishedVersion}`, `Public saw premature version ${pubVersionDuringDraft}`);
    }
  } catch (err) {
    assertTest('Save Corrected Draft', 'CMS Draft', 'FAIL', 'HTTP 200', err.message);
  }

  // 9. Admin Publishes Verified Configuration to Live
  console.log('\n--- Step 8: Admin Publishes Verified Revision ---');
  let newPublishedVersion = null;
  try {
    const pubRes = await axios.post(`${GATEWAY_URL}/api/v1/admin/landing-page/publish`, {}, { headers: adminHeaders });
    newPublishedVersion = pubRes.data?.data?.publishedVersion || pubRes.data?.publishedVersion;
    assertTest('Publish to Live Revision', 'CMS Publish', pubRes.status === 200 ? 'PASS' : 'FAIL', 'HTTP 200 OK', `Published Version: ${newPublishedVersion}`);
  } catch (err) {
    assertTest('Publish to Live Revision', 'CMS Publish', 'FAIL', 'HTTP 200', err.message);
  }

  // 10. Verify Public Edge Endpoint & Redis Cache Reflection
  console.log('\n--- Step 9: Verify Public Delivery & Clean Subtext ---');
  try {
    const liveRes = await axios.get(`${GATEWAY_URL}/api/v1/public/landing-page`);
    const liveVer = liveRes.data?.data?.publishedVersion;
    const liveStats = liveRes.data?.data?.statistics || [];

    assertTest('Public Live Version Incremented', 'Public API', liveVer === newPublishedVersion ? 'PASS' : 'FAIL', `Version ${newPublishedVersion}`, `Live Version: ${liveVer}`);

    // Verify no JSON leakage in parsed public items
    const parsedPublicItems = liveStats.map((item, idx) => parseStatisticRecord(item, idx));
    let zeroLeakedJson = true;
    parsedPublicItems.forEach((p, idx) => {
      console.log(`     Metric ${idx + 1}: ${p.label} = ${p.displayValue} (${p.description}) [Icon: ${p.iconName}]`);
      if (p.description.startsWith('{')) zeroLeakedJson = false;
    });

    assertTest('Public Description Cleanliness (No JSON Leak)', 'Public Safety', zeroLeakedJson ? 'PASS' : 'FAIL', 'Zero JSON in public subtext', 'Clean human descriptions rendered');

    // Verify exact metric values in live API
    const liveCourses = liveStats.find(s => s.label === 'Active Courses')?.value;
    const liveStudents = liveStats.find(s => s.label === 'Enrolled Engineers')?.value;
    const liveRating = liveStats.find(s => s.label === 'Average Rating')?.value;
    const liveInstructors = liveStats.find(s => s.label === 'Lead Instructors')?.value;

    assertTest('Live Published Courses = 287', 'Public Verification', liveCourses === '287' ? 'PASS' : 'FAIL', '287', liveCourses);
    assertTest('Live Published Students = 75', 'Public Verification', liveStudents === '75' ? 'PASS' : 'FAIL', '75', liveStudents);
    assertTest('Live Published Rating = 4.4', 'Public Verification', liveRating === '4.4' ? 'PASS' : 'FAIL', '4.4', liveRating);
    assertTest('Live Published Instructors = 16', 'Public Verification', liveInstructors === '16' ? 'PASS' : 'FAIL', '16', liveInstructors);

  } catch (err) {
    assertTest('Public Delivery Verification', 'Public API', 'FAIL', 'HTTP 200', err.message);
  }

  // Summary
  console.log('\n========================================================================');
  console.log(` 📊 SUMMARY: ${testResults.summary.passed}/${testResults.summary.total} PASSED (${testResults.summary.failed} FAILED)`);
  console.log('========================================================================\n');
}

runVerification().catch(console.error);

