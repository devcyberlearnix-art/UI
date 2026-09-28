import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Users,
  ShoppingCart,
  ArrowRight,
  GraduationCap,
  PlayCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  Star,
  Filter,
  Check,
  Search,
  Heart,
  Eye,
  X,
  Flame,
  Loader2,
  ExternalLink,
  Compass,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import InstructorApplication from "./InstructorApplication";
import { courseApi } from "../../api/courseApi";
import { landingApi } from "../../api/landingApi";
import axiosInstance from "../../api/axiosInstance";

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
  Programming: "bg-indigo-600 text-white",
  "Web Development": "bg-cyan-600 text-white",
  "Data Science": "bg-emerald-600 text-white",
  "Cloud & DevOps": "bg-blue-600 text-white",
  "Artificial Intelligence": "bg-purple-600 text-white",
  Design: "bg-rose-600 text-white",
  Business: "bg-amber-600 text-white",
};

const normalizeCourse = (c, index) => {
  return {
    id: c.id || c.courseId || c._id || `trend-${index}`,
    title: c.title || c.courseName || c.name || "Technical Course",
    category: c.category || c.categoryName || "Programming",
    level: c.level || c.difficultyLevel || "Beginner",
    price: c.price != null ? Number(c.price) : (c.amount != null ? Number(c.amount) : 499),
    rating: Number(c.rating || c.avgRating || 4.8),
    students: Number(c.students || c.enrollmentCount || c.enrolledStudents || 140),
    duration: c.duration || c.estimatedDuration || "Self-paced",
    instructor:
      c.instructor?.name ||
      c.instructorName ||
      (typeof c.instructor === "string" ? c.instructor : "LearnMaster Faculty"),
    image:
      c.image ||
      c.thumbnail ||
      c.coverImage ||
      c.banner ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    description: c.description || c.summary || "Master in-demand skills through comprehensive modules, real-world exercises, and expert mentorship.",
  };
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Real Enrolled Courses State
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);

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

  // Interactive Wishlist State (persisted in localStorage)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("student_wishlist");
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
      localStorage.setItem("student_wishlist", JSON.stringify(updated));
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

  // Fetch Trending Courses from API (/api/v1/courses/trending?page=X&size=Y&category=Z&level=W)
  const fetchTrending = useCallback(async () => {
    setLoadingCourses(true);
    setCourseError("");

    try {
      const res = await courseApi.getTrendingCourses({
        page: trendingPage,
        size: trendingSize,
        category: selectedCategory !== "All" ? selectedCategory : "",
        level: selectedLevel !== "All" ? selectedLevel : "",
      }).catch(async () => {
        return await landingApi.getTrendingCourses(
          trendingPage,
          trendingSize,
          selectedCategory !== "All" ? selectedCategory : "",
          selectedLevel !== "All" ? selectedLevel : ""
        );
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
      console.error("[StudentDashboard] Trending API error:", err);
      setCourseError(err.message || "Failed to load trending courses from API.");
      setTrendingCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }, [trendingPage, trendingSize, selectedCategory, selectedLevel]);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  // Load User Enrolled Courses from /api/v1/orders
  useEffect(() => {
    const loadEnrolled = async () => {
      try {
        setLoadingEnrolled(true);
        const response = await axiosInstance.get("/api/v1/orders");
        const payload = response.data?.data || response.data || [];
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
            title: item.title || item.courseName || "Course Title",
            instructor: item.instructor || item.instructorName || "Instructor",
            progress: Math.min(100, Math.max(0, Number(item.progress || 0))),
            duration: item.duration || "Self-paced",
            thumbnail:
              item.thumbnail ||
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
          }));
        });

        const uniqueById = Array.from(new Map(normalized.map((item) => [item.id, item])).values());
        setEnrolledCourses(uniqueById);
      } catch (err) {
        setEnrolledCourses([]);
      } finally {
        setLoadingEnrolled(false);
      }
    };

    loadEnrolled();
  }, []);

  const handleStatusChange = (status) => {
    setApplicationStatus(status);
    localStorage.setItem("instructor_application_status", status);
  };

  // Metrics computation
  const enrolledCount = enrolledCourses.length;
  const completedCount = useMemo(
    () => enrolledCourses.filter((c) => Number(c.progress) >= 100).length,
    [enrolledCourses]
  );
  const certificatesCount = completedCount;
  const avgProgress = useMemo(() => {
    if (!enrolledCourses.length) return 0;
    const total = enrolledCourses.reduce((acc, c) => acc + (Number(c.progress) || 0), 0);
    return Math.round(total / enrolledCourses.length);
  }, [enrolledCourses]);

  // Client-side search filter on currently loaded page
  const filteredCourses = useMemo(() => {
    if (!searchKeyword.trim()) return trendingCourses;
    const q = searchKeyword.toLowerCase();
    return trendingCourses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [trendingCourses, searchKeyword]);

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
      {/* ── TOP HERO BANNER: VIBRANT COLOR FILL & ENGAGING GREETING ────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 text-white shadow-lg shadow-indigo-950/20 border border-indigo-900/40">
        {/* Ambient Glows */}
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-gradient-to-br from-orange-500/25 to-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/4 h-40 w-40 rounded-full bg-gradient-to-tr from-indigo-500/30 to-violet-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-medium text-orange-300">
              <Sparkles size={12} className="text-orange-400" />
              <span>Personalized Learning Roadmap • 2026</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track your coursework milestones, level up key industry skills, and explore trending classes below.
            </p>
          </div>

          {/* Quick Interactive Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="h-8 w-8 rounded-lg bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 font-bold">
                <Flame size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Streak</p>
                <p className="text-xs font-bold text-white font-mono">5 Days Active</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/student/courses")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition active:scale-95 shadow-sm"
            >
              <Compass size={14} className="text-orange-400" />
              <span>Browse Courses</span>
            </button>

            {activeTab !== "dashboard" ? (
              <button
                onClick={() => setActiveTab("dashboard")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition active:scale-95"
              >
                <LayoutDashboard size={14} /> Dashboard View
              </button>
            ) : (
              <>
                {!applicationStatus && (
                  <button
                    onClick={() => setActiveTab("become-instructor")}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 active:scale-95 transition-all"
                  >
                    <GraduationCap size={15} />
                    <span>Become Instructor</span>
                  </button>
                )}
                {applicationStatus === "pending" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs font-bold text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Application In Review
                  </span>
                )}
              </>
            )}
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
        <div className="space-y-4">
          
          {/* Quick Metrics: Rich Color Fills & Interactive Spring Hovers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Enrolled Courses */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-white p-3.5 shadow-xs hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Enrolled Courses</span>
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-sm shadow-orange-500/30 flex items-center justify-center">
                  <BookOpen size={14} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                  {enrolledCount}
                </span>
                <span className="text-[10px] font-bold text-orange-700 bg-orange-100/90 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </motion.div>

            {/* 2. Completed */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white p-3.5 shadow-xs hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10 transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Completed</span>
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-sm shadow-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 size={14} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                  {completedCount}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                  Finished
                </span>
              </div>
            </motion.div>

            {/* 3. Certificates */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-white p-3.5 shadow-xs hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10 transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Certificates</span>
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-sm shadow-indigo-500/30 flex items-center justify-center">
                  <Award size={14} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                  {certificatesCount}
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </motion.div>

            {/* 4. Average Progress */}
            <motion.div
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-white p-3.5 shadow-xs hover:border-sky-300 hover:shadow-md hover:shadow-sky-500/10 transition-all cursor-default"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-700">Study Pace</span>
                <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-500 text-white shadow-sm shadow-sky-500/30 flex items-center justify-center">
                  <TrendingUp size={14} strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                  {avgProgress}%
                </span>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100/90 px-2 py-0.5 rounded-full">
                  On Target
                </span>
              </div>
            </motion.div>
          </div>

          {/* Active Enrolled Courses (Surfaced only if student has courses) */}
          {enrolledCourses.length > 0 && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center">
                    <PlayCircle size={15} />
                  </div>
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">In-Progress Learning</h2>
                </div>
                <Link
                  to="/student/my-learning"
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition"
                >
                  View All ({enrolledCourses.length}) <ChevronRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {enrolledCourses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    className="flex flex-col justify-between p-3 rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/40 via-white to-slate-50/50 hover:border-orange-300 hover:shadow-xs transition"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{course.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{course.instructor}</p>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1 font-mono">
                        <span className="font-semibold text-slate-600">Course Progress</span>
                        <span className="font-bold text-orange-600">{course.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FEATURED & TRENDING COURSES MODULE ───────────────────────── */}
          <div id="trending-courses-section" className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-4">
            
            {/* Header: Title & Quick Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Sparkles size={13} />
                  </div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    Featured & Trending Courses
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
                    className="w-36 sm:w-48 pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition"
                  />
                  {searchKeyword && (
                    <button
                      type="button"
                      onClick={() => setSearchKeyword("")}
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50/80 hover:bg-orange-100 text-orange-700 text-xs font-bold transition shadow-2xs"
                >
                  <Compass size={13} className="text-orange-600" />
                  <span>Browse All</span>
                  <ArrowRight size={11} />
                </button>
                <button
                  type="button"
                  onClick={fetchTrending}
                  disabled={loadingCourses}
                  title="Refresh Trending Courses"
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-200 text-slate-600 hover:text-orange-600 transition shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loadingCourses ? "animate-spin text-orange-600" : ""} />
                </button>
              </div>
            </div>

            {/* Filter Toolbar: Category Pills & Level / Page Size Selectors */}
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
                          ? "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25 font-bold scale-[1.02]"
                          : "bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border border-slate-200/80 hover:border-orange-200"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Level & Page Size Filter Dropdowns */}
              <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0">
                {/* Level selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Filter size={12} className="text-orange-500" />
                  <span className="font-semibold text-[11px]">Level:</span>
                  <select
                    value={selectedLevel}
                    onChange={(e) => {
                      setSelectedLevel(e.target.value);
                      setTrendingPage(0);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
                  >
                    {LEVEL_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Page Size selector */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="font-semibold text-[11px]">Size:</span>
                  <select
                    value={trendingSize}
                    onChange={(e) => {
                      setTrendingSize(Number(e.target.value));
                      setTrendingPage(0);
                    }}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-orange-500 font-mono"
                  >
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                    <option value={10}>10</option>
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
            ) : filteredCourses.length === 0 ? (
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
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100 transition shadow-2xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Render Course Cards (Vibrant Colors & Micro-Interactions) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredCourses.map((course, idx) => {
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
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition-all overflow-hidden cursor-pointer"
                    >
                      <div>
                        {/* Course Banner with Image Zoom & Badges */}
                        <div className="h-32 w-full overflow-hidden bg-slate-100 relative">
                          <img
                            src={course.image}
                            alt={course.title}
                            className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=80";
                            }}
                          />
                          
                          {/* Vivid Category Pill */}
                          <span className={`absolute top-2.5 left-2.5 rounded-lg px-2.5 py-0.5 text-[10px] font-bold shadow-md shadow-black/20 ${catColor}`}>
                            {course.category}
                          </span>

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
                          <span className="absolute bottom-2.5 left-2.5 rounded-md bg-slate-900/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-semibold text-white">
                            {course.level}
                          </span>
                        </div>

                        {/* Content Specs */}
                        <div className="p-3.5">
                          <h3
                            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors"
                            title={course.title}
                          >
                            {course.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 truncate mt-1">
                            By {course.instructor}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-2.5 pt-2.5 border-t border-slate-100">
                            <span className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              <Star size={11} className="fill-amber-400 text-amber-400" /> {course.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={11} className="text-slate-400" /> {course.students}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} className="text-slate-400" /> {course.duration}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Interactive CTA */}
                      <div className="p-3.5 pt-0 flex items-center justify-between border-t border-slate-50 mt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900">
                            {course.price > 0 ? `₹${course.price}` : "Free"}
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
                            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-md shadow-orange-500/25 transition active:scale-95"
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
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-40 transition shadow-2xs"
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
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/30 scale-105"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-orange-200"
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
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 disabled:opacity-40 transition shadow-2xs"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── INTERACTIVE COURSE PREVIEW MODAL (DATA FROM GET /api/v1/courses/:courseId) ── */}
      <AnimatePresence>
        {previewCourse && (
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
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-semibold animate-pulse">
                    <Loader2 size={13} className="animate-spin text-orange-600 shrink-0" />
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
                      <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 space-y-2">
                        <h4 className="font-bold text-orange-900 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-orange-600" /> What You'll Learn
                        </h4>
                        <div className="space-y-1.5">
                          {previewCourse.objectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-2 text-slate-700">
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
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
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {previewCourse.instructor.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{previewCourse.instructor}</h4>
                        <p className="text-orange-600 font-medium text-[11px]">{previewCourse.instructorRole || "Lead Instructor"}</p>
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
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition active:scale-95"
                  >
                    <ShoppingCart size={14} /> Enroll Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentDashboard;