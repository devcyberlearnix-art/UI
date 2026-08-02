// src/pages/admin/AdminProfile.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save, LogOut, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

const AdminProfile = () => {
  const { logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [temp, setTemp] = useState(null);
  const [error, setError] = useState("");

  // ✅ Fetch profile data from API only
  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[AdminProfile] Fetching profile from API...');
      
      const response = await adminApi.getAdminProfile();
      console.log('[AdminProfile] API Response:', response);
      
      // Handle different response structures
      const data = response.data || response;
      
      if (!data || Object.keys(data).length === 0) {
        throw new Error('No data received from API');
      }
      
      // ✅ Extract name - only from API
      const name = data.name || 
                   data.fullName || 
                   data.username || 
                   data.displayName || 
                   null;
      
      // ✅ Extract email - only from API
      const email = data.email || null;
      
      // ✅ Extract phone - only from API
      const phone = data.phone || 
                    data.mobile || 
                    data.mobile1 || 
                    data.phoneNumber || 
                    null;
      
      // ✅ Extract role - only from API
      const role = data.role || 
                   data.role1 || 
                   data.userRole || 
                   null;
      
      // ✅ If any required field is missing, throw error
      if (!name) {
        console.warn('[AdminProfile] Name not found in API response');
      }
      if (!email) {
        console.warn('[AdminProfile] Email not found in API response');
      }
      
      const profileData = {
        name: name || '',
        email: email || '',
        phone: phone || '',
        role: role || '',
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
      
      const updateData = {
        name: temp.name,
        email: temp.email,
        phone: temp.phone,
      };

      const response = await adminApi.updateAdminProfile(updateData);
      console.log('[AdminProfile] Update response:', response);

      setProfile(temp);
      setEditMode(false);
      toast.success('Profile updated successfully!');
      
      // ✅ Refresh profile data after update
      setTimeout(() => {
        fetchProfile();
      }, 500);
      
    } catch (error) {
      console.error('[AdminProfile] Save error:', error);
      console.error('[AdminProfile] Error response:', error.response);
      
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-sm text-gray-500">Manage your account information</p>
        </div>
        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
          {profile.role || "Admin"}
        </span>
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
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {profile.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold">{profile.name || "Admin"}</h2>
              <p className="text-orange-100 text-sm">{profile.role || "Administrator"}</p>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {!editMode ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900">{profile.name || "Not set"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail size={18} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900">{profile.email || "Not set"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900">{profile.phone || "Not set"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-500">Role</p>
                      <p className="font-medium text-gray-900">{profile.role || "Admin"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => { setTemp(profile); setEditMode(true); }}
                  className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-500/25 flex items-center gap-2"
                >
                  <Save size={16} />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={temp.name || ''}
                  onChange={e => setTemp({...temp, name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  value={temp.email || ''}
                  onChange={e => setTemp({...temp, email: e.target.value})}
                  placeholder="Enter your email"
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

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
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