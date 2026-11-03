import fs from 'fs';
import path from 'path';

// 1. Analyze routes from App.jsx
const appContent = fs.readFileSync('src/App.jsx', 'utf8');

// Match route paths and their components
const routeRegex = /<Route\s+path=["']([^"']+)["']\s+element=\{<([A-Za-z0-9_]+)/g;
let match;
const routes = [];
while ((match = routeRegex.exec(appContent)) !== null) {
  routes.push({ path: match[1], component: match[2] });
}

// Map imported components to their file paths in App.jsx
const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+['"]([^'"]+)['"]/g;
const lazyRegex = /const\s+([A-Za-z0-9_]+)\s*=\s*withFallback\(\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)\)/g;

const componentPaths = {};
while ((match = importRegex.exec(appContent)) !== null) {
  componentPaths[match[1]] = match[2];
}
while ((match = lazyRegex.exec(appContent)) !== null) {
  componentPaths[match[1]] = match[2];
}

console.log(`Found ${routes.length} active routes in App.jsx.`);

function resolveComponentFile(importPath) {
  if (!importPath) return null;
  let p = path.resolve('src', importPath.startsWith('./') ? importPath.slice(2) : importPath);
  if (fs.existsSync(p + '.jsx')) return p + '.jsx';
  if (fs.existsSync(p + '.js')) return p + '.js';
  if (fs.existsSync(path.join(p, 'index.jsx'))) return path.join(p, 'index.jsx');
  if (fs.existsSync(path.join(p, 'index.js'))) return path.join(p, 'index.js');
  return null;
}

const auditedRoutes = [];

for (const r of routes) {
  const impPath = componentPaths[r.component];
  const filePath = resolveComponentFile(impPath);

  if (!filePath) {
    auditedRoutes.push({
      route: r.path,
      component: r.component,
      file: impPath || 'UNKNOWN',
      status: 'MISSING_FILE',
      apis: [],
      hasMockFallback: false,
      notes: 'Component file not found'
    });
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;

  const apiMatches = [...content.matchAll(/([a-zA-Z0-9_]+Api)\.([a-zA-Z0-9_]+)/g)].map(m => m[0]);
  const fetchMatches = [...content.matchAll(/fetch\s*\(\s*`?\$\{?[^)]*(\/api\/v1\/[^`'")\s]+)/g)].map(m => m[1]);
  const axiosMatches = [...content.matchAll(/axiosInstance\s*\.\s*(get|post|put|delete|patch)\s*\(\s*`?([^\s`,)]+)/g)].map(m => m[2]);

  const allApis = [...new Set([...apiMatches, ...fetchMatches, ...axiosMatches])];

  const hasContextApi = /useOrders|useAuth|useWebSocket|useAdmin/g.test(content);

  const isStub = lines < 25 && /coming soon/i.test(content);
  const hasMockFallback = /(mock[a-zA-Z0-9_]*|dummy[a-zA-Z0-9_]*|defaultCourses|sampleData)/i.test(content);

  let category = 'BACKEND_CONNECTED';
  if (isStub) {
    category = 'STUB_COMING_SOON';
  } else if (allApis.length === 0 && !hasContextApi) {
    category = 'STATIC_OR_LOCAL';
  } else if (hasMockFallback) {
    category = 'BACKEND_WITH_MOCK_FALLBACK';
  }

  auditedRoutes.push({
    route: r.path,
    component: r.component,
    file: path.relative(process.cwd(), filePath).replace(/\\/g, '/'),
    lines,
    category,
    apis: allApis,
    hasContextApi,
    notes: isStub ? 'Placeholder UI with Coming Soon notice' : ''
  });
}

fs.writeFileSync('scripts/route_integration_audit.json', JSON.stringify(auditedRoutes, null, 2));

console.log('\n--- ROUTE INTEGRATION BREAKDOWN ---');
const breakdown = auditedRoutes.reduce((acc, r) => {
  acc[r.category] = (acc[r.category] || 0) + 1;
  return acc;
}, {});
console.log(breakdown);

