import fs from 'fs';
import path from 'path';

const ADMIN_CONTROLLER_DIR = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/admin-service/src/main/java/com/example/admin/controller';
const ADMIN_API_FILE = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/api/adminApi.js';
const ADMIN_PAGES_DIR = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/admin';

function auditTraceability() {
  console.log('======================================================================');
  console.log(' 🔍 ADMIN API & UI MASTER AUDIT (PHASE 1: DISCOVERY & TRACEABILITY)');
  console.log('======================================================================\n');

  // 1. Scan backend controllers
  const controllerFiles = fs.readdirSync(ADMIN_CONTROLLER_DIR).filter(f => f.endsWith('.java'));
  const endpoints = [];

  for (const file of controllerFiles) {
    const content = fs.readFileSync(path.join(ADMIN_CONTROLLER_DIR, file), 'utf8');
    let basePath = '';
    const baseMatch = content.match(/@RequestMapping\(\s*["']([^"']+)["']/);
    if (baseMatch) basePath = baseMatch[1];

    const lines = content.split('\n');
    lines.forEach((line, idx) => {
      const match = line.match(/@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)(?:\(\s*(?:value\s*=\s*)?["']?([^"',\)]*)["']?\s*\))?/);
      if (match) {
        const method = match[1].replace('Mapping', '').toUpperCase();
        const sub = match[2] || '';
        const fullPath = (basePath + (sub ? (sub.startsWith('/') ? sub : '/' + sub) : '')).replace(/\/+/g, '/');
        endpoints.push({ file, method, path: fullPath, line: idx + 1 });
      }
    });
  }

  console.log(`1. Discovered Backend Endpoints in admin-service: ${endpoints.length}`);

  // 2. Scan frontend adminApi.js
  const apiContent = fs.readFileSync(ADMIN_API_FILE, 'utf8');
  const apiMethods = [];
  const methodRegex = /([a-zA-Z0-9_]+)\s*:\s*async\s*\(/g;
  let m;
  while ((m = methodRegex.exec(apiContent)) !== null) {
    apiMethods.push(m[1]);
  }
  console.log(`2. Discovered Client SDK Methods in adminApi.js: ${apiMethods.length}`);

  // 3. Scan UI components
  const pageFiles = fs.readdirSync(ADMIN_PAGES_DIR).filter(f => f.endsWith('.jsx'));
  console.log(`3. Discovered Admin UI Management Views: ${pageFiles.length}\n`);

  console.log('4. Sample Traceability Mapping:');
  endpoints.slice(0, 10).forEach(e => {
    console.log(`   [${e.method.padEnd(6)}] ${e.path.padEnd(35)} -> ${e.file}`);
  });

  console.log('\n======================================================================');
  console.log(' 🏁 PHASE 1 BASELINE READY FOR AUDIT EXECUTION');
  console.log('======================================================================');
}

auditTraceability();

