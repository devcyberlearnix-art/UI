// src/pages/admin/Dashboard.jsx
import { motion } from "framer-motion";
import { Users, BookOpen, DollarSign, ShoppingCart, TrendingUp, Shield } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

const COLORS = ["#f97316", "#8b5cf6", "#10b981", "#f59e0b"];

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'admin';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: "Total Users", value: "0", change: "+0%", icon: Users, color: "bg-blue-500" },
    { title: "Total Courses", value: "0", change: "+0%", icon: BookOpen, color: "bg-green-500" },
    { title: "Revenue", value: "$0", change: "+0%", icon: DollarSign, color: "bg-purple-500" },
    { title: "Orders", value: "0", change: "+0%", icon: ShoppingCart, color: "bg-orange-500" },
  ]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  
  console.log('[Dashboard] Rendering with user:', user);
  console.log('[Dashboard] User role:', userRole);
  console.log('[Dashboard] Is Super Admin:', isSuperAdmin);
  
  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('[Dashboard] Fetching dashboard data from new endpoints...');
      
      // Fetch users count using new endpoint
      try {
        const usersResponse = await adminApi.getDashboardStats.users();
        console.log('[Dashboard] Users stats response:', usersResponse);
        const usersCount = usersResponse?.count || usersResponse?.total || usersResponse?.data?.count || 
                          Array.isArray(usersResponse) ? usersResponse.length : 0;
        setStats(prev => prev.map((stat, idx) => 
          idx === 0 ? { ...stat, value: usersCount.toLocaleString() } : stat
        ));
      } catch (err) {
        console.error('[Dashboard] Error fetching users stats:', err);
        // Fallback to old method
        try {
          const usersResponse = await adminApi.getAllUsers();
          const usersCount = Array.isArray(usersResponse) ? usersResponse.length : 
                            usersResponse.data?.length || usersResponse.total || 0;
          setStats(prev => prev.map((stat, idx) => 
            idx === 0 ? { ...stat, value: usersCount.toLocaleString() } : stat
          ));
        } catch (fallbackErr) {
          console.error('[Dashboard] Fallback also failed:', fallbackErr);
        }
      }
      
      // Fetch courses count using new endpoint
      try {
        const coursesResponse = await adminApi.getDashboardStats.courses();
        console.log('[Dashboard] Courses stats response:', coursesResponse);
        const coursesCount = coursesResponse?.count || coursesResponse?.total || coursesResponse?.data?.count || 
                           Array.isArray(coursesResponse) ? coursesResponse.length : 0;
        setStats(prev => prev.map((stat, idx) => 
          idx === 1 ? { ...stat, value: coursesCount.toLocaleString() } : stat
        ));
      } catch (err) {
        console.error('[Dashboard] Error fetching courses stats:', err);
        // Fallback to old method
        try {
          const coursesResponse = await adminApi.getAllCourses();
          const coursesCount = Array.isArray(coursesResponse) ? coursesResponse.length : 
                             coursesResponse.data?.length || coursesResponse.total || 0;
          setStats(prev => prev.map((stat, idx) => 
            idx === 1 ? { ...stat, value: coursesCount.toLocaleString() } : stat
          ));
        } catch (fallbackErr) {
          console.error('[Dashboard] Fallback also failed:', fallbackErr);
        }
      }
      
      // Fetch revenue using new endpoint
      try {
        const revenueResponse = await adminApi.getDashboardStats.revenue();
        console.log('[Dashboard] Revenue stats response:', revenueResponse);
        const totalRevenue = revenueResponse?.total || revenueResponse?.revenue || revenueResponse?.data?.total || 0;
        setStats(prev => prev.map((stat, idx) => 
          idx === 2 ? { ...stat, value: `$${totalRevenue.toLocaleString()}` } : stat
        ));
      } catch (err) {
        console.error('[Dashboard] Error fetching revenue stats:', err);
        // Fallback to orders calculation
        try {
          const ordersResponse = await adminApi.getOrders();
          const ordersData = Array.isArray(ordersResponse) ? ordersResponse : 
                            ordersResponse.data || [];
          const totalRevenue = ordersData.reduce((sum, order) => {
            const amount = order.amount || order.total || order.price || 0;
            return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
          }, 0);
          setStats(prev => prev.map((stat, idx) => 
            idx === 2 ? { ...stat, value: `$${totalRevenue.toLocaleString()}` } : stat
          ));
        } catch (fallbackErr) {
          console.error('[Dashboard] Fallback also failed:', fallbackErr);
        }
      }
      
      // Fetch orders count using new endpoint
      try {
        const ordersResponse = await adminApi.getDashboardStats.orders();
        console.log('[Dashboard] Orders stats response:', ordersResponse);
        const ordersCount = ordersResponse?.count || ordersResponse?.total || ordersResponse?.data?.count || 
                          Array.isArray(ordersResponse) ? ordersResponse.length : 0;
        setStats(prev => prev.map((stat, idx) => 
          idx === 3 ? { ...stat, value: ordersCount.toLocaleString() } : stat
        ));
      } catch (err) {
        console.error('[Dashboard] Error fetching orders stats:', err);
        // Fallback to old method
        try {
          const ordersResponse = await adminApi.getOrders();
          const ordersData = Array.isArray(ordersResponse) ? ordersResponse : 
                            ordersResponse.data || [];
          const ordersCount = ordersData.length;
          setStats(prev => prev.map((stat, idx) => 
            idx === 3 ? { ...stat, value: ordersCount.toLocaleString() } : stat
          ));
          
          // Set recent orders (last 5)
          setRecentOrders(ordersData.slice(0, 5).map(order => ({
            id: order.id || order.orderId || `#ORD${order.id || ''}`,
            user: order.user?.name || order.customerName || order.userName || 'Unknown',
            amount: order.amount || order.total || order.price || 0,
            status: order.status || 'pending',
            date: order.createdAt || order.date || new Date().toISOString().split('T')[0]
          })));
        } catch (fallbackErr) {
          console.error('[Dashboard] Fallback also failed:', fallbackErr);
        }
      }
      
      // Set mock enrollment data (can be replaced with real API)
      setEnrollmentData([
        { month: "Jan", enrollments: 120 },
        { month: "Feb", enrollments: 150 },
        { month: "Mar", enrollments: 180 },
        { month: "Apr", enrollments: 220 },
        { month: "May", enrollments: 270 },
        { month: "Jun", enrollments: 310 },
      ]);
      
      // Set mock category data (can be replaced with real API)
      setCategoryData([
        { name: "Development", value: 35 },
        { name: "Design", value: 25 },
        { name: "Business", value: 20 },
        { name: "Marketing", value: 20 },
      ]);
      
    } catch (error) {
      console.error('[Dashboard] Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
            {isSuperAdmin ? '' : '👤 Sub-Admin'}
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
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{order.id}</td>
                  <td className="px-6 py-4 text-sm">{order.user}</td>
                  <td className="px-6 py-4 text-sm">${order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : order.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;