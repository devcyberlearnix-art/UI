// src/components/dashboard/Sidebar.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  TrendingUp,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
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

  useEffect(() => {
    const updateWishlistCount = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('student_wishlist') || '[]');
        setWishlistCount(Array.isArray(saved) ? saved.length : 0);
      } catch {
        setWishlistCount(0);
      }
    };
    updateWishlistCount();
    window.addEventListener('storage', updateWishlistCount);
    return () => window.removeEventListener('storage', updateWishlistCount);
  }, [currentPath]);

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
              (item) => item.path !== '/admin/roles' && item.path !== '/admin/settings'
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
      className="bg-white text-slate-800 flex flex-col h-screen sticky top-0 overflow-hidden shadow-sm z-40 border-r border-slate-200/90 shrink-0 font-sans select-none"
    >
      {/* ── BRAND HEADER ──────────────────────────────────────────────── */}
      <div className="h-14 px-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
        <div className={`flex items-center gap-2.5 min-w-0 ${!sidebarOpen && 'justify-center w-full'}`}>
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center font-bold text-xs tracking-tight shrink-0 shadow-xs border border-slate-800">
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent font-extrabold">
              LM
            </span>
          </div>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              className="min-w-0 truncate"
            >
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                  LearnMaster
                </h1>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200/60">
                  {displayRole}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 tracking-wide mt-0.5">
                Technical Education
              </p>
            </motion.div>
          )}
        </div>

        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            title="Collapse Sidebar"
            className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-800"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* ── EXPAND TOGGLE (WHEN COLLAPSED) ──────────────────────────────── */}
      {!sidebarOpen && (
        <div className="py-2 flex justify-center border-b border-slate-100">
          <button
            onClick={toggleSidebar}
            title="Expand Sidebar"
            className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-800"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* ── SCROLLABLE NAVIGATION CONTENT ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 hide-scrollbar">
        
        {/* User Identity Profile Card */}
        {sidebarOpen ? (
          <div className="p-2.5 rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-slate-100/50 flex items-center gap-2.5 shadow-2xs">
            <div className="relative shrink-0">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs border border-slate-700">
                {getUserInitials()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {displayName}
                </p>
              </div>
              <p className="text-[10px] font-mono text-slate-500 truncate leading-tight mt-0.5">
                {user?.email || 'learner@learnmaster.edu'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div className="relative group">
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {getUserInitials()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          </div>
        )}

        {/* Navigation Sections */}
        {filteredMenuItems.map((section, sectionIdx) => (
          <div key={sectionIdx} className="space-y-1">
            {sidebarOpen && section.section && (
              <div className="px-2 pt-1 pb-0.5">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
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
                      return `relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                        active
                          ? 'bg-slate-900 text-white shadow-xs font-bold'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      } ${!sidebarOpen && 'justify-center px-1.5'}`;
                    }}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    {({ isActive: navIsActive }) => {
                      const active = isActive || navIsActive;
                      return (
                        <>
                          {/* Active Accent Left Indicator */}
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full bg-gradient-to-b from-orange-400 to-amber-500" />
                          )}

                          <Icon
                            size={16}
                            className={`shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                              active ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-700'
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
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-orange-100 text-orange-700'
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
            {/* Weekly Learning Target Card */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-orange-50/30 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp size={13} className="text-orange-600" /> Weekly Goal
                </span>
                <span className="font-mono font-extrabold text-slate-900">4 / 6 hrs</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200/90 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full w-2/3 transition-all duration-500" />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 font-mono">
                <span>67% Completed</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 size={10} /> On Target
                </span>
              </div>
            </div>

            {/* Quick Instructor Application Card */}
            <button
              onClick={() => navigate('/student/dashboard')}
              className="w-full p-2.5 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white hover:border-orange-500/50 transition-all text-left shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-white/10 flex items-center justify-center text-orange-400">
                    <GraduationCap size={13} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white leading-tight">Become Instructor</p>
                    <p className="text-[9px] text-slate-400 leading-tight">Share expertise & earn</p>
                  </div>
                </div>
                <ArrowRight
                  size={12}
                  className="text-slate-400 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all"
                />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* ── FOOTER: SIGN OUT & TRUST TAG ──────────────────────────────── */}
      <div className="p-2.5 border-t border-slate-100 bg-white shrink-0 space-y-1.5">
        {sidebarOpen ? (
          <>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50 group"
            >
              <LogOut size={15} className="shrink-0 text-slate-400 group-hover:text-rose-600 transition-colors" />
              <span className="truncate">
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </span>
            </button>
            <div className="px-2 pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-50">
              <span className="flex items-center gap-1 text-slate-500">
                <ShieldCheck size={11} className="text-emerald-600" /> SOC-2 Audited
              </span>
              <span>v2.4.0</span>
            </div>
          </>
        ) : (
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center w-full p-2 rounded-xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.aside>
  );
};

export default Sidebar;