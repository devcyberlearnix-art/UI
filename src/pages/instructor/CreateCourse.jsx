import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, DollarSign, FileText, Tag, Loader2, CheckCircle, AlertCircle, ArrowLeft, Image as ImageIcon, Crown, Type, User
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";

const CATEGORIES = ["Development", "Design", "Business", "Marketing", "Data Science", "Photography", "Music", "Other"];
const LEVELS     = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const CreateCourse = () => {
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
    subtitle: "",
    description: "",
    category: "Development",
    level: "Beginner",
    price: "",
    language: "English",
    isPremium: false,
    thumbnail: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      update("thumbnail", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())       return setError("Title is required");
    if (!form.description.trim()) return setError("Description is required");
    if (Number(form.price) < 0)   return setError("Price must be 0 or greater");

    setLoading(true);
    setError("");
    try {
      const newId = "course_" + Date.now();
      const payload = {
        id:          newId,
        title:       form.title.trim(),
        subtitle:    form.subtitle.trim(),
        description: form.description.trim(),
        category:    form.category,
        level:       form.level,
        price:       parseFloat(form.price) || 0,
        language:    form.language,
        isPremium:   form.isPremium,
        status:      "Published",
        createdAt:   new Date().toLocaleDateString(),
        instructorId: instructorId,
        instructorName: user?.name || user?.firstName || storedUser?.name || "Instructor",
      };

      // 1. Send to API (if available)
      let apiResult = null;
      try {
        // Mocking formData if API accepts files, otherwise sending JSON
        // If we needed formData:
        // const formData = new FormData();
        // Object.keys(payload).forEach(k => formData.append(k, payload[k]));
        // if (form.thumbnail) formData.append("thumbnail", form.thumbnail);
        const res = await instructorApi.createCourse(instructorId, payload);
        apiResult = res?.data || res;
      } catch (apiErr) {
        console.warn("Backend API createCourse failed/mock, storing locally:", apiErr);
      }

      // Combine API result with form payload
      const courseToSave = {
        ...payload,
        thumbnailUrl: previewUrl, // Storing locally for demo
        ...(apiResult && typeof apiResult === "object" ? apiResult : {}),
        id: apiResult?.id || apiResult?._id || apiResult?.courseId || payload.id,
      };

      // 2. Persist in real-time local storage cache `lms_custom_courses`
      const existing = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const updatedList = [courseToSave, ...existing.filter(c => c.id !== courseToSave.id)];
      localStorage.setItem("lms_custom_courses", JSON.stringify(updatedList));

      setSuccess(true);
      setTimeout(() => navigate("/instructor/my-courses"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to My Courses
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Create New Course</h1>
      <p className="text-sm text-gray-500 mb-6">Fill in the details to publish a new course</p>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
          <CheckCircle size={16} /> Course created! Redirecting...
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5"
      >
        {/* Instructor ID (Read Only) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            <User size={14} className="inline mr-1" /> Instructor ID
          </label>
          <input
            type="text"
            value={instructorId}
            readOnly
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
          />
        </div>

        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            <ImageIcon size={14} className="inline mr-1" /> Course Thumbnail
          </label>
          <div className="flex items-center gap-4">
            <div className={`w-32 h-20 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${previewUrl ? 'border-orange-200' : 'border-gray-200 bg-gray-50'}`}>
              {previewUrl ? (
                <img src={previewUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={24} className="text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
              />
              <p className="text-xs text-gray-400 mt-2">Recommended size: 1280x720px (JPG, PNG)</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            <BookOpen size={14} className="inline mr-1" /> Course Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Advanced Java Programming"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
            required
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            <Type size={14} className="inline mr-1" /> Subtitle
          </label>
          <input
            type="text"
            value={form.subtitle}
            onChange={(e) => update("subtitle", e.target.value)}
            placeholder="A short catchy phrase describing the course"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            <FileText size={14} className="inline mr-1" /> Description *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What will students learn?"
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent text-sm resize-none"
            required
          />
        </div>

        {/* Category + Level */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              <Tag size={14} className="inline mr-1" /> Category
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
              <DollarSign size={14} className="inline mr-1" /> Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => update("price", e.target.value)}
              placeholder="0 for free"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm"
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

        {/* Premium Feature */}
        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl">
          <input
            type="checkbox"
            id="premium"
            checked={form.isPremium}
            onChange={(e) => update("isPremium", e.target.checked)}
            className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <label htmlFor="premium" className="flex items-center gap-2 text-sm font-semibold text-gray-800 cursor-pointer select-none">
            <Crown size={16} className="text-orange-500" /> Premium Course
            <span className="text-xs font-normal text-gray-500 hidden sm:inline">- Only accessible to premium subscribers</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || success}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Creating...</>
          ) : success ? (
            <><CheckCircle size={18} /> Created!</>
          ) : (
            <><BookOpen size={18} /> Publish Course</>
          )}
        </button>
      </motion.form>
    </div>
  );
};

export default CreateCourse;