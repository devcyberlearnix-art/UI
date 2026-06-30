import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Lock, Phone, Calendar, MapPin,
  Languages, Building, Code, GraduationCap, Award,
  Eye, EyeOff, Upload, CheckCircle, AlertCircle,
  ArrowRight, BookOpen, Users, Shield, Loader2,
  Sparkles, Trophy, Briefcase, GraduationCap as GradCap
} from "lucide-react";

// ========== CONFIGURATION ==========
const API_BASE_URL = "https://iodine-pesticide-bulge.ngrok-free.dev";
// ===================================

// ========== VALIDATION UTILITIES ==========
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateMobile = (mobile) => {
  const cleaned = mobile.replace(/\s/g, '');
  if (!/^[0-9]+$/.test(cleaned)) {
    return { isValid: false, error: 'Mobile number must contain only digits' };
  }
  if (cleaned.length !== 10) {
    return { isValid: false, error: 'Mobile number must be exactly 10 digits' };
  }
  return { isValid: true, error: '' };
};

const validatePassword = (password) => {
  return {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&#]/.test(password)
  };
};

const getPasswordStrength = (password) => {
  const checks = validatePassword(password);
  const score = Object.values(checks).filter(Boolean).length;
  const texts = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
  return { score, text: texts[score] || 'Weak' };
};

const sanitizeFormData = (data) => {
  const sanitized = {};
  for (const key in data) {
    if (data[key] === null || data[key] === undefined) {
      sanitized[key] = '';
    } else if (typeof data[key] === 'string') {
      sanitized[key] = data[key].trim();
    } else {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
};

const validateFieldLength = (field, value) => {
  if (typeof value === 'string' && value.length > 100) {
    return { isValid: false, error: `${field} cannot exceed 100 characters` };
  }
  return { isValid: true, error: '' };
};
// ===========================================

const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '' });
  const [showRequirements, setShowRequirements] = useState(false);

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
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});

  const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali"];

  const countryCodeOptions = [
    { code: "+91", name: "India" },
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+61", name: "Australia" },
    { code: "+86", name: "China" },
  ];

  // Get initials for avatar
  const getInitials = () => {
    if (formData.firstName && formData.lastName) {
      return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
    }
    if (formData.firstName) {
      return formData.firstName.charAt(0).toUpperCase();
    }
    return "";
  };

  // Password strength functions
  const checkPasswordStrength = (password) => {
    const strength = getPasswordStrength(password);
    setPasswordStrength(strength);
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    checkPasswordStrength(newPassword);
    setShowRequirements(true);
    if (errors.password) setErrors({ ...errors, password: "" });
  };

  const getStrengthColor = () => {
    const score = passwordStrength.score;
    if (score <= 2) return "#ef4444";
    if (score <= 3) return "#f59e0b";
    if (score <= 4) return "#22c55e";
    return "#16a34a";
  };

  // Photo upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setMessage("Please upload a valid image (JPEG, PNG, WEBP)");
      setMessageType("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Photo size should be less than 5MB");
      setMessageType("error");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    setMessage("");

    const formDataPhoto = new FormData();
    formDataPhoto.append("profilePhoto", file);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/upload/profile-photo`, {
        method: "POST",
        body: formDataPhoto,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const uploadedUrl = data.photoUrl || data.url || data.filePath;
      setPhotoUrl(uploadedUrl);
      setMessage("Photo uploaded successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Failed to upload photo. " + error.message);
      setMessageType("error");
      setPhotoPreview(null);
      setPhoto(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  // Remove photo
  const removePhoto = () => {
    setPhotoPreview(null);
    setPhoto(null);
    setPhotoUrl("");
    setMessage("Photo removed");
    setMessageType("success");
    setTimeout(() => setMessage(""), 2000);
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName?.trim()) newErrors.firstName = "First name is required";
    else if (formData.firstName.length < 2) newErrors.firstName = "First name must be at least 2 characters";
    
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name is required";
    
    if (!formData.email) newErrors.email = "Email is required";
    else if (!validateEmail(formData.email)) newErrors.email = "Please enter a valid email";
    
    if (!formData.password) newErrors.password = "Password is required";
    else {
      const passwordChecks = validatePassword(formData.password);
      if (!Object.values(passwordChecks).every(Boolean)) {
        newErrors.password = "Password does not meet all requirements";
      }
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else {
      const mobileValidation = validateMobile(formData.mobile);
      if (!mobileValidation.isValid) newErrors.mobile = mobileValidation.error;
    }
    
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.preferredLanguage) newErrors.preferredLanguage = "Preferred language is required";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions";
    
    return newErrors;
  };

  // Submit - Redirect to OTP Verify
  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("Please fix the errors above");
      setMessageType("error");
      
      // Scroll to first error
      const firstError = document.querySelector('[class*="border-red-400"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    // Format date to YYYY-MM-DD
    let formattedDob = formData.dob;
    if (formData.dob) {
      const dateParts = formData.dob.split('-');
      if (dateParts.length === 3) {
        if (dateParts[0].length === 4) {
          formattedDob = formData.dob;
        } else {
          formattedDob = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }
    }

    // Build payload - profilePhoto only if uploaded
    const payload = {
      firstName: (formData.firstName || "").trim(),
      lastName: (formData.lastName || "").trim(),
      email: (formData.email || "").trim().toLowerCase(),
      password: formData.password || "",
      confirmPassword: formData.confirmPassword || "",
      countryCode: formData.countryCode || "+91",
      mobile: (formData.mobile || "").trim(),
      dob: formattedDob || "",
      city: (formData.city || "").trim(),
      state: (formData.state || "").trim(),
      country: (formData.country || "").trim(),
      preferredLanguage: formData.preferredLanguage || "",
      organization: (formData.organization || "").trim(),
      skills: (formData.skills || "").trim(),
      fieldOfStudy: (formData.fieldOfStudy || "").trim(),
      highestQualification: (formData.highestQualification || "").trim(),
    };

    // Only add profilePhoto if uploaded
    if (photoUrl) {
      payload.profilePhoto = photoUrl;
    }

    console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log("📥 Response status:", response.status);
      console.log("📥 Response body:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON:", responseText);
        throw new Error("Server returned an invalid response");
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Registration failed (${response.status})`);
      }

      // ✅ STORE EMAIL FOR OTP VERIFICATION
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("tempUserData", JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobile: formData.mobile,
      }));

      console.log("✅ Registration successful! Email saved:", formData.email);

      setMessage("✅ Registration Successful! Redirecting to OTP verification...");
      setMessageType("success");
      
      // 🚀 REDIRECT TO OTP VERIFICATION PAGE (/otp-verify)
      setTimeout(() => {
        navigate("/otp-verify", {
          state: { 
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName
          }
        });
      }, 1500);
      
    } catch (error) {
      console.error("❌ Registration error:", error);
      let errorMsg = error.message;
      if (error.message.includes("Failed to fetch")) {
        errorMsg = "Cannot connect to the server. Please check your internet connection or the API URL.";
      }
      setMessage(errorMsg);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    const validation = validateFieldLength(field, value);
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, [field]: validation.error }));
    } else {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const passwordChecks = validatePassword(formData.password);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* LEFT PANEL - Branding */}
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

      {/* RIGHT PANEL - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Create Account</h2>
          
          <div className="bg-white rounded-2xl p-6 md:p-8">
            {message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-3 ${messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                {messageType === 'success' ? <CheckCircle className="text-green-600" size={18} /> : <AlertCircle className="text-red-600" size={18} />}
                <p className={`text-sm ${messageType === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message}</p>
              </div>
            )}

            <form onSubmit={handleRegister}>
              {/* Profile Photo Upload */}
              <div className="flex flex-col items-center mb-5">
                <div className="relative group">
                  <label htmlFor="photoInput" className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 p-1 shadow-md group-hover:scale-105 transition-transform duration-300">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover bg-white"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                          {getInitials() ? (
                            <span className="text-2xl font-bold text-violet-600">{getInitials()}</span>
                          ) : (
                            <User className="w-10 h-10 text-violet-400" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 bg-violet-600 rounded-full p-1.5 border-2 border-white group-hover:scale-110 transition-transform">
                      {photoUploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Upload size={12} className="text-white" />}
                    </div>
                  </label>
                </div>
                <input 
                  type="file" 
                  id="photoInput" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handlePhotoChange} 
                  accept="image/jpeg,image/png,image/jpg,image/webp" 
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                  >
                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {photoPreview && (
                    <>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (max 5MB)</p>
                {photoUrl && <p className="text-xs text-green-600 mt-1">✓ Uploaded</p>}
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm ${errors.firstName ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm ${errors.lastName ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-1.5">
                      <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-300" style={{ width: `${(passwordStrength.score / 5) * 100}%`, backgroundColor: getStrengthColor() }}></div>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: getStrengthColor() }}>{passwordStrength.text}</p>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm ${errors.confirmPassword ? 'border-red-400' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">Passwords do not match!</p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                    <p className="mt-1 text-xs text-green-600">✓ Passwords match!</p>
                  )}
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Password Requirements */}
              {showRequirements && formData.password && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-1">Password must contain:</p>
                  <ul className="grid grid-cols-2 gap-1">
                    <li className={`text-xs ${passwordChecks.length ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordChecks.length ? '✓' : '○'} At least 8 characters
                    </li>
                    <li className={`text-xs ${passwordChecks.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordChecks.lowercase ? '✓' : '○'} One lowercase letter
                    </li>
                    <li className={`text-xs ${passwordChecks.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordChecks.uppercase ? '✓' : '○'} One uppercase letter
                    </li>
                    <li className={`text-xs ${passwordChecks.number ? 'text-green-600' : 'text-gray-400'}`}>
                      {passwordChecks.number ? '✓' : '○'} One number
                    </li>
                    <li className={`text-xs ${passwordChecks.special ? 'text-green-600' : 'text-gray-400'} col-span-2`}>
                      {passwordChecks.special ? '✓' : '○'} One special character (@$!%*?&#)
                    </li>
                  </ul>
                </div>
              )}

              {/* Mobile with country code */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => updateField("countryCode", e.target.value)}
                    className="w-36 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 text-sm"
                  >
                    {countryCodeOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name} ({option.code})
                      </option>
                    ))}
                  </select>
                  <div className="flex-1 relative">
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={formData.mobile}
                      onChange={(e) => updateField("mobile", e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm ${errors.mobile ? 'border-red-400' : 'border-gray-300'}`}
                      maxLength="10"
                    />
                  </div>
                </div>
                {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
                {formData.mobile && !errors.mobile && formData.mobile.length === 10 && (
                  <p className="mt-1 text-xs text-green-600">✓ Valid mobile number</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 text-sm ${errors.dob ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.dob && <p className="mt-1 text-xs text-red-500">{errors.dob}</p>}
              </div>

              {/* City, State & Country */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language <span className="text-red-500">*</span></label>
                <select
                  value={formData.preferredLanguage}
                  onChange={(e) => updateField("preferredLanguage", e.target.value)}
                  className={`w-full px-3 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-violet-500 outline-none appearance-none text-gray-800 text-sm ${errors.preferredLanguage ? 'border-red-400' : 'border-gray-300'}`}
                >
                  <option value="">Select Language</option>
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {errors.preferredLanguage && <p className="mt-1 text-xs text-red-500">{errors.preferredLanguage}</p>}
              </div>

              {/* Organization, Skills */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                  <input
                    type="text"
                    placeholder="Organization"
                    value={formData.organization}
                    onChange={(e) => updateField("organization", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <input
                    type="text"
                    placeholder="React, Python, ..."
                    value={formData.skills}
                    onChange={(e) => updateField("skills", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              {/* Field of Study & Highest Qualification */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    placeholder="Computer Science"
                    value={formData.fieldOfStudy}
                    onChange={(e) => updateField("fieldOfStudy", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                  <input
                    type="text"
                    placeholder="Bachelor's Degree"
                    value={formData.highestQualification}
                    onChange={(e) => updateField("highestQualification", e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>

              {/* Terms */}
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => updateField("agreeToTerms", e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the <a href="#" className="text-violet-600 hover:text-violet-800">Terms</a> & <a href="#" className="text-violet-600 hover:text-violet-800">Privacy Policy</a>
                  </span>
                </label>
                {errors.agreeToTerms && <p className="mt-1 text-xs text-red-500">{errors.agreeToTerms}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || photoUploading}
                className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  loading || photoUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg hover:shadow-violet-500/30 text-white'
                }`}
              >
                {loading ? (
                  <><Loader2 className="animate-spin h-5 w-5" /> Creating...</>
                ) : (
                  <>Sign Up</>
                )}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate("/login")} className="text-violet-600 hover:text-violet-800 font-semibold">
                  Sign In
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;