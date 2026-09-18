import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, KeyRound, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (value, index) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits.concat(Array(6 - digits.length).fill("")));
      document.getElementById(`otp-${Math.min(digits.length, 5)}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }
    if (!email) {
      setError("Email address is missing. Please go back and try again.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // ✅ Use axiosInstance so ngrok-skip-browser-warning header is included
      const { data } = await axiosInstance.post("/api/v1/auth/verify-email", {
        email,
        otp: otpValue,
      });

      if (data && !data.success && data.message) {
        throw new Error(data.message);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-orange-100 rounded-full">
            <Mail size={32} className="text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold mt-2">Verify Email</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter the 6-digit code sent to <strong>{email || "your email"}</strong>
          </p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle size={18} /> Email verified! Redirecting to login...
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-center">6‑digit OTP</label>
          <div className="flex justify-center gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={idx === 0 ? handlePaste : undefined}
                onFocus={() => setFocusedField(idx)}
                onBlur={() => setFocusedField(null)}
                className={`w-12 h-12 text-center text-xl font-semibold border-2 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition ${
                  error ? "border-red-300" : "border-gray-300"
                } ${focusedField === idx ? "scale-105" : ""}`}
                disabled={loading || success}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || success}
          className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/admin/login")}
            className="text-sm text-gray-500 hover:text-orange-600 flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;