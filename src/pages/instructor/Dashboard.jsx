import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  DollarSign,
  Loader2,
  Plus,
  Star,
  Users,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowRight,
  BarChart3,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";
import { courseApi } from "../../api/courseApi";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const instructorId = user?.id || user?.userId || "me";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        // Load dashboard data
        const dashboardData = await instructorApi.getDashboard(instructorId);
        if (dashboardData?.data) {
          setDashboard(dashboardData.data);
        }

        // Load courses
        const coursesData = await instructorApi.getCourses(instructorId);
        const list = Array.isArray(coursesData) ? coursesData : coursesData?.data?.courses || coursesData?.courses || [];
        setCourses(list);

        // Load earnings
        try {
          const earningsData = await instructorApi.getEarnings(instructorId, { period: "month" });
          if (earningsData?.data) {
            setEarnings(earningsData.data);
          }
        } catch (earningsErr) {
          console.warn("[InstructorDashboard] Earnings fetch failed", earningsErr);
        }
      } catch (err) {
        console.error("[InstructorDashboard] Failed to load dashboard", err);
        setError(err.response?.data?.message || err.message || "Failed to load instructor dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [instructorId]);

  const stats = useMemo(() => [
    {
      label: "Total Courses",
      value: courses.length || dashboard?.totalCourses || 0,
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Total Students",
      value: dashboard?.totalStudents || dashboard?.students || 0,
      icon: Users,
      color: "from-violet-500 to-purple-500",
      bg: "bg-violet-50",
      text: "text-violet-600",
    },
    {
      label: "Total Revenue",
      value: `₹${Number(dashboard?.totalRevenue || earnings?.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "from-emerald-500 to-green-500",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Avg Rating",
      value: dashboard?.averageRating || "4.5",
      icon: Star,
      color: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
  ], [courses.length, dashboard, earnings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-indigo-500 w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 p-6 sm:p-8 text-white shadow-xl"
        >
          <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-1/4 h-52 w-52 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold">
                <GraduationCap size={14} />
                <span>Instructor Workspace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                Welcome, {user?.firstName || user?.name || "Instructor"}
              </h1>
              <p className="text-indigo-100 max-w-xl">
                Create courses, track students, and grow your teaching brand.
              </p>
            </div>

            <Link
              to="/instructor/create-course"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-700 font-bold hover:bg-indigo-50 transition shadow-lg"
            >
              <Plus size={18} />
              Create New Course
            </Link>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-700"
          >
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.text}`}>
                  <stat.icon size={20} />
                </div>
                <TrendingUp size={16} className="text-emerald-500" />
              </div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Courses */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h2 className="font-bold text-slate-900">My Courses</h2>
                </div>
                <Link
                  to="/instructor/my-courses"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              <div className="p-5">
                {courses.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                      <BookOpen size={32} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500">No courses yet</p>
                    <Link
                      to="/instructor/create-course"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                    >
                      <Plus size={16} />
                      Create Your First Course
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courses.slice(0, 5).map((course, idx) => (
                      <div
                        key={course.id || course.courseId || idx}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition border border-slate-100"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-lg">
                          {(course.title || course.courseName || "C").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {course.title || course.courseName || "Untitled Course"}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className={`px-2 py-0.5 rounded-full font-medium ${
                              course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            }`}>
                              {course.status || "DRAFT"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {course.students || course.enrolledStudents || 0} students
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">₹{(course.price || 0).toFixed(2)}</p>
                          <p className="text-xs text-slate-500">{course.rating?.toFixed(1) || "N/A"} ⭐</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Earnings & Analytics */}
          <div className="space-y-6">
            {/* Earnings Card */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Earnings</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200">
                  <p className="text-xs text-slate-600 mb-1">This Month</p>
                  <p className="text-2xl font-black text-emerald-700">
                    ₹{Number(earnings?.monthlyEarnings || 0).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                    <TrendingUp size={12} />
                    <span>+{earnings?.growth || 0}% from last month</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="text-lg font-bold text-slate-900">
                      ₹{Number(earnings?.totalEarnings || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50">
                    <p className="text-xs text-slate-500">Pending</p>
                    <p className="text-lg font-bold text-slate-900">
                      ₹{Number(earnings?.pendingEarnings || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900">Quick Actions</h2>
              </div>

              <div className="space-y-2">
                <Link
                  to="/instructor/create-course"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-slate-700"
                >
                  <Plus size={18} className="text-indigo-600" />
                  <span className="text-sm font-medium">Create New Course</span>
                </Link>
                <Link
                  to="/instructor/my-courses"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-slate-700"
                >
                  <BookOpen size={18} className="text-cyan-600" />
                  <span className="text-sm font-medium">Manage Courses</span>
                </Link>
                <Link
                  to="/instructor/analytics"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition text-slate-700"
                >
                  <TrendingUp size={18} className="text-emerald-600" />
                  <span className="text-sm font-medium">View Analytics</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-slate-900">Recent Activity</h2>
          </div>

          <div className="space-y-3">
            {dashboard?.recentActivities?.length > 0 ? (
              dashboard.recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className={`p-2 rounded-lg ${
                    activity.type === "enrollment" ? "bg-emerald-100 text-emerald-600" :
                    activity.type === "review" ? "bg-amber-100 text-amber-600" :
                    "bg-indigo-100 text-indigo-600"
                  }`}>
                    {activity.type === "enrollment" ? <Users size={16} /> :
                     activity.type === "review" ? <Star size={16} /> :
                     <CheckCircle2 size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{activity.message}</p>
                    <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
