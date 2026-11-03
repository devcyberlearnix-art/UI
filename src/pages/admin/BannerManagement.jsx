import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Upload,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  Calendar,
  Check,
  AlertTriangle,
  Monitor,
  Smartphone
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/adminApi";
import { useAuth } from "../../context/AuthContext";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 26,
};

const TARGET_TYPES = [
  { value: "COURSE", label: "Direct Course" },
  { value: "CATEGORY", label: "Catalog Category" },
  { value: "EXTERNAL_URL", label: "External Link" },
  { value: "CUSTOM_PAGE", label: "Custom Page" },
];

const POSITIONS = [
  { value: "home", label: "Home Page Hero" },
  { value: "course", label: "Catalog Banner" },
  { value: "sidebar", label: "Sidebar Feature" },
];

const BannerManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'deleted'
  const [banners, setBanners] = useState([]);
  const [deletedBanners, setDeletedBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Modal & Edit state
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Preview Modal state
  const [previewBanner, setPreviewBanner] = useState(null);
  const [previewDevice, setPreviewDevice] = useState("desktop"); // 'desktop' | 'mobile'

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "",
    isDestructive: false,
    action: null,
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    mobileImageUrl: "",
    altText: "",
    actionUrl: "",
    buttonText: "",
    courseId: "",
    displayOrder: "",
    position: "home",
    status: "ACTIVE",
    targetType: "COURSE",
    startDate: "",
    endDate: "",
  });

  // Fetch all active banners
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAllBanners();
      let list = [];
      if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data)) {
        list = data;
      }
      setBanners(list);
    } catch (err) {
      console.error("[BannerManagement] Failed to load banners", err);
      toast.error("Failed to load active banners from backend");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch soft-deleted banners
  const fetchDeletedBanners = useCallback(async () => {
    try {
      const data = await adminApi.getDeletedBanners();
      let list = [];
      if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data)) {
        list = data;
      }
      setDeletedBanners(list);
    } catch (err) {
      console.warn("[BannerManagement] Soft-deleted banners fetch warning:", err?.message);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchDeletedBanners();
  }, [fetchBanners, fetchDeletedBanners]);

  // Telemetry Metrics Calculated 100% from Authoritative Backend Rows
  const telemetryStats = useMemo(() => {
    const totalImpressions = banners.reduce((sum, b) => sum + (Number(b.impressions) || 0), 0);
    const totalClicks = banners.reduce((sum, b) => sum + (Number(b.clicks) || 0), 0);
    const totalConversions = banners.reduce((sum, b) => sum + (Number(b.conversions) || 0), 0);
    const activeCount = banners.filter((b) => (b.status || "").toUpperCase() === "ACTIVE").length;
    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%" : "0.00%";
    return {
      totalImpressions,
      totalClicks,
      totalConversions,
      activeCount,
      avgCtr,
    };
  }, [banners]);

  // Handle Image Upload with Strict 16:9 & Size Validation
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Client-side preliminary checks
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid format. Please select JPG, PNG, or WebP.");
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error("File size exceeds 1MB limit. Please compress or choose a smaller image.");
      return;
    }

    setUploadingImage(true);
    const toastId = toast.loading("Validating image aspect ratio & dimensions...");

    try {
      // 2. Validate Image via Backend Validation Endpoint
      const valRes = await adminApi.validateBannerImage(file);
      const valData = valRes?.data || valRes;
      if (valData && valData.valid === false) {
        toast.error(valData.errorMessage || "Image validation failed. 16:9 ratio required.", { id: toastId });
        return;
      }

      // 3. Upload to Google Drive Storage
      toast.loading("Uploading verified asset to cloud storage...", { id: toastId });
      const upRes = await adminApi.uploadBannerImage(file, "desktop");
      const upData = upRes?.data || upRes;

      let uploadedUrl = upData?.desktopImageUrl || upData?.imageUrl || upData?.url || "";
      if (!uploadedUrl && typeof upData === "string") {
        uploadedUrl = upData;
      }

      if (uploadedUrl) {
        setFormData((prev) => ({
          ...prev,
          imageUrl: uploadedUrl,
          mobileImageUrl: upData?.mobileImageUrl || uploadedUrl,
        }));
        toast.success("Banner image validated and uploaded successfully!", { id: toastId });
      } else {
        toast.error("Upload succeeded but URL was empty. You can enter a direct image URL.", { id: toastId });
      }
    } catch (err) {
      console.error("[BannerManagement] Upload error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to process image upload.", { id: toastId });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Submit Create or Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a banner title.");
      return;
    }
    if (!formData.imageUrl.trim()) {
      toast.error("Please provide or upload a banner image URL.");
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(editingBanner ? "Updating banner..." : "Persisting new banner...");

    try {
      const normalizedCtaUrl = formData.actionUrl?.trim()
        ? formData.actionUrl.trim()
        : "/courses";

      const maxOrder = banners.length > 0
        ? Math.max(...banners.map((b) => Number(b.displayOrder) || 0))
        : 0;
      const computedDisplayOrder = formData.displayOrder
        ? Number(formData.displayOrder)
        : (editingBanner?.displayOrder || maxOrder + 1);

      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "Explore this specialized engineering curriculum.",
        imageUrl: formData.imageUrl.trim(),
        mobileImageUrl: formData.mobileImageUrl?.trim() || formData.imageUrl.trim(),
        altText: formData.altText?.trim() || formData.title.trim(),
        ctaText: formData.buttonText?.trim() || "Explore Curriculum",
        ctaUrl: normalizedCtaUrl,
        courseId: formData.courseId ? Number(formData.courseId) : null,
        displayOrder: computedDisplayOrder,
        status: (formData.status || "ACTIVE").toUpperCase(),
        targetType: formData.targetType || "COURSE",
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      if (editingBanner) {
        await adminApi.updateBanner(editingBanner.id, payload);
        toast.success("Banner updated and cache evicted!", { id: toastId });
      } else {
        await adminApi.createBanner(payload);
        toast.success("Banner created and published successfully!", { id: toastId });
      }

      setShowForm(false);
      setEditingBanner(null);
      resetFormData();
      await fetchBanners();
      await fetchDeletedBanners();
    } catch (err) {
      console.error("[BannerManagement] Save failed:", err);
      toast.error(err?.response?.data?.message || "Failed to persist banner.", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      mobileImageUrl: "",
      altText: "",
      actionUrl: "",
      buttonText: "",
      courseId: "",
      displayOrder: "",
      position: "home",
      status: "ACTIVE",
      targetType: "COURSE",
      startDate: "",
      endDate: "",
    });
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      description: banner.description || "",
      imageUrl: banner.imageUrl || "",
      mobileImageUrl: banner.mobileImageUrl || "",
      altText: banner.altText || "",
      actionUrl: banner.ctaUrl || banner.actionUrl || "",
      buttonText: banner.ctaText || banner.buttonText || "",
      courseId: banner.courseId || "",
      displayOrder: banner.displayOrder || "",
      position: banner.position || "home",
      status: (banner.status || "ACTIVE").toUpperCase(),
      targetType: banner.targetType || "COURSE",
      startDate: banner.startDate ? banner.startDate.slice(0, 10) : "",
      endDate: banner.endDate ? banner.endDate.slice(0, 10) : "",
    });
    setShowForm(true);
  };

  // Toggle Active / Inactive status
  const handleToggleStatus = async (banner) => {
    const isCurrentlyActive = (banner.status || "").toUpperCase() === "ACTIVE";
    const newStatus = isCurrentlyActive ? "INACTIVE" : "ACTIVE";
    const toastId = toast.loading(`Setting banner status to ${newStatus}...`);
    try {
      await adminApi.updateBannerStatus(banner.id, { status: newStatus });
      toast.success(`Banner status updated to ${newStatus}!`, { id: toastId });
      await fetchBanners();
    } catch (err) {
      console.error("[BannerManagement] Toggle status error:", err);
      toast.error("Failed to update banner status.", { id: toastId });
    }
  };

  // Soft-Delete Banner with Confirmation
  const requestDelete = (banner) => {
    setConfirmModal({
      isOpen: true,
      title: "Archive Banner",
      message: `Are you sure you want to soft-delete "${banner.title}"? It will be removed from the public storefront and can be restored at any time.`,
      confirmLabel: "Archive Banner",
      isDestructive: true,
      action: async () => {
        const toastId = toast.loading("Archiving banner...");
        try {
          await adminApi.deleteBanner(banner.id);
          toast.success("Banner archived successfully!", { id: toastId });
          await fetchBanners();
          await fetchDeletedBanners();
        } catch (err) {
          toast.error("Failed to archive banner.", { id: toastId });
        }
      },
    });
  };

  // Restore Soft-Deleted Banner
  const requestRestore = (banner) => {
    setConfirmModal({
      isOpen: true,
      title: "Restore Banner",
      message: `Restore "${banner.title}" back to active promotional showcase?`,
      confirmLabel: "Restore Banner",
      isDestructive: false,
      action: async () => {
        const toastId = toast.loading("Restoring banner...");
        try {
          await adminApi.restoreBanner(banner.id);
          toast.success("Banner restored to active catalog!", { id: toastId });
          await fetchBanners();
          await fetchDeletedBanners();
        } catch (err) {
          toast.error("Failed to restore banner.", { id: toastId });
        }
      },
    });
  };

  // Reorder Banners (Move Up / Down) with Atomic Backend Synchronization
  const handleReorder = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newOrder = [...banners];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    // Optimistically update UI
    setBanners(newOrder);

    try {
      const bannerOrders = newOrder.map((b, idx) => ({
        id: b.id,
        displayOrder: 901 + idx,
      }));

      await adminApi.reorderBanners({ banners: bannerOrders });
      toast.success("Banner display priority synchronized!");
    } catch (err) {
      console.error("[BannerManagement] Reorder failed:", err);
      toast.error("Failed to persist banner order on server.");
      await fetchBanners();
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] font-sans p-4 sm:p-6 lg:p-8 selection:bg-[#C5A880]/30 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── HEADER BANNER: OBSIDIAN LUXURY ────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0F0F13] p-6 sm:p-8 border border-white/[0.04] shadow-[0_12px_36px_-8px_rgba(0,0,0,0.85)]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141A] border border-white/[0.06] text-xs font-semibold text-[#C5A880]">
                <Layers size={13} className="text-[#C5A880]" />
                <span>Enterprise Marketing Telemetry • Admin Core</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F5F7]">
                Banner & Promotional Management
              </h1>
              <p className="text-xs sm:text-sm text-[#A1A1AA] max-w-xl">
                Configure hero promotional showcases, manage multi-device assets, schedule time-bounded campaigns, and track real-time conversion velocity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  fetchBanners();
                  fetchDeletedBanners();
                }}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14141A] hover:bg-[#1B1B24] border border-white/[0.06] text-[#F5F5F7] font-semibold text-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin text-[#C5A880]" : ""} />
                <span>Refresh Matrix</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingBanner(null);
                  resetFormData();
                  setShowForm(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#E5CCA8] text-[#070709] font-bold text-xs shadow-[0_0_20px_rgba(197,168,128,0.25)] hover:brightness-110 transition active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                <span>Create Banner</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── AUTHORITATIVE ANALYTICS TELEMETRY CARDS ───────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0F0F13] rounded-2xl border border-white/[0.04] p-5 space-y-2">
            <div className="flex items-center justify-between text-[#8E8E93]">
              <span className="text-xs font-semibold">Total Impressions</span>
              <div className="p-1.5 rounded-lg bg-[#14141A] text-emerald-400">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-2xl font-mono font-bold text-white">
              {telemetryStats.totalImpressions.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#71717A]">Verified viewport exposures</p>
          </div>

          <div className="bg-[#0F0F13] rounded-2xl border border-white/[0.04] p-5 space-y-2">
            <div className="flex items-center justify-between text-[#8E8E93]">
              <span className="text-xs font-semibold">CTA Clicks</span>
              <div className="p-1.5 rounded-lg bg-[#14141A] text-sky-400">
                <Users size={16} />
              </div>
            </div>
            <p className="text-2xl font-mono font-bold text-white">
              {telemetryStats.totalClicks.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#71717A]">Verified button interactions</p>
          </div>

          <div className="bg-[#0F0F13] rounded-2xl border border-white/[0.04] p-5 space-y-2">
            <div className="flex items-center justify-between text-[#8E8E93]">
              <span className="text-xs font-semibold">Click-Through Rate</span>
              <div className="p-1.5 rounded-lg bg-[#14141A] text-purple-400">
                <BarChart3 size={16} />
              </div>
            </div>
            <p className="text-2xl font-mono font-bold text-white">
              {telemetryStats.avgCtr}
            </p>
            <p className="text-[11px] text-[#71717A]">Aggregate CTR velocity</p>
          </div>

          <div className="bg-[#0F0F13] rounded-2xl border border-white/[0.04] p-5 space-y-2">
            <div className="flex items-center justify-between text-[#8E8E93]">
              <span className="text-xs font-semibold">Active Campaigns</span>
              <div className="p-1.5 rounded-lg bg-[#14141A] text-[#C5A880]">
                <Sparkles size={16} />
              </div>
            </div>
            <p className="text-2xl font-mono font-bold text-white">
              {telemetryStats.activeCount}
            </p>
            <p className="text-[11px] text-[#71717A]">Serving on public storefront</p>
          </div>
        </div>

        {/* ── TAB SELECTOR & CATALOG SCOPE ──────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#0F0F13] border border-white/[0.04]">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "active"
                  ? "bg-[#C5A880] text-[#070709] font-bold shadow-sm"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              Active Banners ({banners.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("deleted")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "deleted"
                  ? "bg-[#C5A880] text-[#070709] font-bold shadow-sm"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              Archived / Deleted ({deletedBanners.length})
            </button>
          </div>
        </div>

        {/* ── BANNER CREATE / EDIT MODAL DRAWER ─────────────────────────── */}
        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#282521]/45 dark:bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={SPRING_TRANSITION}
                className="w-full max-w-2xl bg-[#0F0F13] border border-white/[0.08] rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
              >
                {/* Fixed Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-white/[0.06] bg-[#0F0F13] flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {editingBanner ? "Edit Promotional Banner" : "Create Promotional Banner"}
                    </h2>
                    <p className="text-xs text-[#8E8E93]">
                      Authoritative persistence via Course Service on Port 8083
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="p-2 rounded-xl text-[#8E8E93] hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                  {/* Scrollable Form Body */}
                  <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {/* Title & Target Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        Banner Headline *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Master Distributed Systems with Go"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        Target Placement Type
                      </label>
                      <select
                        value={formData.targetType}
                        onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white outline-none focus:border-[#C5A880] transition cursor-pointer"
                      >
                        {TARGET_TYPES.map((t) => (
                          <option key={t.value} value={t.value} className="bg-[#14141A]">
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                      Sub-Headline / Campaign Synopsis
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={2}
                      placeholder="Brief overview explaining course outcome, credential level, or exclusive promotional tier..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 transition resize-none"
                    />
                  </div>

                  {/* Image Upload Zone & URL */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-[#A1A1AA]">
                      Banner Media (16:9 Aspect Ratio, JPG/PNG/WebP, max 1MB) *
                    </label>

                    {/* Drag & Drop Upload Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-white/[0.1] hover:border-[#C5A880]/50 rounded-2xl p-4 bg-[#14141A]/50 hover:bg-[#14141A] transition flex flex-col items-center justify-center gap-2 cursor-pointer group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleImageFileChange}
                      />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Loader2 size={24} className="animate-spin text-[#C5A880]" />
                          <span className="text-xs text-[#C5A880] font-semibold">
                            Validating dimensions & uploading to Cloud Storage...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="p-2.5 rounded-xl bg-[#0F0F13] border border-white/[0.04] text-[#C5A880] group-hover:scale-105 transition-transform">
                            <Upload size={18} />
                          </div>
                          <p className="text-xs text-[#F5F5F7] font-semibold">
                            Click to upload or drag & drop 16:9 banner
                          </p>
                          <p className="text-[10px] text-[#71717A]">
                            PNG, JPG, WebP up to 1MB (Enforces 16:9 aspect ratio and 800×450 minimum)
                          </p>
                        </>
                      )}
                    </div>

                    {/* Direct Image URL input */}
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Or enter direct image CDN URL: https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] transition"
                      required
                    />

                    {/* Live Preview */}
                    {formData.imageUrl && (
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/[0.06] bg-black">
                        <img
                          src={formData.imageUrl}
                          alt="Banner Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-md text-[10px] text-white">
                          Live 16:9 Preview
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Text & Action Route */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        CTA Button Label
                      </label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        placeholder="e.g. Explore Curriculum"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        CTA Destination Route / URL
                      </label>
                      <input
                        type="text"
                        value={formData.actionUrl}
                        onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                        placeholder="/courses/20 or /courses?search=backend"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] transition"
                      />
                    </div>
                  </div>

                  {/* Status & Display Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        Serving Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white outline-none focus:border-[#C5A880] transition cursor-pointer"
                      >
                        <option value="ACTIVE" className="bg-[#14141A]">
                          ACTIVE (Visible on Storefront)
                        </option>
                        <option value="INACTIVE" className="bg-[#14141A]">
                          INACTIVE (Draft / Unpublished)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        Associated Course ID (Optional)
                      </label>
                      <input
                        type="number"
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                        placeholder="e.g. 20"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] transition"
                      />
                    </div>
                  </div>

                  {/* Scheduling Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        Start Scheduling Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white outline-none focus:border-[#C5A880] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        Expiration Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-white outline-none focus:border-[#C5A880] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Fixed Footer Action Bar */}
                <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-white/[0.06] bg-[#0F0F13]/95 backdrop-blur-md flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#14141A] hover:bg-[#1B1B24] border border-white/[0.06] text-xs font-semibold text-[#A1A1AA] hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#E5CCA8] text-[#070709] font-bold text-xs shadow-md hover:brightness-110 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Persisting Banner...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>{editingBanner ? "Update Banner" : "Publish Banner"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── LIVE PREVIEW MODAL (DESKTOP & MOBILE) ─────────────────────── */}
        <AnimatePresence>
          {previewBanner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl bg-[#0F0F13] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">Live Storefront Preview</span>
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-[#14141A] border border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("desktop")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          previewDevice === "desktop" ? "bg-[#C5A880] text-[#070709] font-bold" : "text-[#8E8E93]"
                        }`}
                      >
                        <Monitor size={13} />
                        <span>Desktop</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice("mobile")}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          previewDevice === "mobile" ? "bg-[#C5A880] text-[#070709] font-bold" : "text-[#8E8E93]"
                        }`}
                      >
                        <Smartphone size={13} />
                        <span>Mobile</span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewBanner(null)}
                    className="p-1.5 rounded-xl text-[#8E8E93] hover:text-white hover:bg-white/[0.04] transition cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Device Frame */}
                <div className="flex justify-center py-4 bg-[#070709] rounded-2xl border border-white/[0.04] overflow-hidden">
                  <div
                    className={`relative overflow-hidden rounded-2xl bg-[#0F0F13] border border-white/[0.08] shadow-2xl transition-all duration-300 ${
                      previewDevice === "desktop" ? "w-full max-w-3xl aspect-[16/9]" : "w-[360px] aspect-[9/16] max-h-[500px]"
                    }`}
                  >
                    <img
                      src={previewDevice === "mobile" && previewBanner.mobileImageUrl ? previewBanner.mobileImageUrl : previewBanner.imageUrl}
                      alt={previewBanner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/80 to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-center space-y-3 max-w-md">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#14141A] border border-[#C5A880]/30 text-[10px] font-bold text-[#C5A880] uppercase w-fit">
                        {previewBanner.targetType || "Special Campaign"}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#F5F5F7] leading-tight">
                        {previewBanner.title}
                      </h2>
                      <p className="text-xs text-[#A1A1AA] line-clamp-3">
                        {previewBanner.description}
                      </p>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#E5CCA8] text-[#070709] font-bold text-xs shadow-md">
                          {previewBanner.ctaText || "Explore Curriculum"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setPreviewBanner(null)}
                    className="px-4 py-2 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs font-semibold text-white"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── DOUBLE CONFIRMATION MODAL ─────────────────────────────────── */}
        <AnimatePresence>
          {confirmModal.isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#282521]/45 dark:bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#0F0F13] border border-white/[0.08] rounded-3xl p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-2xl ${
                      confirmModal.isDestructive
                        ? "bg-rose-500/15 border border-rose-500/30 text-rose-400"
                        : "bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#C5A880]"
                    }`}
                  >
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{confirmModal.title}</h3>
                    <p className="text-xs text-[#8E8E93]">Admin Authoritative Operation</p>
                  </div>
                </div>

                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  {confirmModal.message}
                </p>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.04]">
                  <button
                    type="button"
                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                    className="px-4 py-2 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs font-semibold text-[#8E8E93] hover:text-white transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const act = confirmModal.action;
                      setConfirmModal({ ...confirmModal, isOpen: false });
                      if (act) await act();
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      confirmModal.isDestructive
                        ? "bg-rose-500 hover:bg-rose-600 text-white"
                        : "bg-[#C5A880] hover:bg-[#D4BC98] text-[#070709]"
                    }`}
                  >
                    {confirmModal.confirmLabel}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── BANNERS GRID: ACTIVE TAB ──────────────────────────────────── */}
        {activeTab === "active" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner, idx) => {
              const isActive = (banner.status || "").toUpperCase() === "ACTIVE";
              return (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="group relative rounded-2xl overflow-hidden bg-[#0F0F13] border border-white/[0.04] hover:border-[#C5A880]/30 transition-all shadow-sm flex flex-col justify-between"
                >
                  {/* 16:9 Image Frame */}
                  <div className="relative aspect-[16/9] w-full bg-[#14141A] overflow-hidden">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#71717A]">
                        <ImageIcon size={36} />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F13] via-transparent to-black/30" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-[#14141A]/80 backdrop-blur-md border border-white/[0.08] text-[10px] font-mono font-bold text-[#C5A880]">
                        #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-[#282521]/45 dark:bg-black/75 backdrop-blur-md border border-white/[0.08] text-[10px] font-semibold text-white uppercase">
                        {banner.targetType || "COURSE"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md ${
                          isActive
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {banner.status || "ACTIVE"}
                      </span>
                    </div>
                  </div>

                  {/* Information Body */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-[#C5A880] transition line-clamp-1">
                        {banner.title}
                      </h3>
                      <p className="text-xs text-[#8E8E93] line-clamp-2 mt-1">
                        {banner.description || "No campaign description registered."}
                      </p>
                    </div>

                    {/* Live Row Telemetry */}
                    <div className="pt-2 border-t border-white/[0.04] grid grid-cols-3 gap-2 text-[10px] font-mono text-[#71717A]">
                      <div>
                        <span className="block text-[#A1A1AA]">Views</span>
                        <span className="font-bold text-white">{Number(banner.impressions || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[#A1A1AA]">Clicks</span>
                        <span className="font-bold text-white">{Number(banner.clicks || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[#A1A1AA]">CTR</span>
                        <span className="font-bold text-white">
                          {banner.impressions > 0
                            ? (((banner.clicks || 0) / banner.impressions) * 100).toFixed(1) + "%"
                            : "0.0%"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Controls: Reorder, Preview, Status Toggle, Edit, Delete */}
                  <div className="px-4 py-3 bg-[#14141A]/50 border-t border-white/[0.04] flex items-center justify-between">
                    {/* Reordering Up / Down */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleReorder(idx, "up")}
                        title="Move Banner Up"
                        className="p-1.5 rounded-lg bg-[#0F0F13] border border-white/[0.04] text-[#8E8E93] hover:text-white disabled:opacity-30 disabled:hover:text-[#8E8E93] transition cursor-pointer"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === banners.length - 1}
                        onClick={() => handleReorder(idx, "down")}
                        title="Move Banner Down"
                        className="p-1.5 rounded-lg bg-[#0F0F13] border border-white/[0.04] text-[#8E8E93] hover:text-white disabled:opacity-30 disabled:hover:text-[#8E8E93] transition cursor-pointer"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      {/* Live Preview Button */}
                      <button
                        type="button"
                        onClick={() => setPreviewBanner(banner)}
                        title="Preview Banner"
                        className="p-1.5 rounded-lg bg-[#0F0F13] border border-white/[0.04] text-[#8E8E93] hover:text-white transition cursor-pointer"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Status Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(banner)}
                        title={isActive ? "Deactivate (Unpublish)" : "Activate (Publish)"}
                        className="p-1.5 rounded-lg bg-[#0F0F13] border border-white/[0.04] text-[#8E8E93] hover:text-[#C5A880] transition cursor-pointer"
                      >
                        {isActive ? <EyeOff size={14} /> : <CheckCircle2 size={14} className="text-emerald-400" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => handleEdit(banner)}
                        title="Edit Banner Payload"
                        className="p-1.5 rounded-lg bg-[#0F0F13] border border-white/[0.04] text-[#8E8E93] hover:text-white transition cursor-pointer"
                      >
                        <Edit size={14} />
                      </button>

                      {/* Archive / Delete Button */}
                      <button
                        type="button"
                        onClick={() => requestDelete(banner)}
                        title="Archive / Soft-Delete"
                        className="p-1.5 rounded-lg bg-[#0F0F13] border border-white/[0.04] text-[#8E8E93] hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {banners.length === 0 && !loading && (
              <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-white/[0.08] bg-[#0F0F13] p-8 space-y-3">
                <ImageIcon size={40} className="mx-auto text-[#71717A]" />
                <h3 className="text-sm font-bold text-white">No Active Banners Found</h3>
                <p className="text-xs text-[#8E8E93] max-w-md mx-auto">
                  No promotional banners are currently active in the database. Create a new campaign banner to display on the storefront hero.
                </p>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C5A880] text-[#070709] font-bold text-xs mt-2 cursor-pointer"
                >
                  <Plus size={14} /> Create First Banner
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── ARCHIVED / SOFT-DELETED BANNERS TAB ───────────────────────── */}
        {activeTab === "deleted" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deletedBanners.map((banner, idx) => (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="relative rounded-2xl overflow-hidden bg-[#0F0F13] border border-white/[0.04] opacity-80 hover:opacity-100 transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9] w-full bg-[#14141A] overflow-hidden grayscale">
                  {banner.imageUrl && (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-[#070709]/70 backdrop-blur-[2px]" />
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                    Archived
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-bold text-white line-clamp-1">{banner.title}</h3>
                  <p className="text-xs text-[#8E8E93] line-clamp-2">
                    {banner.description || "Archived banner snapshot."}
                  </p>
                </div>

                <div className="px-4 py-3 bg-[#14141A]/50 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-[11px] text-[#71717A] font-mono">
                    ID #{banner.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => requestRestore(banner)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C5A880]/15 hover:bg-[#C5A880]/30 border border-[#C5A880]/30 text-[#C5A880] text-xs font-bold transition cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Restore Banner</span>
                  </button>
                </div>
              </motion.div>
            ))}

            {deletedBanners.length === 0 && (
              <div className="col-span-full py-16 text-center rounded-3xl border border-dashed border-white/[0.08] bg-[#0F0F13] p-8 space-y-2">
                <Check size={36} className="mx-auto text-emerald-400" />
                <h3 className="text-sm font-bold text-white">No Archived Banners</h3>
                <p className="text-xs text-[#8E8E93]">
                  All promotional banners are currently active or unarchived.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManagement;
