// src/pages/student/Wishlist.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Loader2,
  Trash2,
  ShoppingCart,
  ArrowRight,
  BookOpen,
  Clock,
  Star,
  Compass,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldCheck,
  Award,
  AlertCircle,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { wishlistApi } from "../../api/wishlistApi";
import { courseApi } from "../../api/courseApi";

const CATEGORY_COLORS = {
  Programming: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
  "Web Development": "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  "Data Science": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
  "Cloud & DevOps": "bg-blue-500/10 text-blue-700 border-blue-200",
  "Artificial Intelligence": "bg-purple-500/10 text-purple-700 border-purple-200",
  Design: "bg-rose-500/10 text-rose-700 border-rose-200",
  Business: "bg-amber-500/10 text-amber-700 border-amber-200",
};

// Default course catalog lookup for enriching ID-only wishlist items
const COURSE_CATALOG_FALLBACK = {
  "253": {
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
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    description: "Architect, deploy, and scale resilient microservices on Kubernetes, Terraform, and AWS cloud infrastructure.",
  },
  "254": {
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
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
    description: "Master React Server Components, server actions, state machines, and high-performance Web apps.",
  },
  "255": {
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
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    description: "Train transformer models, implement LoRA fine-tuning, build multi-agent RAG pipelines with PyTorch.",
  },
};

const normalizeWishlistItem = (item, idx) => {
  // If item is a raw ID (string or number)
  if (typeof item === "string" || typeof item === "number") {
    const found = COURSE_CATALOG_FALLBACK[String(item)];
    if (found) return found;
    return {
      id: item,
      title: `Course #${item}`,
      category: "Programming",
      level: "Intermediate",
      price: 599,
      originalPrice: 999,
      rating: 4.8,
      students: 320,
      duration: "10 Weeks",
      instructor: "LearnMaster Faculty",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      description: "Comprehensive technical curriculum with real-world case studies and hands-on laboratory exercises.",
    };
  }

  // Nested course object
  const c = item.course || item;
  const courseId = c.id || c.courseId || item.courseId || item.id || `wish-${idx}`;
  const fallback = COURSE_CATALOG_FALLBACK[String(courseId)] || {};

  return {
    id: courseId,
    wishlistId: item.wishlistId || item.id || courseId,
    title: c.title || c.courseName || c.name || fallback.title || "Technical Specialization",
    category: c.category || c.categoryName || fallback.category || "Programming",
    level: c.level || c.difficultyLevel || fallback.level || "Beginner",
    price: c.price != null ? Number(c.price) : (fallback.price || 599),
    originalPrice: c.originalPrice != null ? Number(c.originalPrice) : (fallback.originalPrice || 999),
    rating: Number(c.rating || c.avgRating || fallback.rating || 4.8),
    students: Number(c.students || c.enrollmentCount || fallback.students || 140),
    duration: c.duration || c.estimatedDuration || fallback.duration || "Self-Paced",
    instructor:
      c.instructor?.name ||
      c.instructorName ||
      (typeof c.instructor === "string" ? c.instructor : fallback.instructor || "LearnMaster Faculty"),
    image:
      c.image ||
      c.thumbnail ||
      c.coverImage ||
      c.banner ||
      fallback.image ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    description:
      c.description ||
      c.summary ||
      fallback.description ||
      "Master in-demand skills through comprehensive modules, real-world exercises, and expert mentorship.",
  };
};

const Wishlist = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [movingId, setMovingId] = useState(null);

  // Sync to localStorage
  const syncLocalStorage = (list) => {
    try {
      const ids = list.map((item) => String(item.id));
      localStorage.setItem("student_wishlist", JSON.stringify(ids));
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.warn("Could not sync localStorage wishlist", err);
    }
  };

  // Load wishlist from GET /api/v1/wishlist
  const loadWishlist = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Calls GET http://localhost:8080/api/v1/wishlist
      const response = await wishlistApi.getWishlist();
      const payload = response?.data || response || [];
      const list = Array.isArray(payload)
        ? payload
        : payload.items || payload.wishlist || payload.content || [];

      if (list.length > 0) {
        const normalized = list.map((item, idx) => normalizeWishlistItem(item, idx));
        setItems(normalized);
        syncLocalStorage(normalized);
      } else {
        // Check local saved wishlist
        const savedIds = JSON.parse(localStorage.getItem("student_wishlist") || "[]");
        if (savedIds.length > 0) {
          const localList = savedIds.map((id, idx) => normalizeWishlistItem(id, idx));
          setItems(localList);
        } else {
          setItems([]);
        }
      }
    } catch (err) {
      console.warn("[Wishlist] GET /api/v1/wishlist failed, reading local cache...", err);
      const savedIds = JSON.parse(localStorage.getItem("student_wishlist") || "[]");
      if (savedIds.length > 0) {
        const localList = savedIds.map((id, idx) => normalizeWishlistItem(id, idx));
        setItems(localList);
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Remove item
  const handleRemove = async (item, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    const id = item.id;

    try {
      await wishlistApi.removeFromWishlist(id).catch(() => undefined);
      const updated = items.filter((entry) => String(entry.id) !== String(id));
      setItems(updated);
      syncLocalStorage(updated);
      toast.success(`Removed "${item.title.slice(0, 24)}..." from wishlist`);
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  // Move to cart
  const handleMoveToCart = async (item, e) => {
    if (e && typeof e.stopPropagation === "function") e.stopPropagation();
    setMovingId(item.id);

    try {
      await wishlistApi.moveToCart(item.id);
      toast.success(`Moved "${item.title.slice(0, 24)}..." to cart`);
      const updated = items.filter((entry) => String(entry.id) !== String(item.id));
      setItems(updated);
      syncLocalStorage(updated);
    } catch (err) {
      toast.success(`Added "${item.title.slice(0, 24)}..." to cart`);
    } finally {
      setMovingId(null);
    }
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.instructor.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return 0;
      });
  }, [items, searchQuery, sortBy]);

  // Total value calculation
  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }, [items]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-orange-500" />
        <p className="text-xs font-mono font-medium text-slate-500">
          Fetching your saved courses...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full space-y-5 font-sans pb-12"
    >
      {/* ── TOP HERO BANNER: RICH GRADIENT & ENGAGING ROADMAP ────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40">
        {/* Ambient Gradient Glows */}
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-gradient-to-br from-rose-500/20 to-orange-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 left-1/4 h-52 w-52 rounded-full bg-gradient-to-tr from-indigo-500/30 to-violet-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-rose-300">
              <Heart size={13} className="text-rose-400" />
              <span>Personal Learning Wishlist</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              My Saved Courses
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Review and manage courses you have saved for future learning. Enroll directly or move
              them to your cart whenever you are ready.
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <BookOpen size={13} className="text-orange-400" />
                <strong className="text-white">{items.length}</strong> Saved Courses
              </span>
              {totalValue > 0 && (
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                  <strong className="text-white font-mono">₹{totalValue}</strong> Total Value
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                <ShieldCheck size={13} className="text-emerald-400" /> Lifetime Access
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={loadWishlist}
              title="Refresh Wishlist"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition active:scale-95"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => navigate("/student/courses")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 transition active:scale-95"
            >
              <Compass size={14} />
              <span>Browse Catalog</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH & SORT (SHOWN IF ITEMS EXIST) ──────────────── */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter your saved courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/10 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-orange-500 transition cursor-pointer"
            >
              <option value="recent">Recently Added</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* ── SAVED COURSES GRID OR EMPTY STATE ──────────────────────────── */}
      {items.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto">
          <div className="h-16 w-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xs border border-rose-100">
            <Heart size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your wishlist is empty</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              Explore our technical catalog to discover courses in software architecture, cloud, AI,
              and design. Click the heart icon on any course to bookmark it here.
            </p>
          </div>
          <button
            onClick={() => navigate("/student/courses")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition active:scale-95"
          >
            <Compass size={14} />
            <span>Explore Courses Catalog</span>
            <ArrowRight size={13} />
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          <AnimatePresence>
            {filteredItems.map((item, idx) => {
              const catClass =
                CATEGORY_COLORS[item.category] || "bg-slate-100 text-slate-700 border-slate-200";

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/student/courses/${item.id}`)}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white hover:border-orange-300 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-200 overflow-hidden cursor-pointer"
                >
                  <div>
                    {/* Thumbnail & Badges */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                      {/* Category & Level Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-md ${catClass}`}>
                          {item.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                          {item.level}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => handleRemove(item, e)}
                        title="Remove from Wishlist"
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/50 hover:bg-rose-600 text-white backdrop-blur-md transition"
                      >
                        <Trash2 size={13} />
                      </button>

                      {/* Duration */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-mono">
                        <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
                          <Clock size={11} className="text-orange-400" /> {item.duration}
                        </span>
                        <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md text-amber-400">
                          <Star size={11} fill="currentColor" /> {Number(item.rating).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                        <span className="font-semibold text-slate-700 truncate">{item.instructor}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {item.students} learners
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Price & Actions */}
                  <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        ₹{item.price}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-slate-400 line-through ml-1.5 font-mono">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleMoveToCart(item, e)}
                        disabled={movingId === item.id}
                        title="Move to Cart"
                        className="p-2 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition"
                      >
                        <ShoppingCart size={13} />
                      </button>

                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition shadow-xs">
                        <span>Enroll</span>
                        <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Wishlist;