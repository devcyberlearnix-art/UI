import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Clock,
  PlayCircle,
  Award,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';
import { courseApi } from '../../api/courseApi';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import { Skeleton } from '../../design-system/primitives/Skeleton';
import EmptyState from '../../design-system/feedback/EmptyState';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

export const MyLearning = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, IN_PROGRESS, COMPLETED
  const [searchQuery, setSearchQuery] = useState('');

  // =========================================================================
  // 1. DATA INGESTION: TanStack Query Linked directly to Backend Authorization
  // =========================================================================
  const {
    data: courses = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['my-learning-courses', user?.id],
    queryFn: async () => {
      // Primary: Call Course Service student courses endpoint
      try {
        const response = await courseApi.getStudentCourses();
        const raw = response?.courses || response?.data || response || [];
        const enrolled = Array.isArray(raw) ? raw : [];
        if (enrolled.length > 0) {
          return enrolled.map((c) => ({
            id: c.id || c.courseId,
            title: c.title || c.courseName || 'Engineering Architecture Course',
            instructor:
              c.instructor?.name ||
              c.instructor ||
              c.instructorName ||
              'Studio Principal Architect',
            progress: Math.min(100, Math.max(0, Number(c.progress || c.completionPercentage || 0))),
            duration: c.duration || c.estimatedDuration || 'Self-paced',
            thumbnail:
              c.thumbnail ||
              c.coverImage ||
              c.image ||
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
            category: c.category || 'Architecture',
            level: c.level || 'Intermediate',
          }));
        }
      } catch {
        // Non-blocking fallback to orders ledger
      }

      // Secondary Reconciliation: Extract verified courses from order history
      try {
        const orderRes = await axiosInstance.get('/api/v1/orders');
        const payload = orderRes.data?.data || orderRes.data || [];
        const orders = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.orders)
          ? payload.orders
          : [];

        const normalized = orders.flatMap((order) => {
          const items = Array.isArray(order.items)
            ? order.items
            : Array.isArray(order.courses)
            ? order.courses
            : [];

          return items.map((item, index) => ({
            id: item.courseId || item.id || `${order.id || order.orderId}-${index}`,
            title: item.title || item.courseName || 'Engineering Architecture Course',
            instructor: item.instructor || item.instructorName || 'Lead Instructor',
            progress: Math.min(100, Math.max(0, Number(item.progress || 0))),
            duration: item.duration || 'Self-paced',
            thumbnail:
              item.thumbnail ||
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
            category: item.category || 'Core Track',
            level: item.level || 'Intermediate',
          }));
        });

        const uniqueById = Array.from(new Map(normalized.map((item) => [item.id, item])).values());
        return uniqueById;
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 3, // 3 min fresh
  });

  // Derived telemetry metrics
  const completedCount = useMemo(
    () => courses.filter((c) => c.progress >= 100).length,
    [courses]
  );

  const inProgressCount = useMemo(
    () => courses.filter((c) => c.progress < 100).length,
    [courses]
  );

  const averageProgress = useMemo(() => {
    if (courses.length === 0) return 0;
    const total = courses.reduce((sum, c) => sum + c.progress, 0);
    return Math.round(total / courses.length);
  }, [courses]);

  // Filtered course tracks
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesTab =
        activeTab === 'ALL'
          ? true
          : activeTab === 'COMPLETED'
          ? c.progress >= 100
          : c.progress < 100;

      const title = (c.title || '').toLowerCase();
      const instructor = (c.instructor || '').toLowerCase();
      const matchesSearch =
        !searchQuery ||
        title.includes(searchQuery.toLowerCase()) ||
        instructor.includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [courses, activeTab, searchQuery]);

  return (
    <div className="space-y-8 font-sans selection:bg-[#C5A880]/30 selection:text-white">
      {/* ======================= HERO BANNER ======================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14141A] via-[#0F0F13] to-[#070709] border border-white/[0.06] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#C5A880]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] text-xs font-mono font-bold tracking-wider">
              <BookOpen size={13} className="text-[#C5A880]" />
              <span>ACTIVE CURRICULUM REGISTRY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F7] tracking-tight">
              My Learning Workspace
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8E93] max-w-xl leading-relaxed">
              Track lecture milestones, monitor code lab completion, and resume your immersive classroom sessions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              leftIcon={RefreshCw}
              className={isFetching ? 'animate-spin' : ''}
            >
              Sync Matrix
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/courses')}
              rightIcon={ArrowRight}
            >
              Browse Catalog
            </Button>
          </div>
        </div>

        {/* Telemetry Stat Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-white/[0.04] pt-5">
          <div className="p-3.5 rounded-2xl bg-[#070709]/60 border border-white/[0.04]">
            <p className="text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider">
              Enrolled Tracks
            </p>
            <p className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {courses.length}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070709]/60 border border-white/[0.04]">
            <p className="text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider">
              In Progress
            </p>
            <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-0.5">
              {inProgressCount}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#070709]/60 border border-white/[0.04] col-span-2 sm:col-span-1">
            <p className="text-[11px] font-mono text-[#8E8E93] uppercase tracking-wider">
              Completed Credentials
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {completedCount}
            </p>
          </div>
        </div>
      </div>

      {/* ======================= CONTROLS & FILTER BAR ======================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.04]">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0F0F13] border border-white/[0.04] overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: `All Tracks (${courses.length})` },
            { id: 'IN_PROGRESS', label: `In Progress (${inProgressCount})` },
            { id: 'COMPLETED', label: `Completed (${completedCount})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-[#8E8E93] hover:text-[#E5E5E7] hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMyLearningTab"
                    className="absolute inset-0 bg-[#C5A880]/15 border border-[#C5A880]/30 rounded-xl -z-10 shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                    transition={SPRING}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Course Filter Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your courses..."
            className="w-full pl-9 pr-4 py-2 bg-[#0F0F13] border border-white/[0.04] rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]/40 transition-colors"
          />
        </div>
      </div>

      {/* ======================= DETERMINISTIC LIFECYCLE RESOLUTION ======================= */}
      {/* 1. SKELETON LOADING STATE */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-4"
            >
              <Skeleton className="aspect-video w-full rounded-xl bg-[#14141A]" />
              <Skeleton className="h-5 w-3/4 rounded bg-[#14141A]" />
              <Skeleton className="h-4 w-1/2 rounded bg-[#14141A]" />
              <Skeleton className="h-2 w-full rounded-full bg-[#14141A]" />
              <div className="pt-2 flex justify-between items-center">
                <Skeleton className="h-4 w-20 rounded bg-[#14141A]" />
                <Skeleton className="h-8 w-28 rounded-xl bg-[#14141A]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        /* 2. CONTEXTUAL OBSIDIAN EMPTY STATE (Eliminates stark white boxes) */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="py-12"
        >
          <EmptyState
            icon={BookOpen}
            title={
              activeTab === 'COMPLETED'
                ? 'No Completed Curriculum Tracks Yet'
                : searchQuery
                ? 'No Matching Courses Found'
                : 'No Active Enrollments Registered'
            }
            description={
              searchQuery
                ? `No enrolled courses matched "${searchQuery}". Clear your search query to inspect all enrolled tracks.`
                : activeTab === 'COMPLETED'
                ? 'You have not finished 100% of any curriculum track yet. Keep progressing through lecture checkpoints to earn your verified credential.'
                : 'You are not currently enrolled in any engineering architecture tracks. Explore our catalog of expert courses and begin your learning path.'
            }
            actionLabel="Explore Course Catalog"
            onAction={() => navigate('/courses')}
          />
        </motion.div>
      ) : (
        /* 3. POPULATED DATA GRID WITH DIRECT CLASSROOM ENTRY CTAS */
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((course, idx) => {
              const isFinished = course.progress >= 100;

              return (
                <motion.article
                  key={course.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03, ...SPRING }}
                  className="rounded-2xl bg-[#0F0F13] border border-white/[0.04] hover:border-[#C5A880]/30 transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    {/* Media Thumbnail with Interactive Overlay */}
                    <div className="relative aspect-video w-full overflow-hidden bg-[#14141A]">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F13] via-transparent to-transparent opacity-80" />

                      <div className="absolute top-3 right-3">
                        {isFinished ? (
                          <Badge variant="emerald" dot>
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="gold" className="font-mono text-[10px]">
                            {course.progress}% Complete
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Metadata Deck */}
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#8E8E93] uppercase tracking-wider">
                        <span>{course.category}</span>
                        <span>•</span>
                        <span>{course.level}</span>
                      </div>

                      <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#C5A880] transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      <p className="text-xs text-[#8E8E93] truncate">
                        Lead: <span className="text-[#E5E5E7]">{course.instructor}</span>
                      </p>

                      {/* Progress Bar Track */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between items-center text-[10px] font-mono text-[#8E8E93]">
                          <span>Curriculum Progress</span>
                          <span className="text-white font-bold">{course.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${
                              isFinished
                                ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                                : 'bg-gradient-to-r from-[#C5A880] to-amber-300 shadow-[0_0_10px_rgba(197,168,128,0.4)]'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-5 pt-0 border-t border-white/[0.04] mt-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-[#71717A] flex items-center gap-1">
                      <Clock size={12} />
                      <span>{course.duration}</span>
                    </span>

                    <Button
                      variant={isFinished ? 'secondary' : 'primary'}
                      size="sm"
                      rightIcon={ArrowRight}
                      onClick={() => navigate(`/student/courses/${course.id}/classroom`)}
                    >
                      {isFinished ? 'Review Curriculum' : 'Resume Classroom'}
                    </Button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default MyLearning;