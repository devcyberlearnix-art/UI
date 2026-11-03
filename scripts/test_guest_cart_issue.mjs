import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const networkLogs = [];
  const consoleLogs = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('request', req => {
    networkLogs.push({ method: req.method(), url: req.url() });
  });

  page.on('response', res => {
    networkLogs.push({ status: res.status(), url: res.url() });
  });

  console.log('Navigating to http://localhost:4173/ as pure guest...');
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('=== CONSOLE LOGS ===');
  consoleLogs.forEach(l => console.log(`[${l.type}] ${l.text}`));

  console.log('=== NETWORK LOGS (filtered for /api/) ===');
  networkLogs.filter(n => n.url.includes('/api/')).forEach(n => console.log(JSON.stringify(n)));

  await browser.close();
}

run().catch(console.error);

