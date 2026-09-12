import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit, Trash2, BookOpen, Users, Star,
  AlertCircle, Loader2, RefreshCw, DollarSign, Eye
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const instructorId = user?.id;

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchCourses = async () => {
    if (!instructorId) return;
    setLoading(true);
    setError("");
    try {
      const data = await instructorApi.getCourses(instructorId);
      // Handle both flat array and nested { data: [...] }
      const list = Array.isArray(data) ? data : (data?.data || data?.courses || []);
      setCourses(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [instructorId]);

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(courseId);
    try {
      await instructorApi.deleteCourse(instructorId, courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course");
    } finally {
      setDeletingId(null);
    }
  };

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "published": return "bg-green-100 text-green-700";
      case "draft":     return "bg-yellow-100 text-yellow-700";
      case "archived":  return "bg-gray-100 text-gray-600";
      default:          return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">Manage and track your published courses</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchCourses}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <Link
            to="/instructor/create-course"
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 font-semibold"
          >
            <Plus size={20} />
            Create Course
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-500" />
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative h-44 bg-gradient-to-br from-orange-50 to-amber-50">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen size={40} className="text-orange-200" />
                  </div>
                )}
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${statusColor(course.status)}`}>
                  {course.status || "Draft"}
                </span>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{course.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Users size={13} /> {course.enrolledCount ?? course.enrolled ?? 0} students
                  </span>
                  {course.rating != null && (
                    <span className="flex items-center gap-1">
                      <Star size={13} className="text-yellow-400 fill-yellow-400" />
                      {Number(course.rating).toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-semibold text-orange-600">
                    <DollarSign size={13} />
                    {course.price ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id, course.title)}
                      disabled={deletingId === course.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                      title="Delete"
                    >
                      {deletingId === course.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => navigate(`/instructor/courses/${course.id}/students`)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="View Students"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                  <Link
                    to={`/instructor/courses/${course.id}`}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {courses.length === 0 && (
            <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-8">Start your journey by creating your first course.</p>
              <Link
                to="/instructor/create-course"
                className="inline-flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-xl hover:bg-orange-600 transition"
              >
                <Plus size={20} /> Create Course
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
