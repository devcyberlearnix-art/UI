import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, Shield, AlertCircle, CheckCircle, RefreshCw, Timer } from "lucide-react";

function ResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState(null);

  // Timer effect
  useEffect(() => {
    if (blocked) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [blocked]);

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
    setPassword(e.target.value);
    checkPasswordStrength(e.target.value);
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

  const handleVerifyOtp = () => {
    if (blocked) {
      setError("Too many attempts. Please try again later.");
      return;
    }
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }
    if (otp.length !== 4) {
      setError("OTP must be 4 digits");
      return;
    }
    // Demo OTP = "1234"
    if (otp === "1234") {
      setOtpVerified(true);
      setError("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setBlocked(true);
        setError("Too many wrong attempts. Please try again after 5 minutes.");
      } else {
        setError(`Invalid OTP. ${3 - newAttempts} attempts remaining.`);
      }
      setOtp("");
    }
  };

  const handleUpdatePassword = () => {
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
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    }, 1500);
  };

  const handleResend = () => {
    if (blocked) return;
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(30);
    setAttempts(0);
    setError("");
    setOtp("");
    // Simulate resend
    setTimeout(() => {
      // optional: show toast
    }, 1000);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0a0f1c]">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0f1629] to-[#1a1f35]"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59,130,246,0.15) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      </div>
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-float" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 5}s` }}></div>
        ))}
      </div>

      <div className="relative z-10 flex w-full items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 mb-6 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {otpVerified ? "Set New Password" : "Verify OTP"}
              </h2>
              <p className="text-gray-400 text-sm">
                {otpVerified
                  ? "Create a strong password for your account"
                  : `Enter the 4-digit code sent to ${email || "your email"}`}
              </p>
            </div>

            {success && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-green-400 text-sm">
                    {otpVerified ? "Password updated successfully! Redirecting..." : "OTP sent successfully!"}
                  </p>
                </div>
              </div>
            )}
            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            {!otpVerified ? (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">OTP</label>
                  <input
                    type="text"
                    placeholder="Enter 4-digit code"
                    className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={blocked}
                  />
                </div>

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || blocked}
                  className={`
                    w-full py-3.5 rounded-xl font-semibold transition-all duration-300
                    flex items-center justify-center gap-2 relative overflow-hidden group
                    ${loading || blocked ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25'}
                  `}
                >
                  {!loading && !blocked && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <div className="mt-4 text-center">
                  {blocked ? (
                    <p className="text-sm text-red-400">Too many attempts. Try again later.</p>
                  ) : canResend ? (
                    <button onClick={handleResend} className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1 mx-auto">
                      <RefreshCw size={14} /> Resend OTP
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                      <Timer size={14} /> Resend in {resendTimer}s
                    </p>
                  )}
                </div>
                {attempts > 0 && !blocked && (
                  <p className="text-xs text-center text-orange-400 mt-2">{3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining</p>
                )}
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
                      value={password}
                      onChange={handlePasswordChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-300" style={{ width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor() }}></div>
                      </div>
                      <p className="text-xs mt-1" style={{ color: getStrengthColor() }}>{getStrengthText()}</p>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder-gray-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className={`
                    w-full py-3.5 rounded-xl font-semibold transition-all duration-300
                    flex items-center justify-center gap-2 relative overflow-hidden group
                    ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25'}
                  `}
                >
                  {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </>
            )}

            <div className="text-center mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft size={14} /> Back to Login
              </button>
            </div>

            <div className="mt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield size={12} />
                <span>Secure • 256-bit encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetOtp;