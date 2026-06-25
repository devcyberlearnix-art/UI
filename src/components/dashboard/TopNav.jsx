import { Menu, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import RoleSwitcher from "../ui/RoleSwitcher";

const TopNav = ({ setSidebarOpen, sidebarOpen }) => {
  const { user, actingRole, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    switchRole(newRole);
    if (newRole === 'admin') navigate('/admin/dashboard');
    else if (newRole === 'instructor') navigate('/instructor/dashboard');
    else navigate('/student/dashboard');
  };

  // Show role switcher only when user is admin or instructor (original role)
  const showSwitcher = user && (user.role === 'admin' || user.role === 'instructor');

  return (
    <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={24} />
      </button>

      <div className="flex items-center gap-4">
        {showSwitcher && (
          <RoleSwitcher
            currentRole={actingRole}
            onRoleChange={handleRoleChange}
          />
        )}
        <Bell size={20} className="text-gray-500 hover:text-orange-600 cursor-pointer transition" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <User size={16} className="text-orange-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name || "User"}</span>
        </div>
      </div>
    </div>
  );
};

export default TopNav;