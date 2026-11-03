// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle, KeyRound, RefreshCw, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth, getDashboardPath, normalizeRole } from "../context/AuthContext";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";
import { parseApiError } from "../utils/apiErrorParser";
import { validateEmail as isValidEmail } from "../utils/validation";
import SocialAuthButtons from "../components/ui/SocialAuthButtons";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 26,
};

const MAX_RESEND_ATTEMPTS = 5;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, syncSession, isAuthenticated, loading: authLoading } = useAuth();

  const [loginMethod, setLoginMethod] = useState("password");
  const [email, setEmail] = useState(location.state?.prefillEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Login State
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [otpResending, setOtpResending] = useState(false);

  // Validation & Error State
  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedSession, setUnverifiedSession] = useState("");


  const passwordTabRef = useRef(null);
  const otpTabRef = useRef(null);
  const emailInputRef = useRef(null);
  const otpInputRef = useRef(null);

  useEffect(() => {
    document.title = "Sign In | Asivo Learning Platform";
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const storedUser = JSON.parse(localStorage.getItem("lms_user") || "{}");
      navigate(getDashboardPath(storedUser?.role || storedUser?.role1 || storedUser?.userRole), { replace: true });
    }
  }, [isAuthenticated, navigate, authLoading]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const canResend = cooldownSeconds === 0 && resendCount < MAX_RESEND_ATTEMPTS;

  // Keyboard navigation for tablist
  const handleTabKeyDown = (e, targetTab) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const nextTab = targetTab === "password" ? "otp" : "password";
      switchTab(nextTab);
      if (nextTab === "password") passwordTabRef.current?.focus();
      else otpTabRef.current?.focus();
    }
  };

  const switchTab = (method) => {
    setLoginMethod(method);
    setGlobalError("");
    setFieldErrors({});
    if (method === "password") {
      setOtpSent(false);
      setOtp("");
      setOtpSessionId("");
    } else {
      setPassword("");
    }
  };

  // Field validation
  const validateEmailField = () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldErrors((prev) => ({ ...prev, email: "Email address is required" }));
      return false;
    }
    if (!isValidEmail(trimmed)) {
      setFieldErrors((prev) => ({ ...prev, email: "Please enter a valid email address (e.g. name@example.com)" }));
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const validatePasswordField = () => {
    if (!password) {
      setFieldErrors((prev) => ({ ...prev, password: "Password is required" }));
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, password: "" }));
    return true;
  };

  // Password Login Submission
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions
    setGlobalError("");
    setUnverifiedSession("");

    const isEmailValid = validateEmailField();
    const isPasswordValid = validatePasswordField();

    if (!isEmailValid || !isPasswordValid) return;

    setLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        navigate(getDashboardPath(result.user?.role || result.user?.role1 || result.user?.userRole), { replace: true });
      } else {
        const errorMsg = result.error || "Authentication failed. Please verify your credentials.";
        setGlobalError(errorMsg);

        // Check for unverified email status
        const isUnverified =
          result.originalError?.response?.data?.message?.toLowerCase().includes("not verified") ||
          result.originalError?.response?.data?.message?.toLowerCase().includes("verify your email") ||
          errorMsg.toLowerCase().includes("not verified") ||
          errorMsg.toLowerCase().includes("unverified");

        const errorOtpSessionId =
          result.originalError?.response?.data?.data?.otpSessionId ||
          result.originalError?.response?.data?.otpSessionId;

        if (isUnverified && errorOtpSessionId) {
          setUnverifiedSession(errorOtpSessionId);
        }
      }
    } catch (err) {
      const parsed = parseApiError(err, "Login failed. Please check your credentials.");
      setGlobalError(parsed.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  // Send Login OTP Request
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (loading) return; // Prevent duplicate submissions
    setGlobalError("");
    setFieldErrors({});

    if (!validateEmailField()) return;

    setLoading(true);
    try {
      const res = await authApi.requestLoginOtp(email.trim());
      setOtpSessionId(res.otpSessionId || "");
      setCooldownSeconds(Number(res.cooldownSeconds || 30));
      setOtpSent(true);
      toast.success(res.message || "A 6-digit verification code has been dispatched.");
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Unable to send verification code. Please try again.";
      setGlobalError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Verify Login OTP Submission
  const handleOtpLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions
    setGlobalError("");
    setFieldErrors({});

    if (!otp || otp.trim().length !== 6) {
      setFieldErrors((prev) => ({ ...prev, otp: "Please enter the complete 6-digit verification code." }));
      return;
    }

    if (!otpSessionId) {
      setGlobalError("Your verification session has expired. Please request a new code.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyLoginOtp({
        email: email.trim(),
        otpSessionId,
        otp: otp.trim(),
      });

      const payload = response?.data && typeof response.data === 'object' ? response.data : response;

      const tokenData =
        payload.authentication?.accessToken ||
        payload.authentication?.token ||
        payload.accessToken ||
        payload.token;
      const refreshToken =
        payload.authentication?.refreshToken || payload.refreshToken || null;

      if (!tokenData) {
        throw new Error("No authentication token received from OTP verification");
      }

      const userInfo = payload.user || payload;
      const userData = {
        id: userInfo.id || userInfo.userId,
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        name: userInfo.firstName
          ? `${userInfo.firstName} ${userInfo.lastName || ""}`.trim()
          : userInfo.name || "",
        email: userInfo.email || email,
        role: normalizeRole(userInfo.role || userInfo.role1 || userInfo.userRole || userInfo.effectiveRole || "student"),
      };

      syncSession(userData, tokenData, refreshToken);

      toast.success(response.message || "Sign in successful!");
      navigate(getDashboardPath(userData.role), { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || "Invalid or expired verification code.";
      setFieldErrors((prev) => ({ ...prev, otp: message }));
      setGlobalError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend Login OTP
  const handleResendOtp = async () => {
    setGlobalError("");
    setFieldErrors({});
    if (!validateEmailField()) return;
    if (!canResend) return;

    setOtpResending(true);
    try {
      const res = await authApi.resendOtp({ flow: "login", email: email.trim() });
      if (res.otpSessionId) setOtpSessionId(res.otpSessionId);
      setCooldownSeconds(Number(res.cooldownSeconds || 30));
      setResendCount((c) => c + 1);
      setOtp("");
      toast.success(res.message || "A new verification code has been sent.");
      otpInputRef.current?.focus();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Resend failed. Please try again shortly.";
      setGlobalError(message);
      toast.error(message);
    } finally {
      setOtpResending(false);
    }
  };

  return (
    <AuthShell variant="split" showTerms showBackHome>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_TRANSITION}
        className="space-y-6"
      >
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-sm">
            <LogIn className="w-5 h-5 text-[#C5A880]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#F5F5F7] tracking-tight">
            Sign In to Asivo
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            {loginMethod === "password"
              ? "Enter your email and master password to access your workspace."
              : "Enter your email to receive a secure single-use 6-digit passcode."}
          </p>
        </div>

        {/* Accessible Mode Selection Tablist */}
        <div
          role="tablist"
          aria-label="Sign in method"
          className="grid grid-cols-2 p-1 rounded-2xl bg-[#14141A] border border-white/[0.04]"
        >
          <button
            ref={passwordTabRef}
            id="tab-password"
            role="tab"
            type="button"
            aria-selected={loginMethod === "password"}
            aria-controls="panel-password"
            tabIndex={loginMethod === "password" ? 0 : -1}
            onClick={() => switchTab("password")}
            onKeyDown={(e) => handleTabKeyDown(e, "password")}
            className={`relative py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-1 focus-visible:ring-offset-[#14141A] ${
              loginMethod === "password"
                ? "text-[#070709] font-bold"
                : "text-[#D4D4D8] hover:text-[#FFFFFF]"
            }`}
          >
            {loginMethod === "password" && (
              <motion.div
                layoutId="activeLoginTab"
                className="absolute inset-0 bg-[#C5A880] rounded-xl shadow-sm z-0"
                transition={SPRING_TRANSITION}
              />
            )}
            <span className="relative z-10">Password Mode</span>
          </button>

          <button
            ref={otpTabRef}
            id="tab-otp"
            role="tab"
            type="button"
            aria-selected={loginMethod === "otp"}
            aria-controls="panel-otp"
            tabIndex={loginMethod === "otp" ? 0 : -1}
            onClick={() => switchTab("otp")}
            onKeyDown={(e) => handleTabKeyDown(e, "otp")}
            className={`relative py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-1 focus-visible:ring-offset-[#14141A] ${
              loginMethod === "otp"
                ? "text-[#070709] font-bold"
                : "text-[#D4D4D8] hover:text-[#FFFFFF]"
            }`}
          >
            {loginMethod === "otp" && (
              <motion.div
                layoutId="activeLoginTab"
                className="absolute inset-0 bg-[#C5A880] rounded-xl shadow-sm z-0"
                transition={SPRING_TRANSITION}
              />
            )}
            <span className="relative z-10">OTP Code Mode</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div
            role="alert"
            className="flex flex-col gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-400 text-xs"
          >
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{globalError}</span>
            </div>
            {unverifiedSession && (
              <button
                type="button"
                onClick={() =>
                  navigate("/otp-verify", {
                    state: {
                      email: email.trim(),
                      flow: "register",
                      otpSessionId: unverifiedSession,
                      cooldownSeconds: 30,
                    },
                  })
                }
                className="mt-1 self-start text-xs font-bold text-[#C5A880] hover:underline cursor-pointer"
              >
                Verify Email Now &rarr;
              </button>
            )}
          </div>
        )}

        {/* ── PASSWORD MODE PANEL ── */}
        {loginMethod === "password" ? (
          <form
            id="panel-password"
            role="tabpanel"
            aria-labelledby="tab-password"
            onSubmit={handlePasswordLogin}
            noValidate
            className="space-y-4"
          >
            {/* Email Field */}
            <div className="space-y-1">
              <label
                htmlFor="login-email"
                className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
              >
                Email Address <span className="text-[#C5A880]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} aria-hidden="true" />
                <input
                  ref={emailInputRef}
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`lms-input pl-10 text-xs ${fieldErrors.email ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                  value={email}
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p id="login-email-error" className="text-[11px] text-rose-400 font-medium mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
                >
                  Password <span className="text-[#C5A880]">*</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-[#A1A1AA] hover:text-[#C5A880] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} aria-hidden="true" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className={`lms-input pl-10 pr-10 text-xs ${fieldErrors.password ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                  value={password}
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F5F5F7] transition-colors focus:outline-none focus:text-[#C5A880]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="login-password-error" className="text-[11px] text-rose-400 font-medium mt-1">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="lms-btn-primary cursor-pointer active:scale-98 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#070709] border-t-transparent" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        ) : (
          /* ── OTP CODE MODE PANEL ── */
          <div
            id="panel-otp"
            role="tabpanel"
            aria-labelledby="tab-otp"
            className="space-y-4"
          >
            {!otpSent ? (
              /* Step 1: Enter email for OTP */
              <form onSubmit={handleSendOtp} noValidate className="space-y-4">
                <div className="space-y-1">
                  <label
                    htmlFor="otp-email-input"
                    className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
                  >
                    Email Address <span className="text-[#C5A880]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} aria-hidden="true" />
                    <input
                      id="otp-email-input"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      className={`lms-input pl-10 text-xs ${fieldErrors.email ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                      value={email}
                      autoComplete="email"
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.email)}
                      aria-describedby={fieldErrors.email ? "otp-email-error" : undefined}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      disabled={loading}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p id="otp-email-error" className="text-[11px] text-rose-400 font-medium mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                  We will send a 6-digit one-time passcode to your inbox for password-free sign in.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="lms-btn-primary cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#070709] border-t-transparent" />
                      <span>Sending Code...</span>
                    </span>
                  ) : (
                    "Send One-Time Passcode"
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Enter 6-digit OTP */
              <form onSubmit={handleOtpLogin} noValidate className="space-y-4">
                <div className="rounded-2xl bg-[#14141A] p-3 border border-white/[0.04] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#71717A] block text-[10px] uppercase font-semibold">Sent to</span>
                    <span className="text-[#F5F5F7] font-medium truncate max-w-[200px] inline-block">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setFieldErrors({});
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C5A880] hover:underline cursor-pointer"
                  >
                    <ArrowLeft size={12} /> Change
                  </button>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="login-otp"
                    className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
                  >
                    6-Digit Passcode <span className="text-[#C5A880]">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} aria-hidden="true" />
                    <input
                      ref={otpInputRef}
                      id="login-otp"
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      placeholder="••••••"
                      className={`lms-input pl-10 text-center font-mono tracking-widest text-sm ${fieldErrors.otp ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setOtp(val);
                        if (fieldErrors.otp) setFieldErrors((prev) => ({ ...prev, otp: "" }));
                      }}
                      maxLength={6}
                      disabled={loading}
                      aria-required="true"
                      aria-invalid={Boolean(fieldErrors.otp)}
                      aria-describedby={fieldErrors.otp ? "login-otp-error" : undefined}
                    />
                  </div>
                  {fieldErrors.otp && (
                    <p id="login-otp-error" className="text-[11px] text-rose-400 font-medium mt-1">
                      {fieldErrors.otp}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="lms-btn-primary cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#070709] border-t-transparent" />
                      <span>Verifying Code...</span>
                    </span>
                  ) : (
                    "Verify & Sign In"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpResending || !canResend}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-[#14141A] px-4 py-2.5 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] hover:border-white/[0.08] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={14} className={otpResending ? "animate-spin text-[#C5A880]" : ""} />
                  {otpResending
                    ? "Resending..."
                    : cooldownSeconds > 0
                      ? `Resend in ${cooldownSeconds}s`
                      : resendCount >= MAX_RESEND_ATTEMPTS
                        ? "Maximum resends reached"
                        : "Resend Passcode"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Social Authentication Layer */}
        <SocialAuthButtons mode="signin" />

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/[0.04] text-center space-y-2">
          <p className="text-xs text-[#A1A1AA]">
            Don't have an Asivo account?{" "}
            <Link to="/register" className="text-[#C5A880] hover:text-[#D4BC98] font-bold transition-colors">
              Create an account
            </Link>
          </p>
          <p className="text-[11px] text-[#71717A]">
            Platform Administrator?{" "}
            <Link to="/admin/login" className="text-[#C5A880] hover:text-[#D4BC98] hover:underline font-medium transition-colors">
              Admin Command Sign In &rarr;
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthShell>
  );
};

export default Login;
