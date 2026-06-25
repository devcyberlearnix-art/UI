import React from "react";
import { Bell, PlusCircle, User, Menu, DollarSign, Activity } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const InstructorNavbar = ({ setSidebarOpen, sidebarOpen }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 bg-white border-b px-6 py-3 flex justify-between items-center z-30 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group">
          <Menu size={20} className="text-gray-600 group-hover:text-indigo-600" />
        </button>
        <Link to="/instructor/create-course" className="hidden sm:flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all text-sm font-semibold shadow-lg shadow-indigo-100">
          <PlusCircle size={18} />
          Create Course
        </Link>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-6 mr-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign size={16} className="text-green-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Earnings</p>
              <p className="text-sm font-bold text-gray-800">$1,240.00</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Activity size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 leading-none">Active Students</p>
              <p className="text-sm font-bold text-gray-800">452</p>
            </div>
          </div>
        </div>

        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 cursor-pointer pl-4 border-l">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">{user?.name || "Instructor"}</p>
            <p className="text-xs text-indigo-600 font-medium">Instructor Panel</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            <User size={20} className="text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorNavbar;
