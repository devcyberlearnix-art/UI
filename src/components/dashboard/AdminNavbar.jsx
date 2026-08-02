import React from "react";
import {
  Menu,
  Search,
  Bell,
  Mail,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminNavbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between">

      {/* Left */}
      <div className="flex items-center gap-5">

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-orange-50 transition"
        >
          <Menu size={20} />
        </button>

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h2>

          <p className="text-sm text-gray-500">
            Welcome back,
            <span className="font-semibold ml-1 text-orange-500">
              {user?.firstName || user?.name || "Admin"}
            </span>
          </p>
        </div>

      </div>

      {/* Search */}

      <div className="hidden lg:flex items-center w-[420px]">

        <div className="relative w-full">

          <Search
            size={18}
            className="absolute left-4 top-3 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search stock, orders, users..."
            className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 pl-11 pr-4 outline-none focus:ring-2 focus:ring-orange-400"
          />

        </div>

      </div>

      {/* Right */}

      <div className="flex items-center gap-4">

        <button className="relative w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50">

          <Mail size={18} />

          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center">
            4
          </span>

        </button>

        <button className="relative w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50">

          <Bell size={18} />

          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
            8
          </span>

        </button>

        <button className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-orange-50">

          <Settings size={18} />

        </button>

        <div className="h-8 border-l border-gray-300"></div>

        <div className="flex items-center gap-3 cursor-pointer">

          <img
            src={`https://ui-avatars.com/api/?name=${
              user?.name || "Admin"
            }&background=f97316&color=fff`}
            className="w-11 h-11 rounded-xl"
            alt=""
          />

          <div className="hidden md:block">

            <h4 className="text-sm font-bold text-gray-800">
              {user?.name || "Marcus George"}
            </h4>

            <p className="text-xs text-gray-500">
              Super Admin
            </p>

          </div>

          <ChevronDown
            size={18}
            className="text-gray-500"
          />

        </div>

      </div>

    </header>
  );
};

export default AdminNavbar;