import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Users,
  ShoppingCart,
  ArrowRight,
  GraduationCap,
  PlayCircle,
  AlertCircle,
  Star,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Filter,
  Search,
  Heart,
  Eye,
  X,
  Loader2,
  Compass,
  Target,
  Trophy,
  BarChart3,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import InstructorApplication from './InstructorApplication';
import { courseApi } from '../../api/courseApi';
import { landingApi } from '../../api/landingApi';
import { studentApi } from '../../api/studentApi';
import Portal from '../../components/ui/Portal';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import { Skeleton } from '../../design-system/primitives/Skeleton';
import { resolveCoverImage } from '../../design-system/components/CourseCard';

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

const CATEGORY_OPTIONS = [
  'All',
  'Programming',
  'Web Development',
  'Data Science',
  'Cloud & DevOps',
  'Artificial Intelligence',
  'Design',
  'Business',
];

const LEVEL_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const normalizeCourse = (c, index) => {
  const courseId = c.id || c.courseId || c._id || `course-${index}`;
  const category = c.category || c.categoryName || 'Engineering';
  const rawTitle = c.title || c.courseName || c.name || null;
  const rawImg = c.image || c.thumbnail || c.coverImage || c.banner || null;
  const image = resolveCoverImage(category, rawTitle || '', rawImg, courseId);

  return {
    id: courseId,
    title: rawTitle,
    category,
    level: c.level || c.difficultyLevel || 'Intermediate',
    price: c.price != null ? Number(c.price) : c.amount != null ? Number(c.amount) : null,
    rating: c.rating != null ? Number(c.rating) : c.avgRating != null ? Number(c.avgRating) : null,
    students:
      c.students != null
        ? Number(c.students)
        : c.enrollmentCount != null
        ? Number(c.enrollmentCount)
        : c.enrolledStudents != null
        ? Number(c.enrolledStudents)
        : null,
    duration: c.duration || c.estimatedDuration || 'Self-paced',
    instructor:
      c.instructor?.name ||
      c.instructorName ||
      (typeof c.instructor === 'string' ? c.instructor : null),
    image,
    description: c.description || c.summary || null,
  };
};

const fetchDashboardStats = async (
  setDashboardStats,
  setStatsError,
  setLoadingStats,
  preserveOnFailure = false
) => {
  setLoadingStats(true);
  setStatsError('');
  try {
    const response = await courseApi.getStudentDashboard();
    setDashboardStats(response);
  } catch (err) {
    console.error('[StudentDashboard] Failed to fetch stats:', err);
    setStatsError(err.message || 'Failed to load dashboard statistics');
    if (!preserveOnFailure) {
      setDashboardStats(null);
    }
  } finally {
    setLoadingStats(false);
  }
};

const fetchEnrolledCourses = async (
  setEnrolledCourses,
  setEnrolledError,
  setLoadingEnrolled,
  preserveOnFailure = false
) => {
  setLoadingEnrolled(true);
  setEnrolledError('');
  try {
    const response = await courseApi.getStudentCourses();
    const payload =
      response?.courses || response?.data?.courses || response?.data || response;
    const courses = Array.isArray(payload) ? payload : [];

    const normalized = courses.map((item, index) => ({
      id: item.courseId || item.id || item._id || `enrolled-${index}`,
      title: item.title || item.courseName || null,
      instructor: item.instructor || item.instructorName || null,
      progress:
        item.progress != null
          ? Math.min(100, Math.max(0, Number(item.progress)))
          : item.completionPercentage != null
          ? Math.min(100, Math.max(0, Number(item.completionPercentage)))
          : null,
      duration: item.duration || null,
      thumbnail: item.thumbnail || item.image || null,
    }));

    setEnrolledCourses(normalized);
  } catch (err) {
    console.error('[StudentDashboard] Failed to fetch enrolled courses:', err);
    setEnrolledError(err.message || 'Failed to load enrolled courses');
    if (!preserveOnFailure) {
      setEnrolledCourses([]);
    }
  } finally {
    setLoadingEnrolled(false);
  }
};

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard Stats State
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Enrolled Courses State
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [enrolledError, setEnrolledError] = useState('');

  // Profile State
  const [userProfile, setUserProfile] = useState(null);

  // Trending & Catalog State
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseError, setCourseError] = useState('');

  const [trendingPage, setTrendingPage] = useState(0);
  const [trendingSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Wishlist Handling
  const getStorageKey = () => {
    const userId = user?.id || user?.userId || user?.email || 'guest';
    return `wishlist_${userId}`;
  };

  const [wishlist, setWishlist] = useState(() => {
    try {
      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Quick Preview Modal State
  const [previewCourse, setPreviewCourse] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Instructor Application Status
  const [applicationStatus, setApplicationStatus] = useState(() => {
    return localStorage.getItem('instructor_application_status') || null;
  });

  const toggleWishlist = (course, e) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const courseId = String(course.id);
    const exists = wishlist.some((id) => String(id) === courseId);
    let updated;
    if (exists) {
      updated = wishlist.filter((id) => String(id) !== courseId);
      toast.success('Removed from saved curriculum', { icon: '🤍' });
    } else {
      updated = [...wishlist, courseId];
      toast.success(`Saved "${course.title?.slice(0, 24) || 'Course'}..." to wishlist`, {
        icon: '⭐',
      });
    }
    setWishlist(updated);
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save wishlist', err);
    }
  };

  const handleCourseClick = async (course) => {
    setPreviewCourse(course);
    setLoadingDetail(true);

    try {
      const res = await courseApi.getCourseById(course.id);
      const data = res?.data || res;
      if (data) {
        setPreviewCourse((prev) => ({
          ...prev,
          ...data,
          id: data.id || data.courseId || prev?.id || course.id,
          title: data.title || data.courseName || prev?.title || course.title,
          description:
            data.description || data.summary || prev?.description || course.description,
          category: data.category || data.categoryName || prev?.category || course.category,
          level: data.level || data.difficultyLevel || prev?.level || course.level,
          price: data.price != null ? Number(data.price) : prev?.price,
          rating: Number(data.rating || data.avgRating || prev?.rating || 0),
          students: Number(data.students || data.enrolledCount || prev?.students || 0),
          duration: data.duration || data.estimatedDuration || prev?.duration || 'Self-paced',
          instructor:
            data.instructor?.name ||
            data.instructorName ||
            (typeof data.instructor === 'string'
              ? data.instructor
              : prev?.instructor || course.instructor),
        }));
      }
    } catch (err) {
      console.warn('[StudentDashboard] Course detail preview note:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Fetch Course Discovery
  const fetchTrending = useCallback(async () => {
    setLoadingCourses(true);
    setCourseError('');

    try {
      const filters = {};
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      if (selectedLevel !== 'All') filters.level = selectedLevel;
      if (searchKeyword.trim()) filters.search = searchKeyword.trim();

      const res = await courseApi.getCourseList(filters).catch(async () => {
        return await courseApi.getTrendingCourses({
          page: trendingPage,
          size: trendingSize,
          category: selectedCategory !== 'All' ? selectedCategory : '',
          level: selectedLevel !== 'All' ? selectedLevel : '',
        });
      });

      const payload = res?.data || res;
      const rawCourses =
        payload?.courses ||
        payload?.content ||
        payload?.items ||
        payload?.results ||
        (Array.isArray(payload) ? payload : []);

      const items = Array.isArray(rawCourses) ? rawCourses.map(normalizeCourse) : [];
      setTrendingCourses(items);

      const totalItems = Number(
        payload?.totalElements ||
          payload?.totalCourses ||
          payload?.pagination?.totalCourses ||
          items.length
      );
      setTotalCourses(totalItems);

      const calculatedPages = Number(
        payload?.totalPages ||
          payload?.pagination?.totalPages ||
          Math.max(1, Math.ceil(totalItems / trendingSize))
      );
      setTotalPages(calculatedPages);
    } catch (err) {
      console.error('[StudentDashboard] Catalog error:', err);
      setCourseError(err.message || 'Failed to load courses from API.');
      setTrendingCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [trendingPage, trendingSize, selectedCategory, selectedLevel, searchKeyword]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  useEffect(() => {
    const key = getStorageKey();
    try {
      const saved = localStorage.getItem(key);
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch {
      setWishlist([]);
    }
  }, [user]);

  useEffect(() => {
    studentApi
      .getProfile()
      .then((res) => {
        const data = res?.data?.user || res?.data || res;
        setUserProfile(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchDashboardStats(setDashboardStats, setStatsError, setLoadingStats, false);
    fetchEnrolledCourses(setEnrolledCourses, setEnrolledError, setLoadingEnrolled, false);
  }, []);

  const handleStatusChange = (status) => {
    setApplicationStatus(status);
    localStorage.setItem('instructor_application_status', status);
  };

  const enrolledCount = dashboardStats?.enrolledCourses ?? enrolledCourses.length;
  const inProgressCount = useMemo(
    () =>
      enrolledCourses.filter(
        (c) => Number(c.progress) > 0 && Number(c.progress) < 100
      ).length,
    [enrolledCourses]
  );
  const completedCount =
    dashboardStats?.completedCourses ??
    enrolledCourses.filter((c) => Number(c.progress) >= 100).length;
  const certificatesCount = dashboardStats?.certificates ?? 0;

  const startItem = totalCourses === 0 ? 0 : trendingPage * trendingSize + 1;
  const endItem = Math.min((trendingPage + 1) * trendingSize, totalCourses);

  return (
    <div className="w-full space-y-8 font-sans selection:bg-[#5B3E57]/20 dark:selection:bg-[#D1A7CC]/30">
      {/* ===================== HERO WELCOME BANNER ===================== */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_TRANSITION}
        className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-card"
      >
        {/* Left Block: Identity Context */}
        <div className="space-y-4 max-w-xl z-10">
          <div className="inline-flex items-center gap-1.5">
            <Badge
              variant="pewter"
              className="bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] text-[9px] uppercase font-mono tracking-wider font-extrabold px-2 py-0.5 border border-[#D5C0D1] dark:border-[#D1A7CC]/30"
            >
              ✦ Candidate Learning Studio
            </Badge>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
            Welcome back,{' '}
            {userProfile?.firstName ||
              (user?.name ? user.name.split(' ')[0] : 'Engineer')}
          </h2>

          <p className="text-xs text-[#635E56] dark:text-[#A69F94] font-light leading-relaxed">
            Your distributed learning workspace is synchronized. Pick up where you left off or explore new curriculum tracks.
          </p>

          {/* Streak Counter pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] text-[10px] font-mono text-[#635E56] dark:text-[#A69F94]">
            <span className="text-[#9A6B56] dark:text-[#D9A48F] animate-pulse">⚡</span>
            <span className="font-bold text-[#282521] dark:text-[#EDE8E1]">12-Day Engineering Streak</span>
            <span className="opacity-40">•</span>
            <span>Consistent daily commits</span>
          </div>
        </div>

        {/* Right Block: Single High-Fidelity Call-To-Action */}
        <div className="flex items-center shrink-0 z-10 self-start md:self-center">
          <Button
            variant="primary"
            onClick={() => navigate(enrolledCourses.length > 0 ? '/student/my-learning' : '/courses')}
            className="px-5 py-2.5 font-bold text-xs tracking-wide uppercase shadow-xs bg-[#5B3E57] hover:bg-[#462D42] text-[#FFFEFA] dark:bg-[#D1A7CC] dark:text-[#151413] dark:hover:bg-[#E0BFDC] rounded-xl transition-all duration-300"
          >
            {enrolledCourses.length > 0 ? 'Resume Learning Track' : 'Explore Catalog Matrix'}
          </Button>
        </div>
      </motion.div>

      {/* ===================== VIEW: BECOME INSTRUCTOR TAB ===================== */}
      {activeTab === 'become-instructor' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3DCD3] dark:border-white/[0.06]">
            <div>
              <h2 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1]">
                Faculty Accreditation Review
              </h2>
              <p className="text-xs text-[#635E56] dark:text-[#A69F94]">
                Submit your engineering credentials to join our authorized instruction faculty.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('dashboard')}
            >
              Return to Workspace
            </Button>
          </div>

          <InstructorApplication
            onBack={() => setActiveTab('dashboard')}
            applicationStatus={applicationStatus}
            onStatusChange={handleStatusChange}
          />
        </div>
      ) : (
        /* ===================== VIEW: MAIN DASHBOARD ===================== */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Left Column (3 Cols) */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Metrics: Zero-CLS Framework */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loadingStats ? (
                [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] space-y-2.5"
                  >
                    <Skeleton className="h-3 w-20 bg-[#EAE5DC] dark:bg-[#272523]" />
                    <Skeleton className="h-7 w-16 bg-[#EAE5DC] dark:bg-[#272523]" />
                  </div>
                ))
              ) : statsError ? (
                <div className="col-span-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center justify-between">
                  <span>{statsError}</span>
                  <button
                    type="button"
                    onClick={() =>
                      fetchDashboardStats(setDashboardStats, setStatsError, setLoadingStats, true)
                    }
                    className="font-bold underline cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {/* Metric 1 */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={SPRING_TRANSITION}
                    className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 transition-all shadow-card group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#635E56] dark:text-[#A69F94]">Enrolled</span>
                      <div className="w-8 h-8 rounded-xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] group-hover:scale-105 transition-transform">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#282521] dark:text-[#EDE8E1] tracking-tight block">
                      {enrolledCount}
                    </span>
                    <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] mt-1 block">+2 this quarter</span>
                  </motion.div>

                  {/* Metric 2 */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={SPRING_TRANSITION}
                    className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 transition-all shadow-card group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#635E56] dark:text-[#A69F94]">In Progress</span>
                      <div className="w-8 h-8 rounded-xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-center text-[#282521] dark:text-[#EDE8E1] group-hover:scale-105 transition-transform">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#282521] dark:text-[#EDE8E1] tracking-tight block">
                      {inProgressCount}
                    </span>
                    <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] mt-1 block">Active curriculum</span>
                  </motion.div>

                  {/* Metric 3 */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={SPRING_TRANSITION}
                    className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 transition-all shadow-card group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#635E56] dark:text-[#A69F94]">Completed</span>
                      <div className="w-8 h-8 rounded-xl bg-[#EBF3EE] dark:bg-[#529E73]/15 border border-[#B7D9C5] dark:border-[#529E73]/30 flex items-center justify-center text-[#2B6747] dark:text-[#529E73] group-hover:scale-105 transition-transform">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#282521] dark:text-[#EDE8E1] tracking-tight block">
                      {completedCount}
                    </span>
                    <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] mt-1 block">Validated modules</span>
                  </motion.div>

                  {/* Metric 4 */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={SPRING_TRANSITION}
                    className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 transition-all shadow-card group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#635E56] dark:text-[#A69F94]">Credentials</span>
                      <div className="w-8 h-8 rounded-xl bg-[#F6EFEA] dark:bg-[#D9A48F]/15 border border-[#E0D0C7] dark:border-[#D9A48F]/30 flex items-center justify-center text-[#9A6B56] dark:text-[#D9A48F] group-hover:scale-105 transition-transform">
                        <Award className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#282521] dark:text-[#EDE8E1] tracking-tight block">
                      {certificatesCount}
                    </span>
                    <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] mt-1 block">Cryptographic hashes</span>
                  </motion.div>
                </>
              )}
            </div>

            {/* Active Enrolled Course: Focus Card OR Defensive Empty State */}
            {enrolledCourses.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING_TRANSITION}
                className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-card space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#E3DCD3] dark:border-white/[0.06]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC]">
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Active Lesson Session</h2>
                      <p className="text-[11px] text-[#756E64] dark:text-[#7A7368]">Instant session resumption from gateway memory.</p>
                    </div>
                  </div>
                  <Link
                    to="/student/my-learning"
                    className="text-xs font-semibold text-[#5B3E57] hover:text-[#462D42] dark:text-[#D1A7CC] dark:hover:text-[#E0BFDC] flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B3E57] rounded"
                  >
                    <span>View All ({enrolledCourses.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Primary Enrolled Focus Item */}
                <div
                  className="flex flex-col sm:flex-row gap-5 p-4 rounded-2xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B3E57]"
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/student/courses/${enrolledCourses[0].id}`);
                    }
                  }}
                  onClick={async () => {
                    try {
                      const resumeData = await courseApi.resumeLearning(enrolledCourses[0].id);
                      const resumeInfo = resumeData?.data || resumeData;
                      const lectureId = resumeInfo?.nextLectureId || resumeInfo?.lastLectureId;
                      if (lectureId) {
                        navigate(`/student/courses/${enrolledCourses[0].id}/learn/${lectureId}`);
                      } else {
                        navigate(`/student/courses/${enrolledCourses[0].id}`);
                      }
                    } catch {
                      navigate(`/student/courses/${enrolledCourses[0].id}`);
                    }
                  }}
                >
                  <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-[#FAF7F2] dark:bg-[#151413] shrink-0 border border-[#E3DCD3] dark:border-white/[0.06]">
                    {enrolledCourses[0].thumbnail ? (
                      <img
                        src={enrolledCourses[0].thumbnail}
                        alt={enrolledCourses[0].title || 'Curriculum'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC]">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] line-clamp-1">
                        {enrolledCourses[0].title || 'Untitled Curriculum'}
                      </h3>
                      {enrolledCourses[0].instructor && (
                        <p className="text-xs text-[#635E56] dark:text-[#A69F94] mt-1">
                          Faculty: {enrolledCourses[0].instructor}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#635E56] dark:text-[#A69F94]">Module Completion</span>
                        <span className="text-[#5B3E57] dark:text-[#D1A7CC] font-bold">
                          {enrolledCourses[0].progress != null ? `${enrolledCourses[0].progress}%` : '0%'}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#D8D0C5] dark:bg-[#151413] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${enrolledCourses[0].progress || 0}%` }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full bg-[#5B3E57] dark:bg-[#D1A7CC] rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center self-end sm:self-center">
                    <Button variant="primary" size="sm">
                      Resume
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SPRING_TRANSITION}
                className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-card"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] shrink-0">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#282521] dark:text-[#EDE8E1]">No Active Enrolled Curricula</h3>
                    <p className="text-xs text-[#635E56] dark:text-[#A69F94] mt-1 max-w-lg leading-relaxed">
                      Begin your engineering journey to unlock interactive video classrooms, proctored assessments, and cryptographically verified certifications.
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/courses')}
                  className="shrink-0 w-full sm:w-auto"
                >
                  <Compass className="w-3.5 h-3.5 mr-2" />
                  <span>Browse Catalog Matrix</span>
                </Button>
              </motion.div>
            )}

            {/* ===================== CURRICULUM DISCOVERY MATRIX ===================== */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_TRANSITION}
              className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-card space-y-5"
            >
              {/* Header: Title & Search */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E3DCD3] dark:border-white/[0.06]">
                <div>
                  <h2 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1]">
                    Curriculum Discovery Matrix
                  </h2>
                  <p className="text-xs text-[#635E56] dark:text-[#A69F94] mt-0.5">
                    Explore verified courses across distributed engineering disciplines.
                  </p>
                </div>

                {/* Filter and Search Actions */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#756E64] dark:text-[#7A7368]" />
                    <input
                      type="text"
                      placeholder="Filter courses..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setTrendingPage(0);
                          fetchTrending();
                        }
                      }}
                      className="w-40 sm:w-52 pl-9 pr-7 py-1.5 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D8D0C5] dark:border-white/[0.08] rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] placeholder-[#756E64] dark:placeholder-[#7A7368] focus:outline-none focus:border-[#5B3E57] dark:focus:border-[#D1A7CC] transition-colors"
                    />
                    {searchKeyword && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchKeyword('');
                          setTrendingPage(0);
                          fetchTrending();
                        }}
                        className="absolute right-2.5 top-2 text-[#756E64] hover:text-[#282521] dark:text-[#7A7368] dark:hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={fetchTrending}
                    disabled={loadingCourses}
                    className="p-2 rounded-xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-white hover:border-[#C8BFB2] dark:hover:border-white/[0.08] transition-colors"
                    title="Refresh courses"
                    aria-label="Refresh courses"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingCourses ? 'animate-spin text-[#5B3E57] dark:text-[#D1A7CC]' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Dynamic Kinetic Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setTrendingPage(0);
                      }}
                      className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        isSelected ? 'text-[#FFFEFA] dark:text-[#151413] font-bold' : 'text-[#635E56] hover:text-[#282521] dark:text-[#A69F94] dark:hover:text-[#EDE8E1] bg-[#EAE5DC] dark:bg-[#272523]'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="studentDashboardCategoryPill"
                          className="absolute inset-0 bg-[#5B3E57] dark:bg-[#D1A7CC] rounded-xl -z-10 shadow-xs"
                          transition={SPRING_TRANSITION}
                        />
                      )}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>

              {/* Course Error Notice */}
              {courseError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center justify-between">
                  <span>{courseError}</span>
                  <button
                    type="button"
                    onClick={fetchTrending}
                    className="underline font-bold cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Courses Grid */}
              {loadingCourses ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] space-y-3"
                    >
                      <Skeleton className="h-32 w-full rounded-xl bg-[#EAE5DC] dark:bg-[#272523]" />
                      <Skeleton className="h-4 w-3/4 bg-[#EAE5DC] dark:bg-[#272523]" />
                      <Skeleton className="h-3 w-1/2 bg-[#EAE5DC] dark:bg-[#272523]" />
                    </div>
                  ))}
                </div>
              ) : trendingCourses.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">No curriculum found</p>
                  <p className="text-xs text-[#756E64] dark:text-[#7A7368]">Try switching category filters or search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trendingCourses.map((course, idx) => {
                    const isWishlisted = wishlist.some((id) => String(id) === String(course.id));
                    return (
                      <motion.div
                        key={course.id || idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRING_TRANSITION, delay: idx * 0.03 }}
                        onClick={() => navigate(`/student/courses/${course.id}`)}
                        className="p-4 rounded-2xl bg-[#FFFEFA] dark:bg-[#242220] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/30 dark:hover:border-[#D1A7CC]/30 hover:shadow-card hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div>
                          <div className="h-32 w-full rounded-xl overflow-hidden bg-[#EAE5DC] dark:bg-[#151413] relative mb-3 border border-[#E3DCD3] dark:border-white/[0.06]">
                            {course.image ? (
                              <img
                                src={course.image}
                                alt={course.title || 'Course'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC]">
                                <BookOpen className="w-8 h-8" />
                              </div>
                            )}

                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 border border-white/10 text-[10px] font-bold text-[#FFFEFA]">
                              {course.category}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => toggleWishlist(course, e)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-white hover:text-rose-400 transition-colors"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isWishlisted ? 'fill-rose-500 text-rose-500' : ''
                                }`}
                              />
                            </button>
                          </div>

                          <h3 className="text-xs sm:text-sm font-bold text-[#282521] dark:text-[#EDE8E1] line-clamp-2 group-hover:text-[#5B3E57] dark:group-hover:text-[#D1A7CC] transition-colors">
                            {course.title || 'Untitled Curriculum'}
                          </h3>
                          {course.instructor && (
                            <p className="text-[11px] text-[#756E64] dark:text-[#7A7368] mt-1 truncate">
                              By {course.instructor}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-[#282521] dark:text-[#EDE8E1]">
                            {course.price != null ? (course.price > 0 ? `₹${course.price.toLocaleString()}` : 'Free') : 'Complimentary'}
                          </span>
                          <span className="text-[10px] text-[#C29B38] flex items-center gap-1 font-mono">
                            <Star className="w-3 h-3 fill-[#C29B38]" />
                            <span>{course.rating ? Number(course.rating).toFixed(1) : '0.0'}</span>
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Bar */}
              <div className="pt-4 border-t border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-between text-xs text-[#756E64] dark:text-[#7A7368]">
                <span className="font-mono text-[11px]">
                  Showing <strong className="text-[#282521] dark:text-[#EDE8E1]">{startItem}–{endItem}</strong> of{' '}
                  <strong className="text-[#282521] dark:text-[#EDE8E1]">{totalCourses}</strong> curriculum modules
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTrendingPage((prev) => Math.max(0, prev - 1))}
                    disabled={trendingPage === 0 || loadingCourses}
                    className="px-2.5 py-1 rounded-xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] hover:bg-[#E1DBD0] dark:hover:bg-[#322F2C] disabled:opacity-30 cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendingPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={trendingPage >= totalPages - 1 || loadingCourses}
                    className="px-2.5 py-1 rounded-xl bg-[#EAE5DC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.06] text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] hover:bg-[#E1DBD0] dark:hover:bg-[#322F2C] disabled:opacity-30 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar Column (1 Col) */}
          <div className="space-y-6">
            {/* Target Goals */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_TRANSITION}
              className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-card space-y-4"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#E3DCD3] dark:border-white/[0.06]">
                <Target className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Engineering Targets</h3>
              </div>

              <div className="divide-y divide-[#E3DCD3] dark:divide-white/[0.04]">
                <div className="py-2.5 first:pt-0 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#282521] dark:text-[#EDE8E1] font-semibold">Master Distributed Systems</span>
                    <span className="text-[#5B3E57] dark:text-[#D1A7CC] font-mono font-bold">66%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#EAE5DC] dark:bg-[#151413] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '66%' }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-[#5B3E57] dark:bg-[#D1A7CC] rounded-full"
                    />
                  </div>
                </div>

                <div className="py-2.5 last:pb-0 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#282521] dark:text-[#EDE8E1] font-semibold">Earn 2 Credentials</span>
                    <span className="text-[#5B3E57] dark:text-[#D1A7CC] font-mono font-bold">50%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#EAE5DC] dark:bg-[#151413] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '50%' }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-[#5B3E57] dark:bg-[#D1A7CC] rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Growth Journey */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_TRANSITION}
              className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-card space-y-4"
            >
              <div className="flex items-center gap-2 pb-3 border-b border-[#E3DCD3] dark:border-white/[0.06]">
                <Trophy className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Growth Analytics</h3>
              </div>

              <div className="divide-y divide-[#E3DCD3] dark:divide-white/[0.04] text-xs">
                <div className="flex justify-between py-2.5 first:pt-0">
                  <span className="text-[#756E64] dark:text-[#7A7368]">Cumulative Study Time</span>
                  <span className="font-mono font-bold text-[#282521] dark:text-[#EDE8E1]">24h 30m</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-[#756E64] dark:text-[#7A7368]">Curriculum Completed</span>
                  <span className="font-mono font-bold text-[#282521] dark:text-[#EDE8E1]">{completedCount}</span>
                </div>
                <div className="flex justify-between py-2.5 last:pb-0">
                  <span className="text-[#756E64] dark:text-[#7A7368]">Credentials Issued</span>
                  <span className="font-mono font-bold text-[#5B3E57] dark:text-[#D1A7CC]">{certificatesCount}</span>
                </div>
              </div>
            </motion.div>

            {/* Faculty Accreditation Promotion */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_TRANSITION}
              className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-card space-y-3"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#9A6B56] dark:text-[#D9A48F]" />
                <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Teach on Asivo</h3>
              </div>
              <p className="text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                Join our accredited faculty and distribute your engineering knowledge to candidates worldwide.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setActiveTab('become-instructor')}
              >
                Apply as Faculty Lead
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;