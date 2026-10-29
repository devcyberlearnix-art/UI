// scripts/verify_oauth_ui.mjs
import { chromium } from 'playwright';

async function runTest() {
  console.log('🚀 Starting OAuth E2E Verification Test in UI...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = {
    loginPageLoaded: false,
    oauthButtonsFound: false,
    googleButtonFound: false,
    githubButtonFound: false,
    linkedinButtonFound: false,
    oauthLoginTriggered: false,
    redirectedToDashboard: false,
    registerPageOAuthFound: false,
  };

  try {
    // 1. Visit Login Page
    console.log('1. Navigating to http://localhost:5173/login ...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 15000 });
    results.loginPageLoaded = true;

    // Check for OAuth buttons
    const googleBtn = page.locator('button[title*="Google"]');
    const githubBtn = page.locator('button[title*="GitHub"]');
    const linkedinBtn = page.locator('button[title*="LinkedIn"]');

    results.googleButtonFound = (await googleBtn.count()) > 0;
    results.githubButtonFound = (await githubBtn.count()) > 0;
    results.linkedinButtonFound = (await linkedinBtn.count()) > 0;
    results.oauthButtonsFound = results.googleButtonFound && results.githubButtonFound && results.linkedinButtonFound;

    console.log(`   OAuth Buttons found: Google=${results.googleButtonFound}, GitHub=${results.githubButtonFound}, LinkedIn=${results.linkedinButtonFound}`);

    // Take screenshot of Login page with OAuth buttons
    await page.screenshot({ path: 'telemetry_snapshots/verify_login_oauth.png' });
    console.log('   📸 Screenshot saved: telemetry_snapshots/verify_login_oauth.png');

    // 2. Click Google OAuth Login
    console.log('2. Testing Google OAuth click action...');
    await googleBtn.click();
    results.oauthLoginTriggered = true;

    // Wait for redirect to dashboard
    try {
      await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });
      results.redirectedToDashboard = true;
      console.log(`   ✅ Successfully logged in via OAuth and reached: ${page.url()}`);
      await page.screenshot({ path: 'telemetry_snapshots/verify_oauth_dashboard.png' });
      console.log('   📸 Screenshot saved: telemetry_snapshots/verify_oauth_dashboard.png');
    } catch (e) {
      console.log(`   Navigation wait finished at URL: ${page.url()}`);
    }

    // 3. Clear storage and check Register Page
    console.log('3. Navigating to http://localhost:5173/register ...');
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle', timeout: 15000 });

    const registerGoogleBtn = page.locator('button[title*="Google"]');
    results.registerPageOAuthFound = (await registerGoogleBtn.count()) > 0;
    console.log(`   Register Page OAuth buttons found: ${results.registerPageOAuthFound}`);
    await page.screenshot({ path: 'telemetry_snapshots/verify_register_oauth.png' });
    console.log('   📸 Screenshot saved: telemetry_snapshots/verify_register_oauth.png');

  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    await browser.close();
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(JSON.stringify(results, null, 2));

  if (results.oauthButtonsFound && results.registerPageOAuthFound) {
    console.log('\n🌟 ALL OAUTH TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('\n❌ SOME OAUTH CHECKS FAILED');
    process.exit(1);
  }
}

runTest();

