// src/pages/admin/AdminProfile.jsx
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save, LogOut, Loader2, AlertCircle, MapPin, Globe, Image, Languages, Camera } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/adminApi";
import authApi from "../../api/authApi";
import toast from "react-hot-toast";

const AdminProfile = () => {
  const { logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState(null);
  const [temp, setTemp] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // ✅ Fetch profile data from API only
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[AdminProfile] Fetching profile from API...');
      
      const response = await adminApi.getAdminProfile();
      console.log('[AdminProfile] API Response:', response);
      console.log('[AdminProfile] Response.data:', response.data);
      console.log('[AdminProfile] Response.data.data:', response.data?.data);
      console.log('[AdminProfile] Response.data.admin:', response.data?.admin);
      
      // Handle different response structures
      const data = response.data?.admin || response.data?.data || response.data || response;
      
      console.log('[AdminProfile] Extracted data:', data);
      
      if (!data || Object.keys(data).length === 0) {
        throw new Error('No data received from API');
      }
      
      // ✅ Extract name - only from API
      const name = data.name || 
                   data.fullName || 
                   `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
                   data.username || 
                   data.displayName || 
                   null;
      
      // ✅ Extract email - only from API
      const email = data.email || null;
      
      // ✅ Extract phone - only from API
      const phone = data.phone || 
                    data.mobile || 
                    data.mobileNumber || 
                    data.mobile1 || 
                    data.phoneNumber || 
                    null;
      
      // ✅ Extract role - only from API
      const role = data.role || 
                   data.adminType ||
                   data.role1 || 
                   data.userRole || 
                   null;
      
      // ✅ Extract additional fields
      const profilePhoto = data.profilePhoto || null;
      const preferredLanguage = data.preferredLanguage || 'EN';
      const city = data.city || '';
      const state = data.state || '';
      const country = data.country || '';
      const firstName = data.firstName || '';
      const lastName = data.lastName || '';
      
      // ✅ If any required field is missing, throw error
      if (!name) {
        console.warn('[AdminProfile] Name not found in API response');
      }
      if (!email) {
        console.warn('[AdminProfile] Email not found in API response');
      }
      
      const profileData = {
        name: name || '',
        firstName: firstName,
        lastName: lastName,
        email: email || '',
        phone: phone || '',
        role: role || '',
        profilePhoto: profilePhoto,
        preferredLanguage: preferredLanguage,
        city: city,
        state: state,
        country: country,
        // Store raw data for debugging
        _raw: data
      };
      
      console.log('[AdminProfile] Profile data from API:', profileData);
      setProfile(profileData);
      setTemp(profileData);
      
    } catch (error) {
      console.error('[AdminProfile] API Error:', error);
      console.error('[AdminProfile] Error response:', error.response);
      
      let errorMessage = 'Failed to load profile';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        toast.error('Session expired. Please login again.');
        window.location.href = '/admin/login';
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

  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ Save profile to API only
  const handleSave = async () => {
    if (!temp) return;
    
    setSaving(true);
    setError("");
    try {
      console.log('[AdminProfile] Saving profile to API...');
      console.log('[AdminProfile] Data to save:', temp);
      
      // Map frontend fields to backend API field names
      const updateData = {
        firstName: temp.firstName,
        lastName: temp.lastName,
        email: temp.email,
        mobileNumber: temp.phone,
        // profilePhoto: temp.profilePhoto, // Removed due to 500 character limit validation
        preferredLanguage: temp.preferredLanguage,
        city: temp.city,
        state: temp.state,
        country: temp.country,
      };

      console.log('[AdminProfile] Update data being sent:', updateData);

      const response = await adminApi.updateAdminProfile(updateData);
      console.log('[AdminProfile] Update response:', response);

      setProfile(temp);
      setEditMode(false);
      toast.success('Profile updated successfully!');
      
      // ✅ Refresh profile data after update
      setTimeout(() => {
        fetchProfile();
        // Trigger navbar refresh
        window.dispatchEvent(new CustomEvent('profileUpdated'));
      }, 500);
      
    } catch (error) {
      console.error('[AdminProfile] Save error:', error);
      console.error('[AdminProfile] Error response:', error.response);
      console.error('[AdminProfile] Error response data:', error.response?.data);
      console.error('[AdminProfile] Error response data details:', error.response?.data?.details || error.response?.data?.errors);
      
      let errorMessage = 'Failed to update profile';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        toast.error('Session expired. Please login again.');
        window.location.href = '/admin/login';
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
        toast.error(error.message);
      } else {
        toast.error('Failed to update profile');
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('[AdminProfile] Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      console.log('[AdminProfile] Uploading profile photo to API...');
      
      // Try to upload via authApi (same endpoint works for both admin and user)
      const response = await authApi.uploadProfilePhoto(file);
      console.log('[AdminProfile] Photo upload response:', response);

      const newPhotoUrl =
        response?.data?.profilePhoto ||
        response?.profilePhoto ||
        response?.data?.photoUrl ||
        response?.data?.url;

      if (newPhotoUrl) {
        setTemp({...temp, profilePhoto: newPhotoUrl});
        toast.success('Profile photo uploaded successfully!');
      } else {
        toast.error('Failed to get photo URL from response');
      }
    } catch (error) {
      console.error('[AdminProfile] Photo upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state - Show error message when API fails
  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Profile</h3>
            <p className="text-gray-500 text-sm mb-4">{error || 'Profile data not available'}</p>
            <button
              onClick={fetchProfile}
              className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-sm text-gray-500">Manage your account information</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
            {profile.role || profile.adminType || "Admin"}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Profile
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={fetchProfile}
              className="text-sm text-red-600 hover:text-red-800 font-medium mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8">
          <div className="flex items-center gap-4">
            {profile.profilePhoto ? (
              <img 
                src={profile.profilePhoto} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover border-2 border-white/30 shadow-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-bold text-white shadow-lg" style={{display: profile.profilePhoto ? 'none' : 'flex'}}>
              {profile.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.name || "Admin"}</h2>
              <p className="text-orange-100 text-sm">{profile.role || profile.adminType || "Administrator"}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
        {!editMode ? (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="text-sm font-semibold text-gray-800">{profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : profile.name || "Not set"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Email Address</p>
                <p className="text-sm font-semibold text-gray-800">{profile.email || "Not set"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                <p className="text-sm font-semibold text-gray-800">{profile.phone || "Not set"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <p className="text-sm font-semibold text-gray-800">{profile.role || profile.adminType || "Not set"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Preferred Language</p>
                <p className="text-sm font-semibold text-gray-800">{profile.preferredLanguage || "EN"}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Location</p>
                <p className="text-sm font-semibold text-gray-800">
                  {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || "Not set"}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setEditMode(true)}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={temp.firstName || ''}
                  onChange={e => setTemp({...temp, firstName: e.target.value})}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={temp.lastName || ''}
                  onChange={e => setTemp({...temp, lastName: e.target.value})}
                  placeholder="Enter your last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                  value={temp.email || ''}
                  disabled
                  placeholder="Email cannot be changed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={temp.phone || ''}
                  onChange={e => setTemp({...temp, phone: e.target.value})}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Language
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={temp.preferredLanguage || 'EN'}
                  onChange={e => setTemp({...temp, preferredLanguage: e.target.value})}
                >
                  <option value="EN">English</option>
                  <option value="ES">Spanish</option>
                  <option value="FR">French</option>
                  <option value="DE">German</option>
                  <option value="HI">Hindi</option>
                  <option value="TE">Telugu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-orange-50 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Camera size={18} className="text-orange-500" />
                    {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  {uploadingPhoto && <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />}
                </div>
                {temp.profilePhoto && (
                  <div className="mt-2">
                    <img 
                      src={temp.profilePhoto} 
                      alt="Preview" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-orange-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={temp.city || ''}
                  onChange={e => setTemp({...temp, city: e.target.value})}
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={temp.state || ''}
                  onChange={e => setTemp({...temp, state: e.target.value})}
                  placeholder="Enter your state"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={temp.country || ''}
                  onChange={e => setTemp({...temp, country: e.target.value})}
                  placeholder="Enter your country"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
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
        )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminProfile;