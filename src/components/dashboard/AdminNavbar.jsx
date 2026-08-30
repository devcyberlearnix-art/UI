import React, { useState, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  Mail,
  Settings,
  ChevronDown,
  Loader2,
  Camera,
  User,
  LogOut,
  Phone,
  MapPin,
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { studentApi } from "../../api/studentApi";
import { instructorApi } from "../../api/instructorApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminNavbar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const fileInputRef = React.useRef(null);

  // Fetch fresh profile data from API based on user role
  // Only fetch if profileData is null (initial load) or explicitly triggered
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const role = user?.normalizedRole || user?.role || 'student';
      let response;
      let data;

      switch (role) {
        case 'admin':
        case 'subadmin':
          response = await adminApi.getAdminProfile();
          console.log('[AdminNavbar] Admin API response:', response);
          data = response.data?.admin || response.data?.data || response.data || response;
          break;
        case 'instructor':
          response = await instructorApi.getProfile();
          console.log('[AdminNavbar] Instructor API response:', response);
          data = response.data?.instructor || response.data?.data || response.data || response;
          break;
        case 'student':
        default:
          response = await studentApi.getProfile();
          console.log('[AdminNavbar] Student API response:', response);
          data = response.data?.student || response.data?.data || response.data || response;
          break;
      }

      console.log('[AdminNavbar] Extracted profile data:', data);
      setProfileData(data);
    } catch (error) {
      console.error('[AdminNavbar] Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load - don't fetch immediately, wait for user to update profile
  useEffect(() => {
    if (user) {
      setLoading(false); // Don't auto-fetch, just show email initially
    } else {
      setLoading(false);
    }
  }, [user]);

  // Listen for profile update event to refresh navbar data
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('[AdminNavbar] Profile update event received, fetching fresh data...');
      fetchProfileData();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      console.error('[AdminNavbar] Logout error:', error);
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
      console.log('[AdminNavbar] Uploading profile photo...');
      
      // Convert file to base64 for now (since backend upload endpoint doesn't exist)
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result;
        
        // Update profile data with new photo
        const updatedProfile = { ...profileData, profilePhoto: base64String };
        setProfileData(updatedProfile);
        
        // Don't save to backend due to 500 character limit validation
        // Photo is only displayed locally until backend upload endpoint is available
        toast.success('Photo selected! (Local preview only - backend upload not available)');
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
      };
    } catch (error) {
      console.error('[AdminNavbar] Photo upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Left */}
      <div className="flex items-center gap-5">

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-orange-50 transition"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h2>

          <p className="text-sm text-gray-500">
            Welcome back,
            <span className="font-semibold ml-1 text-orange-500">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin inline" />
              ) : (
                profileData?.firstName || profileData?.name || user?.firstName || user?.name || "User"
              )}
            </span>
          </p>
        </div>

      </div>

      {/* Search */}

      <div className="hidden lg:flex items-center w-[420px]">

        <div className="relative w-full">

          <Search
            size={18}
            className="absolute left-4 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search stock, orders, users..."
            className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 outline-none focus:ring-2 focus:ring-orange-400"
          />

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        <button className="relative w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50">

          <Mail size={18} />

          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
            4
          </span>

        </button>

        <button className="relative w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50">

          <Bell size={18} />

          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            8
          </span>

        </button>

        <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50">

          <Settings size={18} />

        </button>

        <div className="h-8 border-l border-gray-300"></div>

        <div className="relative">
          <div 
            className="flex items-center gap-3 cursor-pointer relative group"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            {loading ? (
              <Loader2 className="w-11 h-11 text-gray-400 animate-spin" />
            ) : (
              <>
                <div className="relative" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  {profileData?.profilePhoto ? (
                    <img
                      src={profileData.profilePhoto}
                      className="w-11 h-11 rounded-xl object-cover"
                      alt="Profile"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold text-white ${profileData?.profilePhoto ? 'hidden' : ''}`}
                    style={{ backgroundColor: '#f97316' }}
                  >
                    {(profileData?.firstName || profileData?.name || "A").charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <Camera size={16} className="text-white" />
                  </div>
                  
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <Loader2 size={16} className="text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="hidden md:block">

                  <h4 className="text-sm font-bold text-gray-800">
                    {profileData?.firstName && profileData?.lastName 
                      ? `${profileData.firstName} ${profileData.lastName}` 
                      : profileData?.name || user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.name || user?.email || "User"}
                  </h4>

                  <p className="text-xs text-gray-500">
                    {profileData?.email || user?.email || "user@example.com"}
                  </p>

                </div>

                <ChevronDown
                  size={18}
                  className="text-gray-500"
                />
              </>
            )}
          </div>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-4 z-50">
              {/* Profile Header */}
              <div className="px-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {profileData?.profilePhoto ? (
                    <img
                      src={profileData.profilePhoto}
                      className="w-12 h-12 rounded-xl object-cover"
                      alt="Profile"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white ${profileData?.profilePhoto ? 'hidden' : ''}`}
                    style={{ backgroundColor: '#f97316' }}
                  >
                    {(profileData?.firstName || profileData?.name || "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {profileData?.firstName && profileData?.lastName 
                        ? `${profileData.firstName} ${profileData.lastName}` 
                        : profileData?.name || user?.name || user?.email || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {profileData?.email || user?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {profileData?.role || profileData?.adminType || "User"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-600 truncate">
                    {profileData?.email || user?.email || ""}
                  </span>
                </div>
                {profileData?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {profileData.phone}
                    </span>
                  </div>
                )}
                {profileData?.city && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {[profileData.city, profileData.state, profileData.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-4 pt-2 border-t border-gray-100 space-y-1">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate('/admin/settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition flex items-center gap-3 rounded-lg"
                >
                  <Settings size={16} />
                  Settings
                </button>
                
                <div className="border-t border-gray-100 my-1"></div>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3 rounded-lg"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};

export default AdminNavbar;