import React, { useMemo, useState } from "react";
import { Check, Circle, Eye, EyeOff, LockKeyhole, Mail, UserRound, AlertCircle, ArrowRight, UserPlus } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";
import { parseApiError } from "../utils/apiErrorParser";
import { getPasswordChecks, isStrongPassword, validateEmail } from "../utils/validation";
import SocialAuthButtons from "../components/ui/SocialAuthButtons";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 26,
};

const initialForm = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = location.state?.registrationDraft || {};
  const [form, setForm] = useState({ ...initialForm, ...draft });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    return Object.values(getPasswordChecks(form.password)).filter(Boolean).length;
  }, [form.password]);
  const passwordChecks = getPasswordChecks(form.password);

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setGlobalError("");
  };

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "First name is required";
    if (!form.lastName.trim()) next.lastName = "Last name is required";
    if (!form.email.trim() || !validateEmail(form.email)) next.email = "Enter a valid email address";
    if (!form.password) next.password = "Password is required";
    else if (!isStrongPassword(form.password)) next.password = "Use 8+ characters with upper/lowercase letters, a number, and a symbol";
    if (!form.confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setGlobalError("");
    try {
      const registration = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      };
      const multipart = new FormData();
      multipart.append("data", JSON.stringify(registration));
      const response = await authApi.register(multipart);
      const payload = response?.data && typeof response.data === "object" ? response.data : response;
      if (response?.success === false || payload?.success === false) {
        throw new Error(response?.message || payload?.message || "");
      }
      const otpSessionId = payload?.otpSessionId || payload?.sessionId || payload?.data?.otpSessionId || "";
      const cooldownSeconds = payload?.cooldownSeconds ?? payload?.data?.cooldownSeconds;
      const expiresInSeconds = payload?.expiresInSeconds ?? payload?.data?.expiresInSeconds;
      if (!otpSessionId) throw new Error("Registration did not return a verification session. Please try again.");
      try {
        sessionStorage.setItem("asivo_otp_context", JSON.stringify({
          email: form.email.trim().toLowerCase(), flow: "register", otpSessionId, cooldownSeconds, expiresInSeconds,
        }));
      } catch { /* storage fallback */ }
      const backendMessage = response?.message || payload?.message;
      if (backendMessage) toast.success(backendMessage);
      navigate("/otp-verify", { state: { email: form.email.trim().toLowerCase(), flow: "register", otpSessionId, cooldownSeconds, expiresInSeconds } });
    } catch (error) {
      const parsed = parseApiError(error, "");
      if (parsed.message) setGlobalError(parsed.message);
      setErrors((current) => ({ ...current, ...(parsed.fieldErrors || {}) }));
      if (parsed.message) toast.error(parsed.message);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name, label, Icon, type = "text", placeholder = "") => {
    const isPassword = name === "password" || name === "confirmPassword";
    const visible = name === "password" ? showPassword : showConfirmPassword;
    return (
      <div className="space-y-1">
        <label htmlFor={name} className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block">
          {label} <span className="text-[#C5A880]">*</span>
        </label>
        <div className="relative">
          <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" aria-hidden="true" />
          <input
            id={name}
            name={name}
            type={isPassword ? (visible ? "text" : "password") : type}
            value={form[name]}
            placeholder={placeholder}
            onChange={(event) => update(name, event.target.value)}
            disabled={loading}
            autoComplete={isPassword ? "new-password" : name}
            className="lms-input pl-10 pr-10 text-xs"
          />
          {isPassword && (
            <button
              type="button"
              aria-label={visible ? `Hide ${label}` : `Show ${label}`}
              onClick={() => (name === "password" ? setShowPassword((v) => !v) : setShowConfirmPassword((v) => !v))}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F5F5F7] transition-colors"
            >
              {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {errors[name] && <p className="text-[11px] text-rose-400 font-medium mt-1">{errors[name]}</p>}
      </div>
    );
  };

  return (
    <AuthShell variant="split" showTerms showBackHome wide>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_TRANSITION}
        className="space-y-6"
      >
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-sm">
            <UserPlus className="w-5 h-5 text-[#C5A880]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#F5F5F7] tracking-tight">
            Create Engineering Account
          </h1>
          <p className="text-xs text-[#8E8E93]">
            Start your learning journey across enterprise disciplines.
          </p>
        </div>

        {globalError && (
          <div className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-400 text-xs" role="alert">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{globalError}</span>
          </div>
        )}

        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {renderField("firstName", "First Name", UserRound, "text", "Ada")}
            {renderField("lastName", "Last Name", UserRound, "text", "Lovelace")}
          </div>

          {renderField("email", "Email Address", Mail, "email", "name@enterprise.io")}
          {renderField("password", "Master Password", LockKeyhole, "password", "••••••••••••")}

          {/* Password Validation Checklist */}
          {form.password && (
            <div className="p-3.5 rounded-2xl bg-[#14141A] border border-white/[0.04] space-y-2.5 text-xs">
              <span className="font-semibold text-[#8E8E93] text-[11px] uppercase tracking-wider block">
                Password Security Criteria:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                {[
                  ["length", "8+ characters"],
                  ["upper", "Uppercase (A-Z)"],
                  ["lower", "Lowercase (a-z)"],
                  ["number", "Number (0-9)"],
                  ["symbol", "Special symbol"],
                ].map(([rule, label]) => (
                  <span
                    key={rule}
                    className={`flex items-center gap-1.5 ${
                      passwordChecks[rule] ? "text-[#C5A880] font-semibold" : "text-[#71717A]"
                    }`}
                  >
                    {passwordChecks[rule] ? <Check size={12} /> : <Circle size={10} />}
                    <span>{label}</span>
                  </span>
                ))}
              </div>

              {/* Strength Meter Bar */}
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                <span className="text-[#8E8E93]">
                  Strength:{" "}
                  <b className="text-[#F5F5F7]">
                    {strength === 5 ? "Robust" : strength >= 4 ? "Good" : strength >= 3 ? "Fair" : "Weak"}
                  </b>
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <span
                      key={item}
                      className={`h-1.5 w-5 rounded-full transition-colors ${
                        item <= strength ? "bg-[#C5A880]" : "bg-white/[0.06]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {renderField("confirmPassword", "Confirm Password", LockKeyhole, "password", "••••••••••••")}

          {form.confirmPassword && (
            <p
              className={`text-[11px] font-semibold flex items-center gap-1.5 ${
                form.password === form.confirmPassword ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {form.password === form.confirmPassword ? (
                <>
                  <Check size={13} /> Passwords match
                </>
              ) : (
                "Passwords do not match"
              )}
            </p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !form.firstName.trim() ||
              !form.lastName.trim() ||
              !validateEmail(form.email) ||
              !isStrongPassword(form.password) ||
              form.password !== form.confirmPassword
            }
            className="lms-btn-primary cursor-pointer active:scale-98"
          >
            {loading ? "Provisioning account..." : "Create Account"} <ArrowRight size={15} />
          </button>
        </form>

        <SocialAuthButtons mode="signup" />

        <div className="pt-4 border-t border-white/[0.04] text-center">
          <p className="text-xs text-[#8E8E93]">
            Already have an active account?{" "}
            <Link to="/login" className="text-[#C5A880] hover:text-[#D4BC98] font-bold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </AuthShell>
  );
};

export default Register;
