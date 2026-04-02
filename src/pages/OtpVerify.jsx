import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield, Clock, RefreshCw, CheckCircle, AlertCircle, ArrowLeft, Smartphone } from "lucide-react";

function OtpVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
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

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) { setError("Please enter the complete 6-digit OTP"); return; }
    // Demo OTP = "123456"
    if (otpValue !== "123456") {
      setError("Invalid OTP. Please try again.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/home"), 2000);
    }, 1000);
  };

  const handleResend = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(30);
    setOtp(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    setError("");
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
        return prev - 1;
      });
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
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Verify OTP</h2>
              <p className="text-gray-400 text-sm">Enter the 6-digit code sent to {email || "your email"}</p>
            </div>

            {success && (
              <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <p className="text-green-400 text-sm">OTP verified successfully! Redirecting...</p>
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

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3 text-center">Enter 6-digit OTP</label>
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    onFocus={() => setFocusedField(index)}
                    onBlur={() => setFocusedField(null)}
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold
                      border-2 rounded-xl focus:ring-2 focus:ring-blue-500 
                      focus:border-transparent outline-none transition-all duration-200
                      ${error ? 'border-red-500/50 bg-red-500/10' : 'border-white/20 bg-white/10'}
                      text-white
                      ${focusedField === index ? 'scale-105' : ''}
                    `}
                    disabled={loading || success}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || success}
              className={`
                w-full py-3.5 rounded-xl font-semibold transition-all duration-300
                flex items-center justify-center gap-2 relative overflow-hidden group
                ${loading || success ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25'}
              `}
            >
              {!loading && !success && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="mt-6 text-center">
              {canResend ? (
                <button onClick={handleResend} className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center gap-1 mx-auto">
                  <RefreshCw size={14} /> Resend OTP
                </button>
              ) : (
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <Clock size={14} /> Resend OTP in {Math.floor(resendTimer / 60)}:{String(resendTimer % 60).padStart(2, '0')}
                </p>
              )}
            </div>

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
                <span>Secure • Valid for 10 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtpVerify;