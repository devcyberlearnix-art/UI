import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Send, Shield, AlertCircle, KeyRound, CheckCircle } from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newPassword
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Step 1: Request OTP
  const handleSendOtp = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("https://iodine-pesticide-bulge.ngrok-free.dev/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => {
        setStep(2);
        setSuccess(false);
        setError("");
      }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP sent to your email");
      return;
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("https://iodine-pesticide-bulge.ngrok-free.dev/auth/password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => {
        setStep(3);
        setSuccess(false);
        setError("");
      }, 1500);
    } catch (err) {
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    if (!newPassword) {
      setError("Please enter a new password");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // The reset endpoint may also expect email and otp; adjust as needed.
      // If your backend only needs newPassword and confirmPassword, remove email and otp.
      const response = await fetch("https://iodine-pesticide-bulge.ngrok-free.dev/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.message || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#0a0f1c]">
      {/* Background effects – keep your existing background JSX */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0f1629] to-[#1a1f35]"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59,130,246,0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-1 h-1 bg-blue-400/40 rounded-full animate-float" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 5}s`
          }}></div>
        ))}
      </div>

      <div className="relative z-10 flex w-full">
        {/* Left side brand content – keep your existing left panel JSX */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          {/* ... your existing left side content ... */}
        </div>

        {/* Right side form */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 mb-6 shadow-lg">
                  {step === 1 && <Mail className="w-8 h-8 text-white" />}
                  {step === 2 && <KeyRound className="w-8 h-8 text-white" />}
                  {step === 3 && <Lock className="w-8 h-8 text-white" />}
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {step === 1 && "Reset Password"}
                  {step === 2 && "Verify OTP"}
                  {step === 3 && "Set New Password"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {step === 1 && "We'll send you an OTP to reset your password"}
                  {step === 2 && `Enter the 6-digit code sent to ${email}`}
                  {step === 3 && "Create a strong new password for your account"}
                </p>
              </div>

              {success && (
                <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-2 justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 text-sm">
                      {step === 1 && "✓ OTP sent! Redirecting..."}
                      {step === 2 && "✓ OTP verified! Redirecting..."}
                      {step === 3 && "✓ Password reset successful! Redirecting to login..."}
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

              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-500"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25'}`}
                  >
                    {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Sending OTP...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send OTP
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">OTP Code</label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'otp' ? 'scale-[1.02]' : ''}`}>
                      <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="text"
                        placeholder="6-digit code"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-500"
                        value={otp}
                        onChange={(e) => { setOtp(e.target.value); setError(""); }}
                        onFocus={() => setFocusedField('otp')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25'}`}
                  >
                    {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Verifying OTP...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Verify OTP
                      </>
                    )}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'newPassword' ? 'scale-[1.02]' : ''}`}>
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-500"
                        value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                        onFocus={() => setFocusedField('newPassword')}
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                    <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                      <input
                        type="password"
                        placeholder="Confirm your new password"
                        className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-500"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                        onFocus={() => setFocusedField('confirmPassword')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25'}`}
                  >
                    {!loading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <Shield size={18} />
                        Reset Password
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="text-center mt-6">
                <button
                  onClick={() => navigate("/login")}
                  className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft size={14} />
                  Back to Login
                </button>
              </div>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <Shield size={12} />
                  <span>Secure • 256-bit encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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

export default ForgotPassword;