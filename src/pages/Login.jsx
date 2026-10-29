// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle, KeyRound, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";
import { getDashboardPath } from "../context/AuthContext";
import { parseApiError } from "../utils/apiErrorParser";
import { validateEmail as isValidEmail } from "../utils/validation";
import SocialAuthButtons from "../components/ui/SocialAuthButtons";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 26,
};

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("password");
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.prefillEmail || "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedSession, setUnverifiedSession] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const canResend = cooldownSeconds === 0;

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const storedUser = JSON.parse(localStorage.getItem("lms_user") || "{}");
      navigate(getDashboardPath(storedUser?.role || storedUser?.role1 || storedUser?.userRole), { replace: true });
    }
  }, [isAuthenticated, navigate, authLoading]);

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setTimeout(() => {
      setCooldownSeconds((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldownSeconds]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#C5A880] border-t-transparent" />
          <p className="text-xs font-mono text-[#8E8E93]">Initializing secure session...</p>
        </div>
      </div>
    );
  }

  const validateEmail = () => {
    if (!email || !isValidEmail(email)) {
      setError("Enter a valid email address");
      toast.error("Enter a valid email address");
      return false;
    }
    return true;
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail()) return;
    if (!password || password.trim() === "") {
      setError("Password is required");
      toast.error("Password is required");
      return;
    }

    setLoading(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        if (result.message) toast.success(result.message);
        navigate(getDashboardPath(result.user?.role || result.user?.role1 || result.user?.userRole), { replace: true });
      } else {
        const isUnverified =
          result.originalError?.response?.data?.message?.toLowerCase().includes("not verified") ||
          result.originalError?.response?.data?.message?.toLowerCase().includes("verify your email") ||
          result.error?.toLowerCase().includes("not verified") ||
          result.error?.toLowerCase().includes("unverified") ||
          result.error?.toLowerCase().includes("verify your email");

        const errorOtpSessionId =
          result.originalError?.response?.data?.data?.otpSessionId ||
          result.originalError?.response?.data?.otpSessionId;

        if (result.error) {
          setError(result.error);
          toast.error(result.error);
        }

        if (isUnverified && errorOtpSessionId) {
          setUnverifiedSession(errorOtpSessionId);
        } else {
          setUnverifiedSession("");
        }
      }
    } catch (err) {
      const parsed = parseApiError(err, "");
      if (parsed.message) {
        setError(parsed.message);
        toast.error(parsed.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setError("");
    if (!validateEmail()) return;

    setLoading(true);
    try {
      const res = await authApi.requestLoginOtp(email.trim());
      setOtpSessionId(res.otpSessionId || "");
      setCooldownSeconds(Number(res.cooldownSeconds || 30));
      setOtpSent(true);
      if (res.message) toast.success(res.message);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "";
      if (message) {
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail()) return;
    if (!otp || !otp.trim()) {
      setError("OTP is required");
      toast.error("OTP is required");
      return;
    }
    if (!otpSessionId) {
      setError("");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.verifyLoginOtp({
        email: email.trim(),
        otpSessionId,
        otp: otp.trim(),
      });

      const tokenData =
        response.authentication?.accessToken ||
        response.authentication?.token ||
        response.accessToken ||
        response.token ||
        response.access_token;
      const refreshToken =
        response.authentication?.refreshToken || response.refreshToken || response.refresh_token || null;

      if (!tokenData) {
        throw new Error("No token received from OTP verification");
      }

      const userInfo = response.user || response;
      const userData = {
        id: userInfo.id || userInfo.userId,
        firstName: userInfo.firstName || "",
        lastName: userInfo.lastName || "",
        name: userInfo.firstName
          ? `${userInfo.firstName} ${userInfo.lastName || ""}`.trim()
          : userInfo.name || "",
        email: userInfo.email || email,
        role: userInfo.role || userInfo.role1 || userInfo.userRole || userInfo.effectiveRole || "student",
      };

      localStorage.setItem("lms_token", tokenData);
      localStorage.setItem("access_token", tokenData);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      sessionStorage.setItem("lms_token", tokenData);
      localStorage.setItem("lms_user", JSON.stringify(userData));

      toast.success(response.message || "Login successful!");
      navigate(getDashboardPath(userData.role), { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || "";
      if (message) {
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    if (!validateEmail()) return;
    if (!canResend) return;

    setOtpResending(true);
    try {
      const res = await authApi.resendOtp({ flow: "login", email: email.trim() });
      setOtpSessionId(res.otpSessionId || "");
      setCooldownSeconds(Number(res.cooldownSeconds || 30));
      if (res.message) toast.success(res.message);
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "";
      if (message) {
        setError(message);
        toast.error(message);
      }
    } finally {
      setOtpResending(false);
    }
  };

  return (
    <AuthShell variant="split" showTerms={false} showBackHome>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_TRANSITION}
        className="space-y-6"
      >
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-sm">
            <LogIn className="w-5 h-5 text-[#C5A880]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#F5F5F7] tracking-tight">
            Sign In
          </h1>
          <p className="text-xs text-[#8E8E93]">
            Enter your account credentials to access your workspace.
          </p>
        </div>

        {/* Method Switcher Tabs with Kinetic Morphing */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#14141A] border border-white/[0.04]">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("password");
              setError("");
              setOtpSent(false);
              setOtp("");
              setOtpSessionId("");
            }}
            className={`relative py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              loginMethod === "password" ? "text-[#070709] font-bold" : "text-[#8E8E93] hover:text-[#F5F5F7]"
            }`}
          >
            {loginMethod === "password" && (
              <motion.div
                layoutId="activeLoginTab"
                className="absolute inset-0 bg-[#C5A880] rounded-xl shadow-sm -z-10"
                transition={SPRING_TRANSITION}
              />
            )}
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginMethod("otp");
              setError("");
              setPassword("");
            }}
            className={`relative py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
              loginMethod === "otp" ? "text-[#070709] font-bold" : "text-[#8E8E93] hover:text-[#F5F5F7]"
            }`}
          >
            {loginMethod === "otp" && (
              <motion.div
                layoutId="activeLoginTab"
                className="absolute inset-0 bg-[#C5A880] rounded-xl shadow-sm -z-10"
                transition={SPRING_TRANSITION}
              />
            )}
            <span>OTP Code</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex flex-col gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-400 text-xs">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            {unverifiedSession && (
              <button
                type="button"
                onClick={() =>
                  navigate("/otp-verify", {
                    state: {
                      email,
                      flow: "register",
                      otpSessionId: unverifiedSession,
                      cooldownSeconds: 30,
                    },
                  })
                }
                className="mt-1 self-start text-xs font-bold text-[#C5A880] hover:underline"
              >
                Verify Email Now &rarr;
              </button>
            )}
          </div>
        )}

        {/* Password Form */}
        {loginMethod === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} />
                <input
                  type="email"
                  placeholder="name@enterprise.io"
                  className="lms-input pl-10 text-xs"
                  value={email}
                  autoComplete="email"
                  aria-label="Email address"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-[#8E8E93] hover:text-[#C5A880] transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="lms-input pl-10 pr-10 text-xs"
                  value={password}
                  autoComplete="current-password"
                  aria-label="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F5F5F7] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isValidEmail(email) || !password.trim()}
              className="lms-btn-primary cursor-pointer active:scale-98"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#070709] border-t-transparent" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        ) : (
          /* OTP Form */
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} />
                <input
                  type="email"
                  placeholder="name@enterprise.io"
                  className="lms-input pl-10 text-xs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || otpSent}
                />
              </div>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading || !isValidEmail(email)}
                className="lms-btn-primary cursor-pointer active:scale-98"
              >
                {loading ? "Generating OTP..." : "Send Verification OTP"}
              </button>
            ) : (
              <form onSubmit={handleOtpLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-1.5">
                    One-Time Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" size={16} />
                    <input
                      type="text"
                      placeholder="6-digit code"
                      className="lms-input pl-10 text-xs font-mono tracking-widest text-center"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="lms-btn-primary cursor-pointer active:scale-98"
                >
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpResending || !canResend}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.04] bg-[#14141A] px-4 py-2.5 text-xs font-semibold text-[#8E8E93] hover:text-[#F5F5F7] hover:border-white/[0.08] transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={otpResending ? "animate-spin text-[#C5A880]" : ""} />
                  {otpResending ? "Resending..." : canResend ? "Resend Passcode" : `Resend in ${cooldownSeconds}s`}
                </button>
              </form>
            )}
          </div>
        )}

        <SocialAuthButtons mode="signin" />

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/[0.04] text-center space-y-2">
          <p className="text-xs text-[#8E8E93]">
            Don't have an engineering account?{" "}
            <Link to="/register" className="text-[#C5A880] hover:text-[#D4BC98] font-bold transition-colors">
              Register now
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthShell>
  );
};

export default Login;
