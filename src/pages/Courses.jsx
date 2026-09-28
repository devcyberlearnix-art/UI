// src/pages/Courses.jsx - Browse Courses Catalog
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Sparkles,
  Star,
  BookOpen,
  Clock,
  Users,
  CheckCircle2,
  Heart,
  Eye,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Award,
  Zap,
  SlidersHorizontal,
  Compass,
  X,
  GraduationCap,
  PlayCircle,
  FileText,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { courseApi } from "../api/courseApi";
import { useAuth } from "../context/AuthContext";

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

const LEVEL_OPTIONS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const CATEGORY_COLORS = {
  Programming: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  "Web Development": "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  "Data Science": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  "Cloud & DevOps": "bg-blue-500/10 text-blue-700 border-blue-200",
  "Artificial Intelligence": "bg-purple-500/10 text-purple-700 border-purple-200",
  Design: "bg-rose-500/10 text-rose-700 border-rose-200",
  Business: "bg-amber-500/10 text-amber-700 border-amber-200",
};

const DEFAULT_COURSES = [
  {
    id: 253,
    title: "Full-Stack Cloud Architecture & Distributed Systems",
    category: "Cloud & DevOps",
    level: "Intermediate",
    price: 899,
    originalPrice: 1499,
    rating: 4.9,
    students: 1240,
    duration: "14 Weeks",
    instructor: "Alex Rivera",
    instructorRole: "Principal Systems Architect",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    description: "Architect, deploy, and scale resilient microservices on Kubernetes, Terraform, and AWS cloud infrastructure.",
    modulesCount: 12,
    lessonsCount: 48,
  },
  {
    id: 254,
    title: "Modern React 19, Next.js & Production TypeScript",
    category: "Web Development",
    level: "Beginner",
    price: 649,
    originalPrice: 999,
    rating: 4.8,
    students: 2310,
    duration: "10 Weeks",
    instructor: "Sarah Chen",
    instructorRole: "Staff Frontend Engineer",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    description: "Master React Server Components, server actions, state machines, and high-performance Web apps.",
    modulesCount: 10,
    lessonsCount: 42,
  },
  {
    id: 255,
    title: "Deep Learning, LLM Fine-Tuning & Generative AI",
    category: "Artificial Intelligence",
    level: "Advanced",
    price: 1199,
    originalPrice: 1999,
    rating: 4.95,
    students: 980,
    duration: "16 Weeks",
    instructor: "Dr. Marcus Vance",
    instructorRole: "AI Research Lead",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    description: "Train transformer models, implement LoRA fine-tuning, build multi-agent RAG pipelines with PyTorch.",
    modulesCount: 14,
    lessonsCount: 56,
  },
  {
    id: 256,
    title: "Applied Data Engineering with Apache Spark & Kafka",
    category: "Data Science",
    level: "Intermediate",
    price: 799,
    originalPrice: 1299,
    rating: 4.75,
    students: 840,
    duration: "12 Weeks",
    instructor: "Elena Rostova",
    instructorRole: "Data Infrastructure Lead",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
    description: "Build robust real-time data streaming pipelines, lakehouse architectures, and distributed analytics engines.",
    modulesCount: 11,
    lessonsCount: 38,
  },
  {
    id: 257,
    title: "Enterprise Cybersecurity & Ethical Penetration Testing",
    category: "Programming",
    level: "Advanced",
    price: 949,
    originalPrice: 1599,
    rating: 4.88,
    students: 1120,
    duration: "14 Weeks",
    instructor: "David Miller",
    instructorRole: "Senior Security Specialist",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    description: "Learn offensive security, network forensics, OWASP top vulnerabilities, and real-world penetration test labs.",
    modulesCount: 13,
    lessonsCount: 45,
  },
  {
    id: 258,
    title: "UI/UX Design Systems & High-Fidelity Prototyping",
    category: "Design",
    level: "Beginner",
    price: 499,
    originalPrice: 799,
    rating: 4.82,
    students: 1560,
    duration: "8 Weeks",
    instructor: "Jessica Taylor",
    instructorRole: "Head of Product Design",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
    description: "Craft enterprise design tokens, responsive component libraries, and interactive Figma prototypes.",
    modulesCount: 8,
    lessonsCount: 32,
  },
];

const normalizeCourseItem = (c, index) => {
  return {
    id: c.id || c.courseId || c._id || (253 + index),
    title: c.title || c.courseName || c.name || "Technical Specialization",
    category: c.category || c.categoryName || "Programming",
    level: c.level || c.difficultyLevel || "Beginner",
    price: c.price != null ? Number(c.price) : (c.amount != null ? Number(c.amount) : 599),
    originalPrice: c.originalPrice != null ? Number(c.originalPrice) : 999,
    rating: Number(c.rating || c.avgRating || 4.8),
    students: Number(c.students || c.enrollmentCount || c.enrolledStudents || 120),
    duration: c.duration || c.estimatedDuration || "10 Weeks",
    instructor:
      c.instructor?.name ||
      c.instructorName ||
      (typeof c.instructor === "string" ? c.instructor : "LearnMaster Faculty"),
    instructorRole: c.instructorRole || c.instructor?.role || "Senior Specialist",
    image:
      c.image ||
      c.thumbnail ||
      c.coverImage ||
      c.banner ||
      `https://images.unsplash.com/photo-${1516321318423 + index * 1000}?w=800&auto=format&fit=crop&q=80`,
    description:
      c.description ||
      c.summary ||
      "Master modern industry methodologies through structured modules, real-world case studies, and hands-on laboratory exercises.",
    modulesCount: c.modulesCount || (Array.isArray(c.modules) ? c.modules.length : 8),
    lessonsCount: c.lessonsCount || 36,
  };
};

const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [sortBy, setSortBy] = useState("popular");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Slide-out Drawer Quick View State
  const [drawerCourse, setDrawerCourse] = useState(null);

  // Wishlist State (persisted in localStorage)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("student_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (course, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    const courseId = String(course.id);
    const exists = wishlist.some((id) => String(id) === courseId);
    let updated;
    if (exists) {
      updated = wishlist.filter((id) => String(id) !== courseId);
      toast.success("Removed from your saved courses");
    } else {
      updated = [...wishlist, courseId];
      toast.success(`Saved "${course.title.slice(0, 24)}..." to wishlist`);
    }
    setWishlist(updated);
    try {
      localStorage.setItem("student_wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.warn("Could not save wishlist", err);
    }
  };

  // Fetch courses from GET /api/v1/courses
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Calls GET /api/v1/courses with credentials and fallback to http://localhost:8080/api/v1/courses
      const data = await courseApi.getAllCourses();

      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.courses)) {
        list = data.courses;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      } else if (data?.data && typeof data.data === "object") {
        list = Object.values(data.data).filter((item) => typeof item === "object");
      }

      if (list.length > 0) {
        setCourses(list.map((c, idx) => normalizeCourseItem(c, idx)));
      } else {
        // Fallback to high quality standard courses
        setCourses(DEFAULT_COURSES);
      }
    } catch (err) {
      console.warn("[BrowseCourses] GET /api/v1/courses failed, falling back to curated curriculum", err);
      setError("Connected with offline course cache.");
      setCourses(DEFAULT_COURSES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter & Sort Logic
  const filteredAndSortedCourses = useMemo(() => {
    return courses
      .filter((course) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = course.title.toLowerCase().includes(q);
          const matchDesc = course.description.toLowerCase().includes(q);
          const matchInstructor = course.instructor.toLowerCase().includes(q);
          const matchCategory = course.category.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchInstructor && !matchCategory) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== "All" && course.category !== selectedCategory) {
          return false;
        }

        // Level filter
        if (selectedLevel !== "All Levels" && course.level !== selectedLevel) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "popular") return b.students - a.students;
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return 0;
      });
  }, [courses, searchQuery, selectedCategory, selectedLevel, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedCourses.length / itemsPerPage) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCourses.slice(start, start + itemsPerPage);
  }, [filteredAndSortedCourses, currentPage]);

  const handleCardClick = (courseId) => {
    // Navigate to course detail page
    if (user?.role === "student" || location.pathname.startsWith("/student")) {
      navigate(`/student/courses/${courseId}`);
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full space-y-5 font-sans pb-12"
    >
      {/* ── TOP HERO BANNER: CINEMATIC COLOR FILL & CATALOG ROADMAP ──────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-orange-500/25 to-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/3 h-52 w-52 rounded-full bg-gradient-to-tr from-indigo-500/30 to-violet-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-orange-300">
              <Compass size={13} className="text-orange-400" />
              <span>Verified Technical Curriculum • 2026 Edition</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Explore Industry-Leading Courses
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              Gain verified credentials in cloud architecture, software engineering, deep learning,
              and cybersecurity through project-based mastery.
            </p>

            {/* Quick Metrics Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <BookOpen size={13} className="text-orange-400" />
                <strong className="text-white">{filteredAndSortedCourses.length}</strong> Available Courses
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <Award size={13} className="text-emerald-400" />
                Verified Certificates
              </span>
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <ShieldCheck size={13} className="text-sky-400" />
                30-Day Guarantee
              </span>
            </div>
          </div>

          {/* Quick Refresh & Role Shortcut */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={fetchCourses}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-orange-400" : ""} />
              <span>Refresh Catalog</span>
            </button>

            {user?.role === "student" && (
              <button
                onClick={() => navigate("/student/dashboard")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition active:scale-95"
              >
                <span>My Dashboard</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH, CATEGORY PILLS, FILTERS & VIEW MODE ───────── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
        
        {/* Top Controls: Search, Sort & View Mode */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search courses by title, topic, or instructor..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right Controls: Level, Sort By & View Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Level Selector */}
            <div className="relative">
              <select
                value={selectedLevel}
                onChange={(e) => {
                  setSelectedLevel(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-orange-500 transition cursor-pointer"
              >
                {LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
              <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-orange-500 transition cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* View Mode Grid/List Toggle */}
            <div className="flex items-center p-1 rounded-xl border border-slate-200 bg-slate-50/70">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                title="List View"
                className={`p-1.5 rounded-lg transition ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 hide-scrollbar">
          {CATEGORY_OPTIONS.map((cat) => {
            const isSel = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isSel
                    ? "bg-slate-900 text-white shadow-xs font-bold"
                    : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── COURSE LISTING GRID / LIST ─────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 animate-pulse shadow-xs"
            >
              <div className="h-44 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-8 bg-slate-100 rounded mt-4" />
            </div>
          ))}
        </div>
      ) : paginatedCourses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
            <BookOpen size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900">No courses match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search query, difficulty level, or selecting another category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedLevel("All Levels");
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ── */
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
        >
          {paginatedCourses.map((course, idx) => {
            const isWish = wishlist.some((id) => String(id) === String(course.id));
            const catClass =
              CATEGORY_COLORS[course.category] || "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03 }}
                whileHover={{ y: -5 }}
                onClick={() => handleCardClick(course.id)}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-200 overflow-hidden cursor-pointer"
              >
                <div>
                  {/* Card Thumbnail & Overlays */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    {/* Category & Level Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md ${catClass}`}>
                        {course.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                        {course.level}
                      </span>
                    </div>

                    {/* Interactive Wishlist & Quick Preview Buttons */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDrawerCourse(course);
                        }}
                        title="Quick View"
                        className="p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleWishlist(course, e)}
                        title={isWish ? "Remove from Saved" : "Save Course"}
                        className={`p-1.5 rounded-lg backdrop-blur-md transition ${
                          isWish
                            ? "bg-rose-500 text-white"
                            : "bg-black/50 hover:bg-rose-500/80 text-white"
                        }`}
                      >
                        <Heart size={13} fill={isWish ? "currentColor" : "none"} />
                      </button>
                    </div>

                    {/* Duration & Lessons Pill */}
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-mono">
                      <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                        <Clock size={11} className="text-orange-400" /> {course.duration}
                      </span>
                      <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                        <BookOpen size={11} className="text-amber-400" /> {course.lessonsCount} Lessons
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Instructor Info */}
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[9px]">
                          {course.instructor.charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-700 truncate">{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 font-mono font-bold text-[11px]">
                        <Star size={12} fill="currentColor" /> {course.rating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer: Price & CTA */}
                <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      ₹{course.price}
                    </span>
                    {course.originalPrice > course.price && (
                      <span className="text-xs text-slate-400 line-through ml-1.5 font-mono">
                        ₹{course.originalPrice}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 group-hover:text-white text-xs font-bold transition-all shadow-2xs">
                    <span>View Course</span>
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        /* ── LIST VIEW ── */
        <motion.div layout className="space-y-3">
          {paginatedCourses.map((course, idx) => {
            const isWish = wishlist.some((id) => String(id) === String(course.id));
            const catClass =
              CATEGORY_COLORS[course.category] || "bg-slate-100 text-slate-700 border-slate-200";

            return (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.02 }}
                onClick={() => handleCardClick(course.id)}
                className="group flex flex-col sm:flex-row items-stretch sm:items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/10 transition-all cursor-pointer gap-4"
              >
                {/* Thumbnail */}
                <div className="relative h-32 sm:h-28 sm:w-44 shrink-0 rounded-xl overflow-hidden bg-slate-100">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md ${catClass}`}>
                    {course.category}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="font-bold text-slate-700">{course.level}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {course.duration}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Star size={11} fill="currentColor" /> {course.rating.toFixed(1)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition truncate">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {course.description}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Instructor: <strong className="text-slate-700 font-semibold">{course.instructor}</strong>
                  </p>
                </div>

                {/* Price & CTA */}
                <div className="sm:border-l sm:border-slate-100 sm:pl-4 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-base font-extrabold text-slate-900 font-mono">₹{course.price}</div>
                    {course.originalPrice > course.price && (
                      <div className="text-[11px] text-slate-400 line-through font-mono">₹{course.originalPrice}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => toggleWishlist(course, e)}
                      className={`p-2 rounded-xl border border-slate-200 transition ${
                        isWish ? "bg-rose-50 text-rose-600 border-rose-200" : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Heart size={14} fill={isWish ? "currentColor" : "none"} />
                    </button>
                    <span className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-bold group-hover:bg-orange-700 transition">
                      Enroll
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── PAGINATION CONTROLS ───────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 px-2 text-xs text-slate-600">
          <p className="font-mono">
            Showing <strong className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
            <strong className="text-slate-900">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedCourses.length)}
            </strong>{" "}
            of <strong className="text-slate-900">{filteredAndSortedCourses.length}</strong> courses
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`h-8 w-8 rounded-xl text-xs font-mono font-bold transition ${
                  currentPage === pg
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {pg}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── QUICK PREVIEW SLIDE-OUT DRAWER ────────────────────────────── */}
      <AnimatePresence>
        {drawerCourse && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerCourse(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 35 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
              >
                <div className="overflow-y-auto p-6 space-y-4">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 font-mono">
                      {drawerCourse.category}
                    </span>
                    <button
                      onClick={() => setDrawerCourse(null)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900">
                    <img
                      src={drawerCourse.image}
                      alt={drawerCourse.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white font-mono text-xs">
                      {drawerCourse.level} • {drawerCourse.duration}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{drawerCourse.title}</h2>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {drawerCourse.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                      Included in this course
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>{drawerCourse.modulesCount} Comprehensive technical modules</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Verified certificate on completion</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Direct faculty mentorship & live Q&A</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Full lifetime access on desktop & mobile</span>
                      </li>
                    </ul>
                  </div>

                  {/* Faculty */}
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                      {drawerCourse.instructor.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{drawerCourse.instructor}</h5>
                      <p className="text-[11px] text-slate-500">{drawerCourse.instructorRole}</p>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer CTA */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-slate-900 font-mono">₹{drawerCourse.price}</span>
                    <span className="text-xs text-slate-400 line-through ml-1.5 font-mono">₹{drawerCourse.originalPrice}</span>
                  </div>
                  <button
                    onClick={() => {
                      setDrawerCourse(null);
                      handleCardClick(drawerCourse.id);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition flex items-center gap-2"
                  >
                    <span>View Full Syllabus</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Courses;
