import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Award,
  BookOpen,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Search,
  Building2,
  GraduationCap,
  Check,
  ChevronDown,
  RefreshCw,
  QrCode,
  CreditCard,
  ChevronLeft,
  Shield,
  Circle,
} from "lucide-react";

// Curated 30 Countries with ISO-2 codes (No emojis)
const countryCodes = [
  { code: "+91", name: "India", iso: "IN" },
  { code: "+1", name: "United States", iso: "US" },
  { code: "+44", name: "United Kingdom", iso: "GB" },
  { code: "+1", name: "Canada", iso: "CA" },
  { code: "+61", name: "Australia", iso: "AU" },
  { code: "+971", name: "United Arab Emirates", iso: "AE" },
  { code: "+65", name: "Singapore", iso: "SG" },
  { code: "+49", name: "Germany", iso: "DE" },
  { code: "+33", name: "France", iso: "FR" },
  { code: "+81", name: "Japan", iso: "JP" },
  { code: "+966", name: "Saudi Arabia", iso: "SA" },
  { code: "+974", name: "Qatar", iso: "QA" },
  { code: "+60", name: "Malaysia", iso: "MY" },
  { code: "+62", name: "Indonesia", iso: "ID" },
  { code: "+31", name: "Netherlands", iso: "NL" },
  { code: "+41", name: "Switzerland", iso: "CH" },
  { code: "+46", name: "Sweden", iso: "SE" },
  { code: "+34", name: "Spain", iso: "ES" },
  { code: "+39", name: "Italy", iso: "IT" },
  { code: "+82", name: "South Korea", iso: "KR" },
  { code: "+55", name: "Brazil", iso: "BR" },
  { code: "+52", name: "Mexico", iso: "MX" },
  { code: "+27", name: "South Africa", iso: "ZA" },
  { code: "+92", name: "Pakistan", iso: "PK" },
  { code: "+880", name: "Bangladesh", iso: "BD" },
  { code: "+977", name: "Nepal", iso: "NP" },
  { code: "+94", name: "Sri Lanka", iso: "LK" },
  { code: "+234", name: "Nigeria", iso: "NG" },
  { code: "+254", name: "Kenya", iso: "KE" },
  { code: "+353", name: "Ireland", iso: "IE" },
];

const popularLanguages = [
  "English",
  "Telugu",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Spanish",
  "French",
];

const popularSkills = [
  "Java",
  "Python",
  "C",
  "C++",
  "JavaScript",
  "React",
  "Node.js",
  "Spring Boot",
  "SQL",
  "Cloud / AWS",
  "AI / ML",
];

const qualificationPresets = [
  "Btech",
  "Mtech",
  "BCA",
  "MCA",
  "BSc",
  "MSc",
  "High School",
  "PhD",
  "Other",
];

const fieldOfStudyPresets = [
  "Computer Science Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Comm. (ECE)",
  "Electrical Engineering (EEE)",
  "Mechanical Engineering",
  "Business & Management",
];

const presetAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
  "https://drive.google.com/uc?export=view&id=1LJJ8UqxURA0Y-XUbAihlXRo14t1J4UvF",
];

const steps = [
  { id: 1, label: "Identity", title: "Personal Details", subtitle: "Name, email & security password" },
  { id: 2, label: "Contact", title: "Contact & Address", subtitle: "Mobile number, birth date & city" },
  { id: 3, label: "Academic", title: "Skills & Education", subtitle: "Degree, languages & competencies" },
  { id: 4, label: "Confirm", title: "Review & Security", subtitle: "Verify information & request OTP" },
];

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://matted-ascent-specimen.ngrok-free.dev";

const Register = () => {
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [globalError, setGlobalError] = useState("");

  // Form State
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
    country: "India",
    preferredLanguages: ["English"],
    organization: "cyberlearnix",
    skills: ["Java", "C"],
    fieldOfStudy: "Computer Science Engineering",
    highestQualification: "Btech",
    agreeToTerms: false,
  });

  // Photo state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUrl, setPhotoUrl] = useState(
    "https://drive.google.com/uc?export=view&id=1LJJ8UqxURA0Y-XUbAihlXRo14t1J4UvF"
  );
  const fileInputRef = useRef(null);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Country Code Dropdown
  const [showCountryCodeMenu, setShowCountryCodeMenu] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState("");
  const countryDropdownRef = useRef(null);

  // Skill Input
  const [skillInput, setSkillInput] = useState("");

  // Errors
  const [errors, setErrors] = useState({});

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(e.target)
      ) {
        setShowCountryCodeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter country codes
  const filteredCountryCodes = useMemo(() => {
    const q = countryCodeSearch.trim().toLowerCase();
    if (!q) return countryCodes;
    return countryCodes.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [countryCodeSearch]);

  const selectedCountry = useMemo(() => {
    return (
      countryCodes.find((c) => c.code === formData.countryCode) || {
        code: formData.countryCode,
        name: "International",
        iso: "INT",
      }
    );
  }, [formData.countryCode]);

  // Clean Technical Password Strength Analysis (No Emojis)
  const passwordAnalysis = useMemo(() => {
    const p = formData.password || "";
    const rules = {
      length: p.length >= 8,
      lower: /[a-z]/.test(p),
      upper: /[A-Z]/.test(p),
      num: /\d/.test(p),
      sym: /[@$#!%*?&_]/.test(p),
    };
    const passed = Object.values(rules).filter(Boolean).length;
    let label = "Enter password";
    let colorClass = "text-slate-400";
    let barColorClass = "bg-slate-200";

    if (passed >= 5) {
      label = "Optimal";
      colorClass = "text-emerald-700";
      barColorClass = "bg-emerald-600";
    } else if (passed >= 4) {
      label = "Strong";
      colorClass = "text-emerald-600";
      barColorClass = "bg-emerald-500";
    } else if (passed >= 3) {
      label = "Fair";
      colorClass = "text-amber-600";
      barColorClass = "bg-amber-500";
    } else if (passed >= 1) {
      label = "Weak";
      colorClass = "text-rose-600";
      barColorClass = "bg-rose-500";
    }
    return { rules, passed, label, colorClass, barColorClass };
  }, [formData.password]);

  // Calculate age
  const calculatedAge = useMemo(() => {
    if (!formData.dob) return null;
    const b = new Date(formData.dob);
    if (isNaN(b.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    return age;
  }, [formData.dob]);

  // Update Field Helper
  const updateField = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (globalError) setGlobalError("");
  };

  // Toggle Language Pill
  const toggleLanguage = (lang) => {
    const current = [...(formData.preferredLanguages || [])];
    const idx = current.indexOf(lang);
    if (idx >= 0) {
      if (current.length > 1) {
        current.splice(idx, 1);
      } else {
        toast.error("Please keep at least one preferred language");
        return;
      }
    } else {
      current.push(lang);
    }
    updateField("preferredLanguages", current);
  };

  // Add / Remove Skills
  const addSkill = (skill) => {
    const raw = skill || skillInput;
    const clean = raw.trim().replace(/^,+|,+$/g, "");
    if (!clean) return;
    const current = [...(formData.skills || [])];
    if (!current.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      current.push(clean);
      updateField("skills", current);
    }
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    const current = (formData.skills || []).filter((s) => s !== skill);
    updateField("skills", current);
  };

  // Photo handlers
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.");
      return;
    }
    setPhotoFile(file);
    const preview = URL.createObjectURL(file);
    setPhotoPreview(preview);
    toast.success("Profile photo attached");
  };

  const selectPresetAvatar = (url) => {
    setPhotoUrl(url);
    setPhotoPreview(url);
    setPhotoFile(null);
    toast.success("Avatar updated");
  };

  // Step Validation
  const validateStep = (stepNumber) => {
    const errs = {};

    if (stepNumber === 1) {
      if (!formData.firstName.trim()) errs.firstName = "First name is required";
      if (!formData.lastName.trim()) errs.lastName = "Last name is required";

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        errs.email = "Email address is required";
      } else if (!emailRegex.test(formData.email.trim())) {
        errs.email = "Enter a valid email address";
      }

      if (!formData.password) {
        errs.password = "Password is required";
      } else if (formData.password.length < 6) {
        errs.password = "Minimum 6 characters required";
      } else if (passwordAnalysis.passed < 3) {
        errs.password = "Must include uppercase, numbers, and symbols";
      }

      if (!formData.confirmPassword) {
        errs.confirmPassword = "Confirm password is required";
      } else if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = "Passwords do not match";
      }
    }

    if (stepNumber === 2) {
      const mob = formData.mobile.replace(/\D/g, "");
      if (!mob) {
        errs.mobile = "Mobile number is required";
      } else if (formData.countryCode === "+91" && !/^[6-9]\d{9}$/.test(mob)) {
        errs.mobile = "Enter a valid 10-digit mobile number";
      } else if (mob.length < 7 || mob.length > 15) {
        errs.mobile = "Enter a valid phone number (7-15 digits)";
      }

      if (!formData.dob) {
        errs.dob = "Date of birth is required";
      } else if (calculatedAge !== null && calculatedAge < 10) {
        errs.dob = "Learner must be at least 10 years of age";
      }

      if (!formData.city.trim()) errs.city = "City is required";
      if (!formData.state.trim()) errs.state = "State is required";
      if (!formData.country.trim()) errs.country = "Country is required";
    }

    if (stepNumber === 3) {
      if (!formData.skills || formData.skills.length === 0) {
        errs.skills = "Select or enter at least one skill";
      }
      if (!formData.preferredLanguages || formData.preferredLanguages.length === 0) {
        errs.preferredLanguages = "Select at least one preferred language";
      }
      if (!formData.highestQualification.trim()) {
        errs.highestQualification = "Qualification is required";
      }
      if (!formData.fieldOfStudy.trim()) {
        errs.fieldOfStudy = "Field of study is required";
      }
    }

    if (stepNumber === 4) {
      if (!formData.agreeToTerms) {
        errs.agreeToTerms = "Please agree to the Terms of Service & Privacy Policy";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fill in the required fields");
      return;
    }
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const jumpToStep = (id) => {
    if (id < currentStep) {
      setDirection(-1);
      setCurrentStep(id);
    } else if (id === currentStep + 1 && validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(id);
    }
  };

  // Submit Handler: Matches exact curl multipart/form-data
  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setGlobalError("");

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      toast.error("Please verify all required fields across each section.");
      return;
    }

    setLoading(true);

    try {
      const payloadData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        countryCode: formData.countryCode || "+91",
        mobileNumber: formData.mobile.replace(/\D/g, "").trim(),
        dob: formData.dob,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        preferredLanguage: Array.isArray(formData.preferredLanguages)
          ? formData.preferredLanguages.join(",")
          : formData.preferredLanguage || "English",
        organization: formData.organization?.trim() || "cyberlearnix",
        skills: Array.isArray(formData.skills)
          ? formData.skills.join(",")
          : formData.skills || "",
        fieldOfStudy: formData.fieldOfStudy?.trim() || "",
        highestQualification: formData.highestQualification?.trim() || "",
      };

      const multipart = new FormData();
      multipart.append("data", JSON.stringify(payloadData));

      const activePhoto =
        photoUrl ||
        (photoPreview && photoPreview.startsWith("http") ? photoPreview : "") ||
        "https://drive.google.com/uc?export=view&id=1LJJ8UqxURA0Y-XUbAihlXRo14t1J4UvF";

      if (activePhoto) {
        multipart.append("profilePhotoUrl", activePhoto);
      }
      if (photoFile) {
        multipart.append("profilePhoto", photoFile);
      }

      const res = await fetch(`${API_BASE_URL.replace(/\/+$/, "")}/api/v1/auth/register`, {
        method: "POST",
        body: multipart,
        credentials: "include",
        headers: {
          "ngrok-skip-browser-warning": "true",
          Accept: "application/json",
        },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || (data && data.success === false)) {
        throw new Error(data?.message || data?.error || "Registration failed. Please check your details.");
      }

      const otpSessionId =
        data?.data?.otpSessionId || data?.otpSessionId || data?.sessionId || "";
      const cooldownSeconds = data?.data?.cooldownSeconds || 25;
      const expiresInSeconds = data?.data?.expiresInSeconds || 295;

      setRegistrationSuccess(true);
      toast.success(data?.message || "User registered successfully. OTP has been sent to email.");

      setTimeout(() => {
        navigate("/otp-verify", {
          state: {
            email: payloadData.email,
            flow: "register",
            otpSessionId,
            cooldownSeconds,
            expiresInSeconds,
          },
        });
      }, 900);
    } catch (err) {
      console.error("[Register Error]:", err);
      const msg = err.message || "Registration encountered an unexpected issue.";
      setGlobalError(msg);
      toast.error(msg);

      if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: msg }));
        setCurrentStep(1);
      } else if (msg.toLowerCase().includes("mobile") || msg.toLowerCase().includes("phone")) {
        setErrors((prev) => ({ ...prev, mobile: msg }));
        setCurrentStep(2);
      }
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 16 : -16,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? -16 : 16,
      opacity: 0,
      transition: { duration: 0.15, ease: "easeIn" },
    }),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-x-hidden font-sans">
      <Toaster position="top-right" />

      {/* Subtle Engineered Background Grids */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-orange-100/25 to-transparent blur-2xl" />

      {/* Top Header Navbar */}
      <header className="relative z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 py-3 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight group-hover:bg-orange-600 transition-colors">
              LM
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900">
              LearnMaster <span className="text-xs font-mono font-normal text-slate-400">/ Identity</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition flex items-center gap-1 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
            >
              Sign In <ChevronLeft size={13} className="rotate-180" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container - Space-Efficient Split Layout */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-7 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT COLUMN: Academic Credential Pass & Stepper Timeline (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-orange-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Card Meta Header */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-[11px] font-mono font-bold text-orange-300 border border-white/10">
                  <CreditCard size={12} className="text-orange-400" />
                  STUDENT CREDENTIAL PASS
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  STEP {currentStep} OF 4
                </span>
              </div>

              {/* Digital Academic ID Credential Card */}
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 shadow-lg relative overflow-hidden space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                      LM
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                      LEARNMASTER INSTITUTE
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full font-mono">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                    </span>
                    {currentStep === 4 ? "READY FOR OTP" : "VERIFIED SCHOLAR"}
                  </span>
                </div>

                {/* Avatar & Main Info */}
                <div className="flex items-center gap-3">
                  <div className="relative h-13 w-13 shrink-0 rounded-2xl border-2 border-orange-400/30 overflow-hidden bg-slate-800 shadow-md">
                    <img
                      src={
                        photoPreview ||
                        photoUrl ||
                        "https://drive.google.com/uc?export=view&id=1LJJ8UqxURA0Y-XUbAihlXRo14t1J4UvF"
                      }
                      alt="Student Avatar"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-extrabold text-white truncate">
                      {formData.firstName || formData.lastName
                        ? `${formData.firstName} ${formData.lastName}`.trim()
                        : "Prospective Learner"}
                    </h3>
                    <p className="text-xs text-slate-300 truncate mt-0.5">
                      {formData.email || "learner@learnmaster.edu"}
                    </p>
                    <p className="text-[11px] font-mono text-orange-300 mt-0.5 font-medium">
                      {formData.countryCode} {formData.mobile || "••••••••••"}
                    </p>
                  </div>
                </div>

                {/* Card Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/10 pt-2.5 text-slate-300">
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">
                      Program & Degree
                    </span>
                    <span className="truncate block font-bold text-white text-[11px]">
                      {formData.highestQualification || "Higher Ed"} {formData.fieldOfStudy ? `/ ${formData.fieldOfStudy}` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 block font-mono">
                      Institution / Org
                    </span>
                    <span className="truncate block font-bold text-white text-[11px]">
                      {formData.organization || "LearnMaster"}
                    </span>
                  </div>
                </div>

                {/* Skills Chips on ID */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(formData.skills || []).slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="rounded-md bg-white/10 border border-white/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-200 font-mono"
                      >
                        {s}
                      </span>
                    ))}
                    {(formData.skills || []).length > 4 && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        +{(formData.skills || []).length - 4}
                      </span>
                    )}
                    {(!formData.skills || formData.skills.length === 0) && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Skills to be selected in Step 3
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 shrink-0">
                    <span className="text-[9px] font-mono">2026</span>
                    <QrCode size={16} className="text-slate-300 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Progress Checklist Timeline */}
              <div className="mt-4 space-y-2">
                <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                  ENROLLMENT PROGRESS
                </p>
                <div className="space-y-1.5">
                  {steps.map((st) => {
                    const isDone = st.id < currentStep;
                    const isCur = st.id === currentStep;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => jumpToStep(st.id)}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-all text-left ${
                          isCur
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-md shadow-orange-500/20 scale-[1.01]"
                            : isDone
                            ? "bg-white/10 text-slate-200 hover:bg-white/15"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                              isDone
                                ? "bg-emerald-500 text-white"
                                : isCur
                                ? "bg-white text-orange-600"
                                : "bg-white/10 text-slate-400"
                            }`}
                          >
                            {isDone ? <Check size={11} strokeWidth={2.5} /> : st.id}
                          </span>
                          <span className="text-xs">{st.title}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono ${
                            isCur
                              ? "text-orange-100 font-semibold"
                              : isDone
                              ? "text-emerald-400 font-medium"
                              : "text-slate-500"
                          }`}
                        >
                          {isDone ? "Completed" : isCur ? "Active" : "Pending"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Security / Trust Footer */}
            <div className="relative z-10 mt-6 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>SOC 2 Type II Audited</span>
              </div>
              <span className="text-slate-400">256-Bit SSL</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Ultra-Clean Step Form (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              {/* Form Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {steps[currentStep - 1].subtitle}
                  </p>
                </div>

                {/* Technical Progress Bars */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                        i <= currentStep ? "bg-slate-900" : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Error Callout */}
              {globalError && (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-500 shrink-0" />
                    <span>{globalError}</span>
                  </div>
                  <button onClick={() => setGlobalError("")} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* Form Steps */}
              <form onSubmit={handleRegister}>
                <AnimatePresence mode="wait" custom={direction}>
                  
                  {/* STEP 1: IDENTITY */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step-1"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-3"
                    >
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="e.g. Shiva"
                              value={formData.firstName}
                              onChange={(e) => updateField("firstName", e.target.value)}
                              className={`w-full rounded-xl border bg-white px-3 py-2 pl-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                                errors.firstName ? "border-red-400 ring-1 ring-red-100" : "border-slate-200"
                              }`}
                            />
                            {formData.firstName.trim().length >= 2 && (
                              <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                            )}
                          </div>
                          {errors.firstName && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.firstName}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="e.g. Kumar"
                              value={formData.lastName}
                              onChange={(e) => updateField("lastName", e.target.value)}
                              className={`w-full rounded-xl border bg-white px-3 py-2 pl-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                                errors.lastName ? "border-red-400 ring-1 ring-red-100" : "border-slate-200"
                              }`}
                            />
                            {formData.lastName.trim().length >= 1 && (
                              <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                            )}
                          </div>
                          {errors.lastName && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.lastName}</p>}
                        </div>
                      </div>

                      {/* Email Field */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="email"
                            placeholder="student@example.com"
                            value={formData.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className={`w-full rounded-xl border bg-white px-3 py-2 pl-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                              errors.email ? "border-red-400 ring-1 ring-red-100" : "border-slate-200"
                            }`}
                          />
                          {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                            <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                          )}
                        </div>
                        {errors.email ? (
                          <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.email}</p>
                        ) : (
                          !formData.email.includes("@") &&
                          formData.email.length > 2 && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                              <span className="text-slate-400">Quick fill:</span>
                              {["@gmail.com", "@outlook.com", "@yahoo.com"].map((dom) => (
                                <button
                                  key={dom}
                                  type="button"
                                  onClick={() => updateField("email", `${formData.email}${dom}`)}
                                  className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-600 hover:text-slate-900 hover:border-slate-300 font-mono text-[10px]"
                                >
                                  {dom}
                                </button>
                              ))}
                            </div>
                          )
                        )}
                      </div>

                      {/* Password Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type={showPassword ? "text" : "password"}
                              placeholder="e.g. @Pass_1234"
                              value={formData.password}
                              onChange={(e) => updateField("password", e.target.value)}
                              className={`w-full rounded-xl border bg-white px-3 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                                errors.password ? "border-red-400 ring-1 ring-red-100" : "border-slate-200"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          {errors.password && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.password}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Confirm Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Repeat password"
                              value={formData.confirmPassword}
                              onChange={(e) => updateField("confirmPassword", e.target.value)}
                              className={`w-full rounded-xl border bg-white px-3 py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                                errors.confirmPassword
                                  ? "border-red-400 ring-1 ring-red-100"
                                  : formData.confirmPassword && formData.confirmPassword === formData.password
                                  ? "border-emerald-500 ring-1 ring-emerald-100"
                                  : "border-slate-200"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                            >
                              {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.confirmPassword}</p>
                          )}
                        </div>
                      </div>

                      {/* Clean Technical Password Analysis Panel */}
                      {formData.password && (
                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Strength:</span>
                            <span className={`font-semibold font-mono text-[11px] ${passwordAnalysis.colorClass}`}>
                              {passwordAnalysis.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 h-1 w-full">
                            {[1, 2, 3, 4, 5].map((idx) => (
                              <div
                                key={idx}
                                className={`rounded-full transition-all duration-300 ${
                                  idx <= passwordAnalysis.passed ? passwordAnalysis.barColorClass : "bg-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-500">
                            <span
                              className={`inline-flex items-center gap-1 ${
                                passwordAnalysis.rules.length ? "text-emerald-700 font-medium" : "text-slate-400"
                              }`}
                            >
                              {passwordAnalysis.rules.length ? (
                                <Check size={11} strokeWidth={2.5} />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              )}
                              8+ characters
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 ${
                                passwordAnalysis.rules.upper && passwordAnalysis.rules.lower
                                  ? "text-emerald-700 font-medium"
                                  : "text-slate-400"
                              }`}
                            >
                              {passwordAnalysis.rules.upper && passwordAnalysis.rules.lower ? (
                                <Check size={11} strokeWidth={2.5} />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              )}
                              Upper & lowercase
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 ${
                                passwordAnalysis.rules.num ? "text-emerald-700 font-medium" : "text-slate-400"
                              }`}
                            >
                              {passwordAnalysis.rules.num ? (
                                <Check size={11} strokeWidth={2.5} />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              )}
                              Number (0-9)
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 ${
                                passwordAnalysis.rules.sym ? "text-emerald-700 font-medium" : "text-slate-400"
                              }`}
                            >
                              {passwordAnalysis.rules.sym ? (
                                <Check size={11} strokeWidth={2.5} />
                              ) : (
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                              )}
                              Special symbol
                            </span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* STEP 2: CONTACT & LOCATION */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-2"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-3"
                    >
                      {/* Phone & Country Code */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-[115px_1fr] gap-2">
                          <div className="relative" ref={countryDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setShowCountryCodeMenu(!showCountryCodeMenu)}
                              className="w-full flex h-[38px] items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 hover:border-slate-400 transition"
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <span className="rounded bg-slate-100 px-1 py-0.5 text-[10px] font-mono font-bold text-slate-700 border border-slate-200">
                                  {selectedCountry.iso}
                                </span>
                                <span className="font-mono text-xs">{formData.countryCode}</span>
                              </span>
                              <ChevronDown size={12} className="text-slate-400" />
                            </button>

                            {showCountryCodeMenu && (
                              <div className="absolute left-0 top-full z-40 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                                <div className="relative mb-1.5">
                                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="Search country or code..."
                                    value={countryCodeSearch}
                                    onChange={(e) => setCountryCodeSearch(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1 pl-7 pr-2 text-xs text-slate-800 outline-none focus:border-slate-900"
                                  />
                                </div>
                                <div className="max-h-44 overflow-y-auto space-y-0.5">
                                  {filteredCountryCodes.map((item) => (
                                    <button
                                      key={`${item.code}-${item.name}`}
                                      type="button"
                                      onClick={() => {
                                        updateField("countryCode", item.code);
                                        setShowCountryCodeMenu(false);
                                        setCountryCodeSearch("");
                                      }}
                                      className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs text-left transition ${
                                        formData.countryCode === item.code
                                          ? "bg-slate-900 text-white font-medium"
                                          : "text-slate-700 hover:bg-slate-50"
                                      }`}
                                    >
                                      <span className="flex items-center gap-2 truncate">
                                        <span
                                          className={`rounded px-1 py-0.5 text-[9px] font-mono font-bold ${
                                            formData.countryCode === item.code
                                              ? "bg-slate-800 text-slate-200"
                                              : "bg-slate-100 text-slate-600"
                                          }`}
                                        >
                                          {item.iso}
                                        </span>
                                        <span className="truncate">{item.name}</span>
                                      </span>
                                      <span className="text-[11px] font-mono ml-2 opacity-80">{item.code}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="tel"
                              inputMode="numeric"
                              maxLength={12}
                              placeholder={formData.countryCode === "+91" ? "9876543210" : "Mobile number"}
                              value={formData.mobile}
                              onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, ""))}
                              className={`w-full rounded-xl border bg-white px-3 py-2 pl-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                                errors.mobile ? "border-red-400 ring-1 ring-red-100" : "border-slate-200"
                              }`}
                            />
                            {formData.mobile.length >= 10 && (
                              <CheckCircle2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                            )}
                          </div>
                        </div>
                        {errors.mobile && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.mobile}</p>}
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">
                            Date of Birth <span className="text-red-500">*</span>
                          </label>
                          {calculatedAge !== null && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              Age: {calculatedAge}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            value={formData.dob}
                            onChange={(e) => updateField("dob", e.target.value)}
                            className={`w-full rounded-xl border bg-white px-3 py-2 pl-9 text-xs sm:text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900 ${
                              errors.dob ? "border-red-400 ring-1 ring-red-100" : "border-slate-200"
                            }`}
                          />
                        </div>
                        {errors.dob && <p className="mt-1 text-[11px] text-red-600 font-medium">{errors.dob}</p>}
                      </div>

                      {/* Location: City, State, Country */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Hyderabad"
                              value={formData.city}
                              onChange={(e) => updateField("city", e.target.value)}
                              className={`w-full rounded-xl border bg-white px-3 py-2 pl-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-900 ${
                                errors.city ? "border-red-400" : "border-slate-200"
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            State <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Telangana"
                              value={formData.state}
                              onChange={(e) => updateField("state", e.target.value)}
                              className={`w-full rounded-xl border bg-white px-3 py-2 pl-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-900 ${
                                errors.state ? "border-red-400" : "border-slate-200"
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              placeholder="India"
                              value={formData.country}
                              onChange={(e) => updateField("country", e.target.value)}
                              className={`w-full rounded-xl border bg-white px-3 py-2 pl-8 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-slate-900 ${
                                errors.country ? "border-red-400" : "border-slate-200"
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: ACADEMIC & SKILLS */}
                  {currentStep === 3 && (
                    <motion.div
                      key="step-3"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-3"
                    >
                      {/* Compact Avatar Studio */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              photoPreview ||
                              photoUrl ||
                              "https://drive.google.com/uc?export=view&id=1LJJ8UqxURA0Y-XUbAihlXRo14t1J4UvF"
                            }
                            alt="Avatar"
                            className="h-9 w-9 rounded-lg object-cover border border-slate-300 shrink-0"
                          />
                          <div>
                            <span className="text-xs font-semibold text-slate-800 block">Learner Portrait</span>
                            <span className="text-[10px] text-slate-500">Select preset or upload</span>
                          </div>
                        </div>

                        {/* Presets & Actions */}
                        <div className="flex items-center gap-1.5">
                          {presetAvatars.slice(0, 4).map((url, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => selectPresetAvatar(url)}
                              className="h-7 w-7 rounded-lg overflow-hidden border border-slate-200 hover:border-slate-900 transition"
                            >
                              <img src={url} alt="preset" className="h-full w-full object-cover" />
                            </button>
                          ))}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-7 px-2 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 flex items-center gap-1 shadow-2xs"
                          >
                            <Upload size={11} /> Upload
                          </button>
                        </div>
                      </div>

                      {/* Qualification & Field of Study */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Qualification <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Award size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                              value={formData.highestQualification}
                              onChange={(e) => updateField("highestQualification", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pl-9 text-xs sm:text-sm text-slate-800 outline-none focus:border-slate-900 font-medium"
                            >
                              {qualificationPresets.map((q) => (
                                <option key={q} value={q}>
                                  {q}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Field of Study <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <BookOpen size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="text"
                              list="studyList"
                              placeholder="e.g. Computer Science"
                              value={formData.fieldOfStudy}
                              onChange={(e) => updateField("fieldOfStudy", e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pl-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-900"
                            />
                            <datalist id="studyList">
                              {fieldOfStudyPresets.map((f) => (
                                <option key={f} value={f} />
                              ))}
                            </datalist>
                          </div>
                        </div>
                      </div>

                      {/* College / Organization */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          College or Organization
                        </label>
                        <div className="relative">
                          <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            placeholder="e.g. cyberlearnix or University Name"
                            value={formData.organization}
                            onChange={(e) => updateField("organization", e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pl-9 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>

                      {/* Preferred Languages (Multi-select) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Preferred Languages <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {popularLanguages.map((lang) => {
                            const isSel = (formData.preferredLanguages || []).includes(lang);
                            return (
                              <button
                                key={lang}
                                type="button"
                                onClick={() => toggleLanguage(lang)}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                                  isSel
                                    ? "bg-slate-900 text-white shadow-2xs"
                                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400"
                                }`}
                              >
                                {isSel && <Check size={11} strokeWidth={2.5} />}
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Skills Tag Cloud */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Skills & Competencies <span className="text-red-500">*</span>
                        </label>
                        <div className="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
                          {(formData.skills || []).map((sk) => (
                            <span
                              key={sk}
                              className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-800"
                            >
                              {sk}
                              <button
                                type="button"
                                onClick={() => removeSkill(sk)}
                                className="rounded hover:bg-slate-200 p-0.5 text-slate-500 hover:text-slate-800"
                              >
                                <X size={11} />
                              </button>
                            </span>
                          ))}
                          <div className="flex-1 min-w-[120px] flex items-center">
                            <input
                              type="text"
                              placeholder="Add custom skill..."
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  addSkill();
                                }
                              }}
                              className="w-full bg-transparent px-1.5 text-xs text-slate-800 outline-none placeholder:text-slate-400"
                            />
                            {skillInput.trim() && (
                              <button
                                type="button"
                                onClick={() => addSkill()}
                                className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shrink-0"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Suggestions */}
                        <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-slate-400 font-medium">Suggestions:</span>
                          {popularSkills.slice(0, 6).map((ps) => {
                            const isAdded = (formData.skills || []).some(
                              (s) => s.toLowerCase() === ps.toLowerCase()
                            );
                            if (isAdded) return null;
                            return (
                              <button
                                key={ps}
                                type="button"
                                onClick={() => addSkill(ps)}
                                className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600 hover:text-slate-900 hover:border-slate-300 font-medium"
                              >
                                + {ps}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: REVIEW & CONFIRM */}
                  {currentStep === 4 && (
                    <motion.div
                      key="step-4"
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="space-y-3.5"
                    >
                      {/* Summary Review Panel */}
                      <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/60 via-white to-amber-50/30 p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between pb-2.5 border-b border-orange-100">
                          <span className="text-[11px] font-extrabold text-orange-950 uppercase tracking-wider font-mono flex items-center gap-1.5">
                            <Sparkles size={13} className="text-orange-500" /> Account Verification Summary
                          </span>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={12} /> Ready for OTP
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block font-mono font-semibold">
                              Full Name
                            </span>
                            <span className="font-bold text-slate-900 truncate block mt-0.5">
                              {formData.firstName} {formData.lastName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block font-mono font-semibold">
                              Email Address
                            </span>
                            <span className="font-bold text-slate-900 truncate block mt-0.5">
                              {formData.email}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block font-mono font-semibold">
                              Contact Number
                            </span>
                            <span className="font-bold text-slate-900 truncate block font-mono mt-0.5">
                              {formData.countryCode} {formData.mobile}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase block font-mono font-semibold">
                              Location
                            </span>
                            <span className="font-bold text-slate-900 truncate block mt-0.5">
                              {formData.city}, {formData.country}
                            </span>
                          </div>
                          {formData.highestQualification && (
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase block font-mono font-semibold">
                                Qualification
                              </span>
                              <span className="font-bold text-slate-900 truncate block mt-0.5">
                                {formData.highestQualification} {formData.fieldOfStudy ? `(${formData.fieldOfStudy})` : ""}
                              </span>
                            </div>
                          )}
                          {formData.skills && (
                            <div className="col-span-2">
                              <span className="text-[10px] text-slate-400 uppercase block font-mono font-semibold mb-1">
                                Technical Skills
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {formData.skills.split(",").map((s, idx) => {
                                  const trimmed = s.trim();
                                  if (!trimmed) return null;
                                  return (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-md bg-white border border-orange-200 text-orange-700 text-[10px] font-bold shadow-2xs font-mono"
                                    >
                                      {trimmed}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Trust & Terms Box */}
                      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <ShieldCheck size={15} className="text-emerald-600" />
                          <span>Identity Verification Notice</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          A 6-digit confirmation code will be dispatched to{" "}
                          <strong className="text-slate-900 font-bold">{formData.email}</strong>.
                          Your learner access credentials will be activated immediately upon OTP verification.
                        </p>

                        <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={formData.agreeToTerms}
                            onChange={(e) => updateField("agreeToTerms", e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                          />
                          <span className="text-xs text-slate-700 leading-snug">
                            I agree to the{" "}
                            <span className="font-bold text-slate-900 hover:text-orange-600 hover:underline">Terms of Service</span>{" "}
                            and{" "}
                            <span className="font-bold text-slate-900 hover:text-orange-600 hover:underline">Privacy Policy</span>.
                            <span className="text-red-500"> *</span>
                          </span>
                        </label>
                        {errors.agreeToTerms && (
                          <p className="mt-1 text-[11px] text-red-600 font-semibold">{errors.agreeToTerms}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Controls */}
                <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50 shadow-2xs"
                    >
                      <ArrowLeft size={13} /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 active:scale-95 transition shadow-xs"
                    >
                      Continue <ArrowRight size={13} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading || registrationSuccess}
                      className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold tracking-tight text-white hover:bg-orange-500 active:scale-95 transition disabled:opacity-60 shadow-xs"
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" /> Submitting & Sending OTP...
                        </>
                      ) : registrationSuccess ? (
                        <>
                          <CheckCircle2 size={13} /> Registration Complete!
                        </>
                      ) : (
                        <>
                          Create Account & Request OTP <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Sub-footer inside right card */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already registered?{" "}
                <Link to="/login" className="font-semibold text-slate-900 hover:underline">
                  Sign In to LearnMaster
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        © 2026 LearnMaster Education Platform. All rights reserved. • Protected by 256-bit SSL Security.
      </footer>
    </div>
  );
};

export default Register;