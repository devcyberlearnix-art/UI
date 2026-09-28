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
    (user?.email ? user.email.split("@")[0] : "Learner");

  const displayEmail = user?.email || "learner@learnmaster.edu";
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
    if (!user) return 'L';
    const name = displayName || 'Learner';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="h-14 flex justify-between items-center px-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
            title="Toggle Sidebar"
          >
            <Menu size={18} />
          </button>
          <div className="hidden sm:flex items-center gap-2 min-w-0 text-xs">
            <span className="font-semibold text-slate-400">Portal</span>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-800 tracking-tight">{displayRole} Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showSwitcher && (
            <RoleSwitcher currentRole={tabRole} onRoleChange={handleRoleChange} />
          )}

          <button className="relative p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-800">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
          </button>

          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
              <p className="text-[10px] text-slate-400 font-mono leading-tight">{displayRole}</p>
            </div>
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              {getUserInitials()}
            </div>
          </div>
        </div>
      </div>

      {roleTabs.length > 0 && (
        <div className="px-6 pb-2.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex flex-wrap gap-1.5 pt-2">
            {roleTabs.map((tab) => {
              const isActive = activeTab?.label === tab.label;
              return (
                <NavLink
                  key={tab.label}
                  to={tab.defaultPath}
                  className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
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
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-wrap gap-1.5 mt-2"
            >
              {activeTab.subtabs.map((subtab) => (
                <NavLink
                  key={subtab.path}
                  to={subtab.path}
                  className={({ isActive }) =>
                    `px-2.5 py-0.5 text-xs rounded-md transition-colors ${
                      isActive
                        ? "bg-orange-100 text-orange-800 font-semibold"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
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