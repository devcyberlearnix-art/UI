import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail, ArrowLeft, Send, Shield, Smartphone, AlertCircle,
  TrendingUp, Award, Users, Sparkles, GraduationCap as GradCap,
  Briefcase, Trophy, Eye, EyeOff
} from "lucide-react";

const API_BASE_URL = "https://iodine-pesticide-bulge.ngrok-free.dev"; // change as needed

function OtpLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
      const response = await fetch(`${API_BASE_URL}/login/otp/request`, {
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
    <div className="min-h-screen flex bg-gray-50">
      {/* LEFT PANEL - Branding (violet theme) */}
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
            Master New Skills <br />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">With Industry Experts</span>
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-md">
            Join 50,000+ professionals accelerating their careers with our world-class courses and certification programs.
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

      {/* RIGHT PANEL - OTP Login Form (light, violet accent) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to continue your learning journey</p>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm text-center">✓ OTP sent successfully! Redirecting...</p>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="you@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-gray-800 placeholder-gray-400 text-sm"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(false); }}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg hover:shadow-violet-500/30 text-white'
                }`}
              >
                {loading ? (
                  <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg> Sending OTP...</>
                ) : (
                  <>Send OTP <Send size={18} /></>
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                onClick={() => navigate("/login")}
                className="text-violet-600 hover:text-violet-800 font-medium flex items-center gap-1"
              >
                <ArrowLeft size={14} /> Back to Login
              </button>
              <div className="flex items-center gap-2 text-gray-500">
                <Shield size={14} />
                <span>Secure OTP • 5 min valid</span>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <button onClick={() => navigate("/register")} className="text-violet-600 hover:text-violet-800 font-semibold">
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtpLogin;