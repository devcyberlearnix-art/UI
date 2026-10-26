import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, Mail } from "lucide-react";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";

function OtpLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setError("");

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.requestLoginOtp(email.trim());
      if (result.message) toast.success(result.message);

      navigate("/otp-verify", {
        state: {
          flow: "login",
          email: email.trim(),
          otpSessionId: result.otpSessionId,
          cooldownSeconds: result.cooldownSeconds || 30,
        },
      });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || "";
      if (message) {
        setError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      variant="otp"
      step={1}
      showTerms={false}
    >
      <div className="cyber-card-heading">
        <span className="cyber-card-icon"><Mail size={21} /></span>
        <h1>Sign in with email</h1>
        <p>Enter your email and we’ll send a secure verification code.</p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          <AlertCircle size={18} className="mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-700">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              className="lms-input pl-10"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleSendOtp} disabled={loading} className="lms-btn-primary">
          {loading ? "Sending code..." : "Continue with email"} <ArrowRight size={16} />
        </button>
        <div className="cyber-secure-note">No password required. A secure code will be sent to your inbox.</div>
      </div>
    </AuthShell>
  );
}

export default OtpLogin;
