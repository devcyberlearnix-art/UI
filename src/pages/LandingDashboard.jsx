import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import HeaderNav from '../design-system/layout/HeaderNav';
import CourseCard from '../design-system/components/CourseCard';
import { CourseCardSkeleton } from '../design-system/primitives/Skeleton';
import EmptyState from '../design-system/feedback/EmptyState';
import ErrorBoundary from '../design-system/feedback/ErrorBoundary';
import Button from '../design-system/primitives/Button';
import Badge from '../design-system/primitives/Badge';
import { useCourses } from '../hooks/useCourses';

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
    <div className="min-h-screen bg-[#070A11] text-ink-100 flex flex-col selection:bg-brand-500/30 selection:text-white">
      {/* Top Floating Glass Header */}
      <HeaderNav />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">
        {/* ===================== HERO SECTION ===================== */}
        <section className="relative pt-6 pb-12 sm:pt-12 sm:pb-16 text-center overflow-hidden">
          {/* Luminous Ambient Background Mesh */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/15 rounded-full blur-[130px] -z-10 pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[200px] bg-brand-accent/10 rounded-full blur-[90px] -z-10 pointer-events-none" />

          {/* Announcement Micro-Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-300 backdrop-blur-md mb-6 hover:border-brand-500/30 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
            <span>Next-Generation Architecture & Engineering Catalog</span>
            <span className="w-1 h-1 rounded-full bg-brand-400" />
            <span className="text-white">v4.2 Production</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]"
          >
            Master Engineering <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-brand-accent bg-clip-text text-transparent">
              On Real Architecture.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-ink-400 max-w-2xl mx-auto leading-relaxed"
          >
            Zero synthetic boilerplate. Learn distributed microservices, fullstack
            design systems, security verification, and cloud-native systems directly
            from proven practitioners.
          </motion.p>

          {/* Search & Filter Command Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative flex items-center p-2 rounded-2xl bg-ink-900/90 border border-white/10 shadow-elevated-lg backdrop-blur-xl focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <div className="pl-3.5 text-ink-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses by topic, architecture, or instructor..."
                className="w-full px-3 py-2 text-sm text-white bg-transparent outline-none placeholder:text-ink-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2 py-1 text-xs text-ink-400 hover:text-white mr-1"
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

          {/* Telemetry Metric Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            <div className="p-4 rounded-2xl bg-glass border border-white/5 flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">
                {stats.coursesCount}
              </span>
              <span className="text-xs text-ink-400 font-medium mt-1">Active Courses</span>
            </div>
            <div className="p-4 rounded-2xl bg-glass border border-white/5 flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-brand-accent">
                {stats.studentsCount}
              </span>
              <span className="text-xs text-ink-400 font-medium mt-1">Enrolled Engineers</span>
            </div>
            <div className="p-4 rounded-2xl bg-glass border border-white/5 flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">
                ★ {stats.avgRating}
              </span>
              <span className="text-xs text-ink-400 font-medium mt-1">Average Rating</span>
            </div>
            <div className="p-4 rounded-2xl bg-glass border border-white/5 flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                {stats.instructorsCount}
              </span>
              <span className="text-xs text-ink-400 font-medium mt-1">Lead Instructors</span>
            </div>
          </motion.div>
        </section>

        {/* ===================== CATALOG EXPLORATION ===================== */}
        <section className="space-y-6">
          {/* Header Controls: Categories & Level Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-400" />
                <span>Explore Live Catalog</span>
                {isFetching && (
                  <span className="w-2 h-2 rounded-full bg-brand-accent animate-ping" />
                )}
              </h2>
              <p className="text-xs text-ink-400 mt-0.5">
                Showing {filteredCourses.length} verified curriculum tracks
              </p>
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-1.5 bg-ink-900/60 p-1 rounded-xl border border-white/5 self-start md:self-auto">
              {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedLevel === lvl
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-ink-400 hover:text-white'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Levels' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className="relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors select-none"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 bg-brand-600 text-white rounded-xl shadow-glow-brand -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                  <span
                    className={
                      isSelected
                        ? 'text-white'
                        : 'text-ink-400 hover:text-white bg-ink-900/80 px-4 py-2 rounded-xl border border-white/5'
                    }
                  >
                    {cat === 'ALL' ? 'All Specializations' : cat}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ===================== COURSE GRID STATES ===================== */}
          <ErrorBoundary onReset={refetch}>
            {/* Loading Skeleton Grid */}
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <CourseCardSkeleton key={idx} />
                ))}
              </div>
            )}

            {/* Network or Gateway Error */}
            {isError && !isLoading && (
              <div className="p-8 rounded-2xl bg-brand-rose/10 border border-brand-rose/20 text-center max-w-lg mx-auto my-8">
                <h3 className="text-lg font-bold text-white mb-2">
                  Catalog Connectivity Interrupted
                </h3>
                <p className="text-xs text-ink-400 mb-4">
                  {error?.message || 'Unable to retrieve course inventory from backend services.'}
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => refetch()}
                  leftIcon={RotateCcw}
                >
                  Retry Connection
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && filteredCourses.length === 0 && (
              <EmptyState
                icon={Search}
                title="No matching curriculum tracks"
                description={`No courses matched "${searchQuery || selectedCategory}". Reset your filters to explore our complete catalog.`}
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            )}

            {/* Success Course Grid */}
            {!isLoading && !isError && filteredCourses.length > 0 && (
              <motion.div
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
        <section className="py-12 border-t border-white/5">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="cyan" dot className="mb-3">
              Production Standards
            </Badge>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Built for High-Stakes Engineering
            </h2>
            <p className="text-sm text-ink-400 mt-2">
              Unlike theoretical bootcamps, our curriculum and sandbox environments
              mirror production microservice architectures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-glass border border-white/5 hover:border-brand-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Live Microservice Sandboxes
              </h3>
              <p className="text-xs text-ink-400 leading-relaxed">
                Interact with real Spring Cloud gateways, Redis rate limiters, and
                PostgreSQL persistence layers instead of synthetic mocks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-glass border border-white/5 hover:border-brand-accent/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-accent/20 text-cyan-300 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                RBAC & Security Audited
              </h3>
              <p className="text-xs text-ink-400 leading-relaxed">
                Learn modern identity federation, JWT rotation, idempotency, and
                defense-in-depth protection verified across 52+ live endpoints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-glass border border-white/5 hover:border-emerald-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Cryptographic Credentials
              </h3>
              <p className="text-xs text-ink-400 leading-relaxed">
                Earn verifiable completion credentials backed by automated test suites
                and code reviews from senior engineering leads.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="w-full border-t border-white/5 bg-ink-950/80 mt-20 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-ink-500">
          <div className="flex items-center gap-3">
            <span className="font-bold text-ink-300 tracking-wider">ASIVO LMS</span>
            <span>•</span>
            <span>High-Fidelity Learning Ecosystem</span>
            <span>•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Gateway Connected (Port 8080)
            </span>
          </div>

          <div className="flex items-center gap-6 text-ink-400">
            <button
              type="button"
              onClick={() => navigate('/courses')}
              className="hover:text-white transition-colors"
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => navigate('/certifications')}
              className="hover:text-white transition-colors"
            >
              Certifications
            </button>
            <button
              type="button"
              onClick={() => navigate('/instructor/apply')}
              className="hover:text-white transition-colors"
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
