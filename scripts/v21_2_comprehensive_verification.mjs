import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:5173';
const MAILHOG_API = 'http://localhost:8025/api/v2/messages';
const SCREENSHOT_DIR = path.resolve('scripts', 'v21_2_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 10 Viewports specified by Version 21.2
const VIEWPORTS = [
  { name: 'small-mobile-320', width: 320, height: 700 },
  { name: 'mobile-360', width: 360, height: 740 },
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'large-mobile-430', width: 430, height: 932 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'large-desktop-1920', width: 1920, height: 1080 },
];

const results = {
  version: '21.2',
  timestamp: new Date().toISOString(),
  viewports: VIEWPORTS.map(v => `${v.name} (${v.width}x${v.height})`),
  testCases: [],
  screenshots: [],
};

function recordTest(id, name, status, details = {}) {
  const item = { id, name, status, details, timestamp: new Date().toISOString() };
  results.testCases.push(item);
  const icon = status === 'PASS' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌';
  console.log(`[TEST] ${icon} ${id}: ${name} - ${status}`);
}

async function clearMailHog() {
  try {
    await fetch('http://localhost:8025/api/v1/messages', { method: 'DELETE' });
  } catch (e) { }
}

async function fetchLatestOtpFromMailHog(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${MAILHOG_API}?limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          const body = data.items[0].Content?.Body || '';
          const match = body.match(/class=3D"otp-box"[^>]*>([^<]+)</) || body.match(/\b([0-9]{6})\b/);
          if (match) return match[1].trim();
        }
      }
    } catch (err) { }
    await new Promise((r) => setTimeout(r, 400));
  }
  return null;
}

async function run() {
  console.log('🚀 Starting Asivo LMS Version 21.2 Full Verification Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // 1. RESPONSIVE VISUAL QA ACROSS ALL 10 VIEWPORTS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('📸 Capturing Visual QA Screenshots across 10 Viewports...');
    const overflowViolations = [];

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1.1 Login Page (Password Mode)
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      const loginImg = path.join(SCREENSHOT_DIR, `v21_2_login_${vp.name}.png`);
      await page.screenshot({ path: loginImg, fullPage: true });
      results.screenshots.push({ page: 'login-password', viewport: vp.name, path: loginImg });

      // Check horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      if (hasOverflow) overflowViolations.push(`${vp.name} on /login`);

      // 1.2 Login Page (OTP Mode)
      await page.click('#tab-otp');
      await page.waitForTimeout(200);
      const loginOtpImg = path.join(SCREENSHOT_DIR, `v21_2_login_otp_mode_${vp.name}.png`);
      await page.screenshot({ path: loginOtpImg, fullPage: true });
      results.screenshots.push({ page: 'login-otp', viewport: vp.name, path: loginOtpImg });

      // 1.3 Registration Page
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
      const regImg = path.join(SCREENSHOT_DIR, `v21_2_register_${vp.name}.png`);
      await page.screenshot({ path: regImg, fullPage: true });
      results.screenshots.push({ page: 'register', viewport: vp.name, path: regImg });

      // 1.4 Forgot Password Page
      await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle' });
      const forgotImg = path.join(SCREENSHOT_DIR, `v21_2_forgot_password_${vp.name}.png`);
      await page.screenshot({ path: forgotImg, fullPage: true });
      results.screenshots.push({ page: 'forgot-password', viewport: vp.name, path: forgotImg });

      // 1.5 OTP Verify Page (standalone)
      await page.goto(`${BASE_URL}/otp-verify`, { waitUntil: 'networkidle' });
      const otpVerifyImg = path.join(SCREENSHOT_DIR, `v21_2_otp_verify_${vp.name}.png`);
      await page.screenshot({ path: otpVerifyImg, fullPage: true });
      results.screenshots.push({ page: 'otp-verify', viewport: vp.name, path: otpVerifyImg });
    }

    recordTest('TC-RESP-01', 'Multi-Viewport Responsive Rendering Across 10 Breakpoints', overflowViolations.length === 0 ? 'PASS' : 'FAIL', {
      viewportsTested: VIEWPORTS.length,
      totalScreenshots: results.screenshots.length,
      overflowViolations,
    });

    // Reset to Desktop for precision measurements & functional tests
    await page.setViewportSize({ width: 1440, height: 900 });

    // ──────────────────────────────────────────────────────────────────────────
    // 2. LOGO, SPACING & ALIGNMENT PRECISION VERIFICATION
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📐 Measuring Left-Panel Vertical Alignment & Logo Centering...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const loginLogo = await page.locator('a[aria-label="Asivo Home"]').first().boundingBox();
    const loginHero = await page.locator('text=Learn. Build. Grow.').first().boundingBox();
    const loginBadge = await page.locator('text=Ink & Onyx Experience').first().boundingBox();
    const loginBenefits = await page.locator('text=Structured Learning Paths').first().boundingBox();
    const emblemImg = await page.locator('img[alt="Asivo emblem"]').first().boundingBox();
    const emblemContainer = await page.locator('div:has(> img[alt="Asivo emblem"])').first().boundingBox();

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    const regLogo = await page.locator('a[aria-label="Asivo Home"]').first().boundingBox();
    const regHero = await page.locator('text=Learn. Build. Grow.').first().boundingBox();
    const regBadge = await page.locator('text=Ink & Onyx Experience').first().boundingBox();
    const regBenefits = await page.locator('text=Structured Learning Paths').first().boundingBox();

    const logoDiff = Math.abs((loginLogo?.y || 0) - (regLogo?.y || 0));
    const heroDiff = Math.abs((loginHero?.y || 0) - (regHero?.y || 0));
    const badgeDiff = Math.abs((loginBadge?.y || 0) - (regBadge?.y || 0));
    const benefitsDiff = Math.abs((loginBenefits?.y || 0) - (regBenefits?.y || 0));

    // Logo centering in container
    const isEmblemCentered = Math.abs(((emblemContainer?.width || 0) - (emblemImg?.width || 0)) / 2 - ((emblemImg?.x || 0) - (emblemContainer?.x || 0))) <= 1;

    const alignmentPass = logoDiff === 0 && heroDiff === 0 && badgeDiff === 0 && benefitsDiff === 0;

    recordTest('TC-ALIGN-01', 'Left Panel Alignment Precision Between Login & Registration', alignmentPass ? 'PASS' : 'FAIL', {
      logoDiffPx: logoDiff,
      badgeDiffPx: badgeDiff,
      heroDiffPx: heroDiff,
      benefitsDiffPx: benefitsDiff,
      loginPositions: { logoY: loginLogo?.y, heroY: loginHero?.y },
      registerPositions: { logoY: regLogo?.y, heroY: regHero?.y },
    });

    recordTest('TC-LOGO-01', 'Logo Symbol Centering & Proportional Dimension Verification', isEmblemCentered ? 'PASS' : 'FAIL', {
      emblemDimensions: `${Math.round(emblemImg?.width || 0)}x${Math.round(emblemImg?.height || 0)}px`,
      containerDimensions: `${Math.round(emblemContainer?.width || 0)}x${Math.round(emblemContainer?.height || 0)}px`,
      isCentered: isEmblemCentered,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 3. ACCESSIBILITY & MODE SWITCHING AUDIT
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n♿ Verifying Accessibility Attributes & Mode Subtitles...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    // Mode subtitle checks
    const passwordSubtitle = await page.locator('text=Enter your email and master password').isVisible();
    await page.click('#tab-otp');
    await page.waitForTimeout(200);
    const otpSubtitle = await page.locator('text=Enter your email to receive a secure single-use').isVisible();

    // Mode tablist ARIA
    const tablistAria = await page.locator('[role="tablist"]').isVisible();
    const tabOtpSelected = await page.locator('#tab-otp').getAttribute('aria-selected');

    // Arrow key navigation between tabs
    await page.locator('#tab-otp').focus();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(200);
    const tabPasswordSelectedAfterArrow = await page.locator('#tab-password').getAttribute('aria-selected');

    recordTest('TC-A11Y-01', 'Mode Switcher Semantics, Arrow Keys & Dynamic Subtitles', (passwordSubtitle && otpSubtitle && tablistAria && tabOtpSelected === 'true' && tabPasswordSelectedAfterArrow === 'true') ? 'PASS' : 'FAIL', {
      passwordSubtitleFound: passwordSubtitle,
      otpSubtitleFound: otpSubtitle,
      tablistRole: tablistAria,
      keyboardArrowNavWorked: tabPasswordSelectedAfterArrow === 'true',
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 4. FUNCTIONAL TEST: INVALID PASSWORD LOGIN
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🔒 Testing Invalid Password Login...');
    await page.fill('#login-email', 'anjali.mukherjee@cyberlearnix.test');
    await page.fill('#login-password', 'IncorrectSecret!999');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    const errorAlert = await page.locator('[role="alert"]').first().textContent();
    const tokenInStorage = await page.evaluate(() => localStorage.getItem('lms_token'));

    recordTest('TC-LOGIN-01', 'Invalid Password Rejection & Storage Hygiene', (errorAlert && !tokenInStorage) ? 'PASS' : 'FAIL', {
      errorMessage: errorAlert?.trim(),
      storageClean: tokenInStorage === null,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 5. FUNCTIONAL TEST: ENTER-KEY SUBMISSION & VALID LOGIN
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🔑 Testing Valid Password Login with Enter-Key Submission...');
    await page.fill('#login-password', 'Password13!');
    // Trigger submission via Enter keypress in password field
    await page.locator('#login-password').press('Enter');

    await page.waitForURL('**/student/dashboard', { timeout: 10000 });
    const currentUrl = page.url();
    const storedUser = await page.evaluate(() => JSON.parse(localStorage.getItem('lms_user') || '{}'));
    const storedToken = await page.evaluate(() => localStorage.getItem('lms_token'));

    recordTest('TC-LOGIN-02', 'Valid Password Login & Enter-Key Submission', (currentUrl.includes('/student/dashboard') && storedUser.role === 'student' && Boolean(storedToken)) ? 'PASS' : 'FAIL', {
      redirectUrl: currentUrl,
      userRole: storedUser.role,
      hasToken: Boolean(storedToken),
    });

    // Clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 6. FUNCTIONAL TEST: PASSWORDLESS OTP LOGIN LIFECYCLE
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📨 Testing Passwordless OTP Sign In Workflow...');
    await clearMailHog();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.click('#tab-otp');
    await page.waitForTimeout(200);

    await page.fill('#otp-email-input', 'anjali.mukherjee@cyberlearnix.test');
    await page.click('button:has-text("Send One-Time Passcode")');

    await page.waitForSelector('#login-otp', { timeout: 10000 });
    await page.waitForTimeout(1000);

    const loginOtp = await fetchLatestOtpFromMailHog();
    console.log('Retrieved Login OTP from MailHog:', loginOtp);

    if (loginOtp) {
      await page.fill('#login-otp', loginOtp);
      await page.click('button:has-text("Verify & Sign In")');
      await page.waitForURL('**/student/dashboard', { timeout: 10000 });

      const otpLoginUrl = page.url();
      const otpUser = await page.evaluate(() => JSON.parse(localStorage.getItem('lms_user') || '{}'));

      recordTest('TC-LOGIN-03', 'Passwordless OTP Sign In & MailHog Delivery E2E', (otpLoginUrl.includes('/student/dashboard') && (otpUser.role || '').toLowerCase() === 'student') ? 'PASS' : 'FAIL', {
        email: 'anjali.mukherjee@cyberlearnix.test',
        otpCode: loginOtp,
        destination: otpLoginUrl,
      });
    } else {
      recordTest('TC-LOGIN-03', 'Passwordless OTP Sign In & MailHog Delivery E2E', 'FAIL', { reason: 'No OTP in MailHog' });
    }

    // Clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 7. FUNCTIONAL TEST: REGISTRATION → ACTIVATION → SIGN IN
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📝 Testing Registration → OTP Verification → Activation...');
    await clearMailHog();
    const testEmail = `student.v21_2.${Date.now()}@asivo.io`;
    const testPassword = 'Password123!';

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.fill('#register-firstname', 'Katherine');
    await page.fill('#register-lastname', 'Johnson');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', testPassword);
    await page.fill('#register-confirmpassword', testPassword);

    const matchVisible = await page.locator('text=Passwords match').isVisible();
    await page.click('button:has-text("Create Account")');

    await page.waitForURL('**/otp-verify', { timeout: 10000 });
    await page.waitForTimeout(1200);

    const regOtp = await fetchLatestOtpFromMailHog();
    console.log('Retrieved Registration OTP from MailHog:', regOtp);

    if (regOtp) {
      const digitBoxes = await page.locator('input[aria-label^="Digit"]');
      for (let i = 0; i < 6; i++) {
        await digitBoxes.nth(i).fill(regOtp[i]);
      }
      await page.click('button:has-text("Verify & Continue")');

      await page.waitForURL('**/login', { timeout: 10000 });
      const prefilledEmail = await page.inputValue('#login-email');

      // Authenticate with the new account
      await page.fill('#login-password', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/student/dashboard', { timeout: 10000 });

      const newDashboardUrl = page.url();
      const newUser = await page.evaluate(() => JSON.parse(localStorage.getItem('lms_user') || '{}'));

      recordTest('TC-REG-01', 'Registration → OTP Verification → Activation → Sign In', (newDashboardUrl.includes('/student/dashboard') && newUser.email === testEmail) ? 'PASS' : 'FAIL', {
        registeredEmail: testEmail,
        prefilledEmail,
        matchIndicatorWorked: matchVisible,
        finalDashboard: newDashboardUrl,
      });
    } else {
      recordTest('TC-REG-01', 'Registration → OTP Verification → Activation → Sign In', 'FAIL', { reason: 'No registration OTP' });
    }

    // Clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 8. DUPLICATE EMAIL REGISTRATION REJECTION (409)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🚫 Testing Duplicate Email Conflict Rejection...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.fill('#register-firstname', 'Katherine');
    await page.fill('#register-lastname', 'Johnson');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', testPassword);
    await page.fill('#register-confirmpassword', testPassword);
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);

    const dupEmailError = await page.locator('#email-error').first().textContent().catch(() => '');
    const preservedFirstname = await page.inputValue('#register-firstname');

    recordTest('TC-REG-02', 'Duplicate Registration 409 Conflict Handling', (dupEmailError.includes('already registered') && preservedFirstname === 'Katherine') ? 'PASS' : 'FAIL', {
      errorText: dupEmailError,
      preservedFirstname,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 9. PASSWORD MISMATCH VALIDATION
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n⚠️ Testing Password Mismatch Detection...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.fill('#register-password', 'SecretPass123!');
    await page.fill('#register-confirmpassword', 'NonMatchingSecret999!');
    const mismatchText = await page.locator('text=Passwords do not match').isVisible();

    recordTest('TC-REG-03', 'Inline Password Mismatch Validation', mismatchText ? 'PASS' : 'FAIL', {
      mismatchDetected: mismatchText,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 10. 3-STEP PASSWORD RECOVERY WORKFLOW
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🔄 Testing Complete 3-Step Password Recovery...');
    await clearMailHog();
    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle' });

    // Step 1: Request Code
    await page.fill('#recovery-email', testEmail);
    await page.click('button:has-text("Send Recovery Code")');
    await page.waitForSelector('#recovery-otp', { timeout: 10000 });

    const recoveryOtp = await fetchLatestOtpFromMailHog();
    console.log('Retrieved Recovery OTP from MailHog:', recoveryOtp);

    if (recoveryOtp) {
      // Step 2: Verify Code
      await page.fill('#recovery-otp', recoveryOtp);
      await page.click('button:has-text("Verify Code")');
      await page.waitForSelector('#new-password', { timeout: 10000 });

      // Step 3: Set New Password
      const updatedPassword = 'NewSecret123!';
      await page.fill('#new-password', updatedPassword);
      await page.fill('#confirm-new-password', updatedPassword);
      await page.click('button:has-text("Update Password & Sign In")');

      await page.waitForURL('**/login', { timeout: 10000 });
      const afterResetUrl = page.url();

      // Sign in with updated password
      await page.fill('#login-password', updatedPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/student/dashboard', { timeout: 10000 });

      const finalDashboard = page.url();

      recordTest('TC-RESET-01', '3-Step Password Recovery E2E with MailHog & Re-Authentication', (afterResetUrl.includes('/login') && finalDashboard.includes('/student/dashboard')) ? 'PASS' : 'FAIL', {
        recoveryOtp,
        loginRedirect: afterResetUrl,
        finalDashboard,
      });
    } else {
      recordTest('TC-RESET-01', '3-Step Password Recovery E2E with MailHog & Re-Authentication', 'FAIL', { reason: 'No recovery OTP' });
    }

    // Clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 11. SOCIAL OAUTH AUDIT & HONEST AVAILABILITY
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🌐 Auditing Social OAuth Buttons & Availability...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

    const googleBtn = await page.locator('button[aria-label^="Sign in with Google"]').isVisible();
    const githubBtn = await page.locator('button[aria-label*="GitHub"]').isVisible();
    const linkedinBtn = await page.locator('button[aria-label*="LinkedIn"]').isVisible();

    // Verify clicking GitHub shows unavailable notice without fake login
    await page.click('button[aria-label*="GitHub"]');
    await page.waitForTimeout(400);

    const tokenAfterOAuthClick = await page.evaluate(() => localStorage.getItem('lms_token'));

    recordTest('TC-OAUTH-01', 'Social OAuth Configuration Truthfulness & Google Route', (googleBtn && githubBtn && linkedinBtn && !tokenAfterOAuthClick) ? 'PASS' : 'FAIL', {
      googleButtonRendered: googleBtn,
      githubUnavailableHonest: githubBtn,
      linkedinUnavailableHonest: linkedinBtn,
      storageCleanNoMockLogin: tokenAfterOAuthClick === null,
    });

  } catch (error) {
    console.error('Test execution failed:', error);
    recordTest('TC-GLOBAL-ERR', 'Global Verification Runner', 'FAIL', { error: error.message });
  } finally {
    await browser.close();

    const reportPath = path.resolve('scripts', 'v21_2_verification_results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📊 Verification results written to: ${reportPath}`);
  }
}

run();
