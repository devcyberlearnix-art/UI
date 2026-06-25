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

function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counters, setCounters] = useState({ students: 0, courses: 0, instructors: 0, satisfaction: 0 });
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  
  // Dashboard dropdown state
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);
  const dashboardRef = useRef(null);

  // NEW: Courses dropdown state
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const coursesDropdownRef = useRef(null);
  
  // Popup state
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  
  // Cart state
  const [cartCount, setCartCount] = useState(0);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  // Close dashboard dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dashboardRef.current && !dashboardRef.current.contains(event.target)) {
        setDashboardDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close courses dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setCoursesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---------- Banner slides ----------
  const slides = [
    { id: 1, title: "30% off for a limited time", description: "Start learning high-demand skills from top instructors.", cta: "Start Learning", bgImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&auto=format", link: "/register" },
    { id: 2, title: "Become an AI Expert", description: "Master machine learning and earn a certificate.", cta: "Explore AI Courses", bgImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1400&auto=format", link: "/courses" },
    { id: 3, title: "Learn from Industry Leaders", description: "Join 50,000+ students learning real-world skills.", cta: "Browse Courses", bgImage: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1400&auto=format", link: "/courses" },
    { id: 4, title: "Learn Python in 4.5 Hours", description: "Become a certified Python programmer with hands-on projects & free PyCharm Pro.", cta: "View Python Course", bgImage: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=1400&auto=format", link: "/courses/python-pcep" },
    { id: 5, title: "Master UI/UX Design", description: "Learn Figma, prototyping, and user research from industry experts.", cta: "Explore Design Courses", bgImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1400&auto=format", link: "/courses/design" },
    { id: 6, title: "Cloud Computing with AWS", description: "Get AWS certified and boost your cloud career.", cta: "Start Learning Cloud", bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format", link: "/courses/cloud" },
  ];

  // ---------- Courses (with subcategories) ----------
  const courses = [
    {
      id: 1,
      title: "Full Stack Web Development",
      category: "Development",
      subcategory: "Web Development",
      students: 12450,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500",
      duration: "24 weeks",
      level: "Beginner to Advanced",
      tag: "Most Popular",
      price: 49,
      description: "Learn to build full-stack web applications using React, Node.js, MongoDB, and Express. Master frontend and backend development with hands-on projects.",
      instructor: "Dr. Sarah Johnson",
    },
    {
      id: 2,
      title: "Data Science & Machine Learning",
      category: "Data Science",
      subcategory: "Machine Learning",
      students: 8932,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
      duration: "32 weeks",
      level: "Intermediate",
      tag: "Trending",
      price: 79,
      description: "Master data analysis, visualization, and machine learning algorithms using Python, Pandas, Scikit-learn, and TensorFlow.",
      instructor: "Prof. Michael Chen",
    },
    {
      id: 3,
      title: "UI/UX Design Masterclass",
      category: "Design",
      subcategory: "UI/UX",
      students: 5621,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500",
      duration: "16 weeks",
      level: "Beginner",
      tag: "New",
      price: 39,
      description: "Learn user interface and user experience design principles, wireframing, prototyping, and user testing using Figma and Adobe XD.",
      instructor: "Emily Davis",
    },
    {
      id: 4,
      title: "Cloud Computing with AWS",
      category: "IT & Software",
      subcategory: "Cloud Computing",
      students: 7340,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500",
      duration: "20 weeks",
      level: "Intermediate",
      tag: "Certificate",
      price: 69,
      description: "Learn AWS services, cloud architecture, deployment, and management. Prepare for AWS certification exams.",
      instructor: "Mike Ross",
    },
    {
      id: 5,
      title: "Python PCEP: Become Certified Entry-Level Python Programmer",
      category: "Development",
      subcategory: "Programming Languages",
      students: 15890,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=500",
      duration: "4.5 hours",
      level: "Beginner",
      tag: "Premium",
      price: 49,
      description: "Learn Python from scratch and pass the PCEP-30-02 exam. Get 6 months free PyCharm Pro. Start programming from scratch, understand Python basics, prepare for certification.",
      instructor: "Dr. Sarah Johnson",
    },
    {
      id: 6,
      title: "React Native: Mobile Apps",
      category: "Development",
      subcategory: "Mobile Development",
      students: 6540,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500",
      duration: "22 weeks",
      level: "Intermediate",
      tag: "Hot & New",
      price: 59,
      description: "Build cross-platform mobile apps using React Native. Learn navigation, state management, and API integration.",
      instructor: "John Doe",
    },
    {
      id: 7,
      title: "DevOps with Kubernetes",
      category: "IT & Software",
      subcategory: "DevOps",
      students: 4210,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=500",
      duration: "28 weeks",
      level: "Advanced",
      tag: "Top Rated",
      price: 89,
      description: "Master container orchestration with Kubernetes, Docker, CI/CD pipelines, and cloud deployment strategies.",
      instructor: "Jane Smith",
    },
    {
      id: 8,
      title: "Digital Marketing Mastery",
      category: "Marketing",
      subcategory: "Digital Marketing",
      students: 11230,
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=500",
      duration: "12 weeks",
      level: "All Levels",
      tag: "Bestseller",
      price: 34,
      description: "Learn SEO, social media marketing, email campaigns, Google Analytics, and content strategy.",
      instructor: "Lisa Wong",
    },
    {
      id: 9,
      title: "Cyber Security Fundamentals",
      category: "IT & Software",
      subcategory: "Cyber Security",
      students: 7890,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500",
      duration: "24 weeks",
      level: "Beginner",
      tag: "Trending",
      price: 74,
      description: "Understand network security, cryptography, threat analysis, and ethical hacking principles.",
      instructor: "David Kim",
    },
    {
      id: 10,
      title: "Blockchain & Cryptocurrency",
      category: "IT & Software",
      subcategory: "Blockchain",
      students: 3450,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500",
      duration: "14 weeks",
      level: "Intermediate",
      tag: "New",
      price: 84,
      description: "Learn blockchain fundamentals, smart contracts, cryptocurrency trading, and decentralized applications.",
      instructor: "Alex Turner",
    },
  ];

  // Categories with subcategories mapping
  const categoryData = [
    { name: "Development", icon: Code, subcategories: ["Web Development", "Mobile Development", "Programming Languages", "Game Development"] },
    { name: "Data Science", icon: TrendingUp, subcategories: ["Machine Learning", "Data Analysis", "Deep Learning", "NLP"] },
    { name: "Design", icon: Award, subcategories: ["UI/UX", "Graphic Design", "Web Design", "3D Animation"] },
    { name: "IT & Software", icon: BookOpen, subcategories: ["Cloud Computing", "Cyber Security", "DevOps", "Networking", "Blockchain"] },
    { name: "Marketing", icon: Briefcase, subcategories: ["Digital Marketing", "SEO", "Social Media", "Content Marketing"] },
    { name: "Business", icon: Briefcase, subcategories: ["Entrepreneurship", "Management", "Sales", "Finance"] },
  ];

  // Features and testimonials
  const features = [
    { icon: Zap, title: "Learn by Doing", desc: "Hands-on projects & real-world assignments" },
    { icon: Users, title: "Expert Mentors", desc: "Industry professionals as guides" },
    { icon: Award, title: "Certified Programs", desc: "Industry-recognized certificates" },
    { icon: Globe, title: "Global Community", desc: "Connect with learners worldwide" },
    { icon: TrendingUp, title: "Career Support", desc: "Job placement assistance" },
    { icon: Target, title: "Personalized Learning", desc: "Adaptive learning paths" }
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Software Engineer at Google", content: "This platform completely transformed my career. The hands-on projects and expert mentors made all the difference.", rating: 5, image: "https://randomuser.me/api/portraits/women/1.jpg" },
    { name: "Michael Chen", role: "Data Analyst at Amazon", content: "Best learning platform I've ever used. The courses are up-to-date and the community support is amazing.", rating: 5, image: "https://randomuser.me/api/portraits/men/2.jpg" },
    { name: "Priya Sharma", role: "Product Designer at Microsoft", content: "The UI/UX course was phenomenal. I got a promotion within 3 months of completing it!", rating: 5, image: "https://randomuser.me/api/portraits/women/3.jpg" }
  ];

  // Filter logic
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

  // Auth, counters, slider, etc.
  useEffect(() => {
    const storedUser = localStorage.getItem('lms_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    const handleStorage = () => {
      const updated = localStorage.getItem('lms_user');
      setUser(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_token');
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    const targets = { students: 50000, courses: 200, instructors: 150, satisfaction: 98 };
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
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  useEffect(() => {
    const interval = setInterval(() => nextSlide(), 5000);
    return () => clearInterval(interval);
  }, []);

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
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'instructor') return 'Instructor';
    return null;
  };
  const roleLabel = getRoleLabel();

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-orange-500 origin-left z-50" style={{ scaleX }} />

      {/* Navbar with Courses dropdown */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-lg py-2" : "bg-white/80 backdrop-blur-sm py-4"} border-b border-gray-100`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 blur-lg rounded-full opacity-0 group-hover:opacity-30 transition duration-500"></div>
                <span className="relative text-2xl font-bold text-orange-600 group-hover:scale-105 transition-transform duration-300 inline-block">LearnMaster</span>
              </div>
            </Link>

            {/* Desktop menu items */}
            <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
              {/* Courses dropdown */}
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
                    {/* Categories section */}
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
                    {/* Popular courses section */}
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

              {/* Other menu links */}
              <Link to="/certification" className="relative group text-gray-600 hover:text-orange-600 transition-colors duration-300">
                Get Certified
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
              <Link to="/subscription" className="relative group text-gray-600 hover:text-orange-600 transition-colors duration-300">
                Subscribe
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300 ease-out"></span>
              </Link>
            </div>

            {/* Search bar */}
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

            {/* Right side icons & auth */}
            <div className="hidden md:flex items-center gap-6">
              {/* Dashboard dropdown */}
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

              {/* Role label */}
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

            {/* Mobile menu button */}
            <button className="md:hidden text-gray-700 hover:text-orange-600 transition-colors duration-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu */}
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
                {/* Mobile courses dropdown */}
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

                {/* Mobile dashboard dropdown */}
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

      {/* Hero Banner, Stats, Filters, Courses Grid, Popup, Features, Testimonials, CTA, Footer – identical to your original */}
      {/* (I've kept the rest unchanged; the existing JSX continues below) */}

      {/* Hero Banner with 6 slides */}
      <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-xl mt-20">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div key={currentSlide} custom={direction} variants={sliderVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.5, ease: "easeInOut" }} className="absolute inset-0 w-full h-full">
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${slides[currentSlide].bgImage})` }}>
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 flex items-center justify-start px-6 md:px-12 lg:px-24">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-md shadow-2xl border border-white/30">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{slides[currentSlide].title}</h2>
            <p className="text-gray-600 mb-6">{slides[currentSlide].description}</p>
            <button onClick={() => (window.location.href = slides[currentSlide].link)} className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition shadow-md flex items-center gap-2">
              {slides[currentSlide].cta} →
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
              <p className="text-gray-600">Showing {filteredCourses.length} of {courses.length} courses</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Most Popular</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">New</span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Trending</span>
            </div>
          </div>
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No courses found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
              <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">Clear all filters</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group hover:shadow-lg transition cursor-pointer" onClick={() => openCoursePopup(course)}>
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
          )}
        </div>
      </section>

      {/* Course Details Popup */}
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
            <div><div className="flex items-center gap-2 mb-4"><span className="text-gray-800 font-bold text-xl">LearnMaster</span></div><p className="text-gray-500 text-sm">Empowering learners worldwide with quality education.</p></div>
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