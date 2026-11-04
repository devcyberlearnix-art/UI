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
        <div className="border-b border-[#E3DCD3] dark:border-white/[0.06] pb-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(-1)} 
                className="p-1.5 rounded-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/5 text-[#635E56] dark:text-[#A8A196] hover:text-[#282521] dark:hover:text-[#EDE8E1] transition-colors"
                title="Go back"
              >
                <ArrowLeft size={14} />
              </button>
              <h1 className="text-xl font-bold tracking-tight text-[#282521] dark:text-[#EDE8E1]">
                Saved Course Blueprints
              </h1>
            </div>
            <p className="text-xs text-[#635E56] dark:text-[#A8A196]">
              Your curated catalog matrix bookmarks synced down to active infrastructure nodes.
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 font-mono text-[10px] text-[#5B3E57] dark:text-[#D1A7CC] font-bold">
            💖 {wishlist.length} Monitored Tracks
          </div>
        </div>

        {/* Dynamic Hydration Matrix Gate */}
        <AnimatePresence mode="popLayout">
          {isWishlistLoading ? (
            /* Aspect-Locked Zero-CLS Shimmer Frame Grids */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="p-4 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] rounded-2xl space-y-4 shadow-sm">
                  <Skeleton className="aspect-video w-full rounded-xl bg-[#EAE5DC] dark:bg-[#151413]" />
                  <Skeleton className="h-4 w-2/3 bg-[#EAE5DC] dark:bg-[#151413]" />
                  <Skeleton className="h-3 w-full bg-[#EAE5DC] dark:bg-[#151413]" />
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
            /* High-Density Visual Grid */
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
