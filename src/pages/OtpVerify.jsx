import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";

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

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [otpSessionId, setOtpSessionId] = useState(location.state?.otpSessionId || "");
  const [cooldown, setCooldown] = useState(Number(location.state?.cooldownSeconds || 30));

  useEffect(() => {
    if (!email) {
      navigate(flow === "login" ? "/otp-login" : "/register", { replace: true });
    }
  }, [email, flow, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const canResend = useMemo(() => cooldown === 0, [cooldown]);

  const onVerify = async () => {
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      if (flow === "register") {
        const res = await authApi.verifyEmail({ email, otp });
        setSuccess(true);
        toast.success(res.message || "Email verified successfully");
        setTimeout(() => navigate("/login", { replace: true }), 900);
        return;
      }

      if (!otpSessionId) {
        throw new Error("OTP session expired. Please request a new OTP.");
      }

      const res = await authApi.verifyLoginOtp({ email, otpSessionId, otp });
      const tokenData =
        res.authentication?.accessToken || res.accessToken || res.token || res.access_token;
      const refreshToken =
        res.authentication?.refreshToken || res.refreshToken || res.refresh_token || null;

      if (!tokenData) {
        throw new Error("No access token received");
      }

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
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      sessionStorage.setItem("lms_token", tokenData);
      localStorage.setItem("lms_user", JSON.stringify(userData));

      setSuccess(true);
      toast.success(res.message || "Login successful");
      setTimeout(() => {
        window.location.href = getRedirectByRole(userData.role);
      }, 600);
    } catch (err) {
      const responseData = err.response?.data;
      const attempts = responseData?.data?.remainingAttempts;
      const expiry = responseData?.data?.expiresInSeconds;
      const baseMessage = responseData?.message || err.message || "OTP verification failed";
      const details = [
        attempts !== undefined ? `${attempts} attempts left` : "",
        expiry ? `expires in ${expiry}s` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const message = details ? `${baseMessage} (${details})` : baseMessage;
      setError(message);
      toast.error(baseMessage);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setError("");
    if (!canResend) return;

    setLoading(true);
    try {
      if (flow === "register") {
        setError("Registration OTP resend is not enabled in current backend contract.");
        setLoading(false);
        return;
      }

      const res = await authApi.requestLoginOtp(email);
      setOtpSessionId(res.otpSessionId || "");
      setCooldown(Number(res.cooldownSeconds || 30));
      toast.success(res.message || "OTP resent");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to resend OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={flow === "register" ? "Verify Email" : "Verify Login OTP"}
      subtitle="Enter the 6-digit code sent to your email address."
      eyebrow="LearnMaster Verification"
      highlights={[
        { value: "6-Digit", label: "OTP" },
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
          <span className="text-sm">Verified successfully. Redirecting...</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">One-Time Password</label>
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
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {flow === "login" && (
          <button
            type="button"
            onClick={onResend}
            disabled={loading || !canResend}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {canResend ? "Resend OTP" : `Resend in ${cooldown}s`}
          </button>
        )}
      </div>
    </AuthShell>
  );
}

export default OtpVerify;
