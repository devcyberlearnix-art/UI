import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Layers, Tag, ExternalLink, Upload } from "lucide-react";
import { courseApi } from "../api/courseApi";
import { useAuth } from "../context/AuthContext";

const LUXURY_EASING = [0.16, 1, 0.3, 1];

export const BannerSlider = ({ onBannerLoaded }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "MAIN_ADMIN" || user?.role === "SUB_ADMIN" || user?.role === "ADMIN";
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const trackedImpressionsRef = useRef(new Set());

  // Fetch active banners from backend API
  const fetchActiveBanners = useCallback(async () => {
    try {
      setLoading(true);
      const res = await courseApi.getActiveBanners();
      let list = [];
      if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res)) {
        list = res;
      }
      setBanners(list);
      if (onBannerLoaded) onBannerLoaded(list);
    } catch (err) {
      console.warn("[BannerSlider] Failed to fetch active banners from backend:", err?.message || err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  }, [onBannerLoaded]);

  useEffect(() => {
    fetchActiveBanners();
  }, [fetchActiveBanners]);

  // Track impression for visible slide with remount and duplicate protection
  useEffect(() => {
    if (banners.length === 0) return;
    const currentBanner = banners[currentIndex];
    if (currentBanner && currentBanner.id && !trackedImpressionsRef.current.has(currentBanner.id)) {
      trackedImpressionsRef.current.add(currentBanner.id);
      courseApi.trackBannerImpression(currentBanner.id).catch(() => {});
    }
  }, [currentIndex, banners]);

  // Auto-rotation timer (pause on hover)
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners.length, isPaused]);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  // Handle CTA Click & Tracking
  const handleCtaClick = (e, banner) => {
    e?.stopPropagation();
    if (!banner) return;

    // Track click event in backend
    if (banner.id) {
      courseApi.trackBannerClick(banner.id).catch(() => {});
    }

    // Determine target destination
    const destination = banner.ctaUrl || (banner.courseId ? `/courses/${banner.courseId}` : "/courses");
    if (destination.startsWith("http://") || destination.startsWith("https://")) {
      window.open(destination, "_blank", "noopener,noreferrer");
    } else {
      navigate(destination);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[320px] sm:h-[400px] lg:h-[440px] rounded-3xl bg-[#0F0F13] border border-white/[0.04] flex items-center justify-center animate-pulse">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#C5A880] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#71717A]">Syncing promotional showcase...</span>
        </div>
      </div>
    );
  }

  // If no active banners exist, gracefully hide without breaking layout
  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <section
      aria-label="Promotional Showcase"
      className="relative w-full overflow-hidden rounded-3xl bg-[#0F0F13] border border-white/[0.06] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.85)] group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Admin Quick Action Pill */}
      {isAdmin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/admin/banners");
          }}
          className="absolute top-4 right-4 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F0F13]/80 hover:bg-[#14141A] border border-[#C5A880]/50 text-[#C5A880] text-[11px] font-semibold backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Upload size={12} className="text-[#C5A880]" />
          <span>Upload / Manage Banners</span>
        </button>
      )}

      <div className="relative w-full h-[360px] sm:h-[420px] lg:h-[480px]">
        {/* Animated Slide Canvas */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: LUXURY_EASING }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Responsive Background Media: Picture element for mobile vs desktop asset optimization */}
            <picture className="absolute inset-0 w-full h-full">
              {currentBanner.mobileImageUrl && (
                <source media="(max-width: 640px)" srcSet={currentBanner.mobileImageUrl} />
              )}
              <img
                src={currentBanner.imageUrl}
                alt={currentBanner.altText || currentBanner.title || "Promotional Banner"}
                className="w-full h-full object-cover object-center"
                loading="eager"
              />
            </picture>

            {/* Cinematic Gradient Masks: Assures 100% WCAG AAA Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#070709] via-[#070709]/85 sm:via-[#070709]/75 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-black/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#C5A880]/10 via-transparent to-transparent pointer-events-none" />

            {/* Slide Content Layer */}
            <div className="relative z-10 w-full h-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col justify-center">
              <div className="max-w-xl sm:max-w-2xl space-y-4">
                {/* Placement / Target Type Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141A]/90 border border-[#C5A880]/30 text-xs font-semibold text-[#C5A880] backdrop-blur-xl">
                  <Sparkles size={13} className="text-[#C5A880]" />
                  <span className="tracking-wider uppercase text-[10px] font-bold">
                    {currentBanner.targetType === "COURSE" ? "Featured Curriculum" : currentBanner.targetType || "Special Campaign"}
                  </span>
                </div>

                {/* Banner Headline */}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F5F5F7] tracking-tight leading-tight line-clamp-2">
                  {currentBanner.title}
                </h2>

                {/* Banner Description */}
                <p className="text-xs sm:text-sm text-[#A1A1AA] line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
                  {currentBanner.description}
                </p>

                {/* CTA Action Bar */}
                <div className="pt-2 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={(e) => handleCtaClick(e, currentBanner)}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#E5CCA8] text-[#070709] font-bold text-xs sm:text-sm shadow-[0_0_24px_rgba(197,168,128,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{currentBanner.ctaText || "Explore Curriculum"}</span>
                    <ArrowRight size={16} />
                  </button>

                  {currentBanner.courseId && (
                    <button
                      type="button"
                      onClick={() => navigate(`/courses/${currentBanner.courseId}`)}
                      className="hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#14141A]/80 hover:bg-[#1B1B24] border border-white/[0.08] text-[#F5F5F7] text-xs font-semibold transition active:scale-95 cursor-pointer"
                    >
                      <span>Syllabus & Specs</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous promotional slide"
              className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0F0F13]/70 hover:bg-[#14141A] border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer opacity-70 hover:opacity-100 group-hover:translate-x-0"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next promotional slide"
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#0F0F13]/70 hover:bg-[#14141A] border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90 cursor-pointer opacity-70 hover:opacity-100 group-hover:translate-x-0"
            >
              <ChevronRight size={20} />
            </button>

            {/* Slide Pagination Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F0F13]/80 border border-white/[0.06] backdrop-blur-md">
              {banners.map((b, idx) => (
                <button
                  key={b.id || idx}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? "w-6 bg-[#C5A880]"
                      : "w-2 bg-white/20 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default BannerSlider;
