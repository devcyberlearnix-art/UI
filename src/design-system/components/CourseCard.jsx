import React from 'react';
import { motion } from 'framer-motion';
import { Heart, User, ShoppingCart, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentWishlist, useCourseWishlistCheck } from '../../hooks/useStudentData';
import { useCart } from '../../hooks/useCart';
import Badge from '../primitives/Badge';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

export function CourseCard({ course = {} }) {
  const navigate = useNavigate();
  const { toggleWishlist } = useStudentWishlist();
  const { cart, addToCart } = useCart();

  // Normalize inconsistent payload keys defensively to preserve model immunity
  const courseId = course.id || course.courseId;
  const title = course.title || course.courseName || 'Advanced Computing Spec';
  const price = Number(course.price || 0);
  const instructor = course.instructorName || course.instructor || 'Studio Principal Architect';
  const level = course.level || 'Masterclass';
  const imageUrl = course.imageUrl || course.thumbnailUrl || course.thumbnail || '/assets/dashboard-glow.webp';

  // ✅ Invokes the optimized backend checking endpoint (GET /api/v1/wishlist/check/{id})
  const { data: isWishlisted = false } = useCourseWishlistCheck(courseId);
  const isInCart = cart?.courses?.some(item => String(item.id) === String(courseId)) || false;

  const handleWishlistToggle = (e) => {
    e.stopPropagation(); // Avoid triggering full-card navigation events
    toggleWishlist({ courseId, isWishlisted });
  };

  const handleCartAction = (e) => {
    e.stopPropagation();
    if (isInCart) {
      navigate('/cart');
    } else {
      addToCart({ id: courseId, title, price, instructor });
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      onClick={() => navigate(`/courses/${courseId}`)}
      className="group rounded-2xl bg-[#0F0F13] border border-white/[0.04] hover:border-white/10 overflow-hidden flex flex-col h-full cursor-pointer transition-colors duration-300 relative select-none shadow-xl shadow-black/20"
    >
      
      {/* 1. Aspect-Ratio Locked Media Box */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#14141A] border-b border-white/[0.04]">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          onError={(e) => {
            e.target.src = '/assets/dashboard-glow.webp';
          }}
        />
        
        {/* Visual Level Pill Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="pewter" className="bg-[#070709]/80 border-white/5 backdrop-blur-md font-mono text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5">
            {level}
          </Badge>
        </div>

        {/* ⚡ High-Fidelity Optimistic Wishlist Toggle Action Node */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-xl bg-[#070709]/80 border border-white/5 backdrop-blur-md flex items-center justify-center text-[#8E8E93] hover:text-rose-400 transition-colors"
          aria-label={isWishlisted ? 'Remove blueprint from tracking list' : 'Save blueprint to registry'}
          aria-pressed={isWishlisted}
        >
          <Heart 
            size={14} 
            className={`transition-all duration-300 ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.3)]' : 'opacity-70'}`} 
          />
        </motion.button>
      </div>

      {/* 2. Structured Layout Metadata Typography Canvas */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Main Title Block */}
          <h4 className="text-xs font-bold text-[#F5F5F7] tracking-tight group-hover:text-[#C5A880] transition-colors line-clamp-2 leading-snug">
            {title}
          </h4>

          {/* Instructor Monospace Metric */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#8E8E93]">
            <User size={12} className="text-[#C5A880]/60 shrink-0" />
            <span className="truncate pr-2">Node: {instructor}</span>
          </div>
        </div>

        {/* 3. High-Density Operational Price & Cart Command Row */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-4 font-mono">
          <div className="space-y-0.5">
            <span className="block text-[8px] uppercase tracking-widest text-[#8E8E93] font-bold">Allocation Cost</span>
            <span className="text-sm font-black text-[#F5F5F7]">
              {price > 0 ? `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Free Tier'}
            </span>
          </div>

          {/* Adaptive Cart Transaction Pill */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCartAction}
            className={`h-8 px-3.5 rounded-xl border font-sans font-bold text-[10px] tracking-wide uppercase flex items-center gap-1.5 transition-all duration-300 ${
              isInCart
                ? 'bg-[#14141A] border-emerald-500/20 text-emerald-400 hover:border-emerald-400'
                : 'bg-[#C5A880] border-transparent text-[#070709] hover:bg-[#E5E5E7] shadow-md shadow-[#C5A880]/5'
            }`}
          >
            {isInCart ? (
              <>
                <Check size={11} className="stroke-[3px]" /> In Cart
              </>
            ) : (
              <>
                <ShoppingCart size={11} /> Mount
              </>
            )}
          </motion.button>
        </div>
      </div>

    </motion.div>
  );
}

export default CourseCard;
