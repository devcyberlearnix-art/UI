import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  CreditCard,
  Heart,
  Settings,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
  Users,
  Image,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  BarChart3,
  Search,
  ShoppingCart,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { useAuth, normalizeRole } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { notificationApi } from '../../api/notificationApi';
import Badge from '../primitives/Badge';
import Button from '../primitives/Button';

// Intentional spring physics configuration per architectural specification
const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

// Paths identified as distraction-free immersive zones
const DISTRACTION_FREE_PATTERNS = [
  /\/quiz\//i,
  /\/quiz-runner/i,
  /\/live-stream/i,
  /\/classroom\//i,
  /\/exam\//i,
];

export const AppShell = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount = 0 } = useOrder() || {};

  // Responsive & collapsed sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Notifications live state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch real notifications for authenticated user
  useEffect(() => {
    let isMounted = true;
    const fetchUserNotifications = async () => {
      if (!user?.id) return;
      try {
        setLoadingNotifications(true);
        const data = await notificationApi.getUserNotifications(user.id);
        if (isMounted) {
          const notifs = Array.isArray(data) ? data : data?.content || [];
          setNotifications(notifs);
          const unread = notifs.filter(
            (n) => n.status !== 'READ' && !n.isRead
          ).length;
          setUnreadCount(unread);
        }
      } catch {
        // Quietly failover without blocking shell render
      } finally {
        if (isMounted) setLoadingNotifications(false);
      }
    };

    fetchUserNotifications();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Determine current active user role
  const userRole = useMemo(() => {
    return normalizeRole(user?.role || 'student');
  }, [user]);

  // Distraction-free check
  const isDistractionFree = useMemo(() => {
    return DISTRACTION_FREE_PATTERNS.some((pattern) =>
      pattern.test(location.pathname)
    );
  }, [location.pathname]);

  // =========================================================================
  // STRICT ENTERPRISE ROLE-BASED NAVIGATION MAPPING
  // =========================================================================
  const navigationItems = useMemo(() => {
    // 1. ADMIN COMMAND CENTER RAIL
    if (userRole === 'admin' || userRole === 'subadmin') {
      return [
        { label: 'Global Telemetry', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Governance', href: '/admin/users', icon: Users },
        { label: 'Curriculum Audit', href: '/admin/courses', icon: BookOpen },
        { label: 'Order Ledger', href: '/admin/orders', icon: CreditCard },
        { label: 'Marketing Banners', href: '/admin/banners', icon: Image },
      ];
    }

    // 2. INSTRUCTOR RAIL
    if (userRole === 'instructor') {
      return [
        { label: 'Studio Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
        { label: 'Course Architect', href: '/instructor/my-courses', icon: BookOpen },
        { label: 'Create Curriculum', href: '/instructor/create-course', icon: Sparkles },
        { label: 'Revenue & Payouts', href: '/instructor/analytics', icon: BarChart3 },
      ];
    }

    // 3. STUDENT RAIL (Default Authenticated Candidate)
    return [
      { label: 'My Learning Hub', href: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Active Courses', href: '/student/my-learning', icon: BookOpen },
      { label: 'Live Classrooms', href: '/student/live-classes', icon: Radio },
      { label: 'Assignments Desk', href: '/student/assignments', icon: FileText },
      { label: 'Saved Wishlist', href: '/student/wishlist', icon: Heart },
      { label: 'Billing & Orders', href: '/student/orders', icon: CreditCard },
      { label: 'Account Settings', href: '/student/profile', icon: Settings },
    ];
  }, [userRole]);

  // Active path checking helper
  const isItemActive = (href) => {
    if (location.pathname === href) return true;
    if (
      href !== '/student/dashboard' &&
      href !== '/instructor/dashboard' &&
      href !== '/admin/dashboard' &&
      href !== '/'
    ) {
      return location.pathname.startsWith(href);
    }
    return false;
  };

  // Explicit, reliable navigation execution
  const handleNavigate = (href) => {
    navigate(href);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  // Breadcrumb segment parser
  const breadcrumbs = useMemo(() => {
    const rawSegments = location.pathname.split('/').filter(Boolean);
    if (rawSegments.length === 0) return [];

    const friendlyNames = {
      admin: 'Administration',
      student: 'Student',
      instructor: 'Instructor',
      dashboard: 'Dashboard',
      courses: 'Courses',
      classroom: 'Classroom',
      certificates: 'Certificates',
      assignments: 'Assignments',
      orders: 'Orders',
      cart: 'Cart',
      checkout: 'Checkout',
      wishlist: 'Wishlist',
      profile: 'Profile',
      users: 'User Governance',
      banners: 'Marketing Banners',
      reports: 'System Telemetry',
      roles: 'Roles Authority',
      'my-learning': 'My Active Courses',
      'live-classes': 'Live Classrooms',
      'my-courses': 'Course Architect',
      'create-course': 'Create Curriculum',
      analytics: 'Revenue & Payouts',
    };

    let cumulativePath = '';
    return rawSegments.map((segment) => {
      cumulativePath += `/${segment}`;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(segment);
      const isNum = /^\d+$/.test(segment);
      const label = isUUID
        ? `Ref: ${segment.slice(0, 8)}...`
        : isNum
        ? `#${segment}`
        : friendlyNames[segment.toLowerCase()] ||
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      return {
        label,
        href: cumulativePath,
      };
    });
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await notificationApi.markAllAsRead(user.id);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'READ', isRead: true }))
      );
      setUnreadCount(0);
    } catch {
      setUnreadCount(0);
    }
  };

  // -------------------------------------------------------------
  // DISTRACTION-FREE IMMERSIVE MODE (Quiz / Live Streaming)
  // -------------------------------------------------------------
  if (isDistractionFree) {
    return (
      <div className="min-h-screen bg-[#070709] font-sans text-[#F5F5F7] flex flex-col selection:bg-[#C5A880]/30 selection:text-white">
        {/* Floating Minimal Escape Banner */}
        <header className="sticky top-0 z-50 w-full px-4 py-3 bg-[#0F0F13]/90 backdrop-blur-xl border-b border-white/[0.04] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-[#A1A1AA] hover:text-white border border-white/[0.04] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Immersive View</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#71717A]">
              <span>Focus Session Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#71717A]">
              {user?.name || user?.email || 'Authenticated Candidate'}
            </span>
            <Badge variant="gold" dot>
              Distraction-Free
            </Badge>
          </div>
        </header>

        <main className="flex-1 w-full overflow-y-auto">{children}</main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PRIMARY ENTERPRISE WORKSPACE SHELL
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070709] font-sans text-[#F5F5F7] flex flex-col selection:bg-[#C5A880]/30 selection:text-white">
      {/* Keyboard Accessibility Skip Link */}
      <a
        href="#main-shell-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 z-[100] px-4 py-2 rounded-xl bg-[#C5A880] text-[#070709] font-bold text-xs shadow-xl outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      <div className="flex-1 flex w-full relative overflow-hidden">
        {/* ======================= DESKTOP SIDEBAR ======================= */}
        <motion.aside
          initial={false}
          animate={{ width: isCollapsed ? 76 : 260 }}
          transition={SPRING_TRANSITION}
          className="hidden md:flex flex-col shrink-0 bg-[#0F0F13]/95 backdrop-blur-2xl border-r border-white/[0.04] z-40 relative select-none"
        >
          {/* Brand Signature Bar */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-white/[0.04]">
            <div
              onClick={() => handleNavigate(
                userRole === 'admin'
                  ? '/admin/dashboard'
                  : userRole === 'instructor'
                  ? '/instructor/dashboard'
                  : '/student/dashboard'
              )}
              className="flex items-center gap-3 group overflow-hidden cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] shadow-sm shrink-0 transition-transform group-hover:scale-105">
                <GraduationCap className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col whitespace-nowrap"
                >
                  <span className="text-base font-extrabold tracking-tight text-white group-hover:text-[#C5A880] transition-colors">
                    FD_LMS
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.25em] text-[#C5A880] uppercase -mt-0.5">
                    {userRole.toUpperCase()} RAIL
                  </span>
                </motion.div>
              )}
            </div>

            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-xl text-[#71717A] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Navigation Links with Active Path Checking */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => handleNavigate(item.href)}
                  className={`w-full relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-colors group select-none cursor-pointer text-left ${
                    active ? 'text-white' : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Shared Layout Active Indicator (Spring Morphing) */}
                  {active && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-[#C5A880]/10 border border-[#C5A880]/30 rounded-2xl -z-10 shadow-[0_0_20px_rgba(197,168,128,0.06)]"
                      transition={SPRING_TRANSITION}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      active ? 'text-[#C5A880]' : 'text-[#71717A]'
                    }`}
                  />

                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Status Footer Dock */}
          <div className="p-3 border-t border-white/[0.04] bg-[#070709]/40">
            {user ? (
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <div className="w-8 h-8 rounded-xl bg-[#14141A] border border-white/15 flex items-center justify-center text-[#E5E5E7] text-xs font-bold shrink-0">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {user.name || 'Engineer'}
                    </p>
                    <p className="text-[10px] text-[#71717A] truncate font-mono">
                      {user.email}
                    </p>
                  </div>
                )}
                {!isCollapsed && (
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="p-1.5 text-[#71717A] hover:text-rose-400 transition-colors cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {!isCollapsed ? (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full h-8 rounded-xl bg-[#C5A880] text-[#070709] flex items-center justify-center text-xs font-bold cursor-pointer"
                    title="Sign In"
                    aria-label="Sign In"
                  >
                    <User className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.aside>

        {/* ======================= MAIN CANVAS ======================= */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Header Navigation Rail */}
          <header className="sticky top-0 z-30 w-full px-4 sm:px-6 lg:px-8 py-3.5 backdrop-blur-xl bg-[#070709]/85 border-b border-white/[0.04]">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              {/* Left: Mobile Toggle & Dynamic Breadcrumbs */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 rounded-xl bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/[0.04] cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-4 h-4" />
                </button>

                {/* Dynamic Breadcrumb Trail */}
                <nav
                  aria-label="Breadcrumbs"
                  className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-[#71717A] overflow-hidden whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => handleNavigate(
                      userRole === 'admin'
                        ? '/admin/dashboard'
                        : userRole === 'instructor'
                        ? '/instructor/dashboard'
                        : '/student/dashboard'
                    )}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Platform
                  </button>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.href}>
                      <span className="text-white/20">/</span>
                      {idx === breadcrumbs.length - 1 ? (
                        <span className="text-white font-semibold truncate max-w-[200px]">
                          {crumb.label}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleNavigate(crumb.href)}
                          className="hover:text-white transition-colors truncate max-w-[150px] cursor-pointer"
                        >
                          {crumb.label}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              </div>

              {/* Right: Actions, Notifications & Profile */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Catalog Navigation Quick Action */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/courses')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Catalog</span>
                </button>

                {/* Shopping Cart Button */}
                <button
                  type="button"
                  onClick={() => handleNavigate('/cart')}
                  className="relative p-2 rounded-xl bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/[0.04] hover:border-[#C5A880]/30 transition-all cursor-pointer"
                  title="View Shopping Cart"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C5A880] text-[#070709] text-[9px] font-black flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover Dock */}
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2 rounded-xl bg-[#14141A] text-[#A1A1AA] hover:text-white border border-white/[0.04] hover:border-[#C5A880]/30 transition-all cursor-pointer"
                    title="Notifications"
                    aria-label="View notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={SPRING_TRANSITION}
                        className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#0F0F13] border border-white/[0.06] shadow-2xl p-4 z-50 overflow-hidden"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                              Real-Time Telemetry
                            </h4>
                            {unreadCount > 0 && (
                              <Badge variant="danger" size="sm">
                                {unreadCount} New
                              </Badge>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllRead}
                              className="text-[10px] text-[#C5A880] hover:underline font-mono flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCheck className="w-3 h-3" /> Mark Read
                            </button>
                          )}
                        </div>

                        <div className="py-2 max-h-72 overflow-y-auto space-y-2 scrollbar-none">
                          {loadingNotifications ? (
                            <div className="p-6 text-center text-xs text-[#71717A] font-mono">
                              Querying notifications feed...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-[#71717A]">
                              All operational signals cleared.
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((n) => (
                              <div
                                key={n.id || n.notificationId}
                                className={`p-3 rounded-xl border text-xs transition-colors ${
                                  n.status === 'READ' || n.isRead
                                    ? 'bg-white/[0.01] border-white/[0.02] text-[#8E8E93]'
                                    : 'bg-[#C5A880]/5 border-[#C5A880]/20 text-[#E5E5E7]'
                                }`}
                              >
                                <p className="font-semibold text-white truncate">
                                  {n.title || n.subject || 'System Notification'}
                                </p>
                                <p className="text-[11px] text-[#A1A1AA] mt-0.5 line-clamp-2">
                                  {n.message || n.content}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="pt-2 border-t border-white/[0.04] text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setNotificationsOpen(false);
                              handleNavigate('/student/notifications');
                            }}
                            className="text-[11px] font-semibold text-[#C5A880] hover:text-white transition-colors cursor-pointer"
                          >
                            View All Telemetry Alerts &rarr;
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Avatar Popover Dock */}
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-[#14141A] border border-white/[0.04] hover:border-[#C5A880]/30 transition-all cursor-pointer"
                    aria-label="User profile options"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] text-xs font-bold">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={SPRING_TRANSITION}
                        className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#0F0F13] border border-white/[0.06] shadow-2xl p-2 z-50 text-xs font-medium"
                      >
                        <div className="px-3 py-2 border-b border-white/[0.04]">
                          <p className="font-bold text-white truncate">
                            {user?.name || 'Engineer'}
                          </p>
                          <p className="text-[10px] text-[#71717A] truncate font-mono">
                            {user?.email}
                          </p>
                          <div className="mt-1">
                            <Badge variant="gold" size="sm">
                              {userRole.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              handleNavigate('/student/profile');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                          >
                            <User className="w-4 h-4 text-[#C5A880]" />
                            <span>Identity Profile</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              handleNavigate('/student/orders');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4 text-[#C5A880]" />
                            <span>Billing & Orders</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileDropdownOpen(false);
                              handleNavigate('/student/notification-preferences');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors text-left cursor-pointer"
                          >
                            <Settings className="w-4 h-4 text-[#C5A880]" />
                            <span>Preferences</span>
                          </button>
                        </div>

                        <div className="border-t border-white/[0.04] my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Terminate Session</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          {/* Animated Page View Canvas */}
          <main id="main-shell-content" className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={SPRING_TRANSITION}
                className="w-full h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ======================= MOBILE DOCK DRAWER ======================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={SPRING_TRANSITION}
              className="relative w-full rounded-t-3xl bg-[#0F0F13] border-t border-white/[0.06] p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880]">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-white text-sm">
                    FD_LMS {userRole.toUpperCase()} RAIL
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-[#71717A] hover:text-white cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => handleNavigate(item.href)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold cursor-pointer text-left transition-colors ${
                        active
                          ? 'bg-[#C5A880]/15 border border-[#C5A880]/30 text-white'
                          : 'text-[#A1A1AA] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#C5A880]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AppShell;
