import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Save,
  LogOut,
  Loader2,
  AlertCircle,
  MapPin,
  Globe,
  Camera,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
  Shield,
  Edit2,
  X,
  UploadCloud,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

const AdminProfile = () => {
  const { logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [profile, setProfile] = useState(null);
  const [temp, setTemp] = useState(null);
  const [error, setError] = useState("");

  const photoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Fetch admin profile
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.getAdminProfile();
      const data = response?.data?.admin || response?.data?.data || response?.data || response;

      if (!data) {
        throw new Error("No profile data received from server");
      }

      const mappedProfile = {
        id: data.id || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        fullName: [data.firstName, data.lastName].filter(Boolean).join(" ") || data.name || "Administrator",
        email: data.email || "",
        phone: data.mobileNumber || data.phone || data.mobile || "",
        role: data.role || data.adminType || "MAIN_ADMIN",
        adminType: data.adminType || data.role || "ADMIN",
        profilePhoto: data.profilePhoto || null,
        coverPhoto: data.coverPhoto || null,
        preferredLanguage: data.preferredLanguage || "EN",
        city: data.city || "",
        state: data.state || "",
        country: data.country || "",
      };

      setProfile(mappedProfile);
      setTemp(mappedProfile);
    } catch (err) {
      console.error("[AdminProfile] Fetch error:", err);
      const msg = err?.response?.data?.message || err.message || "Failed to load profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Save profile personal info
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!temp) return;

    setSaving(true);
    try {
      const payload = {
        firstName: temp.firstName?.trim() || "",
        lastName: temp.lastName?.trim() || "",
        mobileNumber: temp.phone?.trim() || "",
        preferredLanguage: temp.preferredLanguage || "EN",
        city: temp.city?.trim() || "",
        state: temp.state?.trim() || "",
        country: temp.country?.trim() || "",
      };

      const response = await adminApi.updateAdminProfile(payload);
      const updatedAdmin = response?.data?.admin || response?.data || {};

      const updated = {
        ...temp,
        firstName: updatedAdmin.firstName || temp.firstName,
        lastName: updatedAdmin.lastName || temp.lastName,
        fullName: [updatedAdmin.firstName || temp.firstName, updatedAdmin.lastName || temp.lastName].filter(Boolean).join(" "),
        phone: updatedAdmin.mobileNumber || temp.phone,
        preferredLanguage: updatedAdmin.preferredLanguage || temp.preferredLanguage,
        city: updatedAdmin.city || temp.city,
        state: updatedAdmin.state || temp.state,
        country: updatedAdmin.country || temp.country,
      };

      setProfile(updated);
      setTemp(updated);
      setEditMode(false);
      toast.success("Profile updated successfully!");

      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: updated }));
    } catch (err) {
      console.error("[AdminProfile] Save error:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Upload Profile Photo
  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPEG, PNG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setUploadingPhoto(true);
    const toastId = toast.loading("Uploading profile photo...");
    try {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("file", file);

      const res = await adminApi.uploadProfilePhoto(formData);
      const newPhoto = res?.data?.admin?.profilePhoto || res?.data?.profilePhoto || res?.profilePhoto;

      setProfile((prev) => ({ ...prev, profilePhoto: newPhoto }));
      setTemp((prev) => ({ ...prev, profilePhoto: newPhoto }));
      toast.success("Profile photo updated successfully!", { id: toastId });

      window.dispatchEvent(new CustomEvent("profilePhotoChanged", { detail: { profilePhoto: newPhoto } }));
    } catch (err) {
      console.error("[AdminProfile] Photo upload failed:", err);
      toast.error(err?.response?.data?.message || "Failed to upload profile photo", { id: toastId });
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  // Remove Profile Photo
  const handleRemovePhoto = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;
    setUploadingPhoto(true);
    const toastId = toast.loading("Removing profile photo...");
    try {
      await adminApi.deleteProfilePhoto();
      setProfile((prev) => ({ ...prev, profilePhoto: null }));
      setTemp((prev) => ({ ...prev, profilePhoto: null }));
      toast.success("Profile photo removed successfully", { id: toastId });

      window.dispatchEvent(new CustomEvent("profilePhotoRemoved"));
    } catch (err) {
      console.error("[AdminProfile] Remove photo failed:", err);
      toast.error(err?.response?.data?.message || "Failed to remove photo", { id: toastId });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Upload Cover Photo
  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPEG, PNG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image size must be less than 10MB");
      return;
    }

    setUploadingCover(true);
    const toastId = toast.loading("Uploading cover photo...");
    try {
      const formData = new FormData();
      formData.append("coverPhoto", file);
      formData.append("file", file);

      const res = await adminApi.uploadCoverPhoto(formData);
      const newCover = res?.data?.admin?.coverPhoto || res?.data?.coverPhoto || res?.coverPhoto;

      setProfile((prev) => ({ ...prev, coverPhoto: newCover }));
      setTemp((prev) => ({ ...prev, coverPhoto: newCover }));
      toast.success("Cover photo updated successfully!", { id: toastId });

      window.dispatchEvent(new CustomEvent("coverPhotoChanged", { detail: { coverPhoto: newCover } }));
    } catch (err) {
      console.error("[AdminProfile] Cover upload failed:", err);
      toast.error(err?.response?.data?.message || "Failed to upload cover photo", { id: toastId });
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Remove Cover Photo
  const handleRemoveCoverPhoto = async () => {
    if (!confirm("Are you sure you want to remove your cover photo?")) return;
    setUploadingCover(true);
    const toastId = toast.loading("Removing cover photo...");
    try {
      await adminApi.deleteCoverPhoto();
      setProfile((prev) => ({ ...prev, coverPhoto: null }));
      setTemp((prev) => ({ ...prev, coverPhoto: null }));
      toast.success("Cover photo removed successfully", { id: toastId });
    } catch (err) {
      console.error("[AdminProfile] Remove cover failed:", err);
      toast.error(err?.response?.data?.message || "Failed to remove cover photo", { id: toastId });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      window.location.href = "/admin/login";
    } catch (err) {
      console.error("[AdminProfile] Logout error:", err);
      window.location.href = "/admin/login";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <Loader2 className="w-10 h-10 text-[#5B3E57] dark:text-[#D1A7CC] animate-spin" />
        <p className="text-zinc-400 text-sm font-medium tracking-wide">Loading Admin Workspace...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-red-500/30 rounded-2xl text-center space-y-4 shadow-xl">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-lg font-semibold text-zinc-100">Profile Synchronization Error</h3>
        <p className="text-sm text-zinc-400">{error}</p>
        <button
          onClick={fetchProfile}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5B3E57] dark:bg-[#D1A7CC] text-black font-semibold rounded-xl hover:bg-[#d8bd95] transition"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8 pb-16"
    >
      {/* Page Title & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Admin Profile Management
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your administrator credentials, personal attributes, and workspace branding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-full uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            {profile?.role || "ADMIN"}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Cover Photo Banner Section */}
        <div className="relative h-56 sm:h-64 w-full bg-gradient-to-r from-[#EAE5DC] via-[#F2ECF1] to-[#E3DCD3] dark:from-[#1D1C1A] dark:to-[#151413] overflow-hidden group">
          {profile?.coverPhoto ? (
            <img
              src={profile.coverPhoto}
              alt="Admin Workspace Cover"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-900/60 backdrop-blur-sm">
              <ImageIcon className="w-12 h-12 mb-2 stroke-[1.5]" />
              <span className="text-xs font-medium tracking-wide">No cover banner set</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Cover Photo Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <input
              type="file"
              ref={coverInputRef}
              onChange={handleCoverPhotoChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-black/60 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white text-xs font-medium rounded-xl transition duration-200 shadow-lg disabled:opacity-50"
              title="Upload or change cover banner"
            >
              {uploadingCover ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5B3E57] dark:text-[#D1A7CC]" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC]" />
              )}
              <span>{profile?.coverPhoto ? "Change Cover" : "Add Cover"}</span>
            </button>

            {profile?.coverPhoto && (
              <button
                type="button"
                onClick={handleRemoveCoverPhoto}
                disabled={uploadingCover}
                className="p-2 bg-black/60 hover:bg-red-500/80 backdrop-blur-md border border-white/20 text-zinc-300 hover:text-white rounded-xl transition duration-200 shadow-lg disabled:opacity-50"
                title="Remove cover photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Profile Avatar & Header Row */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="flex items-end gap-5">
              {/* Profile Avatar */}
              <div className="relative group">
                <input
                  type="file"
                  ref={photoInputRef}
                  onChange={handleProfilePhotoChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border-4 border-[#FFFEFA] dark:border-[#1D1C1A] shadow-2xl overflow-hidden flex items-center justify-center relative">
                  {profile?.profilePhoto ? (
                    <img
                      src={profile.profilePhoto}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#1E1E2A] to-[#2B2B3D] flex items-center justify-center text-4xl font-bold text-[#5B3E57] dark:text-[#D1A7CC]">
                      {profile?.firstName?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || "A"}
                    </div>
                  )}

                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-xs">
                      <Loader2 className="w-8 h-8 text-[#5B3E57] dark:text-[#D1A7CC] animate-spin" />
                    </div>
                  )}
                </div>

                {/* Avatar Action Trigger */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-1 right-1 p-2 bg-[#5B3E57] dark:bg-[#D1A7CC] hover:bg-[#d8bd95] text-black rounded-xl shadow-lg border border-black/40 transition duration-200 hover:scale-105"
                  title="Upload / Change profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Title & Email Info */}
              <div className="space-y-1 mb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {profile?.fullName || "Administrator"}
                  </h2>
                  {profile?.profilePhoto && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      className="text-xs text-zinc-500 hover:text-red-400 transition"
                      title="Remove profile photo"
                    >
                      (remove photo)
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    {profile?.email}
                  </span>
                  {profile?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      {profile.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Edit / Cancel Toggle Button */}
            <div className="flex items-center gap-3">
              {!editMode ? (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800/80 hover:bg-zinc-700 text-white font-medium text-sm rounded-xl border border-zinc-700/60 transition shadow-sm"
                >
                  <Edit2 className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setTemp(profile);
                    setEditMode(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-800 text-zinc-300 hover:text-white text-sm font-medium rounded-xl border border-zinc-700 transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Profile Details or Edit Form */}
          <div className="border-t border-zinc-800/80 pt-6 mt-6">
            {!editMode ? (
              /* View Mode */
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#14141B] border border-zinc-800/60 space-y-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">First Name</span>
                    <p className="text-sm font-semibold text-zinc-200">{profile?.firstName || "—"}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#14141B] border border-zinc-800/60 space-y-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Last Name</span>
                    <p className="text-sm font-semibold text-zinc-200">{profile?.lastName || "—"}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#14141B] border border-zinc-800/60 space-y-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email Address</span>
                    <p className="text-sm font-semibold text-zinc-200 truncate">{profile?.email || "—"}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#14141B] border border-zinc-800/60 space-y-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Mobile Number</span>
                    <p className="text-sm font-semibold text-zinc-200">{profile?.phone || "—"}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#14141B] border border-zinc-800/60 space-y-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Preferred Language</span>
                    <p className="text-sm font-semibold text-zinc-200">{profile?.preferredLanguage || "EN"}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#14141B] border border-zinc-800/60 space-y-1">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Location</span>
                    <p className="text-sm font-semibold text-zinc-200">
                      {[profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800/60">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-medium rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* Edit Form Mode */
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={temp.firstName || ""}
                      onChange={(e) => setTemp({ ...temp, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#14141B] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC] transition text-sm"
                      placeholder="e.g. Shiva"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={temp.lastName || ""}
                      onChange={(e) => setTemp({ ...temp, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#14141B] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC] transition text-sm"
                      placeholder="e.g. Sai"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Email Address (Locked)
                    </label>
                    <input
                      type="email"
                      value={temp.email || ""}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-[#121217] border border-zinc-800 text-zinc-500 text-sm cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={temp.phone || ""}
                      onChange={(e) => setTemp({ ...temp, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#14141B] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC] transition text-sm"
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Preferred Language
                    </label>
                    <select
                      value={temp.preferredLanguage || "EN"}
                      onChange={(e) => setTemp({ ...temp, preferredLanguage: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#14141B] border border-zinc-700/80 text-white focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC] transition text-sm"
                    >
                      <option value="EN">English (EN)</option>
                      <option value="ES">Spanish (ES)</option>
                      <option value="FR">French (FR)</option>
                      <option value="DE">German (DE)</option>
                      <option value="HI">Hindi (HI)</option>
                      <option value="TE">Telugu (TE)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={temp.city || ""}
                      onChange={(e) => setTemp({ ...temp, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#14141B] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC] transition text-sm"
                      placeholder="e.g. Hyderabad"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      State / Province
                    </label>
                    <input
                      type="text"
                      value={temp.state || ""}
                      onChange={(e) => setTemp({ ...temp, state: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#14141B] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC] transition text-sm"
                      placeholder="e.g. Telangana"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={temp.country || ""}
                      onChange={(e) => setTemp({ ...temp, country: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#14141B] border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC] transition text-sm"
                      placeholder="e.g. India"
                    />
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setTemp(profile);
                      setEditMode(false);
                    }}
                    className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-sm font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#5B3E57] dark:bg-[#D1A7CC] hover:bg-[#d8bd95] text-black font-semibold rounded-xl text-sm transition shadow-lg disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfile;
