import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Heart,
  User,
  LogOut,
  GraduationCap,
  LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cartApi } from '../api/cartApi';
import ThemeToggle from '../components/common/ThemeToggle';

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const navigate = useNavigate();
  const location = useLocation();
  const isCoursesPage = location.pathname.startsWith('/courses');

  // Sync user state from storage
  const updateUser = () => {
    const storedUser = localStorage.getItem('lms_user');
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

  // Sync cart count
  const updateCartCount = () => {
    const cart = localStorage.getItem('lms_cart');
    const items = cart ? JSON.parse(cart) : [];
    const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(count);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    updateUser();
    updateCartCount();

    // Cart count updated via local storage and order context

    const handleStorage = (e) => {
      if (e.key === 'lms_user') updateUser();
      if (e.key === 'lms_cart') updateCartCount();
    };

    const handleCustomEvents = () => {
      updateUser();
      updateCartCount();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('userLoggedIn', handleCustomEvents);
    window.addEventListener('userLoggedOut', handleCustomEvents);
    window.addEventListener('cartUpdated', updateCartCount);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('userLoggedIn', handleCustomEvents);
      window.removeEventListener('userLoggedOut', handleCustomEvents);
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_token');
    setUser(null);
    window.dispatchEvent(new Event('userLoggedOut'));
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: 'Explore Courses', href: '/courses' },
    { label: 'Certifications', href: '/verify-certificate' },
    { label: 'Teach on FD_LMS', href: '/instructor/apply' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    const role = (user.role || '').toUpperCase();
    if (role.includes('ADMIN')) return '/admin/dashboard';
    if (role.includes('INSTRUCTOR')) return '/instructor/dashboard';
    return '/student/dashboard';
  };

  return (
    <>
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 z-[100] px-4 py-2 rounded-xl bg-[#5B3E57] text-[#FFFEFA] dark:bg-[#D1A7CC] dark:text-[#151413] font-bold text-xs shadow-xl outline-none ring-2 ring-white"
      >
        Skip to main content
      </a>

      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#FFFEFA]/95 dark:bg-[#151413]/95 backdrop-blur-xl border-b border-[#E3DCD3] dark:border-white/[0.06] py-3 shadow-card'
            : 'bg-[#FFFEFA]/85 dark:bg-[#151413]/85 backdrop-blur-md border-b border-[#E3DCD3]/80 dark:border-white/[0.04] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4">
            {/* Brand Signature */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#5B3E57]/20 dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] shadow-xs transition-transform group-hover:scale-105">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-[#282521] dark:text-[#EDE8E1] group-hover:text-[#5B3E57] dark:group-hover:text-[#D1A7CC] transition-colors">
                  ASIVO
                </span>
                <span className="hidden sm:block text-[9px] font-bold tracking-[0.25em] text-[#5B3E57] dark:text-[#D1A7CC] uppercase -mt-0.5">
                  ENTERPRISE
                </span>
              </div>
            </Link>

            {/* Offline Network Alert Beacon */}
            {!isOnline && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-500 font-mono text-[10px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>OFFLINE MESH</span>
              </div>
            )}

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 bg-[#EAE5DC] dark:bg-[#1D1C1A] p-1 rounded-xl border border-[#E3DCD3] dark:border-white/[0.06]">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`relative px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isActive ? 'text-[#5B3E57] dark:text-[#D1A7CC] font-bold' : 'text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1]'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="publicNavActive"
                        className="absolute inset-0 bg-[#FFFEFA] dark:bg-[#D1A7CC]/15 border border-[#E3DCD3] dark:border-[#D1A7CC]/30 rounded-lg -z-10 shadow-xs"
                        transition={SPRING_TRANSITION}
                      />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Architectural Search Input */}
            {!isCoursesPage && (
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex flex-1 max-w-sm mx-4"
              >
                <div className="relative w-full group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search curriculum..."
                    className="w-full pl-9 pr-4 py-2 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D8D0C5] dark:border-white/[0.08] rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] placeholder-[#827B71] dark:placeholder-[#7A7368] focus:outline-none focus:border-[#5B3E57] dark:focus:border-[#D1A7CC] focus:ring-1 focus:ring-[#5B3E57]/30 transition-all"
                  />
                  <button type="submit" className="absolute left-3 top-2.5 text-[#827B71] group-focus-within:text-[#5B3E57] dark:group-focus-within:text-[#D1A7CC] transition-colors cursor-pointer" aria-label="Submit search"><Search className="h-3.5 w-3.5" /></button>
                </div>
              </form>
            )}

            {/* Right Action Icons & Controls */}
            <div className="hidden md:flex items-center gap-2 sm:gap-3">
              <ThemeToggle size="sm" />
              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2 rounded-xl bg-[#EAE5DC] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1] hover:border-[#D8D0C5] dark:hover:border-white/[0.1] transition-all"
                aria-label="Wishlist"
              >
                <Heart className="w-4 h-4" />
              </Link>

              {/* Shopping Cart with Gold Counter and Spring Pop Scaling */}
              <Link
                to="/cart"
                className="relative p-2 rounded-xl bg-[#EAE5DC] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1] hover:border-[#D8D0C5] dark:hover:border-white/[0.1] transition-all"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={SPRING_TRANSITION}
                      className="absolute -top-1.5 -right-1.5 bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] font-mono text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs select-none"
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Auth Session Dropdown */}
              {user ? (
                <div className="relative">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#EAE5DC] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B3E57]"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#F2ECF1] dark:bg-[#D1A7CC]/20 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] text-[10px] font-bold uppercase shadow-2xs">
                      {(user.name || user.email || 'U').charAt(0)}
                    </div>
                    <span className="max-w-[100px] truncate text-xs text-[#282521] dark:text-[#EDE8E1]">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-card backdrop-blur-2xl p-2 z-50 text-xs text-[#282521] dark:text-[#EDE8E1]"
                      >
                      <div className="px-3 py-2 border-b border-[#E3DCD3] dark:border-white/[0.06] mb-1">
                        <p className="font-semibold text-[#282521] dark:text-white truncate">{user.name || 'User'}</p>
                        <p className="text-[#756E64] dark:text-[#7A7368] text-[10px] truncate font-mono">{user.email}</p>
                      </div>

                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-white hover:bg-[#EAE5DC]/60 dark:hover:bg-white/[0.04] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                        <span>Workspace Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-white hover:bg-[#EAE5DC]/60 dark:hover:bg-white/[0.04] transition-colors"
                      >
                        <User className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                        <span>Account Profile</span>
                      </Link>

                      <div className="border-t border-[#E3DCD3] dark:border-white/[0.06] my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9B3835] dark:text-[#D66B67] hover:bg-[#FAECEB] dark:hover:bg-[#D66B67]/15 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Terminate Session</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1] transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="px-4 py-1.5 bg-[#5B3E57] text-[#FFFEFA] hover:bg-[#462D42] dark:bg-[#D1A7CC] dark:text-[#151413] dark:hover:bg-[#E0BFDC] rounded-xl text-xs font-bold transition-all shadow-xs active:scale-98 cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xl text-[#8E8E93] hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={SPRING_TRANSITION}
              className="md:hidden mt-3 pb-4 space-y-3 overflow-hidden border-t border-white/[0.04] pt-3"
            >
              {!isCoursesPage && (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-9 pr-4 py-2 bg-[#0F0F13] border border-white/[0.06] rounded-xl text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]"
                  />
                  <button type="submit" className="absolute left-3 top-2.5 text-[#71717A] cursor-pointer" aria-label="Submit search"><Search className="h-3.5 w-3.5" /></button>
                </form>
              )}

              <div className="flex flex-col space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[#8E8E93] hover:text-[#F5F5F7] hover:bg-white/[0.04]"
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  to="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#8E8E93] hover:text-[#F5F5F7] hover:bg-white/[0.04] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart size={14} />
                    <span>Cart</span>
                  </span>
                  {cartCount > 0 && (
                    <span className="bg-[#C5A880] text-[#070709] px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-[#8E8E93] hover:text-[#F5F5F7] hover:bg-white/[0.04] flex items-center gap-2"
                >
                  <Heart size={14} />
                  <span>Wishlist</span>
                </Link>

                {user ? (
                  <>
                    <Link
                      to={getDashboardPath()}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-[#C5A880] hover:bg-white/[0.04] flex items-center gap-2"
                    >
                      <LayoutDashboard size={14} />
                      <span>Workspace Dashboard</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="flex-1 py-2 rounded-xl border border-white/[0.06] text-xs font-semibold text-[#F5F5F7] hover:bg-white/[0.04]"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/register');
                      }}
                      className="flex-1 py-2 rounded-xl bg-[#C5A880] text-[#070709] text-xs font-bold hover:bg-[#D4BC98]"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
    </>
  );
};

export default Navbar;