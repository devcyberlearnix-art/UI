// src/pages/OtpVerify.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Shield,
  Clock,
  RefreshCw,
  ArrowLeft,
  KeyRound,
  Sparkles
} from 'lucide-react';
import authApi from '../api/authApi';
import { useAuth } from '../context/AuthContext';

const OtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuthData } = useAuth();
  const inputRefs = useRef([]);
  const redirectTimerRef = useRef(null);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [otpSessionId, setOtpSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timer, setTimer] = useState(300);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Get email from location state or storage
    const emailFromState = location.state?.email;
    const emailFromSession = sessionStorage.getItem('userEmail');
    const emailFromStorage = localStorage.getItem('registrationEmail');
    const userEmail = emailFromState || emailFromSession || emailFromStorage;

    // Get OTP session ID from location state or storage
    const sessionFromState = location.state?.otpSessionId;
    const sessionFromSession = sessionStorage.getItem('otpSessionId');
    const sessionId = sessionFromState || sessionFromSession;

    if (userEmail) {
      setEmail(userEmail);
    }
    if (sessionId) {
      setOtpSessionId(sessionId);
    }

    if (!userEmail || !sessionId) {
      setError('Registration session expired. Please register again.');
      redirectTimerRef.current = setTimeout(() => {
        navigate('/register', { replace: true });
      }, 3000);
    }

    // Start countdown timer
    const timerInterval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    return () => {
      clearInterval(timerInterval);
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [navigate, location.state]);

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(0, 1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerifyOtp(e);
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const lastIndex = Math.min(pastedData.length - 1, 5);
    if (lastIndex >= 0) {
      inputRefs.current[lastIndex]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Cancel any pending fallback redirect to /register
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
    }

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      setLoading(false);
      return;
    }

    try {
      if (!email) {
        setError('Email not found. Please register again.');
        navigate('/register', { replace: true });
        return;
      }

      if (!otpSessionId) {
        setError('OTP session not found. Please register again.');
        navigate('/register', { replace: true });
        return;
      }

      console.log('[OTP] Verifying OTP for:', email);
      
      const response = await authApi.verifyEmail({
        email: email,
        otp: otpString,
        otpSessionId: otpSessionId
      });

      console.log('[OTP] Verification response:', response);

      if (response.success) {
        setSuccess('Email verified successfully!');
        console.log('[OTP] Email verified successfully');
        
        // Clear ALL authentication and session data before redirecting to login
        clearAuthData();
        
        sessionStorage.removeItem('otpSessionId');
        sessionStorage.removeItem('userEmail');
        localStorage.removeItem('registrationEmail');
        
        sessionStorage.setItem('verificationSuccess', 'true');
        
        redirectTimerRef.current = setTimeout(() => {
          navigate('/login', { 
            state: { 
              email: email,
              verificationSuccess: true,
              message: 'Email verified successfully! Please login.'
            },
            replace: true
          });
        }, 1200);
      } else {
        setError(response.message || 'OTP verification failed');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('[OTP] Verification error:', error);
      setError(error.response?.data?.message || 'OTP verification failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      if (!email) {
        setError('Email not found. Please register again.');
        navigate('/register', { replace: true });
        return;
      }

      console.log('[OTP] Resending OTP to:', email);
      
      const response = await authApi.resendOtp({
        email: email,
        otpSessionId: otpSessionId,
        flow: 'registration'
      });
      
      console.log('[OTP] Resend OTP response:', response);
      
      if (response.success) {
        setSuccess('OTP has been resent to your email');
        setResendCooldown(60);
        setTimer(300);
        
        if (response.data?.otpSessionId) {
          sessionStorage.setItem('otpSessionId', response.data.otpSessionId);
          setOtpSessionId(response.data.otpSessionId);
        }
        
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        const timerInterval = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timerInterval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('[OTP] Resend error:', error);
      setError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
                <span className="text-xs font-semibold text-orange-100 uppercase tracking-wider">Secure Verification</span>
              </div>
              <h1 className="text-xl font-bold text-white">Verify Your Email</h1>
              <p className="text-orange-100 text-sm mt-1">
                Enter the 6-digit code sent to your email
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {email && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2 border border-slate-100">
                <Mail size={16} className="text-orange-500 flex-shrink-0" />
                <span className="text-sm text-slate-600 truncate">
                  <span className="font-medium text-slate-700">{email}</span>
                </span>
                <span className="ml-auto text-xs text-slate-400">✓</span>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  key="otp-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  key="otp-success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
                >
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer */}
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-slate-500">Code expires in</span>
              <div className={`flex items-center gap-2 font-mono font-semibold ${timer === 0 ? 'text-red-500' : 'text-orange-600'}`}>
                <Clock size={16} />
                <span>{timer === 0 ? 'Expired' : formatTime(timer)}</span>
              </div>
            </div>

            {/* OTP Input */}
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-slate-700">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                        loading || timer === 0
                          ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                          : error
                          ? 'border-red-300 focus:border-red-400'
                          : 'border-slate-200 focus:border-orange-400'
                      }`}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      maxLength={1}
                      disabled={loading || timer === 0}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="mt-2 text-center text-xs text-slate-400">
                  {timer === 0 
                    ? 'Code has expired. Please request a new one.'
                    : 'Enter the 6-digit code sent to your email'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || timer === 0 || !email || !otpSessionId}
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    Verify OTP
                  </>
                )}
              </button>
            </form>

            {/* Resend and Back actions */}
            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isResending || !email}
                className="flex items-center justify-center gap-2 text-sm font-medium text-orange-600 transition-all hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={16} className={isResending ? 'animate-spin' : ''} />
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : isResending 
                  ? 'Sending...' 
                  : 'Resend OTP'}
              </button>

              <Link 
                to="/register" 
                className="flex items-center justify-center gap-1 text-sm text-slate-500 transition-all hover:text-slate-700"
              >
                <ArrowLeft size={16} />
                Back to Registration
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400">
                Didn't receive the code? Check your spam folder or{' '}
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-orange-600 hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  request a new one
                </button>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Shield size={14} className="text-emerald-500" />
            End-to-End Encrypted
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-emerald-500" />
            Secure Connection
          </span>
        </div>
      </div>
    </div>
  );
};

export default OtpVerify;