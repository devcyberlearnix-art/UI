import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, User, LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    const storedUser = localStorage.getItem('lms_user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleStorage = () => {
      const updated = localStorage.getItem('lms_user');
      setUser(updated ? JSON.parse(updated) : null);
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_token');
    setUser(null);
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0f1c]/95 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg rounded-full"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">LearnMaster</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#courses" className="text-gray-300 hover:text-white transition relative group">Courses</a>
          <a href="#features" className="text-gray-300 hover:text-white transition relative group">Features</a>
          <a href="#testimonials" className="text-gray-300 hover:text-white transition relative group">Success Stories</a>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-white">{user.name || user.email?.split('@')[0]}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition">
                <LogOut size={16} />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="px-5 py-2 text-gray-300 hover:text-white transition">Sign In</button>
              <button onClick={() => navigate("/register")} className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-blue-500/40 transition">Get Started</button>
            </>
          )}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f1c] border-t border-white/10 p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <a href="#courses" className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Courses</a>
          <a href="#features" className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#testimonials" className="block text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>Success Stories</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
