import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Code, Briefcase, TrendingUp, Award, Users, Star, ChevronRight, Play, Calendar, Clock, 
  User, Facebook, Twitter, Linkedin, Github, Mail, Phone, MapPin, ArrowRight, CheckCircle, 
  Sparkles, Zap, Globe, Shield, Heart, Coffee, Rocket, Target, Cpu, Database, Palette, Video,
  ExternalLink, Quote, ThumbsUp, Crown, Medal, Gem, Compass
} from "lucide-react";

function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [counters, setCounters] = useState({ students: 0, courses: 0, instructors: 0, satisfaction: 0 });
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  // Parallax effect
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    // Counter animation
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

  // Testimonials auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const courses = [
    {
      title: "Full Stack Web Development",
      category: "Development",
      students: 12450,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500",
      duration: "24 weeks",
      level: "Beginner to Advanced",
      tag: "Most Popular"
    },
    {
      title: "Data Science & Machine Learning",
      category: "Data Science",
      students: 8932,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
      duration: "32 weeks",
      level: "Intermediate",
      tag: "Trending"
    },
    {
      title: "UI/UX Design Masterclass",
      category: "Design",
      students: 5621,
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500",
      duration: "16 weeks",
      level: "Beginner",
      tag: "New"
    },
    {
      title: "Cloud Computing with AWS",
      category: "Cloud",
      students: 7340,
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500",
      duration: "20 weeks",
      level: "Intermediate",
      tag: "Certificate"
    }
  ];

  const categories = [
    { icon: Code, name: "Development", count: 45, color: "blue" },
    { icon: Briefcase, name: "Business", count: 32, color: "purple" },
    { icon: TrendingUp, name: "Marketing", count: 28, color: "green" },
    { icon: Award, name: "Design", count: 24, color: "orange" },
    { icon: BookOpen, name: "IT & Software", count: 38, color: "red" },
    { icon: Cpu, name: "AI & ML", count: 30, color: "indigo" }
  ];

  const features = [
    { icon: Zap, title: "Learn by Doing", desc: "Hands-on projects & real-world assignments", color: "yellow" },
    { icon: Users, title: "Expert Mentors", desc: "Industry professionals as guides", color: "blue" },
    { icon: Award, title: "Certified Programs", desc: "Industry-recognized certificates", color: "green" },
    { icon: Globe, title: "Global Community", desc: "Connect with learners worldwide", color: "purple" },
    { icon: Rocket, title: "Career Support", desc: "Job placement assistance", color: "red" },
    { icon: Target, title: "Personalized Learning", desc: "Adaptive learning paths", color: "orange" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      content: "This platform completely transformed my career. The courses are comprehensive and the mentors are amazing. I landed my dream job within 3 months!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      company: "Google"
    },
    {
      name: "Michael Chen",
      role: "Data Analyst at Amazon",
      content: "Best learning platform I've ever used. The projects helped me build a strong portfolio that impressed recruiters. Highly recommend!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      company: "Amazon"
    },
    {
      name: "Priya Sharma",
      role: "Product Designer at Microsoft",
      content: "The UI/UX course was phenomenal. The hands-on assignments and peer feedback really helped me grow. Landed my dream job right after completion!",
      rating: 5,
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      company: "Microsoft"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    },
    hover: {
      scale: 1.05,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] overflow-x-hidden">
      
      {/* Scroll Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg rounded-full"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              LearnMaster
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-gray-300 hover:text-white transition relative group">
              Courses
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#features" className="text-gray-300 hover:text-white transition relative group">
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition relative group">
              Success Stories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-5 py-2 text-gray-300 hover:text-white transition"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1c] via-[#0f1629] to-[#1a1f35]"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100],
                x: [0, (Math.random() - 0.5) * 50],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>
        
        {/* Animated Orbs */}
        <motion.div 
          className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px]"
          style={{ y: y1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px]"
          style={{ y: y2 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/10 rounded-full px-4 py-2 mb-6 border border-blue-500/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-sm text-blue-400">Limited Time Offer: 30% Off</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Master Skills That
                <motion.span 
                  className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent"
                  animate={{ backgroundPosition: ["0%", "100%"] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                  style={{ backgroundSize: "200%" }}
                >
                  Shape Your Future
                </motion.span>
              </h1>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-lg">
                Join 50,000+ professionals learning cutting-edge skills with our industry-recognized courses. Get certified and accelerate your career.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/register")}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center gap-2 group"
                >
                  Start Learning Free
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-semibold hover:bg-white/10 transition flex items-center gap-2"
                >
                  <Play size={18} />
                  Watch Demo
                </motion.button>
              </div>
              <div className="flex items-center gap-8 mt-8">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <img 
                      key={i} 
                      src={`https://randomuser.me/api/portraits/${i%2===0?'women':'men'}/${i}.jpg`} 
                      className="w-10 h-10 rounded-full border-2 border-[#0a0f1c]" 
                      alt="user" 
                    />
                  ))}
                </div>
                <div>
                  <p className="text-white font-semibold">
                    <span className="text-2xl text-blue-400">{counters.students.toLocaleString()}</span>+ Active Students
                  </p>
                  <p className="text-gray-500 text-sm">Trusted by professionals worldwide</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" 
                  alt="Students learning"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1c] via-transparent to-transparent"></div>
              </div>
              <motion.div 
                className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">98% Success Rate</p>
                    <p className="text-gray-400 text-sm">Career advancement</p>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Award className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Certified Courses</p>
                    <p className="text-gray-400 text-sm">Industry recognized</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-16 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { label: "Active Students", value: counters.students, suffix: "+", icon: Users },
              { label: "Expert Courses", value: counters.courses, suffix: "+", icon: BookOpen },
              { label: "Expert Instructors", value: counters.instructors, suffix: "+", icon: Users },
              { label: "Success Rate", value: counters.satisfaction, suffix: "%", icon: ThumbsUp }
            ].map((stat, idx) => (
              <motion.div key={idx} variants={itemVariants} className="group">
                <div className="inline-flex p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}{stat.suffix}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section with 3D Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Explore Top Categories</h2>
            <p className="text-gray-400">Choose from 200+ courses across various domains</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 text-center border border-white/10 cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-indigo-500/10 transition-all duration-500"></div>
                <div className="inline-flex p-3 bg-blue-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <cat.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">{cat.name}</h3>
                <p className="text-gray-500 text-sm">{cat.count} Courses</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses with Hover Effects */}
      <section id="courses" className="py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured Courses</h2>
              <p className="text-gray-400">Most popular courses loved by our students</p>
            </div>
            <motion.button 
              whileHover={{ x: 5 }}
              className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
            >
              View All <ChevronRight size={18} />
            </motion.button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 group relative"
                onHoverStart={() => setHoveredCourse(idx)}
                onHoverEnd={() => setHoveredCourse(null)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <div className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-xs text-white">
                      {course.category}
                    </div>
                    {course.tag && (
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-1 rounded-lg text-xs text-white">
                        {course.tag}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{course.level}</span>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 font-semibold hover:bg-blue-600/30 transition"
                  >
                    Enroll Now
                  </motion.button>
                </div>
                {hoveredCourse === idx && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Interactive Cards */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose LearnMaster?</h2>
            <p className="text-gray-400">We provide the best learning experience</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 group cursor-pointer"
              >
                <div className="inline-flex p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  <feat.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-gray-400 text-sm">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section id="testimonials" className="py-20 bg-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">What Our Students Say</h2>
            <p className="text-gray-400">Join thousands of satisfied learners</p>
          </motion.div>
          
          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-lg opacity-50"></div>
                    <img src={testimonials[activeTestimonial].image} alt={testimonials[activeTestimonial].name} className="w-20 h-20 rounded-full object-cover relative z-10 border-2 border-blue-500" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <Quote className="w-8 h-8 text-blue-400 mb-4 mx-auto md:mx-0" />
                    <p className="text-gray-300 text-lg italic mb-4">"{testimonials[activeTestimonial].content}"</p>
                    <h4 className="text-white font-semibold text-lg">{testimonials[activeTestimonial].name}</h4>
                    <p className="text-blue-400 text-sm">{testimonials[activeTestimonial].role}</p>
                    <div className="flex text-yellow-400 mt-2 justify-center md:justify-start">
                      {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-6 bg-blue-500' : 'bg-gray-600'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Parallax */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">Join thousands of students and start learning today. Get access to 200+ courses, expert mentors, and industry-recognized certificates.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-blue-500/25 transition-all duration-300 inline-flex items-center gap-2 group"
            >
              Get Started For Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <span className="text-white font-bold text-xl">LearnMaster</span>
              </div>
              <p className="text-gray-500 text-sm">Empowering learners worldwide with quality education.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#courses" className="hover:text-white transition">Courses</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2"><Mail size={14} /> support@learnmaster.com</li>
                <li className="flex items-center gap-2"><Phone size={14} /> +1 234 567 890</li>
                <li className="flex items-center gap-2"><MapPin size={14} /> 123 Learning St, Silicon Valley</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2024 LearnMaster. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;