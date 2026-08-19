// src/components/dashboard/Sidebar.jsx
import React, { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardRole, sidebarByRole } from '../../config/navigation';
import toast from 'react-hot-toast';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const currentPath = location.pathname;

  const userRole = user?.role || user?.role1 || user?.userRole || '';
  const roleKey = getDashboardRole(currentPath, userRole);
  const isSuperAdmin = roleKey === 'admin';

  const displayRole =
    roleKey === 'subadmin'
      ? 'Sub Admin'
      : roleKey === 'admin'
      ? 'Admin'
      : roleKey === 'instructor'
      ? 'Instructor'
      : 'Student';

  // Get profile photo
  const profilePhoto = user?.profilePhoto || user?.photoURL || user?.avatar || null;
  const displayName = user?.firstName || user?.name || user?.displayName || 'Admin';
  const userInitial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      const loginPath = currentPath.startsWith('/admin') ? '/admin/login' : '/login';
      navigate(loginPath);
    } catch (error) {
      toast.error('Failed to logout');
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleSidebar = () => {
    if (typeof setSidebarOpen === 'function') {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const filteredMenuItems = useMemo(() => {
    const baseRole = ['admin', 'subadmin'].includes(roleKey) ? 'admin' : roleKey;
    const menuItems = sidebarByRole[baseRole] || sidebarByRole.student;

    return menuItems
      .map((section) => {
        if (baseRole !== 'admin') return section;

        if (section.section === 'Management' && roleKey === 'subadmin') {
          return {
            ...section,
            items: section.items.filter((item) => item.path !== '/admin/admins'),
          };
        }

        if (section.section === 'System' && roleKey === 'subadmin') {
          return {
            ...section,
            items: section.items.filter(
              (item) => item.path !== '/admin/roles' && item.path !== '/admin/settings'
            ),
          };
        }

        return section;
      })
      .filter((section) => section.items.length > 0);
  }, [roleKey]);

  const panelTitle = roleKey === 'instructor' ? 'Instructor' : roleKey === 'student' ? 'Student' : 'Admin';

  return (
    <aside 
      className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-white text-gray-800 transition-all duration-300 flex flex-col h-screen sticky top-0 overflow-y-auto shadow-lg z-40 border-r border-orange-100`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-orange-100 flex items-center justify-between min-h-[72px]">
        <div className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center w-full'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
            <span className="text-lg">L</span>
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg tracking-tight text-gray-800">
                LMS {panelTitle}
              </h1>
              <p className="text-[10px] text-orange-500 tracking-wider uppercase font-medium">
                {displayRole} Panel
              </p>
            </div>
          )}
        </div>
        {sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-orange-50 rounded-lg transition-colors text-gray-400 hover:text-orange-600"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
        {filteredMenuItems.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {sidebarOpen && section.items.length > 0 && (
              <div className="px-3 mb-2">
                <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">
                  {section.section}
                </p>
              </div>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  currentPath === item.path ||
                  (item.path !== '/admin/orders' && currentPath.startsWith(`${item.path}/`)) ||
                  currentPath.startsWith(item.path);
                const Icon = item.icon;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive: navIsActive }) => {
                      const active = isActive || navIsActive;
                      return `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        active 
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                          : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                      } ${!sidebarOpen && 'justify-center'}`;
                    }}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    )}
                    {sidebarOpen && isActive && (
                      <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
                    )}
                    {sidebarOpen && item.path === '/admin/admins' && isSuperAdmin && (
                      <Crown size={14} className="text-yellow-400 ml-auto" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section - User Info with Profile Photo */}
      <div className="border-t border-orange-100 p-3">
        {sidebarOpen ? (
          <div className="space-y-3">
            {/* Profile Button - opens profile page */}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-orange-50 transition-all duration-200 group"
            >
              <div className="relative w-8 h-8 flex-shrink-0">
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-orange-300 group-hover:border-orange-500 transition-colors"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                    {userInitial}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] text-orange-500 font-medium truncate">
                  {isSuperAdmin ? '👑 ' : ''}{displayRole}
                </p>
              </div>
              <User size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* Profile Photo - Collapsed Sidebar */}
            <button
              onClick={() => navigate('/profile')}
              className="relative w-10 h-10 hover:scale-105 transition-transform"
              title="Profile"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange-300 hover:border-orange-500 transition-colors"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-shadow">
                  {userInitial}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center justify-center w-full px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;