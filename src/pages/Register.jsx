/// src/pages/Register.jsx
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Languages,
  BookOpen,
  Award,
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import authApi from '../api/authApi';

const languages = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam"];

const steps = [
  { id: 1, title: "Account", icon: User },
  { id: 2, title: "Security", icon: Shield },
  { id: 3, title: "Profile", icon: User },
  { id: 4, title: "Terms", icon: FileText },
];

const Register = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    countryCode: '+91',
    mobileNumber: '',
    dob: '',
    profilePhoto: '',
    city: '',
    state: '',
    country: 'India',
    preferredLanguage: 'English',
    organization: '',
    skills: '',
    fieldOfStudy: '',
    highestQualification: '',
    agreeToTerms: false
  });

  const [errors, setErrors] = useState({});

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  }, [formData.password]);

  const strengthConfig = {
    0: { text: 'Very Weak', color: '#ef4444', width: '0%' },
    1: { text: 'Weak', color: '#ef4444', width: '20%' },
    2: { text: 'Fair', color: '#f59e0b', width: '40%' },
    3: { text: 'Good', color: '#f59e0b', width: '60%' },
    4: { text: 'Strong', color: '#16a34a', width: '80%' },
    5: { text: 'Very Strong', color: '#16a34a', width: '100%' },
  };

  const strength = strengthConfig[passwordStrength] || strengthConfig[0];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const FieldError = ({ name }) => 
    errors[name] ? (
      <motion.p 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-1 text-xs text-red-500 flex items-center gap-1"
      >
        <AlertCircle size={12} />
        {errors[name]}
      </motion.p>
    ) : null;

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    }

    if (step === 2) {
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (passwordStrength < 3) newErrors.password = 'Password is too weak';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 3) {
      if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile number is required';
      if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
        newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      }
      if (!formData.dob) newErrors.dob = 'Date of birth is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
      if (!formData.preferredLanguage) newErrors.preferredLanguage = 'Preferred language is required';
    }

    if (step === 4) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Please accept the Terms and Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size should be less than 5MB');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    setError('');

    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        // Store in session and local storage for upload after login
        sessionStorage.setItem('pendingProfilePhoto', base64Data);
        localStorage.setItem('pendingProfilePhoto', base64Data);
        setPhotoUploading(false);
        setSuccess('Photo selected successfully');
        setTimeout(() => setSuccess(''), 3000);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process photo');
      setPhotoUploading(false);
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setError('Please fix the highlighted fields before continuing');
      return;
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      setError('Please correct the highlighted fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare payload
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        countryCode: formData.countryCode,
        mobileNumber: formData.mobileNumber,
        dob: formData.dob,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        preferredLanguage: formData.preferredLanguage,
        organization: formData.organization.trim() || '',
        skills: formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
        fieldOfStudy: formData.fieldOfStudy.trim() || '',
        highestQualification: formData.highestQualification.trim() || '',
        profilePhoto: formData.profilePhoto || ''
      };

      console.log('[Register] Submitting:', payload);
      
      const response = await authApi.register(payload);
      console.log('[Register] Response:', response);

      if (response.success) {
        const sessionId = response.data?.otpSessionId || response.otpSessionId;
        
        if (sessionId) {
          sessionStorage.setItem('otpSessionId', sessionId);
          sessionStorage.setItem('userEmail', formData.email);
          localStorage.setItem('registrationEmail', formData.email);
          
          setSuccess('Registration successful! Redirecting to verification...');
          
          setTimeout(() => {
            navigate('/otp-verify', { 
              state: { 
                email: formData.email,
                otpSessionId: sessionId,
                registrationSuccess: true 
              } 
            });
          }, 1000);
        } else {
          setError('No OTP session ID received. Please try again.');
        }
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('[Register] Error:', err);
      
      if (err.response?.status === 409) {
        setError('User with this email already exists. Please login or use a different email.');
      } else if (err.response?.status === 400) {
        setError(err.response.data?.message || 'Invalid registration data. Please check your inputs.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Step indicator
  const StepIndicator = () => (
    <div className="relative mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <button
                type="button"
                onClick={() => {
                  if (step.id <= currentStep) setCurrentStep(step.id);
                }}
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-200 scale-110'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle size={18} />
                ) : (
                  <step.icon size={18} />
                )}
              </button>
              <div className="mt-2 text-center">
                <div className={`text-xs font-medium ${
                  isActive ? 'text-orange-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute left-0 right-0 top-5 flex items-center">
                  <div className={`h-0.5 w-full transition-all duration-300 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-6">
            <div className="absolute top-0 right-0 opacity-10">
              <Sparkles size={120} />
            </div>
            <div className="relative">
              <h1 className="text-2xl font-bold text-white">Create Account</h1>
              <p className="text-orange-100 text-sm mt-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 bg-orange-200 rounded-full animate-pulse" />
                Complete your profile in {steps.length} simple steps
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <StepIndicator />

            {/* Messages */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Account Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                              errors.firstName ? 'border-red-300' : 'border-slate-200'
                            }`}
                            value={formData.firstName}
                            onChange={(e) => updateField('firstName', e.target.value)}
                            placeholder="Enter first name"
                          />
                        </div>
                        <FieldError name="firstName" />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                              errors.lastName ? 'border-red-300' : 'border-slate-200'
                            }`}
                            value={formData.lastName}
                            onChange={(e) => updateField('lastName', e.target.value)}
                            placeholder="Enter last name"
                          />
                        </div>
                        <FieldError name="lastName" />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                            errors.email ? 'border-red-300' : 'border-slate-200'
                          }`}
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          placeholder="you@example.com"
                        />
                      </div>
                      <FieldError name="email" />
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="mt-4 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2"
                    >
                      Next Step <ArrowRight size={18} />
                    </button>
                  </motion.div>
                )}

                {/* Step 2: Security */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 pr-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                              errors.password ? 'border-red-300' : 'border-slate-200'
                            }`}
                            value={formData.password}
                            onChange={(e) => updateField('password', e.target.value)}
                            placeholder="Create a strong password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                          <div className="mt-2 space-y-1">
                            <div className="flex h-1.5 overflow-hidden rounded-full bg-slate-200">
                              <div 
                                className="h-full transition-all duration-300"
                                style={{ width: strength.width, backgroundColor: strength.color }}
                              />
                            </div>
                            <div className="flex justify-between text-xs">
                              <span style={{ color: strength.color }} className="font-medium">
                                {strength.text}
                              </span>
                              <span className="text-slate-400">
                                {formData.password.length}/8+ characters
                              </span>
                            </div>
                          </div>
                        )}
                        <FieldError name="password" />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 pr-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                              errors.confirmPassword ? 'border-red-300' : 'border-slate-200'
                            }`}
                            value={formData.confirmPassword}
                            onChange={(e) => updateField('confirmPassword', e.target.value)}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <FieldError name="confirmPassword" />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2"
                      >
                        Next Step <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Profile */}
                {currentStep === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="space-y-4"
                  >
                    {/* Profile Photo */}
                    <div className="flex items-center gap-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-white">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-slate-100">
                            <User size={32} className="text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">Profile Photo</p>
                        <p className="text-xs text-slate-500">Upload a photo to personalize your profile</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-orange-300 hover:text-orange-600"
                          disabled={photoUploading}
                        >
                          <Upload size={14} />
                          {photoUploading ? 'Uploading...' : 'Upload Photo'}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-[80px_1fr] gap-2">
                          <select
                            className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-3 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                            value={formData.countryCode}
                            onChange={(e) => updateField('countryCode', e.target.value)}
                          >
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+61">🇦🇺 +61</option>
                            <option value="+81">🇯🇵 +81</option>
                          </select>
                          <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="tel"
                              className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                                errors.mobileNumber ? 'border-red-300' : 'border-slate-200'
                              }`}
                              value={formData.mobileNumber}
                              onChange={(e) => updateField('mobileNumber', e.target.value)}
                              placeholder="Enter mobile number"
                            />
                          </div>
                        </div>
                        <FieldError name="mobileNumber" />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="date"
                            className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                              errors.dob ? 'border-red-300' : 'border-slate-200'
                            }`}
                            value={formData.dob}
                            onChange={(e) => updateField('dob', e.target.value)}
                          />
                        </div>
                        <FieldError name="dob" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          City <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                              errors.city ? 'border-red-300' : 'border-slate-200'
                            }`}
                            value={formData.city}
                            onChange={(e) => updateField('city', e.target.value)}
                            placeholder="Enter city"
                          />
                        </div>
                        <FieldError name="city" />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          State <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                              errors.state ? 'border-red-300' : 'border-slate-200'
                            }`}
                            value={formData.state}
                            onChange={(e) => updateField('state', e.target.value)}
                            placeholder="Enter state"
                          />
                        </div>
                        <FieldError name="state" />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                              errors.country ? 'border-red-300' : 'border-slate-200'
                            }`}
                            value={formData.country}
                            onChange={(e) => updateField('country', e.target.value)}
                            placeholder="Enter country"
                          />
                        </div>
                        <FieldError name="country" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Preferred Language <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Languages size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <select
                            className={`w-full rounded-xl border-2 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 ${
                              errors.preferredLanguage ? 'border-red-300' : 'border-slate-200'
                            }`}
                            value={formData.preferredLanguage}
                            onChange={(e) => updateField('preferredLanguage', e.target.value)}
                          >
                            <option value="">Select language</option>
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>
                        <FieldError name="preferredLanguage" />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Organization
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                          value={formData.organization}
                          onChange={(e) => updateField('organization', e.target.value)}
                          placeholder="Enter organization name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Skills
                        </label>
                        <input
                          type="text"
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                          value={formData.skills}
                          onChange={(e) => updateField('skills', e.target.value)}
                          placeholder="Java, Python, JavaScript"
                        />
                        <p className="mt-1 text-xs text-slate-400">Separate skills with commas</p>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                          Field of Study
                        </label>
                        <div className="relative">
                          <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                            value={formData.fieldOfStudy}
                            onChange={(e) => updateField('fieldOfStudy', e.target.value)}
                            placeholder="Computer Science"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Highest Qualification
                      </label>
                      <div className="relative">
                        <Award size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-4 py-3 pl-10 text-sm transition-all focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                          value={formData.highestQualification}
                          onChange={(e) => updateField('highestQualification', e.target.value)}
                          placeholder="B.Tech, M.Sc, etc."
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2"
                      >
                        Next Step <ArrowRight size={18} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Terms */}
                {currentStep === 4 && (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="space-y-4"
                  >
                    <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-6">
                      <h3 className="mb-3 text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <FileText size={20} className="text-orange-500" />
                        Terms & Conditions
                      </h3>
                      
                      <div className="mb-4 max-h-48 overflow-y-auto rounded-lg bg-white p-4 text-sm text-slate-600 border border-slate-100">
                        <div className="space-y-3">
                          <div>
                            <strong className="text-slate-800">1. Acceptance of Terms</strong>
                            <p className="mt-1">By creating an account on LearnMaster, you agree to abide by these Terms & Conditions and our Privacy Policy.</p>
                          </div>
                          <div>
                            <strong className="text-slate-800">2. User Responsibilities</strong>
                            <p className="mt-1">You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</p>
                          </div>
                          <div>
                            <strong className="text-slate-800">3. Account Accuracy</strong>
                            <p className="mt-1">You agree to provide accurate, current, and complete information during the registration process.</p>
                          </div>
                          <div>
                            <strong className="text-slate-800">4. Privacy Policy</strong>
                            <p className="mt-1">We respect your privacy. Your personal data is protected and will not be shared with third parties.</p>
                          </div>
                        </div>
                      </div>

                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={formData.agreeToTerms}
                          onChange={(e) => updateField('agreeToTerms', e.target.checked)}
                          className={`mt-0.5 h-5 w-5 rounded border-2 transition-all ${
                            errors.agreeToTerms 
                              ? 'border-red-400' 
                              : 'border-slate-300'
                          } text-orange-600 focus:ring-orange-500 focus:ring-offset-0`}
                        />
                        <span className="text-sm text-slate-700 leading-relaxed">
                          I have read and agree to the{' '}
                          <button type="button" className="text-orange-600 hover:underline font-medium">
                            Terms of Service
                          </button>
                          {' '}and{' '}
                          <button type="button" className="text-orange-600 hover:underline font-medium">
                            Privacy Policy
                          </button>
                          .
                        </span>
                      </label>
                      <FieldError name="agreeToTerms" />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex-1 rounded-xl border-2 border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={18} /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-orange-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Create Account <ChevronRight size={18} />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-600 hover:underline font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Features Footer */}
        <div className="mt-6 flex justify-center gap-8 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-emerald-500" /> Secure
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-emerald-500" /> Fast
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle size={14} className="text-emerald-500" /> Free
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;