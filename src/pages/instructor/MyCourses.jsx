import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Loader2, Plus, Star, Trash2, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";

const normalizeCourses = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.courses)
    ? payload.courses
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return list.map((course, idx) => ({
    id: String(course.id || course.courseId || course._id || idx),
    title: course.title || course.name || "Untitled course",
    thumbnail:
      course.thumbnailUrl ||
      course.thumbnail ||
      course.image ||
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000",
    price: Number(course.price || course.amount || 0),
    enrolled: Number(course.enrolled || course.enrolledCount || 0),
    rating: Number(course.rating || course.avgRating || 0),
    lessons: Number(course.lessons || course.lessonCount || 0),
    status: String(course.status || "draft"),
  }));
};

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const instructorId = user?.id || user?.userId;

  const loadCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await instructorApi.getCourses(instructorId);
      const payload = response?.data || response;
      setCourses(normalizeCourses(payload));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [instructorId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await instructorApi.deleteCourse(id, instructorId);
      setCourses((prev) => prev.filter((course) => String(course.id) !== String(id)));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to delete course");
    }
  };

  const stats = useMemo(() => {
    const totalStudents = courses.reduce((sum, c) => sum + c.enrolled, 0);
    const avgRating = courses.length
      ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
      : "0.0";
    return { totalCourses: courses.length, totalStudents, avgRating };
  }, [courses]);

  if (loading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-600 mx-auto mb-2" />
          <p className="text-slate-500">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto p-1">
      <div className="rounded-3xl bg-gradient-to-r from-cyan-600 via-sky-500 to-orange-500 p-7 text-white shadow-xl mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Courses</h1>
            <p className="text-cyan-50 mt-1">Publish, track, and scale your teaching impact.</p>
          </div>
          <Link
            to="/instructor/create-course"
            className="inline-flex items-center gap-2 bg-white/95 text-cyan-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-white transition"
          >
            <Plus size={18} />
            Create Course
          </Link>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total Courses</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalCourses}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Total Students</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Average Rating</p>
          <p className="text-2xl font-bold text-slate-900">{stats.avgRating}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-44">
              <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
              <div className="absolute top-3 right-3 bg-black/65 text-white text-xs px-2 py-1 rounded-full">
                {course.status}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 line-clamp-1">{course.title}</h3>
              <p className="text-cyan-700 font-bold mt-2">${course.price.toFixed(2)}</p>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Users size={14} /> {course.enrolled}
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500" /> {course.rating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={14} /> {course.lessons}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link to={`/course/${course.id}`} className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
                  View Details
                </Link>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {!courses.length && !error && (
        <div className="mt-8 text-center py-16 bg-white border border-dashed border-slate-300 rounded-3xl">
          <BookOpen size={42} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-xl font-semibold text-slate-900">No courses yet</h3>
          <p className="text-slate-500 mt-1 mb-5">Create your first course and start enrolling students.</p>
          <Link
            to="/instructor/create-course"
            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-2.5 rounded-xl hover:bg-cyan-700 transition"
          >
            <Plus size={18} /> Create Course
          </Link>
        </div>
      )}
    </motion.div>
  );
};

export default MyCourses;
