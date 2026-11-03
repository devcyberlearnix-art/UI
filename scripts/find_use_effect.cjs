const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = walk('./src');
const issues = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  // Check if useEffect is referenced
  if (/\buseEffect\s*\(/.test(content)) {
    // Check if imported from 'react'
    const importedFromReact = /import\s+[^'"]*?\buseEffect\b[^'"]*?from\s+['"]react['"]/.test(content);
    if (!importedFromReact) {
      issues.push({ file, type: 'missing useEffect import' });
    }
  }
  // Also check useState, useMemo, useCallback, useRef
  for (const hook of ['useState', 'useMemo', 'useCallback', 'useRef']) {
    const regex = new RegExp(`\\b${hook}\\s*\\(`);
    if (regex.test(content)) {
      const hookImported = new RegExp(`import\\s+[^'"]*?\\b${hook}\\b[^'"]*?from\\s+['"]react['"]`).test(content);
      if (!hookImported) {
        issues.push({ file, type: `missing ${hook} import` });
      }
    }
  }
}

console.log(JSON.stringify(issues, null, 2));

