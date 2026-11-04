// src/pages/OtpVerify.jsx
import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";
import { useAuth, getDashboardPath } from "../context/AuthContext";

const MAX_RESEND_ATTEMPTS = 5;

const readContext = (location) => {
  const state = location.state || {};
  if (state.email || state.otpSessionId) return state;
  try {
    return JSON.parse(
      sessionStorage.getItem("asivo_otp_context") ||
      sessionStorage.getItem("cyberlearnix_otp_context") ||
      "{}"
    );
  } catch {
    return {};
  }
};

const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { syncSession } = useAuth();

  const context = readContext(location);
  const flow = context.flow || "register";
  const email = context.email || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [otpSessionId, setOtpSessionId] = useState(context.otpSessionId || "");
  const [cooldown, setCooldown] = useState(Number(context.cooldownSeconds ?? 30));
  const [resendCount, setResendCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const refs = useRef([]);

  useEffect(() => {
    document.title = "Verify Email | Asivo Learning Platform";
  }, []);

  useEffect(() => {
    if (!email || !otpSessionId) {
      navigate(flow === "login" ? "/login" : "/register", { replace: true });
    }
  }, [email, flow, navigate, otpSessionId]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((val) => Math.max(0, val - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  // Focus first digit box on mount
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setDigit = (index, value) => {
    const numeric = value.replace(/\D/g, "");

    // Handling multi-character paste (up to 6 digits)
    if (numeric.length > 1) {
      const next = [...digits];
      const chars = numeric.slice(0, 6).split("");
      chars.forEach((char, offset) => {
        if (index + offset < 6) next[index + offset] = char;
      });
      setDigits(next);
      setError("");
      const focusTarget = Math.min(index + chars.length, 5);
      refs.current[focusTarget]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = numeric;
    setDigits(next);
    setError("");

    if (numeric && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const onKeyDown = (event, index) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      refs.current[index + 1]?.focus();
    } else if (event.key === "Enter" && digits.every((d) => d !== "")) {
      event.preventDefault();
      verify();
    }
  };

  const verify = async () => {
    if (loading) return; // Prevent duplicate submissions
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authApi.verifyOtp({ email, otp, otpSessionId, flow });
      const payload = response?.data && typeof response.data === "object" ? response.data : response;

      if (response?.success === false || payload?.success === false) {
        throw new Error(response?.message || payload?.message || "Invalid verification code.");
      }

      setSuccess(true);

      try {
        sessionStorage.removeItem("asivo_otp_context");
      } catch {
        // storage cleanup
      }

      if (flow === "login") {
        const token =
          payload?.token ||
          payload?.accessToken ||
          payload?.access_token ||
          payload?.authentication?.accessToken ||
          response?.accessToken;
        const refreshToken =
          payload?.refreshToken ||
          payload?.authentication?.refreshToken ||
          response?.refreshToken ||
          null;
        const user = payload?.user || response?.user || payload;

        if (token) {
          syncSession(user, token, refreshToken);
        }
        toast.success("Welcome back! Redirecting to your workspace...");
        setTimeout(() => {
          navigate(getDashboardPath(user?.role || user?.userRole || "student"), { replace: true });
        }, 1200);
      } else {
        // Registration verification complete
        toast.success("Email verified successfully! You may now sign in.");
        setTimeout(() => {
          navigate("/login", {
            state: { prefillEmail: email },
            replace: true,
          });
        }, 1500);
      }
    } catch (cause) {
      const data = cause.response?.data;
      const baseMsg = data?.message || data?.error || cause.message || "Verification failed. Please check your code.";
      const attemptsInfo = data?.data?.remainingAttempts !== undefined ? ` (${data.data.remainingAttempts} attempts remaining)` : "";
      setError(`${baseMsg}${attemptsInfo}`);
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
      toast.error(baseMsg);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || resending || resendCount >= MAX_RESEND_ATTEMPTS) return;

    setResending(true);
    setError("");

    try {
      const response = await authApi.resendOtp({ flow, email, otpSessionId });
      const payload = response?.data && typeof response.data === "object" ? response.data : response;
      const nextSession = payload?.otpSessionId || payload?.sessionId || otpSessionId;
      const nextCooldown = payload?.cooldownSeconds ?? response?.cooldownSeconds ?? 30;

      setOtpSessionId(nextSession);
      setCooldown(Number(nextCooldown));
      setResendCount((c) => c + 1);
      setDigits(["", "", "", "", "", ""]);

      try {
        sessionStorage.setItem(
          "asivo_otp_context",
          JSON.stringify({ email, flow, otpSessionId: nextSession, cooldownSeconds: nextCooldown })
        );
      } catch {
        // optional storage fallback
      }

      toast.success(payload?.message || response?.message || "A new 6-digit passcode has been sent to your inbox.");
      refs.current[0]?.focus();
    } catch (cause) {
      const data = cause.response?.data;
      const backendMessage = data?.message || data?.error || "Resend request failed. Please wait before retrying.";
      setError(backendMessage);
      toast.error(backendMessage);
    } finally {
      setResending(false);
    }
  };

  const changeEmail = () => {
    navigate(flow === "login" ? "/login" : "/register", {
      state: { prefillEmail: email },
      replace: true,
    });
  };

  return (
    <AuthShell variant="otp" showTerms={false} showBackHome={false}>
      {success ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm">
            <Check size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#282521] dark:text-[#EDE8E1]">Email Verified</h1>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto leading-relaxed">
            {flow === "login"
              ? "Your credentials have been authenticated. Redirecting you to your workspace..."
              : "Your account is activated and ready. Redirecting you to sign in..."}
          </p>
          <div className="pt-2">
            <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-[#5B3E57] dark:border-[#D1A7CC] border-t-transparent" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] shadow-sm">
              <Mail size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
              {flow === "login" ? "Verify Sign In" : "Verify Your Email"}
            </h1>
            <p className="text-xs text-[#A1A1AA]">
              We sent a 6-digit verification passcode to{" "}
              <strong className="text-[#282521] dark:text-[#EDE8E1] font-mono">{email}</strong>
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-400 text-xs"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 6 Digit Input Group */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block text-center">
              Enter 6-Digit Passcode
            </label>
            <div
              className="flex justify-center gap-2 sm:gap-2.5"
              role="group"
              aria-label="6-digit verification code"
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    refs.current[index] = element;
                  }}
                  value={digit}
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${index + 1} of 6`}
                  disabled={loading}
                  onChange={(event) => setDigit(index, event.target.value)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                  className={`w-11 sm:w-12 h-14 text-center text-lg font-bold font-mono rounded-xl border bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] outline-none transition-all ${
                    digit
                      ? "border-[#5B3E57] dark:border-[#D1A7CC] ring-1 ring-[#5B3E57]/30 dark:ring-[#D1A7CC]/30"
                      : "border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] focus:border-[#5B3E57] dark:focus:border-[#D1A7CC] focus:ring-1 focus:ring-[#5B3E57]/30 dark:focus:ring-[#D1A7CC]/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            className="lms-btn-primary cursor-pointer active:scale-98"
            onClick={verify}
            disabled={loading || digits.some((d) => !d)}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFFEFA] dark:border-[#151413] border-t-transparent" />
                <span>Verifying Passcode...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Verify &amp; Continue</span>
                <ArrowRight size={15} />
              </span>
            )}
          </button>

          {/* Resend and Navigation */}
          <div className="pt-2 text-center space-y-3 text-xs">
            <p className="text-[#A1A1AA]">
              Didn't receive the passcode?{" "}
              <button
                type="button"
                onClick={resend}
                disabled={resending || cooldown > 0 || resendCount >= MAX_RESEND_ATTEMPTS}
                className="font-bold text-[#5B3E57] dark:text-[#D1A7CC] hover:text-[#D4BC98] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {resending
                  ? "Sending..."
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : resendCount >= MAX_RESEND_ATTEMPTS
                  ? "Max resends reached"
                  : "Resend Passcode"}
              </button>
            </p>

            <button
              type="button"
              onClick={changeEmail}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#756E64] dark:text-[#7A7368] hover:text-[#282521] dark:text-[#EDE8E1] transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} /> Change email address
            </button>
          </div>

          <div className="pt-3 border-t border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] text-center text-[11px] text-[#756E64] dark:text-[#7A7368] flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} className="text-[#5B3E57] dark:text-[#D1A7CC]" />
            <span>Single-use encrypted session verification</span>
          </div>
        </div>
      )}
    </AuthShell>
  );
};

export default OtpVerify;
