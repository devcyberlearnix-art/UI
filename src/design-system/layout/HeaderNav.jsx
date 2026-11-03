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
      <div className="max-w-7xl mx-auto rounded-2xl bg-[#0F0F13]/95 border border-white/[0.06] shadow-[0_12px_36px_-8px_rgba(0,0,0,0.85)] backdrop-blur-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all">
        {/* Brand Identity Signature with improved prominence */}
        <Link to="/" className="flex items-center gap-3 group" title="FD_LMS Home">
          <div className="w-10 h-10 rounded-xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] font-black shadow-sm transition-transform group-hover:scale-105 overflow-hidden">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain p-1" />
            ) : (
              <GraduationCap className="w-5 h-5 text-[#C5A880]" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white group-hover:text-[#C5A880] transition-colors leading-tight">
              {brand.name}
            </span>
            {brand.tagline && (
              <span className="hidden sm:inline text-[9px] font-bold tracking-[0.2em] text-[#C5A880] uppercase">
                {brand.tagline}
              </span>
            )}
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1 bg-[#070709]/80 p-1 rounded-xl border border-white/[0.04]">
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
                    className="absolute inset-0 bg-[#C5A880]/15 border border-[#C5A880]/40 rounded-lg shadow-[0_0_15px_rgba(197,168,128,0.08)] -z-10"
                    transition={SPRING_TRANSITION}
                  />
                )}
                <span className={isActive ? 'text-white font-bold' : 'text-[#A1A1AA] hover:text-white'}>
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger with Tooltip */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearchClick || (() => navigate('/courses'))}
            className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all cursor-pointer"
            aria-label="Search courses catalog"
            title="Search Catalog"
          >
            <Search className="w-4 h-4" />
          </motion.button>

          {/* Cart Icon with Tooltip */}
          <Link
            to="/cart"
            className="relative p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all"
            aria-label="View shopping cart"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C5A880] text-[#070709] text-[10px] font-bold flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* Wishlist Icon with Tooltip */}
          <Link
            to="/wishlist"
            className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all hidden sm:flex"
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
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-[#14141A] hover:bg-[#1B1B24] border border-white/[0.08] hover:border-[#C5A880]/40 transition-all text-xs font-semibold text-[#F5F5F7]"
                aria-label="User profile menu"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-6 h-6 rounded-lg bg-[#C5A880]/15 border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] text-xs font-bold uppercase shadow-sm">
                  {(user.name || user.email || 'U').charAt(0)}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate text-white">
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
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0F0F13]/98 border border-white/[0.08] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-2 z-50 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.04] mb-1">
                      <p className="font-semibold text-white truncate">{user.name || 'User'}</p>
                      <p className="text-[#71717A] text-[10px] truncate">{user.email}</p>
                    </div>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#C5A880]" />
                      <span>Workspace Dashboard</span>
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#E5E5E7]" />
                      <span>Account Settings</span>
                    </Link>

                    <div className="border-t border-white/[0.04] my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
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
                className="text-white hover:text-[#C5A880] border-white/10 hover:border-white/20 px-3.5 font-semibold text-xs"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
                className="px-4 font-bold text-xs shadow-md shadow-[#C5A880]/10"
              >
                Get Started
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#A1A1AA] hover:text-white"
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
            className="md:hidden mt-2 rounded-2xl bg-[#0F0F13]/98 border border-white/[0.08] p-4 shadow-2xl backdrop-blur-2xl overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {dynamicNavLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors"
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
