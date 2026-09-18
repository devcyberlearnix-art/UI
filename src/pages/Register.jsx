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

const countryCodes = [
  { code: "+1", name: "United States" },
  { code: "+1", name: "Canada" },
  { code: "+7", name: "Russia" },
  { code: "+20", name: "Egypt" },
  { code: "+27", name: "South Africa" },
  { code: "+30", name: "Greece" },
  { code: "+31", name: "Netherlands" },
  { code: "+32", name: "Belgium" },
  { code: "+33", name: "France" },
  { code: "+34", name: "Spain" },
  { code: "+36", name: "Hungary" },
  { code: "+39", name: "Italy" },
  { code: "+40", name: "Romania" },
  { code: "+41", name: "Switzerland" },
  { code: "+43", name: "Austria" },
  { code: "+44", name: "United Kingdom" },
  { code: "+45", name: "Denmark" },
  { code: "+46", name: "Sweden" },
  { code: "+47", name: "Norway" },
  { code: "+48", name: "Poland" },
  { code: "+51", name: "Peru" },
  { code: "+52", name: "Mexico" },
  { code: "+53", name: "Cuba" },
  { code: "+54", name: "Argentina" },
  { code: "+55", name: "Brazil" },
  { code: "+56", name: "Chile" },
  { code: "+57", name: "Colombia" },
  { code: "+58", name: "Venezuela" },
  { code: "+60", name: "Malaysia" },
  { code: "+61", name: "Australia" },
  { code: "+62", name: "Indonesia" },
  { code: "+63", name: "Philippines" },
  { code: "+64", name: "New Zealand" },
  { code: "+65", name: "Singapore" },
  { code: "+66", name: "Thailand" },
  { code: "+81", name: "Japan" },
  { code: "+82", name: "South Korea" },
  { code: "+84", name: "Vietnam" },
  { code: "+86", name: "China" },
  { code: "+90", name: "Turkey" },
  { code: "+91", name: "India" },
  { code: "+92", name: "Pakistan" },
  { code: "+93", name: "Afghanistan" },
  { code: "+94", name: "Sri Lanka" },
  { code: "+95", name: "Myanmar" },
  { code: "+98", name: "Iran" },
  { code: "+211", name: "South Sudan" },
  { code: "+212", name: "Morocco" },
  { code: "+213", name: "Algeria" },
  { code: "+216", name: "Tunisia" },
  { code: "+218", name: "Libya" },
  { code: "+220", name: "Gambia" },
  { code: "+221", name: "Senegal" },
  { code: "+222", name: "Mauritania" },
  { code: "+223", name: "Mali" },
  { code: "+224", name: "Guinea" },
  { code: "+225", name: "Côte d’Ivoire" },
  { code: "+226", name: "Burkina Faso" },
  { code: "+227", name: "Niger" },
  { code: "+228", name: "Togo" },
  { code: "+229", name: "Benin" },
  { code: "+230", name: "Mauritius" },
  { code: "+231", name: "Liberia" },
  { code: "+232", name: "Sierra Leone" },
  { code: "+233", name: "Ghana" },
  { code: "+234", name: "Nigeria" },
  { code: "+235", name: "Chad" },
  { code: "+236", name: "Central African Republic" },
  { code: "+237", name: "Cameroon" },
  { code: "+238", name: "Cape Verde" },
  { code: "+239", name: "Sao Tome and Principe" },
  { code: "+240", name: "Equatorial Guinea" },
  { code: "+241", name: "Gabon" },
  { code: "+242", name: "Republic of the Congo" },
  { code: "+243", name: "Democratic Republic of the Congo" },
  { code: "+244", name: "Angola" },
  { code: "+245", name: "Guinea-Bissau" },
  { code: "+246", name: "Diego Garcia" },
  { code: "+248", name: "Seychelles" },
  { code: "+249", name: "Sudan" },
  { code: "+250", name: "Rwanda" },
  { code: "+251", name: "Ethiopia" },
  { code: "+252", name: "Somalia" },
  { code: "+253", name: "Djibouti" },
  { code: "+254", name: "Kenya" },
  { code: "+255", name: "Tanzania" },
  { code: "+256", name: "Uganda" },
  { code: "+258", name: "Mozambique" },
  { code: "+260", name: "Zambia" },
  { code: "+261", name: "Madagascar" },
  { code: "+262", name: "Réunion" },
  { code: "+263", name: "Zimbabwe" },
  { code: "+264", name: "Namibia" },
  { code: "+265", name: "Malawi" },
  { code: "+266", name: "Lesotho" },
  { code: "+267", name: "Botswana" },
  { code: "+268", name: "Eswatini" },
  { code: "+269", name: "Comoros" },
  { code: "+290", name: "Saint Helena" },
  { code: "+291", name: "Eritrea" },
  { code: "+297", name: "Aruba" },
  { code: "+298", name: "Faroe Islands" },
  { code: "+299", name: "Greenland" },
  { code: "+350", name: "Gibraltar" },
  { code: "+351", name: "Portugal" },
  { code: "+352", name: "Luxembourg" },
  { code: "+353", name: "Ireland" },
  { code: "+354", name: "Iceland" },
  { code: "+355", name: "Albania" },
  { code: "+356", name: "Malta" },
  { code: "+357", name: "Cyprus" },
  { code: "+358", name: "Finland" },
  { code: "+359", name: "Bulgaria" },
  { code: "+370", name: "Lithuania" },
  { code: "+371", name: "Latvia" },
  { code: "+372", name: "Estonia" },
  { code: "+373", name: "Moldova" },
  { code: "+374", name: "Armenia" },
  { code: "+375", name: "Belarus" },
  { code: "+376", name: "Andorra" },
  { code: "+377", name: "Monaco" },
  { code: "+378", name: "San Marino" },
  { code: "+380", name: "Ukraine" },
  { code: "+381", name: "Serbia" },
  { code: "+382", name: "Montenegro" },
  { code: "+385", name: "Croatia" },
  { code: "+386", name: "Slovenia" },
  { code: "+387", name: "Bosnia and Herzegovina" },
  { code: "+389", name: "North Macedonia" },
  { code: "+420", name: "Czech Republic" },
  { code: "+421", name: "Slovakia" },
  { code: "+423", name: "Liechtenstein" },
  { code: "+500", name: "Falkland Islands" },
  { code: "+501", name: "Belize" },
  { code: "+502", name: "Guatemala" },
  { code: "+503", name: "El Salvador" },
  { code: "+504", name: "Honduras" },
  { code: "+505", name: "Nicaragua" },
  { code: "+506", name: "Costa Rica" },
  { code: "+507", name: "Panama" },
  { code: "+508", name: "Saint Pierre and Miquelon" },
  { code: "+509", name: "Haiti" },
  { code: "+590", name: "Guadeloupe" },
  { code: "+591", name: "Bolivia" },
  { code: "+592", name: "Guyana" },
  { code: "+593", name: "Ecuador" },
  { code: "+594", name: "French Guiana" },
  { code: "+595", name: "Paraguay" },
  { code: "+596", name: "Martinique" },
  { code: "+597", name: "Suriname" },
  { code: "+598", name: "Uruguay" },
  { code: "+599", name: "Curacao" },
  { code: "+670", name: "Timor-Leste" },
  { code: "+672", name: "Antarctica" },
  { code: "+673", name: "Brunei" },
  { code: "+674", name: "Nauru" },
  { code: "+675", name: "Papua New Guinea" },
  { code: "+676", name: "Tonga" },
  { code: "+677", name: "Solomon Islands" },
  { code: "+678", name: "Vanuatu" },
  { code: "+679", name: "Fiji" },
  { code: "+680", name: "Palau" },
  { code: "+681", name: "Wallis and Futuna" },
  { code: "+682", name: "Cook Islands" },
  { code: "+683", name: "Niue" },
  { code: "+685", name: "Samoa" },
  { code: "+686", name: "Kiribati" },
  { code: "+687", name: "New Caledonia" },
  { code: "+688", name: "Tuvalu" },
  { code: "+689", name: "French Polynesia" },
  { code: "+690", name: "Tokelau" },
  { code: "+691", name: "Micronesia" },
  { code: "+692", name: "Marshall Islands" },
  { code: "+850", name: "North Korea" },
  { code: "+852", name: "Hong Kong" },
  { code: "+853", name: "Macau" },
  { code: "+855", name: "Cambodia" },
  { code: "+856", name: "Laos" },
  { code: "+880", name: "Bangladesh" },
  { code: "+886", name: "Taiwan" },
  { code: "+960", name: "Maldives" },
  { code: "+961", name: "Lebanon" },
  { code: "+962", name: "Jordan" },
  { code: "+963", name: "Syria" },
  { code: "+964", name: "Iraq" },
  { code: "+965", name: "Kuwait" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+967", name: "Yemen" },
  { code: "+968", name: "Oman" },
  { code: "+971", name: "United Arab Emirates" },
  { code: "+972", name: "Israel" },
  { code: "+973", name: "Bahrain" },
  { code: "+974", name: "Qatar" },
  { code: "+975", name: "Bhutan" },
  { code: "+976", name: "Mongolia" },
  { code: "+977", name: "Nepal" },
  { code: "+992", name: "Tajikistan" },
  { code: "+993", name: "Turkmenistan" },
  { code: "+994", name: "Azerbaijan" },
  { code: "+995", name: "Georgia" },
  { code: "+996", name: "Kyrgyzstan" },
  { code: "+998", name: "Uzbekistan" },
];

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
  const [showCountryCodeMenu, setShowCountryCodeMenu] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState("");
  const [skillInput, setSkillInput] = useState("");
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
    skills: [],
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

  const filteredCountryCodes = useMemo(() => {
    const query = countryCodeSearch.trim().toLowerCase();

    if (!query) return countryCodes;

    return countryCodes.filter(({ code, name }) => {
      return (
        code.toLowerCase().includes(query) ||
        name.toLowerCase().includes(query) ||
        `${code} ${name}`.toLowerCase().includes(query)
      );
    });
  }, [countryCodeSearch]);

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

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    const normalizedValue = trimmed.replace(/,$/, "");
    if (!normalizedValue) return;

    const nextSkills = [...(Array.isArray(formData.skills) ? formData.skills : [])];
    const skillValue = normalizedValue.trim();

    if (!nextSkills.includes(skillValue)) {
      nextSkills.push(skillValue);
      updateField("skills", nextSkills);
    }

    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    const nextSkills = (Array.isArray(formData.skills) ? formData.skills : []).filter(
      (skill) => skill !== skillToRemove
    );
    updateField("skills", nextSkills);
  };

  const FieldError = ({ name }) =>
    errors[name] ? <p className="mt-1 text-xs text-red-600">{errors[name]}</p> : null;

  const isStepValid = (step) => {
    if (step === 1) {
      return (
        formData.firstName.trim() !== "" &&
        formData.lastName.trim() !== "" &&
        /\S+@\S+\.\S+/.test(formData.email)
      );
    }

    if (step === 2) {
      return (
        formData.password.length >= 6 &&
        passwordStrength >= 3 &&
        formData.password === formData.confirmPassword &&
        formData.confirmPassword.trim() !== ""
      );
    }

    if (step === 3) {
      const mobileValue = formData.mobile.trim();
      const skillsArray = Array.isArray(formData.skills) ? formData.skills : [];

      const isValidMobile = /^[6-9]\d{9}$/.test(mobileValue);

      return (
        isValidMobile &&
        !!formData.dob &&
        formData.city.trim() !== "" &&
        formData.state.trim() !== "" &&
        formData.country.trim() !== "" &&
        !!formData.preferredLanguage &&
        skillsArray.length > 0
      );
    }

    if (step === 4) {
      return !!formData.agreeToTerms;
    }

    return false;
  };

  const currentStepValidationMessage =
    currentStep < 4 && !isStepValid(currentStep)
      ? "Please fill all required fields before moving to the next step."
      : "";

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
      const mobileValue = formData.mobile.trim();
      if (!/^[6-9]\d{9}$/.test(mobileValue)) {
        nextErrors.mobile = "Valid 10-digit mobile number starting with 6-9 is required";
      }
      if (!formData.dob) nextErrors.dob = "Date of birth is required";
      if (!formData.city.trim()) nextErrors.city = "City is required"; // ✅ Updated for Text Input
      if (!formData.state.trim()) nextErrors.state = "State is required"; // ✅ Updated for Text Input
      if (!formData.country.trim()) nextErrors.country = "Country is required"; // ✅ Updated for Text Input
      if (!formData.preferredLanguage) nextErrors.preferredLanguage = "Preferred language is required";
      if (!Array.isArray(formData.skills) || formData.skills.length === 0) {
        nextErrors.skills = "At least one skill is required";
      }
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
        skills: Array.isArray(formData.skills) ? formData.skills : [],
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

      {currentStepValidationMessage && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>{currentStepValidationMessage}</span>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="lms-input pl-10" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
                  </div>
                  <FieldError name="firstName" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="lms-input pl-10" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
                  </div>
                  <FieldError name="lastName" />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Password <span className="text-red-500">*</span>
                  </label>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <div className="relative">
                      <button
                        type="button"
                        className="lms-input flex w-full items-center justify-between gap-2 text-left"
                        onClick={() => setShowCountryCodeMenu((prev) => !prev)}
                      >
                        <span>{formData.countryCode || "+91"}</span>
                        <span className="text-xs text-slate-500">▾</span>
                      </button>

                      {showCountryCodeMenu && (
                        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                          <div className="border-b border-slate-200 p-2">
                            <input
                              type="text"
                              value={countryCodeSearch}
                              onChange={(e) => setCountryCodeSearch(e.target.value)}
                              placeholder="Search country or code"
                              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-0 focus:border-orange-300"
                            />
                          </div>

                          <div className="max-h-64 overflow-y-auto">
                            {filteredCountryCodes.length > 0 ? (
                              filteredCountryCodes.map(({ code, name }) => (
                                <button
                                  key={`${code}-${name}`}
                                  type="button"
                                  className="flex w-full items-center justify-between gap-2 border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-orange-50"
                                  onClick={() => {
                                    updateField("countryCode", code);
                                    setShowCountryCodeMenu(false);
                                    setCountryCodeSearch("");
                                  }}
                                >
                                  <span>{code}</span>
                                  <span className="truncate text-right text-slate-500">{name}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-3 text-sm text-slate-500">No country code found</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        className="lms-input pl-10"
                        value={formData.mobile}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                          updateField("mobile", value);
                        }}
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter 10-digit mobile"
                      />
                    </div>
                  </div>
                  <FieldError name="mobile" />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    City <span className="text-red-500">*</span>
                  </label>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    State <span className="text-red-500">*</span>
                  </label>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Country <span className="text-red-500">*</span>
                  </label>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Preferred Language <span className="text-red-500">*</span>
                  </label>
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
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Skills <span className="text-red-500">*</span>
                  </label>

                  <div className="rounded-xl border border-slate-200 bg-white p-2">
                    <div className="mb-2 flex min-h-[42px] flex-wrap gap-2">
                      {(Array.isArray(formData.skills) ? formData.skills : []).map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-sm text-orange-700"
                        >
                          {skill}
                          <button
                            type="button"
                            className="text-xs font-semibold text-orange-700 hover:text-orange-900"
                            onClick={() => removeSkill(skill)}
                            aria-label={`Remove ${skill}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <input
                      className="w-full border-0 bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Type a skill and press Enter"
                    />
                  </div>

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={addSkill}
                      className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                    >
                      Add Skill
                    </button>
                  </div>

                  <FieldError name="skills" />
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
                      I have read and agree to the <button type="button" className="text-orange-600 hover:underline font-medium">Terms of Service</button> and <button type="button" className="text-orange-600 hover:underline font-medium">Privacy Policy</button>.<span className="text-red-500"> *</span>
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
            <button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="lms-btn-primary w-auto px-5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || photoUploading || !isStepValid(4)}
              className="lms-btn-primary w-auto px-5 disabled:cursor-not-allowed disabled:opacity-50"
            >
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