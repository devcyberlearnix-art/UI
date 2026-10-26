// scripts/build-authoritative-inventory.mjs
import fs from 'fs';
import path from 'path';

const SRC_DIR = path.resolve('src');
const API_DIR = path.resolve('src/api');
const PAGES_DIR = path.resolve('src/pages');
const COMPONENTS_DIR = path.resolve('src/components');

const apiFiles = fs.readdirSync(API_DIR).filter(f => f.endsWith('.js') && f !== 'axiosInstance.js' && f !== 'generatedApiClient.js' && f !== 'index.js');

const rawApis = [];

for (const file of apiFiles) {
  const content = fs.readFileSync(path.join(API_DIR, file), 'utf8');
  const moduleName = file.replace('.js', '');

  const lines = content.split('\n');
  let currentFn = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fnDefMatch = line.match(/^\s*(?:export\s+const\s+)?(\w+)\s*[:=]\s*(?:async\s*)?\(/);
    if (fnDefMatch) {
      currentFn = fnDefMatch[1];
    }

    const axiosMatch = line.match(/axiosInstance\.(get|post|put|patch|delete)\(\s*([`'"][^`'"]+[`'"])/);
    if (axiosMatch) {
      const method = axiosMatch[1].toUpperCase();
      let rawUrl = axiosMatch[2].replace(/[`'"]/g, '');
      const pathClean = rawUrl.split('?')[0];

      rawApis.push({
        module: moduleName,
        fnName: currentFn || 'unknown',
        method,
        rawUrl,
        path: pathClean
      });
    }
  }
}

// Walk UI files
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (/\.(jsx|js|tsx|ts)$/.test(entry.name)) files.push(full);
  }
  return files;
}

const uiFiles = [...walk(PAGES_DIR), ...walk(COMPONENTS_DIR)];
// Read all into memory once
const loadedUiFiles = uiFiles.map(f => ({
  rel: path.relative(process.cwd(), f).replace(/\\/g, '/'),
  content: fs.readFileSync(f, 'utf8')
}));

const inventoryMap = new Map();

for (const api of rawApis) {
  const key = `${api.method} ${api.path}`;
  const callers = [];
  for (const item of loadedUiFiles) {
    if (
      item.content.includes(`${api.module}.${api.fnName}`) ||
      (item.content.includes(api.fnName) && item.content.includes(api.module))
    ) {
      callers.push(item.rel);
    }
  }

  inventoryMap.set(key, {
    module: api.module,
    fnName: api.fnName,
    method: api.method,
    path: api.path,
    rawUrl: api.rawUrl,
    callers: Array.from(new Set(callers))
  });
}

// Read backend extracted inventory
const backendInventory = JSON.parse(fs.readFileSync('scripts/extracted_inventory.json', 'utf8'));

// Cross reference backend endpoints with frontend APIs
const result = backendInventory.map((item) => {
  let matchedApi = null;
  const cleanItemPath = item.path.split('?')[0];

  for (const [key, api] of inventoryMap.entries()) {
    if (api.method !== item.method) continue;

    const regStr = '^' + api.path
      .replace(/\$\{[^}]+\}/g, '[^/]+')
      .replace(/\{[^}]+\}/g, '[^/]+') + '$';
    const reg = new RegExp(regStr, 'i');

    const itemRegStr = '^' + cleanItemPath
      .replace(/\{[^}]+\}/g, '[^/]+') + '$';
    const itemReg = new RegExp(itemRegStr, 'i');

    if (reg.test(cleanItemPath) || itemReg.test(api.path) || cleanItemPath.toLowerCase() === api.path.toLowerCase()) {
      matchedApi = api;
      break;
    }
  }

  const isIntegrated = Boolean(matchedApi);
  const isUsedInUi = Boolean(matchedApi && matchedApi.callers.length > 0);

  return {
    service: item.service,
    name: item.name,
    method: item.method,
    path: item.path,
    auth: item.auth,
    feature: item.feature,
    module: matchedApi ? matchedApi.module : (item.module !== '-' ? item.module : null),
    fnName: matchedApi ? matchedApi.fnName : null,
    isIntegrated,
    isUsedInUi,
    uiCallers: matchedApi ? matchedApi.callers : [],
    status: item.status,
    issues: item.issues
  };
});

fs.writeFileSync('scripts/authoritative_inventory_built.json', JSON.stringify(result, null, 2));

console.log('=== Authoritative Inventory Built ===');
console.log('Total Backend Endpoints:', result.length);
console.log('Total Frontend Raw Axios Calls:', rawApis.length);
console.log('Total Integrated Endpoints in Catalog:', result.filter(r => r.isIntegrated).length);
console.log('Total Actively Called in UI Pages/Components:', result.filter(r => r.isUsedInUi).length);
