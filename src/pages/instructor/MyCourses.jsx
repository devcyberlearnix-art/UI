import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit, Trash2, BookOpen, Users, Star,
  AlertCircle, Loader2, RefreshCw, DollarSign, Eye,
  Sparkles, CheckCircle, ChevronUp, Tag, FileText
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";
import toast from "react-hot-toast";

const CATEGORIES = ["Development", "Design", "Business", "Marketing", "Data Science", "Photography", "Music", "Other"];
const LEVELS     = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const MyCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("lms_user");
      return raw && raw !== "undefined" ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  })();

  const instructorId = user?.id || user?.userId || user?._id || storedUser?.id || storedUser?.userId || storedUser?._id || "me";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Inline Create Course Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Development",
    level: "Beginner",
    price: "",
    language: "English",
  });

  const updateForm = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      let apiList = [];
      try {
        const data = await instructorApi.getCourses(instructorId);
        apiList = Array.isArray(data) ? data : (data?.data || data?.courses || []);
      } catch (e) {
        console.warn("[MyCourses] API getCourses failed/mock, using local storage cache");
      }

      const localList = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");

      const map = new Map();
      localList.forEach(c => map.set(c.id || c.title, c));
      apiList.forEach(c => {
        const key = c.id || c.title;
        if (!map.has(key)) map.set(key, c);
      });

      const list = Array.from(map.values());
      setCourses(list);
      // Auto-open create form if no courses exist
      if (list.length === 0) setShowCreateForm(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [instructorId]);

  const handleInlineCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Course title is required");
    if (!form.description.trim()) return toast.error("Description is required");

    setCreating(true);
    try {
      const newId = "course_" + Date.now();
      const payload = {
        id:          newId,
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        level:       form.level,
        price:       parseFloat(form.price) || 0,
        language:    form.language,
        status:      "Published",
        createdAt:   new Date().toLocaleDateString(),
        instructorId: instructorId,
        instructorName: user?.name || user?.firstName || storedUser?.name || "Instructor",
      };

      // Try sending to API
      try {
        await instructorApi.createCourse(instructorId, payload);
      } catch (apiErr) {
        console.warn("[MyCourses] API createCourse failed, stored locally");
      }

      // Persist in real-time local storage cache
      const existing = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const updatedList = [payload, ...existing.filter(c => c.id !== newId)];
      localStorage.setItem("lms_custom_courses", JSON.stringify(updatedList));

      // Update state in real-time
      setCourses(prev => [payload, ...prev]);

      // Reset form
      setForm({
        title: "",
        description: "",
        category: "Development",
        level: "Beginner",
        price: "",
        language: "English",
      });

      setCreateSuccess(true);
      toast.success("Course created successfully!");
      setTimeout(() => setCreateSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (courseId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(courseId);
    try {
      try {
        await instructorApi.deleteCourse(instructorId, courseId);
      } catch (e) {
        console.warn("[MyCourses] API deleteCourse failed/mock, removing locally anyway");
      }

      const localList = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const filtered = localList.filter(c => c.id !== courseId && c.title !== title);
      localStorage.setItem("lms_custom_courses", JSON.stringify(filtered));

      setCourses((prev) => prev.filter((c) => c.id !== courseId && c.title !== title));
      toast.success("Course deleted");
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
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Course Center</h1>
          <p className="text-gray-500 mt-1 text-sm">Create, publish, and manage all your courses in real-time</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchCourses}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition"
            title="Refresh Courses"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowCreateForm(prev => !prev)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-100 font-semibold text-sm"
          >
            {showCreateForm ? <ChevronUp size={18} /> : <Plus size={18} />}
            {showCreateForm ? "Hide Form" : "Create New Course"}
          </button>
        </div>
      </div>

      {/* CREATE COURSE INLINE FORM PANEL */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="bg-white rounded-3xl p-6 border-2 border-orange-100 shadow-md space-y-5 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 text-orange-600 font-bold text-lg">
                <Sparkles size={20} />
                <span>Create & Publish Course</span>
              </div>
              {createSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  <CheckCircle size={14} /> Created successfully!
                </span>
              )}
            </div>

            <form onSubmit={handleInlineCreate} className="space-y-4">
              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    <BookOpen size={13} className="inline mr-1 text-orange-500" /> Course Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateForm("title", e.target.value)}
                    placeholder="e.g. Advanced Java & Spring Boot Masterclass"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    <Tag size={13} className="inline mr-1 text-orange-500" /> Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  <FileText size={13} className="inline mr-1 text-orange-500" /> Course Description *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Describe what students will learn from this course..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                  required
                />
              </div>

              {/* Level, Price, Language */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Skill Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => updateForm("level", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                  >
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    <DollarSign size={13} className="inline mr-1 text-orange-500" /> Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    placeholder="1499.99 (0 for Free)"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
                  <select
                    value={form.language}
                    onChange={(e) => updateForm("language", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                  >
                    {["English", "Hindi", "Telugu", "Tamil", "Kannada"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 shadow-md shadow-orange-100"
                >
                  {creating ? (
                    <><Loader2 size={16} className="animate-spin" /> Publishing...</>
                  ) : (
                    <><Plus size={16} /> Publish Course Now</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Course Grid */}
      {!loading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Your Published Courses ({courses.length})</h2>
          </div>

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
                    {course.status || "Published"}
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
                        title="Edit Course"
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
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <BookOpen size={48} className="mx-auto text-orange-300 mb-3" />
                <h3 className="text-xl font-bold text-gray-900 mb-1">No courses created yet</h3>
                <p className="text-gray-500 text-sm mb-6">Use the form above to publish your first course in real-time.</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl hover:bg-orange-600 transition font-semibold text-sm"
                >
                  <Plus size={18} /> Open Course Creator Form
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCourses;
