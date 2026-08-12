import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Clock3, Loader2, PlayCircle } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const MyLearning = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadMyLearning = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get("/api/v1/orders");
        const payload = response.data?.data || response.data || [];
        const orders = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.orders)
          ? payload.orders
          : [];

        const normalized = orders.flatMap((order) => {
          const items = Array.isArray(order.items)
            ? order.items
            : Array.isArray(order.courses)
            ? order.courses
            : [];

          return items.map((item, index) => ({
            id: item.courseId || item.id || `${order.id || order.orderId}-${index}`,
            title: item.title || item.courseName || "Untitled course",
            instructor: item.instructor || item.instructorName || "Instructor",
            progress: Number(item.progress || 0),
            duration: item.duration || "Self-paced",
            thumbnail: item.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
          }));
        });

        const uniqueById = Array.from(new Map(normalized.map((item) => [item.id, item])).values());
        setCourses(uniqueById);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load your courses");
      } finally {
        setLoading(false);
      }
    };

    loadMyLearning();
  }, []);

  const completedCount = useMemo(
    () => courses.filter((course) => Number(course.progress) >= 100).length,
    [courses]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-slate-500">Loading your learning space...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-cyan-600 p-6 text-white shadow-xl">
        <h1 className="text-2xl font-bold">My Learning</h1>
        <p className="text-orange-50 mt-1">Track progress and jump back into your enrolled courses.</p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs text-orange-100">Enrolled</p>
            <p className="text-xl font-semibold">{courses.length}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <p className="text-xs text-orange-100">Completed</p>
            <p className="text-xl font-semibold">{completedCount}</p>
          </div>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>}

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No enrolled courses found yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course, idx) => (
            <motion.article
              key={course.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition"
            >
              <img src={course.thumbnail} alt={course.title} className="h-40 w-full object-cover" />
              <div className="p-4">
                <h2 className="font-semibold text-slate-900">{course.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{course.instructor}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><Clock3 size={14} />{course.duration}</span>
                  <span className="inline-flex items-center gap-1"><PlayCircle size={14} />{Math.min(100, Math.max(0, Number(course.progress) || 0))}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-cyan-500"
                    style={{ width: `${Math.min(100, Math.max(0, Number(course.progress) || 0))}%` }}
                  />
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default MyLearning;