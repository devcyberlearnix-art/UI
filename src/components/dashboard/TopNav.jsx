// src/components/dashboard/TopNav.jsx
import { Bell, Menu } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RoleSwitcher from "../ui/RoleSwitcher";
import { useMemo } from "react";
import { getDashboardRole, tabsByRole } from "../../config/navigation";
import { authApi } from "../../api/authApi";
import { setActingRole } from "../../utils/roleSwitch";

const TopNav = ({ setSidebarOpen, sidebarOpen }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const rawRole = user?.role || user?.role1 || user?.userRole || "";
  const roleKey = getDashboardRole(location.pathname, rawRole);
  const tabRole = roleKey === "super_admin" || roleKey === "sub_admin" ? "admin" : roleKey;

  const displayName =
    user?.displayName ||
    user?.firstName ||
    user?.name ||
    user?.fullName ||
    user?.username ||
    (user?.email ? user.email.split("@")[0] : "Admin");

  const displayEmail = user?.email || "admin@lms.com";
  const displayRole =
    roleKey === "super_admin"
      ? "Super Admin"
      : roleKey === "sub_admin"
      ? "Sub Admin"
      : roleKey === "instructor"
      ? "Instructor"
      : roleKey === "student"
      ? "Student"
      : "Admin";

  const roleTabs = tabsByRole[tabRole] || [];

  const activeTab = useMemo(
    () => roleTabs.find((tab) => tab.match.some((path) => location.pathname.startsWith(path))) || roleTabs[0],
    [location.pathname, roleTabs]
  );

  const handleRoleChange = async (newRole) => {
    try {
      const roleValue = String(newRole || '').trim().toLowerCase();
      if (!roleValue) return;

      const userRole = String(user?.role || '').trim().toLowerCase();
      const permitted = userRole === 'admin'
        ? ['admin', 'instructor', 'student'].includes(roleValue)
        : userRole === 'instructor' && ['instructor', 'student'].includes(roleValue);

      if (!permitted) {
        return;
      }

      await authApi.switchRole(roleValue).catch(() => undefined);
      setActingRole(roleValue);

      if (roleValue === 'admin') navigate('/admin/dashboard');
      else if (roleValue === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
      window.location.reload();
    } catch (error) {
      console.error('[TopNav] Role switch failed:', error);
      if (newRole === 'admin') navigate('/admin/dashboard');
      else if (newRole === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/dashboard');
    }
  };

  const showSwitcher = !!user && (String(rawRole).toLowerCase().includes("admin") || String(rawRole).toLowerCase().includes("instructor"));

  const getUserInitials = () => {
    if (!user) return 'A';
    const name = displayName || 'Admin';
    return name.charAt(0).toUpperCase();
  };

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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
              {getUserInitials()}
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