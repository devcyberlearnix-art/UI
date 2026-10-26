import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Check,
  Search,
  Heart,
  Eye,
  X,
  Loader2,
  ExternalLink,
  Compass,
  Target,
  Trophy,
  BarChart3,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import InstructorApplication from "./InstructorApplication";
import { courseApi } from "../../api/courseApi";
import { landingApi } from "../../api/landingApi";
import { studentApi } from "../../api/studentApi";
import axiosInstance from "../../api/axiosInstance";
import Portal from "../../components/ui/Portal";

// Consolidated API fetching functions
const fetchDashboardStats = async (setDashboardStats, setStatsError, setLoadingStats, preserveOnFailure = false) => {
  setLoadingStats(true);
  setStatsError("");
  try {
    const response = await courseApi.getStudentDashboard();
    // Backend returns ApiResponse<StudentDashboardResponse> envelope
    // courseApi already unwraps .data, so response is StudentDashboardResponse
    const stats = response;
    setDashboardStats(stats);
  } catch (err) {
    console.error("[StudentDashboard] Failed to fetch dashboard stats:", err);
    setStatsError(err.message || "Failed to load dashboard statistics");
    // Only clear stats on initial load failure, preserve on retry failure
    if (!preserveOnFailure) {
      setDashboardStats(null);
    }
  } finally {
    setLoadingStats(false);
  }
};

const fetchEnrolledCourses = async (setEnrolledCourses, setEnrolledError, setLoadingEnrolled, preserveOnFailure = false) => {
  setLoadingEnrolled(true);
  setEnrolledError("");
  try {
    const response = await courseApi.getStudentCourses();
    // Backend returns ApiResponse<DashboardCourseResponse> envelope
    // courseApi already unwraps .data, so response is DashboardCourseResponse
    // DashboardCourseResponse has a 'courses' field
    const payload = response?.courses || response?.data?.courses || response?.data || response;
    const courses = Array.isArray(payload) ? payload : [];

    const normalized = courses.map((item, index) => ({
      id: item.courseId || item.id || item._id || `enrolled-${index}`,
      title: item.title || item.courseName || null,
      instructor: item.instructor || item.instructorName || null,
      progress: item.progress != null ? Math.min(100, Math.max(0, Number(item.progress))) : (item.completionPercentage != null ? Math.min(100, Math.max(0, Number(item.completionPercentage))) : null),
      duration: item.duration || null,
      thumbnail: item.thumbnail || item.image || null,
    }));

    setEnrolledCourses(normalized);
  } catch (err) {
    console.error("[StudentDashboard] Failed to fetch enrolled courses:", err);
    setEnrolledError(err.message || "Failed to load enrolled courses");
    // Only clear courses on initial load failure, preserve on retry failure
    if (!preserveOnFailure) {
      setEnrolledCourses([]);
    }
  } finally {
    setLoadingEnrolled(false);
  }
};

// Filter Categories
const CATEGORY_OPTIONS = [
  "All",
  "Programming",
  "Web Development",
  "Data Science",
  "Cloud & DevOps",
  "Artificial Intelligence",
  "Design",
  "Business",
];

// Difficulty Levels
const LEVEL_OPTIONS = ["All", "Beginner", "Intermediate", "Advanced"];

const CATEGORY_COLORS = {
  Programming: "bg-[#2563EB] text-white",
  "Web Development": "bg-[#06B6D4] text-white",
  "Data Science": "bg-[#0B1220] text-white",
  "Cloud & DevOps": "bg-[#2563EB] text-white",
  "Artificial Intelligence": "bg-[#06B6D4] text-white",
  Design: "bg-[#0B1220] text-white",
  Business: "bg-[#2563EB] text-white",
};

const normalizeCourse = (c, index) => {
  return {
    id: c.id || c.courseId || c._id || `course-${index}`,
    title: c.title || c.courseName || c.name || null,
    category: c.category || c.categoryName || null,
    level: c.level || c.difficultyLevel || null,
    price: c.price != null ? Number(c.price) : (c.amount != null ? Number(c.amount) : null),
    rating: c.rating != null ? Number(c.rating) : (c.avgRating != null ? Number(c.avgRating) : null),
    students: c.students != null ? Number(c.students) : (c.enrollmentCount != null ? Number(c.enrollmentCount) : (c.enrolledStudents != null ? Number(c.enrolledStudents) : null)),
    duration: c.duration || c.estimatedDuration || null,
    instructor:
      c.instructor?.name ||
      c.instructorName ||
      (typeof c.instructor === "string" ? c.instructor : null),
    image:
      c.image ||
      c.thumbnail ||
      c.coverImage ||
      c.banner ||
      null,
    description: c.description || c.summary || null,
  };
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Dashboard Statistics State (from GET /api/v1/dashboard/student)
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  // Real Enrolled Courses State (from GET /api/v1/dashboard/student/courses)
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [enrolledError, setEnrolledError] = useState("");

  // User Profile State (from GET /api/v1/users/me)
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Trending Courses API State with Pagination & Filters
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseError, setCourseError] = useState("");

  const [trendingPage, setTrendingPage] = useState(0);
  const [trendingSize, setTrendingSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchKeyword, setSearchKeyword] = useState("");

  // User-specific localStorage key
  const getStorageKey = () => {
    const userId = user?.id || user?.userId || user?.email || "guest";
    return `wishlist_${userId}`;
  };

  // Interactive Wishlist State (persisted in localStorage - user-specific)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const key = getStorageKey();
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Interactive Quick Preview Modal State (Enriched via GET /api/v1/courses/:courseId)
  const [previewCourse, setPreviewCourse] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDetailTab] = useState("overview");

  // Instructor Application status
  const [applicationStatus, setApplicationStatus] = useState(() => {
    return localStorage.getItem("instructor_application_status") || null;
  });

  const toggleWishlist = (course, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    const courseId = String(course.id);
    const exists = wishlist.some((id) => String(id) === courseId);
    let updated;
    if (exists) {
      updated = wishlist.filter((id) => String(id) !== courseId);
      toast.success(`Removed from your saved courses`, { icon: '🤍' });
    } else {
      updated = [...wishlist, courseId];
      toast.success(`Saved "${course.title.slice(0, 28)}..." to wishlist`, { icon: '❤️' });
    }
    setWishlist(updated);
    try {
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save wishlist to storage", err);
    }
  };

  // Triggered when user clicks ANY course: calls GET {{baseurl}}/api/v1/courses/{courseId} with cookies
  const handleCourseClick = async (course) => {
    setPreviewCourse(course);
    setLoadingDetail(true);
    setDetailTab("overview");

    try {
      const res = await courseApi.getCourseById(course.id);
      const data = res?.data || res;
      if (data) {
        setPreviewCourse((prev) => ({
          ...prev,
          ...data,
          id: data.id || data.courseId || prev?.id || course.id,
          title: data.title || data.courseName || prev?.title || course.title,
          description: data.description || data.summary || prev?.description || course.description,
          category: data.category || data.categoryName || prev?.category || course.category,
          level: data.level || data.difficultyLevel || prev?.level || course.level,
          price: data.price != null ? Number(data.price) : prev?.price,
          rating: Number(data.rating || data.avgRating || prev?.rating || 4.8),
          students: Number(data.students || data.enrolledCount || prev?.students || 140),
          duration: data.duration || data.estimatedDuration || prev?.duration || "Self-paced",
          instructor:
            data.instructor?.name ||
            data.instructorName ||
            (typeof data.instructor === "string" ? data.instructor : prev?.instructor || course.instructor),
          instructorRole: data.instructor?.role || "Senior Technical Instructor",
          instructorBio: data.instructor?.bio || "Experienced technical educator and industry specialist.",
          modules: data.modules || data.chapters || (data.lessons ? [{ id: 1, title: "Course Curriculum", lessons: data.lessons }] : [
            {
              id: 1,
              title: "Module 1: Foundations & Architecture",
              duration: "2h 45m",
              lessons: [
                { id: "l1", title: "Welcome & Setup", duration: "12:40", isFree: true },
                { id: "l2", title: "Core Concepts", duration: "24:15", isFree: true },
                { id: "l3", title: "Project Structure", duration: "32:00", isFree: false },
              ],
            },
            {
              id: 2,
              title: "Module 2: Practical Implementation",
              duration: "4h 10m",
              lessons: [
                { id: "l4", title: "Deep-Dive into Best Practices", duration: "45:10", isFree: false },
                { id: "l5", title: "Building Real Components", duration: "52:30", isFree: false },
              ],
            },
          ]),
          objectives: data.objectives || data.learningOutcomes || data.whatYouWillLearn || [
            "Master production-ready practices and architectures",
            "Build robust applications with hands-on exercises",
            "Earn a verified credential upon successful completion",
          ],
          requirements: data.requirements || data.prerequisites || [
            "Basic computer literacy and a modern web browser",
            "Passion to learn and build real-world software",
          ],
        }));
      }
    } catch (err) {
      console.warn(`[StudentDashboard] GET /api/v1/courses/${course.id} fallback note:`, err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Fetch Course Discovery from API (/api/v1/courses/list)
  const fetchTrending = useCallback(async () => {
    setLoadingCourses(true);
    setCourseError("");

    try {
      const filters = {};
      if (selectedCategory !== "All") filters.category = selectedCategory;
      if (selectedLevel !== "All") filters.level = selectedLevel;
      if (searchKeyword.trim()) filters.search = searchKeyword.trim();

      const res = await courseApi.getCourseList(filters).catch(async () => {
        return await courseApi.getTrendingCourses({
          page: trendingPage,
          size: trendingSize,
          category: selectedCategory !== "All" ? selectedCategory : "",
          level: selectedLevel !== "All" ? selectedLevel : "",
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
      console.error("[StudentDashboard] Course discovery API error:", err);
      setCourseError(err.message || "Failed to load courses from API.");
      setTrendingCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [trendingPage, trendingSize, selectedCategory, selectedLevel, searchKeyword]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  // Reload wishlist when user changes
  useEffect(() => {
    const key = getStorageKey();
    try {
      const saved = localStorage.getItem(key);
      setWishlist(saved ? JSON.parse(saved) : []);
    } catch {
      setWishlist([]);
    }
  }, [user]);

  // Fetch User Profile from GET /api/v1/users/me
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError("");
        const response = await studentApi.getProfile();
        const userData = response?.data?.user || response?.data || response;
        setUserProfile(userData);
      } catch (err) {
        console.error("[StudentDashboard] Failed to fetch user profile:", err);
        setProfileError(err.message || "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch Dashboard Statistics from GET /api/v1/dashboard/student
  useEffect(() => {
    fetchDashboardStats(setDashboardStats, setStatsError, setLoadingStats, false);
  }, []);

  // Load User Enrolled Courses from GET /api/v1/dashboard/student/courses
  useEffect(() => {
    fetchEnrolledCourses(setEnrolledCourses, setEnrolledError, setLoadingEnrolled, false);
  }, []);

  const handleStatusChange = (status) => {
    setApplicationStatus(status);
    localStorage.setItem("instructor_application_status", status);
  };

  // Metrics computation - use API data when available, no fallback for certificates
  const enrolledCount = dashboardStats?.enrolledCourses ?? enrolledCourses.length;
  const inProgressCount = useMemo(
    () => enrolledCourses.filter((c) => Number(c.progress) > 0 && Number(c.progress) < 100).length,
    [enrolledCourses]
  );
  const completedCount = dashboardStats?.completedCourses ?? useMemo(
    () => enrolledCourses.filter((c) => Number(c.progress) >= 100).length,
    [enrolledCourses]
  );
  const certificatesCount = dashboardStats?.certificates ?? null;

  // Pagination calculation
  const startItem = totalCourses === 0 ? 0 : trendingPage * trendingSize + 1;
  const endItem = Math.min((trendingPage + 1) * trendingSize, totalCourses);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full space-y-4 font-sans"
    >
      {/* ── TOP HERO BANNER: ASIVO DESIGN IDENTITY WITH PERSONALIZED WELCOME ────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-100 via-blue-50 to-sky-100 p-6 sm:p-8 text-slate-900 shadow-lg border border-slate-200">
        {/* Ambient Glows */}
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#2563EB]/10 to-[#06B6D4]/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 h-40 w-40 rounded-full bg-gradient-to-tr from-[#06B6D4]/10 to-[#2563EB]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Good morning{userProfile?.firstName ? `, ${userProfile.firstName}` : user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-lg sm:text-xl font-semibold text-slate-700 leading-relaxed">
              Your learning journey creates brighter tomorrows.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Keep learning, building real skills, and moving closer to your goals with Asivo.
            </p>
          </div>

          {/* Mountain Illustration */}
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden opacity-60">
            <svg
              viewBox="0 0 400 200"
              className="w-full h-full object-cover"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 200 L100 80 L200 140 L300 60 L400 100 L400 200 Z" fill="#E0F2FE" opacity="0.5"/>
              <path d="M50 200 L150 100 L250 160 L350 90 L400 120 L400 200 Z" fill="#BAE6FD" opacity="0.4"/>
              <circle cx="320" cy="50" r="20" fill="#FEF3C7" opacity="0.6"/>
              <path d="M300 180 L320 150 L340 180 Z" fill="#94A3B8" opacity="0.5"/>
              <circle cx="310" cy="170" r="2" fill="#64748B"/>
            </svg>
          </div>

          {/* Quick Interactive Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 relative z-20">
            {enrolledCourses.length > 0 ? (
              <button
                onClick={() => {
                  const lastCourse = enrolledCourses[0];
                  if (lastCourse) {
                    navigate(`/student/my-learning`);
                  }
                }}
                aria-label="Continue learning"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] hover:from-[#2563EB]/90 hover:to-[#06B6D4]/90 text-white font-bold text-sm shadow-md shadow-[#2563EB]/25 active:scale-95 transition-all"
              >
                <PlayCircle size={18} />
                <span>Continue Learning</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/student/courses")}
                aria-label="Explore courses"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] hover:from-[#2563EB]/90 hover:to-[#06B6D4]/90 text-white font-bold text-sm shadow-md shadow-[#2563EB]/25 active:scale-95 transition-all"
              >
                <Compass size={18} />
                <span>Explore Courses</span>
              </button>
            )}
            <button
              onClick={() => navigate("/student/courses")}
              aria-label="Explore courses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB]/5 font-bold text-sm transition-all"
            >
              <Compass size={18} />
              <span>Explore Courses</span>
            </button>
          </div>
        </div>

        {/* Learning Streak Widget */}
        <div className="mt-4 flex items-center gap-3 relative z-20">
          <div className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Learning Streak 12 days</p>
              <p className="text-[10px] text-slate-500">Keep it going!</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── VIEW: BECOME INSTRUCTOR ──────────────────────────────────────── */}
      {activeTab === "become-instructor" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Instructor Accreditation Form</h2>
              <p className="text-xs text-slate-500">Submit your verification documents to join our faculty.</p>
            </div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 font-sans"
            >
              Back to Dashboard
            </button>
          </div>

          <InstructorApplication
            onBack={() => setActiveTab("dashboard")}
            applicationStatus={applicationStatus}
            onStatusChange={handleStatusChange}
          />
        </div>
      ) : (
        /* ── VIEW: MAIN DASHBOARD ───────────────────────────────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Main Content Column */}
          <div className="lg:col-span-3 space-y-6">

          {/* Quick Metrics: Asivo Design Identity with Loading States */}
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3.5 animate-pulse">
                  <div className="h-5 w-24 rounded bg-slate-100 mb-2" />
                  <div className="h-8 w-16 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : statsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-500" />
                  <span>{statsError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchDashboardStats(setDashboardStats, setStatsError, setLoadingStats, true)}
                  disabled={loadingStats}
                  className="font-bold underline hover:text-red-900 text-[11px] disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Enrolled Courses */}
              <motion.div
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#2563EB] hover:shadow-md transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">Enrolled Courses</span>
                  <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BookOpen size={16} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {enrolledCount}
                  </span>
                  <BarChart3 size={14} className="text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">+2 this month</p>
              </motion.div>

              {/* 2. In Progress */}
              <motion.div
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cyan-500 hover:shadow-md transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">In Progress</span>
                  <div className="h-8 w-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                    <PlayCircle size={16} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {inProgressCount}
                  </span>
                  <Star size={14} className="text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Keep going!</p>
              </motion.div>

              {/* 3. Completed */}
              <motion.div
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-green-500 hover:shadow-md transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">Completed</span>
                  <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 size={16} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {completedCount}
                  </span>
                  <CheckCircle2 size={14} className="text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Great progress!</p>
              </motion.div>

              {/* 4. Certificate Earned */}
              <motion.div
                whileHover={{ y: -2, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-amber-500 hover:shadow-md transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600">Certificates Earned</span>
                  <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Award size={16} strokeWidth={2.5} />
                  </div>
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {certificatesCount ?? 0}
                  </span>
                  <Award size={14} className="text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">View certificates</p>
              </motion.div>
            </div>
          )}

          {/* Active Enrolled Courses (Surfaced only if student has courses) */}
          {loadingEnrolled ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-slate-100 animate-pulse" />
                  <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 rounded-xl border border-slate-200 bg-slate-50 animate-pulse">
                    <div className="h-4 w-full rounded bg-slate-200 mb-2" />
                    <div className="h-3 w-2/3 rounded bg-slate-200 mb-3" />
                    <div className="h-2 w-full rounded bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          ) : enrolledError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-500" />
                  <span>{enrolledError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchEnrolledCourses(setEnrolledCourses, setEnrolledError, setLoadingEnrolled, true)}
                  disabled={loadingEnrolled}
                  className="font-bold underline hover:text-red-900 text-[11px] disabled:opacity-50"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : enrolledCourses.length > 0 ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                    <PlayCircle size={15} />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">Continue Learning</h2>
                    <p className="text-[10px] text-slate-500">Pick up where you left off and keep the momentum.</p>
                  </div>
                </div>
                <Link
                  to="/student/my-learning"
                  className="text-xs font-bold text-[#2563EB] hover:text-[#06B6D4] flex items-center gap-1 transition"
                >
                  View All ({enrolledCourses.length}) <ChevronRight size={13} />
                </Link>
              </div>

              {/* Featured Course Card (Larger) */}
              {enrolledCourses.length > 0 && (
                <div
                  key={enrolledCourses[0].id}
                  className="w-full flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-[#2563EB]/20 bg-gradient-to-br from-[#2563EB]/5 via-white to-[#F8FAFC] hover:border-[#2563EB] hover:shadow-md transition cursor-pointer text-left mb-4"
                  role="button"
                  tabIndex={0}
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
                    } catch (err) {
                      console.error("Resume learning failed:", err);
                      toast.error("Failed to resume learning. Redirecting to course details.");
                      navigate(`/student/courses/${enrolledCourses[0].id}`);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.currentTarget.click();
                    }
                  }}
                  aria-label={`Continue learning: ${enrolledCourses[0].title || 'Course'}`}
                >
                  <div className="w-full sm:w-48 h-32 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    {enrolledCourses[0].thumbnail ? (
                      <img
                        src={enrolledCourses[0].thumbnail}
                        alt={enrolledCourses[0].title || "Course"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#2563EB]/20 to-[#06B6D4]/20 flex items-center justify-center">
                        <BookOpen size={32} className="text-[#2563EB]/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{enrolledCourses[0].title || "Untitled Course"}</h3>
                      {enrolledCourses[0].instructor && (
                        <p className="text-xs text-slate-500 mt-1">By {enrolledCourses[0].instructor}</p>
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="font-semibold text-slate-600">Course Progress</span>
                        <span className="font-bold text-[#2563EB]">{enrolledCourses[0].progress != null ? `${enrolledCourses[0].progress}%` : '--'}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-full transition-all duration-300"
                          style={{ width: enrolledCourses[0].progress != null ? `${enrolledCourses[0].progress}%` : '0%' }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-500">Last lesson: Building Responsive Layouts</p>
                        <p className="text-[10px] font-bold text-[#2563EB]">2h 30m left</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        try {
                          courseApi.resumeLearning(enrolledCourses[0].id).then((resumeData) => {
                            const resumeInfo = resumeData?.data || resumeData;
                            const lectureId = resumeInfo?.nextLectureId || resumeInfo?.lastLectureId;
                            if (lectureId) {
                              navigate(`/student/courses/${enrolledCourses[0].id}/learn/${lectureId}`);
                            } else {
                              navigate(`/student/courses/${enrolledCourses[0].id}`);
                            }
                          });
                        } catch (err) {
                          console.error("Resume learning failed:", err);
                          navigate(`/student/courses/${enrolledCourses[0].id}`);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] hover:from-[#2563EB]/90 hover:to-[#06B6D4]/90 text-white text-xs font-bold shadow-md shadow-[#2563EB]/25 transition active:scale-95"
                    >
                      Resume Learning
                    </button>
                  </div>
                </div>
              )}

              {/* Smaller Course Cards */}
              {enrolledCourses.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {enrolledCourses.slice(1, 3).map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:border-[#2563EB] hover:shadow-sm transition cursor-pointer text-left"
                      role="button"
                      tabIndex={0}
                      onClick={async () => {
                        try {
                          const resumeData = await courseApi.resumeLearning(course.id);
                          const resumeInfo = resumeData?.data || resumeData;
                          const lectureId = resumeInfo?.nextLectureId || resumeInfo?.lastLectureId;
                          if (lectureId) {
                            navigate(`/student/courses/${course.id}/learn/${lectureId}`);
                          } else {
                            navigate(`/student/courses/${course.id}`);
                          }
                        } catch (err) {
                          console.error("Resume learning failed:", err);
                          toast.error("Failed to resume learning. Redirecting to course details.");
                          navigate(`/student/courses/${course.id}`);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                      aria-label={`Continue learning: ${course.title || 'Course'}`}
                    >
                      <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title || "Course"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#2563EB]/20 to-[#06B6D4]/20 flex items-center justify-center">
                            <BookOpen size={16} className="text-[#2563EB]/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{course.title || "Untitled Course"}</h3>
                        {course.instructor && (
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{course.instructor}</p>
                        )}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1 font-mono">
                            <span className="font-semibold text-slate-600">Progress</span>
                            <span className="font-bold text-[#2563EB]">{course.progress != null ? `${course.progress}%` : '--'}</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-full transition-all duration-300"
                              style={{ width: course.progress != null ? `${course.progress}%` : '0%' }}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          try {
                            courseApi.resumeLearning(course.id).then((resumeData) => {
                              const resumeInfo = resumeData?.data || resumeData;
                              const lectureId = resumeInfo?.nextLectureId || resumeInfo?.lastLectureId;
                              if (lectureId) {
                                navigate(`/student/courses/${course.id}/learn/${lectureId}`);
                              } else {
                                navigate(`/student/courses/${course.id}`);
                              }
                            });
                          } catch (err) {
                            console.error("Resume learning failed:", err);
                            navigate(`/student/courses/${course.id}`);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#06B6D4] text-white text-[10px] font-bold transition shrink-0"
                      >
                        Continue
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-[#F8FAFC] p-8 text-center">
              <BookOpen size={32} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No courses enrolled yet</h3>
              <p className="text-xs text-slate-500 mt-1">Start your learning journey by exploring our course catalog.</p>
              <button
                onClick={() => navigate("/student/courses")}
                aria-label="Browse courses to start learning"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] hover:bg-[#06B6D4] text-white px-4 py-2 text-xs font-bold transition shadow-sm"
              >
                <Compass size={13} />
                Browse Courses
              </button>
            </div>
          )}

          {/* ── FEATURED & TRENDING COURSES MODULE ───────────────────────── */}
          <div id="trending-courses-section" className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            
            {/* Header: Title & Quick Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] text-white flex items-center justify-center shadow-xs">
                    <Star size={13} />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Course Discovery
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Explore top-rated industry courses and skills to accelerate your learning roadmap.
                </p>
              </div>

              {/* Quick Search & Refresh */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setTrendingPage(0);
                        fetchTrending();
                      }
                    }}
                    aria-label="Search courses"
                    className="w-36 sm:w-48 pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10 transition"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchKeyword("");
                        setTrendingPage(0);
                        fetchTrending();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/student/courses")}
                  title="Browse Full Course Catalog"
                  aria-label="Browse full course catalog"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 hover:bg-[#2563EB]/10 text-[#2563EB] text-xs font-bold transition shadow-2xs"
                >
                  <Compass size={13} className="text-[#2563EB]" />
                  <span>Browse All</span>
                  <ArrowRight size={11} />
                </button>
                <button
                  type="button"
                  onClick={fetchTrending}
                  disabled={loadingCourses}
                  title="Refresh Courses"
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-[#2563EB]/5 hover:border-[#2563EB] text-slate-600 hover:text-[#2563EB] transition shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loadingCourses ? "animate-spin text-[#2563EB]" : ""} />
                </button>
              </div>
            </div>

            {/* Filter Toolbar: Category Pills & Level Selectors */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Category Pills Bar (Horizontal Scrollable) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 lg:pb-0 hide-scrollbar">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSel = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setTrendingPage(0);
                      }}
                      className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                        isSel
                          ? "bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#2563EB] text-white shadow-md shadow-[#2563EB]/25 font-bold scale-[1.02]"
                          : "bg-slate-50 hover:bg-[#2563EB]/5 text-slate-600 hover:text-[#2563EB] border border-slate-200/80 hover:border-[#2563EB]"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Level Filter Dropdown */}
              <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Filter size={12} className="text-[#2563EB]" />
                  <span className="font-semibold text-[11px]">Level:</span>
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setTrendingPage(0);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-[#2563EB]"
                  >
                    {LEVEL_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {courseError && (
              <div className="p-3 rounded-xl border border-red-200 bg-red-50 flex items-center justify-between text-xs text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-red-500 shrink-0" />
                  <span>{courseError}</span>
                </div>
                <button
                  onClick={fetchTrending}
                  className="font-bold underline hover:text-red-900 text-[11px]"
                >
                  Retry API
                </button>
              </div>
            )}

            {/* Course Cards Grid */}
            {loadingCourses ? (
              /* High-end Skeleton Loader */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {Array.from({ length: trendingSize }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2.5 animate-pulse"
                  >
                    <div className="h-32 w-full rounded-xl bg-slate-100" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-3/4 rounded bg-slate-100" />
                      <div className="h-2.5 w-1/2 rounded bg-slate-100" />
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-4 w-14 rounded bg-slate-100" />
                      <div className="h-7 w-20 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : trendingCourses.length === 0 ? (
              /* Empty state */
              <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <BookOpen size={28} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                  No courses found matching filters
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                  Try switching categories or levels, or clear your search keyword.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedLevel("All");
                    setSearchKeyword("");
                    setTrendingPage(0);
                    fetchTrending();
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-xl border border-[#2563EB]/20 bg-[#2563EB]/5 px-3.5 py-1.5 text-xs font-bold text-[#2563EB] hover:bg-[#2563EB]/10 transition shadow-2xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Render Course Cards (Vibrant Colors & Micro-Interactions) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {trendingCourses.map((course, idx) => {
                  const isWishlisted = wishlist.some((id) => String(id) === String(course.id));
                  const catColor = CATEGORY_COLORS[course.category] || "bg-slate-900 text-white";

                  return (
                    <motion.div
                      key={course.id || idx}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.16, delay: idx * 0.02 }}
                      whileHover={{ y: -3 }}
                      onClick={() => navigate(`/student/courses/${course.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for ${course.title || 'Course'}`}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white hover:border-[#2563EB] hover:shadow-lg hover:shadow-[#2563EB]/10 transition-all overflow-hidden cursor-pointer text-left"
                    >
                      <div>
                        {/* Course Banner with Image Zoom & Badges */}
                        <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                          {course.image ? (
                            <img
                              src={course.image}
                              alt={course.title || "Course"}
                              className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-[#2563EB]/20 to-[#06B6D4]/20 flex items-center justify-center">
                              <BookOpen size={32} className="text-[#2563EB]/40" />
                            </div>
                          )}

                          {/* Vivid Category Pill */}
                          {course.category && (
                            <span className={`absolute top-2.5 left-2.5 rounded-lg px-2.5 py-0.5 text-[10px] font-bold shadow-md shadow-black/20 ${catColor}`}>
                              {course.category}
                            </span>
                          )}

                          {/* Interactive Wishlist Heart Button */}
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            type="button"
                            onClick={(e) => toggleWishlist(course, e)}
                            className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md hover:bg-white transition-colors"
                            title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
                          >
                            <Heart
                              size={13}
                              className={`transition-colors duration-200 ${
                                isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600 hover:text-rose-500"
                              }`}
                            />
                          </motion.button>

                          {/* Difficulty Level Pill */}
                          {course.level && (
                            <span className="absolute bottom-2.5 left-2.5 rounded-md bg-[#0B1220]/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-white">
                              {course.level}
                            </span>
                          )}
                        </div>

                        {/* Content Specs */}
                        <div className="p-3.5">
                          <h3
                            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#2563EB] transition-colors"
                            title={course.title || "Course"}
                          >
                            {course.title || "Untitled Course"}
                          </h3>
                          {course.instructor && (
                            <p className="text-[11px] text-slate-500 truncate mt-1">
                              By {course.instructor}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-2.5 pt-2.5 border-t border-slate-100">
                            {course.rating != null && (
                              <span className="flex items-center gap-1 font-bold text-[#2563EB] bg-[#2563EB]/10 px-1.5 py-0.5 rounded">
                                <Star size={11} className="fill-[#06B6D4] text-[#06B6D4]" /> {course.rating}
                              </span>
                            )}
                            {course.students != null && (
                              <span className="flex items-center gap-1">
                                <Users size={11} className="text-slate-400" /> {course.students}
                              </span>
                            )}
                            {course.duration && (
                              <span className="flex items-center gap-1">
                                <Clock size={11} className="text-slate-400" /> {course.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Interactive CTA */}
                      <div className="p-3.5 pt-0 flex items-center justify-between border-t border-slate-50 mt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900">
                            {course.price != null ? (course.price > 0 ? `₹${course.price}` : "Free") : "Price TBA"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCourseClick(course);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                            title="Quick Preview"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/cart");
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#2563EB] hover:from-[#2563EB]/90 hover:to-[#06B6D4]/90 text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-[#2563EB]/25 transition active:scale-95"
                          >
                            <ShoppingCart size={12} /> Enroll
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls Bar */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Showing <strong className="text-slate-800 font-bold">{startItem}–{endItem}</strong> of{" "}
                <strong className="text-slate-800 font-bold">{totalCourses}</strong> courses
              </span>

              {/* Prev / Page Numbers / Next */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTrendingPage((prev) => Math.max(0, prev - 1))}
                  disabled={trendingPage === 0 || loadingCourses}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-[#2563EB]/5 hover:text-[#2563EB] hover:border-[#2563EB] disabled:opacity-40 transition shadow-2xs"
                >
                  <ChevronLeft size={13} /> Prev
                </button>

                {/* Page numbered pills */}
                <div className="flex items-center gap-1 mx-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    const isCur = idx === trendingPage;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTrendingPage(idx)}
                        disabled={loadingCourses}
                        className={`h-7 w-7 rounded-lg text-xs font-mono font-bold transition ${
                          isCur
                            ? "bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white shadow-md shadow-[#2563EB]/30 scale-105"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-[#2563EB]"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <span className="text-slate-400 font-mono text-xs px-1">...</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setTrendingPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={trendingPage >= totalPages - 1 || loadingCourses}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-[#2563EB]/5 hover:text-[#2563EB] hover:border-[#2563EB] disabled:opacity-40 transition shadow-2xs"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-1 space-y-5">
            {/* Today's Learning Widget */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-md bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center">
                  <Clock size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Today's Learning</h3>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <p className="text-xs text-slate-500 mb-1">No scheduled lessons today</p>
                <p className="text-[10px] text-slate-400">Explore courses to start learning</p>
              </div>
            </div>

            {/* Your Goals Widget */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-md bg-[#06B6D4]/10 text-[#06B6D4] flex items-center justify-center">
                  <Target size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Your Goals</h3>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-[#2563EB]/5 to-[#06B6D4]/5 border border-[#2563EB]/10">
                  <p className="text-xs font-bold text-slate-900">Complete 3 courses</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-full" style={{ width: '33%' }} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">1 of 3 completed</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs font-bold text-slate-900">Earn 2 certificates</p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-full" style={{ width: '50%' }} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">1 of 2 earned</p>
                </div>
              </div>
            </div>

            {/* Your Growth Journey Widget */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-md bg-green-100 text-green-600 flex items-center justify-center">
                  <Trophy size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Your Growth Journey</h3>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Total Learning Time</span>
                  <span className="font-bold text-slate-900">24h 30m</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Courses Completed</span>
                  <span className="font-bold text-slate-900">{completedCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Certificates Earned</span>
                  <span className="font-bold text-slate-900">{certificatesCount ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Promotion Card */}
            <div className="rounded-2xl border border-[#2563EB]/30 bg-gradient-to-br from-[#2563EB]/10 via-[#06B6D4]/5 to-[#2563EB]/10 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-md bg-white/20 text-white flex items-center justify-center">
                  <GraduationCap size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Upgrade to Pro</h3>
              </div>
              <p className="text-xs text-slate-600 mb-3">Unlock unlimited courses, certificates, and personalized learning paths.</p>
              <button
                onClick={() => navigate('/student/courses')}
                className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#06B6D4] hover:from-[#2563EB]/90 hover:to-[#06B6D4]/90 text-white text-xs font-bold shadow-md shadow-[#2563EB]/25 transition active:scale-95"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE COURSE PREVIEW MODAL (DATA FROM GET /api/v1/courses/:courseId) ── */}
      <AnimatePresence>
        {previewCourse && (
          <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden font-sans"
              >
              {/* Image banner with overlay */}
              <div className="relative h-44 sm:h-48 w-full bg-slate-100 shrink-0">
                <img
                  src={previewCourse.image}
                  alt={previewCourse.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                <button
                  type="button"
                  onClick={() => setPreviewCourse(null)}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center transition shadow-md"
                >
                  <X size={16} />
                </button>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold shadow-xs ${CATEGORY_COLORS[previewCourse.category] || "bg-indigo-600 text-white"}`}>
                      {previewCourse.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[10px] font-semibold text-white">
                      {previewCourse.level}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black line-clamp-1 text-white">
                    {previewCourse.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">By {previewCourse.instructor}</p>
                </div>
              </div>

              {/* Status bar & Subtabs */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 hide-scrollbar">
                {/* Live API sync notification */}
                {loadingDetail && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2563EB]/5 border border-[#2563EB]/20 text-[#2563EB] text-xs font-semibold animate-pulse">
                    <Loader2 size={13} className="animate-spin text-[#2563EB] shrink-0" />
                    <span>Loading verified syllabus & curriculum from API...</span>
                  </div>
                )}

                {/* Metrics bar */}
                <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Rating</p>
                    <p className="font-bold text-amber-700 flex items-center justify-center gap-1 mt-0.5">
                      <Star size={11} className="fill-amber-400 text-amber-400" /> {previewCourse.rating}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Learners</p>
                    <p className="font-bold text-slate-800 mt-0.5">{previewCourse.students}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Level</p>
                    <p className="font-bold text-slate-800 mt-0.5">{previewCourse.level}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">Duration</p>
                    <p className="font-bold text-slate-800 mt-0.5 truncate">{previewCourse.duration}</p>
                  </div>
                </div>

                {/* Subtabs selector */}
                <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "curriculum", label: `Curriculum (${previewCourse.modules?.length || 0})` },
                    { id: "instructor", label: "Instructor" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDetailTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        detailTab === tab.id
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content: Overview */}
                {detailTab === "overview" && (
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">About this course</h4>
                      <p className="text-slate-600 leading-relaxed">
                        {previewCourse.description}
                      </p>
                    </div>

                    {previewCourse.objectives && previewCourse.objectives.length > 0 && (
                      <div className="p-3 rounded-xl bg-[#2563EB]/5 border border-[#2563EB]/20 space-y-2">
                        <h4 className="font-bold text-[#2563EB] flex items-center gap-1.5">
                          <Star size={13} className="text-[#06B6D4]" /> What You'll Learn
                        </h4>
                        <div className="space-y-1.5">
                          {previewCourse.objectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-2 text-slate-700">
                              <CheckCircle2 size={13} className="text-[#06B6D4] shrink-0 mt-0.5" />
                              <span className="leading-snug">{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content: Curriculum / Modules */}
                {detailTab === "curriculum" && (
                  <div className="space-y-2.5 text-xs">
                    {previewCourse.modules && previewCourse.modules.length > 0 ? (
                      previewCourse.modules.map((mod, mIdx) => (
                        <div key={mod.id || mIdx} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{mod.title}</span>
                            <span className="text-[10px] font-mono text-slate-400">{mod.duration || "Self-paced"}</span>
                          </div>
                          {mod.lessons && (
                            <div className="space-y-1.5 pt-1 divide-y divide-slate-100">
                              {mod.lessons.map((lesson, lIdx) => (
                                <div key={lesson.id || lIdx} className="flex items-center justify-between pt-1.5 text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <PlayCircle size={12} className="text-orange-500" />
                                    <span>{lesson.title}</span>
                                    {lesson.isFree && (
                                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded">
                                        Free
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-400">{lesson.duration}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 py-4 text-center">Comprehensive modules & lessons available upon enrollment.</p>
                    )}
                  </div>
                )}

                {/* Tab content: Instructor */}
                {detailTab === "instructor" && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#06B6D4] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {previewCourse.instructor.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{previewCourse.instructor}</h4>
                        <p className="text-[#2563EB] font-medium text-[11px]">{previewCourse.instructorRole || "Lead Instructor"}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {previewCourse.instructorBio || "Dedicated industry practitioner and engineering educator."}
                    </p>
                  </div>
                )}
              </div>

              {/* Sticky Footer Actions */}
              <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Tuition Fee</span>
                  <p className="text-lg sm:text-xl font-black font-mono text-slate-900 leading-tight">
                    {previewCourse.price > 0 ? `₹${previewCourse.price}` : "Free"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(previewCourse, e)}
                    className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                    title="Toggle Wishlist"
                  >
                    <Heart
                      size={14}
                      className={wishlist.some((id) => String(id) === String(previewCourse.id)) ? "fill-rose-500 text-rose-500" : ""}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewCourse(null);
                      navigate(`/student/courses/${previewCourse.id}`);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <ExternalLink size={13} />
                    <span className="hidden sm:inline">Full Page</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewCourse(null);
                      navigate("/cart");
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#2563EB] hover:from-[#2563EB]/90 hover:to-[#06B6D4]/90 text-white text-xs font-bold shadow-md shadow-[#2563EB]/25 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <ShoppingCart size={14} /> Enroll Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </Portal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentDashboard;