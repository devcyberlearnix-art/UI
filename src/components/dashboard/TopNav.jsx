// src/components/dashboard/TopNav.jsx
import { Menu, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RoleSwitcher from "../ui/RoleSwitcher";
import { useState, useEffect } from "react";

const TopNav = ({ setSidebarOpen, sidebarOpen }) => {
  const { user, actingRole, switchRole } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("Admin");
  const [displayEmail, setDisplayEmail] = useState("admin@lms.com");
  const [displayRole, setDisplayRole] = useState("Super Admin");

  useEffect(() => {
    // ✅ Update display info when user changes
    if (user) {
      console.log('[TopNav] User data received:', user);
      
      // ✅ Get name from email (mainadmin@cyberlearnix.com -> mainadmin)
      let name = user.displayName || 
                 user.firstName || 
                 user.name || 
                 user.fullName || 
                 user.username;
      
      // If no name found, extract from email
      if (!name && user.email) {
        name = user.email.split('@')[0]; // mainadmin@cyberlearnix.com -> mainadmin
        console.log('[TopNav] Extracted name from email:', name);
      }
      
      // If still no name, use default
      if (!name) {
        name = 'Admin';
      }
      
      setDisplayName(name);
      
      // Get email
      const email = user.email || 'mainadmin@cyberlearnix.com';
      setDisplayEmail(email);
      
      // Get role - Check for Super Admin vs Sub Admin
      const role = user.role || user.role1 || user.userRole || '';
      const roleLower = role.toLowerCase();
      
      if (roleLower.includes('super_admin') || roleLower.includes('superadmin')) {
        setDisplayRole('Super Admin');
      } else if (roleLower.includes('sub_admin') || roleLower.includes('subadmin')) {
        setDisplayRole('Sub Admin');
      } else if (roleLower.includes('admin')) {
        setDisplayRole('Admin');
      } else if (roleLower.includes('instructor')) {
        setDisplayRole('Instructor');
      } else {
        setDisplayRole('User');
      }
      
      console.log('[TopNav] Display Name:', name);
      console.log('[TopNav] Display Email:', email);
      console.log('[TopNav] Display Role:', displayRole);
    }
  }, [user]);

  const handleRoleChange = (newRole) => {
    switchRole(newRole);
    if (newRole === 'admin') navigate('/admin/dashboard');
    else if (newRole === 'instructor') navigate('/instructor/dashboard');
    else navigate('/student/dashboard');
  };

  // Show role switcher only when user is admin or instructor (original role)
  const showSwitcher = user && (user.role === 'admin' || user.role === 'instructor');

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'A';
    const name = displayName || user?.displayName || user?.firstName || user?.name || 'Admin';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="h-16 bg-white border-b border-orange-100 flex justify-between items-center px-6 shadow-sm">
      {/* Left side - Menu button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-gray-600 hover:text-orange-600"
      >
        <Menu size={22} />
      </button>

      {/* Right side - Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {showSwitcher && (
          <RoleSwitcher
            currentRole={actingRole}
            onRoleChange={handleRoleChange}
          />
        )}
        
        {/* Notifications */}
        <button className="relative p-2 hover:bg-orange-50 rounded-lg transition-colors text-gray-600 hover:text-orange-600">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>
        
        {/* ✅ Profile Section - Shows Actual Admin Credentials */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">
              {displayEmail}
            </p>
            <p className="text-[10px] text-orange-500 font-medium">
              {displayRole}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20 cursor-pointer hover:shadow-orange-500/30 transition-shadow">
            {getUserInitials()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;