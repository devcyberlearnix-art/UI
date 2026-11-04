import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  DollarSign,
  Plus,
  Star,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BarChart3,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { instructorApi } from '../../api/instructorApi';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import { Skeleton } from '../../design-system/primitives/Skeleton';

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const instructorId = user?.id || user?.userId || 'me';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!instructorId || instructorId === 'me') return;
      setLoading(true);
      setError('');

      try {
        const dashboardData = await instructorApi.getDashboard(instructorId);
        if (isMounted && dashboardData?.data) {
          setDashboard(dashboardData.data);
        }

        const coursesData = await instructorApi.getCourses(instructorId);
        if (isMounted) {
          const list = Array.isArray(coursesData)
            ? coursesData
            : coursesData?.data?.courses || coursesData?.courses || [];
          setCourses(list);
        }

        try {
          const earningsData = await instructorApi.getEarnings(instructorId, { period: 'month' });
          if (isMounted && earningsData?.data) {
            setEarnings(earningsData.data);
          }
        } catch (earningsErr) {
          console.warn('[InstructorDashboard] Earnings fetch failed', earningsErr);
        }
      } catch (err) {
        console.error('[InstructorDashboard] Failed to load dashboard', err);
        if (isMounted) {
          setError(
            err.response?.data?.message || err.message || 'Failed to load instructor dashboard'
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [instructorId]);

  const stats = useMemo(() => [
    {
      label: 'Active Curriculum',
      value: courses.length || dashboard?.totalCourses || 0,
      icon: BookOpen,
      change: '+2 this term',
    },
    {
      label: 'Enrolled Candidates',
      value: (dashboard?.totalStudents || dashboard?.students || 0).toLocaleString(),
      icon: Users,
      change: '+14% growth',
    },
    {
      label: 'Accrued Revenue',
      value: `₹${Number(dashboard?.totalRevenue || earnings?.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      change: '+8.4% month',
    },
    {
      label: 'Faculty Rating',
      value: dashboard?.averageRating ? Number(dashboard.averageRating).toFixed(1) : '4.9',
      icon: Star,
      change: 'Top 5% Tier',
    },
  ], [courses.length, dashboard, earnings]);

  return (
    <div className="w-full space-y-8 font-sans selection:bg-[#5B3E57]/20 dark:selection:bg-[#D1A7CC]/30">
      {/* ===================== HERO BANNER ===================== */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_TRANSITION}
        className="relative overflow-hidden rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 sm:p-8 shadow-card"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 text-xs font-semibold text-[#5B3E57] dark:text-[#D1A7CC]">
              <GraduationCap className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC]" />
              <span className="tracking-wider uppercase text-[10px] font-bold">Faculty Leadership Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
              Welcome back, {user?.firstName || user?.name || 'Faculty Member'}
            </h1>
            <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94] max-w-xl leading-relaxed">
              Manage your engineering course architecture, review candidate progress, and inspect real-time billing performance across distributed classroom clusters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/instructor/create-course')}
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Create Curriculum</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Error Notice */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 flex items-center gap-3 text-rose-500 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* ===================== METRIC CARDS (ZERO-CLS) ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] space-y-3"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24 bg-[#EAE5DC] dark:bg-[#272523]" />
                <Skeleton className="h-8 w-8 rounded-xl bg-[#EAE5DC] dark:bg-[#272523]" />
              </div>
              <Skeleton className="h-7 w-20 bg-[#EAE5DC] dark:bg-[#272523]" />
              <Skeleton className="h-3 w-16 bg-[#EAE5DC] dark:bg-[#272523]" />
            </div>
          ))
        ) : (
          stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_TRANSITION, delay: idx * 0.05 }}
                className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 transition-all duration-300 shadow-card group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#635E56] dark:text-[#A69F94] tracking-wide">
                    {stat.label}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight font-mono">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#2B6747] dark:text-[#529E73]">
                  <TrendingUp className="w-3 h-3 text-[#2B6747] dark:text-[#529E73]" />
                  <span>{stat.change}</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ===================== MAIN GRID ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Published Curriculum (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-card"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E3DCD3] dark:border-white/[0.06] mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1]">
                  Curriculum Deployments
                </h2>
              </div>
              <Link
                to="/instructor/my-courses"
                className="text-xs font-semibold text-[#5B3E57] hover:text-[#462D42] dark:text-[#D1A7CC] dark:hover:text-[#E0BFDC] flex items-center gap-1 transition-colors"
              >
                <span>Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-[#EAE5DC]/50 dark:bg-[#272523]/50 border border-[#E3DCD3] dark:border-white/[0.02] flex items-center gap-4"
                  >
                    <Skeleton className="w-12 h-12 rounded-xl bg-[#EAE5DC] dark:bg-[#272523]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3 bg-[#EAE5DC] dark:bg-[#272523]" />
                      <Skeleton className="h-3 w-1/4 bg-[#EAE5DC] dark:bg-[#272523]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.04] flex items-center justify-center text-[#756E64] dark:text-[#7A7368]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">No Curriculum Modules Yet</h3>
                <p className="text-xs text-[#635E56] dark:text-[#A69F94] max-w-sm mx-auto">
                  Architect your first syllabus module, upload HD video lectures, and launch interactive tests.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/instructor/create-course')}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Deploy Course Module
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 5).map((course, idx) => (
                  <div
                    key={course.id || course.courseId || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#EAE5DC]/60 dark:bg-[#272523]/60 border border-[#E3DCD3] dark:border-white/[0.04] hover:border-[#5B3E57]/30 dark:hover:border-white/[0.08] transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-center font-extrabold text-[#5B3E57] dark:text-[#D1A7CC] text-base shrink-0 group-hover:scale-105 transition-transform">
                        {(course.title || course.courseName || 'C').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-[#282521] dark:text-[#EDE8E1] truncate group-hover:text-[#5B3E57] dark:group-hover:text-[#D1A7CC] transition-colors">
                          {course.title || course.courseName || 'Untitled Curriculum'}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-[#635E56] dark:text-[#A69F94]">
                          <Badge
                            variant={course.status === 'PUBLISHED' ? 'success' : 'neutral'}
                            size="sm"
                          >
                            {course.status || 'DRAFT'}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-[#756E64] dark:text-[#7A7368]" />
                            <span>{course.students || course.enrolledStudents || 0} candidates</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E3DCD3] dark:border-white/[0.02]">
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] font-mono block">
                          ₹{(course.price || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#756E64] dark:text-[#7A7368]">
                          {course.rating ? `${Number(course.rating).toFixed(1)} ★` : 'Unrated'}
                        </span>
                      </div>
                      <Link
                        to={`/instructor/courses/${course.id || course.courseId}/edit`}
                        className="p-2 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.04] text-[#635E56] dark:text-[#A69F94] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] hover:border-[#5B3E57]/30 transition-all"
                        aria-label="Edit course"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Revenue Ledger & Control Nodes (1 Col) */}
        <div className="space-y-6">
          {/* Revenue Ledger Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-card space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCD3] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Revenue Settlement</h2>
              </div>
              <Badge variant="success" dot>Settled</Badge>
            </div>

            <div className="p-4 rounded-2xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] space-y-1">
              <span className="text-[11px] text-[#635E56] dark:text-[#A69F94] font-medium uppercase tracking-wider block">
                Current Fiscal Period
              </span>
              <p className="text-2xl font-black text-[#282521] dark:text-[#EDE8E1] font-mono tracking-tight">
                ₹{Number(earnings?.monthlyEarnings || 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#2B6747] dark:text-[#529E73] pt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+{earnings?.growth || 12}% month-over-month yield</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06]">
                <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] uppercase font-bold block">
                  Cumulative
                </span>
                <p className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] font-mono mt-1">
                  ₹{Number(earnings?.totalEarnings || 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06]">
                <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] uppercase font-bold block">
                  Pending Clear
                </span>
                <p className="text-sm font-bold text-[#5B3E57] dark:text-[#D1A7CC] font-mono mt-1">
                  ₹{Number(earnings?.pendingEarnings || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Action Dock */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-card space-y-3"
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#635E56] dark:text-[#A69F94] mb-2">
              Studio Quick Launch
            </h2>

            <Link
              to="/instructor/create-course"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 transition-all text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] group"
            >
              <span className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <span>Deploy New Course</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#756E64] group-hover:text-[#282521] dark:group-hover:text-white transition-colors" />
            </Link>

            <Link
              to="/instructor/my-courses"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 transition-all text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] group"
            >
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-[#635E56] dark:text-[#A69F94]" />
                <span>Manage Course Registry</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#756E64] group-hover:text-[#282521] dark:group-hover:text-white transition-colors" />
            </Link>

            <Link
              to="/instructor/analytics"
              className="flex items-center justify-between p-3 rounded-2xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 transition-all text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] group"
            >
              <span className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <span>Candidate Telemetry</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#756E64] group-hover:text-[#282521] dark:group-hover:text-white transition-colors" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
