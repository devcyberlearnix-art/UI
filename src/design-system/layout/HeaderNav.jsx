import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ShoppingCart,
  Heart,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  BookOpen,
  Award,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrder } from '../../context/OrderContext';
import { cmsPublicApi } from '../../api/cmsApi';
import Button from '../primitives/Button';
import ThemeToggle from '../../components/common/ThemeToggle';

// Intentional spring physics configuration per architectural specification
const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

const sanitizeNavLabel = (label = '') => {
  let cleaned = label.replace(/#\d+/g, '').trim();
  const lower = cleaned.toLowerCase();
  if (lower === 'explore') return 'Explore Courses';
  if (lower === 'teach on fd_lms' || lower === 'teach') return 'For Instructors';
  return cleaned;
};

export const HeaderNav = ({ onSearchClick, initialNav = null, initialSettings = null }) => {
  const { user, logout } = useAuth();
  const { cartCount = 0 } = useOrder() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Clean and deduplicate navigation links
  const [navItems, setNavItems] = useState(() => {
    if (Array.isArray(initialNav) && initialNav.length > 0) {
      return initialNav
        .filter(item => item && item.destination !== '/cloud' && !item.label?.toLowerCase().includes('cloud matrix'))
        .map(item => ({
          label: sanitizeNavLabel(item.label),
          href: item.destination || item.href || '/courses',
        }));
    }
    return [
      { label: 'Explore Courses', href: '/courses' },
      { label: 'Certifications', href: '/certifications' },
      { label: 'For Instructors', href: '/instructor/apply' },
    ];
  });

  const [brand, setBrand] = useState(() => ({
    name: initialSettings?.['brand.name'] || 'FD_LMS',
    tagline: initialSettings?.['brand.tagline'] || 'ENGINEERING PLATFORM',
    logoUrl: initialSettings?.['brand.logoUrl'] || '',
  }));

  // Keyboard navigation & accessibility: Escape key closes menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadCmsNav() {
      try {
        const [navRes, settingsRes] = await Promise.allSettled([
          cmsPublicApi.getNavigation(),
          cmsPublicApi.getSiteSettings(),
        ]);
        if (!isMounted) return;

        if (navRes.status === 'fulfilled' && navRes.value) {
          const list = navRes.value?.data || navRes.value;
          if (Array.isArray(list) && list.length > 0) {
            const seen = new Set();
            const cleanedList = [];

            for (const item of list) {
              if (!item || item.isVisible === false) continue;
              const rawLabel = item.label || '';
              // Exclude invalid, dead, or internal test matrix entries
              const href = item.destination || item.href || '/courses';
              if (rawLabel.toLowerCase().includes('cloud matrix') || href === '/cloud') {
                continue;
              }
              const label = sanitizeNavLabel(rawLabel);
              const dedupKey = `${label.toLowerCase()}-${href.toLowerCase()}`;
              if (!seen.has(dedupKey)) {
                seen.add(dedupKey);
                cleanedList.push({ label, href });
              }
            }

            if (cleanedList.length > 0) {
              setNavItems(cleanedList);
            }
          }
        }

        if (settingsRes.status === 'fulfilled' && settingsRes.value) {
          const s = settingsRes.value?.data || settingsRes.value;
          if (s && typeof s === 'object') {
            setBrand({
              name: s['brand.name'] || 'FD_LMS',
              tagline: s['brand.tagline'] || 'ENGINEERING PLATFORM',
              logoUrl: s['brand.logoUrl'] || '',
            });
          }
        }
      } catch {
        // Fallback already in place
      }
    }
    loadCmsNav();
    return () => { isMounted = false; };
  }, []);

  // Compute adaptive nav links based on role
  const dynamicNavLinks = useMemo(() => {
    const links = [...navItems];
    if (user) {
      const role = (user.role || '').toUpperCase();
      if (role === 'STUDENT' || (!role.includes('ADMIN') && role !== 'INSTRUCTOR')) {
        if (!links.some(l => l.href.includes('student/dashboard') || l.href.includes('my-learning'))) {
          links.unshift({ label: 'My Learning', href: '/student/dashboard' });
        }
      } else if (role === 'INSTRUCTOR') {
        if (!links.some(l => l.href.includes('instructor/dashboard'))) {
          links.unshift({ label: 'Instructor Hub', href: '/instructor/dashboard' });
        }
      } else if (role.includes('ADMIN')) {
        if (!links.some(l => l.href.includes('admin/dashboard'))) {
          links.unshift({ label: 'Admin Console', href: '/admin/dashboard' });
        }
      }
    }
    return links;
  }, [navItems, user]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    const role = (user.role || '').toUpperCase();
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '/admin/dashboard';
    if (role === 'INSTRUCTOR') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <div className="max-w-7xl mx-auto rounded-2xl bg-[#FFFEFA]/95 dark:bg-[#1D1C1A]/95 border border-[#E3DCD3] dark:border-white/[0.08] shadow-card backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all">
        {/* Brand Identity Signature with improved prominence */}
        <Link to="/" className="flex items-center gap-3 group" title="ASIVO Home">
          <div className="w-10 h-10 rounded-xl bg-[#FFFEFA] dark:bg-[#272523] border border-[#5B3E57]/20 dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] font-black shadow-xs transition-transform group-hover:scale-105 overflow-hidden">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain p-1" />
            ) : (
              <GraduationCap className="w-5 h-5 text-[#5B3E57] dark:text-[#D1A7CC]" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#282521] dark:text-[#EDE8E1] group-hover:text-[#5B3E57] dark:group-hover:text-[#D1A7CC] transition-colors leading-tight">
              {brand.name === 'FD_LMS' ? 'ASIVO' : brand.name}
            </span>
            {brand.tagline && (
              <span className="hidden sm:inline text-[9px] font-bold tracking-[0.2em] text-[#5B3E57] dark:text-[#D1A7CC] uppercase">
                {brand.tagline}
              </span>
            )}
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 bg-[#EAE5DC] dark:bg-[#151413]/80 p-1 rounded-xl border border-[#E3DCD3] dark:border-white/[0.06]">
          {dynamicNavLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className="relative px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-colors rounded-lg select-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute inset-0 bg-[#FFFEFA] dark:bg-[#D1A7CC]/15 border border-[#E3DCD3] dark:border-[#D1A7CC]/40 rounded-lg shadow-xs -z-10"
                    transition={SPRING_TRANSITION}
                  />
                )}
                <span className={isActive ? 'text-[#5B3E57] dark:text-[#D1A7CC] font-bold' : 'text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-white'}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <ThemeToggle size="sm" />

          {/* Search Trigger with Tooltip */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearchClick || (() => navigate('/courses'))}
            className="p-2 rounded-xl text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-white hover:bg-[#EAE5DC]/60 dark:hover:bg-white/[0.04] border border-transparent hover:border-[#E3DCD3] dark:hover:border-white/[0.06] transition-all cursor-pointer"
            aria-label="Search courses catalog"
            title="Search Catalog"
          >
            <Search className="w-4 h-4" />
          </motion.button>

          {/* Cart Icon with Tooltip */}
          <Link
            to="/cart"
            className="relative p-2 rounded-xl text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-white hover:bg-[#EAE5DC]/60 dark:hover:bg-white/[0.04] border border-transparent hover:border-[#E3DCD3] dark:hover:border-white/[0.06] transition-all"
            aria-label="View shopping cart"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] text-[10px] font-bold flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Wishlist Icon with Tooltip */}
          <Link
            to="/wishlist"
            className="p-2 rounded-xl text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-white hover:bg-[#EAE5DC]/60 dark:hover:bg-white/[0.04] border border-transparent hover:border-[#E3DCD3] dark:hover:border-white/[0.06] transition-all hidden sm:flex"
            aria-label="View saved courses wishlist"
            title="Saved Wishlist"
          >
            <Heart className="w-4 h-4" />
          </Link>

          {/* User Auth State Controls */}
          {user ? (
            <div className="relative">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#EAE5DC] dark:bg-[#1D1C1A] hover:bg-[#E1DBD0] dark:hover:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.08] hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 transition-all text-xs font-semibold text-[#282521] dark:text-[#EDE8E1]"
                aria-label="User profile menu"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-6 h-6 rounded-lg bg-[#F2ECF1] dark:bg-[#D1A7CC]/20 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] text-xs font-bold uppercase shadow-2xs">
                  {(user.name || user.email || 'U').charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate text-[#282521] dark:text-[#EDE8E1]">
                  {user.name || user.email?.split('@')[0]}
                </span>
              </motion.button>

              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-card backdrop-blur-2xl p-2 z-50 text-xs text-[#282521] dark:text-[#EDE8E1]"
                  >
                    <div className="px-3 py-2 border-b border-[#E3DCD3] dark:border-white/[0.06] mb-1">
                      <p className="font-semibold text-[#282521] dark:text-white truncate">{user.name || 'User'}</p>
                      <p className="text-[#756E64] dark:text-[#7A7368] text-[10px] truncate">{user.email}</p>
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
                      <span>Account Settings</span>
                    </Link>

                    <div className="border-t border-[#E3DCD3] dark:border-white/[0.06] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#9B3835] dark:text-[#D66B67] hover:bg-[#FAECEB] dark:hover:bg-[#D66B67]/15 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/login')}
                className="px-3.5 font-semibold text-xs"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
                className="px-4 font-bold text-xs"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#635E56] hover:text-[#282521] dark:text-[#A69F94] dark:hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={SPRING_TRANSITION}
            className="md:hidden mt-2 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] p-4 shadow-card backdrop-blur-2xl overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              <div className="pb-2 border-b border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#635E56] dark:text-[#A69F94]">Appearance</span>
                <ThemeToggle size="sm" showLabel />
              </div>
              {dynamicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-white hover:bg-[#EAE5DC]/60 dark:hover:bg-white/[0.04] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-xs font-semibold"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                    className="w-full text-xs font-bold"
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default HeaderNav;
