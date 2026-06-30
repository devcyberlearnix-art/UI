import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield, Clock, RefreshCw, CheckCircle, AlertCircle, ArrowLeft,
  Sparkles, Trophy, Briefcase, GraduationCap as GradCap,
  Mail, Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "https://iodine-pesticide-bulge.ngrok-free.dev";

function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("userEmail") || "";
  const { login } = useAuth();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isRegistration, setIsRegistration] = useState(false);
  const [userData, setUserData] = useState(null);
  const inputRefs = useRef([]);

  // Check if it's registration or login OTP
  useEffect(() => {
    const tempData = localStorage.getItem("tempUserData");
    if (tempData) {
      setIsRegistration(true);
      try {
        const parsed = JSON.parse(tempData);
        setUserData(parsed);
      } catch (e) {
        console.error("Error parsing tempUserData:", e);
      }
    }
    
    if (!email) {
      navigate("/register");
      return;
    }
  }, [email, navigate]);

  // Auto focus and timer
  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (value, index) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, idx) => { if (idx < 6) newOtp[idx] = digit; });
      setOtp(newOtp);
      const lastIndex = Math.min(digits.length, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  // VERIFY OTP
  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let response;
      let result;

      if (isRegistration) {
        // REGISTRATION OTP VERIFICATION
        response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ 
            email: email, 
            otp: otpValue 
          }),
        });
      } else {
        // LOGIN OTP VERIFICATION
        response = await fetch(`${API_BASE_URL}/auth/login/otp/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: otpValue }),
        });
      }

      result = await response.json();

      if (!response.ok || !result.success) {
        let errorMsg = result.message || "Invalid OTP. Please try again.";
        if (result.data?.remainingAttempts !== undefined) {
          errorMsg += ` (${result.data.remainingAttempts} attempts left)`;
        }
        throw new Error(errorMsg);
      }

      // OTP Verified Successfully
      setSuccess(true);

      if (isRegistration) {
        // 🔥 REGISTRATION - Save user to localStorage
        const user = {
          id: result.data?.userId || result.data?.id || Date.now(),
          email: email,
          firstName: userData?.firstName || "",
          lastName: userData?.lastName || "",
          name: userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}` : email.split('@')[0],
          role: "student",
          token: result.data?.accessToken || "",
          refreshToken: result.data?.refreshToken || "",
        };

        // ✅ Save to localStorage
        localStorage.setItem('lms_user', JSON.stringify(user));
        localStorage.removeItem("userEmail");
        localStorage.removeItem("tempUserData");

        // ✅ Call login from AuthContext if available
        if (login) {
          login(user);
        }

        // ✅ Redirect to Landing page with user data
        setTimeout(() => {
          navigate("/", { 
            state: { message: "✅ Account verified successfully! Welcome to LearnMaster." } 
          });
        }, 1500);
        
      } else {
        // LOGIN - Login user and go to dashboard
        const { data } = result;
        if (data && data.accessToken && data.activeRole) {
          const user = {
            id: data.userId,
            email: email,
            role: data.activeRole,
            token: data.accessToken,
            refreshToken: data.refreshToken,
          };
          login(user);
          const roleLower = user.role.toLowerCase();
          const targetRole = roleLower === "user" ? "student" : roleLower;
          setTimeout(() => navigate(`/${targetRole}/dashboard`), 2000);
        } else {
          setTimeout(() => navigate("/login", { state: { message: "OTP verified! Please login again." } }), 2000);
        }
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // RESEND OTP
  const handleResend = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    setError("");

    try {
      let response;
      let result;

      if (isRegistration) {
        response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ email }),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/login/otp/request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      }

      result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to resend OTP");
      }

      setError("");
    } catch (err) {
      setError(err.message);
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!email) {
    navigate("/register");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* LEFT PANEL - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-100 p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-300 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-300 rounded-full blur-[120px]"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center shadow-md">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">LearnMaster</h1>
            <span className="text-xs text-violet-700 bg-violet-200/70 px-2 py-0.5 rounded-full">Premium</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-800 leading-tight mb-4">
            Verify Your <br />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Email Address</span>
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-md">
            We've sent a 6-digit OTP to your email. Please verify to complete your registration.
          </p>
          
          <div className="grid grid-cols-3 gap-6 mb-10">
            <div><div className="text-2xl font-bold text-gray-800">50K+</div><div className="text-sm text-gray-600">Active Students</div></div>
            <div><div className="text-2xl font-bold text-gray-800">500+</div><div className="text-sm text-gray-600">Expert Courses</div></div>
            <div><div className="text-2xl font-bold text-gray-800">98%</div><div className="text-sm text-gray-600">Success Rate</div></div>
          </div>
          
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2 text-gray-700"><Trophy className="w-5 h-5 text-violet-600" /><span>Career Growth</span></div>
            <div className="flex items-center gap-2 text-gray-700"><GradCap className="w-5 h-5 text-violet-600" /><span>Certified Programs</span></div>
            <div className="flex items-center gap-2 text-gray-700"><Briefcase className="w-5 h-5 text-violet-600" /><span>Expert Mentors</span></div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-gray-500 mt-8">© 2026 LearnMaster. All rights reserved.</div>
      </div>

      {/* RIGHT PANEL - OTP Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
            {isRegistration ? 'Verify OTP' : 'OTP Login'}
          </h2>
          
          <div className="bg-white rounded-2xl p-6 md:p-8">
            {/* Back Button */}
            <button
              onClick={() => navigate(isRegistration ? "/register" : "/otp-login")}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 text-sm transition-colors"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 rounded-lg flex items-center gap-3 bg-green-50 border border-green-200">
                <CheckCircle className="text-green-600" size={18} />
                <p className="text-sm text-green-700">
                  {isRegistration ? '✅ Account verified successfully! Redirecting to landing page...' : '✅ Login successful! Redirecting to dashboard...'}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && !success && (
              <div className="mb-4 p-3 rounded-lg flex items-center gap-3 bg-red-50 border border-red-200">
                <AlertCircle className="text-red-600" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-violet-600" />
                <p className="text-gray-600 text-sm">
                  {isRegistration ? "We've sent a 6-digit OTP to" : "Enter OTP sent to"}
                </p>
              </div>
              <p className="text-center font-semibold text-gray-800 mt-1">{email}</p>
            </div>

            {/* OTP Input Fields */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onFocus={() => setFocusedField(index)}
                  onBlur={() => setFocusedField(null)}
                  className={`w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition-all duration-200 outline-none text-gray-800 ${
                    focusedField === index
                      ? 'border-violet-500 shadow-lg shadow-violet-500/20 ring-2 ring-violet-200'
                      : digit
                      ? 'border-violet-500'
                      : 'border-gray-300 hover:border-violet-400'
                  }`}
                  disabled={loading || success}
                  autoComplete="off"
                />
              ))}
            </div>

            {/* Timer & Resend */}
            <div className="text-center mb-6">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Resend OTP in <span className="font-semibold text-violet-600">{resendTimer}</span> seconds
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={loading || success}
                  className="text-sm text-violet-600 hover:text-violet-800 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Resend OTP
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || success}
              className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                loading || success ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg hover:shadow-violet-500/30 text-white'
              }`}
            >
              {loading ? (
                <><Loader2 className="animate-spin h-5 w-5" /> Verifying...</>
              ) : success ? (
                '✓ Verified'
              ) : (
                'Verify OTP'
              )}
            </button>

            {/* Login/Register Link */}
            <p className="text-center text-sm text-gray-600 mt-4">
              {isRegistration ? (
                <>
                  Already have an account?{' '}
                  <button 
                    onClick={() => navigate("/login")} 
                    className="text-violet-600 hover:text-violet-800 font-semibold"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => navigate("/register")} 
                    className="text-violet-600 hover:text-violet-800 font-semibold"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>

            {/* Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
              <p className="text-xs text-gray-500">
                Didn't receive OTP? Check your spam folder or{' '}
                <button
                  onClick={handleResend}
                  disabled={loading || !canResend || success}
                  className="text-violet-600 hover:text-violet-800 font-medium disabled:opacity-50"
                >
                  resend
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtpVerify;