import { motion } from "framer-motion";
import { Users, BookOpen, DollarSign, ShoppingCart, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const stats = [
  { title: "Total Users", value: "12,345", change: "+12%", icon: Users, color: "bg-blue-500" },
  { title: "Total Courses", value: "234", change: "+5%", icon: BookOpen, color: "bg-green-500" },
  { title: "Revenue", value: "$54,321", change: "+18%", icon: DollarSign, color: "bg-purple-500" },
  { title: "Orders", value: "1,234", change: "+8%", icon: ShoppingCart, color: "bg-orange-500" },
];

const enrollmentData = [
  { month: "Jan", enrollments: 120 },
  { month: "Feb", enrollments: 150 },
  { month: "Mar", enrollments: 180 },
  { month: "Apr", enrollments: 220 },
  { month: "May", enrollments: 270 },
  { month: "Jun", enrollments: 310 },
];

const categoryData = [
  { name: "Development", value: 35 },
  { name: "Design", value: 25 },
  { name: "Business", value: 20 },
  { name: "Marketing", value: 20 },
];
const COLORS = ["#f97316", "#8b5cf6", "#10b981", "#f59e0b"];

const recentOrders = [
  { id: "#ORD001", user: "John Doe", amount: 49, status: "completed", date: "2025-05-18" },
  { id: "#ORD002", user: "Jane Smith", amount: 79, status: "pending", date: "2025-05-17" },
  { id: "#ORD003", user: "Mike Johnson", amount: 39, status: "cancelled", date: "2025-05-16" },
];

const Dashboard = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
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
              <tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{order.id}</td>
                  <td className="px-6 py-4 text-sm">{order.user}</td>
                  <td className="px-6 py-4 text-sm">${order.amount}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${order.status === 'completed' ? 'bg-green-100 text-green-700' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{order.status}</span></td>
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