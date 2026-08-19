import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, KeyRound, Lock, LogIn, Mail, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth, normalizeRole } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import AuthShell from "../../components/ui/AuthShell";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading, user } = useAuth();

  const [loginMethod, setLoginMethod] = useState("password");
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [error, setError] = useState("");

  const canResend = cooldownSeconds === 0;

  const getRedirectByRole = (roleValue) => {
    const role = normalizeRole(roleValue);
    if (role === "subadmin") return "/admin/sub-dashboard";
    if (role === "admin") return "/admin/dashboard";
    if (role === "instructor") return "/instructor/dashboard";
    return "/student/dashboard";
  };

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(getRedirectByRole(user?.role || user?.role1 || user?.userRole), { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, user]);

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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const validateEmail = () => {
    if (!email || !email.trim()) {
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
    if (!password || !password.trim()) {
      setError("Password is required");
      toast.error("Password is required");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        const message = result.error || "Login failed";
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Login successful!");
      navigate(getRedirectByRole(result.user?.role || result.user?.role1 || result.user?.userRole), {
        replace: true,
      });
    } catch {
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
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

    setLoading(true);
    try {
      if (!otpSessionId) {
        throw new Error("OTP session expired. Please request OTP again.");
      }

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

      if (!tokenData) {
        throw new Error("No token received from OTP verification");
      }

      const userInfo = response.user || response;
      const userData = {
        id: userInfo.id || userInfo.userId,
        firstName: userInfo.firstName || userInfo.name || "",
        lastName: userInfo.lastName || "",
        name: userInfo.firstName
          ? `${userInfo.firstName} ${userInfo.lastName || ""}`.trim()
          : userInfo.name || "",
        email: userInfo.email || email,
        mobileNumber: userInfo.mobileNumber || userInfo.mobile || "",
        role: normalizeRole(userInfo.role || userInfo.role1 || userInfo.userRole || "admin"),
        permissions: userInfo.permissions || [],
        assignedService: userInfo.assignedService || "",
      };

      localStorage.setItem("lms_token", tokenData);
      localStorage.setItem("access_token", tokenData);
      const refreshToken = response.authentication?.refreshToken || response.refreshToken || null;
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }
      sessionStorage.setItem("lms_token", tokenData);
      localStorage.setItem("lms_user", JSON.stringify(userData || {}));

      toast.success("Login successful!");
      window.location.href = getRedirectByRole(userData.role);
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
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setOtpResending(false);
    }
  };

  return (
    <AuthShell
      title="Admin Control Access"
      subtitle="Secure gateway for operations, analytics, and platform orchestration with frictionless authentication."
      eyebrow="LearnMaster Operations"
      highlights={[
        { value: "SOC", label: "Secure" },
        { value: "OTP", label: "Enabled" },
        { value: "24/7", label: "Control" },
      ]}
    >
      <div className="mb-8 text-center">
        <div className="inline-flex rounded-2xl bg-gradient-to-r from-orange-500 to-cyan-600 p-3 text-white shadow-lg">
          <LogIn size={30} />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Admin Sign In</h1>
        <p className="mt-1 text-sm text-slate-500">Choose password or one-time code login</p>
      </div>

      <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setLoginMethod("password");
            setOtpSent(false);
            setError("");
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
            setOtpSent(false);
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
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {loginMethod === "password" && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                className="lms-input pl-10"
                placeholder="admin@example.com"
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
                type={showPassword ? "text" : "password"}
                className="lms-input pl-10 pr-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="lms-btn-primary">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      )}

      {loginMethod === "otp" && (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                className="lms-input pl-10"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || otpSent}
              />
            </div>
          </div>

          {!otpSent ? (
            <button onClick={handleSendOtp} disabled={loading} className="lms-btn-primary" type="button">
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
                    className="lms-input pl-10"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    disabled={loading}
                  />
                </div>
              </div>
              <button type="submit" disabled={loading} className="lms-btn-primary">
                {loading ? "Verifying..." : "Verify and Sign In"}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpResending || !canResend}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
              >
                <RefreshCw size={16} className={otpResending ? "animate-spin" : ""} />
                {otpResending ? "Resending..." : canResend ? "Resend OTP" : `Resend in ${cooldownSeconds}s`}
              </button>
            </form>
          )}
        </div>
      )}

      <div className="mt-6 space-y-2 text-center">
        <Link to="/forgot-password" className="lms-link text-sm">
          Forgot Password?
        </Link>
        <p className="text-sm text-slate-500">
          Need user login? <Link to="/login" className="lms-link">Go to learner sign in</Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default AdminLogin;
