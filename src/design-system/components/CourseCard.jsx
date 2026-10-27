import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, Users, ArrowUpRight, Heart, Sparkles } from 'lucide-react';
import Badge from '../primitives/Badge';
import { useAuth } from '../../context/AuthContext';
import { wishlistApi } from '../../api/wishlistApi';
import toast from 'react-hot-toast';

export const CourseCard = ({ course, onWishlistToggle }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast('Sign in to save courses to your wishlist', { icon: '🔒' });
      navigate('/login');
      return;
    }
    setIsWishlistLoading(true);
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(course.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.addToWishlist(course.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
      if (onWishlistToggle) onWishlistToggle(course.id, !isWishlisted);
    } catch {
      toast.error('Failed to update wishlist');
    } finally {
      setIsWishlistLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl bg-glass-card border border-white/5 hover:border-brand-500/40 p-4 transition-all duration-300 cursor-pointer overflow-hidden shadow-elevated-sm hover:shadow-elevated-lg"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-ink-900 border border-white/5">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-900/60 via-ink-850 to-brand-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-300 mb-2">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-brand-300 tracking-wider uppercase">
              {course.category}
            </span>
          </div>
        )}

        {/* Floating Category & Level Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
          <Badge variant="brand">{course.category}</Badge>
          {course.badge && <Badge variant="cyan" dot>{course.badge}</Badge>}
        </div>

        {/* Wishlist Button with spring feedback */}
        <motion.button
          type="button"
          onClick={handleWishlist}
          disabled={isWishlistLoading}
          whileTap={{ scale: 0.85 }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
            isWishlisted
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              : 'bg-ink-950/60 text-white/70 hover:text-white border border-white/10 hover:border-white/20'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`}
          />
        </motion.button>
      </div>

      {/* Course Metadata Row */}
      <div className="flex items-center justify-between text-xs text-ink-400 pt-3">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-brand-accent" />
          {course.duration}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-brand-400" />
          {course.students.toLocaleString()} students
        </span>
        <span className="flex items-center gap-1 text-amber-300 font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {course.rating.toFixed(1)}
        </span>
      </div>

      {/* Course Title */}
      <h3 className="mt-2.5 text-base font-bold text-white tracking-tight line-clamp-2 group-hover:text-brand-300 transition-colors">
        {course.title}
      </h3>

      {/* Description */}
      <p className="mt-1 text-xs text-ink-400 line-clamp-2 leading-relaxed">
        {course.description}
      </p>

      {/* Card Footer with Instructor & Price */}
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-brand-accent flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
            {course.instructor.charAt(0)}
          </div>
          <span className="text-xs font-medium text-ink-300 truncate max-w-[110px]">
            {course.instructor}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-white">
            {course.price === 0 ? (
              <span className="text-emerald-400">Free</span>
            ) : (
              `$${course.price.toFixed(2)}`
            )}
          </span>

          <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-brand-600 text-white flex items-center justify-center transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
