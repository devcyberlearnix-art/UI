// src/components/dashboard/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCog,
  DollarSign,
  Star,
  BarChart3,
  Award,
  Bell,
  Shield,
  HelpCircle,
  Globe,
  Settings,
  Sparkles,
  Trophy,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  ShoppingCart,
  FileText,
  UserCheck,
  MessageSquare,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const menuItems = [
  { 
    section: "Main",
    items: [
      { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ]
  },
  {
    section: "Management",
    items: [
      { path: '/admin/users', icon: Users, label: 'Users' },
      { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
      { path: '/admin/instructors', icon: UserCog, label: 'Instructors' },
      { path: '/admin/instructor-applications', icon: UserCheck, label: 'Applications' },
      { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
      { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
      { path: '/admin/certificates', icon: Award, label: 'Certificates' },
    ]
  },
  {
    section: "Analytics",
    items: [
      { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      { path: '/admin/reports', icon: FileText, label: 'Reports' },
    ]
  },
  {
    section: "Engagement",
    items: [
      { path: '/admin/reviews', icon: Star, label: 'Reviews' },
      { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    ]
  },
  {
    section: "Administration",
    items: [
      { path: '/admin/admins', icon: Shield, label: 'Admin Management' },
      { path: '/admin/roles', icon: Shield, label: 'Roles & Permissions' },
      { path: '/admin/moderation', icon: MessageSquare, label: 'Moderation' },
      { path: '/admin/support', icon: HelpCircle, label: 'Support' },
      { path: '/admin/cms', icon: Globe, label: 'CMS' },
      { path: '/admin/settings', icon: Settings, label: 'Settings' },
    ]
  },
  {
    section: "Advanced",
    items: [
      { path: '/admin/ai-features', icon: Sparkles, label: 'AI Features' },
      { path: '/admin/gamification', icon: Trophy, label: 'Gamification' },
    ]
  },
  {
    section: "Account",
    items: [
      { path: '/admin/profile', icon: User, label: 'Profile' },
    ]
  }
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = window.location;
  const currentPath = location.pathname;

  // ✅ Check user role - Updated to match TopNav logic with precise detection
  const userRole = user?.role || user?.role1 || user?.userRole || '';
  const roleLower = userRole.toLowerCase();
  
  // Check for Super Admin first (must contain 'super')
  const isSuperAdmin = roleLower.includes('super_admin') || roleLower.includes('superadmin');
  // Check for Sub Admin (must contain 'sub' but not 'super')
  const isSubAdmin = (roleLower.includes('sub_admin') || roleLower.includes('subadmin')) && !isSuperAdmin;
  // Regular admin (only 'admin' without 'super' or 'sub')
  const isRegularAdmin = roleLower.includes('admin') && !isSuperAdmin && !isSubAdmin;
  
  // Display role name
  const displayRole = isSuperAdmin ? 'Super Admin' : isSubAdmin ? 'Sub Admin' : isRegularAdmin ? 'Admin' : 'User';

  console.log('[Sidebar] User role:', userRole);
  console.log('[Sidebar] Is Super Admin:', isSuperAdmin);
  console.log('[Sidebar] Is Sub Admin:', isSubAdmin);
  console.log('[Sidebar] Is Regular Admin:', isRegularAdmin);
  console.log('[Sidebar] Display Role:', displayRole);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
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

  // ✅ Filter menu items based on user role
  const filteredMenuItems = menuItems.map(section => {
    // For Administration section, filter items based on role
    if (section.section === "Administration") {
      const filteredItems = section.items.filter(item => {
        // Super Admin can see all
        if (isSuperAdmin) return true;
        // Sub Admin cannot see Admin Management, Roles, Settings, Moderation
        if (isSubAdmin) {
          if (item.path === '/admin/admins') return false;
          if (item.path === '/admin/roles') return false;
          if (item.path === '/admin/settings') return false;
          if (item.path === '/admin/moderation') return false;
          return true;
        }
        // Default: show all
        return true;
      });
      return { ...section, items: filteredItems };
    }
    return section;
  }).filter(section => section.items.length > 0);

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
                LMS Admin
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
                const isActive = currentPath.startsWith(item.path);
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
                    {/* ✅ Show crown icon for Admin Management */}
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

      {/* Bottom Section - User Info & Logout */}
      <div className="border-t border-orange-100 p-3">
        {sidebarOpen ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-orange-500/20">
                {user?.firstName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.firstName || user?.name || 'Admin'}
                </p>
                <p className="text-[10px] text-orange-500 font-medium truncate">
                  {isSuperAdmin ? '👑 ' : ''}{displayRole}
                </p>
              </div>
            </div>
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
              {user?.firstName?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
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