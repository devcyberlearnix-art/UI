import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Lock, Phone, Calendar, MapPin, Globe, 
  Languages, Building, Code, GraduationCap, Award, 
  Eye, EyeOff, Upload, CheckCircle, AlertCircle,
  ArrowRight, BookOpen, Users, Shield, Loader2
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
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

  // City, state, country, language options (same as before)
  const cities = ["Hyderabad", "Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore", "Kurnool", "Rajahmundry", "Kadapa", "Anantapur"];
  const states = ["Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Maharashtra", "Delhi", "Kerala", "West Bengal"];
  const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "Singapore", "UAE"];
  const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali"];

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    setPasswordStrength(strength);
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    checkPasswordStrength(newPassword);
    if (errors.password) setErrors({ ...errors, password: "" });
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "#f87171";
    if (passwordStrength <= 3) return "#fbbf24";
    if (passwordStrength <= 4) return "#4ade80";
    return "#22c55e";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    if (passwordStrength <= 4) return "Strong";
    return "Very Strong";
  };

  // Profile photo upload (same as before – adjust URL if needed)
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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
      // Replace with your actual upload API endpoint
      const response = await fetch("https://iodine-pesticide-bulge.ngrok-free.dev/auth/upload/profile-photo", {
        method: "POST",
        body: formDataPhoto,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const uploadedUrl = data.photoUrl || data.url || data.filePath;
      setPhotoUrl(uploadedUrl);
      setMessage("Photo uploaded successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Failed to upload photo. Please try again.");
      setMessageType("error");
      setPhotoPreview(null);
      setPhoto(null);
    } finally {
      setPhotoUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    else if (formData.firstName.length < 2) newErrors.firstName = "First name must be at least 2 characters";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    else if (passwordStrength < 3) newErrors.password = "Password is too weak";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.mobile) newErrors.mobile = "Mobile number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile number";
    if (!formData.dob) newErrors.dob = "Date of birth is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.preferredLanguage) newErrors.preferredLanguage = "Preferred language is required";
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms and conditions";
    return newErrors;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setMessage("Please fix the errors above");
      setMessageType("error");
      return;
    }
    
    setLoading(true);
    setMessage("");

    // Prepare payload to match API expectations
    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      countryCode: formData.countryCode,
      mobile: formData.mobile,
      dob: formData.dob,
      profilePhoto: photoUrl || "", // uploaded photo URL
      city: formData.city,
      state: formData.state,
      country: formData.country,
      preferredLanguage: formData.preferredLanguage,
      organization: formData.organization || "",
      skills: formData.skills || "",
      fieldOfStudy: formData.fieldOfStudy || "",
      highestQualification: formData.highestQualification || "",
    };

    try {
      const response = await fetch("https://iodine-pesticide-bulge.ngrok-free.dev/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      setMessage("Registration Successful! Redirecting to login...");
      setMessageType("success");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setMessage(err.message || "Registration failed. Please check your connection.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0f1c] py-12 px-4">
      {/* Background effects (same as before) */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0f1629] to-[#1a1f35]"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59,130,246,0.15) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 mb-6 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Create Your Account</h1>
          <p className="text-gray-400 mt-2">Join 50,000+ learners and start your journey</p>
        </div>

        <form onSubmit={handleRegister} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl">
          {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${messageType === 'success' ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {messageType === 'success' ? <CheckCircle className="text-green-400" size={20} /> : <AlertCircle className="text-red-400" size={20} />}
              <p className={`text-sm ${messageType === 'success' ? 'text-green-400' : 'text-red-400'}`}>{message}</p>
            </div>
          )}

          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <label htmlFor="photoInput" className="cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 p-1 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={photoPreview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="avatar"
                    className="w-full h-full rounded-full object-cover bg-[#0a0f1c]"
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1.5 border-2 border-[#0a0f1c] group-hover:scale-110 transition-transform">
                  {photoUploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Upload size={12} className="text-white" />}
                </div>
              </label>
            </div>
            <input type="file" id="photoInput" className="hidden" onChange={handlePhotoChange} accept="image/*" />
            <p className="text-xs text-gray-500 mt-2">Click to upload photo (Max 5MB)</p>
            {photoUrl && <p className="text-xs text-green-400 mt-1">✓ Photo uploaded</p>}
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name <span className="text-red-400">*</span></label>
              <div className={`relative transition-all duration-300 ${focusedField === 'firstName' ? 'scale-[1.02]' : ''}`}>
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="John" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField(null)} className={`w-full pl-12 pr-4 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500 ${errors.firstName ? 'border-red-500/50' : 'border-white/20'}`} />
              </div>
              {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name <span className="text-red-400">*</span></label>
              <div className={`relative transition-all duration-300 ${focusedField === 'lastName' ? 'scale-[1.02]' : ''}`}>
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Doe" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField(null)} className={`w-full pl-12 pr-4 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500 ${errors.lastName ? 'border-red-500/50' : 'border-white/20'}`} />
              </div>
              {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address <span className="text-red-400">*</span></label>
            <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input type="email" placeholder="you@example.com" value={formData.email} onChange={(e) => updateField("email", e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} className={`w-full pl-12 pr-4 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500 ${errors.email ? 'border-red-500/50' : 'border-white/20'}`} />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
          </div>

          {/* Password fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password <span className="text-red-400">*</span></label>
              <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input type={showPassword ? "text" : "password"} placeholder="Create password" value={formData.password} onChange={handlePasswordChange} onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)} className={`w-full pl-12 pr-12 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500 ${errors.password ? 'border-red-500/50' : 'border-white/20'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden"><div className="h-full transition-all duration-300" style={{ width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor() }}></div></div>
                  <p className="text-xs mt-1" style={{ color: getStrengthColor() }}>{getStrengthText()}</p>
                </div>
              )}
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password <span className="text-red-400">*</span></label>
              <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-[1.02]' : ''}`}>
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)} className={`w-full pl-12 pr-12 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500 ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/20'}`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Mobile & DOB (with countryCode) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mobile Number <span className="text-red-400">*</span></label>
              <div className="flex gap-2">
                <div className="w-24">
                  <select value={formData.countryCode} onChange={(e) => updateField("countryCode", e.target.value)} className="w-full py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white">
                    <option value="+91">+91 (India)</option>
                    <option value="+1">+1 (USA)</option>
                    <option value="+44">+44 (UK)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <div className={`relative transition-all duration-300 ${focusedField === 'mobile' ? 'scale-[1.02]' : ''}`}>
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <input type="tel" placeholder="9876543210" value={formData.mobile} onChange={(e) => updateField("mobile", e.target.value)} onFocus={() => setFocusedField('mobile')} onBlur={() => setFocusedField(null)} className={`w-full pl-12 pr-4 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500 ${errors.mobile ? 'border-red-500/50' : 'border-white/20'}`} />
                  </div>
                </div>
              </div>
              {errors.mobile && <p className="mt-1 text-xs text-red-400">{errors.mobile}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth <span className="text-red-400">*</span></label>
              <div className={`relative transition-all duration-300 ${focusedField === 'dob' ? 'scale-[1.02]' : ''}`}>
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} onFocus={() => setFocusedField('dob')} onBlur={() => setFocusedField(null)} className={`w-full pl-12 pr-4 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white ${errors.dob ? 'border-red-500/50' : 'border-white/20'}`} />
              </div>
              {errors.dob && <p className="mt-1 text-xs text-red-400">{errors.dob}</p>}
            </div>
          </div>

          {/* Location fields (city, state, country) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">City <span className="text-red-400">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <select value={formData.city} onChange={(e) => updateField("city", e.target.value)} className={`w-full pl-12 pr-4 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-white ${errors.city ? 'border-red-500/50' : 'border-white/20'}`}>
                  <option value="" className="bg-[#0a0f1c]">Select City</option>
                  {cities.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              {errors.city && <p className="mt-1 text-xs text-red-400">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">State <span className="text-red-400">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <select value={formData.state} onChange={(e) => updateField("state", e.target.value)} className={`w-full pl-12 pr-4 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-white ${errors.state ? 'border-red-500/50' : 'border-white/20'}`}>
                  <option value="" className="bg-[#0a0f1c]">Select State</option>
                  {states.map(state => <option key={state} value={state}>{state}</option>)}
                </select>
              </div>
              {errors.state && <p className="mt-1 text-xs text-red-400">{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Country <span className="text-red-400">*</span></label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <select value={formData.country} onChange={(e) => updateField("country", e.target.value)} className={`w-full pl-12 pr-4 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-white ${errors.country ? 'border-red-500/50' : 'border-white/20'}`}>
                  <option value="" className="bg-[#0a0f1c]">Select Country</option>
                  {countries.map(country => <option key={country} value={country}>{country}</option>)}
                </select>
              </div>
              {errors.country && <p className="mt-1 text-xs text-red-400">{errors.country}</p>}
            </div>
          </div>

          {/* Preferred Language */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Language <span className="text-red-400">*</span></label>
            <div className="relative">
              <Languages className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <select value={formData.preferredLanguage} onChange={(e) => updateField("preferredLanguage", e.target.value)} className={`w-full pl-12 pr-4 py-3.5 bg-white/10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none text-white ${errors.preferredLanguage ? 'border-red-500/50' : 'border-white/20'}`}>
                <option value="" className="bg-[#0a0f1c]">Select Language</option>
                {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
              </select>
            </div>
            {errors.preferredLanguage && <p className="mt-1 text-xs text-red-400">{errors.preferredLanguage}</p>}
          </div>

          {/* Optional fields (organization, skills, fieldOfStudy, highestQualification) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Organization</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Company/University" value={formData.organization} onChange={(e) => updateField("organization", e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
              <div className="relative">
                <Code className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="React, Python, etc." value={formData.skills} onChange={(e) => updateField("skills", e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Field of Study</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Computer Science" value={formData.fieldOfStudy} onChange={(e) => updateField("fieldOfStudy", e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Highest Qualification</label>
              <div className="relative">
                <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Bachelor's Degree" value={formData.highestQualification} onChange={(e) => updateField("highestQualification", e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder-gray-500" />
              </div>
            </div>
          </div>

          {/* Terms and conditions */}
          <div className="mb-6">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" checked={formData.agreeToTerms} onChange={(e) => updateField("agreeToTerms", e.target.checked)} className="w-4 h-4 text-blue-600 rounded border-white/20 bg-white/10 focus:ring-blue-500" />
              <span className="ml-2 text-sm text-gray-400">I agree to the <a href="#" className="text-blue-400 hover:text-blue-300">Terms of Service</a> and <a href="#" className="text-blue-400 hover:text-blue-300">Privacy Policy</a></span>
            </label>
            {errors.agreeToTerms && <p className="mt-1 text-xs text-red-400">{errors.agreeToTerms}</p>}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading || photoUploading}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${loading || photoUploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25'}`}
          >
            {!loading && !photoUploading && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>}
            {loading ? <><Loader2 className="animate-spin h-5 w-5" /> Creating Account...</> : <>Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>

          <p className="text-center text-sm text-gray-400 mt-6">Already have an account? <button type="button" onClick={() => navigate("/login")} className="text-blue-400 hover:text-blue-300 font-semibold">Sign in</button></p>
          <div className="mt-6 text-center"><div className="flex items-center justify-center gap-2 text-xs text-gray-500"><Shield size={12} /><span>Your data is secure • 256-bit encryption</span></div></div>
        </form>
      </div>
    </div>
  );
};

export default Register;