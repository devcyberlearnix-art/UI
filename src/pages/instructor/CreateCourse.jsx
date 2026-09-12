import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen, DollarSign, FileText, Tag, Loader2, CheckCircle, AlertCircle, ArrowLeft
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";

const CATEGORIES = ["Development", "Design", "Business", "Marketing", "Data Science", "Photography", "Music", "Other"];
const LEVELS     = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const instructorId = user?.id;

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Development",
    level: "Beginner",
    price: "",
    language: "English",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())       return setError("Title is required");
    if (!form.description.trim()) return setError("Description is required");
    if (Number(form.price) < 0)   return setError("Price must be 0 or greater");

    setLoading(true);
    setError("");
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description.trim(),
        category:    form.category,
        level:       form.level,
        price:       parseFloat(form.price) || 0,
        language:    form.language,
      };

      // POST /api/v1/instructors/{instructorId}/courses
      await instructorApi.createCourse(instructorId, payload);

      setSuccess(true);
      setTimeout(() => navigate("/instructor/my-courses"), 1200);
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