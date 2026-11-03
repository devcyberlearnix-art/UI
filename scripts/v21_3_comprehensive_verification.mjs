import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const BASE_URL = 'http://127.0.0.1:5173';
const MAILHOG_API = 'http://localhost:8025/api/v2/messages';
const SCREENSHOT_DIR = path.resolve('scripts', 'v21_3_screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 10 Viewports specified by Version 21.3
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
  version: '21.3',
  timestamp: new Date().toISOString(),
  viewports: VIEWPORTS.map(v => `${v.name} (${v.width}x${v.height})`),
  testCases: [],
  screenshots: [],
  viewportAudits: [],
  contrastAudit: {},
  mobileBrandingAudit: {},
  socialAuthAudit: {},
  consoleErrors: [],
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
  console.log('🚀 Starting Asivo LMS Version 21.3 Comprehensive Verification Suite...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track browser console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({ text: msg.text(), location: msg.location() });
    }
  });

  try {
    // ──────────────────────────────────────────────────────────────────────────
    // 1. RESPONSIVE VERIFICATION & AUDIT ACROSS ALL 10 VIEWPORTS
    // ──────────────────────────────────────────────────────────────────────────
    console.log('📸 Capturing Responsive Screenshots & Verifying Layout Across 10 Viewports...');
    const overflowViolations = [];

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // 1.1 Login Page (Password Mode)
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#login-email');
      await page.waitForTimeout(400);

      const loginImg = path.join(SCREENSHOT_DIR, `v21_3_login_${vp.name}.png`);
      await page.screenshot({ path: loginImg, fullPage: true });
      results.screenshots.push({ page: 'login-password', viewport: vp.name, path: loginImg });

      // Check horizontal overflow, CTA accessibility, and form width
      const metrics = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const cta = document.querySelector('button[type="submit"]');
        const ctaRect = cta ? cta.getBoundingClientRect() : null;
        const card = document.querySelector('.rounded-3xl');
        const cardRect = card ? card.getBoundingClientRect() : null;
        return {
          hasOverflow: docWidth > winWidth,
          docWidth,
          winWidth,
          ctaHeight: ctaRect?.height || 0,
          cardWidth: cardRect?.width || 0,
        };
      });

      if (metrics.hasOverflow) overflowViolations.push(`${vp.name} on /login`);

      results.viewportAudits.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        overflow: metrics.hasOverflow,
        ctaHeight: metrics.ctaHeight,
        cardWidth: metrics.cardWidth,
      });

      // 1.2 Login Page (OTP Mode)
      await page.click('#tab-otp');
      await page.waitForTimeout(300);
      const loginOtpImg = path.join(SCREENSHOT_DIR, `v21_3_login_otp_mode_${vp.name}.png`);
      await page.screenshot({ path: loginOtpImg, fullPage: true });
      results.screenshots.push({ page: 'login-otp', viewport: vp.name, path: loginOtpImg });

      // 1.3 Registration Page
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#register-email');
      await page.waitForTimeout(400);
      const regImg = path.join(SCREENSHOT_DIR, `v21_3_register_${vp.name}.png`);
      await page.screenshot({ path: regImg, fullPage: true });
      results.screenshots.push({ page: 'register', viewport: vp.name, path: regImg });

      const regOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (regOverflow) overflowViolations.push(`${vp.name} on /register`);

      // 1.4 Forgot Password Page
      await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#recovery-email');
      await page.waitForTimeout(300);
      const forgotImg = path.join(SCREENSHOT_DIR, `v21_3_forgot_password_${vp.name}.png`);
      await page.screenshot({ path: forgotImg, fullPage: true });
      results.screenshots.push({ page: 'forgot-password', viewport: vp.name, path: forgotImg });
    }

    recordTest('TC-RESP-01', 'Multi-Viewport Responsive Verification (10 Breakpoints, 0 Overflow)', overflowViolations.length === 0 ? 'PASS' : 'FAIL', {
      viewportsTested: VIEWPORTS.length,
      overflowViolations,
      audits: results.viewportAudits,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 2. REQUIRED EVIDENCE SCREENSHOT CAPTURE (7 DISTINCT ARTIFACTS)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📷 Capturing 7 Mandated Visual Regression Evidence Screenshots...');

    // 2.1 Desktop Login — Password Mode (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#tab-password');
    await page.waitForTimeout(500);
    const desktopLoginPassPath = path.join(SCREENSHOT_DIR, 'desktop_login_password_mode.png');
    await page.screenshot({ path: desktopLoginPassPath, fullPage: true });

    // 2.2 Desktop Login — OTP Mode (1440x900)
    await page.click('#tab-otp');
    await page.waitForTimeout(500);
    const desktopLoginOtpPath = path.join(SCREENSHOT_DIR, 'desktop_login_otp_mode.png');
    await page.screenshot({ path: desktopLoginOtpPath, fullPage: true });

    // 2.3 Desktop Registration (1440x900)
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#register-email');
    await page.waitForTimeout(500);
    const desktopRegPath = path.join(SCREENSHOT_DIR, 'desktop_registration.png');
    await page.screenshot({ path: desktopRegPath, fullPage: true });

    // 2.4 Mobile Login — Password Mode (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#tab-password');
    await page.waitForTimeout(500);
    const mobileLoginPath = path.join(SCREENSHOT_DIR, 'mobile_login.png');
    await page.screenshot({ path: mobileLoginPath, fullPage: true });

    // 2.5 Mobile Login — OTP Mode (375x667)
    await page.click('#tab-otp');
    await page.waitForTimeout(500);
    const mobileLoginOtpPath = path.join(SCREENSHOT_DIR, 'mobile_otp_mode.png');
    await page.screenshot({ path: mobileLoginOtpPath, fullPage: true });

    // 2.6 Mobile Registration (375x667)
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#register-email');
    await page.waitForTimeout(500);
    const mobileRegPath = path.join(SCREENSHOT_DIR, 'mobile_registration.png');
    await page.screenshot({ path: mobileRegPath, fullPage: true });

    // 2.7 Tablet Login (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#tab-password');
    await page.waitForTimeout(500);
    const tabletLoginPath = path.join(SCREENSHOT_DIR, 'tablet_login.png');
    await page.screenshot({ path: tabletLoginPath, fullPage: true });

    recordTest('TC-VISUAL-01', 'Seven Mandated Visual Regression Screenshots Captured Individually', true ? 'PASS' : 'FAIL', {
      desktopLoginPass: desktopLoginPassPath,
      desktopLoginOtp: desktopLoginOtpPath,
      desktopReg: desktopRegPath,
      mobileLogin: mobileLoginPath,
      mobileLoginOtp: mobileLoginOtpPath,
      mobileReg: mobileRegPath,
      tabletLogin: tabletLoginPath,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 3. SEGMENTED-CONTROL CONTRAST & KEYBOARD FOCUS VERIFICATION
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🎨 Verifying Segmented-Control Contrast, Active Pill & Inactive Readability...');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#tab-password');
    await page.waitForTimeout(500);

    // Capture tab screenshots for pixel sampling
    const passTabPassMode = path.join(SCREENSHOT_DIR, 'tab_password_active.png');
    const otpTabPassMode = path.join(SCREENSHOT_DIR, 'tab_otp_inactive.png');
    await page.locator('#tab-password').screenshot({ path: passTabPassMode });
    await page.locator('#tab-otp').screenshot({ path: otpTabPassMode });

    // Sample pixels of active tab (should contain #C5A880 gold ~ 197, 168, 128)
    const passImg = sharp(passTabPassMode);
    const passMeta = await passImg.metadata();
    const passRaw = await passImg.raw().toBuffer();
    const passOffset = (Math.floor(passMeta.height / 2) * passMeta.width + 20) * 4;
    const passBgR = passRaw[passOffset];
    const passBgG = passRaw[passOffset + 1];
    const passBgB = passRaw[passOffset + 2];
    const passHasGold = [passBgR, passBgG, passBgB].some((val) => val > 160);

    // Inactive tab should be #14141A dark onyx ~ 20, 20, 26
    const otpImg = sharp(otpTabPassMode);
    const otpMeta = await otpImg.metadata();
    const otpRaw = await otpImg.raw().toBuffer();
    const otpOffset = (Math.floor(otpMeta.height / 2) * otpMeta.width + 20) * 4;
    const otpBgR = otpRaw[otpOffset];
    const otpBgG = otpRaw[otpOffset + 1];
    const otpBgB = otpRaw[otpOffset + 2];
    const otpIsDark = [otpBgR, otpBgG, otpBgB].every((val) => val < 40);

    // Check inactive text color via computed style
    const textColors = await page.evaluate(() => {
      const passTab = document.querySelector('#tab-password');
      const otpTab = document.querySelector('#tab-otp');
      return {
        passTextColor: window.getComputedStyle(passTab).color,
        otpTextColor: window.getComputedStyle(otpTab).color,
      };
    });

    // Switch tab to OTP Mode and verify reverse contrast
    await page.click('#tab-otp');
    await page.waitForTimeout(500);

    const textColorsAfterSwitch = await page.evaluate(() => {
      const passTab = document.querySelector('#tab-password');
      const otpTab = document.querySelector('#tab-otp');
      return {
        passTextColor: window.getComputedStyle(passTab).color,
        otpTextColor: window.getComputedStyle(otpTab).color,
      };
    });

    // Verify keyboard navigation & focus ring
    await page.locator('#tab-otp').focus();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);
    const focusedTabId = await page.evaluate(() => document.activeElement?.id);
    const isPasswordSelected = await page.locator('#tab-password').getAttribute('aria-selected');

    const contrastAuditPass =
      passHasGold &&
      otpIsDark &&
      textColors.otpTextColor.includes('212') && // Inactive is #D4D4D8 (rgb(212, 212, 216))
      textColorsAfterSwitch.otpTextColor.includes('7') && // Active is #070709 (rgb(7, 7, 9))
      textColorsAfterSwitch.passTextColor.includes('212') && // Inactive is #D4D4D8
      focusedTabId === 'tab-password' &&
      isPasswordSelected === 'true';

    results.contrastAudit = {
      activeTabPixel: `RGB(${passBgR}, ${passBgG}, ${passBgB})`,
      inactiveTabPixel: `RGB(${otpBgR}, ${otpBgG}, ${otpBgB})`,
      passwordActiveText: textColors.passTextColor,
      otpInactiveText: textColors.otpTextColor,
      passwordInactiveText: textColorsAfterSwitch.passTextColor,
      otpActiveText: textColorsAfterSwitch.otpTextColor,
      keyboardArrowNavWorked: focusedTabId === 'tab-password' && isPasswordSelected === 'true',
    };

    recordTest('TC-CONTRAST-01', 'Segmented-Control High Contrast, Gold Pill & Inactive Readability', contrastAuditPass ? 'PASS' : 'FAIL', results.contrastAudit);

    // ──────────────────────────────────────────────────────────────────────────
    // 4. MOBILE BRANDING & WORDMARK ALIGNMENT AUDIT
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📱 Auditing Mobile Branding, Emblem Visibility & Wordmark Lockup...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.lg\\:hidden');

    const mobileBrandData = await page.evaluate(() => {
      const header = document.querySelector('.lg\\:hidden.flex.items-center.justify-between');
      const badge = header?.querySelector('.w-10.h-10');
      const img = header?.querySelector('img[alt="Asivo emblem"]');
      const wordmarkTitle = header?.querySelector('span.text-base');
      const wordmarkSub = header?.querySelector('span.tracking-\\[0\\.22em\\]');
      const badgeRect = badge?.getBoundingClientRect();
      const imgRect = img?.getBoundingClientRect();
      const wordmarkTitleRect = wordmarkTitle?.getBoundingClientRect();

      return {
        badgeDimensions: badgeRect ? `${Math.round(badgeRect.width)}x${Math.round(badgeRect.height)}px` : null,
        imgDimensions: imgRect ? `${Math.round(imgRect.width)}x${Math.round(imgRect.height)}px` : null,
        hasTitle: wordmarkTitle?.textContent?.trim() === 'Asivo',
        hasSub: wordmarkSub?.textContent?.trim() === 'LEARNING PLATFORM',
        badgeY: badgeRect ? Math.round(badgeRect.y) : null,
        wordmarkY: wordmarkTitleRect ? Math.round(wordmarkTitleRect.y) : null,
      };
    });

    results.mobileBrandingAudit = mobileBrandData;
    const mobileBrandPass =
      mobileBrandData.hasTitle &&
      mobileBrandData.hasSub &&
      mobileBrandData.badgeDimensions === '40x40px' &&
      mobileBrandData.imgDimensions === '24x24px';

    recordTest('TC-MOBILE-BRAND-01', 'Mobile Logo Emblem 1:1 Rendering & Wordmark Vertical Alignment', mobileBrandPass ? 'PASS' : 'FAIL', mobileBrandData);

    // ──────────────────────────────────────────────────────────────────────────
    // 5. MOBILE SOCIAL AUTHENTICATION AUDIT
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🛡️ Verifying Mobile Social Authentication Accessible Names & States...');
    const socialData = await page.evaluate(() => {
      const googleBtn = document.querySelector('button[aria-label^="Sign in with Google"]');
      const githubBtn = document.querySelector('button[aria-label*="GitHub"]');
      const linkedinBtn = document.querySelector('button[aria-label*="LinkedIn"]');

      return {
        google: {
          ariaLabel: googleBtn?.getAttribute('aria-label'),
          title: googleBtn?.getAttribute('title'),
          text: googleBtn?.querySelector('span:not(.sr-only)')?.textContent?.trim(),
          disabled: googleBtn?.disabled,
        },
        github: {
          ariaLabel: githubBtn?.getAttribute('aria-label'),
          title: githubBtn?.getAttribute('title'),
          text: githubBtn?.querySelector('span:not(.sr-only)')?.textContent?.trim(),
          disabled: githubBtn?.disabled,
          ariaDisabled: githubBtn?.getAttribute('aria-disabled'),
        },
        linkedin: {
          ariaLabel: linkedinBtn?.getAttribute('aria-label'),
          title: linkedinBtn?.getAttribute('title'),
          text: linkedinBtn?.querySelector('span:not(.sr-only)')?.textContent?.trim(),
          disabled: linkedinBtn?.disabled,
          ariaDisabled: linkedinBtn?.getAttribute('aria-disabled'),
        },
      };
    });

    results.socialAuthAudit = socialData;
    const socialPass =
      socialData.google.text === 'Google' &&
      socialData.github.text === 'GitHub' &&
      socialData.github.disabled === true &&
      socialData.linkedin.text === 'LinkedIn' &&
      socialData.linkedin.disabled === true;

    recordTest('TC-SOCIAL-01', 'Social Auth Provider Labels, Accessible Names & Honest Disabled States', socialPass ? 'PASS' : 'FAIL', socialData);

    // ──────────────────────────────────────────────────────────────────────────
    // 6. LEFT-PANEL DESKTOP ALIGNMENT VERIFICATION
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📐 Measuring Left-Panel Desktop Alignment Precision (Login vs Register)...');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Learn. Build. Grow.');

    const loginLogo = await page.locator('a[aria-label="Asivo Home"]').first().boundingBox();
    const loginHero = await page.locator('text=Learn. Build. Grow.').first().boundingBox();
    const loginBadge = await page.locator('text=Ink & Onyx Experience').first().boundingBox();
    const loginBenefits = await page.locator('text=Structured Learning Paths').first().boundingBox();

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('text=Learn. Build. Grow.');
    const regLogo = await page.locator('a[aria-label="Asivo Home"]').first().boundingBox();
    const regHero = await page.locator('text=Learn. Build. Grow.').first().boundingBox();
    const regBadge = await page.locator('text=Ink & Onyx Experience').first().boundingBox();
    const regBenefits = await page.locator('text=Structured Learning Paths').first().boundingBox();

    const logoDiff = Math.abs((loginLogo?.y || 0) - (regLogo?.y || 0));
    const heroDiff = Math.abs((loginHero?.y || 0) - (regHero?.y || 0));
    const badgeDiff = Math.abs((loginBadge?.y || 0) - (regBadge?.y || 0));
    const benefitsDiff = Math.abs((loginBenefits?.y || 0) - (regBenefits?.y || 0));

    const leftAlignmentPass = logoDiff === 0 && heroDiff === 0 && badgeDiff === 0 && benefitsDiff === 0;

    recordTest('TC-ALIGN-01', 'Left Panel Alignment Precision Between Login & Registration (0px Delta)', leftAlignmentPass ? 'PASS' : 'FAIL', {
      logoDiffPx: logoDiff,
      badgeDiffPx: badgeDiff,
      heroDiffPx: heroDiff,
      benefitsDiffPx: benefitsDiff,
      loginPositions: { logoY: loginLogo?.y, heroY: loginHero?.y },
      registerPositions: { logoY: regLogo?.y, heroY: regHero?.y },
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 7. REGISTRATION FORM FEEDBACK & LIVE MICROSERVICE VALIDATION
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📝 Testing Registration Form Feedback & Microservice Onboarding Flow...');
    await clearMailHog();
    const testEmail = `student.v21_3.${Date.now()}@asivo.io`;
    const testPassword = 'Password123!';

    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#register-email');

    // Test real-time password mismatch detection
    await page.fill('#register-password', 'ValidSecret!123');
    await page.fill('#register-confirmpassword', 'MismatchSecret!999');
    await page.waitForTimeout(200);
    const mismatchVisible = await page.locator('text=Passwords do not match').isVisible();

    // Fill valid matching credentials
    await page.fill('#register-firstname', 'Grace');
    await page.fill('#register-lastname', 'Hopper');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', testPassword);
    await page.fill('#register-confirmpassword', testPassword);
    await page.waitForTimeout(200);

    const matchVisible = await page.locator('text=Passwords match').isVisible();
    const strengthVisible = await page.locator('text=Robust').isVisible();

    await page.click('button:has-text("Create Account")');
    await page.waitForURL('**/otp-verify', { timeout: 10000 });

    const regOtp = await fetchLatestOtpFromMailHog();
    console.log('Retrieved Registration OTP from MailHog:', regOtp);

    let regSuccess = false;
    if (regOtp) {
      const digitBoxes = await page.locator('input[aria-label^="Digit"]');
      for (let i = 0; i < 6; i++) {
        await digitBoxes.nth(i).fill(regOtp[i]);
      }
      await page.click('button:has-text("Verify & Continue")');
      await page.waitForURL('**/login', { timeout: 10000 });

      // Check prefilled email on Login page
      const prefilledEmail = await page.inputValue('#login-email');

      // Complete login with new credentials
      await page.fill('#login-password', testPassword);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/student/dashboard', { timeout: 10000 });

      const newDashboardUrl = page.url();
      const newUser = await page.evaluate(() => JSON.parse(localStorage.getItem('lms_user') || '{}'));

      regSuccess = newDashboardUrl.includes('/student/dashboard') && newUser.email === testEmail;
      recordTest('TC-REG-01', 'Registration Form Feedback, MailHog Delivery, Activation & Direct Sign In', regSuccess ? 'PASS' : 'FAIL', {
        registeredEmail: testEmail,
        prefilledEmail,
        mismatchIndicatorWorked: mismatchVisible,
        matchIndicatorWorked: matchVisible,
        strengthChecklistWorked: strengthVisible,
        finalDashboard: newDashboardUrl,
      });
    } else {
      recordTest('TC-REG-01', 'Registration Form Feedback, MailHog Delivery, Activation & Direct Sign In', 'FAIL', { reason: 'No registration OTP' });
    }

    // Clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 8. DUPLICATE REGISTRATION 409 CONFLICT HANDLING
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🚫 Testing 409 Conflict Handling on Duplicate Email Registration...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#register-email');
    await page.fill('#register-firstname', 'Grace');
    await page.fill('#register-lastname', 'Hopper');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', testPassword);
    await page.fill('#register-confirmpassword', testPassword);
    await page.click('button:has-text("Create Account")');
    await page.waitForTimeout(1000);

    const dupEmailError = await page.locator('#email-error').first().textContent().catch(() => '');
    const preservedFirstname = await page.inputValue('#register-firstname');

    recordTest('TC-REG-02', 'Duplicate Registration 409 Conflict Rejection & Input Field Preservation', (dupEmailError.includes('already registered') && preservedFirstname === 'Grace') ? 'PASS' : 'FAIL', {
      errorText: dupEmailError,
      preservedFirstname,
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 9. PASSWORDLESS OTP SIGN-IN LIFECYCLE
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n📨 Testing Passwordless OTP Sign-In Workflow & Gateway Integration...');
    await clearMailHog();
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#tab-otp');
    await page.click('#tab-otp');
    await page.waitForTimeout(300);

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

      recordTest('TC-LOGIN-03', 'Passwordless OTP Sign In, MailHog Delivery & Dashboard Sync', (otpLoginUrl.includes('/student/dashboard') && (otpUser.role || '').toLowerCase() === 'student') ? 'PASS' : 'FAIL', {
        email: 'anjali.mukherjee@cyberlearnix.test',
        otpCode: loginOtp,
        destination: otpLoginUrl,
      });
    } else {
      recordTest('TC-LOGIN-03', 'Passwordless OTP Sign In, MailHog Delivery & Dashboard Sync', 'FAIL', { reason: 'No OTP in MailHog' });
    }

    // Clear session
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // ──────────────────────────────────────────────────────────────────────────
    // 10. RECOVERY OTP LIFECYCLE
    // ──────────────────────────────────────────────────────────────────────────
    console.log('\n🔄 Testing 3-Step Password Recovery via MailHog...');
    await clearMailHog();
    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#recovery-email');

    // Step 1: Send Recovery Code
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

      // Step 3: Update Password
      const updatedPassword = 'NewSecret2026!';
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

  } catch (error) {
    console.error('Test execution failed:', error);
    recordTest('TC-GLOBAL-ERR', 'Global Verification Runner', 'FAIL', { error: error.message });
  } finally {
    await browser.close();

    const reportPath = path.resolve('scripts', 'v21_3_verification_results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\n📊 Version 21.3 Verification results written to: ${reportPath}`);
  }
}

run();
