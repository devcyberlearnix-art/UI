import { useMemo, useState } from "react";
import { Check, Circle, Eye, EyeOff, LockKeyhole, Mail, UserRound, AlertCircle, ArrowRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../components/ui/AuthShell";
import { authApi } from "../api/authApi";
import { parseApiError } from "../utils/apiErrorParser";
import { getPasswordChecks, isStrongPassword, validateEmail } from "../utils/validation";

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
      try { sessionStorage.setItem("asivo_otp_context", JSON.stringify({
        email: form.email.trim().toLowerCase(), flow: "register", otpSessionId, cooldownSeconds, expiresInSeconds,
      })); } catch { /* Router state remains available if storage is restricted. */ }
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

  const field = (name, label, Icon, type = "text", placeholder = "") => {
    const password = name === "password" || name === "confirmPassword";
    const visible = name === "password" ? showPassword : showConfirmPassword;
    return (
      <div className="cyber-field">
        <label htmlFor={name}>{label} <span>*</span></label>
        <div className="cyber-field-control">
          <Icon size={15} aria-hidden="true" />
          <input id={name} name={name} type={password ? (visible ? "text" : "password") : type} value={form[name]} placeholder={placeholder} onChange={(event) => update(name, event.target.value)} disabled={loading} autoComplete={password ? (name === "password" ? "new-password" : "new-password") : name} />
          {password && <button type="button" aria-label={visible ? `Hide ${label}` : `Show ${label}`} onClick={() => (name === "password" ? setShowPassword((value) => !value) : setShowConfirmPassword((value) => !value))}><span>{visible ? <EyeOff size={15} /> : <Eye size={15} />}</span></button>}
        </div>
        {errors[name] && <p className="cyber-field-error">{errors[name]}</p>}
      </div>
    );
  };

  return (
    <AuthShell variant="signup" step={1}>
      <div className="cyber-card-heading">
        <h1>Create your account</h1>
        <p>Start your learning journey today.</p>
      </div>
      {globalError && <div className="cyber-form-error" role="alert"><AlertCircle size={16} />{globalError}</div>}
      <form onSubmit={submit} noValidate>
        <div className="cyber-name-grid">
          {field("firstName", "First name", UserRound, "text", "Enter your first name")}
          {field("lastName", "Last name", UserRound, "text", "Enter your last name")}
        </div>
        {field("email", "Email address", Mail, "email", "you@example.com")}
        {field("password", "Password", LockKeyhole, "password", "Create a strong password")}
        <div className="cyber-password-help" aria-live="polite">
          <strong>Password must contain:</strong>
          <div className="cyber-password-rules">
            {[["length", "At least 8 characters"], ["upper", "One uppercase letter (A–Z)"], ["lower", "One lowercase letter (a–z)"], ["number", "One number (0–9)"], ["symbol", "One special character"]].map(([rule, label]) => (
              <span key={rule} className={passwordChecks[rule] ? "met" : ""}>{passwordChecks[rule] ? <Check size={13} aria-hidden="true" /> : <Circle size={11} aria-hidden="true" />}{label}</span>
            ))}
          </div>
          <div className="cyber-strength" aria-label={form.password ? `Password strength ${strength} of 5` : "Password strength not entered"}>
            <small>Password strength: <b>{!form.password ? "Not entered" : strength === 5 ? "Strong" : strength >= 4 ? "Good" : strength >= 3 ? "Fair" : "Weak"}</b></small>
            <div>{[1, 2, 3, 4, 5].map((item) => <span key={item} className={item <= strength ? "filled" : ""} />)}</div>
          </div>
        </div>
        {field("confirmPassword", "Confirm password", LockKeyhole, "password", "Re-enter your password")}
        {form.confirmPassword && <p className={`cyber-confirm-feedback ${form.password === form.confirmPassword ? "match" : "mismatch"}`} role="status">{form.password === form.confirmPassword ? <><Check size={14} /> Passwords match</> : "Passwords do not match"}</p>}
        <button className="cyber-auth-button" type="submit" disabled={loading || !form.firstName.trim() || !form.lastName.trim() || !validateEmail(form.email) || !isStrongPassword(form.password) || form.password !== form.confirmPassword}>{loading ? "Creating account..." : "Create account"} <ArrowRight size={16} /></button>
      </form>
      <p className="cyber-auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthShell>
  );
};

export default Register;
