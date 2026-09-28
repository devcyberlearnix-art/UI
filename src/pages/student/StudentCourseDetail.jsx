import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  Star,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  PlayCircle,
  FileText,
  CheckCircle2,
  RefreshCw,
  Heart,
  ShoppingCart,
  Award,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Share2,
  Check,
  Lock,
  Download,
  Smartphone,
  Globe,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { courseApi } from "../../api/courseApi";

const CATEGORY_COLORS = {
  Programming: "bg-indigo-600 text-white",
  "Web Development": "bg-cyan-600 text-white",
  "Data Science": "bg-emerald-600 text-white",
  "Cloud & DevOps": "bg-blue-600 text-white",
  "Artificial Intelligence": "bg-purple-600 text-white",
  Design: "bg-rose-600 text-white",
  Business: "bg-amber-600 text-white",
};

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("curriculum");
  const [expandedModules, setExpandedModules] = useState({ 0: true, 1: true });

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("student_wishlist") || "[]");
      setIsWishlisted(saved.some((id) => String(id) === String(courseId)));
    } catch {
      setIsWishlisted(false);
    }
  }, [courseId]);

  const toggleWishlist = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("student_wishlist") || "[]");
      let updated;
      if (isWishlisted) {
        updated = saved.filter((id) => String(id) !== String(courseId));
        setIsWishlisted(false);
        toast.success("Removed from your saved courses", { icon: "🤍" });
      } else {
        updated = [...saved, String(courseId)];
        setIsWishlisted(true);
        toast.success(`Saved to your wishlist`, { icon: "❤️" });
      }
      localStorage.setItem("student_wishlist", JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not save wishlist", err);
    }
  };

  const fetchCourse = async () => {
    if (!courseId) return;
    setLoading(true);
    setError("");

    try {
      // Calls GET /api/v1/courses/{courseId} with cookies and credentials
      const res = await courseApi.getCourseById(courseId);
      const data = res?.data || res;

      if (!data) throw new Error("No course details returned from server");

      const normalized = {
        id: data.id || data.courseId || courseId,
        title: data.title || data.courseName || data.name || "Modern Engineering Specialization",
        category: data.category || data.categoryName || "Programming",
        level: data.level || data.difficultyLevel || "Beginner",
        price: data.price != null ? Number(data.price) : (data.amount != null ? Number(data.amount) : 499),
        originalPrice: data.originalPrice || (data.price ? Math.round(Number(data.price) * 1.6) : 899),
        rating: Number(data.rating || data.avgRating || 4.8),
        ratingCount: Number(data.ratingCount || data.reviewsCount || 342),
        students: Number(data.students || data.enrolledCount || data.enrolledStudents || 184),
        duration: data.duration || data.estimatedDuration || "14 hours on-demand video",
        language: data.language || "English",
        lastUpdated: data.lastUpdated || data.updatedAt ? new Date(data.lastUpdated || data.updatedAt).toLocaleDateString() : "September 2026",
        instructor:
          data.instructor?.name ||
          data.instructorName ||
          (typeof data.instructor === "string" ? data.instructor : "LearnMaster Faculty"),
        instructorRole: data.instructor?.role || data.instructor?.title || "Senior Software Architect & Mentor",
        instructorBio:
          data.instructor?.bio ||
          "Passionate educator and industry practitioner with over a decade of real-world software engineering experience. Dedicated to empowering developers with hands-on, production-grade skills.",
        image:
          data.image ||
          data.thumbnail ||
          data.coverImage ||
          data.banner ||
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80",
        description:
          data.description ||
          data.summary ||
          "Master in-demand industry paradigms through comprehensive modules, real-world capstone exercises, and production-tested patterns. Structured from ground-level foundations up to advanced scalable architecture.",
        objectives: data.objectives || data.learningOutcomes || data.whatYouWillLearn || [
          "Build production-grade applications using clean architecture and modern patterns",
          "Master core data structures, algorithms, and modular design principles",
          "Implement robust error handling, testing suites, and performance optimizations",
          "Deploy scalable applications to modern cloud infrastructure with zero downtime",
          "Earn a verified industry credential endorsed by LearnMaster",
        ],
        requirements: data.requirements || data.prerequisites || [
          "A modern laptop or PC with internet connectivity",
          "Basic familiarity with programming concepts and terminal usage",
          "No advanced prior knowledge required; all core concepts are taught from scratch",
        ],
        modules: data.modules || data.chapters || (data.lessons ? [{ id: 1, title: "Course Syllabus", lessons: data.lessons }] : [
          {
            id: 1,
            title: "Module 1: Foundations, Tooling & Environment Setup",
            duration: "2h 35m",
            lessons: [
              { id: "l1", title: "Course Introduction & Learning Roadmap", duration: "10:15", isFree: true },
              { id: "l2", title: "Configuring the Developer Workspace & CLI", duration: "18:40", isFree: true },
              { id: "l3", title: "Core Architecture & Data Flow Overview", duration: "32:10", isFree: false },
              { id: "l4", title: "Hands-on Exercise: Project Initialization", duration: "25:00", isFree: false },
            ],
          },
          {
            id: 2,
            title: "Module 2: Core Engineering Patterns & Component Design",
            duration: "4h 20m",
            lessons: [
              { id: "l5", title: "Clean Code Principles & Interface Contracts", duration: "35:10", isFree: false },
              { id: "l6", title: "Building Reusable & Modular Components", duration: "48:30", isFree: false },
              { id: "l7", title: "State Management & Efficient Data Mutations", duration: "42:15", isFree: false },
              { id: "l8", title: "Performance Profiling & Optimization", duration: "38:40", isFree: false },
            ],
          },
          {
            id: 3,
            title: "Module 3: Security, API Integrations & Resiliency",
            duration: "3h 45m",
            lessons: [
              { id: "l9", title: "Secure Authentication, JWT & Session Management", duration: "44:10", isFree: false },
              { id: "l10", title: "Robust Error Handling & Boundary Strategies", duration: "32:50", isFree: false },
              { id: "l11", title: "Connecting REST & Real-time Endpoints", duration: "40:20", isFree: false },
            ],
          },
          {
            id: 4,
            title: "Module 4: Testing, Deployment & Capstone Project",
            duration: "3h 30m",
            lessons: [
              { id: "l12", title: "Automated Unit & Integration Testing", duration: "36:15", isFree: false },
              { id: "l13", title: "Continuous Delivery & Cloud Deployment", duration: "42:00", isFree: false },
              { id: "l14", title: "Capstone Submission & Certificate Assessment", duration: "25:30", isFree: false },
            ],
          },
        ]),
      };

      setCourse(normalized);
    } catch (err) {
      console.error("[StudentCourseDetail] API error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load course details from API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const toggleModule = (index) => {
    setExpandedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Course URL copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 font-sans">
        <Loader2 size={38} className="animate-spin text-orange-500" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">
          Loading Course Curriculum from API...
        </p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto py-12 font-sans space-y-4">
        <button
          onClick={() => navigate("/student/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 transition"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle size={28} className="text-red-500 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-red-900">Unable to load course #{courseId}</h3>
              <p className="text-xs text-red-700 mt-0.5">{error || "Course not found or unavailable."}</p>
            </div>
          </div>
          <button
            onClick={fetchCourse}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold transition self-start sm:self-auto"
          >
            <RefreshCw size={13} /> Retry API
          </button>
        </div>
      </div>
    );
  }

  const catColor = CATEGORY_COLORS[course.category] || "bg-indigo-600 text-white";
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full space-y-6 font-sans pb-20"
    >
      {/* ── BREADCRUMB NAVIGATION ───────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="font-bold text-slate-700 hover:text-orange-600 flex items-center gap-1.5 transition"
          >
            <ArrowLeft size={14} /> Dashboard
          </button>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400">Courses</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800 truncate max-w-xs">{course.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs"
          >
            <Share2 size={13} /> Share
          </button>
          <button
            onClick={toggleWishlist}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-2xs"
          >
            <Heart size={13} className={isWishlisted ? "fill-rose-500 text-rose-500" : ""} />
            <span>{isWishlisted ? "Wishlisted" : "Wishlist"}</span>
          </button>
        </div>
      </div>

      {/* ── HERO BANNER: RICH CINEMATIC PRESENTATION ────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        <div className="absolute -top-16 -right-16 h-60 w-60 rounded-full bg-gradient-to-br from-orange-500/25 to-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 h-60 w-60 rounded-full bg-gradient-to-tr from-indigo-500/30 to-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Info Header */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold shadow-sm ${catColor}`}>
                {course.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/10 backdrop-blur-md text-[10px] font-semibold text-white border border-white/15">
                {course.level} Level
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30 flex items-center gap-1">
                <CheckCircle2 size={11} /> Verified Curriculum
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              {course.description}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5 font-bold text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-md border border-amber-400/25">
                <Star size={13} className="fill-amber-400 text-amber-400" /> {course.rating} ({course.ratingCount} ratings)
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} className="text-slate-400" /> {course.students} Learners Enrolled
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-slate-400" /> {course.duration}
              </span>
              <span className="flex items-center gap-1">
                <Globe size={13} className="text-slate-400" /> {course.language}
              </span>
              <span className="flex items-center gap-1 text-emerald-300 font-bold">
                <Award size={13} /> Certificate Included
              </span>
            </div>

            {/* Instructor credit */}
            <div className="pt-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-sm shadow-md ring-2 ring-white/20">
                {course.instructor.charAt(0)}
              </div>
              <div className="text-xs">
                <p className="font-bold text-white leading-tight">Instructed by {course.instructor}</p>
                <p className="text-[11px] text-slate-400">{course.instructorRole}</p>
              </div>
            </div>
          </div>

          {/* Right Floating Purchase Card */}
          <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-5 text-white shadow-2xl space-y-4">
            <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-800 shadow-md group">
              <img src={course.image} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <PlayCircle size={26} className="text-orange-600 ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 left-2 rounded bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[9px] font-mono font-semibold text-white">
                Course Preview Video
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {course.price > 0 ? `₹${course.price}` : "Free"}
                </span>
                {course.originalPrice > course.price && (
                  <span className="text-sm line-through text-slate-400 font-mono">
                    ₹{course.originalPrice}
                  </span>
                )}
                {course.price > 0 && (
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    SAVE 40%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-1">Full lifetime access with verified credential</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => navigate("/cart")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <ShoppingCart size={15} /> Enroll Now
              </button>
              <button
                onClick={toggleWishlist}
                className="w-full py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Heart size={14} className={isWishlisted ? "fill-rose-500 text-rose-500" : ""} />
                <span>{isWishlisted ? "Saved in Wishlist" : "Add to Wishlist"}</span>
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Award size={14} className="text-indigo-400" />
                <span>LearnMaster Verified Certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone size={14} className="text-cyan-400" />
                <span>Access on Mobile and Desktop</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── COURSE SECTIONS: TABS NAVIGATION ────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "curriculum", label: `Syllabus & Modules (${totalLessons} Lessons)` },
          { id: "outcomes", label: "What You'll Learn" },
          { id: "instructor", label: "Instructor Profile" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-orange-600 hover:bg-orange-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: CURRICULUM ACCORDION ─────────────────────────────────── */}
      {activeTab === "curriculum" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Course Syllabus & Curriculum</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {course.modules?.length || 0} Modules • {totalLessons} Lessons • {course.duration}
              </p>
            </div>
            <button
              onClick={() => {
                const allOpen = Object.keys(expandedModules).length === course.modules?.length;
                if (allOpen) {
                  setExpandedModules({});
                } else {
                  const newObj = {};
                  course.modules?.forEach((_, i) => (newObj[i] = true));
                  setExpandedModules(newObj);
                }
              }}
              className="text-xs font-bold text-orange-600 hover:text-orange-700"
            >
              Toggle All Modules
            </button>
          </div>

          <div className="space-y-3">
            {course.modules?.map((mod, idx) => {
              const isOpen = !!expandedModules[idx];
              return (
                <div
                  key={mod.id || idx}
                  className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleModule(idx)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-8 w-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs font-mono">
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{mod.title}</h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {mod.lessons?.length || 0} lessons • {mod.duration || "Self-paced"}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && mod.lessons && mod.lessons.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-100 bg-slate-50/50 p-2 divide-y divide-slate-100"
                      >
                        {mod.lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id || lIdx}
                            className="p-3 flex items-center justify-between hover:bg-white rounded-xl transition"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.isFree ? (
                                <PlayCircle size={15} className="text-orange-500 shrink-0" />
                              ) : (
                                <Lock size={14} className="text-slate-400 shrink-0" />
                              )}
                              <span className="text-xs font-semibold text-slate-800">{lesson.title}</span>
                              {lesson.isFree && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  Free Preview
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">{lesson.duration}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 2: WHAT YOU'LL LEARN & REQUIREMENTS ─────────────────────── */}
      {activeTab === "outcomes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles size={16} className="text-orange-500" /> What You'll Learn
            </h3>
            <div className="space-y-2.5">
              {course.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" /> Course Requirements
            </h3>
            <div className="space-y-2.5">
              {course.requirements.map((req, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <span className="leading-relaxed font-medium">{req}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: INSTRUCTOR PROFILE ───────────────────────────────────── */}
      {activeTab === "instructor" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-orange-500/20 ring-2 ring-white">
              {course.instructor.charAt(0)}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{course.instructor}</h3>
              <p className="text-xs text-orange-600 font-semibold">{course.instructorRole}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Faculty • LearnMaster Engineering Platform</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
            {course.instructorBio}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default StudentCourseDetail;
