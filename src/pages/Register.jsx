import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Globe,
  Languages,
  Lock,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
} from "lucide-react";
import AuthShell from "../components/ui/AuthShell";

const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"];

const steps = [
  { id: 1, title: "Account" },
  { id: 2, title: "Security" },
  { id: 3, title: "Profile" },
  { id: 4, title: "Terms" }, // ✅ Added Step 4
];

// ✅ Use your ngrok URL as the default base
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://matted-ascent-specimen.ngrok-free.dev";

const Register = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSessionId, setOtpSessionId] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryCode: "+91",
    mobile: "",
    dob: "",
    city: "",
    state: "",
    country: "",
    preferredLanguage: "",
    organization: "",
    skills: "",
    fieldOfStudy: "",
    highestQualification: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});

  const passwordStrength = useMemo(() => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[$@#&!]/.test(password)) strength += 1;
    return strength;
  }, [formData.password]);

  const strengthColor =
    passwordStrength <= 2 ? "#ef4444" : passwordStrength <= 3 ? "#f59e0b" : "#16a34a";
  const strengthText =
    passwordStrength <= 2 ? "Weak" : passwordStrength <= 3 ? "Medium" : "Strong";

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const FieldError = ({ name }) =>
    errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name]}</p> : null;

  const validateStep = (step) => {
    const nextErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) nextErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) nextErrors.lastName = "Last name is required";
      if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = "Valid email is required";
    }

    if (step === 2) {
      if (formData.password.length < 6) nextErrors.password = "Password must be at least 6 characters";
      if (passwordStrength < 3) nextErrors.password = "Password is too weak";
      if (formData.password !== formData.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (step === 3) {
      if (!/^[6-9]\d{9}$/.test(formData.mobile)) nextErrors.mobile = "Valid 10-digit mobile is required";
      if (!formData.dob) nextErrors.dob = "Date of birth is required";
      if (!formData.city.trim()) nextErrors.city = "City is required"; // ✅ Updated for Text Input
      if (!formData.state.trim()) nextErrors.state = "State is required"; // ✅ Updated for Text Input
      if (!formData.country.trim()) nextErrors.country = "Country is required"; // ✅ Updated for Text Input
      if (!formData.preferredLanguage) nextErrors.preferredLanguage = "Preferred language is required";
    }

    if (step === 4) {
      if (!formData.agreeToTerms) nextErrors.agreeToTerms = "Please accept the Terms and Privacy Policy";
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Photo size should be less than 5MB");
      setMessageType("error");
      return;
    }

    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);

    const payload = new FormData();
    payload.append("profilePhoto", file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/upload/profile-photo`, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setPhotoUrl(data.photoUrl || data.url || data.filePath || "");
      setMessage("Photo uploaded successfully");
      setMessageType("success");
    } catch {
      setMessage("Failed to upload photo. Please try again");
      setMessageType("error");
      setPhotoPreview("");
      setPhotoUrl("");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setMessage("Please fix the highlighted fields before continuing");
      setMessageType("error");
      return;
    }
    setMessage("");
    setCurrentStep((prev) => Math.min(prev + 1, 4)); // ✅ Updated to 4
  };

  const handleBack = () => {
    setMessage("");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    // ✅ Validate all 4 steps before submitting
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      setMessage("Please correct the highlighted fields");
      setMessageType("error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        countryCode: formData.countryCode,
        mobileNumber: formData.mobile,
        dob: formData.dob,
        profilePhoto: photoUrl || "",
        city: formData.city,
        state: formData.state,
        country: formData.country,
        preferredLanguage: formData.preferredLanguage,
        organization: formData.organization || "",
        skills: formData.skills
          ? formData.skills.split(",").map((item) => item.trim()).filter(Boolean)
          : [],
        fieldOfStudy: formData.fieldOfStudy || "",
        highestQualification: formData.highestQualification || "",
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      const sessionId = data.otpSessionId || data.sessionId || data.data?.otpSessionId || "";
      setOtpSessionId(sessionId);

      setMessage("Registration successful. Redirecting to verify...");
      setMessageType("success");
      setTimeout(
        () =>
          navigate("/otp-verify", {
            state: {
              email: formData.email,
              flow: "register",
              otpSessionId: sessionId,
            },
          }),
        900
      );
    } catch (err) {
      setMessage(err.message || "Registration failed. Please try again");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create Your Learning Identity"
      subtitle="A guided onboarding flow designed for clarity, speed, and a polished user experience."
      eyebrow="LearnMaster Enroll"
      highlights={[
        { value: "4-Step", label: "Signup" }, // ✅ Updated to 4-Step
        { value: "Smooth", label: "Flow" },
        { value: "Secure", label: "Account" },
      ]}
    >
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Create Account</h1>
      <p className="mb-5 text-sm text-slate-500">Simple steps, clean inputs, and strong security.</p>

      {/* ✅ Updated to grid-cols-4 */}
      <div className="mb-6 grid grid-cols-4 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        {steps.map((step) => {
          const active = step.id === currentStep;
          const done = step.id < currentStep;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                if (step.id <= currentStep) setCurrentStep(step.id);
              }}
              className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                active
                  ? "bg-white text-orange-600 shadow"
                  : done
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500"
              }`}
            >
              {done ? "Done" : `Step ${step.id}`} - {step.title}
            </button>
          );
        })}
      </div>

      {message && (
        <div
          className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
            messageType === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {messageType === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
                  <div className="relative">
                    <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="lms-input pl-10" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
                  </div>
                  <FieldError name="firstName" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
                  <div className="relative">
                    <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="lms-input pl-10" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
                  </div>
                  <FieldError name="lastName" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    className="lms-input pl-10"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
                <FieldError name="email" />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      className="lms-input pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full transition-all" style={{ width: `${(passwordStrength / 5) * 100}%`, backgroundColor: strengthColor }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: strengthColor }}>{strengthText}</span>
                  </div>
                  <FieldError name="password" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="lms-input pl-10 pr-10"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <FieldError name="confirmPassword" />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-white">
                  <img
                    src={photoPreview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-600">
                  <Upload size={16} /> {photoUploading ? "Uploading..." : "Upload Photo"}
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mobile Number</label>
                  <div className="grid grid-cols-[90px_1fr] gap-2">
                    <select className="lms-input" value={formData.countryCode} onChange={(e) => updateField("countryCode", e.target.value)}>
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <div className="relative">
                      <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input className="lms-input pl-10" value={formData.mobile} onChange={(e) => updateField("mobile", e.target.value)} />
                    </div>
                  </div>
                  <FieldError name="mobile" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Date of Birth</label>
                  <div className="relative">
                    <Calendar size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" className="lms-input pl-10" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} />
                  </div>
                  <FieldError name="dob" />
                </div>
              </div>

              {/* ✅ Converted City, State, and Country to standard text inputs */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">City</label>
                  <div className="relative">
                    <MapPin size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      className="lms-input pl-10" 
                      placeholder="Enter your city"
                      value={formData.city} 
                      onChange={(e) => updateField("city", e.target.value)} 
                    />
                  </div>
                  <FieldError name="city" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">State</label>
                  <div className="relative">
                    <MapPin size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      className="lms-input pl-10" 
                      placeholder="Enter your state"
                      value={formData.state} 
                      onChange={(e) => updateField("state", e.target.value)} 
                    />
                  </div>
                  <FieldError name="state" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Country</label>
                  <div className="relative">
                    <Globe size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      className="lms-input pl-10" 
                      placeholder="Enter your country"
                      value={formData.country} 
                      onChange={(e) => updateField("country", e.target.value)} 
                    />
                  </div>
                  <FieldError name="country" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Preferred Language</label>
                  <div className="relative">
                    <Languages size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      className="lms-input pl-10"
                      value={formData.preferredLanguage}
                      onChange={(e) => updateField("preferredLanguage", e.target.value)}
                    >
                      <option value="">Select</option>
                      {languages.map((language) => (
                        <option key={language} value={language}>{language}</option>
                      ))}
                    </select>
                  </div>
                  <FieldError name="preferredLanguage" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Field of Study</label>
                  <div className="relative">
                    <BookOpen size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="lms-input pl-10" value={formData.fieldOfStudy} onChange={(e) => updateField("fieldOfStudy", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Skills</label>
                  <input className="lms-input" value={formData.skills} onChange={(e) => updateField("skills", e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Highest Qualification</label>
                  <div className="relative">
                    <Award size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="lms-input pl-10" value={formData.highestQualification} onChange={(e) => updateField("highestQualification", e.target.value)} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ✅ Added Step 4: Terms & Conditions */}
          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="mb-3 text-lg font-semibold text-slate-800">Terms & Conditions</h3>
                <div className="mb-4 max-h-48 overflow-y-auto rounded-lg bg-white p-4 text-sm text-slate-600 shadow-inner border border-slate-100">
                  <p className="mb-2">
                    <strong>1. Acceptance of Terms</strong><br />
                    By registering for an account on LearnMaster, you agree to abide by these Terms & Conditions and our Privacy Policy.
                  </p>
                  <p className="mb-2">
                    <strong>2. User Responsibilities</strong><br />
                    You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
                  </p>
                  <p className="mb-2">
                    <strong>3. Account Accuracy</strong><br />
                    You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                  </p>
                  <p>
                    <strong>4. Privacy</strong><br />
                    We respect your privacy. Please refer to our Privacy Policy for information on how we collect, use, and protect your personal data.
                  </p>
                </div>

                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) => updateField("agreeToTerms", e.target.checked)}
                      className="mt-0.5 h-5 w-5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-slate-700 leading-relaxed">
                      I have read and agree to the <button type="button" className="text-orange-600 hover:underline font-medium">Terms of Service</button> and <button type="button" className="text-orange-600 hover:underline font-medium">Privacy Policy</button>.
                    </span>
                  </label>
                  <FieldError name="agreeToTerms" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-2 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
            >
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <span />
          )}

          {/* ✅ Logic changed to show "Next" until Step 4, then "Create Account" */}
          {currentStep < 4 ? (
            <button type="button" onClick={handleNext} className="lms-btn-primary w-auto px-5">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={loading || photoUploading} className="lms-btn-primary w-auto px-5">
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <CheckCircle size={16} className="ml-1" />}
            </button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="lms-link">Sign In</button>
      </p>
    </AuthShell>
  );
};

export default Register;