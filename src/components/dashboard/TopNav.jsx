// src/components/dashboard/TopNav.jsx
import { Bell, Menu, User, Settings, LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RoleSwitcher from "../ui/RoleSwitcher";
import { useMemo, useState, useRef, useEffect } from "react";
import { getDashboardRole, tabsByRole } from "../../config/navigation";
import { adminApi } from "../../api/adminApi";
import authApi from "../../api/authApi";

const TopNav = ({ setSidebarOpen, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const rawRole = user?.role || user?.role1 || user?.userRole || "";
  const roleKey = getDashboardRole(location.pathname, rawRole);
  const tabRole = roleKey === "admin" || roleKey === "subadmin" ? "admin" : roleKey;

  const displayName =
    profileData?.firstName && profileData?.lastName
      ? `${profileData.firstName} ${profileData.lastName}`
      : profileData?.name ||
        user?.displayName ||
        user?.firstName ||
        user?.name ||
        user?.fullName ||
        user?.username ||
        (user?.email ? user.email.split("@")[0] : "Admin");

  const displayEmail = profileData?.email || user?.email || "admin@lms.com";
  const displayRole =
    profileData?.role ||
    profileData?.adminType ||
    (roleKey === "subadmin"
      ? "Sub Admin"
      : roleKey === "instructor"
      ? "Instructor"
      : roleKey === "student"
      ? "Student"
      : "Admin");

  // Get profile photo
  const profilePhoto = profileData?.profilePhoto || user?.profilePhoto || user?.photoURL || user?.avatar || null;
  const userInitial = displayName.charAt(0).toUpperCase();

  // Fetch profile data from API
  const fetchProfileData = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      let response;
      if (roleKey === 'admin' || roleKey === 'subadmin') {
        response = await adminApi.getAdminProfile();
      } else {
        response = await authApi.getUserProfile();
      }
      
      const data = response.data?.admin || response.data?.user || response.data?.data || response.data;
      
      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      console.error('[TopNav] Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile on mount and when user changes
  useEffect(() => {
    if (user?.email) {
      fetchProfileData();
    }
  }, [user]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfileData();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const roleTabs = tabsByRole[tabRole] || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeTab = useMemo(
    () => roleTabs.find((tab) => tab.match.some((path) => location.pathname.startsWith(path))) || roleTabs[0],
    [location.pathname, roleTabs]
  );

  const handleRoleChange = (newRole) => {
    if (newRole === 'admin') navigate('/admin/dashboard');
    else if (newRole === 'instructor') navigate('/instructor/dashboard');
    else navigate('/student/dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const showSwitcher = !!user && (String(rawRole).toLowerCase().includes("admin") || String(rawRole).toLowerCase().includes("instructor"));

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-orange-100 shadow-sm">
      <div className="h-16 flex justify-between items-center px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-gray-600 hover:text-orange-600"
          >
            {sidebarOpen ? <Menu size={22} /> : <Menu size={22} />}
          </button>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 truncate">{displayRole}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {showSwitcher && (
            <RoleSwitcher currentRole={tabRole} onRoleChange={handleRoleChange} />
          )}

          <button className="relative p-2 hover:bg-orange-50 rounded-lg transition-colors text-gray-600 hover:text-orange-600">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{displayName}</p>
              <p className="text-xs text-gray-500">{displayEmail}</p>
            </div>
            
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="focus:outline-none transition-transform hover:scale-105"
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover border-2 border-orange-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-shadow"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-shadow">
                    {userInitial}
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt={displayName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-orange-300"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                          {userInitial}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <Settings size={18} />
                    Settings
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowDropdown(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {roleTabs.length > 0 && (
        <div className="px-6 pb-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {roleTabs.map((tab) => {
              const isActive = activeTab?.label === tab.label;
              return (
                <NavLink
                  key={tab.label}
                  to={tab.defaultPath}
                  className={`px-4 py-1.5 text-sm rounded-full border transition-all duration-200 ${
                    isActive
                      ? "bg-orange-500 text-white border-orange-500 shadow"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                  }`}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </div>

          {activeTab?.subtabs?.length > 0 && (
            <motion.div
              key={activeTab.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {activeTab.subtabs.map((subtab) => (
                <NavLink
                  key={subtab.path}
                  to={subtab.path}
                  className={({ isActive }) =>
                    `px-3 py-1 text-xs rounded-lg transition-colors ${
                      isActive
                        ? "bg-orange-100 text-orange-700 font-semibold"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                    }`
                  }
                >
                  {subtab.label}
                </NavLink>
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopNav;