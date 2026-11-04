// src/pages/OtpLogin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, ArrowRight, ArrowLeft, Mail, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";
import { validateEmail } from "../utils/validation";

function OtpLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    document.title = "OTP Sign In | Asivo Learning Platform";
  }, []);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setEmailError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Email address is required");
      return;
    }
    if (!validateEmail(trimmed)) {
      setEmailError("Please enter a valid email address (e.g. name@example.com)");
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.requestLoginOtp(trimmed);
      if (result.message) toast.success(result.message);

      navigate("/otp-verify", {
        state: {
          flow: "login",
          email: trimmed,
          otpSessionId: result.otpSessionId,
          cooldownSeconds: result.cooldownSeconds || 30,
        },
      });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "Unable to request login passcode. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell variant="otp" showTerms={false} showBackHome>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] shadow-sm">
            <KeyRound size={22} />
          </div>
          <h1 className="text-2xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
            Sign In with Email OTP
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            Enter your registered email address and we will send a 6-digit verification code.
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

        <form onSubmit={handleSendOtp} noValidate className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="otp-login-email"
              className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
            >
              Email Address <span className="text-[#5B3E57] dark:text-[#D1A7CC]">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} aria-hidden="true" />
              <input
                id="otp-login-email"
                name="email"
                type="email"
                className={`lms-input pl-10 text-xs ${emailError ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                placeholder="name@example.com"
                value={email}
                autoComplete="email"
                aria-required="true"
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? "otp-email-error" : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                disabled={loading}
              />
            </div>
            {emailError && (
              <p id="otp-email-error" className="text-[11px] text-rose-400 font-medium mt-1">
                {emailError}
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
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFFEFA] dark:border-[#151413] border-t-transparent" />
                <span>Sending Code...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Send Verification Code</span>
                <ArrowRight size={15} />
              </span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] text-center space-y-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Return to standard Password Sign In</span>
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}

export default OtpLogin;
