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
  try { return JSON.parse(sessionStorage.getItem("asivo_otp_context") || sessionStorage.getItem("cyberlearnix_otp_context") || "{}"); } catch { return {}; }
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
    if (!email || !otpSessionId) navigate(flow === "login" ? "/otp-login" : "/register", { replace: true });
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
      pasted.split("").forEach((digit, offset) => { if (index + offset < 6) next[index + offset] = digit; });
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
    if (event.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) refs.current[index + 1]?.focus();
  };

  const verify = async () => {
    const otp = digits.join("");
    setError("");
    if (otp.length !== 6) { setError("Enter the complete 6-digit code."); return; }
    setLoading(true);
    try {
      const response = flow === "register"
        ? await authApi.verifyEmail({ email, otp, otpSessionId })
        : await authApi.verifyLoginOtp({ email, otp, otpSessionId });
      const payload = response?.data && typeof response.data === "object" ? response.data : response;
      if (response?.success === false || payload?.success === false) throw new Error(payload?.message || response?.message || "");
      const returnedToken = payload?.authentication?.accessToken || payload?.authentication?.token || payload?.accessToken || payload?.token || payload?.access_token;
      if (flow === "login" || returnedToken) {
        const accessToken = payload?.authentication?.accessToken || payload?.authentication?.token || payload?.accessToken || payload?.token || payload?.access_token;
        if (!accessToken) throw new Error(payload?.message || response?.message || "");
        const userInfo = payload?.user || {};
        const user = { id: userInfo.id || userInfo.userId, firstName: userInfo.firstName || "", lastName: userInfo.lastName || "", name: userInfo.name || `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim(), email: userInfo.email || email, role: userInfo.role || userInfo.effectiveRole || "student" };
        syncSession(user, accessToken, payload?.authentication?.refreshToken || payload?.refreshToken || payload?.refresh_token || null);
        setDestination(redirectForRole(user.role));
        setSuccess(true);
        window.setTimeout(() => navigate(redirectForRole(user.role), { replace: true }), 800);
      } else {
        setSuccess(true);
        const backendMessage = payload?.message || response?.message;
        if (backendMessage) toast.success(backendMessage);
        window.setTimeout(() => navigate("/login", { replace: true, state: { prefillEmail: email } }), 1400);
      }
      try { sessionStorage.removeItem("asivo_otp_context"); } catch { /* Optional persistence. */ }
    } catch (cause) {
      const data = cause.response?.data;
      const base = data?.message || data?.error || cause.message || "";
      if (!base) return;
      const details = data?.data?.remainingAttempts !== undefined ? ` ${data.data.remainingAttempts} attempts remaining.` : "";
      setError(`${base}${details}`);
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
      toast.error(base);
    } finally { setLoading(false); }
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true); setError("");
    try {
      const response = await authApi.resendOtp({ flow, email, otpSessionId });
      const payload = response?.data && typeof response.data === "object" ? response.data : response;
      const nextSession = payload?.otpSessionId || payload?.sessionId || otpSessionId;
      const nextCooldown = payload?.cooldownSeconds ?? response?.cooldownSeconds ?? 30;
      setOtpSessionId(nextSession); setCooldown(Number(nextCooldown)); setDigits(["", "", "", "", "", ""]);
      sessionStorage.setItem("asivo_otp_context", JSON.stringify({ email, flow, otpSessionId: nextSession, cooldownSeconds: nextCooldown }));
      const backendMessage = payload?.message || response?.message;
      if (backendMessage) toast.success(backendMessage);
    } catch (cause) {
      const data = cause.response?.data;
      const backendMessage = data?.message || data?.error || "";
      if (backendMessage) setError(backendMessage);
    } finally { setResending(false); }
  };

  const changeEmail = () => navigate(flow === "login" ? "/otp-login" : "/register", { replace: true });

  return (
    <AuthShell variant="otp" showTerms={false} showBackHome={false}>
      {success ? (
        <div className="cyber-success-state">
          <div className="cyber-success-icon"><Check size={42} strokeWidth={3} /></div>
          <h1>Email verified!</h1>
          <p>Your account has been successfully activated.<br />{destination === "/login" ? "Please sign in to continue. Redirecting to sign in…" : "Redirecting you to your dashboard…"}</p>
          <span className="cyber-spinner" aria-label="Redirecting" />
        </div>
      ) : (
        <>
          <div className="cyber-card-heading cyber-centered-heading">
            <span className="cyber-card-icon"><Mail size={25} /></span>
            <h1>Verify your email</h1>
            <p>We’ve sent a 6-digit verification code to<br /><strong>{email}</strong></p>
          </div>
          {error ? <div className="cyber-invalid-state" role="alert"><div><AlertCircle size={28} /></div><h2>Invalid OTP</h2><p>{error}</p><button type="button" className="cyber-auth-button" onClick={() => setError("")}>Try again <ArrowRight size={16} /></button><button type="button" className="cyber-invalid-resend" onClick={resend} disabled={resending || cooldown > 0}>{resending ? "Sending..." : cooldown > 0 ? `Resend OTP in 00:${String(cooldown).padStart(2, "0")}` : "Resend OTP"}</button></div> : (
            <>
              <div className="cyber-otp-boxes" aria-label="Six digit verification code">
                {digits.map((digit, index) => <input key={index} className={digit ? "filled" : ""} ref={(element) => { refs.current[index] = element; }} value={digit} maxLength={6} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} aria-label={`Digit ${index + 1}`} disabled={loading} onChange={(event) => setDigit(index, event.target.value)} onKeyDown={(event) => onKeyDown(event, index)} />)}
              </div>
              <button type="button" className="cyber-auth-button" onClick={verify} disabled={loading || digits.some((digit) => !digit)}>{loading ? "Verifying..." : "Verify & Continue"} <ArrowRight size={16} /></button>
            </>
          )}
          {!error && <p className="cyber-resend-copy">Didn’t receive the code? <button type="button" onClick={resend} disabled={resending || cooldown > 0}>{resending ? "Sending..." : cooldown > 0 ? `Resend OTP in 00:${String(cooldown).padStart(2, "0")}` : "Resend OTP"}</button></p>}
          <button type="button" className="cyber-change-email" onClick={changeEmail} disabled={loading}><ArrowLeft size={14} /> Change email</button>
          <div className="cyber-secure-note"><RefreshCw size={13} /> Your code can only be used once.</div>
        </>
      )}
    </AuthShell>
  );
};

export default OtpVerify;
