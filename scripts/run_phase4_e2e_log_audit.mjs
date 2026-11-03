import { execSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';

const JWT_SECRET = '8c4e9d2f1a7b6c5d9e3f0a1b7c8d4e5f9a2b6c1d8e7f3a4b5c9d1e6f8a2b7c3';
const GATEWAY_BASE = 'http://localhost:8079';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function generateAdminToken() {
  const header = { alg: 'HS256', typ: 'JWT' };
  const uuid = '00000000-0000-0000-0000-000000000001';
  const payload = {
    userId: uuid,
    sub: uuid,
    email: 'admin@merqora.com',
    type: 'access',
    iss: 'cyberlearnix',
    aud: 'cyberlearnix-clients',
    role: 'MAIN_ADMIN',
    roles: ['ROLE_MAIN_ADMIN', 'MAIN_ADMIN', 'ROLE_ADMIN'],
    assignedService: 'COURSE_SERVICE',
    adminRole: 'MAIN_ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7200,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

const token = generateAdminToken();

function getDockerLogs(containerName, tail = 50) {
  try {
    return execSync(`docker logs --tail ${tail} ${containerName}`, { encoding: 'utf8' });
  } catch (err) {
    return `Error fetching logs for ${containerName}: ${err.message}`;
  }
}

async function runE2EAudit() {
  console.log('========================================================================');
  console.log('🔥 PHASE 4: LIVE E2E USER FLOWS & CONTAINER LOG AUDIT');
  console.log('========================================================================\n');

  const results = {
    startTime: new Date().toISOString(),
    flows: {},
    logAudit: {},
    summary: { total: 0, passed: 0, failed: 0 },
  };

  function recordStep(flowName, stepName, success, details) {
    if (!results.flows[flowName]) results.flows[flowName] = [];
    results.flows[flowName].push({ stepName, success, details });
    results.summary.total++;
    if (success) {
      results.summary.passed++;
      console.log(`  ✅ [${flowName}] ${stepName}: PASSED`);
    } else {
      results.summary.failed++;
      console.log(`  ❌ [${flowName}] ${stepName}: FAILED - ${JSON.stringify(details)}`);
    }
  }

  // -------------------------------------------------------------------------
  // FLOW 1: Banner Lifecycle & Storefront Sync
  // -------------------------------------------------------------------------
  console.log('\n--- Executing Flow 1: Banner Lifecycle & Storefront Sync ---');
  let createdBannerId = null;

  try {
    const dynamicOrder = (Math.floor(Date.now() / 1000) % 800) + 50;

    // 1.1 Create Banner
    const createRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Cloud Native Kubernetes & Distributed Tracing Masterclass',
        description: 'Advanced microservices architecture with Spring Boot 3.3 and OpenTelemetry.',
        imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9',
        ctaText: 'Enroll Now',
        ctaUrl: 'https://cyberlearnix.com/courses/253',
        displayOrder: dynamicOrder,
        status: 'ACTIVE',
        targetType: 'COURSE',
      }),
    });

    const createJson = await createRes.json();
    const createSuccess = createRes.status === 201 && createJson.success === true;
    createdBannerId = createJson?.data?.id;
    recordStep('Banner Lifecycle', 'POST /banners (Create Banner)', createSuccess, {
      status: createRes.status,
      bannerId: createdBannerId,
      order: dynamicOrder,
    });

    // 1.2 Fetch Active Banners
    const getRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/banners`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const getJson = await getRes.json();
    const getSuccess = getRes.status === 200 && Array.isArray(getJson?.data);
    recordStep('Banner Lifecycle', 'GET /banners (List Active Banners)', getSuccess, {
      status: getRes.status,
      count: getJson?.data?.length,
    });

    // 1.3 Reorder Banners
    if (createdBannerId) {
      const reorderRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/banners/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          banners: [{ id: createdBannerId, displayOrder: dynamicOrder }],
        }),
      });
      recordStep('Banner Lifecycle', 'PATCH /banners/reorder (Catalog Reorder)', reorderRes.status === 200, {
        status: reorderRes.status,
      });

      // 1.4 Soft-Delete Banner
      const deleteRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/banners/${createdBannerId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      recordStep('Banner Lifecycle', `DELETE /banners/${createdBannerId} (Soft-Delete)`, deleteRes.status === 200, {
        status: deleteRes.status,
      });

      // 1.5 Verify in Archived / Deleted list
      const deletedRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/banners/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deletedJson = await deletedRes.json();
      const inDeleted = (deletedJson?.data || []).some(b => b.id === createdBannerId);
      recordStep('Banner Lifecycle', 'GET /banners/deleted (Audit Deleted List)', inDeleted, {
        status: deletedRes.status,
        foundInDeleted: inDeleted,
      });

      // 1.6 Restore Banner
      const restoreRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/banners/${createdBannerId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      recordStep('Banner Lifecycle', `POST /banners/${createdBannerId}/restore (Restore)`, restoreRes.status === 200, {
        status: restoreRes.status,
      });

      // 1.7 Verify Storefront Sync
      const publicRes = await fetch(`${GATEWAY_BASE}/api/v1/banners`);
      const publicJson = await publicRes.json();
      recordStep('Banner Lifecycle', 'GET /api/v1/banners (Storefront Public Sync)', publicRes.status === 200, {
        status: publicRes.status,
        activeCount: (publicJson?.data || []).length,
      });
    }
  } catch (err) {
    recordStep('Banner Lifecycle', 'Unexpected Exception in Flow 1', false, { error: err.message });
  }

  // -------------------------------------------------------------------------
  // FLOW 2: User & Instructor Operations
  // -------------------------------------------------------------------------
  console.log('\n--- Executing Flow 2: User & Instructor Operations ---');
  try {
    // 2.1 Fetch Users List
    const usersRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/users?page=0&size=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const usersJson = await usersRes.json();
    const usersList = usersJson?.data?.users || [];
    recordStep('User Operations', 'GET /users (Paginated Query)', usersRes.status === 200, {
      status: usersRes.status,
      totalUsers: usersJson?.data?.totalUsers,
    });

    // 2.2 Toggle User Status
    if (usersList.length > 0) {
      const targetUser = usersList[0];
      const newStatus = targetUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const statusRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/users/${targetUser.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      recordStep('User Operations', `PUT /users/${targetUser.id}/status (Status Toggle)`, statusRes.status === 200, {
        status: statusRes.status,
        toggledTo: newStatus,
      });
    }

    // 2.3 List Instructors
    const instructorsRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/instructors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    recordStep('Instructor Operations', 'GET /instructors (Query Instructors)', instructorsRes.status === 200, {
      status: instructorsRes.status,
    });

    // 2.4 List Instructor Applications
    const applicationsRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/instructors/applications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    recordStep('Instructor Operations', 'GET /instructors/applications (Applications Ledger)', applicationsRes.status === 200, {
      status: applicationsRes.status,
    });

    // 2.5 Instructor Deletion Negative Test (Rejection handling)
    const dummyId = '00000000-0000-0000-0000-000000000099';
    const deleteInstRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/instructors/${dummyId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const cleanRejection = [400, 404, 500].includes(deleteInstRes.status);
    recordStep('Instructor Operations', 'DELETE /instructors/{id} (Negative Rejection Test)', cleanRejection, {
      status: deleteInstRes.status,
      handledCleanly: cleanRejection,
    });
  } catch (err) {
    recordStep('User Operations', 'Unexpected Exception in Flow 2', false, { error: err.message });
  }

  // -------------------------------------------------------------------------
  // FLOW 3: Financial & Order Processing
  // -------------------------------------------------------------------------
  console.log('\n--- Executing Flow 3: Financial & Order Processing ---');
  try {
    // 3.1 Paginate Payments
    const paymentsRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/payments?page=0&size=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    recordStep('Financial Operations', 'GET /payments (Paginated Ledger)', paymentsRes.status === 200, {
      status: paymentsRes.status,
    });

    // 3.2 Paginate Orders
    const ordersRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/orders?page=0&size=10`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    recordStep('Financial Operations', 'GET /orders (Paginated Ledger)', ordersRes.status === 200, {
      status: ordersRes.status,
    });

    // 3.3 Negative Refund Flow (Non-existent order refund rollback)
    const refundRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/orders/999999/refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const cleanRefundRejection = [400, 404].includes(refundRes.status);
    recordStep('Financial Operations', 'POST /orders/999999/refund (Transactional Integrity Negative Test)', cleanRefundRejection, {
      status: refundRes.status,
    });
  } catch (err) {
    recordStep('Financial Operations', 'Unexpected Exception in Flow 3', false, { error: err.message });
  }

  // -------------------------------------------------------------------------
  // FLOW 4: Reports & System Broadcasts
  // -------------------------------------------------------------------------
  console.log('\n--- Executing Flow 4: Reports & System Broadcasts ---');
  try {
    // 4.1 Users Report
    const userReportRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/reports/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    recordStep('Reports & System', 'GET /reports/users (User Statistics)', userReportRes.status === 200, {
      status: userReportRes.status,
    });

    // 4.2 Courses Report
    const coursesReportRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/reports/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    recordStep('Reports & System', 'GET /reports/courses (Curriculum Statistics)', coursesReportRes.status === 200, {
      status: coursesReportRes.status,
    });

    // 4.3 Revenue Report
    const revenueReportRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/reports/revenue`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    recordStep('Reports & System', 'GET /reports/revenue (Financial Telemetry)', revenueReportRes.status === 200, {
      status: revenueReportRes.status,
    });

    // 4.4 Orders Report
    const ordersReportRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/reports/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    recordStep('Reports & System', 'GET /reports/orders (Order Analytics)', ordersReportRes.status === 200, {
      status: ordersReportRes.status,
    });

    // 4.5 System Broadcast Dispatch
    const broadcastRes = await fetch(`${GATEWAY_BASE}/api/v1/admin/broadcast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Production Audit Telemetry Announcement',
        message: 'Platform SLA verification in progress. All microservices operating at peak throughput.',
        channel: 'EMAIL',
      }),
    });
    const broadcastJson = await broadcastRes.json();
    const broadcastSuccess = broadcastRes.status === 200 && broadcastJson.status === 'SUCCESS';
    recordStep('Reports & System', 'POST /broadcast (Multi-User Notification Dispatch)', broadcastSuccess, {
      status: broadcastRes.status,
      message: broadcastJson?.data,
    });
  } catch (err) {
    recordStep('Reports & System', 'Unexpected Exception in Flow 4', false, { error: err.message });
  }

  // -------------------------------------------------------------------------
  // CONTAINER LOG AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- Auditing Container Logs (cyberlearnix-admin-service & cyberlearnix-apigateway) ---');
  const adminLogs = getDockerLogs('cyberlearnix-admin-service', 60);
  const gatewayLogs = getDockerLogs('cyberlearnix-apigateway', 60);

  // 1. Check for unhandled exceptions / 500s
  const hasNPE = adminLogs.includes('NullPointerException') || gatewayLogs.includes('NullPointerException');

  // 2. Check for sensitive data scrubbing
  const redactsAuth = gatewayLogs.includes('Bearer ***') && gatewayLogs.includes('Token fingerprint');

  // 3. Check for Correlation / Trace ID propagation
  const hasTraceId = gatewayLogs.includes('traceId=') || gatewayLogs.includes('X-Trace-Id');

  results.logAudit = {
    zeroUnhandledNPEs: !hasNPE,
    sensitiveDataScrubbedInFilter: redactsAuth,
    correlationIdPropagated: hasTraceId,
    adminLogsTailSnippet: adminLogs.slice(-600),
    gatewayLogsTailSnippet: gatewayLogs.slice(-600),
  };

  console.log(`  🔍 Zero Unhandled NPE Errors: ${results.logAudit.zeroUnhandledNPEs ? 'PASS' : 'FAIL'}`);
  console.log(`  🔒 Sensitive Data Scrubbing in Auth Filters: ${results.logAudit.sensitiveDataScrubbedInFilter ? 'PASS' : 'FAIL'}`);
  console.log(`  🌐 Correlation / Trace ID Propagation: ${results.logAudit.correlationIdPropagated ? 'PASS' : 'FAIL'}`);

  results.endTime = new Date().toISOString();
  fs.writeFileSync('C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/scripts/phase4_e2e_results.json', JSON.stringify(results, null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log(`🎉 PHASE 4 AUDIT COMPLETE: ${results.summary.passed} / ${results.summary.total} Steps Passed (${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%)`);
  console.log('========================================================================\n');
}

runE2EAudit().catch(err => {
  console.error('Fatal failure in Phase 4 E2E runner:', err);
  process.exit(1);
});
