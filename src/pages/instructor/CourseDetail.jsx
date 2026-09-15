import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, Users, Star, DollarSign, ArrowLeft, Loader2, AlertCircle,
  Edit, Trash2, Plus, PlayCircle, FileText, CheckCircle, RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";
import { courseApi } from "../../api/courseApi";

const CourseDetail = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const instructorId = user?.id;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchCourse = async () => {
    if (!courseId) return;
    setLoading(true);
    setError("");

    // 1. Check real-time local custom courses cache first
    const localCourses = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
    const localMatch = localCourses.find(c => String(c.id) === String(courseId) || String(c._id) === String(courseId) || String(c.courseId) === String(courseId));

    if (localMatch) {
      setCourse(localMatch);
      setLoading(false);
      return;
    }

    // 2. Fetch from GET /api/v1/courses/{courseId} API if not found locally
    try {
      const res = await courseApi.getCourseById(courseId);
      const data = res?.data || res;
      setCourse(data);
    } catch (err) {
      try {
        const res2 = await instructorApi.getCourseById(instructorId, courseId);
        const data2 = res2?.data || res2;
        setCourse(data2);
      } catch (err2) {
        setError(err.response?.data?.message || err.message || "Failed to load course details");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [instructorId, courseId]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${course?.title}"?`)) return;
    setDeleting(true);
    try {
      try {
        await instructorApi.deleteCourse(instructorId, courseId);
      } catch (e) {
        console.warn("[CourseDetail] API deleteCourse failed/mock, removing locally");
      }

      const localList = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const filtered = localList.filter(c => String(c.id) !== String(courseId));
      localStorage.setItem("lms_custom_courses", JSON.stringify(filtered));

      navigate("/instructor/my-courses");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete course");
      setDeleting(false);
    }
  };

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "published": return "bg-green-100 text-green-700 border-green-200";
      case "draft":     return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "archived":  return "bg-gray-100 text-gray-600 border-gray-200";
      default:          return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 size={36} className="animate-spin text-orange-500" />
        <p className="text-sm text-gray-500">Loading course details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <button
          onClick={() => navigate("/instructor/my-courses")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 mb-6 transition"
        >
          <ArrowLeft size={16} /> Back to My Courses
        </button>
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
          <AlertCircle size={24} className="shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-base">Unable to load course</h3>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchCourse}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate("/instructor/my-courses")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition"
        >
          <ArrowLeft size={16} /> Back to My Courses
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-sm font-semibold transition"
          >
            <Edit size={16} /> Edit Course
          </button>
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}/students`)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-semibold transition"
          >
            <Users size={16} /> Enrolled Students
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete Course
          </button>
        </div>
      </div>

      {/* Main Course Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6"
      >
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Course Thumbnail */}
          <div className="w-full md:w-72 h-48 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 border border-orange-100 flex items-center justify-center overflow-hidden shrink-0">
            {course?.thumbnail ? (
              <img src={course.thumbnail} alt={course?.title} className="w-full h-full object-cover" />
            ) : (
              <BookOpen size={56} className="text-orange-300" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColor(course?.status)}`}>
                {course?.status || "Published"}
              </span>
              {course?.category && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                  {course.category}
                </span>
              )}
              {course?.level && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-50 text-purple-600">
                  {course.level}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
            <p className="text-gray-600 text-sm leading-relaxed">{course?.description}</p>

            {/* Metrics Bar */}
            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <DollarSign size={18} className="text-orange-500" />
                <span className="font-bold text-lg text-gray-900">
                  {course?.price != null ? `₹${course.price}` : "Free"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={16} className="text-blue-500" />
                <span>{course?.enrolledCount ?? course?.enrolled ?? 0} Students</span>
              </div>
              {course?.rating != null && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-gray-900">{Number(course.rating).toFixed(1)}</span>
                </div>
              )}
              {course?.language && (
                <div className="flex items-center gap-1.5 text-gray-500">
                  <FileText size={16} className="text-gray-400" />
                  <span>{course.language}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Course Content / Lessons Section */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Course Syllabus & Lessons</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage lessons and modules for this course</p>
          </div>
        </div>

        {course?.lessons && course.lessons.length > 0 ? (
          <div className="space-y-3">
            {course.lessons.map((lesson, idx) => (
              <div
                key={lesson.id || idx}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50/50 rounded-2xl border border-gray-100 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{lesson.title}</h4>
                    {lesson.duration && (
                      <span className="text-xs text-gray-500">{lesson.duration}</span>
                    )}
                  </div>
                </div>
                <PlayCircle size={18} className="text-gray-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
            <PlayCircle size={36} className="mx-auto text-gray-300" />
            <p className="text-sm font-medium text-gray-600">No lessons created yet</p>
            <p className="text-xs text-gray-400">Add lessons to structure your course curriculum.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
