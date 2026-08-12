import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, DollarSign, GraduationCap, Loader2, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

const Analytics = () => {
  const { user } = useAuth();
  const instructorId = user?.id || user?.userId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState({});
  const [earnings, setEarnings] = useState({});
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const load = async () => {
      if (!instructorId) {
        setLoading(false);
        setError("Instructor profile is not ready yet.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [dashRes, earningsRes, coursesRes] = await Promise.all([
          axiosInstance.get(`/api/v1/instructors/${instructorId}/dashboard`),
          axiosInstance.get(`/api/v1/instructors/${instructorId}/earnings`),
          axiosInstance.get(`/api/v1/instructors/${instructorId}/courses`),
        ]);

        const dash = dashRes.data?.data || dashRes.data || {};
        const earn = earningsRes.data?.data || earningsRes.data || {};
        const listRaw = coursesRes.data?.data || coursesRes.data || [];
        const list = Array.isArray(listRaw) ? listRaw : listRaw.courses || [];

        setDashboard(dash);
        setEarnings(earn);
        setCourses(list);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [instructorId]);

  const stats = useMemo(
    () => [
      {
        label: "Total Courses",
        value: courses.length || dashboard.totalCourses || 0,
        icon: GraduationCap,
      },
      {
        label: "Total Students",
        value: dashboard.totalStudents || dashboard.students || 0,
        icon: Users,
      },
      {
        label: "Revenue",
        value: `$${Number(earnings.totalRevenue || earnings.total || 0).toLocaleString()}`,
        icon: DollarSign,
      },
      {
        label: "Avg Rating",
        value: Number(dashboard.averageRating || dashboard.avgRating || 0).toFixed(1),
        icon: BarChart3,
      },
    ],
    [courses.length, dashboard, earnings]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-cyan-600 to-emerald-500 p-6 text-white shadow-xl">
        <h1 className="text-2xl font-bold">Instructor Analytics</h1>
        <p className="text-indigo-50 mt-1">Live performance insights from backend APIs.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <stat.icon className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Course Activity</h2>
        {courses.length === 0 ? (
          <p className="text-slate-500 text-sm">No courses available yet.</p>
        ) : (
          <div className="space-y-3">
            {courses.slice(0, 6).map((course, idx) => (
              <div key={course.id || course.courseId || idx} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                <span className="text-slate-700">{course.title || course.courseName || "Untitled course"}</span>
                <span className="text-slate-500">{course.students || course.enrolledStudents || 0} students</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Analytics;