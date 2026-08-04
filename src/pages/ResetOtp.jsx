import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Shield, Key, Lock, Eye, EyeOff, RefreshCw, 
  CheckCircle, AlertCircle, ArrowLeft, Timer,
  AlertTriangle, Mail, KeyRound
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function ResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  const inputRefs = useRef([]);

  // Timer effect (unchanged)
  useEffect(() => {
    if (timer === 0 || blocked) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, blocked]);

  // Focus first OTP input on mount
  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]+/)) strength++;
    if (pwd.match(/[A-Z]+/)) strength++;
    if (pwd.match(/[0-9]+/)) strength++;
    if (pwd.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    checkPasswordStrength(newPassword);
    if (error) setError("");
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "#f87171";
    if (passwordStrength <= 3) return "#fbbf24";
    if (passwordStrength <= 4) return "#4ade80";
    return "#22c55e";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  // OTP handlers (unchanged)
  const handleOtpChange = (value, index) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    setError("");
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && otp.every(digit => digit !== "")) handleVerifyOtp();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 4);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newOtp = [...otp];
      digits.forEach((digit, idx) => { if (idx < 4) newOtp[idx] = digit; });
      setOtp(newOtp);
      const lastIndex = Math.min(digits.length, 3);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  // Verify OTP (mock or API? For now we keep mock, but you can replace with real OTP verify endpoint)
  const handleVerifyOtp = () => {
    if (blocked) {
      setError("Too many attempts. Please try again later.");
      return;
    }
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError("Please enter the complete 4-digit OTP");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (otpValue === "1234") {
        setOtpVerified(true);
        setError("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setBlocked(true);
          setError("⚠️ Too many wrong attempts. Please try again after 5 minutes.");
        } else {
          setError(`❌ Invalid OTP. ${3 - newAttempts} attempts remaining.`);
        }
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
      setLoading(false);
    }, 1000);
  };

  // ✅ UPDATE PASSWORD API CALL
  const handleUpdatePassword = async () => {
    if (!password) {
      setError("Please enter a new password");
      return;
    }
    if (passwordStrength < 3) {
      setError("Please create a stronger password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp.join(""),    // send the OTP entered
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed. Please try again.");
      }

      // Success
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (blocked) return;
    if (timer > 0) return;
    setTimer(60);
    setAttempts(0);
    setError("");
    setOtp(["", "", "", ""]);
    inputRefs.current[0]?.focus();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100"></div>
      
      {/* Light decorative circles */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-50 rounded-full blur-[120px] opacity-20"></div>

      <div className="relative z-10 flex w-full min-h-screen">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-lg">
            <div className="mb-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-purple-200 blur-xl rounded-full"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-2xl">
                  <KeyRound className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
              Reset Password
              <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Secure Your Account</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">Create a new strong password to secure your account.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div><p className="text-gray-800 font-medium">Account</p><p className="text-sm text-gray-500">{email || "your email"}</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-purple-600" />
                </div>
                <div><p className="text-gray-800 font-medium">OTP Valid for 10 minutes</p><p className="text-sm text-gray-500">Enter the code we sent</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 mb-6 shadow-lg">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{otpVerified ? "Set New Password" : "Verify OTP"}</h2>
                <p className="text-gray-500 text-sm">{otpVerified ? "Create a strong password for your account" : "Enter the 4-digit code sent to your email"}</p>
              </div>

              {success && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-green-600 text-sm">{otpVerified ? "Password updated successfully! Redirecting..." : "OTP sent successfully!"}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {!otpVerified ? (
                // OTP verification UI (unchanged logic)
                <>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter 4-digit OTP</label>
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, index) => (
                        <input key={index} ref={(el) => (inputRefs.current[index] = el)} type="text" maxLength="1" value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, index)} onKeyDown={(e) => handleKeyDown(e, index)}
                          onPaste={index === 0 ? handlePaste : undefined} disabled={blocked}
                          className={`w-14 h-14 text-center text-xl font-semibold border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 ${error && !blocked ? 'border-red-300 bg-red-50 text-red-900' : 'border-gray-300 bg-white text-gray-800'}`} />
                      ))}
                    </div>
                  </div>
                  <button onClick={handleVerifyOtp} disabled={loading || blocked || otp.some(d => d === "")}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${loading || blocked || otp.some(d => d === "") ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25'}`}>
                    {loading ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Verifying...</> : <><Shield size={18} /> Verify OTP</>}
                  </button>
                  <div className="mt-6 text-center">
                    {blocked ? <div className="flex items-center justify-center gap-2 text-red-600"><AlertTriangle size={14} /><span>Too many attempts. Try again later.</span></div>
                    : timer > 0 ? <p className="text-sm text-gray-500 flex items-center justify-center gap-2"><Timer size={14} /> Resend OTP in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
                    : <button onClick={handleResend} className="text-purple-600 hover:text-purple-700 text-sm flex items-center justify-center gap-1 mx-auto"><RefreshCw size={14} /> Resend OTP</button>}
                  </div>
                  {attempts > 0 && !blocked && <p className="text-xs text-center text-orange-600 mt-2">{3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining</p>}
                </>
              ) : (
                // Password reset form
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password <span className="text-red-500">*</span></label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input type={showPassword ? "text" : "password"} placeholder="Create a strong password"
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                        value={password} onChange={handlePasswordChange}
                        onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2">
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden"><div className="h-full transition-all duration-300" style={{ width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor() }}></div></div>
                        <p className="text-xs mt-1" style={{ color: getStrengthColor() }}>{getStrengthText()}</p>
                      </div>
                    )}
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password <span className="text-red-500">*</span></label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password"
                        className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                        onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleUpdatePassword} disabled={loading || !password || !confirmPassword}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${loading || !password || !confirmPassword ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25'}`}>
                    {loading ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Updating...</> : <><CheckCircle size={18} /> Update Password</>}
                  </button>
                </>
              )}

              <div className="text-center mt-6 pt-4 border-t border-gray-200">
                <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </div>
              <div className="mt-4 text-center"><div className="flex items-center justify-center gap-2 text-xs text-gray-400"><Shield size={12} /><span>Secure • 256-bit encryption</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetOtp;