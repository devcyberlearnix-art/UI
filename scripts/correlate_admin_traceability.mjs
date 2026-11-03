import fs from 'fs';
import path from 'path';

const PARSED_DATA_PATH = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/scripts/admin_parsed.json';
const ADMIN_PAGES_DIR = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/admin';

function normalizeUrl(url) {
  if (!url) return '';
  return url
    .replace(/\$\{[^}]+\}/g, '{param}')
    .replace(/\{[^}]+\}/g, '{param}')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase();
}

function correlate() {
  const data = JSON.parse(fs.readFileSync(PARSED_DATA_PATH, 'utf8'));
  const { backendEndpoints, sdkMethods } = data;

  // Scan UI pages for usages of adminApi methods
  const uiUsageMap = {};
  const pageFiles = fs.readdirSync(ADMIN_PAGES_DIR).filter(f => f.endsWith('.jsx'));

  for (const pFile of pageFiles) {
    const content = fs.readFileSync(path.join(ADMIN_PAGES_DIR, pFile), 'utf8');
    for (const sdk of sdkMethods) {
      if (content.includes(`adminApi.${sdk.name}`) || content.includes(sdk.name)) {
        if (!uiUsageMap[sdk.name]) uiUsageMap[sdk.name] = new Set();
        uiUsageMap[sdk.name].add(pFile);
      }
    }
  }

  const matrix = [];
  const mappedSdkNames = new Set();

  for (const be of backendEndpoints) {
    const normBePath = normalizeUrl(be.path);

    // Find candidate SDK method
    let matchedSdk = null;

    for (const sdk of sdkMethods) {
      const normSdkUrl = normalizeUrl(sdk.urlPattern);
      
      // Exact match or parameterized match
      if (normBePath === normSdkUrl && (sdk.httpMethod === be.httpMethod || sdk.httpMethod === 'UNKNOWN')) {
        matchedSdk = sdk;
        break;
      }

      // Fuzzy check if method name matches controller method or URL segment
      if (normBePath === normSdkUrl) {
        matchedSdk = sdk;
        break;
      }
    }

    // Heuristic matching if direct path didn't match (e.g. /api/v1/admin/users/123/status vs updateStatus)
    if (!matchedSdk) {
      for (const sdk of sdkMethods) {
        if (normBePath.includes(normalizeUrl(sdk.urlPattern)) || normalizeUrl(sdk.urlPattern).includes(normBePath)) {
          if (sdk.httpMethod === be.httpMethod) {
            matchedSdk = sdk;
            break;
          }
        }
      }
    }

    if (matchedSdk) {
      mappedSdkNames.add(matchedSdk.name);
      const uiPages = uiUsageMap[matchedSdk.name] ? Array.from(uiUsageMap[matchedSdk.name]) : [];
      matrix.push({
        status: uiPages.length > 0 ? 'MAPPED_IN_UI' : 'SDK_ONLY_NO_UI',
        controller: be.controller,
        httpMethod: be.httpMethod,
        path: be.path,
        methodName: be.methodName,
        preAuthorize: be.preAuthorize || 'ROLE_ADMIN',
        isTransactional: be.isTransactional,
        sdkMethod: matchedSdk.name,
        sdkUrl: matchedSdk.urlPattern,
        uiViews: uiPages
      });
    } else {
      matrix.push({
        status: 'MISSING_SDK',
        controller: be.controller,
        httpMethod: be.httpMethod,
        path: be.path,
        methodName: be.methodName,
        preAuthorize: be.preAuthorize || 'ROLE_ADMIN',
        isTransactional: be.isTransactional,
        sdkMethod: null,
        sdkUrl: null,
        uiViews: []
      });
    }
  }

  // Check orphaned SDK methods (defined in adminApi.js but not in admin-service)
  const unmappedSdkMethods = sdkMethods.filter(s => !mappedSdkNames.has(s.name));

  const result = {
    totalBackend: backendEndpoints.length,
    totalSdk: sdkMethods.length,
    missingSdkCount: matrix.filter(m => m.status === 'MISSING_SDK').length,
    mappedInUiCount: matrix.filter(m => m.status === 'MAPPED_IN_UI').length,
    sdkOnlyNoUiCount: matrix.filter(m => m.status === 'SDK_ONLY_NO_UI').length,
    unmappedSdkCount: unmappedSdkMethods.length,
    matrix,
    unmappedSdkMethods: unmappedSdkMethods.map(s => ({
      name: s.name,
      httpMethod: s.httpMethod,
      urlPattern: s.urlPattern,
      uiViews: uiUsageMap[s.name] ? Array.from(uiUsageMap[s.name]) : []
    }))
  };

  fs.writeFileSync('C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/scripts/admin_traceability_matrix.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('Traceability matrix generated successfully!');
  console.log(`Total Backend Endpoints: ${result.totalBackend}`);
  console.log(`MISSING_SDK (Orphaned Backend Endpoints): ${result.missingSdkCount}`);
  console.log(`MAPPED_IN_UI: ${result.mappedInUiCount}`);
  console.log(`SDK_ONLY_NO_UI: ${result.sdkOnlyNoUiCount}`);
  console.log(`External/Cross-Domain SDK Methods: ${result.unmappedSdkCount}`);
}

correlate();

