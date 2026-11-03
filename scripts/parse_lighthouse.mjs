import fs from 'fs';

const html = fs.readFileSync('localhost_2026-11-01_00-07-06.report.html', 'utf8');
const match = html.match(/window\.__LIGHTHOUSE_JSON__\s*=\s*(\{.*?\});<\/script>/s);
if (!match) {
  console.log('Could not find embedded __LIGHTHOUSE_JSON__');
  process.exit(1);
}

const report = JSON.parse(match[1]);
fs.writeFileSync('scripts/lighthouse-report.json', JSON.stringify(report, null, 2));

const categories = report.categories;
console.log('=== OFFICIAL LIGHTHOUSE SCORES ===');
for (const [k, v] of Object.entries(categories)) {
  console.log(`${v.title.padEnd(20)}: ${Math.round(v.score * 100)} / 100`);
}
const audits = report.audits;
console.log('\n=== CORE WEB VITALS & METRICS ===');
console.log('First Contentful Paint (FCP) : ', audits['first-contentful-paint']?.displayValue, `(${audits['first-contentful-paint']?.numericValue?.toFixed(1)} ms)`);
console.log('Largest Contentful Paint (LCP): ', audits['largest-contentful-paint']?.displayValue, `(${audits['largest-contentful-paint']?.numericValue?.toFixed(1)} ms)`);
console.log('Cumulative Layout Shift (CLS) : ', audits['cumulative-layout-shift']?.displayValue, `(${audits['cumulative-layout-shift']?.numericValue?.toFixed(4)})`);
console.log('Total Blocking Time (TBT)     : ', audits['total-blocking-time']?.displayValue, `(${audits['total-blocking-time']?.numericValue?.toFixed(1)} ms)`);
console.log('Speed Index                   : ', audits['speed-index']?.displayValue, `(${audits['speed-index']?.numericValue?.toFixed(1)} ms)`);
console.log('Interactive (TTI)             : ', audits['interactive']?.displayValue, `(${audits['interactive']?.numericValue?.toFixed(1)} ms)`);
