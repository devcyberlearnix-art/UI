import React from "react";
import { Bell, Search, User, Menu, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const StudentNavbar = ({ setSidebarOpen, sidebarOpen }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b px-6 py-3 flex justify-between items-center z-30">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={20} className="text-gray-600" />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search for courses..." 
            className="pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-xl text-sm w-80 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
          <BookOpen size={16} className="text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-600">My Progress: 65%</span>
        </div>
        
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{user?.name || "Student"}</p>
            <p className="text-xs text-gray-500">Student Account</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-100">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentNavbar;
