import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Analytics = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [orderAnalytics, setOrderAnalytics] = useState([]);
  const [courseStats, setCourseStats] = useState({ totalCourses: 0, activeCourses: 0, topCategories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock data for other stats (you can replace with real APIs later)
  const userStats = { total: 12345, active: 9876, new: 345 };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch revenue reports
        const revenueRes = await fetch("https://matted-ascent-specimen.ngrok-free.dev/admin/reports/revenue", {
          headers: getAuthHeaders(),
        });
        if (!revenueRes.ok) throw new Error(await revenueRes.text());
        const revenueData = await revenueRes.json();
        setRevenueData(revenueData.revenue || revenueData);

        // Fetch order analytics
        const orderRes = await fetch("https://matted-ascent-specimen.ngrok-free.dev/admin/analytics/orders", {
          headers: getAuthHeaders(),
        });
        if (!orderRes.ok) throw new Error(await orderRes.text());
        const orderData = await orderRes.json();
        setOrderAnalytics(orderData.orders || orderData);

        // ✅ NEW: Fetch course statistics
        const courseRes = await fetch("https://matted-ascent-specimen.ngrok-free.dev/admin/reports/courses", {
          headers: getAuthHeaders(),
        });
        if (!courseRes.ok) throw new Error(await courseRes.text());
        const courseData = await courseRes.json();
        setCourseStats({
          totalCourses: courseData.totalCourses || 0,
          activeCourses: courseData.activeCourses || 0,
          topCategories: courseData.topCategories || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  // Colors for pie chart
  const COLORS = ["#f97316", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      {/* Stats Cards Row */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-gray-500">Total Users</p>
          <p className="text-3xl font-bold">{userStats.total.toLocaleString()}</p>
          <p className="text-green-500 text-sm">+{userStats.new} new</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-gray-500">Active Users</p>
          <p className="text-3xl font-bold">{userStats.active.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-gray-500">Total Courses</p>
          <p className="text-3xl font-bold">{courseStats.totalCourses}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-gray-500">Active Courses</p>
          <p className="text-3xl font-bold">{courseStats.activeCourses}</p>
        </div>
      </div>

      {/* Revenue & Orders Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Orders Analytics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderAnalytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 🆕 Course Statistics Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Course Categories Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseStats.topCategories}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="count"
                label
              >
                {courseStats.topCategories.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Course Enrollment Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Total Enrollments</span>
              <span className="font-bold">{courseStats.totalEnrollments || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Average Completion Rate</span>
              <span className="font-bold">{courseStats.avgCompletionRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Most Popular Category</span>
              <span className="font-bold">{courseStats.mostPopularCategory || "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Analytics;