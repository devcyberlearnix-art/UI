import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield, Clock, RefreshCw, CheckCircle, AlertCircle, ArrowLeft,
  Sparkles, Trophy, Briefcase, GraduationCap as GradCap,
  Mail, Loader2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "https://matted-ascent-specimen.ngrok-free.dev";

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
        // 🔥🔥🔥 REGISTRATION - SAVE USER TO LOCALSTORAGE 🔥🔥🔥
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

        // ✅ Save to localStorage - THIS IS THE KEY FIX
        localStorage.setItem('lms_user', JSON.stringify(user));
        localStorage.removeItem("userEmail");
        localStorage.removeItem("tempUserData");

        // ✅ Call login from AuthContext
        if (login) {
          login(user);
        }

        // ✅ Redirect to Landing page with user logged in
        setTimeout(() => {
          navigate("/login", { 
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
    <div className="min-h-screen flex relative overflow-hidden bg-gray-50">
      {/* Light gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
      
      {/* Light decorative circles */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-50 rounded-full blur-[120px] opacity-20"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-purple-300/50 rounded-full animate-float" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 5}s`
          }}></div>
        ))}
      </div>

      <div className="relative z-10 flex w-full">
        {/* LEFT PANEL - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-lg">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-200 blur-xl rounded-full"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-2xl">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">LearnMaster</span>
                <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Premium</span>
              </div>
              <p className="text-gray-500 text-sm">Premium Learning Platform</p>
            </div>
            
            <h2 className="text-5xl font-bold text-gray-800 leading-tight mb-6">
              Verify Your <br />
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Email Address</span>
            </h2>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              We've sent a 6-digit OTP to your email. Please verify to complete your registration.
            </p>
            
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="text-center"><div className="text-2xl font-bold text-gray-800 mb-1">50K+</div><div className="text-xs text-gray-500">Active Students</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-gray-800 mb-1">500+</div><div className="text-xs text-gray-500">Expert Courses</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-gray-800 mb-1">98%</div><div className="text-xs text-gray-500">Success Rate</div></div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <div><p className="text-gray-800 font-medium">Career Growth</p><p className="text-sm text-gray-500">Accelerate your professional journey</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <GradCap className="w-5 h-5 text-purple-600" />
                </div>
                <div><p className="text-gray-800 font-medium">Certified Programs</p><p className="text-sm text-gray-500">Industry-recognized certificates</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div><p className="text-gray-800 font-medium">Expert Mentors</p><p className="text-sm text-gray-500">Learn from industry leaders</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - OTP Verification Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-xl">
              <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                {isRegistration ? 'Verify OTP' : 'OTP Login'}
              </h2>
              
              <button
                onClick={() => navigate(isRegistration ? "/register" : "/otp-login")}
                className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6 text-sm transition-colors"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              {success && (
                <div className="mb-6 p-3 rounded-xl flex items-center gap-3 bg-green-50 border border-green-200">
                  <CheckCircle className="text-green-600" size={18} />
                  <p className="text-sm text-green-700">
                    {isRegistration ? '✅ Account verified successfully! Redirecting to home...' : '✅ Login successful! Redirecting to dashboard...'}
                  </p>
                </div>
              )}

              {error && !success && (
                <div className="mb-6 p-3 rounded-xl flex items-center gap-3 bg-red-50 border border-red-200">
                  <AlertCircle className="text-red-600" size={18} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <p className="text-gray-600 text-sm">
                    {isRegistration ? "We've sent a 6-digit OTP to" : "Enter OTP sent to"}
                  </p>
                </div>
                <p className="text-center font-semibold text-gray-800 mt-1">{email}</p>
              </div>

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
                        ? 'border-purple-500 shadow-lg shadow-purple-500/20 ring-2 ring-purple-200'
                        : digit
                        ? 'border-purple-500'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                    disabled={loading || success}
                    autoComplete="off"
                  />
                ))}
              </div>

              <div className="text-center mb-6">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    Resend OTP in <span className="font-semibold text-purple-600">{resendTimer}</span> seconds
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading || success}
                    className="text-sm text-purple-600 hover:text-purple-800 transition-colors flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={handleVerify}
                disabled={loading || success}
                className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading || success ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/30 text-white'
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

              <p className="text-center text-sm text-gray-600 mt-6">
                {isRegistration ? (
                  <>
                    Already have an account?{' '}
                    <button 
                      onClick={() => navigate("/login")} 
                      className="text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <button 
                      onClick={() => navigate("/register")} 
                      className="text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </p>

              <div className="mt-6 p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
                <p className="text-xs text-gray-500">
                  Didn't receive OTP? Check your spam folder or{' '}
                  <button
                    onClick={handleResend}
                    disabled={loading || !canResend || success}
                    className="text-purple-600 hover:text-purple-800 font-medium disabled:opacity-50"
                  >
                    resend
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100px) translateX(50px); opacity: 0; }
        }
        .animate-float { animation: float 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

export default OtpVerify;