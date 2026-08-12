import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Loader2, Trash2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const Wishlist = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const loadWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/api/v1/wishlist");
      const payload = response.data?.data || response.data || [];
      const list = Array.isArray(payload) ? payload : payload.items || payload.wishlist || [];
      setItems(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load wishlist");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeItem = async (item) => {
    const id = item.id || item.courseId;
    if (!id) return;
    try {
      await axiosInstance.delete(`/api/v1/wishlist/${id}`);
      setItems((prev) => prev.filter((entry) => (entry.id || entry.courseId) !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to remove item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-3" />
          <p className="text-slate-500">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 p-6 text-white shadow-xl">
        <h1 className="text-2xl font-bold">Wishlist</h1>
        <p className="text-orange-50 mt-1">Your saved courses, ready when you are.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600">No courses in wishlist yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, idx) => {
            const title = item.title || item.courseName || "Untitled course";
            const instructor = item.instructor || item.instructorName || "Instructor";
            const price = item.price || item.amount || 0;
            return (
              <motion.div
                key={item.id || item.courseId || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{instructor}</p>
                    <p className="text-sm font-semibold text-orange-600 mt-2">${Number(price || 0).toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default Wishlist;