import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, Mail, RefreshCw } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const redirectForRole = (role = "student") => {
  const normalized = String(role).toLowerCase();
  if (normalized.includes("sub")) return "/admin/sub-dashboard";
  if (normalized.includes("admin") || normalized.includes("super")) return "/admin/dashboard";
  if (normalized.includes("instructor")) return "/instructor/dashboard";
  return "/student/dashboard";
};

const readContext = (location) => {
  const state = location.state || {};
  if (state.email || state.otpSessionId) return state;
  try {
    return JSON.parse(sessionStorage.getItem("asivo_otp_context") || sessionStorage.getItem("cyberlearnix_otp_context") || "{}");
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
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [destination, setDestination] = useState("/login");
  const [error, setError] = useState("");
  const refs = useRef([]);

  useEffect(() => {
    if (!email || !otpSessionId) {
      navigate(flow === "login" ? "/otp-login" : "/register", { replace: true });
    }
  }, [email, flow, navigate, otpSessionId]);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const setDigit = (index, value) => {
    const pasted = value.replace(/\D/g, "").slice(0, 6);
    if (pasted.length > 1) {
      const next = [...digits];
      pasted.split("").forEach((digit, offset) => {
        if (index + offset < 6) next[index + offset] = digit;
      });
      setDigits(next);
      refs.current[Math.min(index + pasted.length, 5)]?.focus();
      setError("");
      return;
    }
    const next = [...digits];
    next[index] = pasted;
    setDigits(next);
    setError("");
    if (pasted && index < 5) refs.current[index + 1]?.focus();
  };

  const onKeyDown = (event, index) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const verify = async () => {
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await authApi.verifyOtp({ email, otp, otpSessionId, flow });
      const payload = response?.data && typeof response.data === "object" ? response.data : response;
      if (response?.success === false || payload?.success === false) {
        throw new Error(response?.message || payload?.message || "Invalid OTP code.");
      }
      const token =
        payload?.token ||
        payload?.accessToken ||
        payload?.access_token ||
        response?.token ||
        response?.accessToken;
      const user = payload?.user || response?.user || payload;
      const target = flow === "login" && token ? redirectForRole(user?.role || user?.userRole) : "/login";
      setDestination(target);
      setSuccess(true);
      if (flow === "login" && token) {
        syncSession(user, token, payload?.refreshToken || response?.refreshToken || null);
      }
      toast.success(response?.message || payload?.message || "Verification successful!");
      window.setTimeout(() => navigate(target, { replace: true }), 1500);
      try {
        sessionStorage.removeItem("asivo_otp_context");
      } catch { /* optional */ }
    } catch (cause) {
      const data = cause.response?.data;
      const base = data?.message || data?.error || cause.message || "Verification failed";
      const details = data?.data?.remainingAttempts !== undefined ? ` ${data.data.remainingAttempts} attempts remaining.` : "";
      setError(`${base}${details}`);
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
      toast.error(base);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError("");
    try {
      const response = await authApi.resendOtp({ flow, email, otpSessionId });
      const payload = response?.data && typeof response.data === "object" ? response.data : response;
      const nextSession = payload?.otpSessionId || payload?.sessionId || otpSessionId;
      const nextCooldown = payload?.cooldownSeconds ?? response?.cooldownSeconds ?? 30;
      setOtpSessionId(nextSession);
      setCooldown(Number(nextCooldown));
      setDigits(["", "", "", "", "", ""]);
      sessionStorage.setItem("asivo_otp_context", JSON.stringify({ email, flow, otpSessionId: nextSession, cooldownSeconds: nextCooldown }));
      const backendMessage = payload?.message || response?.message;
      if (backendMessage) toast.success(backendMessage);
    } catch (cause) {
      const data = cause.response?.data;
      const backendMessage = data?.message || data?.error || "Resend failed";
      if (backendMessage) setError(backendMessage);
    } finally {
      setResending(false);
    }
  };

  const changeEmail = () => navigate(flow === "login" ? "/otp-login" : "/register", { replace: true });

  return (
    <AuthShell variant="otp" showTerms={false} showBackHome={false}>
      {success ? (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Check size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-[#F5F5F7]">Email Verified</h1>
          <p className="text-xs text-[#8E8E93] max-w-sm mx-auto leading-relaxed">
            Your credentials have been authenticated. Redirecting you to your workspace...
          </p>
          <div className="pt-2">
            <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-[#C5A880] border-t-transparent" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-sm">
              <Mail size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-[#F5F5F7] tracking-tight">Verify Your Email</h1>
            <p className="text-xs text-[#8E8E93]">
              We sent a 6-digit passcode to <strong className="text-[#F5F5F7] font-mono">{email}</strong>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-400 text-xs" role="alert">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center gap-2.5" aria-label="Passcode boxes">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  refs.current[index] = element;
                }}
                value={digit}
                maxLength={6}
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${index + 1}`}
                disabled={loading}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={`w-11 sm:w-12 h-14 text-center text-lg font-bold font-mono rounded-xl border bg-[#14141A] text-[#F5F5F7] outline-none transition-all ${
                  digit
                    ? "border-[#C5A880] ring-1 ring-[#C5A880]/30"
                    : "border-white/[0.06] focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            className="lms-btn-primary cursor-pointer active:scale-98"
            onClick={verify}
            disabled={loading || digits.some((d) => !d)}
          >
            {loading ? "Verifying..." : "Verify & Continue"} <ArrowRight size={15} />
          </button>

          <div className="pt-2 text-center space-y-3 text-xs">
            <p className="text-[#8E8E93]">
              Didn't receive the passcode?{" "}
              <button
                type="button"
                onClick={resend}
                disabled={resending || cooldown > 0}
                className="font-bold text-[#C5A880] hover:text-[#D4BC98] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {resending ? "Sending..." : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Passcode"}
              </button>
            </p>

            <button
              type="button"
              onClick={changeEmail}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} /> Change email address
            </button>
          </div>

          <div className="pt-3 border-t border-white/[0.04] text-center text-[11px] text-[#52525B] flex items-center justify-center gap-1.5">
            <RefreshCw size={12} />
            <span>Single-use encrypted session verification</span>
          </div>
        </div>
      )}
    </AuthShell>
  );
};

export default OtpVerify;
