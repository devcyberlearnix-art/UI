// src/components/dashboard/Sidebar.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardRole, sidebarByRole } from '../../config/navigation';
import toast from 'react-hot-toast';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const currentPath = location.pathname;

  // Real-time wishlist count
  const [wishlistCount, setWishlistCount] = useState(0);

  // User-specific localStorage key
  const getStorageKey = () => {
    const userId = user?.id || user?.userId || user?.email || "guest";
    return `wishlist_${userId}`;
  };

  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const key = getStorageKey();
        const saved = JSON.parse(localStorage.getItem(key) || '[]');
        setWishlistCount(Array.isArray(saved) ? saved.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    updateWishlistCount();
    window.addEventListener('storage', updateWishlistCount);
    return () => window.removeEventListener('storage', updateWishlistCount);
  }, [currentPath, user]);

  const userRole = user?.role || user?.role1 || user?.userRole || '';
  const roleKey = getDashboardRole(currentPath, userRole);
  const isSuperAdmin = roleKey === 'admin';
  const isStudent = roleKey === 'student';

  const displayName =
    user?.displayName ||
    user?.firstName ||
    user?.name ||
    user?.fullName ||
    (user?.email ? user.email.split('@')[0] : 'Learner');

  const displayRole =
    roleKey === 'subadmin'
      ? 'Sub Admin'
      : roleKey === 'admin'
      ? 'Admin'
      : roleKey === 'instructor'
      ? 'Instructor'
      : 'Student';

  const getUserInitials = () => {
    if (!user) return 'L';
    const name = displayName || 'Learner';
    return name.charAt(0).toUpperCase();
  };

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
              (item) => item.path !== '/admin/roles'
            ),
          };
        }

        return section;
      })
      .filter((section) => section.items.length > 0);
  }, [roleKey]);

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 68 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className="bg-[#0B1220] text-white flex flex-col h-screen sticky top-0 overflow-hidden shadow-sm z-40 border-r border-slate-800/50 shrink-0 font-sans select-none"
    >
      {/* ── BRAND HEADER ──────────────────────────────────────────────── */}
      <div className="h-16 px-3.5 border-b border-slate-800/50 flex flex-col justify-center shrink-0 bg-[#0B1220]">
        <div className={`flex items-center gap-2.5 min-w-0 ${!sidebarOpen && 'justify-center w-full'}`}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] text-white flex items-center justify-center font-bold text-sm tracking-tight shrink-0 shadow-sm shadow-[#2563EB]/20">
            <span className="font-extrabold">
              A
            </span>
          </div>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="min-w-0 truncate"
            >
              <h1 className="font-extrabold text-base text-white tracking-tight leading-none">
                Asivo
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wide mt-0.5">
                Learn Skills. Build Futures.
              </p>
            </motion.div>
          )}
        </div>
        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            title="Collapse Sidebar"
            className="absolute top-4 right-3.5 h-7 w-7 rounded-lg hover:bg-slate-800/50 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* ── EXPAND TOGGLE (WHEN COLLAPSED) ──────────────────────────────── */}
      {!sidebarOpen && (
        <div className="py-2 flex justify-center border-b border-slate-800/50">
          <button
            onClick={toggleSidebar}
            title="Expand Sidebar"
            className="h-7 w-7 rounded-lg hover:bg-slate-800/50 flex items-center justify-center transition-colors text-slate-400 hover:text-white"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── SCROLLABLE NAVIGATION CONTENT ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 hide-scrollbar">

        {/* Navigation Sections */}
        {filteredMenuItems.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-1">
            {sidebarOpen && section.section && (
              <div className="px-2 pt-2 pb-1">
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  {section.section}
                </p>
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  currentPath === item.path ||
                  (item.path !== '/admin/orders' && currentPath.startsWith(`${item.path}/`)) ||
                  currentPath.startsWith(item.path);
                const Icon = item.icon;

                // Smart badge counters
                const showWishlistBadge = item.path === '/student/wishlist' && wishlistCount > 0;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive: navIsActive }) => {
                      const active = isActive || navIsActive;
                      return `relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        active
                          ? 'bg-[#2563EB] text-white shadow-md font-bold'
                          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      } ${!sidebarOpen && 'justify-center px-1.5'}`;
                    }}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    {({ isActive: navIsActive }) => {
                      const active = isActive || navIsActive;
                      return (
                        <>
                          <Icon
                            size={16}
                            className={`shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                              active ? 'text-white' : 'text-slate-400 group-hover:text-white'
                            }`}
                          />

                          {sidebarOpen && (
                            <span className="truncate flex-1 tracking-tight">{item.label}</span>
                          )}

                          {/* Dynamic Wishlist Badge */}
                          {sidebarOpen && showWishlistBadge && (
                            <span
                              className={`ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                                active
                                  ? 'bg-white text-[#2563EB]'
                                  : 'bg-[#06B6D4]/20 text-[#06B6D4]'
                              }`}
                            >
                              {wishlistCount}
                            </span>
                          )}

                          {sidebarOpen && item.path === '/admin/admins' && isSuperAdmin && (
                            <Crown size={13} className="text-amber-400 ml-auto shrink-0" />
                          )}
                        </>
                      );
                    }}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── STUDENT VALUABLE METRIC WIDGET ──────────────────────────── */}
        {sidebarOpen && isStudent && (
          <div className="pt-2 space-y-2.5">
            {/* Quick Instructor Application Card */}
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full p-2.5 rounded-2xl border border-[#2563EB]/30 bg-gradient-to-r from-[#2563EB]/20 via-[#06B6D4]/10 to-[#2563EB]/20 text-white hover:border-[#06B6D4]/50 transition-all text-left shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-[#06B6D4]">
                    <GraduationCap size={13} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white leading-tight">Become Instructor</p>
                    <p className="text-[9px] text-slate-400 leading-tight">Share expertise & earn</p>
                  </div>
                </div>
                <ArrowRight
                  size={12}
                  className="text-slate-400 group-hover:text-[#06B6D4] group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER: PROMOTIONAL CARD & SIGN OUT ──────────────────────────────── */}
      <div className="p-2.5 border-t border-slate-800/50 bg-[#0B1220] shrink-0 space-y-2.5">
        {sidebarOpen && (
          <div className="p-3 rounded-xl border border-[#2563EB]/30 bg-gradient-to-r from-[#2563EB]/20 via-[#06B6D4]/10 to-[#2563EB]/20 text-white space-y-2.5">
            <div className="w-full h-16 rounded-lg bg-gradient-to-br from-[#2563EB]/30 to-[#06B6D4]/20 flex items-center justify-center overflow-hidden">
              <div className="text-center">
                <GraduationCap size={24} className="text-white/80 mx-auto mb-1" />
                <p className="text-[9px] font-bold text-white/90">Keep learning.</p>
                <p className="text-[9px] text-white/70">Build your future.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/student/courses')}
              className="w-full px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition border border-white/20"
            >
              Explore Courses
            </button>
          </div>
        )}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-rose-500/20 hover:text-rose-400 transition-colors disabled:opacity-50 group ${!sidebarOpen && 'justify-center'}`}
        >
          <LogOut size={15} className="shrink-0 text-slate-400 group-hover:text-rose-400 transition-colors" />
          {sidebarOpen && (
            <span className="truncate">
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </span>
          )}
        </button>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.aside>
  );
};

export default Sidebar;