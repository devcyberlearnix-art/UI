import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "../api/authApi";
import AuthShell from "../components/ui/AuthShell";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpSessionId, setOtpSessionId] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const canResend = cooldownSeconds === 0;

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => {
      setCooldownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  const handleSendOtp = async () => {
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.requestForgotPasswordOtp(email);
      setOtpSessionId(result.otpSessionId || "");
      setCooldownSeconds(Number(result.cooldownSeconds || 30));
      toast.success(result.message || "OTP sent to your email");
      setStep(2);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      if (!otpSessionId) {
        throw new Error("OTP session expired. Please request OTP again.");
      }

      await authApi.verifyPasswordOtp({ email, otpSessionId, otp });
      toast.success("OTP verified");
      setStep(3);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Invalid OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      if (!otpSessionId) {
        throw new Error("OTP session expired. Please request OTP again.");
      }

      await authApi.resetPassword({ email, otpSessionId, newPassword, confirmPassword });
      toast.success("Password reset successful");
      navigate("/admin/login");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Password reset failed";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Account Recovery"
      subtitle="Secure multi-step password reset with verification and instant access restoration."
      eyebrow="LearnMaster Security"
      highlights={[
        { value: "3-Step", label: "Recovery" },
        { value: "OTP", label: "Verification" },
        { value: "Encrypted", label: "Flow" },
      ]}
    >
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Reset Password</h1>
      <p className="mb-6 text-sm text-slate-500">Follow the secure flow to regain access</p>

      <div className="mb-6 flex items-center gap-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                step >= item ? "bg-orange-500 text-white" : "bg-slate-200 text-slate-500"
              }`}
            >
              {item}
            </div>
            {item < 3 && <div className={`h-1 w-8 rounded ${step > item ? "bg-orange-500" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                className="lms-input pl-10"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <button onClick={handleSendOtp} disabled={loading} className="lms-btn-primary">
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Enter OTP</label>
            <div className="relative">
              <KeyRound size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="lms-input pl-10"
                placeholder="6-digit code"
                value={otp}
                maxLength={6}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          </div>
          <button onClick={handleVerifyOtp} disabled={loading} className="lms-btn-primary">
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button
            type="button"
            disabled={loading || !canResend}
            onClick={handleSendOtp}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60"
          >
            {canResend ? "Resend OTP" : `Resend in ${cooldownSeconds}s`}
          </button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="lms-input pl-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
            <div className="relative">
              <ShieldCheck size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="lms-input pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <button onClick={handleResetPassword} disabled={loading} className="lms-btn-primary">
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-slate-500">
        <button onClick={() => navigate("/admin/login")} className="lms-link inline-flex items-center gap-1">
          <CheckCircle size={15} /> Back to Sign In
        </button>
      </div>
    </AuthShell>
  );
};

export default ForgotPassword;
