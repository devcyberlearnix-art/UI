import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Mail, Send } from "lucide-react";
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
      toast.success(result.message || "OTP sent");

      navigate("/otp-verify", {
        state: {
          flow: "login",
          email: email.trim(),
          otpSessionId: result.otpSessionId,
          cooldownSeconds: result.cooldownSeconds || 30,
        },
      });
    } catch (err) {
      const message = err.response?.data?.message || "Failed to send OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Passwordless Sign In"
      subtitle="Request a one-time code and sign in quickly without remembering passwords."
      eyebrow="LearnMaster OTP"
      highlights={[
        { value: "30s", label: "Cooldown" },
        { value: "6-Digit", label: "OTP" },
        { value: "Fast", label: "Access" },
      ]}
    >
      <h1 className="mb-2 text-2xl font-bold text-slate-900">OTP Login</h1>
      <p className="mb-6 text-sm text-slate-500">Enter your email to receive a one-time code.</p>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          <AlertCircle size={18} className="mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
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
          {loading ? "Sending OTP..." : "Send OTP"} <Send size={16} />
        </button>
      </div>
    </AuthShell>
  );
}

export default OtpLogin;
