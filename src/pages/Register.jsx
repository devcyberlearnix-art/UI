// src/pages/Register.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
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

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

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

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  useEffect(() => {
    document.title = "Create Account | Asivo Learning Platform";
  }, []);

  const passwordChecks = useMemo(() => getPasswordChecks(form.password), [form.password]);

  const strength = useMemo(() => {
    return Object.values(passwordChecks).filter(Boolean).length;
  }, [passwordChecks]);

  const update = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
    if (globalError) setGlobalError("");
  };

  const validate = () => {
    const next = {};
    const trimmedFirst = form.firstName.trim();
    const trimmedLast = form.lastName.trim();
    const trimmedEmail = form.email.trim();

    // 1. First Name validation
    if (!trimmedFirst) {
      next.firstName = "First name is required";
    } else if (trimmedFirst.length < 2) {
      next.firstName = "First name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedFirst)) {
      next.firstName = "First name can only contain letters, hyphens, and apostrophes";
    }

    // 2. Last Name validation
    if (!trimmedLast) {
      next.lastName = "Last name is required";
    } else if (!/^[a-zA-Z\s'-]+$/.test(trimmedLast)) {
      next.lastName = "Last name can only contain letters, hyphens, and apostrophes";
    }

    // 3. Email validation
    if (!trimmedEmail) {
      next.email = "Email address is required";
    } else if (!validateEmail(trimmedEmail)) {
      next.email = "Please enter a valid email address (e.g. name@example.com)";
    }

    // 4. Password validation
    if (!form.password) {
      next.password = "Password is required";
    } else if (form.password.length < 8) {
      next.password = "Password must be at least 8 characters long";
    } else if (!isStrongPassword(form.password)) {
      next.password = "Must include uppercase, lowercase, a number, and a special character";
    }

    // 5. Confirm Password validation
    if (!form.confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      next.confirmPassword = "Passwords do not match";
    }

    setErrors(next);

    // Focus first invalid element
    if (next.firstName) firstNameRef.current?.focus();
    else if (next.lastName) lastNameRef.current?.focus();
    else if (next.email) emailRef.current?.focus();
    else if (next.password) passwordRef.current?.focus();
    else if (next.confirmPassword) confirmPasswordRef.current?.focus();

    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (loading) return; // Prevent duplicate submissions
    if (!validate()) return;

    setLoading(true);
    setGlobalError("");

    try {
      const registrationPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      };

      // Submit JSON payload directly to /api/v1/auth/register
      const response = await authApi.register(registrationPayload);
      const payload = response?.data && typeof response.data === "object" ? response.data : response;

      if (response?.success === false || payload?.success === false) {
        throw new Error(response?.message || payload?.message || "Registration failed");
      }

      const otpSessionId = payload?.otpSessionId || payload?.sessionId || payload?.data?.otpSessionId || "";
      const cooldownSeconds = payload?.cooldownSeconds ?? payload?.data?.cooldownSeconds ?? 30;
      const expiresInSeconds = payload?.expiresInSeconds ?? payload?.data?.expiresInSeconds ?? 300;

      if (!otpSessionId) {
        throw new Error("Registration completed but no verification session was returned. Please try signing in.");
      }

      // Store ONLY non-sensitive OTP verification context (never passwords)
      try {
        sessionStorage.setItem(
          "asivo_otp_context",
          JSON.stringify({
            email: form.email.trim().toLowerCase(),
            flow: "register",
            otpSessionId,
            cooldownSeconds,
            expiresInSeconds,
          })
        );
      } catch {
        // Fallback gracefully if storage is restricted
      }

      toast.success("Account created! Please verify your email with the one-time code sent to your inbox.", {
        duration: 5000,
      });

      // Account is in PENDING_VERIFICATION until OTP verified
      navigate("/otp-verify", {
        state: {
          email: form.email.trim().toLowerCase(),
          flow: "register",
          otpSessionId,
          cooldownSeconds,
          expiresInSeconds,
        },
      });
    } catch (error) {
      const status = error.response?.status;
      const parsed = parseApiError(error, "");
      const errorMsg = parsed.message || error.response?.data?.message || error.message || "Registration failed";

      if (status === 409 || errorMsg.toLowerCase().includes("already registered") || errorMsg.toLowerCase().includes("conflict")) {
        setErrors((prev) => ({
          ...prev,
          email: "This email address is already registered. Please sign in or use another email.",
        }));
        setGlobalError("An account with this email address already exists.");
        emailRef.current?.focus();
      } else {
        setGlobalError(errorMsg);
        setErrors((current) => ({ ...current, ...(parsed.fieldErrors || {}) }));
      }
      toast.error(errorMsg);
      // Notice: form.firstName, form.lastName, form.email are strictly preserved on error!
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = useMemo(() => {
    if (strength === 5) return { label: "Robust", color: "text-emerald-400" };
    if (strength >= 4) return { label: "Good", color: "text-[#C5A880]" };
    if (strength >= 3) return { label: "Fair", color: "text-amber-400" };
    return { label: "Weak", color: "text-rose-400" };
  }, [strength]);

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
            Create Asivo Account
          </h1>
          <p className="text-xs text-[#A1A1AA]">
            Join thousands of engineers mastering modern technologies.
          </p>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-rose-400 text-xs"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{globalError}</span>
          </div>
        )}

        {/* 5 Required Fields Form */}
        <form onSubmit={submit} noValidate className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="register-firstname"
                className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
              >
                First Name <span className="text-[#C5A880]">*</span>
              </label>
              <div className="relative">
                <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" aria-hidden="true" />
                <input
                  ref={firstNameRef}
                  id="register-firstname"
                  name="firstName"
                  type="text"
                  placeholder="Ada"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  disabled={loading}
                  autoComplete="given-name"
                  aria-required="true"
                  aria-invalid={Boolean(errors.firstName)}
                  aria-describedby={errors.firstName ? "firstname-error" : undefined}
                  className={`lms-input pl-10 text-xs ${errors.firstName ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                />
              </div>
              {errors.firstName && (
                <p id="firstname-error" className="text-[11px] text-rose-400 font-medium mt-1">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="register-lastname"
                className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
              >
                Last Name <span className="text-[#C5A880]">*</span>
              </label>
              <div className="relative">
                <UserRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" aria-hidden="true" />
                <input
                  ref={lastNameRef}
                  id="register-lastname"
                  name="lastName"
                  type="text"
                  placeholder="Lovelace"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  disabled={loading}
                  autoComplete="family-name"
                  aria-required="true"
                  aria-invalid={Boolean(errors.lastName)}
                  aria-describedby={errors.lastName ? "lastname-error" : undefined}
                  className={`lms-input pl-10 text-xs ${errors.lastName ? "border-rose-500/50 focus:border-rose-500" : ""}`}
                />
              </div>
              {errors.lastName && (
                <p id="lastname-error" className="text-[11px] text-rose-400 font-medium mt-1">
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label
              htmlFor="register-email"
              className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
            >
              Email Address <span className="text-[#C5A880]">*</span>
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" aria-hidden="true" />
              <input
                ref={emailRef}
                id="register-email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                disabled={loading}
                autoComplete="email"
                aria-required="true"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                className={`lms-input pl-10 text-xs ${errors.email ? "border-rose-500/50 focus:border-rose-500" : ""}`}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-[11px] text-rose-400 font-medium mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label
              htmlFor="register-password"
              className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
            >
              Password <span className="text-[#C5A880]">*</span>
            </label>
            <div className="relative">
              <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" aria-hidden="true" />
              <input
                ref={passwordRef}
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`lms-input pl-10 pr-10 text-xs ${errors.password ? "border-rose-500/50 focus:border-rose-500" : ""}`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F5F5F7] transition-colors focus:outline-none focus:text-[#C5A880]"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-[11px] text-rose-400 font-medium mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Password Strength & Requirements Checklist */}
          {form.password && (
            <div className="p-3.5 rounded-2xl bg-[#14141A] border border-white/[0.04] space-y-2.5 text-xs">
              <span className="font-semibold text-[#A1A1AA] text-[11px] uppercase tracking-wider block">
                Password Security Requirements:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                {[
                  ["length", "8+ characters"],
                  ["upper", "Uppercase letter (A-Z)"],
                  ["lower", "Lowercase letter (a-z)"],
                  ["number", "Number (0-9)"],
                  ["symbol", "Special symbol (!@#$%^&*)"],
                ].map(([rule, label]) => (
                  <span
                    key={rule}
                    className={`flex items-center gap-1.5 transition-colors ${
                      passwordChecks[rule] ? "text-[#C5A880] font-semibold" : "text-[#71717A]"
                    }`}
                  >
                    {passwordChecks[rule] ? <Check size={12} className="text-[#C5A880]" /> : <Circle size={10} />}
                    <span>{label}</span>
                  </span>
                ))}
              </div>

              {/* Strength Meter Bar */}
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
                <span className="text-[#A1A1AA]">
                  Strength:{" "}
                  <b className={strengthLabel.color}>{strengthLabel.label}</b>
                </span>
                <div className="flex gap-1" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <span
                      key={item}
                      className={`h-1.5 w-5 rounded-full transition-colors ${
                        item <= strength
                          ? strength === 5
                            ? "bg-emerald-400"
                            : strength >= 3
                            ? "bg-[#C5A880]"
                            : "bg-rose-400"
                          : "bg-white/[0.06]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label
              htmlFor="register-confirmpassword"
              className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider block"
            >
              Confirm Password <span className="text-[#C5A880]">*</span>
            </label>
            <div className="relative">
              <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" aria-hidden="true" />
              <input
                ref={confirmPasswordRef}
                id="register-confirmpassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                disabled={loading}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "confirmpassword-error" : undefined}
                className={`lms-input pl-10 pr-10 text-xs ${errors.confirmPassword ? "border-rose-500/50 focus:border-rose-500" : ""}`}
              />
              <button
                type="button"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F5F5F7] transition-colors focus:outline-none focus:text-[#C5A880]"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p id="confirmpassword-error" className="text-[11px] text-rose-400 font-medium mt-1">
                {errors.confirmPassword}
              </p>
            ) : form.confirmPassword ? (
              <p
                className={`text-[11px] font-semibold flex items-center gap-1.5 mt-1 ${
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
            ) : null}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="lms-btn-primary cursor-pointer active:scale-98 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#070709] border-t-transparent" />
                <span>Creating Account...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Create Account</span>
                <ArrowRight size={15} />
              </span>
            )}
          </button>
        </form>

        {/* Social Authentication */}
        <SocialAuthButtons mode="signup" />

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-white/[0.04] text-center">
          <p className="text-xs text-[#A1A1AA]">
            Already have an Asivo account?{" "}
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
