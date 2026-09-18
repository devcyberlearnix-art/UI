import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";

// ✅ Your ngrok base URL (can be overridden via .env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://matted-ascent-specimen.ngrok-free.dev";

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

  // ─── Password Strength Logic ──────────────────────────────────────────
  const passwordStrength = useMemo(() => {
    const password = newPassword;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[$@#&!]/.test(password)) strength += 1;

    let label = "Weak";
    if (strength >= 3 && strength < 5) label = "Medium";
    if (strength === 5) label = "Strong";

    return { strength, label };
  }, [newPassword]);

  // ─── Password Match Logic ─────────────────────────────────────────────
  const passwordsMatch = useMemo(() => {
    if (confirmPassword.length === 0) return null; // Don't show anything if empty
    return newPassword === confirmPassword;
  }, [newPassword, confirmPassword]);

  // Cooldown timer for OTP resend
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => {
      setCooldownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  // ─── Step 1: Request OTP ──────────────────────────────────────────────
  const handleSendOtp = async () => {
    setError("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      const sessionId = data.otpSessionId || data.sessionId || data.data?.otpSessionId || "";
      setOtpSessionId(sessionId);
      setCooldownSeconds(Number(data.cooldownSeconds || data.cooldown || 30));

      toast.success(data.message || "OTP sent to your email");
      setStep(2);
    } catch (err) {
      const message = err.message || "Failed to send OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ──────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!otpSessionId) {
      setError("OTP session expired. Please request OTP again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otpSessionId,
          otp: otp.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      toast.success(data.message || "OTP verified");
      setStep(3);
    } catch (err) {
      const message = err.message || "Invalid OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Reset Password ──────────────────────────────────────────
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

    if (!otpSessionId) {
      setError("OTP session expired. Please restart the process.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otpSessionId,
          newPassword: newPassword.trim(),
          confirmPassword: confirmPassword.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      toast.success(data.message || "Password reset successful");
      navigate("/admin/login");
    } catch (err) {
      const message = err.message || "Password reset failed";
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

      {/* Step indicators */}
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
                disabled={loading}
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
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
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
          {/* New Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">New Password</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="lms-input pl-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                placeholder="Minimum 6 characters"
              />
            </div>
            
            {/* ✅ Cleaned Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                      backgroundColor: passwordStrength.strength <= 2 ? "#ef4444" : passwordStrength.strength <= 4 ? "#f59e0b" : "#10b981"
                    }}
                  />
                </div>
                <span className={`text-xs font-bold ${passwordStrength.strength <= 2 ? "text-red-500" : passwordStrength.strength <= 4 ? "text-amber-500" : "text-emerald-500"}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Confirm New Password</label>
            <div className="relative">
              <ShieldCheck size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="lms-input pl-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="Re-enter new password"
              />
            </div>
            
            {/* ✅ Password Match / Do Not Match Indicator */}
            {passwordsMatch !== null && (
              <div className="mt-1.5 flex items-center gap-1.5 text-sm">
                {passwordsMatch ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-emerald-600 font-medium">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-500" />
                    <span className="text-red-600 font-medium">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
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