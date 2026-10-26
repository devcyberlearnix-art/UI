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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#1455d9]"></div>
          <p className="text-slate-600">Loading...</p>
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
        const isUnverified = result.originalError?.response?.data?.message?.toLowerCase().includes("not verified") || 
                             result.originalError?.response?.data?.message?.toLowerCase().includes("verify your email") || 
                             result.error?.toLowerCase().includes("not verified") || 
                             result.error?.toLowerCase().includes("unverified") || 
                             result.error?.toLowerCase().includes("verify your email");
                             
        const errorOtpSessionId = result.originalError?.response?.data?.data?.otpSessionId || 
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
    <AuthShell variant="signup" showTerms={false} showCardBrand wide>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 text-center">
          <div className="cyber-login-icon">
            <LogIn size={30} />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-[#10284e]">Sign In</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your account credentials to continue</p>
        </div>

        <div className="cyber-login-tabs mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("password");
              setError("");
              setOtpSent(false);
              setOtp("");
              setOtpSessionId("");
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              loginMethod === "password" ? "bg-[#1455d9] text-white shadow" : "text-slate-600 hover:text-[#10284e]"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("otp");
              setError("");
              setPassword("");
            }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                loginMethod === "otp" ? "bg-[#1455d9] text-white shadow" : "text-slate-600 hover:text-[#10284e]"
            }`}
          >
            OTP
          </button>
        </div>

        {error && (
          <div className="mb-4 flex flex-col gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
            {unverifiedSession && (
              <button
                type="button"
                onClick={() => navigate("/otp-verify", {
                  state: {
                    email,
                    flow: "register",
                    otpSessionId: unverifiedSession,
                    cooldownSeconds: 30,
                  }
                })}
                className="mt-2 self-start text-sm font-semibold text-[#1455d9] hover:text-[#0d47bc]"
              >
                Verify Email Now &rarr;
              </button>
            )}
          </div>
        )}

        {loginMethod === "password" ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="lms-input pl-10"
                  value={email}
                  autoComplete="email"
                  aria-label="Email address"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="lms-input pl-10 pr-10"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !isValidEmail(email) || !password.trim()} className="lms-btn-primary">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="lms-input pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || otpSent}
                />
              </div>
            </div>

            {!otpSent ? (
              <button type="button" onClick={handleSendOtp} disabled={loading || !isValidEmail(email)} className="lms-btn-primary">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <form onSubmit={handleOtpLogin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">One-Time Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="lms-input pl-10"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      maxLength={6}
                      disabled={loading}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading || otp.length !== 6} className="lms-btn-primary">
                  {loading ? "Verifying..." : "Verify and Login"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpResending || !canResend}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#1455d9] hover:text-[#1455d9] disabled:opacity-60"
                >
                  <RefreshCw size={16} className={otpResending ? "animate-spin" : ""} />
                  {otpResending ? "Resending..." : canResend ? "Resend OTP" : `Resend in ${cooldownSeconds}s`}
                </button>
              </form>
            )}
          </div>
        )}

        <div className="mt-6 space-y-2 text-center">
          <Link to="/register" className="lms-link block text-sm">
            Don't have an account? Register
          </Link>
           <Link to="/forgot-password" className="block text-sm text-slate-500 transition hover:text-[#1455d9]">
            Forgot Password?
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
};

export default Login;
