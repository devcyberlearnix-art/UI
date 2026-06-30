import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Globe,
  Menu,
  X,
  Heart,
  User,
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // ---------- Update user from localStorage ----------
  const updateUser = () => {
    const storedUser = localStorage.getItem("lms_user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  };

  // ---------- Update cart count ----------
  const updateCartCount = () => {
    const cart = localStorage.getItem("lms_cart");
    const items = cart ? JSON.parse(cart) : [];
    const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    setCartCount(count);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    updateUser();
    updateCartCount();

    // Storage events (from other tabs)
    const handleStorage = (e) => {
      if (e.key === "lms_user") updateUser();
      if (e.key === "lms_cart") updateCartCount();
    };

    // Custom events (same tab)
    const handleCustomEvents = () => {
      updateUser();
      updateCartCount();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("userLoggedIn", handleCustomEvents);
    window.addEventListener("userLoggedOut", handleCustomEvents);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("userLoggedIn", handleCustomEvents);
      window.removeEventListener("userLoggedOut", handleCustomEvents);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("lms_user");
    localStorage.removeItem("lms_token");
    setUser(null);
    window.dispatchEvent(new Event("userLoggedOut"));
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
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-700">LearnMaster</span>
          </Link>

          {/* Desktop Menu Items */}
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

          {/* Right side */}
          <div className="hidden md:flex items-center gap-5">
            <button className="text-gray-600 hover:text-purple-600 text-sm font-medium">
              Instructor
            </button>

            {/* ✅ ALWAYS VISIBLE CART BUTTON (public) */}
            <button
              className="relative text-gray-600 hover:text-purple-600"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </button>

            {user ? (
              <>
                <button
                  className="relative text-gray-600 hover:text-purple-600"
                  onClick={() => navigate("/wishlist")}
                >
                  <Heart size={20} />
                </button>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate("/student/dashboard")}
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <User size={16} className="text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.name || "Student"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="text-gray-600 hover:text-purple-600">
                  <Globe size={20} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="text-gray-700 hover:text-purple-600 font-medium"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition shadow-sm"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pb-4 space-y-3"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <div className="flex flex-col space-y-2">
              <Link to="/courses" className="py-2 text-gray-700">
                Find Courses
              </Link>
              <Link to="/certification" className="py-2 text-gray-700">
                Get Certified
              </Link>
              <Link to="/subscription" className="py-2 text-gray-700">
                Subscribe
              </Link>
              <button className="text-left py-2 text-gray-700">Instructor</button>

              {/* ✅ Mobile cart also always visible */}
              <button
                onClick={() => navigate("/cart")}
                className="text-left py-2 text-gray-700 flex items-center gap-2"
              >
                <ShoppingCart size={16} />
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>

              {user ? (
                <>
                  <button
                    onClick={() => navigate("/wishlist")}
                    className="text-left py-2 text-gray-700"
                  >
                    Wishlist
                  </button>
                  <button
                    onClick={() => navigate("/student/dashboard")}
                    className="text-left py-2 text-gray-700"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-left py-2 text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                  >
                    Sign up
                  </button>
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