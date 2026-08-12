import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, DollarSign, Loader2, Plus, Sparkles, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axiosInstance";

const InstructorDashboard = () => {
  const { user } = useAuth();
  const instructorId = user?.id || user?.userId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState({});
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!instructorId) {
        setLoading(false);
        setError("Instructor profile is not ready yet.");
        return;
      }

      setLoading(true);
      setError("");
      try {
        const [dashRes, coursesRes] = await Promise.all([
          axiosInstance.get(`/api/v1/instructors/${instructorId}/dashboard`),
          axiosInstance.get(`/api/v1/instructors/${instructorId}/courses`),
        ]);

        const dash = dashRes.data?.data || dashRes.data || {};
        const listRaw = coursesRes.data?.data || coursesRes.data || [];
        const list = Array.isArray(listRaw) ? listRaw : listRaw.courses || [];

        setDashboard(dash);
        setCourses(list);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load instructor dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [instructorId]);

  const stats = useMemo(
    () => [
      {
        label: "Courses",
        value: courses.length || dashboard.totalCourses || 0,
        icon: BookOpen,
      },
      {
        label: "Students",
        value: dashboard.totalStudents || dashboard.students || 0,
        icon: Users,
      },
      {
        label: "Revenue",
        value: `$${Number(dashboard.totalRevenue || 0).toLocaleString()}`,
        icon: DollarSign,
      },
    ],
    [courses.length, dashboard]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 p-6 text-white shadow-xl">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-indigo-100 text-sm">Instructor Workspace</p>
            <h1 className="text-2xl font-bold mt-1">Welcome, {user?.firstName || user?.name || "Instructor"}</h1>
            <p className="text-indigo-50 mt-1">Create courses, track students, and grow your teaching brand.</p>
          </div>
          <Link
            to="/instructor/create-course"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-indigo-700 px-4 py-2 font-semibold hover:bg-indigo-50 transition"
          >
            <Plus size={16} />
            New Course
          </Link>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <stat.icon className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="font-semibold text-slate-900">Recent Courses</h2>
        </div>
        {courses.length === 0 ? (
          <p className="text-slate-500 text-sm">No courses found yet. Create your first course to get started.</p>
        ) : (
          <div className="space-y-3">
            {courses.slice(0, 6).map((course, idx) => (
              <div key={course.id || course.courseId || idx} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{course.title || course.courseName || "Untitled course"}</p>
                  <p className="text-xs text-slate-500">{course.status || "DRAFT"}</p>
                </div>
                <span className="text-xs text-slate-500">{course.students || course.enrolledStudents || 0} students</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InstructorDashboard;