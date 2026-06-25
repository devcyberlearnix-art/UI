import React from "react";
import { Bell, Shield, User, Menu, Settings, Database } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const AdminNavbar = ({ setSidebarOpen, sidebarOpen }) => {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 bg-slate-900 text-white px-6 py-3 flex justify-between items-center z-30 shadow-xl">
      <div className="flex items-center gap-4">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Menu size={20} className="text-slate-400" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500">Live System Monitor</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-4 mr-6">
          <div className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <Database size={16} />
            <span className="text-xs font-medium">Database: Healthy</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
            <Settings size={16} />
            <span className="text-xs font-medium">Settings</span>
          </div>
        </div>

        <button className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell size={20} className="text-slate-400" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900"></span>
        </button>

        <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{user?.name || "Admin"}</p>
            <div className="flex items-center gap-1 justify-end">
              <Shield size={10} className="text-blue-400" />
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">Super Admin</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-inner">
            <User size={20} className="text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;
