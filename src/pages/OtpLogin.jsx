import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Send, Shield, Smartphone, AlertCircle, TrendingUp, Award, Users } from "lucide-react";

function OtpLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

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
      const response = await fetch("https://iodine-pesticide-bulge.ngrok-free.dev/login/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to send OTP. Please try again.");
      }

      setSuccess(true);
      // Redirect to OTP verify page after a short delay
      setTimeout(() => {
        navigate("/otp-verify", { state: { email, from: "otp-login" } });
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        {/* Left brand section */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div className="max-w-lg">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-200 blur-xl rounded-full"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 p-3 rounded-2xl">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">LearnMaster</span>
              </div>
              <p className="text-gray-500 text-sm">Premium Learning Platform</p>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
              OTP Login
              <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Fast & Secure</span>
            </h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">Get a one‑time password on your email for quick and secure access without remembering passwords.</p>
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="text-center"><div className="text-2xl font-bold text-gray-800 mb-1">50K+</div><div className="text-xs text-gray-500">Active Students</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-gray-800 mb-1">500+</div><div className="text-xs text-gray-500">Expert Courses</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-gray-800 mb-1">98%</div><div className="text-xs text-gray-500">Success Rate</div></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
                <div><p className="text-gray-800 font-medium">Career Growth</p><p className="text-sm text-gray-500">Accelerate your professional journey</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Award className="w-5 h-5 text-purple-600" /></div>
                <div><p className="text-gray-800 font-medium">Certified Programs</p><p className="text-sm text-gray-500">Industry-recognized certificates</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Users className="w-5 h-5 text-purple-600" /></div>
                <div><p className="text-gray-800 font-medium">Expert Mentors</p><p className="text-sm text-gray-500">Learn from industry leaders</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side form */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 mb-6 shadow-lg">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">OTP Login</h2>
                <p className="text-gray-500 text-sm">Enter your email to receive a secure OTP</p>
              </div>

              {success && (
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-600 text-sm text-center">✓ OTP sent successfully! Redirecting...</p>
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

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(false); }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25'}`}
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

                <div className="text-center">
                  <button onClick={() => navigate("/login")} className="text-sm text-gray-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-1 mx-auto">
                    <ArrowLeft size={14} /> Back to Login
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Shield size={12} />
                  <span>Secure OTP • Valid for 5 minutes</span>
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

export default OtpLogin;