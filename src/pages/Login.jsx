// src/pages/Login.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle, KeyRound, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, normalizeRole } from "../context/AuthContext";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";

const Login = () => {
  const [loginMethod, setLoginMethod] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const canResend = cooldownSeconds === 0;

  const getRedirectByRole = (roleValue) => {
    const role = normalizeRole(roleValue);
    if (role === "subadmin") return "/admin/sub-dashboard";
    if (role === "admin") return "/admin/dashboard";
    if (role === "instructor") return "/instructor/dashboard";
    return "/student/dashboard";
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const storedUser = JSON.parse(localStorage.getItem("lms_user") || "{}");
      navigate(getRedirectByRole(storedUser?.role || storedUser?.role1 || storedUser?.userRole), { replace: true });
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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const validateEmail = () => {
    if (!email || email.trim() === "") {
      setError("Email is required");
      toast.error("Email is required");
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
      const result = await login(email.trim(), password.trim());
      
      if (result.success) {
        toast.success("Login successful!");
        navigate(getRedirectByRole(result.user?.role || result.user?.role1 || result.user?.userRole), { replace: true });
      } else {
        setError(result.error || "Login failed");
        toast.error(result.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
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
      toast.success(res.message || "OTP sent to your email");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send OTP";
      setError(message);
      toast.error(message);
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
      const message = "OTP session expired. Please request OTP again.";
      setError(message);
      toast.error(message);
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
        role: normalizeRole(userInfo.role || userInfo.role1 || userInfo.userRole || userInfo.effectiveRole || "student"),
      };

      localStorage.setItem("lms_token", tokenData);
      localStorage.setItem("access_token", tokenData);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      sessionStorage.setItem("lms_token", tokenData);
      localStorage.setItem("lms_user", JSON.stringify(userData));

      toast.success(response.message || "Login successful!");
      navigate(getRedirectByRole(userData.role), { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Invalid OTP";
      setError(message);
      toast.error(message);
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
      toast.success(res.message || "OTP resent successfully");
    } catch (err) {
      const message = err.response?.data?.message || "Failed to resend OTP";
      setError(message);
      toast.error(message);
    } finally {
      setOtpResending(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="A unified, modern LMS experience with smooth navigation, polished transitions, and a premium learning interface."
      eyebrow="LearnMaster Access"
      highlights={[
        { value: "Live", label: "Progress" },
        { value: "Fast", label: "Onboarding" },
        { value: "Secure", label: "Authentication" },
      ]}
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 text-center">
          <div className="inline-flex rounded-2xl bg-gradient-to-r from-orange-500 to-cyan-600 p-3 text-white shadow-lg">
            <LogIn size={30} />
          </div>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Sign In</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your account credentials to continue</p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setLoginMethod("password");
              setError("");
              setOtpSent(false);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              loginMethod === "password" ? "bg-white text-orange-600 shadow" : "text-slate-600"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod("otp");
              setError("");
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              loginMethod === "otp" ? "bg-white text-orange-600 shadow" : "text-slate-600"
            }`}
          >
            OTP
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
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
                  type="password"
                  placeholder="Enter your password"
                  className="lms-input pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="lms-btn-primary">
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
              <button type="button" onClick={handleSendOtp} disabled={loading} className="lms-btn-primary">
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

                <button type="submit" disabled={loading} className="lms-btn-primary">
                  {loading ? "Verifying..." : "Verify and Login"}
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpResending || !canResend}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-60"
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
          <Link to="/forgot-password" className="block text-sm text-slate-500 transition hover:text-orange-600">
            Forgot Password?
          </Link>
          <Link to="/otp-login" className="block text-sm text-slate-500 transition hover:text-orange-600">
            Open OTP Login Page
          </Link>
          <Link to="/admin/login" className="block text-sm text-slate-500 transition hover:text-cyan-700">
            Admin Sign In
          </Link>
        </div>
      </motion.div>
    </AuthShell>
  );
};

export default Login;