// src/pages/admin/SubDashboard.jsx
import { motion } from "framer-motion";
import { 
  Users, BookOpen, ShoppingCart, TrendingUp, 
  Clock, Calendar, Sparkles, GraduationCap, 
  Shield, BarChart3, UserCheck, DollarSign,
  Award, Bell, MessageSquare, Settings, Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";

const SubDashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    users: 0,
    courses: 0,
    orders: 0,
    revenue: 0
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Fetch dashboard data based on permissions
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const permissions = user?.permissions || [];
      
      // Fetch users if has permission
      if (permissions.includes('users:view')) {
        try {
          const usersResponse = await adminApi.getAllUsers();
          const usersCount = Array.isArray(usersResponse) ? usersResponse.length : 
                            usersResponse.data?.length || usersResponse.total || 0;
          setStatsData(prev => ({ ...prev, users: usersCount }));
        } catch (err) {
          console.error('[SubDashboard] Error fetching users:', err);
        }
      }

      // Fetch courses if has permission
      if (permissions.includes('courses:view')) {
        try {
          const coursesResponse = await adminApi.getAllCourses();
          const coursesCount = Array.isArray(coursesResponse) ? coursesResponse.length : 
                              coursesResponse.data?.length || coursesResponse.total || 0;
          setStatsData(prev => ({ ...prev, courses: coursesCount }));
        } catch (err) {
          console.error('[SubDashboard] Error fetching courses:', err);
        }
      }

      // Fetch orders if has permission
      if (permissions.includes('orders:view')) {
        try {
          const ordersResponse = await adminApi.getOrders();
          const ordersData = Array.isArray(ordersResponse) ? ordersResponse : 
                            ordersResponse.data || [];
          const ordersCount = ordersData.length;
          const totalRevenue = ordersData.reduce((sum, order) => {
            const amount = order.amount || order.total || order.price || 0;
            return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
          }, 0);
          setStatsData(prev => ({ ...prev, orders: ordersCount, revenue: totalRevenue }));
        } catch (err) {
          console.error('[SubDashboard] Error fetching orders:', err);
        }
      }
    } catch (error) {
      console.error('[SubDashboard] Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const userName = user?.displayName || user?.firstName || user?.name || 'Sub-Admin';
  const userInitial = userName?.charAt(0)?.toUpperCase() || 'S';
  const permissions = user?.permissions || [];

  // ✅ Check if user has specific permission
  const hasPermission = (permission) => {
    return permissions.includes(permission) || false;
  };

  // ✅ Stats based on permissions
  const stats = [];

  if (hasPermission('users:view')) {
    stats.push({ 
      title: "Total Users", 
      value: statsData.users.toLocaleString(), 
      icon: Users, 
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      iconBg: "bg-blue-100"
    });
  }

  if (hasPermission('courses:view')) {
    stats.push({ 
      title: "Total Courses", 
      value: statsData.courses.toLocaleString(), 
      icon: BookOpen, 
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      iconBg: "bg-green-100"
    });
  }

  if (hasPermission('orders:view')) {
    stats.push({ 
      title: "Total Orders", 
      value: statsData.orders.toLocaleString(), 
      icon: ShoppingCart, 
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      iconBg: "bg-orange-100"
    });
  }

  if (hasPermission('payments:view')) {
    stats.push({ 
      title: "Revenue", 
      value: `$${statsData.revenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      iconBg: "bg-purple-100"
    });
  }

  // ✅ Quick Actions based on permissions
  const quickActions = [];
  
  if (hasPermission('users:view')) {
    quickActions.push({ icon: Users, label: "Manage Users", color: "text-blue-500", bg: "bg-blue-50", path: "/admin/users" });
  }
  
  if (hasPermission('courses:view')) {
    quickActions.push({ icon: BookOpen, label: "Manage Courses", color: "text-green-500", bg: "bg-green-50", path: "/admin/courses" });
  }
  
  if (hasPermission('orders:view')) {
    quickActions.push({ icon: ShoppingCart, label: "View Orders", color: "text-orange-500", bg: "bg-orange-50", path: "/admin/orders" });
  }

  if (hasPermission('reports:view')) {
    quickActions.push({ icon: BarChart3, label: "View Reports", color: "text-purple-500", bg: "bg-purple-50", path: "/admin/reports" });
  }

  // ✅ Recent Activity (limited based on permissions)
  const recentActivities = [];

  if (hasPermission('users:view')) {
    recentActivities.push({ id: 1, action: "New user registered", time: "5 mins ago", icon: Users });
  }

  if (hasPermission('courses:view')) {
    recentActivities.push({ id: 2, action: "New course created", time: "1 hour ago", icon: BookOpen });
  }

  if (hasPermission('orders:view')) {
    recentActivities.push({ id: 3, action: "New order placed", time: "3 hours ago", icon: ShoppingCart });
  }

  if (recentActivities.length === 0) {
    recentActivities.push({ id: 4, action: "No recent activity", time: "Just now", icon: Clock });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-3xl p-8 shadow-2xl shadow-blue-500/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {userInitial}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {greeting}, {userName}! 🎉
              </h1>
              <p className="text-blue-100 text-sm">
                Welcome to your Sub-Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-blue-500/20 backdrop-blur rounded-xl text-white text-sm font-medium flex items-center gap-2">
              👤 Sub-Admin
            </span>
            <span className="px-4 py-2 bg-green-500/20 backdrop-blur rounded-xl text-green-100 text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Limited Access
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Only visible based on permissions */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium truncate">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-xl ${stat.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            <span className="text-xs text-blue-500 font-medium">Based on your permissions</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                onClick={() => window.location.href = action.path}
                className={`${action.bg} rounded-xl p-4 text-center hover:scale-105 transition-all duration-200 group`}
              >
                <action.icon className={`w-6 h-6 mx-auto mb-2 ${action.color} group-hover:rotate-6 transition-transform`} />
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h2>
          <span className="text-xs text-gray-400">Last 24 hours</span>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <activity.icon className="w-4 h-4 text-gray-500" />
                </div>
                <span className="text-sm text-gray-600">{activity.action}</span>
              </div>
              <span className="text-xs text-gray-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Permission Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Shield size={16} className="text-blue-500" />
          Your Permissions
        </h3>
        <div className="flex flex-wrap gap-2">
          {permissions.length > 0 ? (
            permissions.map((perm, index) => (
              <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                {perm.replace(':', ' → ')}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-400">No permissions assigned yet</span>
          )}
        </div>
      </motion.div>

      {/* Access Denied Note */}
      {stats.length === 0 && quickActions.length === 0 && (
        <div className="bg-yellow-50 rounded-2xl p-8 text-center border border-yellow-200">
          <div className="flex flex-col items-center">
            <Shield className="w-16 h-16 text-yellow-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700">Limited Access</h3>
            <p className="text-gray-500 text-sm max-w-sm mt-2">
              You don't have any permissions assigned yet. Please contact your Super Admin.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubDashboard;