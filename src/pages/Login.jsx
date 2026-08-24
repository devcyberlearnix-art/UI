// src/pages/Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield
} from 'lucide-react';
import authApi from '../api/authApi';
import { useAuth, getDashboardPath } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, clearAuthData, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    // Check if user came from verification
    if (location.state?.verificationSuccess) {
      setSuccess(location.state.message || 'Email verified successfully! Please login.');
      // Clear the state to prevent showing the message again
      window.history.replaceState({}, document.title);
    }
    
    // Pre-fill email if provided from verification
    if (location.state?.email) {
      setCredentials(prev => ({
        ...prev,
        email: location.state.email
      }));
    }

    // Check authentication status
    const checkAuth = async () => {
      try {
        // Small delay to ensure all state is settled
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const token = authApi.getToken();
        
        if (token) {
          const isValid = authApi.isAuthenticated();
          if (isValid) {
            const currentUser = authApi.getCurrentUser() || user;
            const targetPath = getDashboardPath(currentUser?.role || currentUser?.normalizedRole || currentUser?.role1 || currentUser?.userRole);
            console.log('[Login] User already authenticated, redirecting to:', targetPath);
            navigate(targetPath, { replace: true });
            return;
          } else {
            console.log('[Login] Invalid token found, clearing...');
            clearAuthData();
          }
        } else {
          console.log('[Login] No token found, showing login form');
        }
      } catch (err) {
        console.error('[Login] Auth check error:', err);
        clearAuthData();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [location, navigate, clearAuthData, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('[Login] Attempting login for:', credentials.email);
      
      const result = await login(credentials.email, credentials.password);
      console.log('[Login] Login result:', result);

      if (result.success) {
        let userData = result.data || result.user || {};
        const role = userData.role || userData.role1 || userData.userRole || userData.normalizedRole;
        const targetPath = getDashboardPath(role);

        setSuccess('Login successful! Redirecting...');
        console.log('[Login] Authentication successful, redirecting to:', targetPath);
        
        // Auto-upload pending profile photo from registration
        const pendingPhoto = sessionStorage.getItem('pendingProfilePhoto') || localStorage.getItem('pendingProfilePhoto');
        if (pendingPhoto) {
          console.log('[Login] Uploading pending registration profile photo...');
          try {
            const arr = pendingPhoto.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            const photoFile = new File([u8arr], 'profile-photo.png', { type: mime });
            const photoRes = await authApi.uploadProfilePhoto(photoFile);
            console.log('[Login] Auto-uploaded profile photo:', photoRes);
            
            sessionStorage.removeItem('pendingProfilePhoto');
            localStorage.removeItem('pendingProfilePhoto');
          } catch (photoErr) {
            console.warn('[Login] Could not auto-upload profile photo:', photoErr);
          }
        }
        
        redirectTimerRef.current = setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 600);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('[Login] Login error:', err);
      
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 403) {
        setError('Account not verified. Please check your email for verification link.');
      } else {
        setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-6">
            <div className="absolute top-0 right-0 opacity-10">
              <Sparkles size={80} />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={20} className="text-white" />
                <span className="text-xs font-semibold text-orange-100 uppercase tracking-wider">Welcome Back</span>
              </div>
              <h1 className="text-xl font-bold text-white">Sign In</h1>
              <p className="text-orange-100 text-sm mt-1">
                Continue your learning journey
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence>
              {success && (
                <motion.div
                  key="login-success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                >
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}

              {error && (
                <motion.div
                  key="login-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={credentials.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="you@example.com"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 pl-10 pr-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-orange-600 hover:underline font-medium">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Shield size={14} className="text-emerald-500" />
            Secure Login
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-emerald-500" />
            Protected Account
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;