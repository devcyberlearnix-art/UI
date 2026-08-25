// src/pages/admin/Dashboard.jsx
import { motion } from "framer-motion";
import { Users, BookOpen, DollarSign, ShoppingCart, TrendingUp, Shield } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const COLORS = ["#f97316", "#8b5cf6", "#10b981", "#f59e0b"];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const hasRedirected = useRef(false);

  // ✅ Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && !hasRedirected.current) {
      console.log('[Dashboard] Not authenticated, redirecting to login');
      hasRedirected.current = true;
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const userRole = user?.role || 'admin';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin' || userRole === 'MAIN_ADMIN' || userRole === 'superadmin';
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: "Total Users", value: "0", change: "+0%", icon: Users, color: "bg-blue-500" },
    { title: "Total Courses", value: "0", change: "+0%", icon: BookOpen, color: "bg-green-500" },
    { title: "Revenue", value: "$0", change: "+0%", icon: DollarSign, color: "bg-purple-500" },
    { title: "Orders", value: "0", change: "+0%", icon: ShoppingCart, color: "bg-orange-500" },
  ]);
  const [enrollmentData, setEnrollmentData] = useState([
    { month: "Jan", enrollments: 120 },
    { month: "Feb", enrollments: 150 },
    { month: "Mar", enrollments: 180 },
    { month: "Apr", enrollments: 220 },
    { month: "May", enrollments: 270 },
    { month: "Jun", enrollments: 310 },
  ]);
  const [categoryData, setCategoryData] = useState([
    { name: "Development", value: 35 },
    { name: "Design", value: 25 },
    { name: "Business", value: 20 },
    { name: "Marketing", value: 20 },
  ]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  console.log('[Dashboard] Rendering with user:', user);
  console.log('[Dashboard] User role:', userRole);
  console.log('[Dashboard] Is Super Admin:', isSuperAdmin);
  
  // Fetch dashboard data
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('[Dashboard] Fetching dashboard data...');
      
      // Try to fetch real data, but don't fail if it doesn't work
      try {
        const usersResponse = await adminApi.getDashboardStats?.users?.() || await adminApi.getAllUsers?.();
        if (usersResponse) {
          const usersCount = usersResponse?.count || usersResponse?.total || 
                            (Array.isArray(usersResponse) ? usersResponse.length : 0);
          setStats(prev => prev.map((stat, idx) => 
            idx === 0 ? { ...stat, value: usersCount.toLocaleString() || '0' } : stat
          ));
        }
      } catch (err) {
        console.log('[Dashboard] Users stats not available, using default');
      }
      
      try {
        const coursesResponse = await adminApi.getDashboardStats?.courses?.() || await adminApi.getAllCourses?.();
        if (coursesResponse) {
          const coursesCount = coursesResponse?.count || coursesResponse?.total || 
                              (Array.isArray(coursesResponse) ? coursesResponse.length : 0);
          setStats(prev => prev.map((stat, idx) => 
            idx === 1 ? { ...stat, value: coursesCount.toLocaleString() || '0' } : stat
          ));
        }
      } catch (err) {
        console.log('[Dashboard] Courses stats not available, using default');
      }
      
      try {
        const ordersResponse = await adminApi.getOrders?.();
        if (ordersResponse) {
          const ordersData = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse.data || [];
          const ordersCount = ordersData.length;
          const totalRevenue = ordersData.reduce((sum, order) => {
            const amount = order.amount || order.total || order.price || 0;
            return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
          }, 0);
          
          setStats(prev => prev.map((stat, idx) => 
            idx === 2 ? { ...stat, value: `$${totalRevenue.toLocaleString()}` } : 
            idx === 3 ? { ...stat, value: ordersCount.toLocaleString() } : stat
          ));
          
          setRecentOrders(ordersData.slice(0, 5).map(order => ({
            id: order.id || order.orderId || `#ORD${Date.now()}`,
            user: order.user?.name || order.customerName || order.userName || 'Unknown',
            amount: order.amount || order.total || order.price || 0,
            status: order.status || 'pending',
            date: order.createdAt || order.date || new Date().toISOString().split('T')[0]
          })));
        }
      } catch (err) {
        console.log('[Dashboard] Orders stats not available, using default');
      }
      
    } catch (error) {
      console.error('[Dashboard] Error fetching dashboard data:', error);
      // Don't show toast error for missing data - just use defaults
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // ✅ If not authenticated, return null (will redirect via useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // ✅ Show loading state while dashboard data is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">
            Welcome back, {user?.firstName || user?.name || 'Admin'}!
          </p>
          <p className="text-xs text-orange-500 font-medium mt-1">
            {isSuperAdmin ? '🔑 Super Admin' : '👤 Sub-Admin'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-green-500 mt-2 flex items-center gap-1"><TrendingUp size={12} />{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                <stat.icon size={24} className={`${stat.color} text-opacity-80`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Enrollment Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="enrollments" stroke="#f97316" fill="#fed7aa" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Course Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                {categoryData.map((entry, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No recent orders found
                  </td>
                </tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{order.id}</td>
                    <td className="px-6 py-4 text-sm">{order.user}</td>
                    <td className="px-6 py-4 text-sm">${order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'completed' || order.status === 'Completed' || order.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-700' 
                          : order.status === 'pending' || order.status === 'Pending' || order.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{order.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;