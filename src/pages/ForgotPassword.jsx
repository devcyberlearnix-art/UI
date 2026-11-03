// src/pages/ForgotPassword.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  AlertCircle,
  Check,
  Circle,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";
import { getPasswordChecks, isStrongPassword, validateEmail } from "../utils/validation";

const MAX_RESEND_ATTEMPTS = 5;

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const emailInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  useEffect(() => {
    document.title = "Password Recovery | Asivo Learning Platform";
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  const canResend = cooldownSeconds === 0 && resendCount < MAX_RESEND_ATTEMPTS;

  const passwordChecks = useMemo(() => getPasswordChecks(newPassword), [newPassword]);
  const strength = useMemo(() => Object.values(passwordChecks).filter(Boolean).length, [passwordChecks]);

  const strengthLabel = useMemo(() => {
    if (strength === 5) return { label: "Robust", color: "text-emerald-400" };
    if (strength >= 4) return { label: "Good", color: "text-[#C5A880]" };
    if (strength >= 3) return { label: "Fair", color: "text-amber-400" };
    return { label: "Weak", color: "text-rose-400" };
  }, [strength]);

  // ─── Step 1: Request Password Reset OTP ──────────────────────────────
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});

    const trimmed = email.trim();
    if (!trimmed) {
      setFieldErrors({ email: "Email address is required" });
      emailInputRef.current?.focus();
      return;
    }
    if (!validateEmail(trimmed)) {
      setFieldErrors({ email: "Please enter a valid email address (e.g. name@example.com)" });
      emailInputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.forgotPassword(trimmed);
      const sessionId = data.otpSessionId || data.sessionId || data.data?.otpSessionId || "";
      setOtpSessionId(sessionId);
      setCooldownSeconds(Number(data.cooldownSeconds || 30));

      toast.success(data.message || "A verification code has been dispatched to your email address.");
      setStep(2);
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        // Privacy guardrail: generic message that does not confirm/deny email existence
        const genericNotice = "If an account matches this email, a recovery passcode has been sent. Please check your inbox or create an account.";
        setError(genericNotice);
        toast.success(genericNotice);
      } else {
        const message = err.response?.data?.message || err.response?.data?.error || "Unable to request password recovery. Please try again.";
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify Recovery OTP ──────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});

    if (!otp || otp.length !== 6) {
      setFieldErrors({ otp: "Please enter the complete 6-digit recovery code." });
      otpInputRef.current?.focus();
      return;
    }

    if (!otpSessionId) {
      setError("Recovery session expired. Please request a new recovery passcode.");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.verifyPasswordOtp({
        email: email.trim(),
        otpSessionId,
        otp: otp.trim(),
      });

      toast.success(data.message || "Verification code confirmed.");
      setStep(3);
      setTimeout(() => passwordInputRef.current?.focus(), 150);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Invalid or expired verification code.";
      setFieldErrors({ otp: message });
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Reset Password ──────────────────────────────────────────
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (loading) return;
    setError("");
    setFieldErrors({});

    const nextErrors = {};
    if (!newPassword) {
      nextErrors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "Password must be at least 8 characters long";
    } else if (!isStrongPassword(newPassword)) {
      nextErrors.newPassword = "Must include uppercase, lowercase, a number, and a special character";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    if (!otpSessionId) {
      setError("Recovery session expired. Please restart the recovery process.");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.resetPassword({
        email: email.trim(),
        otpSessionId,
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });

      toast.success(data.message || "Password updated successfully! Please sign in with your new credentials.");
      navigate("/login", {
        state: { prefillEmail: email.trim() },
        replace: true,
      });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Password reset failed. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend Password OTP ──────────────────────────────────────────────
  const handleResendOtp = async () => {
    setError("");
    setFieldErrors({});
    if (!canResend) return;

    setResending(true);
    try {
      const res = await authApi.resendOtp({ flow: "password_reset", email: email.trim(), otpSessionId });
      if (res.otpSessionId) setOtpSessionId(res.otpSessionId);
      setCooldownSeconds(Number(res.cooldownSeconds || 30));
      setResendCount((c) => c + 1);
      setOtp("");
      toast.success(res.message || "A new recovery code has been dispatched to your email.");
      otpInputRef.current?.focus();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Resend failed. Please try again shortly.";
      setError(message);
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell variant="split" showTerms={false} showBackHome>
      <div className="space-y-6">
        {/* Step Indicator Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#F5F5F7] tracking-tight">
            {step === 1 && "Password Recovery"}
            {step === 2 && "Enter Recovery Code"}
            {step === 3 && "Set New Password"}
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            {step === 1 && "Enter your registered email address to receive a secure recovery code."}
            {step === 2 && "Check your inbox for the 6-digit single-use passcode."}
            {step === 3 && "Create a robust master password for your Asivo account."}
          </p>

          {/* Stepper Progress Dots */}
          <div className="flex items-center justify-center gap-2 pt-2" aria-hidden="true">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-8 bg-[#C5A880]"
                    : s < step
                    ? "w-4 bg-emerald-400"
                    : "w-4 bg-white/[0.08]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-400 text-xs"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── STEP 1: Enter Email ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate className="space-y-4">
            <div className="space-y-1">
              <label
                htmlFor="recovery-email"
                className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
              >
                Account Email Address <span className="text-[#C5A880]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} aria-hidden="true" />
                <input
                  ref={emailInputRef}
                  id="recovery-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`lms-input pl-10 text-xs ${fieldErrors.email ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                  value={email}
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "recovery-email-error" : undefined}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors({});
                  }}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p id="recovery-email-error" className="text-[11px] text-rose-400 font-medium mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lms-btn-primary cursor-pointer active:scale-98 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#070709] border-t-transparent" />
                  <span>Sending Recovery Code...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Send Recovery Code</span>
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>
        )}

        {/* ── STEP 2: Enter 6-Digit OTP ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
            <div className="rounded-2xl bg-[#14141A] p-3 border border-white/[0.04] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#71717A] block text-[10px] uppercase font-semibold">Sent to</span>
                <span className="text-[#F5F5F7] font-medium truncate max-w-[200px] inline-block">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
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
                htmlFor="recovery-otp"
                className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
              >
                6-Digit Recovery Passcode <span className="text-[#C5A880]">*</span>
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} aria-hidden="true" />
                <input
                  ref={otpInputRef}
                  id="recovery-otp"
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
                    if (fieldErrors.otp) setFieldErrors({});
                  }}
                  maxLength={6}
                  disabled={loading}
                  aria-required="true"
                  aria-invalid={Boolean(fieldErrors.otp)}
                  aria-describedby={fieldErrors.otp ? "recovery-otp-error" : undefined}
                />
              </div>
              {fieldErrors.otp && (
                <p id="recovery-otp-error" className="text-[11px] text-rose-400 font-medium mt-1">
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
                <span className="flex items-center justify-center gap-2">
                  <span>Verify Code</span>
                  <ArrowRight size={15} />
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending || !canResend}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-[#14141A] px-4 py-2.5 text-xs font-semibold text-[#A1A1AA] hover:text-[#F5F5F7] hover:border-white/[0.08] transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={14} className={resending ? "animate-spin text-[#C5A880]" : ""} />
              {resending
                ? "Resending..."
                : cooldownSeconds > 0
                ? `Resend in ${cooldownSeconds}s`
                : resendCount >= MAX_RESEND_ATTEMPTS
                ? "Maximum resends reached"
                : "Resend Code"}
            </button>
          </form>
        )}

        {/* ── STEP 3: Set New Password ── */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} noValidate className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label
                htmlFor="new-password"
                className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
              >
                New Password <span className="text-[#C5A880]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} aria-hidden="true" />
                <input
                  ref={passwordInputRef}
                  id="new-password"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className={`lms-input pl-10 pr-10 text-xs ${fieldErrors.newPassword ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                  value={newPassword}
                  autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={Boolean(fieldErrors.newPassword)}
                  aria-describedby={fieldErrors.newPassword ? "new-password-error" : undefined}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: "" }));
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F5F5F7] transition-colors focus:outline-none focus:text-[#C5A880]"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.newPassword && (
                <p id="new-password-error" className="text-[11px] text-rose-400 font-medium mt-1">
                  {fieldErrors.newPassword}
                </p>
              )}
            </div>

            {/* Password Security Requirements */}
            {newPassword && (
              <div className="p-3.5 rounded-2xl bg-[#14141A] border border-white/[0.04] space-y-2.5 text-xs">
                <span className="font-semibold text-[#A1A1AA] text-[11px] uppercase tracking-wider block">
                  Password Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  {[
                    ["length", "8+ characters"],
                    ["upper", "Uppercase (A-Z)"],
                    ["lower", "Lowercase (a-z)"],
                    ["number", "Number (0-9)"],
                    ["symbol", "Special symbol"],
                  ].map(([rule, label]) => (
                    <span
                      key={rule}
                      className={`flex items-center gap-1.5 ${
                        passwordChecks[rule] ? "text-[#C5A880] font-semibold" : "text-[#71717A]"
                      }`}
                    >
                      {passwordChecks[rule] ? <Check size={12} className="text-[#C5A880]" /> : <Circle size={10} />}
                      <span>{label}</span>
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                  <span className="text-[#A1A1AA]">
                    Strength: <b className={strengthLabel.color}>{strengthLabel.label}</b>
                  </span>
                  <div className="flex gap-1" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <span
                        key={item}
                        className={`h-1.5 w-5 rounded-full transition-colors ${
                          item <= strength
                            ? strength === 5
                              ? "bg-emerald-400"
                              : strength >= 3
                              ? "bg-[#C5A880]"
                              : "bg-rose-400"
                            : "bg-white/[0.06]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label
                htmlFor="confirm-new-password"
                className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
              >
                Confirm New Password <span className="text-[#C5A880]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} aria-hidden="true" />
                <input
                  id="confirm-new-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className={`lms-input pl-10 pr-10 text-xs ${fieldErrors.confirmPassword ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                  value={confirmPassword}
                  autoComplete="new-password"
                  aria-required="true"
                  aria-invalid={Boolean(fieldErrors.confirmPassword)}
                  aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F5F5F7] transition-colors focus:outline-none focus:text-[#C5A880]"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword ? (
                <p id="confirm-password-error" className="text-[11px] text-rose-400 font-medium mt-1">
                  {fieldErrors.confirmPassword}
                </p>
              ) : confirmPassword ? (
                <p
                  className={`text-[11px] font-semibold flex items-center gap-1.5 mt-1 ${
                    newPassword === confirmPassword ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {newPassword === confirmPassword ? (
                    <>
                      <Check size={13} /> Passwords match
                    </>
                  ) : (
                    "Passwords do not match"
                  )}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lms-btn-primary cursor-pointer active:scale-98 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#070709] border-t-transparent" />
                  <span>Resetting Password...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Update Password &amp; Sign In</span>
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>
        )}

        {/* Return to Sign In */}
        <div className="pt-4 border-t border-white/[0.04] text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#C5A880] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to Sign In</span>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;
