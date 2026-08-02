// src/pages/admin/AdminLogin.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, Key, RefreshCw } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";
import toast from "react-hot-toast";

const AdminLogin = () => {
  const location = useLocation();
  const [loginMethod, setLoginMethod] = useState("password"); // 'password' or 'otp'
  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpResending, setOtpResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, user } = useAuth();

  // Show success message from registration
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('[AdminLogin] Already authenticated, checking role...');
      console.log('[AdminLogin] User:', user);
      
      const userRole = user?.role || user?.role1 || user?.userRole || '';
      console.log('[AdminLogin] User role:', userRole);
      
      // ✅ Redirect based on role
      if (userRole.toLowerCase().includes('super_admin') || userRole.toLowerCase().includes('admin')) {
        window.location.href = "/admin/dashboard";
      } else if (userRole.toLowerCase().includes('sub_admin')) {
        window.location.href = "/admin/sub-dashboard";
      } else {
        window.location.href = "/student/dashboard";
      }
    }
  }, [isAuthenticated, authLoading, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    const emailStr = typeof email === 'string' ? email : String(email || '');
    const passwordStr = typeof password === 'string' ? password : String(password || '');
    
    if (!emailStr || emailStr.trim() === "") {
      setError("Email is required");
      toast.error("Email is required");
      return;
    }
    if (!passwordStr || passwordStr.trim() === "") {
      setError("Password is required");
      toast.error("Password is required");
      return;
    }

    setLoading(true);
    
    try {
      console.log('[AdminLogin] Attempting password login for:', emailStr);
      
      const result = await login(emailStr.trim(), passwordStr);
      
      console.log('[AdminLogin] Login result:', result);
      
      if (result.success) {
        console.log('[AdminLogin] Login successful!');
        console.log('[AdminLogin] User data:', result.user);
        
        const userRole = result.user?.role || result.user?.role1 || '';
        console.log('[AdminLogin] User role:', userRole);
        
        toast.success("Login successful!");
        
        // ✅ Redirect based on role
        if (userRole.toLowerCase().includes('super_admin') || userRole.toLowerCase().includes('admin')) {
          console.log('[AdminLogin] Redirecting to Admin Dashboard');
          window.location.href = "/admin/dashboard";
        } else if (userRole.toLowerCase().includes('sub_admin')) {
          console.log('[AdminLogin] Redirecting to Sub-Admin Dashboard');
          window.location.href = "/admin/sub-dashboard";
        } else {
          console.log('[AdminLogin] Redirecting to Student Dashboard');
          window.location.href = "/student/dashboard";
        }
      } else {
        setError(result.error || "Login failed");
        toast.error(result.error || "Login failed");
      }
    } catch (err) {
      console.error('[AdminLogin] Error:', err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    
    const emailStr = typeof email === 'string' ? email : String(email || '');
    
    if (!emailStr || emailStr.trim() === "") {
      setError("Email is required");
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    
    try {
      console.log('[AdminLogin] Requesting OTP for:', emailStr);
      
      await authApi.requestLoginOtp(emailStr.trim());
      
      setOtpSent(true);
      toast.success("OTP sent to your email!");
      console.log('[AdminLogin] OTP sent successfully');
    } catch (err) {
      console.error('[AdminLogin] Error sending OTP:', err);
      setError(err.response?.data?.message || "Failed to send OTP");
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    const emailStr = typeof email === 'string' ? email : String(email || '');
    const otpStr = typeof otp === 'string' ? otp : String(otp || '');
    
    if (!emailStr || emailStr.trim() === "") {
      setError("Email is required");
      toast.error("Email is required");
      return;
    }
    if (!otpStr || otpStr.trim() === "") {
      setError("OTP is required");
      toast.error("OTP is required");
      return;
    }

    setLoading(true);
    
    try {
      console.log('[AdminLogin] Verifying OTP for:', emailStr);
      
      const response = await authApi.verifyLoginOtp(emailStr.trim(), otpStr.trim());
      console.log('[AdminLogin] OTP verification response:', response);
      
      // Extract token and user data from OTP response
      const tokenData = response.authentication?.accessToken || 
                      response.authentication?.token ||
                      response.accessToken || 
                      response.token || 
                      response.access_token;
      
      const userInfo = response.user || response;
      const userData = {
        id: userInfo.id || userInfo.userId,
        firstName: userInfo.firstName || userInfo.name || '',
        lastName: userInfo.lastName || '',
        name: userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName || ''}`.trim() : userInfo.name || '',
        email: userInfo.email || emailStr,
        mobileNumber: userInfo.mobileNumber || userInfo.mobile || '',
        role: userInfo.role || userInfo.role1 || userInfo.userRole || 'admin',
        permissions: userInfo.permissions || [],
        assignedService: userInfo.assignedService || '',
      };
      
      // Store in localStorage
      localStorage.setItem('lms_token', tokenData);
      localStorage.setItem('access_token', tokenData);
      sessionStorage.setItem('lms_token', tokenData);
      localStorage.setItem('lms_user', JSON.stringify(userData || {}));
      
      const userRole = userData.role;
      console.log('[AdminLogin] User role:', userRole);
      
      toast.success("Login successful!");
      
      // ✅ Redirect based on role
      if (userRole.toLowerCase().includes('super_admin') || userRole.toLowerCase().includes('admin')) {
        console.log('[AdminLogin] Redirecting to Admin Dashboard');
        window.location.href = "/admin/dashboard";
      } else if (userRole.toLowerCase().includes('sub_admin')) {
        console.log('[AdminLogin] Redirecting to Sub-Admin Dashboard');
        window.location.href = "/admin/sub-dashboard";
      } else {
        console.log('[AdminLogin] Redirecting to Student Dashboard');
        window.location.href = "/student/dashboard";
      }
    } catch (err) {
      console.error('[AdminLogin] Error verifying OTP:', err);
      setError(err.response?.data?.message || "Invalid OTP");
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const emailStr = typeof email === 'string' ? email : String(email || '');
    
    if (!emailStr || emailStr.trim() === "") {
      setError("Email is required");
      toast.error("Email is required");
      return;
    }

    setOtpResending(true);
    
    try {
      await authApi.resendOtp(emailStr.trim());
      toast.success("OTP resent successfully!");
    } catch (err) {
      console.error('[AdminLogin] Error resending OTP:', err);
      toast.error("Failed to resend OTP");
    } finally {
      setOtpResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-orange-100 rounded-full">
            <LogIn size={32} className="text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold mt-2 text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to access your dashboard</p>
        </div>

        {/* Login Method Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setLoginMethod('password');
              setOtpSent(false);
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              loginMethod === 'password'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMethod('otp');
              setOtpSent(false);
              setError("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              loginMethod === 'otp'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            OTP
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {loginMethod === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Logging in...
                </span>
              ) : (
                "Login with Password"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleOtpLogin : handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || otpSent}
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  OTP
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">OTP sent to your email</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpResending}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    {otpResending ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-600 border-t-transparent"></div>
                        Resending...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={12} />
                        Resend OTP
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2.5 rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {otpSent ? 'Verifying...' : 'Sending...'}
                </span>
              ) : (
                otpSent ? 'Verify OTP' : 'Send OTP'
              )}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-sm text-orange-600 hover:text-orange-700 transition">
            Forgot Password?
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;