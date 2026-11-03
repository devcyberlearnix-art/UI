import fs from 'fs';
import path from 'path';

function getFiles(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file, filter));
    } else if (!filter || filter(file)) {
      results.push(file);
    }
  });
  return results;
}

const pageFiles = getFiles('src/pages', f => f.endsWith('.jsx') || f.endsWith('.js'));

const audit = pageFiles.map(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').length;
  const relPath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

  const hasApiImport = /from ['"][^'"]*(api|service|axios|hooks\/use)[^'"]*['"]/i.test(content) || /axios/i.test(content);
  const apiMatches = [...content.matchAll(/([a-zA-Z0-9_]+Api)\.([a-zA-Z0-9_]+)/g)].map(m => m[0]);
  const hookMatches = [...content.matchAll(/use[A-Z][a-zA-Z0-9_]+/g)].map(m => m[0]);
  const uniqueApis = [...new Set(apiMatches)];
  const relevantHooks = [...new Set(hookMatches)].filter(h => !['useState', 'useEffect', 'useMemo', 'useCallback', 'useRef', 'useNavigate', 'useLocation', 'useParams', 'useSearchParams'].includes(h));

  const mockMatches = [...content.matchAll(/(mock[a-zA-Z0-9_]*|dummy[a-zA-Z0-9_]*|sample[a-zA-Z0-9_]*|fallback[a-zA-Z0-9_]*)/gi)].map(m => m[0]);
  const uniqueMocks = [...new Set(mockMatches.map(m => m.toLowerCase()))].slice(0, 10);

  const isStub = lines < 25 && /coming soon/i.test(content);

  return {
    file: relPath,
    lines,
    hasApiImport,
    apis: uniqueApis,
    hooks: relevantHooks,
    isStub,
    mockHints: uniqueMocks
  };
});

fs.writeFileSync('scripts/ui_backend_audit_results.json', JSON.stringify(audit, null, 2));
console.log(`Audited ${audit.length} pages. Saved to scripts/ui_backend_audit_results.json`);

