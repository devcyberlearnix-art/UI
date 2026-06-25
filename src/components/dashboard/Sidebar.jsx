import { NavLink } from "react-router-dom";
import { Home, BookOpen, Heart, PlusCircle, BarChart3, Users, DollarSign, LogOut, Menu, LayoutDashboard, Award, Bell, Shield, HelpCircle, Globe, Settings, Sparkles, Trophy, Star } from "lucide-react";
import { getUser, logout } from "../../utils/auth";

const Sidebar = ({ open, setOpen }) => {
  const user = getUser();

  const studentLinks = [
    { to: "/student/dashboard", icon: Home, label: "Dashboard" },
    { to: "/student/my-learning", icon: BookOpen, label: "My Learning" },
    { to: "/student/wishlist", icon: Heart, label: "Wishlist" },
  ];

  const instructorLinks = [
    { to: "/instructor/dashboard", icon: Home, label: "Dashboard" },
    { to: "/instructor/create-course", icon: PlusCircle, label: "Create Course" },
    { to: "/instructor/my-courses", icon: BookOpen, label: "My Courses" },
    { to: "/instructor/analytics", icon: BarChart3, label: "Analytics" },
  ];

  const adminLinks = [
    { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/courses", icon: BookOpen, label: "Courses" },
    { to: "/admin/instructors", icon: Users, label: "Instructors" },
    { to: "/admin/orders", icon: DollarSign, label: "Orders" },
    { to: "/admin/payments", icon: DollarSign, label: "Payments" },
    { to: "/admin/reviews", icon: Star, label: "Reviews" },   // <-- NEW: Reviews page
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/admin/certificates", icon: Award, label: "Certificates" },
    { to: "/admin/notifications", icon: Bell, label: "Notifications" },
    { to: "/admin/moderation", icon: Shield, label: "Moderation" },
    { to: "/admin/support", icon: HelpCircle, label: "Support" },
    { to: "/admin/cms", icon: Globe, label: "CMS" },
    { to: "/admin/settings", icon: Settings, label: "Settings" },
    { to: "/admin/roles", icon: Shield, label: "Roles" },
    { to: "/admin/ai-features", icon: Sparkles, label: "AI Features" },
    { to: "/admin/gamification", icon: Trophy, label: "Gamification" },
  ];

  let links = [];
  if (user?.role === "student") links = studentLinks;
  else if (user?.role === "instructor") links = instructorLinks;
  else if (user?.role === "admin") links = adminLinks;

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-20 ${open ? "w-64" : "w-20"}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b flex justify-between items-center">
          <span className={`font-bold text-orange-600 ${!open && "hidden"}`}>LMS Portal</span>
          <button onClick={() => setOpen(!open)} className="p-1 rounded hover:bg-gray-100">
            <Menu size={20} />
          </button>
        </div>
        <nav className="flex-1 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition ${
                  isActive ? "bg-orange-50 text-orange-600 border-r-2 border-orange-600" : ""
                }`
              }
            >
              <link.icon size={20} />
              {open && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={logout} className="flex items-center gap-3 text-gray-600 hover:text-red-500 w-full">
            <LogOut size={20} />
            {open && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;