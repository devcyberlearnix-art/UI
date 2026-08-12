import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";

// Use your ngrok base URL (or fallback to localhost)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://matted-ascent-specimen.ngrok-free.dev";

const getRedirectByRole = (roleValue) => {
  const role = String(roleValue || "").toLowerCase();
  if (role.includes("sub")) return "/admin/sub-dashboard";
  if (role.includes("admin") || role.includes("super")) return "/admin/dashboard";
  if (role.includes("instructor")) return "/instructor/dashboard";
  return "/student/dashboard";
};

function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();

  const flow = location.state?.flow || "register";
  const email = location.state?.email || "";
  const initialOtpSessionId = location.state?.otpSessionId || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [otpSessionId, setOtpSessionId] = useState(initialOtpSessionId);
  const [cooldown, setCooldown] = useState(30); // start at 30 seconds

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      navigate(flow === "login" ? "/otp-login" : "/register", { replace: true });
    }
  }, [email, flow, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const canResend = useMemo(() => cooldown === 0, [cooldown]);

  // ─── API calls ─────────────────────────────────────────────

  // Verify registration OTP (includes session ID if provided)
  const verifyRegistrationOtp = async (email, otp, sessionId) => {
    const payload = { email, otp };
    if (sessionId) payload.otpSessionId = sessionId;

    const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Verification failed");
    return data;
  };

  // Verify login OTP
  const verifyLoginOtp = async (email, otpSessionId, otp) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify-login-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otpSessionId, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "OTP verification failed");
    return data;
  };

  // Resend OTP (works for both flows; adjust endpoint if needed)
  const resendOtp = async (email, flowType) => {
    // You may need separate endpoints; we'll try a generic one.
    // If your backend has different routes, update accordingly.
    const endpoint =
      flowType === "register"
        ? `${API_BASE_URL}/api/v1/auth/resend-registration-otp`
        : `${API_BASE_URL}/api/v1/auth/request-login-otp`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to resend OTP");
    return data;
  };

  // ─── Handlers ──────────────────────────────────────────────

  const onVerify = async () => {
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      if (flow === "register") {
        const res = await verifyRegistrationOtp(email, otp, otpSessionId);
        setSuccess(true);
        toast.success(res.message || "Email verified successfully");
        setTimeout(() => navigate("/login", { replace: true }), 900);
        return;
      }

      // ── login flow ──
      if (!otpSessionId) {
        throw new Error("OTP session expired. Please request a new OTP.");
      }

      const res = await verifyLoginOtp(email, otpSessionId, otp);
      const tokenData =
        res.authentication?.accessToken || res.accessToken || res.token || res.access_token;
      const refreshToken =
        res.authentication?.refreshToken || res.refreshToken || res.refresh_token || null;

      if (!tokenData) throw new Error("No access token received");

      const userInfo = res.user || {};
      const userData = {
        id: userInfo.id || userInfo.userId,
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        name: userInfo.firstName
          ? `${userInfo.firstName} ${userInfo.lastName || ""}`.trim()
          : userInfo.name || "",
        email: userInfo.email || email,
        role: userInfo.role || userInfo.effectiveRole || "student",
      };

      localStorage.setItem("lms_token", tokenData);
      localStorage.setItem("access_token", tokenData);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
      sessionStorage.setItem("lms_token", tokenData);
      localStorage.setItem("lms_user", JSON.stringify(userData));

      setSuccess(true);
      toast.success(res.message || "Login successful");
      setTimeout(() => {
        window.location.href = getRedirectByRole(userData.role);
      }, 600);
    } catch (err) {
      // Attempt to extract detailed error from response
      let errorMessage = err.message || "OTP verification failed";
      if (err.response?.data) {
        const data = err.response.data;
        const attempts = data.data?.remainingAttempts;
        const expiry = data.data?.expiresInSeconds;
        const details = [
          attempts !== undefined ? `${attempts} attempts left` : "",
          expiry ? `expires in ${expiry}s` : "",
        ]
          .filter(Boolean)
          .join(" | ");
        if (details) errorMessage = `${data.message || errorMessage} (${details})`;
        else if (data.message) errorMessage = data.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError("");
    if (!canResend) return;

    setLoading(true);
    try {
      const res = await resendOtp(email, flow);
      // Update session ID and cooldown from response
      setOtpSessionId(res.otpSessionId || res.sessionId || "");
      setCooldown(Number(res.cooldownSeconds || 30));
      toast.success(res.message || "OTP resent successfully");
    } catch (err) {
      const message = err.message || "Failed to resend OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={flow === "register" ? "Verify Email" : "Verify Login OTP"}
      subtitle="Enter the 6‑digit code sent to your email address."
      eyebrow="LearnMaster Verification"
      highlights={[
        { value: "6‑Digit", label: "OTP" },
        { value: "Secure", label: "Flow" },
        { value: "5 Min", label: "Expiry" },
      ]}
    >
      <h1 className="mb-2 text-2xl font-bold text-slate-900">OTP Verification</h1>
      <p className="mb-6 text-sm text-slate-500">Code sent to {email || "your email"}</p>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          <AlertCircle size={18} className="mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
          <CheckCircle size={18} className="mt-0.5" />
          <span className="text-sm">Verified successfully. Redirecting…</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">One‑Time Password</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="lms-input text-center tracking-[0.35em] text-lg"
            placeholder="000000"
            disabled={loading || success}
          />
        </div>

        <button onClick={onVerify} disabled={loading || success} className="lms-btn-primary">
          {loading ? "Verifying…" : "Verify OTP"}
        </button>

        {/* Resend button – visible for both flows */}
        <button
          type="button"
          onClick={onResend}
          disabled={loading || !canResend}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {canResend ? "Resend OTP" : `Resend in ${cooldown}s`}
        </button>
      </div>
    </AuthShell>
  );
}

export default OtpVerify;