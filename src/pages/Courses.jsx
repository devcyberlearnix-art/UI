// src/pages/Courses.jsx - Browse Courses Catalog
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};
import {
  Search,
  Filter,
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
import Portal from "../components/ui/Portal";
import Navbar from "../layouts/Navbar";
import AdvancedTypeaheadSearch from "../components/search/AdvancedTypeaheadSearch";

const CATEGORY_OPTIONS = [
  "All",
  "Programming",
  "Web Development",
  "Backend Development",
  "Frontend Development",
  "Mobile Development",
  "Cyber Security",
  "Cloud Computing",
  "DevOps",
  "Data Science",
  "Artificial Intelligence",
  "Machine Learning",
  "Database",
  "Software Engineering",
  "Networking",
  "Computer Science",
  "Testing",
  "System Design",
  "Blockchain",
  "UI/UX",
  "Business/Technology",
  "Architecture",
  "Cloud",
];

const LEVEL_OPTIONS = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

const CATEGORY_COLORS = {
  Programming: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  "Web Development": "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  "Backend Development": "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "Frontend Development": "bg-teal-500/15 text-teal-300 border-teal-500/30",
  "Mobile Development": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Cyber Security": "bg-red-500/15 text-red-300 border-red-500/30",
  "Cloud Computing": "bg-sky-500/15 text-sky-300 border-sky-500/30",
  DevOps: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  "Data Science": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Artificial Intelligence": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  "Machine Learning": "bg-violet-500/15 text-violet-300 border-violet-500/30",
  Database: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Software Engineering": "bg-blue-600/15 text-blue-300 border-blue-600/30",
  Networking: "bg-green-500/15 text-green-300 border-green-500/30",
  "Computer Science": "bg-indigo-600/15 text-indigo-300 border-indigo-600/30",
  Testing: "bg-pink-500/15 text-pink-300 border-pink-500/30",
  "System Design": "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
  Blockchain: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  "UI/UX": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  "Business/Technology": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Architecture: "bg-purple-600/15 text-purple-300 border-purple-600/30",
  Cloud: "bg-sky-600/15 text-sky-300 border-sky-600/30",
};

const DEFAULT_COURSES = [];

const normalizeCourseItem = (c, index) => {
  const rawTitle = c.title || c.courseName || c.name || "Untitled Course";
  const title = rawTitle.replace(/^\[CYBERLEARNIX-SEED-[0-9]+\]\s*/i, '').replace(/#\d+/g, '').trim();
  const rawImg = c.image || c.thumbnail || c.coverImage || c.banner || "";
  const image = (rawImg && !rawImg.includes('placehold.co')) ? rawImg : "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80";

  return {
    id: c.id || c.courseId || c._id,
    title,
    category: c.category || c.categoryName || "General",
    level: c.level || c.difficultyLevel || "All Levels",
    price: c.price != null ? Number(c.price) : (c.amount != null ? Number(c.amount) : 0),
    originalPrice: c.originalPrice != null ? Number(c.originalPrice) : null,
    rating: Number(c.rating || c.avgRating || 0),
    students: Number(c.students || c.enrollmentCount || c.enrolledStudents || 0),
    duration: c.duration || c.estimatedDuration || "Self-paced",
    instructor:
      c.instructor?.name ||
      c.instructorName ||
      (typeof c.instructor === "string" ? c.instructor : "Instructor"),
    instructorRole: c.instructorRole || c.instructor?.role || "Instructor",
    image,
    description:
      c.description ||
      c.summary ||
      "",
    modulesCount: c.modulesCount || (Array.isArray(c.modules) ? c.modules.length : 0),
    lessonsCount: c.lessonsCount || 0,
  };
};

const Courses = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // User-specific localStorage key
  const getStorageKey = () => {
    const userId = user?.id || user?.userId || user?.email || "guest";
    return `wishlist_${userId}`;
  };

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // Initialize Filter & Search state from URL parameters
  const initialCategory = searchParams.get("category") || "All";
  const initialLevel = searchParams.get("level") || "All Levels";
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState(initialLevel);
  const [sortBy, setSortBy] = useState("popular");

  // Synchronized state mutation helpers
  const updateCategoryFilter = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams, { replace: true });
  };

  const updateLevelFilter = (lvl) => {
    setSelectedLevel(lvl);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (lvl === "All Levels") {
      newParams.delete("level");
    } else {
      newParams.set("level", lvl);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setCurrentPage(1);
    fetchCourses(searchQuery);
  };

  const updateSearchQuery = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (!query.trim()) {
      newParams.delete("search");
    } else {
      newParams.set("search", query.trim());
    }
    setSearchParams(newParams, { replace: true });
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Featured courses state
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [trendingCourses, setTrendingCourses] = useState([]);

  // Slide-out Drawer Quick View State
  const [drawerCourse, setDrawerCourse] = useState(null);

  // Wishlist State (persisted in localStorage - user-specific)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const key = getStorageKey();
      const saved = localStorage.getItem(key);
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
      const key = getStorageKey();
      localStorage.setItem(key, JSON.stringify(updated));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.warn("Could not save wishlist", err);
    }
  };

  // Fetch courses from backend API - connects search, category, level & sort directly
  const fetchCourses = useCallback(async (searchOverride) => {
    setLoading(true);
    setError("");

    const term = typeof searchOverride === 'string' ? searchOverride : searchQuery;

    try {
      let list = [];

      // 1. Primary: Use backend catalog search API with live search parameter
      try {
        const sortMap = {
          popular: 'POPULAR',
          newest: 'NEWEST',
          rating: 'RATING',
          'price-asc': 'PRICE_ASC',
          'price-desc': 'PRICE_DESC',
        };

        const listData = await courseApi.getCourseList({
          search: term.trim() || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          level: selectedLevel !== "All Levels" ? selectedLevel : undefined,
          sort: sortMap[sortBy] || 'POPULAR',
          page: 0,
          size: 50,
        });

        if (Array.isArray(listData?.data?.courses)) {
          list = listData.data.courses;
        } else if (Array.isArray(listData?.data)) {
          list = listData.data;
        } else if (Array.isArray(listData?.courses)) {
          list = listData.courses;
        }

        // Fetch remaining pages so the full catalog (300+ courses) is available in frontend
        const pagination = listData?.data?.pagination;
        const totalPages = pagination?.totalPages || 1;
        if (totalPages > 1) {
          const pagePromises = [];
          for (let p = 1; p < Math.min(totalPages, 20); p++) {
            pagePromises.push(
              courseApi.getCourseList({
                search: term.trim() || undefined,
                category: selectedCategory !== "All" ? selectedCategory : undefined,
                level: selectedLevel !== "All Levels" ? selectedLevel : undefined,
                sort: sortMap[sortBy] || 'POPULAR',
                page: p,
                size: 50,
              }).catch(() => null)
            );
          }
          const additionalPages = await Promise.all(pagePromises);
          for (const pageRes of additionalPages) {
            const pageCourses = pageRes?.data?.courses || pageRes?.data || [];
            if (Array.isArray(pageCourses)) {
              list = list.concat(pageCourses);
            }
          }
        }
      } catch (listErr) {
        console.warn("[Courses] Course list search API failed, trying trending...", listErr);
      }

      // 2. If list empty and no active filters, fallback to trending
      if (list.length === 0 && !term.trim() && selectedCategory === "All" && selectedLevel === "All Levels") {
        try {
          const trendingData = await courseApi.getTrendingCourses({
            page: 0,
            size: 50,
          });

          if (Array.isArray(trendingData?.data?.courses)) {
            list = trendingData.data.courses;
          } else if (Array.isArray(trendingData?.data)) {
            list = trendingData.data;
          }
        } catch (_) { }
      }

      // 3. Fallback to getAllCourses if list still empty and no active search
      if (list.length === 0 && !term.trim()) {
        try {
          const allData = await courseApi.getAllCourses({ page: 0, size: 500 });
          if (Array.isArray(allData?.content)) {
            list = allData.content;
          } else if (Array.isArray(allData?.data)) {
            list = allData.data;
          }
        } catch (_) { }
      }

      if (list.length > 0) {
        setCourses(list.map((c, idx) => normalizeCourseItem(c, idx)));
      } else {
        if (term.trim() || selectedCategory !== "All" || selectedLevel !== "All Levels") {
          setCourses([]);
        } else {
          setCourses([]);
        }
      }
    } catch (err) {
      console.warn("[BrowseCourses] APIs failed", err);
      if (!term.trim()) {
        setCourses([]);
      } else {
        setCourses([]);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  // Fetch featured and trending courses separately
  const fetchFeaturedCourses = useCallback(async () => {
    try {
      const data = await courseApi.getFeaturedCourses(6);
      let list = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      }
      if (list.length > 0) {
        setFeaturedCourses(list.map((c, idx) => normalizeCourseItem(c, idx)));
      }
    } catch (err) {
      console.warn("[Courses] Featured courses fetch failed", err);
    }
  }, []);

  const fetchTrendingCoursesSection = useCallback(async () => {
    try {
      const data = await courseApi.getTrendingCourses({ page: 0, size: 6 });
      let list = [];
      if (Array.isArray(data?.data?.courses)) {
        list = data.data.courses;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data)) {
        list = data;
      }
      if (list.length > 0) {
        setTrendingCourses(list.map((c, idx) => normalizeCourseItem(c, idx)));
      }
    } catch (err) {
      console.warn("[Courses] Trending courses fetch failed", err);
    }
  }, []);

  // Live debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  useEffect(() => {
    fetchFeaturedCourses();
    fetchTrendingCoursesSection();
  }, [fetchCourses, fetchFeaturedCourses, fetchTrendingCoursesSection]);

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
        if (selectedCategory !== "All" && course.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        // Level filter
        if (selectedLevel !== "All Levels" && course.level?.toLowerCase() !== selectedLevel.toLowerCase()) {
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

  const handleCardClick = async (courseId) => {
    // Track course impression
    try {
      await courseApi.trackCourseImpression(courseId, 'CATALOG');
    } catch (err) {
      // Non-critical, don't block navigation
    }

    // Navigate to course detail page
    if (user?.role === "student" || location.pathname.startsWith("/student")) {
      navigate(`/student/courses/${courseId}`);
    } else {
      navigate(`/courses/${courseId}`);
    }
  };

  const isPublicPage = !location.pathname.startsWith("/student");
  const hasActiveFilters = Boolean(searchQuery.trim() || selectedCategory !== "All" || selectedLevel !== "All Levels");

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLevel("All Levels");
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  const RECOMMENDED_DOMAINS = [
    { title: "Cloud & DevOps", desc: "Kubernetes, distributed topologies, and resilient cloud architectures" },
    { title: "Web Development", desc: "React 19, Next.js server actions, and micro-frontend design systems" },
    { title: "Data Science", desc: "Distributed stream analytics, Apache Spark, and real-time processing" },
    { title: "Artificial Intelligence", desc: "LLM agent orchestration, embeddings, and vector infrastructure" },
  ];

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="min-h-screen bg-[#070709] text-[#F5F5F7] selection:bg-[#C5A880]/30 selection:text-white font-sans antialiased">
        {isPublicPage && <Navbar />}

        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 ${isPublicPage ? 'pt-24 sm:pt-28' : 'pt-4'}`}>
          {/* ── TOP HERO BANNER: INK & ONYX CURRICULUM ──────── */}
          <div className="relative overflow-hidden rounded-3xl bg-[#0F0F13] p-6 sm:p-8 text-[#F5F5F7] border border-white/[0.04] shadow-[0_12px_36px_-8px_rgba(0,0,0,0.85)]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141A] border border-white/[0.06] text-xs font-semibold text-[#C5A880]">
                  <Compass size={13} className="text-[#C5A880]" />
                  <span>Verified Technical Curriculum • 2026 Edition</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F5F5F7] leading-tight">
                  Explore Industry-Leading Courses
                </h1>

                <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed max-w-xl">
                  Gain verified credentials in cloud architecture, distributed systems, deep learning,
                  and cybersecurity through production-grade engineering mastery.
                </p>

                {/* Quick Metrics Badges */}
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#E5E5E7] font-mono">
                  <span className="flex items-center gap-1.5 bg-[#14141A] border border-white/[0.04] px-2.5 py-1 rounded-lg">
                    <BookOpen size={13} className="text-[#C5A880]" />
                    <strong className="text-white">{filteredAndSortedCourses.length}</strong> Available Courses
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#14141A] border border-white/[0.04] px-2.5 py-1 rounded-lg">
                    <Award size={13} className="text-emerald-400" />
                    Verified Certificates
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#14141A] border border-white/[0.04] px-2.5 py-1 rounded-lg">
                    <ShieldCheck size={13} className="text-sky-400" />
                    Production SLA
                  </span>
                </div>
              </div>

              {/* Quick Refresh & Role Shortcut */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  type="button"
                  onClick={fetchCourses}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14141A] hover:bg-[#1B1B24] border border-white/[0.06] text-[#F5F5F7] font-bold text-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin text-[#C5A880]" : ""} />
                  <span>Refresh Catalog</span>
                </button>

                {user?.role === "student" && (
                  <button
                    type="button"
                    onClick={() => navigate("/student/dashboard")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4BC98] text-[#070709] font-bold text-xs shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <span>My Dashboard</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── FEATURED COURSES CAROUSEL ─────────────────────────────────── */}
          {!searchQuery.trim() && selectedCategory === "All" && featuredCourses.length > 0 && (
            <div className="rounded-3xl border border-white/[0.04] bg-[#0F0F13] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#14141A] border border-white/[0.06] text-[#C5A880]">
                    <Award size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#F5F5F7]">Featured Curriculum</h2>
                    <p className="text-xs text-[#8E8E93]">Curated by principal architects</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedLevel("All Levels");
                    setSearchQuery("");
                  }}
                  className="text-xs font-semibold text-[#C5A880] hover:text-[#D4BC98] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  View All Tracks <ArrowRight size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredCourses.slice(0, 3).map((course, idx) => {
                  const isWish = wishlist.some((id) => String(id) === String(course.id));
                  const catClass = CATEGORY_COLORS[course.category] || "bg-[#14141A] text-[#E5E5E7] border-white/[0.06]";

                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.08 }}
                      onClick={() => handleCardClick(course.id)}
                      className="group relative rounded-2xl overflow-hidden bg-[#14141A] border border-white/[0.04] hover:border-[#C5A880]/30 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      {/* 16:9 Aspect Frame */}
                      <div className="relative aspect-video w-full overflow-hidden bg-[#070709]">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/90 via-transparent to-black/20" />
                        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md ${catClass}`}>
                          {course.category}
                        </span>
                        <button
                          type="button"
                          aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
                          onClick={(e) => toggleWishlist(course, e)}
                          className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md transition ${isWish ? "bg-rose-500 text-white" : "bg-black/50 hover:bg-rose-500/80 text-white"
                            }`}
                        >
                          <Heart size={12} fill={isWish ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#C5A880] transition line-clamp-1">
                          {course.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
                          <div className="flex items-center gap-1 text-[#C5A880] font-mono font-bold text-[11px]">
                            <Star size={11} fill="currentColor" /> {course.rating.toFixed(1)}
                          </div>
                          <span className="text-xs font-extrabold text-[#F5F5F7] font-mono">₹{course.price}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TRENDING COURSES SECTION ─────────────────────────────────── */}
          {!searchQuery.trim() && selectedCategory === "All" && trendingCourses.length > 0 && (
            <div className="rounded-3xl border border-white/[0.04] bg-[#0F0F13] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#14141A] border border-white/[0.06] text-[#C5A880]">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#F5F5F7]">Trending Velocity Tracks</h2>
                    <p className="text-xs text-[#8E8E93]">High engagement this week</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/courses")}
                  className="text-xs font-semibold text-[#C5A880] hover:text-[#D4BC98] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 hide-scrollbar">
                {trendingCourses.slice(0, 6).map((course, idx) => {
                  const isWish = wishlist.some((id) => String(id) === String(course.id));

                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      onClick={() => handleCardClick(course.id)}
                      className="group flex-shrink-0 w-64 rounded-2xl overflow-hidden bg-[#14141A] border border-white/[0.04] hover:border-[#C5A880]/30 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-[#070709]">
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/90 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#C5A880] text-[#070709] text-[9px] font-bold">
                            #{idx + 1}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold backdrop-blur-md">
                            {course.level}
                          </span>
                        </div>
                        <button
                          type="button"
                          aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
                          onClick={(e) => toggleWishlist(course, e)}
                          className={`absolute top-2 right-2 p-1 rounded-lg backdrop-blur-md transition ${isWish ? "bg-rose-500 text-white" : "bg-black/50 hover:bg-rose-500/80 text-white"
                            }`}
                        >
                          <Heart size={11} fill={isWish ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="p-3 space-y-1.5">
                        <h3 className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#C5A880] transition line-clamp-1">
                          {course.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/[0.04]">
                          <div className="flex items-center gap-1 text-[#C5A880] font-mono font-bold text-[10px]">
                            <Star size={10} fill="currentColor" /> {course.rating.toFixed(1)}
                          </div>
                          <span className="text-xs font-extrabold text-[#F5F5F7] font-mono">₹{course.price}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── TOOLBAR: SEARCH, CATEGORY PILLS, FILTERS & VIEW MODE ───────── */}
          <div className="rounded-3xl border border-white/[0.04] bg-[#0F0F13] p-5 space-y-4 shadow-sm">
            {/* Top Controls: Search, Sort & View Mode */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Physics-Based Muted Gold Search Input & Action Button */}
              <div className="relative flex-1 max-w-xl">
                <AdvancedTypeaheadSearch
                  initialValue={searchQuery}
                  onExecuteSearch={(val) => {
                    updateSearchQuery(val);
                  }}
                  placeholder="Search items by title, subtitle, tag category or author..."
                  className="w-full"
                />
              </div>

              {/* Right Controls: Level, Sort By & View Toggle */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Level Selector */}
                <div className="relative">
                  <select
                    value={selectedLevel}
                    onChange={(e) => updateLevelFilter(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-white/[0.06] bg-[#14141A] text-xs font-semibold text-[#E5E5E7] outline-none hover:border-white/20 focus:border-[#C5A880] transition cursor-pointer"
                  >
                    {LEVEL_OPTIONS.map((lvl) => (
                      <option key={lvl} value={lvl} className="bg-[#14141A] text-[#F5F5F7]">
                        {lvl}
                      </option>
                    ))}
                  </select>
                  <Filter size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
                </div>

                {/* Sort Selector */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-white/[0.06] bg-[#14141A] text-xs font-semibold text-[#E5E5E7] outline-none hover:border-white/20 focus:border-[#C5A880] transition cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#14141A] text-[#F5F5F7]">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <SlidersHorizontal size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717A] pointer-events-none" />
                </div>

                {/* View Mode Grid/List Toggle */}
                <div className="flex items-center p-1 rounded-xl border border-white/[0.06] bg-[#14141A]">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    title="Grid View"
                    className={`p-1.5 rounded-lg transition ${viewMode === "grid"
                      ? "bg-[#C5A880] text-[#070709] font-bold"
                      : "text-[#71717A] hover:text-[#F5F5F7]"
                      }`}
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    title="List View"
                    className={`p-1.5 rounded-lg transition ${viewMode === "list"
                      ? "bg-[#C5A880] text-[#070709] font-bold"
                      : "text-[#71717A] hover:text-[#F5F5F7]"
                      }`}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Pills Bar with Shared Spring Gliding Highlight */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 hide-scrollbar">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSel = selectedCategory === cat;
                return (
                  <motion.button
                    key={cat}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => updateCategoryFilter(cat)}
                    className={`relative isolate whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all select-none border cursor-pointer ${isSel
                      ? "text-[#070709] font-bold border-[#C5A880] bg-[#C5A880] shadow-[0_0_15px_rgba(197,168,128,0.25)]"
                      : "text-[#8E8E93] hover:text-[#F5F5F7] border-white/[0.04] hover:border-white/20 bg-[#14141A]"
                      }`}
                  >
                    <span className="relative z-10">{cat}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Active Filter Reset CTA Bar */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[#8E8E93] text-[11px]">Active Filters:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14141A] border border-white/[0.06] text-[#E5E5E7] text-[11px]">
                      <span>Query: "{searchQuery}"</span>
                      <button type="button" aria-label="Clear search query" onClick={() => setSearchQuery("")} className="hover:text-rose-400">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedCategory !== "All" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14141A] border border-white/[0.06] text-[#E5E5E7] text-[11px]">
                      <span>Category: {selectedCategory}</span>
                      <button type="button" aria-label="Clear category filter" onClick={() => setSelectedCategory("All")} className="hover:text-rose-400">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedLevel !== "All Levels" && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14141A] border border-white/[0.06] text-[#E5E5E7] text-[11px]">
                      <span>Level: {selectedLevel}</span>
                      <button type="button" aria-label="Clear level filter" onClick={() => setSelectedLevel("All Levels")} className="hover:text-rose-400">
                        <X size={12} />
                      </button>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear All Active Selections
                </button>
              </div>
            )}
          </div>

          {/* ── COURSE LISTING GRID / LIST ─────────────────────────────────── */}
          {loading ? (
            /* Synchronized Skeletons with locked 16:9 aspect ratios */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/[0.04] bg-[#0F0F13] p-4 space-y-3 animate-pulse"
                  style={{ animationDuration: "1.5s" }}
                >
                  <div className="aspect-video bg-[#14141A] rounded-xl" />
                  <div className="h-4 bg-[#14141A] rounded w-3/4" />
                  <div className="h-3 bg-[#14141A]/70 rounded w-1/2" />
                  <div className="h-8 bg-[#14141A]/50 rounded mt-4" />
                </div>
              ))}
            </div>
          ) : paginatedCourses.length === 0 ? (
            /* Empty Query Telemetry State with Alternative Domains */
            <div className="rounded-3xl border border-white/[0.04] bg-[#0F0F13] p-8 sm:p-12 text-center space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-[#14141A] border border-white/[0.06] text-[#C5A880] flex items-center justify-center mx-auto">
                <BookOpen size={28} />
              </div>

              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-bold text-[#F5F5F7]">No Matching Engineering Tracks</h3>
                <p className="text-xs text-[#8E8E93] leading-relaxed">
                  No courses matched your current filter criteria. Explore one of our core architecture specializations below or reset selections.
                </p>
              </div>

              {/* Recommended Domains Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto pt-2 text-left">
                {RECOMMENDED_DOMAINS.map((domain) => (
                  <button
                    key={domain.title}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(domain.title);
                      setSearchQuery("");
                      setSelectedLevel("All Levels");
                      setCurrentPage(1);
                    }}
                    className="p-3.5 rounded-2xl bg-[#14141A] border border-white/[0.04] hover:border-[#C5A880]/40 transition-all group text-left cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#F5F5F7] group-hover:text-[#C5A880] block transition-colors">
                      {domain.title}
                    </span>
                    <span className="text-[11px] text-[#71717A] mt-1 block leading-normal line-clamp-2">
                      {domain.desc}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#C5A880] text-[#070709] text-xs font-bold hover:bg-[#D4BC98] transition cursor-pointer"
                >
                  Clear All Filters & Show Full Catalog
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            /* ── GRID VIEW ── */
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {paginatedCourses.map((course, idx) => {
                const isWish = wishlist.some((id) => String(id) === String(course.id));
                const catClass =
                  CATEGORY_COLORS[course.category] || "bg-[#14141A] text-[#E5E5E7] border-white/[0.06]";

                return (
                  <motion.div
                    key={course.id}
                    data-course-id={course.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleCardClick(course.id)}
                    className="course-card group flex flex-col justify-between rounded-2xl border border-white/[0.04] bg-[#0F0F13] hover:border-[#C5A880]/40 hover:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.85)] transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    <div>
                      {/* Card 16:9 Aspect Ratio Frame */}
                      <div className="relative aspect-video w-full overflow-hidden bg-[#070709]">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-[#070709]/95 via-transparent to-black/20" />

                        {/* Category & Level Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md ${catClass}`}>
                            {course.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#0F0F13]/90 text-[#F5F5F7] border border-white/[0.06] backdrop-blur-md">
                            {course.level}
                          </span>
                        </div>

                        {/* Interactive Wishlist & Quick Preview Buttons */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          <button
                            type="button"
                            aria-label="Quick View"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerCourse(course);
                            }}
                            title="Quick View"
                            className="p-1.5 rounded-lg bg-[#0F0F13]/80 hover:bg-[#14141A] text-[#E5E5E7] border border-white/[0.06] backdrop-blur-md transition"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            aria-label={isWish ? "Remove from Saved" : "Save Course"}
                            onClick={(e) => toggleWishlist(course, e)}
                            title={isWish ? "Remove from Saved" : "Save Course"}
                            className={`p-1.5 rounded-lg backdrop-blur-md transition ${isWish
                              ? "bg-rose-500 text-white"
                              : "bg-[#0F0F13]/80 hover:bg-rose-500/80 text-white border border-white/[0.06]"
                              }`}
                          >
                            <Heart size={13} fill={isWish ? "currentColor" : "none"} />
                          </button>
                        </div>

                        {/* Duration & Lessons Pill */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-[#E5E5E7] font-mono">
                          <span className="flex items-center gap-1 bg-[#0F0F13]/90 border border-white/[0.06] px-2 py-0.5 rounded-md backdrop-blur-md">
                            <Clock size={11} className="text-[#C5A880]" /> {course.duration}
                          </span>
                          <span className="flex items-center gap-1 bg-[#0F0F13]/90 border border-white/[0.06] px-2 py-0.5 rounded-md backdrop-blur-md">
                            <BookOpen size={11} className="text-[#C5A880]" /> {course.lessonsCount} Lessons
                          </span>
                        </div>
                      </div>

                      {/* Body Content */}
                      <div className="p-4 space-y-2">
                        <h3 className="text-sm font-bold text-[#F5F5F7] group-hover:text-[#C5A880] transition-colors line-clamp-2 leading-snug">
                          {course.title}
                        </h3>

                        <p className="text-xs text-[#8E8E93] line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>

                        {/* Instructor Info */}
                        <div className="pt-2 flex items-center justify-between text-xs text-[#8E8E93] border-t border-white/[0.04]">
                          <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-full bg-[#14141A] border border-white/[0.06] text-[#E5E5E7] flex items-center justify-center font-bold text-[9px]">
                              {course.instructor.charAt(0)}
                            </div>
                            <span className="font-semibold text-[#E5E5E7] truncate">{course.instructor}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[#C5A880] font-mono font-bold text-[11px]">
                            <Star size={12} fill="currentColor" /> {course.rating.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Price & CTA */}
                    <div className="p-4 pt-2 border-t border-white/[0.04] flex items-center justify-between">
                      <div>
                        <span className="text-base font-extrabold text-[#F5F5F7] font-mono">
                          ₹{course.price}
                        </span>
                        {course.originalPrice > course.price && (
                          <span className="text-xs text-[#71717A] line-through ml-1.5 font-mono">
                            ₹{course.originalPrice}
                          </span>
                        )}
                      </div>

                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-[#C5A880] group-hover:bg-[#C5A880] group-hover:text-[#070709] text-xs font-bold transition-all">
                        <span>View Track</span>
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
                  CATEGORY_COLORS[course.category] || "bg-[#14141A] text-[#E5E5E7] border-white/[0.06]";

                return (
                  <motion.div
                    key={course.id}
                    data-course-id={course.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: idx * 0.02 }}
                    onClick={() => handleCardClick(course.id)}
                    className="course-card group flex flex-col sm:flex-row items-stretch sm:items-center justify-between rounded-2xl border border-white/[0.04] bg-[#0F0F13] p-3.5 sm:p-4 hover:border-[#C5A880]/40 transition-all cursor-pointer gap-4"
                  >
                    {/* 16:9 Aspect Ratio Thumbnail */}
                    <div className="relative aspect-video sm:h-28 sm:w-44 shrink-0 rounded-xl overflow-hidden bg-[#070709]">
                      <img
                        src={course.image}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold border backdrop-blur-md ${catClass}`}>
                        {course.category}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-[#8E8E93] font-mono">
                        <span className="font-bold text-[#E5E5E7]">{course.level}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-[#C5A880]" /> {course.duration}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#C5A880] font-bold">
                          <Star size={11} fill="currentColor" /> {course.rating.toFixed(1)}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#F5F5F7] group-hover:text-[#C5A880] transition truncate">
                        {course.title}
                      </h3>

                      <p className="text-xs text-[#8E8E93] line-clamp-1">
                        {course.description}
                      </p>

                      <p className="text-[11px] text-[#71717A]">
                        Instructor: <strong className="text-[#E5E5E7] font-semibold">{course.instructor}</strong>
                      </p>
                    </div>

                    {/* Price & CTA */}
                    <div className="sm:border-l sm:border-white/[0.04] sm:pl-4 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-extrabold text-[#F5F5F7] font-mono">₹{course.price}</div>
                        {course.originalPrice > course.price && (
                          <div className="text-[11px] text-[#71717A] line-through font-mono">₹{course.originalPrice}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label={isWish ? "Remove from wishlist" : "Add to wishlist"}
                          onClick={(e) => toggleWishlist(course, e)}
                          className={`p-2 rounded-xl border border-white/[0.06] transition ${isWish ? "bg-rose-500 text-white border-rose-500" : "hover:bg-[#14141A] text-[#8E8E93]"
                            }`}
                        >
                          <Heart size={14} fill={isWish ? "currentColor" : "none"} />
                        </button>
                        <span className="px-3 py-1.5 rounded-xl bg-[#C5A880] text-[#070709] text-xs font-bold hover:bg-[#D4BC98] transition">
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
            <div className="flex items-center justify-between pt-2 px-2 text-xs text-[#8E8E93]">
              <p className="font-mono">
                Showing <strong className="text-[#F5F5F7]">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className="text-[#F5F5F7]">
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedCourses.length)}
                </strong>{" "}
                of <strong className="text-[#F5F5F7]">{filteredAndSortedCourses.length}</strong> courses
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous page"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-white/[0.06] bg-[#0F0F13] text-[#8E8E93] hover:text-white disabled:opacity-30 transition cursor-pointer"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    aria-label={`Go to page ${pg}`}
                    onClick={() => setCurrentPage(pg)}
                    className={`h-8 w-8 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${currentPage === pg
                      ? "bg-[#C5A880] text-[#070709]"
                      : "border border-white/[0.06] bg-[#0F0F13] text-[#8E8E93] hover:text-white"
                      }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  aria-label="Next page"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-white/[0.06] bg-[#0F0F13] text-[#8E8E93] hover:text-white disabled:opacity-30 transition cursor-pointer"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* ── QUICK PREVIEW SLIDE-OUT DRAWER ────────────────────────────── */}
          <AnimatePresence>
            {drawerCourse && (
              <Portal>
                <div className="fixed inset-0 z-50 overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setDrawerCourse(null)}
                    className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
                  />

                  <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", stiffness: 350, damping: 35 }}
                      className="w-screen max-w-md bg-[#0F0F13] border-l border-white/[0.08] shadow-2xl flex flex-col justify-between text-[#F5F5F7]"
                    >
                      <div className="overflow-y-auto p-6 space-y-4">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#14141A] text-[#C5A880] border border-white/[0.06] font-mono">
                            {drawerCourse.category}
                          </span>
                          <button
                            type="button"
                            aria-label="Close details drawer"
                            onClick={() => setDrawerCourse(null)}
                            className="p-1.5 rounded-lg hover:bg-white/[0.04] text-[#8E8E93] hover:text-white transition"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Thumbnail */}
                        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/[0.04]">
                          <img
                            src={drawerCourse.image}
                            alt={drawerCourse.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 text-[#E5E5E7] font-mono text-xs">
                            {drawerCourse.level} • {drawerCourse.duration}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-lg font-bold text-[#F5F5F7]">{drawerCourse.title}</h2>
                          <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                            {drawerCourse.description}
                          </p>
                        </div>

                        {/* Highlights */}
                        <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                          <h4 className="text-xs font-bold text-[#E5E5E7] uppercase font-mono tracking-wider">
                            Curriculum Inclusions
                          </h4>
                          <ul className="space-y-1.5 text-xs text-[#A1A1AA]">
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#C5A880]" />
                              <span>{drawerCourse.modulesCount} Comprehensive technical modules</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#C5A880]" />
                              <span>Verified certificate on completion</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#C5A880]" />
                              <span>Direct faculty mentorship & live Q&A</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle2 size={13} className="text-[#C5A880]" />
                              <span>Full lifetime access on desktop & mobile</span>
                            </li>
                          </ul>
                        </div>

                        {/* Faculty */}
                        <div className="p-3 rounded-xl border border-white/[0.04] bg-[#14141A] flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#070709] border border-white/[0.06] text-[#C5A880] flex items-center justify-center font-bold text-xs">
                            {drawerCourse.instructor.charAt(0)}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-[#F5F5F7]">{drawerCourse.instructor}</h5>
                            <p className="text-[11px] text-[#8E8E93]">{drawerCourse.instructorRole}</p>
                          </div>
                        </div>
                      </div>

                      {/* Drawer Footer CTA */}
                      <div className="p-4 border-t border-white/[0.04] bg-[#070709] flex items-center justify-between">
                        <div>
                          <span className="text-lg font-extrabold text-[#F5F5F7] font-mono">₹{drawerCourse.price}</span>
                          <span className="text-xs text-[#71717A] line-through ml-1.5 font-mono">₹{drawerCourse.originalPrice}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setDrawerCourse(null);
                            handleCardClick(drawerCourse.id);
                          }}
                          className="px-5 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4BC98] text-[#070709] font-bold text-xs transition flex items-center gap-2 cursor-pointer"
                        >
                          <span>View Full Syllabus</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Portal>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Courses;
