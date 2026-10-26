// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Save, Loader2, AlertCircle, MapPin, Globe, Camera, Languages,
  Award, BookOpen, Clock, CheckCircle, GraduationCap, Briefcase, Tag, Settings,
  Edit3, Calendar, ChevronRight, Shield, LogOut, TrendingUp, Award as AwardIcon,
  Target, Plus, X, Monitor, Smartphone, Globe as GlobeIcon, Trash2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';
import courseApi from '../api/courseApi';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { normalizePhotoUrl } from '../config/api';
import ProfilePhotoModal from '../components/ProfilePhotoModal';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState(null);
  const [temp, setTemp] = useState(null);
  const [error, setError] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [photoBlobUrl, setPhotoBlobUrl] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [learningStats, setLearningStats] = useState({
    enrolled: null,
    inProgress: null,
    completed: null,
    certificates: null,
    loading: true,
    error: false
  });
  const [showSkillsEdit, setShowSkillsEdit] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const profileImgRef = useRef(null);
  const photoBlobUrlRef = useRef(null);
  const coverPhotoInputRef = useRef(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Session management state
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  // Email change state
  const [emailChangeStep, setEmailChangeStep] = useState(0); // 0: none, 1: request, 2: verify-old, 3: verify-new
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: '',
    password: '',
    oldOtp: '',
    newOtp: '',
    sessionId: ''
  });
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');

  // Tab definitions
  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'education', label: 'Education & Professional', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Tag },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'account', label: 'Account Settings', icon: Shield },
  ];

  // Fetch profile photo as blob for authenticated access
  const fetchProfilePhotoAsBlob = async (photoUrl, retries = 3) => {
    if (!photoUrl) return null;

    // Google Drive URLs should be used directly, not fetched as blob
    if (photoUrl.includes('drive.google.com')) {
      console.log('[Profile] Google Drive URL detected, using directly:', photoUrl);
      return photoUrl;
    }

    for (let i = 0; i < retries; i++) {
      try {
        if (photoBlobUrlRef.current && photoBlobUrlRef.current.startsWith('blob:')) {
          URL.revokeObjectURL(photoBlobUrlRef.current);
          photoBlobUrlRef.current = null;
        }

        const response = await axiosInstance.get(photoUrl, {
          responseType: 'blob'
        });

        if (!response.data || response.data.size === 0) {
          throw new Error('Empty response data');
        }

        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/jpeg' });
        const blobUrl = URL.createObjectURL(blob);
        photoBlobUrlRef.current = blobUrl;
        console.log('[Profile] Successfully created blob URL:', blobUrl);
        return blobUrl;
      } catch (error) {
        console.error(`[Profile] Failed to fetch photo blob (attempt ${i + 1}/${retries}):`, error);
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
        } else {
          console.error('[Profile] All retry attempts failed for photo blob');
          return null;
        }
      }
    }
  };

  // Fetch profile data from API
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authApi.getUserProfile();
      const data = response.data?.data || response.data?.user || response.data || response;

      if (!data || Object.keys(data).length === 0) {
        throw new Error('No data received from API');
      }
      
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      const name = data.name || `${firstName} ${lastName}`.trim() || data.username || data.displayName || '';
      const email = data.email || '';
      const phone = data.phone || data.mobile || data.mobileNumber || data.mobile1 || data.phoneNumber || '';
      const role = data.role || data.role1 || data.userRole || '';
      const profilePhoto = data.profilePhoto || data.photoURL || data.avatar || null;
      const normalizedPhotoUrl = normalizePhotoUrl(profilePhoto);
      const coverPhoto = data.coverPhoto || null;
      const normalizedCoverPhotoUrl = normalizePhotoUrl(coverPhoto);

      const profileData = {
        firstName,
        lastName,
        name,
        email,
        phone,
        mobile: phone,
        role,
        profilePhoto: normalizedPhotoUrl,
        coverPhoto: normalizedCoverPhotoUrl,
        preferredLanguage: data.preferredLanguage || 'EN',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        countryCode: data.countryCode || '',
        dob: data.dob || '',
        gender: data.gender || '',
        highestQualification: data.highestQualification || '',
        fieldOfStudy: data.fieldOfStudy || '',
        organization: data.organization || '',
        skills: data.skills
          ? data.skills.split(',').map(s => s.trim()).filter(s => s !== '')
          : [],
        _raw: data
      };
      
      setProfile(profileData);
      setTemp(profileData);

      if (normalizedPhotoUrl) {
        const blobUrl = await fetchProfilePhotoAsBlob(normalizedPhotoUrl);
        setPhotoBlobUrl(blobUrl);
      }

      if (normalizedCoverPhotoUrl) {
        setCoverPhotoUrl(normalizedCoverPhotoUrl);
      }

      await fetchLearningStats();
      
    } catch (error) {
      let errorMessage = 'Failed to load profile';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else if (error.response?.status === 404) {
        errorMessage = 'Profile API not found. Please contact support.';
        toast.error('Profile API not found');
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
        toast.error('Server error. Please try again.');
      } else if (error.message) {
        errorMessage = error.message;
        toast.error(error.message);
      } else {
        toast.error('Failed to load profile');
      }
      
      setError(errorMessage);
      setProfile(null);
      setTemp(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch learning statistics
  const fetchLearningStats = async () => {
    setLearningStats(prev => ({ ...prev, loading: true, error: false }));
    try {
      const response = await courseApi.getStudentCourses();
      const courses = response.data?.courses || response.data || [];

      const enrolled = courses.length;
      const inProgress = courses.filter(c => c.progress < 100 && c.progress > 0).length;
      const completed = courses.filter(c => c.progress === 100).length;

      try {
        const dashboardResponse = await courseApi.getStudentDashboard();
        const certificates = dashboardResponse?.certificates ?? null;
        setLearningStats({
          enrolled,
          inProgress,
          completed,
          certificates,
          loading: false,
          error: false
        });
      } catch {
        setLearningStats({
          enrolled,
          inProgress,
          completed,
          certificates: completed,
          loading: false,
          error: false
        });
      }
    } catch (error) {
      console.error('[Profile] Failed to fetch learning stats:', error);
      setLearningStats(prev => ({ ...prev, loading: false, error: true }));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    let immediatePreviewUrl = null;

    try {
      immediatePreviewUrl = URL.createObjectURL(file);
      console.log('[Profile] Created immediate preview URL:', immediatePreviewUrl);
      setPhotoBlobUrl(immediatePreviewUrl);
      photoBlobUrlRef.current = immediatePreviewUrl;

      const response = await authApi.uploadProfilePhoto(file);
      const newPhotoUrl = response?.data?.data?.profilePhoto || response?.data?.profilePhoto || response?.profilePhoto || response?.data?.photoUrl || response?.data?.url;

      if (newPhotoUrl) {
        const normalizedUrl = normalizePhotoUrl(newPhotoUrl);
        setTemp({...temp, profilePhoto: normalizedUrl});
        setProfile({...profile, profilePhoto: normalizedUrl});
        setUnsavedChanges(false);

        console.log('[Profile] Photo uploaded, keeping blob URL for display');

        toast.success('Profile photo uploaded successfully!');
        window.dispatchEvent(new CustomEvent('profilePhotoChanged', { detail: { profilePhoto: normalizedUrl } }));
      } else {
        toast.error('Failed to get photo URL from response');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
      throw error;
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle photo removal
  const handleRemovePhoto = async () => {
    try {
      await authApi.removeProfilePhoto();
      const normalizedUrl = normalizePhotoUrl(null);
      setTemp({...temp, profilePhoto: normalizedUrl});
      setProfile({...profile, profilePhoto: normalizedUrl});
      setPhotoBlobUrl(null);
      setUnsavedChanges(false);

      toast.success('Profile photo removed successfully!');
      window.dispatchEvent(new CustomEvent('profilePhotoRemoved'));

      setTimeout(() => {
        fetchProfile();
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove photo');
      throw error;
    }
  };

  // Save profile
  const handleSave = async () => {
    if (!temp) return;
    
    setSaving(true);
    setError("");
    try {
      const updateData = {
        firstName: temp.firstName,
        lastName: temp.lastName,
        email: temp.email,
        mobile: temp.phone,
        preferredLanguage: temp.preferredLanguage,
        city: temp.city,
        state: temp.state,
        country: temp.country,
        highestQualification: temp.highestQualification,
        fieldOfStudy: temp.fieldOfStudy,
        organization: temp.organization,
        skills: temp.skills.join(','),
      };

      await authApi.updateUserProfile(updateData);
      setProfile(temp);
      setEditMode(false);
      setUnsavedChanges(false);
      toast.success('Profile updated successfully!');
      
      setTimeout(() => {
        fetchProfile();
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }, 500);
      
    } catch (error) {
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Invalid data provided';
        toast.error(errorMessage);
      } else if (error.response?.status === 404) {
        errorMessage = 'Profile update API not found';
        toast.error('Profile update API not found');
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
        toast.error('Server error. Please try again.');
      } else if (error.message) {
        errorMessage = error.message;
        toast.error(errorMessage);
      } else {
        toast.error('Failed to update profile');
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Handle skills
  const handleAddSkill = (skill) => {
    if (skill && !temp.skills.includes(skill)) {
      setTemp({...temp, skills: [...temp.skills, skill]});
      setUnsavedChanges(true);
    }
  };

  const handleRemoveSkill = (skill) => {
    setTemp({...temp, skills: temp.skills.filter(s => s !== skill)});
    setUnsavedChanges(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      window.location.href = '/login';
    } catch (error) {
      console.error('[Profile] Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // Session management handlers
  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const response = await authApi.listSessions();
      setSessions(response.data || []);
      toast.success('Sessions loaded successfully');
    } catch (error) {
      console.error('[Profile] Load sessions error:', error);
      toast.error('Failed to load sessions');
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleLogoutDevice = async (sessionId) => {
    try {
      await authApi.logoutDevice(sessionId);
      toast.success('Device logged out successfully');
      loadSessions(); // Refresh the list
    } catch (error) {
      console.error('[Profile] Logout device error:', error);
      toast.error('Failed to logout device');
    }
  };

  const handleLogoutAllSessions = async () => {
    if (!window.confirm('Are you sure you want to logout from all devices? This will log you out from your current session as well.')) {
      return;
    }
    setLogoutAllLoading(true);
    try {
      await authApi.logoutAllSessions();
      toast.success('Logged out from all devices');
      logout(); // Logout current session
      window.location.href = '/login';
    } catch (error) {
      console.error('[Profile] Logout all sessions error:', error);
      toast.error('Failed to logout from all devices');
    } finally {
      setLogoutAllLoading(false);
    }
  };

  // Email change handlers
  const handleRequestEmailChange = async () => {
    setEmailChangeLoading(true);
    setEmailChangeError('');
    try {
      const response = await authApi.requestEmailChange(
        emailChangeData.newEmail,
        emailChangeData.password
      );
      setEmailChangeData({
        ...emailChangeData,
        sessionId: response.data?.sessionId || response.sessionId
      });
      setEmailChangeStep(1);
      toast.success('OTP codes sent to both email addresses');
    } catch (error) {
      console.error('[Profile] Request email change error:', error);
      setEmailChangeError(error.response?.data?.message || 'Failed to request email change');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleVerifyOldEmail = async () => {
    setEmailChangeLoading(true);
    setEmailChangeError('');
    try {
      await authApi.verifyOldEmail(emailChangeData.sessionId, emailChangeData.oldOtp);
      setEmailChangeStep(2);
      toast.success('Current email verified');
    } catch (error) {
      console.error('[Profile] Verify old email error:', error);
      setEmailChangeError(error.response?.data?.message || 'Failed to verify current email');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleVerifyNewEmail = async () => {
    setEmailChangeLoading(true);
    setEmailChangeError('');
    try {
      await authApi.verifyNewEmail(emailChangeData.sessionId, emailChangeData.newOtp);
      setEmailChangeStep(3);
      toast.success('Email changed successfully');
      // Redirect to login after 2 seconds
      setTimeout(() => {
        logout();
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('[Profile] Verify new email error:', error);
      setEmailChangeError(error.response?.data?.message || 'Failed to verify new email');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  // Handle cover photo upload
  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingCover(true);
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setCoverPhotoUrl(previewUrl);

      // Upload to backend using authApi
      const response = await authApi.uploadCoverPhoto(file);
      const coverPhotoUrl = response?.data?.data?.coverPhoto || response?.data?.coverPhoto;
      
      if (coverPhotoUrl) {
        const normalizedUrl = normalizePhotoUrl(coverPhotoUrl);
        setCoverPhotoUrl(normalizedUrl);
        toast.success('Cover photo uploaded successfully!');
      } else {
        toast.error('Failed to get cover photo URL from response');
      }

      // Reset file input
      if (coverPhotoInputRef.current) {
        coverPhotoInputRef.current.value = '';
      }
    } catch (error) {
      console.error('[Profile] Cover photo upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload cover photo');
      // Revert to original cover photo on error
      setCoverPhotoUrl(profile?.coverPhoto || null);
    } finally {
      setUploadingCover(false);
    }
  };

  // Calculate profile completion
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phone,
      profile.city,
      profile.country,
      profile.highestQualification,
      profile.fieldOfStudy,
      profile.skills?.length > 0
    ];
    
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (photoBlobUrl && profileImgRef.current) {
      profileImgRef.current.src = photoBlobUrl;
    }
  }, [photoBlobUrl]);

  useEffect(() => {
    if (activeTab === 'account' && sessions.length === 0) {
      loadSessions();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();
  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="text-gray-400">Overview</span>
        <ChevronRight size={16} className="text-gray-400" />
        <span className="font-medium text-gray-900">Profile</span>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-[#0B1220] via-[#2563EB] to-[#06B6D4] relative">
          {(coverPhotoUrl || profile?.coverPhoto) ? (
            <img
              src={coverPhotoUrl || profile?.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/20"></div>
          <input
            ref={coverPhotoInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleCoverPhotoUpload}
            className="hidden"
          />
          <button
            onClick={() => coverPhotoInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition flex items-center gap-2 disabled:opacity-50"
          >
            {uploadingCover ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera size={16} />
                Change Cover
              </>
            )}
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 sm:-mt-12 gap-4 sm:gap-6">
            {/* Profile Photo */}
            <div className="flex items-end gap-3 shrink-0">
              <div className="relative inline-block">
                {(photoBlobUrl || profile?.profilePhoto) ? (
                  <img
                    ref={profileImgRef}
                    src={photoBlobUrl || profile?.profilePhoto}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      console.error('[Profile] Image failed to load:', photoBlobUrl || profile?.profilePhoto);
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                  style={{display: (photoBlobUrl || profile?.profilePhoto) ? 'none' : 'flex'}}
                >
                  {initials}
                </div>
                {/* Camera Icon Button */}
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  disabled={uploadingPhoto}
                  className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  <Camera size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                  {profile.role || 'Student'}
                </span>
                <span className="text-gray-600 text-sm">{profile.email}</span>
              </div>
              {profile.city && profile.country && (
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                  <MapPin size={14} />
                  <span>{profile.city}, {profile.country}</span>
                </div>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700 flex items-center gap-2"
            >
              <Edit3 size={16} />
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.enrolled || 0}</p>
              <p className="text-xs text-green-600 mt-1">+2 this month</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.inProgress || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Keep going!</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.completed || 0}</p>
              <p className="text-xs text-green-600 mt-1">Great progress!</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Certificates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{learningStats.certificates || 0}</p>
              <p className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline">View certificates →</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <AwardIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-2">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your personal details and keep your profile updated.</p>
                  </div>
                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.firstName || ''}
                          onChange={e => setTemp({...temp, firstName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.lastName || ''}
                          onChange={e => setTemp({...temp, lastName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                          type="email"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.email || ''}
                          onChange={e => setTemp({...temp, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.phone || ''}
                          onChange={e => setTemp({...temp, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input
                          type="date"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.dob || ''}
                          onChange={e => setTemp({...temp, dob: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.gender || ''}
                          onChange={e => setTemp({...temp, gender: e.target.value})}
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.country || ''}
                          onChange={e => setTemp({...temp, country: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.city || ''}
                          onChange={e => setTemp({...temp, city: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
                        <select
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.preferredLanguage || 'EN'}
                          onChange={e => setTemp({...temp, preferredLanguage: e.target.value})}
                        >
                          <option value="EN">English</option>
                          <option value="ES">Spanish</option>
                          <option value="FR">French</option>
                          <option value="DE">German</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={18} />
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setTemp(profile);
                          setEditMode(false);
                        }}
                        className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">First Name</label>
                        <p className="font-medium text-gray-900">{profile.firstName || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                        <p className="font-medium text-gray-900">{profile.lastName || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                        <p className="font-medium text-gray-900">{profile.email || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Mobile Number</label>
                        <p className="font-medium text-gray-900">{profile.phone || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Date of Birth</label>
                        <p className="font-medium text-gray-900">{profile.dob || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Gender</label>
                        <p className="font-medium text-gray-900">{profile.gender || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Country</label>
                        <p className="font-medium text-gray-900">{profile.country || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">City</label>
                        <p className="font-medium text-gray-900">{profile.city || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500 mb-1">Preferred Language</label>
                        <p className="font-medium text-gray-900">{profile.preferredLanguage || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Education & Professional Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Tell us about your educational background and professional information.</p>
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        value={temp.highestQualification || ''}
                        onChange={e => setTemp({...temp, highestQualification: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        value={temp.fieldOfStudy || ''}
                        onChange={e => setTemp({...temp, fieldOfStudy: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Organization (Optional)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        value={temp.organization || ''}
                        onChange={e => setTemp({...temp, organization: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.state || ''}
                          onChange={e => setTemp({...temp, state: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                          value={temp.country || ''}
                          onChange={e => setTemp({...temp, country: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Highest Qualification</label>
                      <p className="font-medium text-gray-900">{profile.highestQualification || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Field of Study</label>
                      <p className="font-medium text-gray-900">{profile.fieldOfStudy || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Organization</label>
                      <p className="font-medium text-gray-900">{profile.organization || '-'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                    <p className="text-sm text-gray-500 mt-1">Add your skills to get better course recommendations.</p>
                  </div>
                  <button
                    onClick={() => setShowSkillsEdit(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                  >
                    Edit Skills
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                  )}
                </div>

                {showSkillsEdit && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Add a skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newSkill.trim()) {
                            handleAddSkill(newSkill.trim());
                            setNewSkill('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newSkill.trim()) {
                            handleAddSkill(newSkill.trim());
                            setNewSkill('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
                  <p className="text-sm text-gray-500 mt-1">Customize your learning experience.</p>
                </div>
                <p className="text-gray-500">Preferences settings coming soon...</p>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your account settings and security.</p>
                </div>
                
                {/* Session Management */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Monitor size={18} />
                      Active Sessions
                    </h3>
                    <button
                      onClick={loadSessions}
                      disabled={sessionsLoading}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={sessionsLoading ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                  </div>
                  
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="animate-spin text-blue-500" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No active sessions found
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {session.deviceType === 'mobile' ? (
                                <Smartphone size={20} className="text-blue-600" />
                              ) : (
                                <Monitor size={20} className="text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{session.deviceName || 'Unknown Device'}</p>
                              <p className="text-xs text-gray-500">
                                {session.browser} • {session.operatingSystem}
                              </p>
                              <p className="text-xs text-gray-400">
                                {session.city}, {session.country} • {new Date(session.loginTime).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleLogoutDevice(session.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                            title="Logout this device"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button
                    onClick={handleLogoutAllSessions}
                    disabled={logoutAllLoading}
                    className="w-full px-4 py-3 border border-red-200 rounded-xl hover:bg-red-50 transition text-red-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {logoutAllLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <LogOut size={18} />
                        Logout from All Devices
                      </>
                    )}
                  </button>
                </div>

                {/* Email Change */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Mail size={18} />
                    Change Email Address
                  </h3>
                  
                  {emailChangeStep === 0 && (
                    <div className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter new email address"
                        value={emailChangeData.newEmail}
                        onChange={(e) => setEmailChangeData({ ...emailChangeData, newEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Current password (for verification)"
                        value={emailChangeData.password}
                        onChange={(e) => setEmailChangeData({ ...emailChangeData, password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleRequestEmailChange}
                        disabled={emailChangeLoading || !emailChangeData.newEmail || !emailChangeData.password}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {emailChangeLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <Mail size={18} />
                            Request Email Change
                          </>
                        )}
                      </button>
                      {emailChangeError && (
                        <p className="text-sm text-red-600">{emailChangeError}</p>
                      )}
                    </div>
                  )}

                  {emailChangeStep === 1 && (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        OTP codes have been sent to your current and new email addresses. Please verify both within 5 minutes.
                      </p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Email OTP</label>
                        <input
                          type="text"
                          placeholder="Enter OTP from current email"
                          value={emailChangeData.oldOtp}
                          onChange={(e) => setEmailChangeData({ ...emailChangeData, oldOtp: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleVerifyOldEmail}
                        disabled={emailChangeLoading || !emailChangeData.oldOtp}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {emailChangeLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Verify Current Email
                          </>
                        )}
                      </button>
                      {emailChangeError && (
                        <p className="text-sm text-red-600">{emailChangeError}</p>
                      )}
                    </div>
                  )}

                  {emailChangeStep === 2 && (
                    <div className="space-y-3">
                      <p className="text-sm text-green-600">Current email verified. Now verify your new email address.</p>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Email OTP</label>
                        <input
                          type="text"
                          placeholder="Enter OTP from new email"
                          value={emailChangeData.newOtp}
                          onChange={(e) => setEmailChangeData({ ...emailChangeData, newOtp: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        onClick={handleVerifyNewEmail}
                        disabled={emailChangeLoading || !emailChangeData.newOtp}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {emailChangeLoading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            Verify New Email (Completes Change)
                          </>
                        )}
                      </button>
                      {emailChangeError && (
                        <p className="text-sm text-red-600">{emailChangeError}</p>
                      )}
                    </div>
                  )}

                  {emailChangeStep === 3 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-800 font-medium flex items-center gap-2">
                        <CheckCircle size={20} />
                        Email changed successfully! You will be redirected to login shortly.
                      </p>
                    </div>
                  )}
                </div>

                {/* Account Info */}
                <div className="space-y-4 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Member Since</p>
                      <p className="text-sm text-gray-500">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Jan 15, 2024'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Account Type</p>
                      <p className="text-sm text-gray-500">{profile?.role || 'Student'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Account Status</p>
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {profile?.status || 'Active'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 border border-red-200 rounded-xl hover:bg-red-50 transition text-red-600 font-medium flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Profile Completion */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Profile Completion</h3>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{profileCompletion}%</p>
              <p className="text-sm text-gray-500 mt-1">Complete your profile to get better course recommendations.</p>
            </div>
          </div>

          {/* Learning Statistics */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Learning Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Enrolled Courses</span>
                <span className="font-semibold text-gray-900">{learningStats.enrolled || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">In Progress</span>
                <span className="font-semibold text-gray-900">{learningStats.inProgress || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-gray-900">{learningStats.completed || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Certificates</span>
                <span className="font-semibold text-gray-900">{learningStats.certificates || 0}</span>
              </div>
            </div>
          </div>

          {/* Skills Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Skills</h3>
              <button
                onClick={() => setActiveTab('skills')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills?.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
              {profile.skills?.length > 5 && (
                <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm">
                  +{profile.skills.length - 5} more
                </span>
              )}
              {(!profile.skills || profile.skills.length === 0) && (
                <p className="text-gray-500 text-sm">No skills added</p>
              )}
            </div>
          </div>

          {/* Promotional Card */}
          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-2">Keep Learning</h3>
            <p className="text-sm text-blue-100 mb-4">Build Your Future</p>
            <button
              onClick={() => window.location.href = '/courses'}
              className="w-full px-4 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm"
            >
              Explore Courses
            </button>
          </div>
        </div>
      </div>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onUploadPhoto={handlePhotoUpload}
        onRemovePhoto={handleRemovePhoto}
        currentPhotoUrl={profile?.profilePhoto}
      />
    </motion.div>
  );
};

export default ProfilePage;
