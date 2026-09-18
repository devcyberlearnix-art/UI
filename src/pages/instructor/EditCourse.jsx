import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, DollarSign, FileText, Tag, Loader2, CheckCircle, AlertCircle, ArrowLeft, Save
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";
import { courseApi } from "../../api/courseApi";
import toast from "react-hot-toast";

const CATEGORIES = ["Development", "Design", "Business", "Marketing", "Data Science", "Photography", "Music", "Other"];
const LEVELS     = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const EditCourse = () => {
  const { courseId } = useParams();
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

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Development",
    level: "Beginner",
    price: "",
    language: "English",
    status: "Published",
  });

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  // Load existing course data on mount
  useEffect(() => {
    const loadCourse = async () => {
      setFetching(true);
      setError("");

      // 1. Try local custom courses first for instant load
      const localCourses = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const localMatch = localCourses.find(c => String(c.id) === String(courseId) || String(c._id) === String(courseId) || String(c.courseId) === String(courseId));

      if (localMatch) {
        setForm({
          title: localMatch.title || "",
          description: localMatch.description || "",
          category: localMatch.category || "Development",
          level: localMatch.level || "Beginner",
          price: localMatch.price != null ? String(localMatch.price) : "",
          language: localMatch.language || "English",
          status: localMatch.status || "Published",
        });
        setFetching(false);
        return;
      }

      // 2. Try fetching from API
      try {
        const res = await instructorApi.getCourseById(instructorId, courseId);
        const data = res?.data || res;
        if (data) {
          setForm({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "Development",
            level: data.level || "Beginner",
            price: data.price != null ? String(data.price) : "",
            language: data.language || "English",
            status: data.status || "Published",
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load course");
      } finally {
        setFetching(false);
      }
    };

    if (courseId) loadCourse();
  }, [instructorId, courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())       return setError("Title is required");
    if (!form.description.trim()) return setError("Description is required");
    if (Number(form.price) < 0)   return setError("Price must be 0 or greater");

    setLoading(true);
    setError("");
    try {
      const payload = {
        price:       parseFloat(form.price) || 0,
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        level:       form.level,
        language:    form.language,
        status:      form.status,
      };

      // PUT /api/v1/courses/{courseId}
      let apiRes = null;
      try {
        apiRes = await courseApi.updateCourse(courseId, payload);
      } catch (courseErr) {
        try {
          apiRes = await instructorApi.updateCourse(instructorId, courseId, payload);
        } catch (apiErr) {
          console.warn("[EditCourse] API updateCourse failed/mock, updating locally", apiErr);
        }
      }

      // Update real-time local storage array `lms_custom_courses`
      const localCourses = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const updatedList = localCourses.map(c => {
        if (String(c.id) === String(courseId) || String(c._id) === String(courseId)) {
          return { ...c, ...payload, ...(apiRes && typeof apiRes === "object" ? apiRes : {}) };
        }
        return c;
      });
      localStorage.setItem("lms_custom_courses", JSON.stringify(updatedList));

      setSuccess(true);
      toast.success("Course updated successfully!");
      setTimeout(() => navigate("/instructor/my-courses"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  const handlePartialPatchPrice = async () => {
    if (Number(form.price) < 0) return setError("Price must be 0 or greater");
    setLoading(true);
    setError("");
    try {
      const patchData = { price: parseFloat(form.price) || 0 };
      await courseApi.patchCourse(courseId, patchData);

      const localCourses = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const updatedList = localCourses.map(c => {
        if (String(c.id) === String(courseId) || String(c._id) === String(courseId)) {
          return { ...c, ...patchData };
        }
        return c;
      });
      localStorage.setItem("lms_custom_courses", JSON.stringify(updatedList));

      setSuccess(true);
      toast.success(`Partial Update (PATCH /api/v1/courses/${courseId}) price updated to ₹${patchData.price}!`);
      setTimeout(() => navigate("/instructor/my-courses"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed partial update");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={36} className="animate-spin text-orange-500 mb-2" />
        <p className="text-sm text-gray-500">Loading course details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to My Courses
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Course</h1>
      <p className="text-sm text-gray-500 mb-6">Update course pricing, details, and settings</p>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
          <CheckCircle size={16} /> Course updated! Redirecting...
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            <BookOpen size={14} className="inline mr-1 text-orange-500" /> Course Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Advanced Java Programming"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            <FileText size={14} className="inline mr-1 text-orange-500" /> Description *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What will students learn?"
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm resize-none"
            required
          />
        </div>

        {/* Category + Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <Tag size={14} className="inline mr-1 text-orange-500" /> Category
            </label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Level</label>
            <select
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
            >
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Price + Language */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <DollarSign size={14} className="inline mr-1 text-orange-500" /> Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="e.g. 1299.99"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm font-semibold"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
            <select
              value={form.language}
              onChange={(e) => update("language", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
            >
              {["English", "Hindi", "Telugu", "Tamil", "Kannada"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg shadow-orange-100"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Saving Changes...</>
          ) : success ? (
            <><CheckCircle size={18} /> Updated!</>
          ) : (
            <><Save size={18} /> Save & Update Course</>
          )}
        </button>
      </motion.form>
    </div>
  );
};

export default EditCourse;
