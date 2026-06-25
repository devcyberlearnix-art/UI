import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  IoSearchOutline, 
  IoHeartOutline, 
  IoCartOutline, 
  IoNotificationsOutline,
  IoChevronDownOutline,
  IoPersonOutline,
  IoPlayCircleOutline,
  IoSettingsOutline,
  IoLogOutOutline
} from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const UserNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 md:px-8 h-16 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-8">
        <Link to="/" className="text-2xl font-bold text-purple-700 tracking-tight">
          LearnMaster
        </Link>
        
        {/* Hidden on small screens */}
        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/courses" className="hover:text-purple-600 transition-colors">Find Courses</Link>
          <Link to="/certifications" className="hover:text-purple-600 transition-colors">Get Certified</Link>
          <Link to="/subscribe" className="hover:text-purple-600 transition-colors">Subscribe</Link>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-2xl mx-8 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IoSearchOutline className="text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent focus:bg-white transition-all"
            placeholder="Search for anything..."
          />
        </div>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-2 md:gap-5">
        <Link to="/student/my-learning" className="hidden xl:block text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors">
          My Learning
        </Link>
        
        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
          <IoHeartOutline size={24} />
        </button>
        
        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all relative">
          <IoCartOutline size={24} />
          <span className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
            0
          </span>
        </button>

        <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-all">
          <IoNotificationsOutline size={24} />
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded-full transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <IoChevronDownOutline className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} size={14} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white text-lg font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate w-32">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>

                  <div className="py-2">
                    <DropdownLink icon={<IoPersonOutline size={18}/>} text="My Profile" to="/student/profile" />
                    <DropdownLink icon={<IoPlayCircleOutline size={18}/>} text="My Courses" to="/student/my-learning" />
                    <DropdownLink icon={<IoHeartOutline size={18}/>} text="Wishlist" to="/student/wishlist" />
                    <DropdownLink icon={<IoSettingsOutline size={18}/>} text="Settings" to="/student/settings" />
                  </div>

                  <div className="py-2 border-t border-gray-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <IoLogOutOutline size={18} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

const DropdownLink = ({ icon, text, to }) => (
  <Link 
    to={to} 
    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
  >
    <span className="text-gray-400 group-hover:text-purple-600">{icon}</span>
    {text}
  </Link>
);

export default UserNavbar;
