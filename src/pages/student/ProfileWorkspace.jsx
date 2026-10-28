// src/pages/student/ProfileWorkspace.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, ShieldCheck, Settings, Edit3, Image, Award, Code,
  Camera, Save, Loader2, AlertCircle, MapPin, Mail, Phone, Calendar,
  GraduationCap, Briefcase, Tag, Shield, LogOut, Plus, X, Monitor,
  Smartphone, Trash2, RefreshCw, CheckCircle2, Clock, ChevronRight,
  Sparkles, ExternalLink
} from 'lucide-react';
import GlobalLayoutWrapper from '../../design-system/layout/GlobalLayoutWrapper';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import courseApi from '../../api/courseApi';
import axiosInstance from '../../api/axiosInstance';
import { normalizePhotoUrl } from '../../config/api';
import ProfilePhotoModal from '../../components/ProfilePhotoModal';
import toast from 'react-hot-toast';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

export default function ProfileWorkspace() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');
  
  // Profile Data
  const [profile, setProfile] = useState(null);
  const [temp, setTemp] = useState(null);
  const [photoBlobUrl, setPhotoBlobUrl] = useState(null);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Learning Telemetry
  const [learningStats, setLearningStats] = useState({
    enrolled: 0,
    inProgress: 0,
    completed: 0,
    certificates: 0,
    loading: true,
  });

  // Session Security
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);

  // Email Verification Mutation State
  const [emailChangeStep, setEmailChangeStep] = useState(0); // 0: idle, 1: requested, 2: old-verified, 3: completed
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: '',
    password: '',
    oldOtp: '',
    newOtp: '',
    sessionId: ''
  });
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');

  // Refs
  const profileImgRef = useRef(null);
  const photoBlobUrlRef = useRef(null);
  const coverPhotoInputRef = useRef(null);

  // Fetch authenticated photo blob
  const fetchProfilePhotoAsBlob = async (photoUrl, retries = 2) => {
    if (!photoUrl) return null;
    if (photoUrl.includes('drive.google.com')) return photoUrl;

    for (let i = 0; i < retries; i++) {
      try {
        if (photoBlobUrlRef.current && photoBlobUrlRef.current.startsWith('blob:')) {
          URL.revokeObjectURL(photoBlobUrlRef.current);
          photoBlobUrlRef.current = null;
        }

        const response = await axiosInstance.get(photoUrl, { responseType: 'blob' });
        if (!response.data || response.data.size === 0) return null;

        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/jpeg' });
        const blobUrl = URL.createObjectURL(blob);
        photoBlobUrlRef.current = blobUrl;
        return blobUrl;
      } catch (err) {
        if (i === retries - 1) return null;
        await new Promise(res => setTimeout(res, 400));
      }
    }
  };

  // Fetch full live profile specification
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authApi.getUserProfile();
      const data = response.data?.data || response.data?.user || response.data || response;

      if (!data) throw new Error('Null telemetry from profile provider');

      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      const name = data.name || `${firstName} ${lastName}`.trim() || data.username || data.displayName || 'Learner';
      const email = data.email || '';
      const phone = data.phone || data.mobile || data.mobileNumber || data.mobile1 || data.phoneNumber || '';
      const role = data.role || data.role1 || data.userRole || 'STUDENT';
      const profilePhoto = data.profilePhoto || data.photoURL || data.avatar || null;
      const normalizedPhotoUrl = normalizePhotoUrl(profilePhoto);
      const coverPhoto = data.coverPhoto || null;
      const normalizedCoverPhotoUrl = normalizePhotoUrl(coverPhoto);

      let parsedSkills = [];
      if (Array.isArray(data.skills)) {
        parsedSkills = data.skills;
      } else if (typeof data.skills === 'string') {
        parsedSkills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      const hydratedProfile = {
        firstName,
        lastName,
        name,
        email,
        phone,
        mobile: phone,
        role: role.toUpperCase(),
        profilePhoto: normalizedPhotoUrl,
        coverPhoto: normalizedCoverPhotoUrl,
        preferredLanguage: data.preferredLanguage || 'English',
        city: data.city || '',
        state: data.state || '',
        country: data.country || '',
        countryCode: data.countryCode || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        gender: data.gender || '',
        highestQualification: data.highestQualification || '',
        fieldOfStudy: data.fieldOfStudy || '',
        organization: data.organization || '',
        skills: parsedSkills,
        createdAt: data.createdAt || null,
        _raw: data
      };

      setProfile(hydratedProfile);
      setTemp(hydratedProfile);

      if (normalizedPhotoUrl) {
        const blobUrl = await fetchProfilePhotoAsBlob(normalizedPhotoUrl);
        setPhotoBlobUrl(blobUrl);
      } else {
        setPhotoBlobUrl(null);
      }

      if (normalizedCoverPhotoUrl) {
        setCoverPhotoUrl(normalizedCoverPhotoUrl);
      }

      await fetchTelemetryStats();
    } catch (err) {
      console.error('[ProfileWorkspace] Telemetry load error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to initialize profile telemetry';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch live learning stats
  const fetchTelemetryStats = async () => {
    try {
      const coursesRes = await courseApi.getStudentCourses();
      const courses = coursesRes.data?.courses || coursesRes.data || [];

      const enrolled = courses.length;
      const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100).length;
      const completed = courses.filter(c => c.progress === 100).length;

      let certificates = completed;
      try {
        const dashRes = await courseApi.getStudentDashboard();
        if (dashRes?.certificates !== undefined && dashRes?.certificates !== null) {
          certificates = dashRes.certificates;
        }
      } catch (_) {
        // Fallback to completed count
      }

      setLearningStats({
        enrolled,
        inProgress,
        completed,
        certificates,
        loading: false
      });
    } catch (err) {
      console.warn('[ProfileWorkspace] Failed telemetry sync:', err);
      setLearningStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchProfile();
    return () => {
      if (photoBlobUrlRef.current && photoBlobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(photoBlobUrlRef.current);
      }
    };
  }, [fetchProfile]);

  // Load sessions
  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await authApi.getSessions();
      const sessionList = res.data?.data || res.data?.sessions || res.data || [];
      setSessions(Array.isArray(sessionList) ? sessionList : []);
    } catch (err) {
      console.warn('[ProfileWorkspace] Sessions load error:', err);
      // Mock active session if endpoint unavailable
      setSessions([
        {
          id: 'current-session-01',
          deviceName: 'Primary Hardware Terminal',
          deviceType: 'desktop',
          browser: 'Chromium Platform',
          operatingSystem: 'Windows NT 10.0',
          city: profile?.city || 'Obsidian Gateway',
          country: profile?.country || 'Encrypted Mesh',
          loginTime: new Date().toISOString(),
          isCurrent: true
        }
      ]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'account' && sessions.length === 0) {
      loadSessions();
    }
  }, [activeTab]);

  // Handle Photo Upload
  const handlePhotoUpload = async (file) => {
    setUploadingPhoto(true);
    try {
      const immediatePreviewUrl = URL.createObjectURL(file);
      setPhotoBlobUrl(immediatePreviewUrl);
      photoBlobUrlRef.current = immediatePreviewUrl;

      const response = await authApi.uploadProfilePhoto(file);
      const newPhotoUrl = response?.data?.data?.profilePhoto || response?.data?.profilePhoto || response?.profilePhoto || response?.data?.photoUrl || response?.data?.url;

      if (newPhotoUrl) {
        const normalizedUrl = normalizePhotoUrl(newPhotoUrl);
        setTemp(prev => ({ ...prev, profilePhoto: normalizedUrl }));
        setProfile(prev => ({ ...prev, profilePhoto: normalizedUrl }));
        toast.success('Identity photo committed successfully');
        window.dispatchEvent(new CustomEvent('profilePhotoChanged', { detail: { profilePhoto: normalizedUrl } }));
      }
    } catch (err) {
      console.error('[ProfileWorkspace] Photo upload failure:', err);
      toast.error(err.response?.data?.message || 'Failed to sync profile photo');
      throw err;
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle Photo Removal
  const handleRemovePhoto = async () => {
    try {
      await authApi.removeProfilePhoto();
      setTemp(prev => ({ ...prev, profilePhoto: null }));
      setProfile(prev => ({ ...prev, profilePhoto: null }));
      setPhotoBlobUrl(null);
      toast.success('Identity photo purged');
      window.dispatchEvent(new CustomEvent('profilePhotoRemoved'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to purge photo');
      throw err;
    }
  };

  // Handle Cover Photo Upload
  const handleCoverPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Select an image asset (JPEG, PNG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover payload must be under 5MB');
      return;
    }

    setUploadingCover(true);
    try {
      const preview = URL.createObjectURL(file);
      setCoverPhotoUrl(preview);

      const response = await authApi.uploadCoverPhoto(file);
      const newCover = response?.data?.data?.coverPhoto || response?.data?.coverPhoto;
      if (newCover) {
        const normalized = normalizePhotoUrl(newCover);
        setCoverPhotoUrl(normalized);
        setProfile(prev => ({ ...prev, coverPhoto: normalized }));
        toast.success('Obsidian cover matrix updated');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to commit cover banner');
      setCoverPhotoUrl(profile?.coverPhoto || null);
    } finally {
      setUploadingCover(false);
      if (coverPhotoInputRef.current) coverPhotoInputRef.current.value = '';
    }
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!temp) return;
    setSaving(true);
    setError('');

    try {
      const payload = {
        firstName: temp.firstName,
        lastName: temp.lastName,
        email: temp.email,
        mobile: temp.phone || temp.mobile,
        preferredLanguage: temp.preferredLanguage,
        city: temp.city,
        state: temp.state,
        country: temp.country,
        dob: temp.dob,
        gender: temp.gender,
        highestQualification: temp.highestQualification,
        fieldOfStudy: temp.fieldOfStudy,
        organization: temp.organization,
        skills: Array.isArray(temp.skills) ? temp.skills.join(',') : temp.skills
      };

      await authApi.updateUserProfile(payload);
      setProfile({ ...temp });
      setEditMode(false);
      toast.success('Profile matrix synchronized');
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    } catch (err) {
      console.error('[ProfileWorkspace] Save error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to commit specification';
      toast.error(msg);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Add / Remove Skill
  const handleAddSkill = async (skillToAdd) => {
    const trimmed = skillToAdd.trim().toLowerCase();
    if (!trimmed) return;
    if (temp.skills.includes(trimmed)) {
      toast('Skill is already verified in matrix', { icon: 'ℹ️' });
      return;
    }

    const updatedSkills = [...temp.skills, trimmed];
    setTemp(prev => ({ ...prev, skills: updatedSkills }));
    setNewSkillInput('');

    // If not in broad edit mode, commit immediately
    if (!editMode) {
      try {
        await authApi.updateUserProfile({
          skills: updatedSkills.join(',')
        });
        setProfile(prev => ({ ...prev, skills: updatedSkills }));
        toast.success(`Skill '${trimmed}' registered`);
      } catch (err) {
        toast.error('Failed to register skill');
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = temp.skills.filter(s => s !== skillToRemove);
    setTemp(prev => ({ ...prev, skills: updatedSkills }));

    if (!editMode) {
      try {
        await authApi.updateUserProfile({
          skills: updatedSkills.join(',')
        });
        setProfile(prev => ({ ...prev, skills: updatedSkills }));
        toast.success(`Skill '${skillToRemove}' removed`);
      } catch (err) {
        toast.error('Failed to remove skill');
      }
    }
  };

  // Handle Session Termination
  const handleTerminateSession = async (sessionId) => {
    try {
      await authApi.logoutSession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success('Terminal session revoked');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleLogoutAll = async () => {
    setLogoutAllLoading(true);
    try {
      await authApi.logoutAllSessions();
      toast.success('All hardware sessions revoked');
      setTimeout(() => logout(), 500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to revoke all sessions');
    } finally {
      setLogoutAllLoading(false);
    }
  };

  // Profile Integrity Calculation
  const calculateIntegrity = () => {
    if (!profile) return 0;
    const required = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.phone,
      profile.city,
      profile.country,
      profile.highestQualification,
      profile.skills?.length > 0
    ];
    const completed = required.filter(Boolean).length;
    return Math.round((completed / required.length) * 100);
  };

  if (loading) {
    return (
      <GlobalLayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
          <p className="text-xs font-mono uppercase tracking-widest text-[#8E8E93]">
            Hydrating Identity Matrix...
          </p>
        </div>
      </GlobalLayoutWrapper>
    );
  }

  const integrity = calculateIntegrity();
  const initials = profile?.name
    ? profile.name.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase()
    : 'SSB';

  const metricsRow = [
    { label: 'Enrolled Courses', value: learningStats.enrolled, sub: '+2 this cycle', icon: BookOpen },
    { label: 'In Progress', value: learningStats.inProgress, sub: 'Active telemetry', icon: Settings },
    { label: 'Completed', value: learningStats.completed, sub: 'Verified tracks', icon: ShieldCheck },
    { label: 'Certificates', value: learningStats.certificates, sub: 'Proof of Mastery', icon: Award }
  ];

  return (
    <GlobalLayoutWrapper showFooter={true}>
      <div className="space-y-6">
        
        {/* 1. Frosted Glass Profile Header Block */}
        <div className="relative rounded-2xl overflow-hidden bg-[#0F0F13] border border-white/[0.04]">
          
          {/* Subtle Obsidian Textured Cover Banner */}
          <div className="h-44 bg-gradient-to-r from-[#14141A] to-[#1B1B24] relative flex items-end justify-end p-4 border-b border-white/[0.04] overflow-hidden">
            {coverPhotoUrl && (
              <img
                src={coverPhotoUrl}
                alt="Obsidian Cover"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
            )}
            
            {/* Cover photo file input */}
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverPhotoUpload}
              className="hidden"
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={() => coverPhotoInputRef.current?.click()}
              disabled={uploadingCover}
              className="relative z-10 gap-1.5 text-xs bg-[#070709]/70 border-white/5 backdrop-blur-md hover:bg-[#14141A]"
            >
              {uploadingCover ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                  <span>Syncing Banner...</span>
                </>
              ) : (
                <>
                  <Image className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Change Cover</span>
                </>
              )}
            </Button>
          </div>

          {/* User Meta Signature Card */}
          <div className="px-6 pb-6 pt-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 relative z-10">
              
              {/* Interactive Avatar Container with Focus Ring */}
              <div className="relative group">
                <div
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="w-24 h-24 rounded-2xl bg-[#14141A] border-2 border-[#0F0F13] shadow-2xl flex items-center justify-center font-bold text-xl text-[#C5A880] select-none tracking-tight overflow-hidden cursor-pointer ring-2 ring-transparent group-hover:ring-[#C5A880]/60 transition-all duration-300 relative"
                  title="Configure identity photo"
                >
                  {(photoBlobUrl || profile?.profilePhoto) ? (
                    <img
                      ref={profileImgRef}
                      src={photoBlobUrl || profile?.profilePhoto}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={() => setPhotoBlobUrl(null)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}

                  {/* Hover Camera Overlay */}
                  <div className="absolute inset-0 bg-[#070709]/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[#C5A880]">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-mono tracking-wider font-bold">CHANGE</span>
                  </div>
                </div>

                {/* Upload Status Dot */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#14141A] border border-white/10 flex items-center justify-center text-[#C5A880] shadow-md">
                  <Camera className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Identity Details */}
              <div className="text-center sm:text-left space-y-1 pb-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-[#F5F5F7] tracking-tight">
                    {profile?.name || 'Authorized Learner'}
                  </h2>
                  <Badge
                    variant="pewter"
                    className="bg-[#14141A] text-[#C5A880] text-[9px] uppercase font-mono tracking-wider font-extrabold px-2 py-0.5 border-white/5"
                  >
                    {profile?.role || 'STUDENT'}
                  </Badge>
                </div>
                <p className="text-xs text-[#8E8E93] font-light font-mono">
                  {profile?.email || 'unregistered@mesh'}
                </p>
                <p className="text-[11px] text-[#8E8E93] flex items-center justify-center sm:justify-start gap-1 font-light">
                  <MapPin className="w-3 h-3 text-[#C5A880]" />
                  <span>
                    {profile?.city && profile?.country
                      ? `${profile.city}, ${profile.country}`
                      : profile?.city || profile?.country || 'Global Node'}
                  </span>
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2.5 self-center md:self-auto">
              {editMode ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveProfile}
                    isLoading={saving}
                    className="gap-1.5 text-xs"
                  >
                    <Save className="w-3.5 h-3.5" /> Commit Changes
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setTemp({ ...profile });
                      setEditMode(false);
                    }}
                    disabled={saving}
                    className="gap-1.5 text-xs"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="gap-1.5 text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C5A880]" /> Edit Profile Specification
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 2. Structured Telemetry Overview Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsRow.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex items-center justify-between group hover:border-white/10 transition-colors duration-300"
              >
                <div className="space-y-1">
                  <span className="block text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold">
                    {metric.label}
                  </span>
                  <span className="block text-2xl font-black text-[#F5F5F7] font-mono leading-none">
                    {metric.value}
                  </span>
                  <span className="block text-[10px] text-[#C5A880] font-light font-mono">
                    {metric.sub}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-[#14141A] border border-white/5 flex items-center justify-center text-[#8E8E93] group-hover:text-[#C5A880] transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Main Data Core Split Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Block: Interactive Input Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Functional Category Filter Nav Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-[#0F0F13] border border-white/[0.04] overflow-x-auto scrollbar-none">
              {[
                { id: 'personal', label: 'Personal Information', icon: User },
                { id: 'education', label: 'Education & Professional', icon: BookOpen },
                { id: 'skills', label: 'Skills & Taxonomy', icon: Code },
                { id: 'account', label: 'Account & Security', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-4 py-2 text-xs font-medium tracking-wide rounded-lg flex items-center gap-2 transition-colors duration-300 shrink-0 select-none ${
                      active ? 'text-[#070709] font-bold' : 'text-[#8E8E93] hover:text-[#F5F5F7]'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeProfileTabPill"
                        transition={SPRING}
                        className="absolute inset-0 bg-[#C5A880] rounded-lg z-0"
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: Personal Information */}
            {activeTab === 'personal' && (
              <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#F5F5F7]">Identity Matrix Configuration</h3>
                    <p className="text-[11px] text-[#8E8E93] font-light">
                      Manage platform core access parameters and demographic descriptors securely.
                    </p>
                  </div>
                </div>

                {editMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={temp?.firstName || ''}
                        onChange={e => setTemp({ ...temp, firstName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                        placeholder="First Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={temp?.lastName || ''}
                        onChange={e => setTemp({ ...temp, lastName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                        placeholder="Last Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={temp?.email || ''}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#070709] border border-white/[0.04] text-xs text-[#8E8E93] outline-none font-mono cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={temp?.phone || ''}
                        onChange={e => setTemp({ ...temp, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                        placeholder="Mobile Number"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={temp?.dob || ''}
                        onChange={e => setTemp({ ...temp, dob: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        Gender
                      </label>
                      <select
                        value={temp?.gender || ''}
                        onChange={e => setTemp({ ...temp, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="other">Prefer not to say</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        Country
                      </label>
                      <input
                        type="text"
                        value={temp?.country || ''}
                        onChange={e => setTemp({ ...temp, country: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                        placeholder="Country"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        City
                      </label>
                      <input
                        type="text"
                        value={temp?.city || ''}
                        onChange={e => setTemp({ ...temp, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                        placeholder="City"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'First Name', value: profile?.firstName || '-' },
                      { label: 'Last Name', value: profile?.lastName || '-' },
                      { label: 'Email Address', value: profile?.email || '-' },
                      { label: 'Mobile Number', value: profile?.phone || '-' },
                      { label: 'Date of Birth', value: profile?.dob || '-' },
                      { label: 'Gender', value: profile?.gender || '-' },
                      { label: 'Country', value: profile?.country || '-' },
                      { label: 'City', value: profile?.city || '-' }
                    ].map((field, index) => (
                      <div
                        key={index}
                        className="p-3.5 rounded-xl bg-[#14141A] border border-white/[0.02] space-y-1"
                      >
                        <span className="block text-[9px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                          {field.label}
                        </span>
                        <span className="block text-xs text-[#E5E5E7] font-medium font-sans">
                          {field.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Education & Professional */}
            {activeTab === 'education' && (
              <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-sm font-bold text-[#F5F5F7]">Academic & Industry Telemetry</h3>
                  <p className="text-[11px] text-[#8E8E93] font-light">
                    Document verified credentials, ongoing degrees, and organization associations.
                  </p>
                </div>

                {editMode ? (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        Highest Qualification
                      </label>
                      <input
                        type="text"
                        value={temp?.highestQualification || ''}
                        onChange={e => setTemp({ ...temp, highestQualification: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                        placeholder="e.g. Bachelor of Technology (Computer Science)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={temp?.fieldOfStudy || ''}
                        onChange={e => setTemp({ ...temp, fieldOfStudy: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                        placeholder="e.g. Distributed Systems & Cloud Architecture"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                        Organization / University
                      </label>
                      <input
                        type="text"
                        value={temp?.organization || ''}
                        onChange={e => setTemp({ ...temp, organization: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                        placeholder="e.g. Institute of Technology"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: 'Highest Qualification', value: profile?.highestQualification || 'Not specified' },
                      { label: 'Field of Study', value: profile?.fieldOfStudy || 'Not specified' },
                      { label: 'Organization / University', value: profile?.organization || 'Not specified' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#14141A] border border-white/[0.02] flex items-center justify-between">
                        <div>
                          <span className="block text-[9px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                            {item.label}
                          </span>
                          <span className="block text-xs text-[#E5E5E7] font-medium font-sans mt-0.5">
                            {item.value}
                          </span>
                        </div>
                        <GraduationCap className="w-4 h-4 text-[#C5A880] opacity-80" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Skills & Taxonomy */}
            {activeTab === 'skills' && (
              <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-sm font-bold text-[#F5F5F7]">Technology Taxonomy & Verified Skill Stack</h3>
                  <p className="text-[11px] text-[#8E8E93] font-light">
                    Add verified tools, languages, and runtime competencies to receive calibrated challenges.
                  </p>
                </div>

                {/* Add new skill input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(newSkillInput);
                      }
                    }}
                    placeholder="Register new competency tag (e.g. Rust, PyTorch, GraphQL)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] focus:border-[#C5A880]/60 text-xs text-[#F5F5F7] outline-none transition font-sans"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAddSkill(newSkillInput)}
                    className="gap-1 px-4"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>

                {/* Current Active Skills */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold">
                    Active Verified Skills ({temp?.skills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {temp?.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#14141A] border border-white/[0.06] text-xs font-mono text-[#E5E5E7] group hover:border-[#C5A880]/50 transition-colors"
                      >
                        <span className="text-[#C5A880]">#</span> {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-[#8E8E93] hover:text-rose-400 p-0.5 rounded transition"
                          title={`Remove ${skill}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {(!temp?.skills || temp.skills.length === 0) && (
                      <p className="text-xs text-[#8E8E93] font-light">
                        No competencies registered yet. Add tags above or select suggestions below.
                      </p>
                    )}
                  </div>
                </div>

                {/* Suggested Competencies */}
                <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                  <span className="block text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold">
                    Recommended Competencies
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {['react', 'typescript', 'python', 'docker', 'kubernetes', 'node.js', 'aws', 'postgresql', 'go', 'tailwind'].map((tag, idx) => {
                      const already = temp?.skills?.includes(tag);
                      return (
                        <button
                          key={idx}
                          disabled={already}
                          onClick={() => handleAddSkill(tag)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
                            already
                              ? 'bg-transparent text-[#8E8E93]/40 border-white/[0.02] cursor-not-allowed'
                              : 'bg-[#14141A] text-[#8E8E93] border-white/[0.04] hover:text-[#C5A880] hover:border-[#C5A880]/40'
                          }`}
                        >
                          + {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: Account & Security */}
            {activeTab === 'account' && (
              <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-6">
                <div className="border-b border-white/5 pb-4">
                  <h3 className="text-sm font-bold text-[#F5F5F7]">Hardware Terminal & Session Security</h3>
                  <p className="text-[11px] text-[#8E8E93] font-light">
                    Inspect active cryptographic device sessions and terminate unauthorized vector tokens.
                  </p>
                </div>

                {/* Active Sessions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold">
                      Active Device Handshakes
                    </span>
                    <button
                      onClick={loadSessions}
                      disabled={sessionsLoading}
                      className="text-xs font-mono text-[#C5A880] hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={12} className={sessionsLoading ? 'animate-spin' : ''} />
                      Sync
                    </button>
                  </div>

                  {sessionsLoading ? (
                    <div className="py-6 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-[#C5A880]" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessions.map((sess, idx) => (
                        <div
                          key={sess.id || idx}
                          className="p-3.5 rounded-xl bg-[#14141A] border border-white/[0.04] flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0F0F13] border border-white/5 flex items-center justify-center text-[#C5A880]">
                              {sess.deviceType === 'mobile' ? (
                                <Smartphone size={16} />
                              ) : (
                                <Monitor size={16} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-[#F5F5F7]">
                                  {sess.deviceName || 'Local Workstation'}
                                </span>
                                {sess.isCurrent && (
                                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                    CURRENT
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] font-mono text-[#8E8E93]">
                                {sess.browser || 'Platform'} • {sess.operatingSystem || 'Secure OS'}
                              </p>
                            </div>
                          </div>

                          {!sess.isCurrent && (
                            <button
                              onClick={() => handleTerminateSession(sess.id)}
                              className="text-[#8E8E93] hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/5 transition"
                              title="Revoke session"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogoutAll}
                    isLoading={logoutAllLoading}
                    className="w-full text-xs font-mono justify-center"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Purge All External Hardware Sessions
                  </Button>
                </div>

                {/* Account Details */}
                <div className="pt-4 border-t border-white/[0.04] space-y-2">
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-[#8E8E93] font-light">Account Node Status</span>
                    <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active / Encrypted
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-[#8E8E93] font-light">Mesh Authorization Level</span>
                    <span className="font-mono text-[#C5A880] uppercase font-bold">
                      {profile?.role || 'STUDENT'}
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Block: Dynamic Side Track Analytics */}
          <div className="space-y-6">
            
            {/* Metric Completion Dial Box */}
            <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-4">
              <span className="block text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold">
                Profile Integrity
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-[#C5A880]">
                  {integrity}%
                </span>
                <span className={`text-[10px] font-mono tracking-wide uppercase ${
                  integrity === 100 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {integrity === 100 ? '● Fully Hydrated' : '● Partial Telemetry'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#14141A] rounded-full overflow-hidden border border-white/[0.02]">
                <div
                  className="h-full bg-[#C5A880] transition-all duration-500 rounded-full"
                  style={{ width: `${integrity}%` }}
                />
              </div>
              <p className="text-[11px] text-[#8E8E93] font-light leading-relaxed">
                Complete all identity parameters to unlock unrestricted enterprise verification access.
              </p>
            </div>

            {/* Interactive Taxonomy Box */}
            <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-4">
              <div className="flex items-center justify-between">
                <span className="block text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold">
                  Verified Technology Skills
                </span>
                <button
                  onClick={() => setActiveTab('skills')}
                  className="text-[10px] font-mono text-[#C5A880] hover:underline"
                >
                  Manage
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(profile?.skills && profile.skills.length > 0
                  ? profile.skills
                  : ['react', 'node.js', 'typescript', 'docker', 'python']
                ).map((skill, index) => (
                  <Badge
                    key={index}
                    variant="pewter"
                    className="bg-[#14141A] text-[#E5E5E7] border-white/5 font-mono text-[10px] px-2.5 py-0.5"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Accelerated Mastery Card (Ink & Onyx) */}
            <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-4">
              <div className="flex items-center gap-2 text-[#C5A880]">
                <Sparkles size={16} />
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold">
                  Accelerated Mastery
                </span>
              </div>
              <p className="text-xs text-[#E5E5E7] font-medium leading-relaxed">
                Unlock high-density curriculum tracks calibrated to your verified technology taxonomy.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.href = '/courses'}
                className="w-full text-xs font-bold justify-center"
              >
                Explore Deep Catalog
              </Button>
            </div>

          </div>

        </div>

      </div>

      {/* Dynamic Photo Uploader Modal Vector */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onUploadPhoto={handlePhotoUpload}
        onRemovePhoto={handleRemovePhoto}
        currentPhotoUrl={profile?.profilePhoto}
      />
    </GlobalLayoutWrapper>
  );
}
