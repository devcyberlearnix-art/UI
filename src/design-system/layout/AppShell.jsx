import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Award,
  FileText,
  Video,
  ShoppingCart,
  Heart,
  CreditCard,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
  Shield,
  Users,
  CheckCheck,
  Layers,
  BarChart3,
  Image,
  FolderTree,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useAuth, normalizeRole } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { notificationApi } from '../../api/notificationApi';
import Badge from '../primitives/Badge';
import Button from '../primitives/Button';

// Spring transition specifications requested by the Principal Architect
const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 220,
  damping: 28,
};

// Paths identified as distraction-free immersive zones
const DISTRACTION_FREE_PATTERNS = [
  /\/quiz\//i,
  /\/quiz-runner/i,
  /\/live-classes\//i,
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
        const data = await notificationApi.getNotifications(user.id);
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.notifications || [];
        if (isMounted) {
          setNotifications(list);
          const unread = list.filter((n) => n.status !== 'READ' && !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        // Resilient fallback for unauthenticated or gateway unreachable
        if (isMounted) {
          setNotifications([]);
          setUnreadCount(0);
        }
      } finally {
        if (isMounted) setLoadingNotifications(false);
      }
    };

    fetchUserNotifications();
    const interval = setInterval(fetchUserNotifications, 30000); // 30s background revalidation
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  // Determine active normalized role
  const userRole = useMemo(() => {
    const rawRole = user?.role || user?.authorities?.[0] || 'student';
    return normalizeRole(rawRole);
  }, [user]);

  // Detect if current route requires distraction-free mode
  const isDistractionFree = useMemo(() => {
    return DISTRACTION_FREE_PATTERNS.some((pattern) =>
      pattern.test(location.pathname)
    );
  }, [location.pathname]);

  // Construct Role-Aware Navigation Schema
  const navigationItems = useMemo(() => {
    if (userRole === 'admin' || userRole === 'super_admin' || userRole === 'sub_admin') {
      return [
        { label: 'Command Hub', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Directory', href: '/admin/users', icon: Users },
        { label: 'Course Moderation', href: '/admin/courses', icon: BookOpen },
        { label: 'Instructor Approvals', href: '/admin/instructor-applications', icon: Shield },
        { label: 'Orders & Payments', href: '/admin/orders', icon: CreditCard },
        { label: 'Banner Showcase', href: '/admin/banners', icon: Image },
        { label: 'Reports & Telemetry', href: '/admin/reports', icon: BarChart3 },
        { label: 'Role Governance', href: '/admin/roles', icon: FolderTree },
      ];
    }

    if (userRole === 'instructor') {
      return [
        { label: 'Studio Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
        { label: 'My Courses', href: '/instructor/my-courses', icon: BookOpen },
        { label: 'Curriculum Builder', href: '/instructor/create-course', icon: Layers },
        { label: 'Assignments & Grading', href: '/instructor/assignments', icon: FileText },
        { label: 'Performance Analytics', href: '/instructor/analytics', icon: BarChart3 },
        { label: 'Account Profile', href: '/profile', icon: User },
      ];
    }

    // Default: STUDENT
    return [
      { label: 'Learning Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { label: 'My Enrollments', href: '/student/my-learning', icon: BookOpen },
      { label: 'Course Catalog', href: '/courses', icon: Sparkles },
      { label: 'Order History', href: '/student/orders', icon: CreditCard },
      { label: 'Saved Wishlist', href: '/student/wishlist', icon: Heart },
      { label: 'Notification Center', href: '/student/notifications', icon: Bell },
      { label: 'Alert Preferences', href: '/student/notification-preferences', icon: Sliders },
      { label: 'Student Profile', href: '/profile', icon: User },
    ];
  }, [userRole]);

  // Synchronized Dynamic Breadcrumbs
  const breadcrumbs = useMemo(() => {
    const rawSegments = location.pathname.split('/').filter(Boolean);
    if (rawSegments.length === 0) {
      return [{ label: 'Catalog', href: '/' }];
    }

    const friendlyNames = {
      student: 'Student Portal',
      instructor: 'Instructor Studio',
      admin: 'Admin Command',
      courses: 'Courses',
      dashboard: 'Dashboard',
      'my-learning': 'My Learning',
      quiz: 'Knowledge Quiz',
      certificate: 'Accreditation',
      'live-classes': 'Live Classroom',
      assignments: 'Assignments',
      orders: 'Orders',
      cart: 'Cart',
      checkout: 'Checkout',
      wishlist: 'Wishlist',
      profile: 'Profile',
      users: 'User Management',
      banners: 'Banners',
      reports: 'Reports',
      roles: 'Roles',
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
    } catch (e) {
      // optimistic state persistence
      setUnreadCount(0);
    }
  };

  // -------------------------------------------------------------
  // CORNER CASE: Distraction-Free Immersive Mode (Quiz / Live Streaming)
  // -------------------------------------------------------------
  if (isDistractionFree) {
    return (
      <div className="min-h-screen bg-obsidian-950 font-sans text-ink-100 flex flex-col selection:bg-brand-500/30 selection:text-white">
        {/* Floating Minimal Escape Banner */}
        <header className="sticky top-0 z-50 w-full px-4 py-3 bg-obsidian-900/80 backdrop-blur-xl border-b border-obsidian-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-ink-200 hover:text-white border border-white/5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Immersive View</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-ink-400">
              <span>Focus Session Active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ink-400">
              {user?.name || user?.email || 'Authenticated Candidate'}
            </span>
            <Badge variant="cyan" dot>
              Distraction-Free
            </Badge>
          </div>
        </header>

        {/* Pure Canvas View */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STANDARD ADAPTIVE APPLICATION SHELL
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-obsidian-950 font-sans text-ink-100 flex flex-col selection:bg-brand-500/30 selection:text-white">
      {/* Outer App Frame Container */}
      <div className="flex-1 flex w-full relative overflow-x-hidden">
        {/* ======================= SIDEBAR MENU ======================= */}
        <motion.aside
          animate={{
            width: isCollapsed ? 80 : 280,
          }}
          transition={SPRING_TRANSITION}
          className="hidden md:flex flex-col sticky top-4 left-4 h-[calc(100vh-2rem)] my-4 ml-4 rounded-3xl backdrop-blur-xl bg-obsidian-900/60 border border-obsidian-800/50 shadow-elevated-lg z-40 overflow-hidden shrink-0"
        >
          {/* Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-obsidian-800/40">
            <Link to="/" className="flex items-center gap-3 overflow-hidden group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent flex items-center justify-center text-white shadow-glow-brand shrink-0 transition-transform group-hover:scale-105">
                <GraduationCap className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col whitespace-nowrap"
                >
                  <span className="text-base font-extrabold tracking-tight text-white group-hover:text-brand-300 transition-colors">
                    ASIVO LMS
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.25em] text-brand-accent uppercase -mt-0.5">
                    {userRole.toUpperCase()} PORTAL
                  </span>
                </motion.div>
              )}
            </Link>

            {/* Collapse Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-xl text-ink-400 hover:text-white hover:bg-white/5 transition-colors"
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

          {/* Navigation Links with Shared Layout Background */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-none">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.href ||
                (item.href !== '/' &&
                  item.href !== '/admin/dashboard' &&
                  item.href !== '/student/dashboard' &&
                  item.href !== '/instructor/dashboard' &&
                  location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition-colors group select-none ${
                    isActive ? 'text-white' : 'text-ink-400 hover:text-ink-100'
                  }`}
                >
                  {/* Shared Layout Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavBackground"
                      className="absolute inset-0 bg-gradient-to-r from-brand-600/30 to-brand-accent/20 border border-brand-500/40 rounded-2xl -z-10 shadow-glow-brand"
                      transition={SPRING_TRANSITION}
                    />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-brand-300' : 'text-ink-400'
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
                </Link>
              );
            })}
          </nav>

          {/* User Status Footer Dock */}
          <div className="p-3 border-t border-obsidian-800/40 bg-obsidian-950/40">
            {user ? (
              <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {user.name || 'Engineer'}
                    </p>
                    <p className="text-[10px] text-ink-400 truncate font-mono">
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
                    className="p-1.5 text-ink-400 hover:text-rose-400 transition-colors"
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
                    className="w-full h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center text-xs font-bold"
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
          <header className="sticky top-0 z-30 w-full px-4 sm:px-6 lg:px-8 py-4 backdrop-blur-xl bg-obsidian-950/70 border-b border-obsidian-800/40">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              {/* Left: Mobile Toggle & Dynamic Breadcrumbs */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="md:hidden p-2 rounded-xl text-ink-400 hover:text-white hover:bg-white/5 transition-colors"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Synchronized Breadcrumb Trail */}
                <nav
                  aria-label="Breadcrumbs"
                  className="hidden sm:flex items-center gap-1.5 text-xs text-ink-400 truncate"
                >
                  <Link
                    to="/"
                    className="hover:text-white transition-colors font-medium shrink-0"
                  >
                    Home
                  </Link>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.href}>
                      <ChevronRight className="w-3 h-3 text-ink-600 shrink-0" />
                      <Link
                        to={crumb.href}
                        className={`transition-colors truncate ${
                          idx === breadcrumbs.length - 1
                            ? 'text-white font-semibold'
                            : 'hover:text-white'
                        }`}
                      >
                        {crumb.label}
                      </Link>
                    </React.Fragment>
                  ))}
                </nav>
              </div>

              {/* Right: Notification Tray & User Menu */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Cart Access */}
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl bg-obsidian-900/60 hover:bg-obsidian-800/80 border border-obsidian-800/50 text-ink-300 hover:text-white transition-colors"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Animated Real-Time Notifications Tray */}
                <div className="relative" ref={notificationRef}>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-2.5 rounded-xl bg-obsidian-900/60 hover:bg-obsidian-800/80 border border-obsidian-800/50 text-ink-300 hover:text-white transition-colors"
                    aria-label="Notifications tray"
                  >
                    <Bell className="w-4 h-4" />

                    {/* Pulse-pinging status dot */}
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-accent" />
                      </span>
                    )}
                  </motion.button>

                  {/* Notifications Popover Dropdown */}
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-3xl bg-obsidian-900/95 border border-obsidian-800/60 shadow-elevated-lg backdrop-blur-2xl p-4 z-50 text-xs"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-obsidian-800/40">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              Notifications
                            </span>
                            {unreadCount > 0 && (
                              <Badge variant="cyan" dot>
                                {unreadCount} unread
                              </Badge>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={handleMarkAllRead}
                              className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Mark read</span>
                            </button>
                          )}
                        </div>

                        {/* Notifications Content */}
                        <div className="max-h-72 overflow-y-auto py-2 space-y-2 scrollbar-none">
                          {loadingNotifications ? (
                            <div className="py-8 text-center text-ink-500">
                              Refreshing notification telemetry...
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-ink-500 flex flex-col items-center">
                              <CheckCircle2 className="w-8 h-8 text-ink-600 mb-2" />
                              <span>All caught up! No unread notifications.</span>
                            </div>
                          ) : (
                            notifications.slice(0, 6).map((item, index) => {
                              const isUnread =
                                item.status !== 'READ' && !item.isRead;
                              return (
                                <div
                                  key={item.id || index}
                                  className={`p-3 rounded-2xl border transition-all ${
                                    isUnread
                                      ? 'bg-brand-500/10 border-brand-500/30'
                                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-semibold text-white leading-tight">
                                      {item.title || item.subject || 'System Notice'}
                                    </p>
                                    {isUnread && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0 mt-1" />
                                    )}
                                  </div>
                                  <p className="text-ink-400 text-[11px] mt-1 line-clamp-2 leading-relaxed">
                                    {item.message || item.body || item.content}
                                  </p>
                                  <span className="text-[10px] text-ink-500 font-mono mt-1.5 block">
                                    {item.createdAt || 'Just now'}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Popover Footer */}
                        <div className="pt-2 border-t border-obsidian-800/40 text-center">
                          <Link
                            to="/student/notifications"
                            onClick={() => setNotificationsOpen(false)}
                            className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            View all in Notification Center →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Customized User Profile Drop-Down */}
                <div className="relative" ref={profileRef}>
                  {user ? (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-obsidian-900/60 hover:bg-obsidian-800/80 border border-obsidian-800/50 transition-all text-xs font-semibold text-white"
                      aria-label="User profile menu"
                    >
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-accent flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline max-w-[100px] truncate">
                        {user.name || user.email?.split('@')[0]}
                      </span>
                    </motion.button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </Button>
                  )}

                  {/* Profile Dropdown Popover */}
                  <AnimatePresence>
                    {profileDropdownOpen && user && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.96 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2.5 w-60 rounded-3xl bg-obsidian-900/95 border border-obsidian-800/60 shadow-elevated-lg backdrop-blur-2xl p-2 z-50 text-xs"
                      >
                        {/* Profile Identity Card */}
                        <div className="p-3 border-b border-obsidian-800/40 mb-1">
                          <p className="font-bold text-white text-sm truncate">
                            {user.name || 'Engineer'}
                          </p>
                          <p className="text-ink-400 text-[10px] truncate font-mono mt-0.5">
                            {user.email}
                          </p>
                          <div className="mt-2">
                            <Badge variant="brand" dot>
                              {userRole.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        {/* Navigation items within dropdown */}
                        <div className="space-y-0.5">
                          <Link
                            to={
                              userRole.includes('admin')
                                ? '/admin/dashboard'
                                : userRole === 'instructor'
                                ? '/instructor/dashboard'
                                : '/student/dashboard'
                            }
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-brand-400" />
                            <span>Workspace Dashboard</span>
                          </Link>

                          <Link
                            to="/profile"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <User className="w-4 h-4 text-cyan-400" />
                            <span>Account Settings</span>
                          </Link>

                          <Link
                            to="/student/notification-preferences"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Sliders className="w-4 h-4 text-amber-400" />
                            <span>Notification Rules</span>
                          </Link>
                        </div>

                        <div className="border-t border-obsidian-800/40 my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
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
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
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
              className="relative w-full rounded-t-3xl bg-obsidian-900 border-t border-obsidian-800/80 p-5 shadow-elevated-lg z-10 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-obsidian-800/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-white text-sm">
                    ASIVO {userRole.toUpperCase()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-ink-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold ${
                        isActive
                          ? 'bg-brand-600/20 border border-brand-500/40 text-white'
                          : 'text-ink-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-brand-300" />
                      <span>{item.label}</span>
                    </Link>
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
