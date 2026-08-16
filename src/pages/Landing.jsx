import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Code, Briefcase, TrendingUp, Award, Users, Star, ChevronRight, Play, 
  Clock, User, Mail, Phone, MapPin, ArrowRight, Sparkles, Zap, Globe, Shield, 
  Quote, ThumbsUp, Target, ShoppingCart, Search, Menu, X, Heart, LogOut, Filter,
  ChevronDown
} from "lucide-react";
import ProfileDropdown from "../utils/profiledropdown";
import { useAuth } from "../context/AuthContext";
import logoImage from "../assets/learnmaster-logo.png";
import { landingApi } from "../api/landingApi";

function Landing() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, loading: authLoading, logout } = useAuth();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser) {
      const role = (authUser.role || '').toLowerCase();
      let dashboardPath = '/student/dashboard';
      if (role.includes('admin') || role === 'super_admin' || role === 'sub_admin') {
        dashboardPath = '/admin/dashboard';
      } else if (role.includes('instructor')) {
        dashboardPath = '/instructor/dashboard';
      }
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, authUser, navigate]);

  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counters, setCounters] = useState({ students: 0, courses: 0, instructors: 0, satisfaction: 0 });
  const [user, setUser] = useState(authUser);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [landingLoading, setLandingLoading] = useState(true);
  const [landingError, setLandingError] = useState("");
  const [slides, setSlides] = useState([]);
  const [courses, setCourses] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [features, setFeatures] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [statsTarget, setStatsTarget] = useState({ students: 0, courses: 0, instructors: 0, satisfaction: 0 });
  
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const dashboardRef = useRef(null);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const coursesDropdownRef = useRef(null);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const [activeTab, setActiveTab] = useState("Most Popular");

  const [trendingCourses, setTrendingCourses] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [trendingError, setTrendingError] = useState(null);
  const [hasMoreTrending, setHasMoreTrending] = useState(true);
  const [trendingCurrentPage, setTrendingCurrentPage] = useState(0);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const fetchTrendingCourses = async (page = 0, append = false) => {
    if (loadingTrending) return;
    setLoadingTrending(true);
    setTrendingError(null);
    try {
      const response = await landingApi.getTrendingCourses(page, 5);
      const fetchedCourses = response?.data?.courses || [];
      const pagination = response?.data?.pagination || {};

      setTrendingCourses(prev => append ? [...prev, ...fetchedCourses] : fetchedCourses);
      setHasMoreTrending(Number(pagination.totalPages || 1) > page + 1);
      setTrendingCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch trending courses", error);
      setTrendingError(error.message || "Network error");
      if (!append) setTrendingCourses([]);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Reset trending when tab changes
  useEffect(() => {
    if (activeTab === "Trending") {
      setTrendingCourses([]);
      setTrendingCurrentPage(0);
      setHasMoreTrending(true);
      setTrendingError(null);
      fetchTrendingCourses(0, false);
    }
  }, [activeTab]);

  const loadMoreTrending = () => {
    if (!loadingTrending && hasMoreTrending) {
      fetchTrendingCourses(trendingCurrentPage + 1, true);
    }
  };

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
        setDashboardDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setCoursesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const iconCycle = [Zap, Users, Award, Globe, TrendingUp, Target, BookOpen, Shield, Briefcase, Code];

  useEffect(() => {
    const loadLandingData = async () => {
      setLandingLoading(true);
      setLandingError("");

      try {
        const payload = await landingApi.getLandingPageData();

        const backendSlides = (payload.slides || []).map((slide, index) => ({
          id: slide.id || index + 1,
          title: slide.title || "Learn Smarter",
          description: slide.description || "Explore professional learning journeys.",
          cta: slide.cta || "Explore Courses",
          bgImage: slide.bgImage || slide.image || "",
          link: slide.link || "/courses",
        }));

        const backendCourses = (payload.courses || []).map((course, index) => ({
          id: course.id || index + 1,
          title: course.title || "Untitled Course",
          category: course.category || "General",
          subcategory: course.subcategory || "General",
          students: Number(course.students || course.enrollments || 0),
          rating: Number(course.rating || 0),
          image: course.image || course.thumbnail || "https://via.placeholder.com/500x300?text=Course",
          duration: course.duration || "Self-paced",
          level: course.level || "All levels",
          tag: course.tag || "",
          premium: Boolean(course.premium),
          featuredScore: Number(course.featuredScore || 0),
          totalReviews: Number(course.totalReviews || 0),
          price: Number(course.price || 0),
          description: course.description || "",
          instructor: course.instructor || course.instructorName || "Instructor",
        }));

        const backendCategories = (payload.categories || []).map((category, index) => ({
          name: category.name || `Category ${index + 1}`,
          icon: iconCycle[index % iconCycle.length],
          subcategories: category.subcategories || [],
        }));

        const backendFeatures = (payload.features || []).map((feature, index) => ({
          icon: iconCycle[index % iconCycle.length],
          title: feature.title || "Feature",
          desc: feature.desc || feature.description || "",
        }));

        const backendTestimonials = (payload.testimonials || []).map((item) => ({
          name: item.name || "Student",
          role: item.role || "Learner",
          content: item.content || item.review || "",
          rating: Number(item.rating || 5),
          image: item.image || "https://via.placeholder.com/80",
        }));

        setSlides(backendSlides);
        setCourses(backendCourses);
        setCategoryData(backendCategories);
        setFeatures(backendFeatures);
        setTestimonials(backendTestimonials);
        setStatsTarget(payload.stats || { students: 0, courses: 0, instructors: 0, satisfaction: 0 });
      } catch (error) {
        console.error("[Landing] Failed to load backend content", error);
        setLandingError("Unable to load landing content from backend.");
      } finally {
        setLandingLoading(false);
      }
    };

    loadLandingData();
  }, []);

  // Filter logic for non‑trending tabs
  const filteredCourses = courses.filter(course => {
    if (selectedCategory && course.category !== selectedCategory) return false;
    if (selectedSubcategory && course.subcategory !== selectedSubcategory) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.title.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.subcategory.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Determine which courses to show based on active tab
  let displayCourses = [];
  if (activeTab === "Trending") {
    displayCourses = trendingCourses;
  } else {
    // For "Most Popular" and "New" – we can sort accordingly
    let sorted = [...filteredCourses];
    if (activeTab === "Most Popular") {
      sorted.sort((a, b) => (b.students || 0) - (a.students || 0));
    } else if (activeTab === "New") {
      // Assume newer courses have higher id (or add a date field)
      sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
    }
    displayCourses = sorted;
  }

  const mainCategories = categoryData.map(c => c.name);

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setExpandedCategory(null);
    } else {
      setSelectedCategory(categoryName);
      setSelectedSubcategory(null);
      setExpandedCategory(categoryName);
    }
  };

  const handleSubcategoryClick = (subcat) => {
    setSelectedSubcategory(subcat);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setExpandedCategory(null);
  };

  // Cart functions
  const updateCartCount = () => {
    const cart = localStorage.getItem("lms_cart");
    const items = cart ? JSON.parse(cart) : [];
    const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(count);
  };

  const addToCart = (course) => {
    if (!user) {
      alert("Please log in to add courses to cart.");
      navigate("/login");
      return;
    }
    const cart = localStorage.getItem("lms_cart");
    let cartItems = cart ? JSON.parse(cart) : [];
    const existing = cartItems.find(item => item.id === course.id);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cartItems.push({ ...course, quantity: 1 });
    }
    localStorage.setItem("lms_cart", JSON.stringify(cartItems));
    updateCartCount();
    alert(`Added "${course.title}" to cart.`);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/');
  };

  // Wishlist
  useEffect(() => {
    const savedWishlist = localStorage.getItem('lms_wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    localStorage.setItem('lms_wishlist', JSON.stringify(newWishlist));
  };

  const toggleWishlist = (courseId) => {
    if (wishlist.includes(courseId)) {
      saveWishlist(wishlist.filter(id => id !== courseId));
    } else {
      saveWishlist([...wishlist, courseId]);
    }
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    const targets = {
      students: Number(statsTarget.students || 0),
      courses: Number(statsTarget.courses || 0),
      instructors: Number(statsTarget.instructors || 0),
      satisfaction: Number(statsTarget.satisfaction || 0),
    };

    const interval = setInterval(() => {
      setCounters(prev => {
        let newState = { ...prev };
        let allDone = true;
        for (let key in targets) {
          if (prev[key] < targets[key]) {
            newState[key] = Math.min(prev[key] + Math.ceil(targets[key] / 50), targets[key]);
            allDone = false;
          }
        }
        if (allDone) clearInterval(interval);
        return newState;
      });
    }, 40);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(interval);
    };
  }, [statsTarget]);

  useEffect(() => {
    if (!testimonials.length) return;
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => nextSlide(), 5000);
    return () => clearInterval(interval);
  }, [slides]);

  const sliderVariants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const openCoursePopup = (course) => {
    const impressionSource = searchQuery.trim() ? "SEARCH" : "HOME";
    landingApi.trackCourseImpression(course.id, impressionSource).catch((error) => {
      console.warn("[Landing] Failed to track course impression", error);
    });
    setSelectedCourse(course);
    setShowPopup(true);
    document.body.style.overflow = 'hidden';
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedCourse(null);
    document.body.style.overflow = 'auto';
  };

  const getRoleLabel = () => {
    if (!user) return null;
    if (user.role === 'admin' || user.role === 'Admin' || user.role === 'ADMIN') return 'Admin';
    if (user.role === 'instructor' || user.role === 'Instructor') return 'Instructor';
    return null;
  };
  const roleLabel = getRoleLabel();

  // If still loading auth, show spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, we already redirect (see useEffect above), but to avoid flash we return null
  if (!authLoading && isAuthenticated) {
    return null;
  }

  const currentSlideData = slides[currentSlide] || null;

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-orange-500 origin-left z-50" style={{ scaleX }} />

      {/* Navbar – unchanged from your code, but ensure ProfileDropdown exists */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg py-2" : "bg-white/80 backdrop-blur-sm py-4"} border-b border-gray-100`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center gap-3">
                <img src={logoImage} alt="LearnMaster" className="h-16 w-auto rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300" />
                <span className="text-lg font-semibold text-slate-800 hidden sm:inline">LearnMaster</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
              <div className="relative" ref={coursesDropdownRef}>
                <button
                  onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors duration-300 group"
                >
                  Courses
                  <ChevronDown size={16} className={`transition-transform duration-300 ${coursesDropdownOpen ? "rotate-180" : ""} group-hover:translate-y-0.5`} />
                </button>
                {coursesDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
                      <div className="grid grid-cols-2 gap-1">
                        {categoryData.slice(0, 6).map((cat, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              handleCategoryClick(cat.name);
                              setCoursesDropdownOpen(false);
                              setTimeout(() => {
                                const coursesSection = document.getElementById("courses");
                                if (coursesSection) coursesSection.scrollIntoView({ behavior: "smooth" });
                              }, 100);
                            }}
                            className="text-left text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-2 py-1.5 rounded transition-colors"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-100 my-1"></div>
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Popular Courses</p>
                      <div className="space-y-1">
                        {courses.slice(0, 5).map((course) => (
                          <button
                            key={course.id}
                            onClick={() => {
                              openCoursePopup(course);
                              setCoursesDropdownOpen(false);
                            }}
                            className="w-full text-left text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 px-2 py-1.5 rounded transition-colors"
                          >
                            {course.title}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
                            setCoursesDropdownOpen(false);
                          }}
                          className="w-full text-left text-sm text-orange-600 font-medium hover:bg-orange-50 px-2 py-1.5 rounded transition-colors mt-1"
                        >
                          View all courses →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/certification" className="relative group text-gray-600 hover:text-orange-600 transition-colors duration-300">
                Get Certified
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
              <Link to="/subscription" className="relative group text-gray-600 hover:text-orange-600 transition-colors duration-300">
                Subscribe
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-300" size={18} />
                <input
                  type="text"
                  placeholder="Search for courses, instructors, categories..."
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 group-hover:border-gray-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div className="relative" ref={dashboardRef}>
                <button
                  onClick={() => setDashboardDropdownOpen(!dashboardDropdownOpen)}
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors duration-300 group text-sm font-medium"
                >
                  Dashboard
                  <ChevronDown size={16} className={`transition-transform duration-300 ${dashboardDropdownOpen ? "rotate-180" : ""} group-hover:translate-y-0.5`} />
                </button>
                {dashboardDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
                    <button onClick={() => { navigate("/admin/dashboard"); setDashboardDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">Admin Dashboard</button>
                    <button onClick={() => { navigate("/instructor/dashboard"); setDashboardDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">Instructor Dashboard</button>
                    <button onClick={() => { navigate("/student/dashboard"); setDashboardDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600">Student Dashboard</button>
                  </div>
                )}
              </div>

              {roleLabel && (
                <span className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                  {roleLabel}
                </span>
              )}

              {user ? (
                <>
                  <button className="relative text-gray-600 hover:text-orange-600 transition-transform duration-200 hover:scale-110">
                    <Heart size={20} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : ""} />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-pulse">
                        {wishlist.length > 9 ? "9+" : wishlist.length}
                      </span>
                    )}
                  </button>
                  <button onClick={() => navigate("/cart")} className="relative text-gray-600 hover:text-orange-600 transition-transform duration-200 hover:scale-110">
                    <ShoppingCart size={20} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </button>
                  <ProfileDropdown user={user} onLogout={handleLogout} />
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={() => navigate("/login")} className="text-gray-700 hover:text-orange-600 transition-colors duration-300 font-medium">Log in</button>
                  <button onClick={() => navigate("/register")} className="px-5 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">Sign up</button>
                </div>
              )}
            </div>

            <button className="md:hidden text-gray-700 hover:text-orange-600 transition-colors duration-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden mt-4 pb-4 space-y-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <div className="relative">
                  <button
                    onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
                    className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    Courses <ChevronDown size={16} className={`transition-transform duration-300 ${coursesDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {coursesDropdownOpen && (
                    <div className="pl-4 space-y-2 mt-1">
                      <p className="text-xs font-semibold text-gray-400">Categories</p>
                      {categoryData.slice(0, 6).map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleCategoryClick(cat.name);
                            setMobileMenuOpen(false);
                            setCoursesDropdownOpen(false);
                            setTimeout(() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" }), 100);
                          }}
                          className="block w-full text-left py-1 text-gray-600 hover:text-orange-600"
                        >
                          {cat.name}
                        </button>
                      ))}
                      <p className="text-xs font-semibold text-gray-400 pt-2">Popular Courses</p>
                      {courses.slice(0, 3).map((course) => (
                        <button
                          key={course.id}
                          onClick={() => {
                            openCoursePopup(course);
                            setMobileMenuOpen(false);
                            setCoursesDropdownOpen(false);
                          }}
                          className="block w-full text-left py-1 text-gray-600 hover:text-orange-600"
                        >
                          {course.title}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
                          setMobileMenuOpen(false);
                          setCoursesDropdownOpen(false);
                        }}
                        className="block w-full text-left py-1 text-orange-600 font-medium"
                      >
                        View all courses →
                      </button>
                    </div>
                  )}
                </div>

                <Link to="/certification" className="py-2 text-gray-700 hover:text-orange-600 transition-colors">Get Certified</Link>
                <Link to="/subscription" className="py-2 text-gray-700 hover:text-orange-600 transition-colors">Subscribe</Link>

                <div className="relative">
                  <button
                    onClick={() => setDashboardDropdownOpen(!dashboardDropdownOpen)}
                    className="flex items-center justify-between w-full py-2 text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    Dashboard <ChevronDown size={16} className={`transition-transform duration-300 ${dashboardDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dashboardDropdownOpen && (
                    <div className="pl-4 space-y-2">
                      <button onClick={() => { navigate("/admin/dashboard"); setMobileMenuOpen(false); setDashboardDropdownOpen(false); }} className="block w-full text-left py-2 text-gray-600 hover:text-orange-600">Admin Dashboard</button>
                      <button onClick={() => { navigate("/instructor/dashboard"); setMobileMenuOpen(false); setDashboardDropdownOpen(false); }} className="block w-full text-left py-2 text-gray-600 hover:text-orange-600">Instructor Dashboard</button>
                      <button onClick={() => { navigate("/student/dashboard"); setMobileMenuOpen(false); setDashboardDropdownOpen(false); }} className="block w-full text-left py-2 text-gray-600 hover:text-orange-600">Student Dashboard</button>
                    </div>
                  )}
                </div>
                {roleLabel && <span className="py-2 text-gray-700">Role: {roleLabel}</span>}
                {user ? (
                  <>
                    <button onClick={() => navigate("/student/wishlist")} className="text-left py-2 text-gray-700 hover:text-orange-600">Wishlist</button>
                    <button onClick={() => navigate("/cart")} className="text-left py-2 text-gray-700 hover:text-orange-600">Cart</button>
                    <button onClick={() => navigate("/student/dashboard")} className="text-left py-2 text-gray-700 hover:text-orange-600">Dashboard</button>
                    <button onClick={handleLogout} className="text-left py-2 text-red-600 hover:text-red-700">Logout</button>
                  </>
                ) : (
                  <div className="flex gap-4 pt-2">
                    <button onClick={() => navigate("/login")} className="flex-1 px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">Log in</button>
                    <button onClick={() => navigate("/register")} className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">Sign up</button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-xl mt-20">
        {landingLoading ? (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 animate-pulse" />
        ) : currentSlideData ? (
          <AnimatePresence initial={false} custom={direction}>
            <motion.div key={currentSlide} custom={direction} variants={sliderVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5, ease: "easeInOut" }} className="absolute inset-0 w-full h-full">
              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${currentSlideData.bgImage})` }}>
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900" />
        )}
        <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12 lg:px-24">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-md shadow-2xl border border-white/30">
            <img src={logoImage} alt="LearnMaster" className="h-20 w-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{currentSlideData?.title || "Learn • Skill • Grow"}</h2>
            <p className="text-gray-600 mb-6">{currentSlideData?.description || "Dynamic learning paths, real outcomes, and premium mentorship."}</p>
            <button onClick={() => (window.location.href = (currentSlideData?.link || "/courses"))} className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-md flex items-center gap-2">
              {currentSlideData?.cta || "Explore Courses"} →
            </button>
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition z-10">
          <ChevronRight size={28} className="text-gray-800 rotate-180" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition z-10">
          <ChevronRight size={28} className="text-gray-800" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, idx) => (
            <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? "w-6 bg-orange-600" : "bg-white/60"}`} />
          ))}
        </div>
      </div>

      {landingError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{landingError}</div>
        </div>
      )}

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Students", value: counters.students, suffix: "+", icon: Users },
              { label: "Expert Courses", value: counters.courses, suffix: "+", icon: BookOpen },
              { label: "Expert Instructors", value: counters.instructors, suffix: "+", icon: Users },
              { label: "Success Rate", value: counters.satisfaction, suffix: "%", icon: ThumbsUp }
            ].map((stat, idx) => (
              <div key={idx} className="group">
                <div className="inline-flex p-3 bg-orange-50 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stat.value.toLocaleString()}{stat.suffix}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-orange-600" />
              <span className="font-semibold text-gray-700">Filter by:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={clearFilters} className={`px-4 py-2 rounded-full text-sm font-medium transition ${!selectedCategory && !searchQuery ? "bg-orange-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}>
                All Courses
              </button>
              {mainCategories.map(cat => (
                <button key={cat} onClick={() => handleCategoryClick(cat)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat ? "bg-orange-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {expandedCategory && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {categoryData.find(c => c.name === expandedCategory)?.subcategories.map(sub => (
                  <button key={sub} onClick={() => handleSubcategoryClick(sub)} className={`px-3 py-1.5 rounded-full text-sm transition ${selectedSubcategory === sub ? "bg-orange-100 text-orange-700 border border-orange-300" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          )}
          {(selectedCategory || selectedSubcategory || searchQuery) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Active filters:</span>
              {selectedCategory && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => { setSelectedCategory(null); setExpandedCategory(null); }} className="ml-1 hover:text-orange-900">×</button>
                </span>
              )}
              {selectedSubcategory && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                  Subcategory: {selectedSubcategory}
                  <button onClick={() => setSelectedSubcategory(null)} className="ml-1 hover:text-orange-900">×</button>
                </span>
              )}
              {searchQuery && (
                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-orange-900">×</button>
                </span>
              )}
              <button onClick={clearFilters} className="text-orange-600 hover:underline ml-2">Clear all</button>
            </div>
          )}
        </div>
      </section>

      {/* Courses Grid */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Courses to get you started</h2>
              <p className="text-gray-600">
                {activeTab === "Trending" 
                  ? `Showing ${displayCourses.length} trending courses`
                  : `Showing ${displayCourses.length} of ${courses.length} courses`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab("Most Popular")} 
                className={`px-3 py-1 rounded-full text-sm transition ${activeTab === "Most Popular" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Most Popular
              </button>
              <button 
                onClick={() => setActiveTab("New")} 
                className={`px-3 py-1 rounded-full text-sm transition ${activeTab === "New" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                New
              </button>
              <button 
                onClick={() => { setActiveTab("Trending"); }} 
                className={`px-3 py-1 rounded-full text-sm transition ${activeTab === "Trending" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                Trending
              </button>
            </div>
          </div>

          {(activeTab === "Trending" && loadingTrending && displayCourses.length === 0) ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-500 mt-2">Loading trending courses...</p>
            </div>
          ) : trendingError && activeTab === "Trending" ? (
            <div className="text-center py-12">
              <div className="text-red-500 font-semibold mb-2">Error loading courses</div>
              <p className="text-gray-600">{trendingError}</p>
              <button onClick={() => { setTrendingCourses([]); setTrendingCurrentPage(0); setHasMoreTrending(true); fetchTrendingCourses(0); }} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg">Retry</button>
            </div>
          ) : displayCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No courses found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto pb-3 hide-scrollbar">
                <div className="flex gap-5 min-w-max">
                  {displayCourses.map((course) => (
                    <div key={course.id} className="w-[280px] sm:w-[300px] bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group hover:shadow-lg transition cursor-pointer shrink-0" onClick={() => openCoursePopup(course)}>
                      <div className="relative h-48 overflow-hidden">
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-gray-800 font-medium">{course.category}</div>
                          {course.tag && <div className="bg-orange-600 px-2 py-1 rounded-lg text-xs text-white">{course.tag}</div>}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="text-gray-800 font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-gray-500 mb-2">{course.instructor}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1"><Users size={14} /><span>{course.students.toLocaleString()}</span></div>
                          <div className="flex items-center gap-1"><Star size={14} className="text-yellow-400" /><span>{course.rating}</span></div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                          <div className="flex items-center gap-1"><Clock size={12} /><span>{course.duration}</span></div>
                          <div className="flex items-center gap-1"><User size={12} /><span>{course.level}</span></div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                          <span className="text-2xl font-bold text-gray-800">₹{course.price}</span>
                          <button onClick={(e) => { e.stopPropagation(); addToCart(course); }} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-semibold transition-colors">
                            <ShoppingCart size={16} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Load More button – only for Trending tab */}
              {activeTab === "Trending" && (
                <div className="flex justify-center mt-10">
                  {loadingTrending && displayCourses.length > 0 && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                      <span>Loading more...</span>
                    </div>
                  )}
                  {!loadingTrending && hasMoreTrending && (
                    <button
                      onClick={loadMoreTrending}
                      className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-md flex items-center gap-2"
                    >
                      Load More <ChevronDown size={18} />
                    </button>
                  )}
                  {!hasMoreTrending && displayCourses.length > 0 && (
                    <p className="text-gray-400 text-sm">You've seen all trending courses</p>
                  )}
                  {trendingError && (
                    <button onClick={() => { setTrendingCourses([]); setTrendingCurrentPage(0); setHasMoreTrending(true); fetchTrendingCourses(0, false); }} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                      Retry
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Course Details Popup – same as before */}
      {showPopup && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closePopup}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56 overflow-hidden rounded-t-2xl">
              <img src={selectedCourse.image} alt={selectedCourse.title} className="w-full h-full object-cover" />
              <button onClick={closePopup} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100">
                <X size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
                  <p className="text-gray-600 mt-1">by {selectedCourse.instructor}</p>
                </div>
                <button onClick={() => toggleWishlist(selectedCourse.id)} className="p-2 rounded-full hover:bg-gray-100 transition">
                  <Heart size={28} className={wishlist.includes(selectedCourse.id) ? "fill-red-500 text-red-500" : "text-gray-400"} />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-yellow-400" /><span className="font-semibold">{selectedCourse.rating}</span></div>
                <div className="flex items-center gap-1"><Users size={16} className="text-gray-500" /><span>{selectedCourse.students.toLocaleString()} students</span></div>
                <div className="flex items-center gap-1"><Clock size={16} className="text-gray-500" /><span>{selectedCourse.duration}</span></div>
                <div className="flex items-center gap-1"><User size={16} className="text-gray-500" /><span>{selectedCourse.level}</span></div>
              </div>
              <div className="mt-4">
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">{selectedCourse.description}</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                <div><span className="text-3xl font-bold text-gray-900">₹{selectedCourse.price}</span></div>
                <div className="flex gap-3">
                  <button onClick={() => addToCart(selectedCourse)} className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2">
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                  <button onClick={closePopup} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose LearnMaster?</h2>
            <p className="text-gray-600">We provide the best learning experience</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer">
                <div className="inline-flex p-3 bg-orange-50 rounded-xl mb-4"><feat.icon className="w-6 h-6 text-orange-600" /></div>
                <h3 className="text-gray-800 font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Students Say</h2>
            <p className="text-gray-600">Join thousands of satisfied learners</p>
          </div>
          {testimonials.length > 0 ? (
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.5 }} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="relative"><div className="absolute inset-0 bg-orange-500 rounded-full blur-lg opacity-20"></div><img src={testimonials[activeTestimonial].image} alt={testimonials[activeTestimonial].name} className="w-20 h-20 rounded-full object-cover relative z-10 border-2 border-orange-500" /></div>
                  <div className="flex-1 text-center md:text-left"><Quote className="w-8 h-8 text-orange-400 mb-4 mx-auto md:mx-0" /><p className="text-gray-600 text-lg italic mb-4">"{testimonials[activeTestimonial].content}"</p><h4 className="text-gray-800 font-semibold text-lg">{testimonials[activeTestimonial].name}</h4><p className="text-orange-600 text-sm">{testimonials[activeTestimonial].role}</p><div className="flex text-yellow-400 mt-2 justify-center md:justify-start">{[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (<Star key={i} size={16} fill="currentColor" />))}</div></div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2 mt-6">{testimonials.map((_, idx) => (<button key={idx} onClick={() => setActiveTestimonial(idx)} className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-6 bg-orange-600' : 'bg-gray-300'}`} />))}</div>
          </div>
          ) : (
            <div className="text-center text-gray-500">No testimonials available right now.</div>
          )}
        </div>
      </section>

      {/* CTA Section (only for logged out) */}
      {!user && (
        <section className="py-20 bg-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Join thousands of students and start learning today. Get access to 200+ courses, expert mentors, and industry-recognized certificates.</p>
            <button onClick={() => navigate("/register")} className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition inline-flex items-center gap-2 shadow-md">
              Get Started For Free <ArrowRight size={18} />
            </button>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div><div className="flex items-center gap-3 mb-4"><img src={logoImage} alt="LearnMaster" className="h-16 w-auto" /><span className="text-gray-800 font-bold text-xl">LearnMaster</span></div><p className="text-gray-500 text-sm">Empowering learners worldwide with quality education.</p></div>
            <div><h4 className="text-gray-800 font-semibold mb-4">Quick Links</h4><ul className="space-y-2 text-gray-500 text-sm"><li><a href="#courses" className="hover:text-orange-600 transition">Courses</a></li><li><a href="#features" className="hover:text-orange-600 transition">Features</a></li><li><a href="#" className="hover:text-orange-600 transition">About Us</a></li><li><a href="#" className="hover:text-orange-600 transition">Contact</a></li></ul></div>
            <div><h4 className="text-gray-800 font-semibold mb-4">Support</h4><ul className="space-y-2 text-gray-500 text-sm"><li><a href="#" className="hover:text-orange-600 transition">Help Center</a></li><li><a href="#" className="hover:text-orange-600 transition">Terms of Service</a></li><li><a href="#" className="hover:text-orange-600 transition">Privacy Policy</a></li><li><a href="#" className="hover:text-orange-600 transition">Refund Policy</a></li></ul></div>
            <div><h4 className="text-gray-800 font-semibold mb-4">Contact Us</h4><ul className="space-y-2 text-gray-500 text-sm"><li className="flex items-center gap-2"><Mail size={14} /> support@learnmaster.com</li><li className="flex items-center gap-2"><Phone size={14} /> +1 234 567 890</li><li className="flex items-center gap-2"><MapPin size={14} /> 123 Learning St, Silicon Valley</li></ul></div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 text-center text-gray-400 text-sm"><p>&copy; 2025 LearnMaster. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;