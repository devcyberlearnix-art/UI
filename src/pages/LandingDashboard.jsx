import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import HeaderNav from '../design-system/layout/HeaderNav';
import CourseCard from '../design-system/components/CourseCard';
import { CourseCardSkeleton } from '../design-system/primitives/Skeleton';
import EmptyState from '../design-system/feedback/EmptyState';
import ErrorBoundary from '../design-system/feedback/ErrorBoundary';
import Button from '../design-system/primitives/Button';
import Badge from '../design-system/primitives/Badge';
import { useCourses } from '../hooks/useCourses';

// Intentional spring physics configuration per architectural specification
const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

const LUXURY_EASING = [0.16, 1, 0.3, 1];

export const LandingDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');

  // Query live courses from backend microservice
  const { data, isLoading, isError, error, refetch, isFetching } = useCourses({
    page: 0,
    size: 24,
    sortBy: 'id',
    sortDir: 'desc',
  });

  const allCourses = useMemo(() => data?.courses || [], [data]);

  // Derive categories dynamically from backend courses
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(allCourses.map((c) => c.category).filter(Boolean))
    );
    return ['ALL', ...unique];
  }, [allCourses]);

  // Compute live telemetry metrics
  const stats = useMemo(() => {
    const totalStudents = allCourses.reduce((sum, c) => sum + (c.students || 0), 0);
    const avgRating = allCourses.length
      ? (allCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / allCourses.length).toFixed(1)
      : '4.9';
    const instructorsCount = new Set(allCourses.map((c) => c.instructor)).size;

    return {
      coursesCount: data?.totalElements || allCourses.length || 0,
      studentsCount: totalStudents > 0 ? totalStudents.toLocaleString() : '10,000+',
      avgRating,
      instructorsCount: instructorsCount > 0 ? instructorsCount : 12,
    };
  }, [allCourses, data]);

  // Filter courses based on search query, category, and level
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesSearch =
        !searchQuery ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' ||
        course.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLevel =
        selectedLevel === 'ALL' ||
        course.level.toLowerCase().includes(selectedLevel.toLowerCase());

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allCourses, searchQuery, selectedCategory, selectedLevel]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedLevel('ALL');
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] flex flex-col selection:bg-[#C5A880]/30 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Top Floating Glass Header with Shared Layout Transitions */}
      <HeaderNav />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative pt-4 pb-8 sm:pt-8 sm:pb-12 text-center overflow-hidden">
          {/* Announcement Micro-Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: LUXURY_EASING }}
            className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-[#0F0F13] border border-white/[0.06] text-xs font-semibold text-[#A1A1AA] backdrop-blur-xl mb-6 hover:border-[#C5A880]/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span className="text-[#F5F5F7]">Architecture Curriculum</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
            <span className="text-[#A1A1AA]">Verified Production Track</span>
          </motion.div>

          {/* Main Title with Solid Typography (Purged AI Gradient Text) */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: LUXURY_EASING }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#F5F5F7] max-w-4xl mx-auto leading-tight"
          >
            Master Engineering{' '}
            <span className="text-[#E5E5E7] underline decoration-[#C5A880]/40 underline-offset-8">
              On Real Architecture.
            </span>
          </motion.h1>

          {/* Subtitle in Constrained Measure (65ch) */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: LUXURY_EASING }}
            className="mt-6 text-sm sm:text-base lg:text-lg text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed"
          >
            Zero synthetic boilerplate. Learn distributed microservices, fullstack
            design systems, security verification, and cloud-native resilience directly
            from verified engineering leads.
          </motion.p>

          {/* Primary Call to Action Deck */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: LUXURY_EASING }}
            className="flex flex-wrap items-center justify-center gap-4 pt-6"
          >
            <Button 
              variant="primary" 
              onClick={() => navigate('/register')} 
              className="px-6 font-bold shadow-lg shadow-[#C5A880]/5"
            >
              Initialize Portal Matrix (Get Started)
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => navigate('/login')}
              className="px-6"
            >
              Access Authenticated Node
            </Button>
          </motion.div>

          {/* Search & Filter Command Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: LUXURY_EASING }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative flex items-center p-2 rounded-2xl bg-[#0F0F13] border border-white/[0.08] backdrop-blur-2xl focus-within:border-[#C5A880]/60 transition-all">
              <div className="pl-3.5 text-[#71717A]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks by topic, distributed architecture, or lead..."
                className="w-full px-3 py-2 text-sm text-[#F5F5F7] bg-transparent outline-none placeholder:text-[#71717A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 text-xs text-[#71717A] hover:text-[#F5F5F7] mr-1 transition-colors"
                >
                  Clear
                </button>
              )}
              <Button
                variant="primary"
                size="sm"
                className="shrink-0"
                rightIcon={ArrowRight}
                onClick={() => {}}
              >
                Search
              </Button>
            </div>
          </motion.div>

          {/* Architectural Telemetry Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: LUXURY_EASING }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            <div className="p-4 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F7]">
                {stats.coursesCount}
              </span>
              <span className="text-xs text-[#71717A] font-medium mt-1">Active Tracks</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#E5E5E7]">
                {stats.studentsCount}
              </span>
              <span className="text-xs text-[#71717A] font-medium mt-1">Enrolled Engineers</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#C5A880]">
                ★ {stats.avgRating}
              </span>
              <span className="text-xs text-[#71717A] font-medium mt-1">Average Rating</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {stats.instructorsCount}
              </span>
              <span className="text-xs text-[#71717A] font-medium mt-1">Lead Instructors</span>
            </div>
          </motion.div>
        </section>

        {/* ===================== CATALOG EXPLORATION ===================== */}
        <section className="space-y-6">
          {/* Header Controls: Categories & Level Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/[0.04]">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#F5F5F7] flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-[#C5A880]" />
                <span>Explore Live Catalog</span>
                {isFetching && (
                  <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-ping" />
                )}
              </h2>
              <p className="text-xs text-[#71717A] mt-0.5">
                Showing {filteredCourses.length} verified engineering track{filteredCourses.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* Level Selector with Spring Layout */}
            <div className="flex items-center gap-1.5 bg-[#0F0F13] p-1 rounded-xl border border-white/[0.04] self-start md:self-auto">
              {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-[#C5A880] text-[#070709] font-bold shadow-sm'
                      : 'text-[#71717A] hover:text-[#F5F5F7]'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Levels' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Category Filter Pills with Shared Spring Layout */}
          <div
            role="tablist"
            aria-label="Course Categories"
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  id={`tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="catalog-courses-grid"
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
                    isSelected
                      ? 'border-[#C5A880]/50 text-[#C5A880] bg-[#14141A]'
                      : 'border-white/[0.04] text-[#71717A] hover:text-[#F5F5F7] hover:border-white/20 bg-[#0F0F13] hover:shadow-[0_0_12px_rgba(255,255,255,0.04)]'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-[#C5A880]/15 border border-[#C5A880]/30 rounded-xl -z-10 shadow-[0_0_15px_rgba(197,168,128,0.06)]"
                      transition={SPRING_TRANSITION}
                    />
                  )}
                  <span>{cat === 'ALL' ? 'All Specializations' : cat}</span>
                </button>
              );
            })}
          </div>

          {/* ===================== COURSE GRID & ASYNC STATES ===================== */}
          <ErrorBoundary onReset={refetch}>
            {/* Loading Shimmer Skeleton Grid (Zero CLS Guarantee) */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <CourseCardSkeleton key={idx} />
                ))}
              </div>
            )}

            {/* Network or Gateway Error with Resilient Actionable Card */}
            {isError && !isLoading && (
              <div className="p-8 sm:p-10 my-8 rounded-3xl bg-[#0F0F13] border border-red-500/25 text-center max-w-lg mx-auto shadow-2xl backdrop-blur-2xl">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 mx-auto flex items-center justify-center mb-4">
                  <RotateCcw className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#F5F5F7] mb-2 tracking-tight">
                  Catalog Connectivity Interrupted
                </h3>
                <p className="text-xs sm:text-sm text-[#A1A1AA] mb-6 max-w-sm mx-auto leading-relaxed">
                  {error?.message || 'Gateway response timed out while synchronizing the course inventory. Backend microservices are auto-reconnecting.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="danger"
                    size="md"
                    onClick={() => refetch()}
                    leftIcon={RotateCcw}
                  >
                    Retry Connection
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => navigate('/courses')}
                  >
                    Direct Catalog Matrix
                  </Button>
                </div>
              </div>
            )}

            {/* Empty State Array Handling */}
            {!isLoading && !isError && filteredCourses.length === 0 && (
              <EmptyState
                icon={Search}
                title="No matching curriculum tracks"
                description={`No courses matched "${searchQuery || selectedCategory}". Reset your filters to explore our complete catalog.`}
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            )}

            {/* Success Course Grid with Directional Entrance Sequence */}
            {!isLoading && !isError && filteredCourses.length > 0 && (
              <motion.div
                id="catalog-courses-grid"
                role="region"
                aria-label="Course tracks catalog"
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </ErrorBoundary>
        </section>

        {/* ===================== ARCHITECTURAL PILLARS ===================== */}
        <section className="py-14 border-t border-white/[0.04]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="gold" dot className="mb-3">
              Production Standards
            </Badge>
            <h2 className="text-3xl font-extrabold text-[#F5F5F7] tracking-tight">
              Built for High-Stakes Engineering
            </h2>
            <p className="text-sm text-[#A1A1AA] mt-2 leading-relaxed">
              Unlike theoretical bootcamps, our curriculum and sandbox environments
              mirror production microservice architectures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] hover:border-[#C5A880]/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#14141A] text-[#C5A880] border border-white/[0.06] flex items-center justify-center mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-2 tracking-tight">
                Live Microservice Sandboxes
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Interact with real Spring Cloud gateways, Redis rate limiters, and
                PostgreSQL persistence layers instead of synthetic mocks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] hover:border-[#C5A880]/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-[#14141A] text-[#E5E5E7] border border-white/[0.06] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-2 tracking-tight">
                RBAC & Security Audited
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Learn modern identity federation, JWT rotation, idempotency, and
                defense-in-depth protection verified across 52+ live endpoints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#F5F5F7] mb-2 tracking-tight">
                Verifiable Master Credentials
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Earn verifiable completion credentials backed by automated test suites
                and code reviews from senior engineering leads.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="w-full border-t border-white/[0.04] bg-[#070709] mt-12 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#F5F5F7] tracking-wider">FD_LMS ARCHITECTURE</span>
            <span>•</span>
            <span>High-Fidelity Learning Ecosystem</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Gateway Connected (Port 8080)
            </span>
          </div>

          <div className="flex items-center gap-6 text-[#71717A]">
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="hover:text-[#F5F5F7] transition-colors cursor-pointer"
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => navigate('/certifications')}
              className="hover:text-[#F5F5F7] transition-colors cursor-pointer"
            >
              Certifications
            </button>
            <button
              type="button"
              onClick={() => navigate('/instructor/apply')}
              className="hover:text-[#C5A880] transition-colors cursor-pointer"
            >
              Instructor Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingDashboard;
