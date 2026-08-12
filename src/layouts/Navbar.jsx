import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Globe, Menu, X, Heart, User, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import logoImage from "../assets/learnmaster-logo.png";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const storedUser = localStorage.getItem("lms_user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleStorage = () => {
      const updated = localStorage.getItem("lms_user");
      setUser(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("lms_user");
    localStorage.removeItem("lms_token");
    setUser(null);
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md py-2" : "bg-white/95 backdrop-blur-sm py-3"
      } border-b border-gray-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logoImage} alt="LearnMaster" className="h-14 w-auto" />
            <span className="text-xl font-bold text-slate-800">LearnMaster</span>
          </Link>

          {/* Desktop Menu Items (common) */}
          <div className="hidden md:flex items-center space-x-6 text-gray-700 font-medium">
            <Link to="/courses" className="hover:text-purple-600">Find Courses</Link>
            <Link to="/certification" className="hover:text-purple-600">Get Certified</Link>
            <Link to="/subscription" className="hover:text-purple-600">Subscribe</Link>
          </div>

          {/* Centered Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <div className="relative w-full group">
              <input
                type="text"
                placeholder="Search for anything..."
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
              <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition" />
            </div>
          </div>

          {/* Right side – changes based on login */}
          <div className="hidden md:flex items-center gap-5">
            <button className="text-gray-600 hover:text-purple-600 text-sm font-medium">Instructor</button>
            {user ? (
              <>
                <button className="relative text-gray-600 hover:text-purple-600">
                  <Heart size={20} />
                </button>
                <button className="relative text-gray-600 hover:text-purple-600">
                  <ShoppingCart size={20} />
                  <span className="absolute -top-1 -right-2 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
                </button>
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/student/dashboard")}>
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <User size={16} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name || "Student"}</span>
                </div>
                <button onClick={handleLogout} className="text-red-600 hover:text-red-700 text-sm font-medium">Logout</button>
              </>
            ) : (
              <>
                <button className="text-gray-600 hover:text-purple-600">
                  <Globe size={20} />
                </button>
                <button onClick={() => navigate("/login")} className="text-gray-700 hover:text-purple-600 font-medium">Log in</button>
                <button onClick={() => navigate("/register")} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm">Sign up</button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="md:hidden mt-4 pb-4 space-y-3">
            <div className="relative">
              <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50" />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex flex-col space-y-2">
              <Link to="/courses" className="py-2 text-gray-700">Find Courses</Link>
              <Link to="/certification" className="py-2 text-gray-700">Get Certified</Link>
              <Link to="/subscription" className="py-2 text-gray-700">Subscribe</Link>
              <button className="text-left py-2 text-gray-700">Instructor</button>
              {user ? (
                <>
                  <button onClick={() => navigate("/student/wishlist")} className="text-left py-2 text-gray-700">Wishlist</button>
                  <button onClick={() => navigate("/student/cart")} className="text-left py-2 text-gray-700">Cart</button>
                  <button onClick={() => navigate("/student/dashboard")} className="text-left py-2 text-gray-700">Dashboard</button>
                  <button onClick={handleLogout} className="text-left py-2 text-red-600">Logout</button>
                </>
              ) : (
                <div className="flex gap-4 pt-2">
                  <button onClick={() => navigate("/login")} className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg">Log in</button>
                  <button onClick={() => navigate("/register")} className="px-4 py-2 bg-purple-600 text-white rounded-lg">Sign up</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;