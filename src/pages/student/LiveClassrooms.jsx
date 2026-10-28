import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Search,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { liveClassApi } from '../../api/liveClassApi';
import { courseApi } from '../../api/courseApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import { Skeleton } from '../../design-system/primitives/Skeleton';
import EmptyState from '../../design-system/feedback/EmptyState';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

const STATUS_CONFIG = {
  IN_PROGRESS: {
    label: 'Live Broadcast Now',
    variant: 'danger',
    dot: true,
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  },
  SCHEDULED: {
    label: 'Upcoming Session',
    variant: 'amber',
    dot: false,
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  COMPLETED: {
    label: 'Archived Recording',
    variant: 'secondary',
    dot: false,
    badgeClass: 'bg-white/5 text-ink-300 border-white/10',
  },
  CANCELLED: {
    label: 'Session Cancelled',
    variant: 'secondary',
    dot: false,
    badgeClass: 'bg-zinc-800 text-zinc-500 border-zinc-700',
  },
};

export const LiveClassrooms = () => {
  const { courseId: paramCourseId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, IN_PROGRESS, SCHEDULED, COMPLETED
  const [searchQuery, setSearchQuery] = useState('');
  const [attendingId, setAttendingId] = useState(null);

  // =========================================================================
  // 1. QUERY: Fetch Enrolled Courses for Cross-Catalog Live Aggregation
  // =========================================================================
  const { data: enrolledCourses = [] } = useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async () => {
      try {
        const response = await courseApi.getStudentCourses();
        const payload = response?.data || response;
        return Array.isArray(payload) ? payload : payload?.courses || [];
      } catch {
        return [];
      }
    },
    enabled: Boolean(user?.id) && !paramCourseId,
    staleTime: 1000 * 60 * 5,
  });

  // =========================================================================
  // 2. QUERY: Live Classrooms Query with Strict Deterministic Lifecycle
  // =========================================================================
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['live-classrooms', paramCourseId || 'all-enrolled', user?.id],
    queryFn: async () => {
      // Hard check: ensure user token exists
      const token = localStorage.getItem('lms_token');
      if (!token) {
        throw { response: { status: 401, message: 'Unauthenticated' } };
      }

      // If scoped to a specific course:
      if (paramCourseId) {
        try {
          const res = await liveClassApi.getUpcomingLiveClasses(paramCourseId);
          const raw = res?.data || res || [];
          return Array.isArray(raw) ? raw : raw.liveClasses || [];
        } catch (err) {
          // If 403 (un-enrolled), handle through error boundary
          if (err.response?.status === 403 || err.response?.status === 401) {
            throw err;
          }
          const fallback = await liveClassApi.getLiveClassesByCourse(paramCourseId);
          const raw = fallback?.data || fallback || [];
          return Array.isArray(raw) ? raw : raw.liveClasses || [];
        }
      }

      // Aggregate across student's enrolled courses or fetch system live feed
      try {
        const courseIds = enrolledCourses.map((c) => c.id || c.courseId).filter(Boolean);
        if (courseIds.length > 0) {
          const promises = courseIds.slice(0, 5).map((id) =>
            liveClassApi.getLiveClassesByCourse(id).catch(() => ({ data: [] }))
          );
          const results = await Promise.all(promises);
          const aggregated = results.flatMap((r) => {
            const raw = r?.data || r || [];
            return Array.isArray(raw) ? raw : raw.liveClasses || [];
          });
          if (aggregated.length > 0) return aggregated;
        }

        // Direct fallback to course #2 (standard demo course) or general schedule
        const defaultFeed = await liveClassApi.getLiveClassesByCourse(2).catch(() => null);
        const raw = defaultFeed?.data || defaultFeed || [];
        return Array.isArray(raw) ? raw : raw.liveClasses || [];
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          throw err;
        }
        return [];
      }
    },
    retry: (failureCount, err) => {
      // Never retry on 401 / 403 security gates
      if (err?.response?.status === 401 || err?.response?.status === 403) return false;
      return failureCount < 1;
    },
    staleTime: 1000 * 30, // 30s fresh
  });

  // =========================================================================
  // 3. SECURITY GATEWAY: Handle Unauthorized / Expired Tokens (HTTP 401/403)
  // =========================================================================
  if (isError && (error?.response?.status === 401 || error?.response?.status === 403)) {
    const isForbidden = error?.response?.status === 403;
    if (error?.response?.status === 401) {
      toast.error('Session expired or unauthorized. Please authenticate again.');
      logout();
      navigate('/login', { replace: true });
      return null;
    }

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 rounded-3xl bg-[#0F0F13] border border-amber-500/30 text-center space-y-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Active Course Enrollment Required
          </h2>
          <p className="text-xs text-[#8E8E93] leading-relaxed">
            Live classroom video broadcasting and interactive participation requires an active, verified enrollment in this engineering track.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/courses')}
              rightIcon={ArrowRight}
            >
              Browse Course Catalog
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/student/dashboard')}
            >
              Back to Hub
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // 4. ACTION MUTATION: Join Attendance Tracking Sequence
  // =========================================================================
  const markAttendanceMutation = useMutation({
    mutationFn: async (liveClassId) => {
      return await liveClassApi.joinAttendance(liveClassId);
    },
    onSuccess: () => {
      toast.success('Attendance recorded and logged in student ledger.', { icon: '🎓' });
      queryClient.invalidateQueries({ queryKey: ['live-classrooms'] });
    },
    onError: () => {
      toast.error('Attendance registration could not be verified by server.');
    },
    onSettled: () => {
      setAttendingId(null);
    },
  });

  const handleJoinSession = async (session) => {
    setAttendingId(session.id);
    try {
      // 1. Mark attendance
      await markAttendanceMutation.mutateAsync(session.id);

      // 2. Fetch or trigger meeting URL
      const data = await liveClassApi.joinLiveClass(session.id).catch(() => null);
      const url =
        data?.data?.meetingUrl ||
        session.meetingUrl ||
        session.streamUrl ||
        `https://meet.jit.si/FD_LMS_Live_${session.id}`;

      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(`https://meet.jit.si/FD_LMS_Live_${session.id}`, '_blank', 'noopener,noreferrer');
    }
  };

  // Filtered session list
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const status = (s.status || 'SCHEDULED').toUpperCase();
      const matchesTab =
        activeTab === 'ALL' ? true : status === activeTab;
      const title = (s.title || s.topic || '').toLowerCase();
      const courseName = (s.courseName || s.courseTitle || '').toLowerCase();
      const instructor = (s.instructorName || s.instructor || '').toLowerCase();
      const matchesSearch =
        !searchQuery ||
        title.includes(searchQuery.toLowerCase()) ||
        courseName.includes(searchQuery.toLowerCase()) ||
        instructor.includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [sessions, activeTab, searchQuery]);

  return (
    <div className="space-y-8 font-sans selection:bg-[#C5A880]/30 selection:text-white">
      {/* ======================= HERO SECTION RAIL ======================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121217] via-[#0F0F13] to-[#070709] border border-white/[0.06] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#C5A880]/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] text-xs font-mono font-bold tracking-wider">
              <Radio size={14} className="animate-pulse text-rose-500" />
              <span>LIVE TRANSMISSION MESH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F7] tracking-tight">
              Interactive Live Classrooms
            </h1>
            <p className="text-xs sm:text-sm text-[#8E8E93] max-w-xl leading-relaxed">
              Real-time engineering broadcasts, architectural code teardowns, and instructor Q&A sessions synchronized directly from active curriculum tracks.
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
              Sync Feeds
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/student/my-learning')}
              leftIcon={BookOpen}
            >
              My Curriculum
            </Button>
          </div>
        </div>
      </div>

      {/* ======================= CONTROLS & FILTER RAIL ======================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.04]">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0F0F13] border border-white/[0.04] overflow-x-auto scrollbar-none">
          {[
            { id: 'ALL', label: 'All Sessions' },
            { id: 'IN_PROGRESS', label: 'Live Now' },
            { id: 'SCHEDULED', label: 'Upcoming' },
            { id: 'COMPLETED', label: 'Archived' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-white'
                    : 'text-[#8E8E93] hover:text-[#E5E5E7] hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeLiveClassTab"
                    className="absolute inset-0 bg-[#C5A880]/15 border border-[#C5A880]/30 rounded-xl -z-10 shadow-[0_0_15px_rgba(197,168,128,0.1)]"
                    transition={SPRING}
                  />
                )}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter sessions, instructors..."
            className="w-full pl-9 pr-4 py-2 bg-[#0F0F13] border border-white/[0.04] rounded-xl text-xs font-mono text-white placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]/40 transition-colors"
          />
        </div>
      </div>

      {/* ======================= DETERMINISTIC STATE RESOLUTION ======================= */}
      {/* 1. SKELETON STATE ON MOUNT / FETCH */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 rounded-full bg-[#14141A]" />
                <Skeleton className="h-4 w-16 rounded bg-[#14141A]" />
              </div>
              <Skeleton className="h-6 w-3/4 rounded-lg bg-[#14141A]" />
              <Skeleton className="h-4 w-full rounded bg-[#14141A]" />
              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded bg-[#14141A]" />
                <Skeleton className="h-8 w-24 rounded-xl bg-[#14141A]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        /* 2. CONTEXTUAL EMPTY STATE VIEW (Zero Blank Pages) */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="py-12"
        >
          <EmptyState
            icon={Radio}
            title={
              activeTab === 'IN_PROGRESS'
                ? 'No Live Transmissions Right Now'
                : 'No Live Sessions Scheduled'
            }
            description={
              searchQuery
                ? `No live classroom sessions matched your query "${searchQuery}". Try adjusting your filters.`
                : 'Instructors schedule live sessions for deep architectural reviews and milestone defenses. Check back closer to scheduled curriculum hours.'
            }
            actionLabel="Explore Course Catalog"
            onAction={() => navigate('/courses')}
          />
        </motion.div>
      ) : (
        /* 3. OPERATIONAL POPULATED DATA GRID */
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredSessions.map((session) => {
              const statusKey = (session.status || 'SCHEDULED').toUpperCase();
              const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.SCHEDULED;
              const isLive = statusKey === 'IN_PROGRESS';
              const isAttending = attendingId === session.id;

              const sessionDate = session.scheduledAt || session.startTime || session.date;
              const formattedDate = sessionDate
                ? new Date(sessionDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Scheduled by Instructor';

              return (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={SPRING}
                  className={`p-6 rounded-2xl bg-[#0F0F13] border transition-all duration-300 flex flex-col justify-between gap-5 relative overflow-hidden group hover:border-[#C5A880]/30 shadow-xl ${
                    isLive
                      ? 'border-rose-500/30 bg-gradient-to-b from-[#141215] to-[#0F0F13]'
                      : 'border-white/[0.04]'
                  }`}
                >
                  {/* Subtle top indicator bar */}
                  {isLive && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse" />
                  )}

                  <div className="space-y-3.5">
                    {/* Header badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border ${cfg.badgeClass}`}
                      >
                        {cfg.dot && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        )}
                        <span>{cfg.label}</span>
                      </span>

                      {session.durationMinutes && (
                        <span className="text-[11px] font-mono text-[#8E8E93] flex items-center gap-1">
                          <Clock size={12} />
                          <span>{session.durationMinutes} min</span>
                        </span>
                      )}
                    </div>

                    {/* Session Title */}
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight group-hover:text-[#C5A880] transition-colors line-clamp-2">
                        {session.title || session.topic || 'Engineering Architecture Q&A'}
                      </h3>
                      {session.description && (
                        <p className="text-xs text-[#8E8E93] line-clamp-2 mt-1 leading-relaxed">
                          {session.description}
                        </p>
                      )}
                    </div>

                    {/* Schedule Time Pill */}
                    <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA] bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04]">
                      <Calendar size={13} className="text-[#C5A880]" />
                      <span className="truncate">{formattedDate}</span>
                    </div>

                    {/* Instructor & Meta */}
                    <div className="flex items-center justify-between text-xs text-[#71717A] pt-1">
                      <span className="flex items-center gap-1.5 truncate">
                        <Users size={12} />
                        <span>Lead: {session.instructorName || session.instructor || 'Lead Architect'}</span>
                      </span>
                      {session.attendeesCount != null && (
                        <span className="font-mono text-[10px] text-[#A1A1AA]">
                          {session.attendeesCount} Joined
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Deck */}
                  <div className="pt-4 border-t border-white/[0.04] flex items-center justify-between gap-3">
                    <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                      {session.courseName || `Course #${session.courseId || 2}`}
                    </span>

                    {statusKey === 'COMPLETED' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={Play}
                        onClick={() => handleJoinSession(session)}
                      >
                        Playback
                      </Button>
                    ) : (
                      <Button
                        variant={isLive ? 'primary' : 'secondary'}
                        size="sm"
                        disabled={isAttending || statusKey === 'CANCELLED'}
                        leftIcon={ExternalLink}
                        onClick={() => handleJoinSession(session)}
                        className={isLive ? 'shadow-lg shadow-rose-500/20' : ''}
                      >
                        {isAttending
                          ? 'Logging...'
                          : isLive
                          ? 'Join Broadcast'
                          : 'Enter Classroom'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default LiveClassrooms;
