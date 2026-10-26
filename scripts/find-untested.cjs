const fs = require('fs');
const inv = require('./extracted_inventory.json');
const results = require('./api-functional-verification-results.json');

const testedEndpoints = new Set(results.scenarios.map(s => `${s.method} ${s.endpoint.toLowerCase()}`));

console.log('Total in inventory:', inv.length);
console.log('Total tested scenario entries:', results.scenarios.length);

const matched = [];
const unmatched = [];

for (const item of inv) {
  const normPath = item.path.toLowerCase()
    .replace(/\{[^}]+\}/g, '{id}')
    .replace(/\/\d+/g, '/{id}');
  
  let found = false;
  for (const s of results.scenarios) {
    const sNorm = s.endpoint.toLowerCase()
      .replace(/\{[^}]+\}/g, '{id}')
      .replace(/\/[0-9a-fA-F-]{36}/g, '/{id}')
      .replace(/\/\d+/g, '/{id}');
    if (s.method.toUpperCase() === item.method.toUpperCase() && (sNorm === normPath || sNorm.includes(normPath) || normPath.includes(sNorm))) {
      found = true;
      break;
    }
  }
  if (found) {
    matched.push(item);
  } else {
    unmatched.push(item);
  }
}

console.log('Matched in tests:', matched.length);
console.log('Unmatched (Untested from Inventory):', unmatched.length);
unmatched.forEach((u, i) => console.log(`${i+1}. [${u.service}] ${u.method} ${u.path} (${u.name}) - Auth: ${u.auth}`));
