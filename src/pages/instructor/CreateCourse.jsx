import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Development",
    price: "",
    thumbnail: "",
    duration: "",
  });

  const instructorId = user?.id || user?.userId;

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price || 0),
        thumbnail: form.thumbnail,
        duration: form.duration,
      };

      await instructorApi.createCourse(payload, instructorId);
      navigate("/instructor/my-courses");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-r from-cyan-600 via-sky-500 to-orange-500 p-6 text-white shadow-xl mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Create New Course</h1>
        <p className="mt-1 text-cyan-50">Turn your expertise into a high-impact learning product.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Course Title</label>
          <input
            name="title"
            type="text"
            required
            value={form.title}
            onChange={updateField}
            className="w-full p-3 border border-slate-200 rounded-xl"
            placeholder="Master React with Real Projects"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            name="description"
            rows="4"
            required
            value={form.description}
            onChange={updateField}
            className="w-full p-3 border border-slate-200 rounded-xl"
            placeholder="What learners will build, learn, and achieve..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={updateField}
              className="w-full p-3 border border-slate-200 rounded-xl"
            >
              <option>Development</option>
              <option>Design</option>
              <option>Business</option>
              <option>Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price (USD)</label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
              value={form.price}
              onChange={updateField}
              className="w-full p-3 border border-slate-200 rounded-xl"
              placeholder="49.99"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
            <input
              name="duration"
              type="text"
              required
              value={form.duration}
              onChange={updateField}
              className="w-full p-3 border border-slate-200 rounded-xl"
              placeholder="20 hours"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL</label>
            <input
              name="thumbnail"
              type="text"
              value={form.thumbnail}
              onChange={updateField}
              className="w-full p-3 border border-slate-200 rounded-xl"
              placeholder="https://..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-cyan-600 text-white py-3 rounded-xl hover:bg-cyan-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles size={16} />}
          {submitting ? "Publishing..." : "Publish Course"}
        </button>
      </form>
    </motion.div>
  );
};

export default CreateCourse;
