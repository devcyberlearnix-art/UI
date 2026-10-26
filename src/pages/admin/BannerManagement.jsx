import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { courseApi } from "../../api/courseApi";
import { useAuth } from "../../context/AuthContext";

const BannerManagement = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    actionUrl: "",
    buttonText: "",
    position: "home",
    status: "active",
    startDate: "",
    endDate: "",
  });

  const [analytics, setAnalytics] = useState(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await courseApi.getBanners();
      if (Array.isArray(data?.data)) {
        setBanners(data.data);
      } else if (Array.isArray(data)) {
        setBanners(data);
      }

      // Fetch analytics
      try {
        const analyticsData = await courseApi.getBannerAnalytics();
        if (analyticsData?.data) {
          setAnalytics(analyticsData.data);
        }
      } catch (analyticsErr) {
        console.warn("[BannerManagement] Analytics fetch failed", analyticsErr);
      }
    } catch (err) {
      console.error("[BannerManagement] Failed to load banners", err);
      setError("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingBanner) {
        await courseApi.updateBanner(editingBanner.id, formData);
        toast.success("Banner updated!");
      } else {
        await courseApi.createBanner(formData);
        toast.success("Banner created!");
      }
      setShowForm(false);
      setEditingBanner(null);
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        actionUrl: "",
        buttonText: "",
        position: "home",
        status: "active",
        startDate: "",
        endDate: "",
      });
      await fetchBanners();
    } catch (err) {
      toast.error("Failed to save banner");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      actionUrl: banner.actionUrl || "",
      buttonText: banner.buttonText || "",
      position: banner.position || "home",
      status: banner.status || "active",
      startDate: banner.startDate || "",
      endDate: banner.endDate || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await courseApi.deleteBanner(bannerId);
      toast.success("Banner deleted!");
      await fetchBanners();
    } catch (err) {
      toast.error("Failed to delete banner");
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      const newStatus = banner.status === "active" ? "inactive" : "active";
      await courseApi.updateBanner(banner.id, { ...banner, status: newStatus });
      toast.success(`Banner ${newStatus === "active" ? "activated" : "deactivated"}!`);
      await fetchBanners();
    } catch (err) {
      toast.error("Failed to update banner status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-600">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Banner Management</h1>
              <p className="text-slate-500">
                Manage homepage and course promotion banners
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchBanners}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <RefreshCw size={18} />
              </button>

              <button
                onClick={() => {
                  setEditingBanner(null);
                  setFormData({
                    title: "",
                    description: "",
                    imageUrl: "",
                    actionUrl: "",
                    buttonText: "",
                    position: "home",
                    status: "active",
                    startDate: "",
                    endDate: "",
                  });
                  setShowForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition"
              >
                <Plus size={18} />
                Create Banner
              </button>
            </div>
          </div>
        </motion.div>

        {/* Analytics */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500">Total Views</p>
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics.totalViews || 0}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500">Clicks</p>
                <Users size={18} className="text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{analytics.totalClicks || 0}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500">CTR</p>
                <BarChart3 size={18} className="text-purple-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {analytics.totalViews ? ((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-500">Active Banners</p>
                <ImageIcon size={18} className="text-orange-500" />
              </div>
              <p className="text-2xl font-black text-slate-900">{banners.filter(b => b.status === "active").length}</p>
            </div>
          </motion.div>
        )}

        {/* Banner Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingBanner ? "Edit Banner" : "Create New Banner"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    >
                      <option value="home">Home Page</option>
                      <option value="course">Course Page</option>
                      <option value="sidebar">Sidebar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Action URL</label>
                    <input
                      type="url"
                      value={formData.actionUrl}
                      onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        {editingBanner ? "Update" : "Create"} Banner
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banners Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, idx) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              {/* Preview */}
              <div className="relative h-48 bg-slate-100">
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-slate-300" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                  banner.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {banner.status}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{banner.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{banner.description}</p>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <span className="px-2 py-1 rounded-full bg-slate-100">{banner.position}</span>
                  {banner.startDate && (
                    <span>{new Date(banner.startDate).toLocaleDateString()}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                    >
                      {banner.status === "active" ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {analytics?.bannerStats?.[banner.id] && (
                    <div className="text-xs text-slate-500">
                      {analytics.bannerStats[banner.id].views} views
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {banners.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <ImageIcon size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Banners Created</h3>
              <p className="text-slate-500 mb-6">Create your first banner to promote courses</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold hover:from-orange-600 hover:to-amber-600 transition"
              >
                <Plus size={18} className="inline mr-2" />
                Create Banner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
