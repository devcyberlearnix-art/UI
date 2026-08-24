// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  Shield,
  Camera,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Save,
  Edit3,
  X,
  Loader2,
  Laptop,
  Smartphone,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user: authUser, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [copiedId, setCopiedId] = useState(false);

  // Raw fetched profile from API
  const [profile, setProfile] = useState(null);

  // Form data for editing initialized with authUser / local cache
  const [formData, setFormData] = useState(() => {
    const cached = authUser || JSON.parse(localStorage.getItem('lms_user') || '{}');
    let skillsStr = '';
    if (Array.isArray(cached.skills)) {
      skillsStr = cached.skills.join(', ');
    } else if (typeof cached.skills === 'string') {
      skillsStr = cached.skills;
    }

    return {
      firstName: cached.firstName || cached.name || '',
      lastName: cached.lastName || '',
      email: cached.email || '',
      mobile: cached.mobile || cached.phone || cached.mobileNumber || '',
      dob: cached.dob ? String(cached.dob).slice(0, 10) : '',
      city: cached.city || '',
      state: cached.state || '',
      country: cached.country || 'India',
      preferredLanguage: cached.preferredLanguage || 'English',
      organization: cached.organization || cached.company || '',
      fieldOfStudy: cached.fieldOfStudy || '',
      highestQualification: cached.highestQualification || '',
      skills: skillsStr,
      profilePhoto: cached.profilePhoto || cached.photoURL || cached.avatar || '',
    };
  });

  // Load profile from API: GET /api/v1/users/me
  const fetchProfile = async (silent = false) => {
    if (!silent && !formData.email) setLoading(true);
    try {
      console.log('[ProfilePage] Fetching user profile from GET /api/v1/users/me');
      const response = await authApi.getUserProfile();
      console.log('[ProfilePage] Profile response:', response);

      const data = response?.data || response;
      if (data) {
        setProfile(data);
        
        let skillsStr = '';
        if (Array.isArray(data.skills)) {
          skillsStr = data.skills.join(', ');
        } else if (typeof data.skills === 'string') {
          skillsStr = data.skills;
        }

        const mappedData = {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          mobile: data.mobile || data.phone || data.mobileNumber || '',
          dob: data.dob ? String(data.dob).slice(0, 10) : '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'India',
          preferredLanguage: data.preferredLanguage || 'English',
          organization: data.organization || data.company || '',
          fieldOfStudy: data.fieldOfStudy || '',
          highestQualification: data.highestQualification || '',
          skills: skillsStr,
          profilePhoto: data.profilePhoto || data.photoURL || data.avatar || '',
        };

        setFormData(mappedData);

        if (updateUser) {
          updateUser({ ...data, ...mappedData });
        }
      }
    } catch (error) {
      console.warn('[ProfilePage] Failed to fetch profile from API, using cached data:', error);
      // If we don't even have cached email, notify user
      if (!silent && !formData.email && !authUser?.email) {
        toast.error(error.response?.data?.message || 'Could not load profile from server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Upload Profile Photo: POST /api/v1/users/me/photo
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size (5MB max)
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingPhoto(true);
      toast.loading('Uploading profile photo...', { id: 'photo-upload' });

      const response = await authApi.uploadProfilePhoto(file);
      console.log('[ProfilePage] Photo uploaded successfully:', response);

      const newPhotoUrl =
        response?.data?.profilePhoto ||
        response?.profilePhoto ||
        response?.data?.photoUrl ||
        response?.data?.url;

      if (newPhotoUrl) {
        setFormData((prev) => ({ ...prev, profilePhoto: newPhotoUrl }));
        if (profile) {
          setProfile((prev) => ({ ...prev, profilePhoto: newPhotoUrl }));
        }
        if (updateUser) {
          updateUser({ profilePhoto: newPhotoUrl });
        }
      }

      toast.success('Profile photo updated successfully!', { id: 'photo-upload' });
      // Refresh entire profile quietly to update backend timestamp/state
      fetchProfile(true);
    } catch (error) {
      console.error('[ProfilePage] Photo upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo', { id: 'photo-upload' });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Save Profile Changes: PUT /api/v1/users/me
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      console.log('[ProfilePage] Submitting profile update payload:', formData);

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        mobile: formData.mobile.trim(),
        dob: formData.dob || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        preferredLanguage: formData.preferredLanguage.trim(),
        organization: formData.organization.trim(),
        fieldOfStudy: formData.fieldOfStudy.trim(),
        highestQualification: formData.highestQualification.trim(),
        skills: formData.skills.trim(),
      };

      const response = await authApi.updateUserProfile(payload);
      console.log('[ProfilePage] Profile updated response:', response);

      const updated = response?.data || response;
      setProfile((prev) => ({ ...prev, ...updated }));
      
      if (updateUser) {
        updateUser(updated);
      }

      setEditMode(false);
      toast.success(response?.message || 'Profile updated successfully!');
      fetchProfile(true);
    } catch (error) {
      console.error('[ProfilePage] Profile update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const copyUserId = () => {
    const uid = profile?.userId || authUser?.userId || authUser?.id || '';
    if (uid) {
      navigator.clipboard.writeText(uid);
      setCopiedId(true);
      toast.success('User ID copied to clipboard');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const fullName =
    `${formData.firstName} ${formData.lastName}`.trim() ||
    authUser?.displayName ||
    authUser?.firstName ||
    'Student User';

  const displayRole = (profile?.role || authUser?.role || 'STUDENT').toUpperCase();
  const displayStatus = (profile?.status || 'ACTIVE').toUpperCase();
  const activeSessions = profile?.activeSessions || [];

  const skillsList = formData.skills
    ? formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'address', label: 'Location & Language', icon: MapPin },
    { id: 'academic', label: 'Education & Skills', icon: GraduationCap },
    { id: 'security', label: 'Account & Sessions', icon: Shield },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Hidden File Input for Avatar Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handlePhotoSelect}
        className="hidden"
      />

      {/* Hero Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Banner */}
        <div className="h-44 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
          <div className="absolute left-10 top-6 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 md:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 mb-4">
            {/* Avatar with Upload Button */}
            <div className="relative group self-start">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center overflow-hidden relative">
                {formData.profilePhoto ? (
                  <img
                    src={formData.profilePhoto}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {formData.firstName?.charAt(0) || fullName.charAt(0) || 'U'}
                  </span>
                )}

                {/* Uploading Overlay */}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white text-xs font-medium">
                    <Loader2 size={24} className="animate-spin text-orange-400 mb-1" />
                    <span>Uploading...</span>
                  </div>
                )}

                {/* Camera Click Overlay */}
                {!uploadingPhoto && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                    title="Change Profile Photo"
                  >
                    <Camera size={24} className="mb-1 text-white" />
                    <span className="text-xs font-medium">Change Photo</span>
                  </button>
                )}
              </div>

              {/* Status Badge Indicator */}
              <div
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
                  displayStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
                title={`Status: ${displayStatus}`}
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              </div>
            </div>

            {/* User Title & Role */}
            <div className="flex-1 md:pl-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{fullName}</h1>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
                  {displayRole}
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  {displayStatus}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                <Mail size={15} className="text-gray-400" />
                {formData.email || authUser?.email}
                {profile?.userId && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-400 ml-2">
                    ID: {profile.userId.slice(0, 8)}...
                    <button
                      onClick={copyUserId}
                      className="hover:text-orange-600 transition"
                      title="Copy full User ID"
                    >
                      {copiedId ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                    </button>
                  </span>
                )}
              </p>
            </div>

            {/* Actions: Edit Mode Toggle / Save */}
            <div className="flex items-center gap-3 self-start md:self-end">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="px-4 py-2 text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl transition flex items-center gap-2 font-medium"
              >
                <Camera size={16} className="text-orange-500" />
                <span>Upload Photo</span>
              </button>

              {!editMode ? (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="px-5 py-2 text-sm bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl shadow-md shadow-orange-500/20 transition flex items-center gap-2"
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      fetchProfile(true);
                    }}
                    className="px-4 py-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-5 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">Joined On</p>
              <p className="text-sm font-semibold text-gray-800">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active Member'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">Organization</p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {formData.organization || 'Not Specified'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">Location</p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {formData.city ? `${formData.city}, ${formData.country}` : 'Not Specified'}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 font-medium">Active Sessions</p>
              <p className="text-sm font-semibold text-gray-800">
                {activeSessions.length > 0 ? `${activeSessions.length} Active` : '1 Current'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30'
                  : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Cards */}
      <form onSubmit={handleSaveProfile}>
        <AnimatePresence mode="wait">
          {/* TAB 1: Personal Info */}
          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-500">Your core identity and contact details</p>
                </div>
                {editMode && (
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                    Editing Mode Active
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. Shiva"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. Sai"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-xs text-gray-400 font-normal">(Immutable)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: Location & Language */}
          {activeTab === 'address' && (
            <motion.div
              key="address"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6"
            >
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Location & Language</h3>
                <p className="text-sm text-gray-500">Your geographical location and language preferences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. Hyderabad"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">State / Province</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. Telangana"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. India"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Language</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      name="preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={handleChange}
                      disabled={!editMode}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600 bg-white"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Academic & Skills */}
          {activeTab === 'academic' && (
            <motion.div
              key="academic"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6"
            >
              <div className="border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900">Education & Professional Skills</h3>
                <p className="text-sm text-gray-500">Your academic background and technical skillset</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Organization / University
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. CyberLearnix / JNTU"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Field of Study</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="fieldOfStudy"
                      value={formData.fieldOfStudy}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. Cyber Security, Computer Science"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Highest Qualification</label>
                  <div className="relative">
                    <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="highestQualification"
                      value={formData.highestQualification}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. B.Tech, M.S, Bachelor of Engineering"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Skills <span className="text-xs text-gray-400 font-normal">(Comma-separated)</span>
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      disabled={!editMode}
                      placeholder="e.g. Java, Spring Boot, Microservices, SQL, React"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>

                  {/* Skills Pills Render */}
                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {skillsList.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg border border-orange-200 flex items-center gap-1.5"
                        >
                          <Sparkles size={11} className="text-orange-500" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: Security & Sessions */}
          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Account Meta Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Account Credentials & Status</h3>
                  <p className="text-sm text-gray-500">Security tokens and system identifiers</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium">User ID</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-semibold text-gray-800 truncate mr-2">
                        {profile?.userId || authUser?.userId || 'N/A'}
                      </p>
                      <button
                        type="button"
                        onClick={copyUserId}
                        className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-600 transition"
                        title="Copy ID"
                      >
                        {copiedId ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium">Assigned Role</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{displayRole}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium">Account Status</p>
                    <p className="text-sm font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 size={14} />
                      {displayStatus}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium">Created Timestamp</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 font-medium">Last Updated</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Sessions Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <div className="border-b border-gray-100 pb-4 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Active Login Sessions</h3>
                    <p className="text-sm text-gray-500">Devices currently logged into this account</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fetchProfile(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-orange-600 transition"
                    title="Refresh Sessions"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {activeSessions.length > 0 ? (
                    activeSessions.map((session, idx) => (
                      <div key={session.id || idx} className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                            {session.deviceInfo?.toLowerCase().includes('mobile') ? (
                              <Smartphone size={20} />
                            ) : (
                              <Laptop size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {session.deviceInfo || 'Browser Session'}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-2">
                              <span>IP: {session.ipAddress || '127.0.0.1'}</span>
                              <span>•</span>
                              <span>
                                {session.loginTime
                                  ? new Date(session.loginTime).toLocaleString()
                                  : 'Active now'}
                              </span>
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                          Current
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                          <Laptop size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Current Web Session</p>
                          <p className="text-xs text-gray-400">IP: 127.0.0.1 • Connected</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                        Active
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Save Button in Edit Mode */}
        {editMode && (
          <div className="sticky bottom-6 mt-6 bg-white/95 backdrop-blur-md border border-orange-200 p-4 rounded-2xl shadow-xl flex items-center justify-between z-20">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Sparkles size={18} className="text-orange-500 animate-pulse" />
              <span>You have unsaved changes in your profile.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  fetchProfile(true);
                }}
                className="px-4 py-2 text-sm border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-xl shadow-md shadow-orange-500/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;