import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentWishlist } from '../../hooks/useStudentData';
import GlobalLayoutWrapper from '../../design-system/layout/GlobalLayoutWrapper';
import CourseCard from '../../design-system/components/CourseCard';
import { Skeleton } from '../../design-system/primitives/Skeleton';
import EmptyState from '../../design-system/feedback/EmptyState';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, isWishlistLoading } = useStudentWishlist();

  return (
    <GlobalLayoutWrapper showFooter={true}>
      <div className="space-y-6">
        
        {/* Fine-Bordered Header Rail */}
        <div className="border-b border-white/[0.04] pb-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(-1)} 
                className="p-1 rounded bg-[#14141A] border border-white/5 text-[#8E8E93] hover:text-[#F5F5F7] transition-colors"
              >
                <ArrowLeft size={14} />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
                Saved Course Blueprints
              </h1>
            </div>
            <p className="text-xs text-[#8E8E93] font-light">
              Your curated catalog matrix bookmarks synced down to active infrastructure nodes.
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-[#14141A] border border-white/5 font-mono text-[10px] text-[#C5A880] font-bold">
            💖 {wishlist.length} Monitored Tracks
          </div>
        </div>

        {/* Dynamic Hydration Matrix Gate */}
        <AnimatePresence mode="popLayout">
          {isWishlistLoading ? (
            /* Aspect-Locked Zero-CLS Shimmer Frame Grids */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 bg-[#0F0F13] border border-white/[0.04] rounded-2xl space-y-4">
                  <Skeleton className="aspect-video w-full rounded-xl bg-[#14141A]" />
                  <Skeleton className="h-4 w-2/3 bg-[#14141A]" />
                  <Skeleton className="h-3 w-full bg-[#14141A]" />
                </div>
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            /* Intentionally Bounded Clean Empty State */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12">
              <EmptyState 
                title="Wishlist Vault Clear"
                description="No architecture or engineering blueprints have been cataloged in this channel yet."
                actionLabel="Explore Core Catalog"
                onAction={() => navigate('/courses')}
              />
            </motion.div>
          ) : (
            /* Breathtaking High-Density Visual Grid Grid */
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {wishlist.map((course) => (
                <motion.div
                  key={course.id || course.courseId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={SPRING}
                >
                  {/* Reuse our standardized, verified premium course block layout card */}
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </GlobalLayoutWrapper>
  );
}