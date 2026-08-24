import {
  LayoutDashboard,
  Users,
  BookOpen,
  UserCog,
  ShoppingCart,
  CreditCard,
  Award,
  BarChart3,
  FileText,
  Star,
  Bell,
  Shield,
  HelpCircle,
  Globe,
  Settings,
  Sparkles,
  Trophy,
  User,
  UserCheck,
  GraduationCap,
  Heart,
} from "lucide-react";

const adminGroups = [
  {
    section: "Main",
    items: [{ path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" }],
  },
  {
    section: "Management",
    items: [
      { path: "/admin/users", icon: Users, label: "Users" },
      { path: "/admin/courses", icon: BookOpen, label: "Courses" },
      { path: "/admin/instructors", icon: UserCog, label: "Instructors" },
      { path: "/admin/instructor-applications", icon: UserCheck, label: "Applications" },
      { path: "/admin/admins", icon: Shield, label: "Admin Management" },
    ],
  },
  {
    section: "Commerce",
    items: [
      { path: "/admin/orders", icon: ShoppingCart, label: "Orders" },
      { path: "/admin/payments", icon: CreditCard, label: "Payments" },
      { path: "/admin/certificates", icon: Award, label: "Certificates" },
      { path: "/admin/reviews", icon: Star, label: "Reviews" },
    ],
  },
  {
    section: "Insights",
    items: [
      { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
      { path: "/admin/reports", icon: FileText, label: "Reports" },
      { path: "/admin/notifications", icon: Bell, label: "Notifications" },
    ],
  },
  {
    section: "System",
    items: [
      { path: "/admin/roles", icon: Shield, label: "Roles & Permissions" },
      { path: "/admin/moderation", icon: FileText, label: "Moderation" },
      { path: "/admin/support", icon: HelpCircle, label: "Support" },
      { path: "/admin/cms", icon: Globe, label: "CMS" },
      { path: "/admin/settings", icon: Settings, label: "Settings" },
      { path: "/admin/ai-features", icon: Sparkles, label: "AI Features" },
      { path: "/admin/gamification", icon: Trophy, label: "Gamification" },
      { path: "/admin/profile", icon: User, label: "Profile" },
    ],
  },
];

const instructorGroups = [
  {
    section: "Instructor",
    items: [
      { path: "/instructor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/instructor/create-course", icon: BookOpen, label: "Create Course" },
      { path: "/instructor/my-courses", icon: GraduationCap, label: "My Courses" },
      { path: "/instructor/analytics", icon: BarChart3, label: "Analytics" },
      { path: "/profile", icon: User, label: "My Profile" },
    ],
  },
];

const studentGroups = [
  {
    section: "Student",
    items: [
      { path: "/student/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/student/my-learning", icon: GraduationCap, label: "My Learning" },
      { path: "/student/wishlist", icon: Heart, label: "Wishlist" },
      { path: "/student/orders", icon: ShoppingCart, label: "Orders" },
      { path: "/cart", icon: ShoppingCart, label: "Cart" },
      { path: "/checkout", icon: CreditCard, label: "Checkout" },
      { path: "/profile", icon: User, label: "My Profile" },
    ],
  },
];

export const sidebarByRole = {
  admin: adminGroups,
  super_admin: adminGroups,
  sub_admin: adminGroups,
  instructor: instructorGroups,
  student: studentGroups,
};

export const tabsByRole = {
  admin: [
    {
      label: "Dashboard",
      match: ["/admin/dashboard", "/admin/sub-dashboard"],
      defaultPath: "/admin/dashboard",
      subtabs: [
        { label: "Overview", path: "/admin/dashboard" },
        { label: "Sub Dashboard", path: "/admin/sub-dashboard" },
      ],
    },
    {
      label: "Management",
      match: ["/admin/users", "/admin/courses", "/admin/instructors", "/admin/instructor-applications", "/admin/admins"],
      defaultPath: "/admin/users",
      subtabs: [
        { label: "Users", path: "/admin/users" },
        { label: "Courses", path: "/admin/courses" },
        { label: "Instructors", path: "/admin/instructors" },
        { label: "Applications", path: "/admin/instructor-applications" },
        { label: "Admins", path: "/admin/admins" },
      ],
    },
    {
      label: "Commerce",
      match: ["/admin/orders", "/admin/payments", "/admin/certificates", "/admin/reviews"],
      defaultPath: "/admin/orders",
      subtabs: [
        { label: "Orders", path: "/admin/orders" },
        { label: "Payments", path: "/admin/payments" },
        { label: "Certificates", path: "/admin/certificates" },
        { label: "Reviews", path: "/admin/reviews" },
      ],
    },
    {
      label: "Insights",
      match: ["/admin/analytics", "/admin/reports", "/admin/notifications"],
      defaultPath: "/admin/analytics",
      subtabs: [
        { label: "Analytics", path: "/admin/analytics" },
        { label: "Reports", path: "/admin/reports" },
        { label: "Notifications", path: "/admin/notifications" },
      ],
    },
    {
      label: "System",
      match: ["/admin/roles", "/admin/moderation", "/admin/support", "/admin/cms", "/admin/settings", "/admin/ai-features", "/admin/gamification", "/admin/profile"],
      defaultPath: "/admin/settings",
      subtabs: [
        { label: "Settings", path: "/admin/settings" },
        { label: "Roles", path: "/admin/roles" },
        { label: "Moderation", path: "/admin/moderation" },
        { label: "Support", path: "/admin/support" },
        { label: "CMS", path: "/admin/cms" },
        { label: "AI", path: "/admin/ai-features" },
        { label: "Gamification", path: "/admin/gamification" },
        { label: "Profile", path: "/admin/profile" },
      ],
    },
  ],
  instructor: [
    {
      label: "Workspace",
      match: ["/instructor/dashboard", "/instructor/create-course", "/instructor/my-courses", "/instructor/analytics", "/profile"],
      defaultPath: "/instructor/dashboard",
      subtabs: [
        { label: "Dashboard", path: "/instructor/dashboard" },
        { label: "Create", path: "/instructor/create-course" },
        { label: "My Courses", path: "/instructor/my-courses" },
        { label: "Analytics", path: "/instructor/analytics" },
        { label: "Profile", path: "/profile" },
      ],
    },
  ],
  student: [
    {
      label: "Learning",
      match: ["/student/dashboard", "/student/my-learning", "/student/wishlist", "/student/orders", "/cart", "/checkout", "/profile"],
      defaultPath: "/student/dashboard",
      subtabs: [
        { label: "Dashboard", path: "/student/dashboard" },
        { label: "My Learning", path: "/student/my-learning" },
        { label: "Wishlist", path: "/student/wishlist" },
        { label: "Orders", path: "/student/orders" },
        { label: "Cart", path: "/cart" },
        { label: "Profile", path: "/profile" },
      ],
    },
  ],
};

export const normalizeRole = (roleValue = "") => {
  const role = String(roleValue || "").trim().toLowerCase();
  if (!role) return "student";
  if (role.includes("super") || role.includes("main") || role.includes("admin")) return "admin";
  if (role.includes("subadmin") || role.includes("sub-admin") || role.includes("sub_admin") || role.includes("sub admin")) return "subadmin";
  if (role.includes("student")) return "student";
  if (role.includes("instructor")) return "instructor";
  return role;
};

export const getDashboardRole = (pathname, userRole) => {
  const normalizedRole = normalizeRole(userRole);

  if (pathname.startsWith("/admin")) {
    if (normalizedRole === "admin" || normalizedRole === "subadmin") return normalizedRole;
    return "admin";
  }
  if (pathname.startsWith("/instructor")) return "instructor";
  if (pathname.startsWith("/student") || pathname === "/cart" || pathname === "/checkout") return "student";
  return normalizedRole;
};
