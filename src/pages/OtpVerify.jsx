import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

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
  const { syncSession } = useAuth();

  const flow = location.state?.flow || "register";
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
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
        const res = await authApi.verifyEmail({ email, otp, otpSessionId });
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

      syncSession(userData, tokenData, refreshToken);

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

    if (!otpSessionId) {
      setError("OTP session expired. Please register again.");
      return;
    }

    setResending(true);
    try {
      const response = await authApi.resendOtp({ flow, email, otpSessionId });
      const res = response.data || response;
      setOtpSessionId(res.otpSessionId || otpSessionId);
      setOtp("");
      setCooldown(Number(res.cooldownSeconds || 30));
      toast.success(response.message || res.message || "OTP resent");
    } catch (err) {
      const responseData = err.response?.data;
      const retryAfter = Number(responseData?.data?.cooldownSeconds || 0);
      if (retryAfter > 0) {
        setCooldown(retryAfter);
      }
      const message = responseData?.message || "Failed to resend OTP";
      setError(message);
      toast.error(message);
    } finally {
      setResending(false);
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">Code sent to {email || "your email"}</p>
        {flow === "register" && (
          <button
            type="button"
            onClick={() =>
              navigate("/register", {
                state: {
                  registrationDraft: {
                    ...location.state?.registrationDraft,
                    email: "",
                  },
                  photoUrl: location.state?.photoUrl,
                  emailCorrection: { email, otpSessionId },
                },
              })
            }
            disabled={loading || success}
            className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 transition hover:text-orange-700 disabled:opacity-60"
          >
            <ArrowLeft size={15} /> Wrong email? Go back
          </button>
        )}
      </div>

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

        <button
          type="button"
          onClick={onResend}
          disabled={loading || resending || success || !canResend}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60"
        >
          <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
          {resending ? "Sending..." : canResend ? "Resend OTP" : `Resend in ${cooldown}s`}
        </button>
      </div>
    </AuthShell>
  );
}

export default OtpVerify;
