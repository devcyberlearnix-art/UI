import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, User, ShoppingCart, Check, Star, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentWishlist, useCourseWishlistCheck, useEnrolledCourses } from '../../hooks/useStudentData';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../context/AuthContext';
import { courseApi } from '../../api/courseApi';
import Badge from '../primitives/Badge';
import toast from 'react-hot-toast';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

const CURATED_COVERS = {
  cloud: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
  microservices: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  architecture: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  web: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  react: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
  ai: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
  security: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  data: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  devops: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
};

const resolveCoverImage = (category = '', title = '', rawUrl = '') => {
  if (rawUrl && typeof rawUrl === 'string' && !rawUrl.includes('dashboard-glow') && !rawUrl.includes('placehold.co') && rawUrl.startsWith('http')) {
    return rawUrl;
  }
  const key = `${category} ${title}`.toLowerCase();
  if (key.includes('microservice') || key.includes('distribut')) return CURATED_COVERS.microservices;
  if (key.includes('cloud') || key.includes('aws') || key.includes('azure')) return CURATED_COVERS.cloud;
  if (key.includes('react') || key.includes('frontend') || key.includes('javascript') || key.includes('web')) return CURATED_COVERS.web;
  if (key.includes('ai') || key.includes('llm') || key.includes('deep learning') || key.includes('gpt')) return CURATED_COVERS.ai;
  if (key.includes('security') || key.includes('cyber') || key.includes('rbac') || key.includes('penetration')) return CURATED_COVERS.security;
  if (key.includes('data') || key.includes('kafka') || key.includes('spark') || key.includes('sql')) return CURATED_COVERS.data;
  if (key.includes('devops') || key.includes('kubernetes') || key.includes('docker')) return CURATED_COVERS.devops;
  return CURATED_COVERS.default;
};

export const CourseCard = forwardRef(function CourseCard({ course = {} }, ref) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toggleWishlist } = useStudentWishlist();
  const { cart, addToCart } = useCart();
  const { data: enrolledCourses = [] } = useEnrolledCourses();
  const [enrollingFree, setEnrollingFree] = useState(false);

  // Normalize inconsistent payload keys defensively to preserve model immunity
  const courseId = course.id || course.courseId;
  const title = (course.title || course.courseName || 'Advanced Computing Spec')
    .replace(/^\[CYBERLEARNIX-SEED-[0-9]+\]\s*/i, '')
    .replace(/#\d+/g, '')
    .trim();
  const price = Number(course.price || 0);
  const instructor = (course.instructorName || course.instructor || 'Lead Architect').replace(/#\d+/g, '').trim();
  const level = (course.level || course.difficultyLevel || 'Advanced').toUpperCase();
  const category = course.category || course.categoryName || 'Engineering';
  const rating = Number(course.rating || course.avgRating || 4.5).toFixed(1);
  const duration = course.duration || course.estimatedDuration || '12 Weeks';
  const imageUrl = resolveCoverImage(category, title, course.imageUrl || course.thumbnailUrl || course.thumbnail);

  // Invokes the optimized backend checking endpoint (GET /api/v1/wishlist/check/{id})
  const { data: isWishlisted = false } = useCourseWishlistCheck(courseId);
  const isInCart = cart?.courses?.some(item => String(item.id) === String(courseId)) || false;
  const isEnrolled = isAuthenticated && Boolean(
    enrolledCourses?.some(item => String(item.id || item.courseId) === String(courseId))
  );

  const handleWishlistToggle = (e) => {
    e.stopPropagation(); // Avoid triggering full-card navigation events
    toggleWishlist({ courseId, isWishlisted });
  };

  const handleCartAction = async (e) => {
    e.stopPropagation();
    if (isEnrolled) {
      navigate(`/classroom/${courseId}`);
      return;
    }
    if (isInCart) {
      navigate('/cart');
      return;
    }
    if (price === 0) {
      if (!isAuthenticated) {
        navigate(`/register?redirect=/courses/${courseId}`);
        return;
      }
      try {
        setEnrollingFree(true);
        await courseApi.enrollCourse(courseId);
        toast.success(`Successfully enrolled in ${title}!`);
        navigate(`/classroom/${courseId}`);
      } catch (err) {
        toast.error(err?.response?.data?.message || err?.message || 'Free enrollment failed. Please retry.');
      } finally {
        setEnrollingFree(false);
      }
      return;
    }
    addToCart({ id: courseId, title, price, instructor });
  };

  return (
    <motion.div
      ref={ref}
      layout
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      onClick={() => navigate(`/courses/${courseId}`)}
      className="group rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57] dark:hover:border-[#D1A7CC]/30 overflow-hidden flex flex-col h-full cursor-pointer transition-all duration-300 relative select-none shadow-card hover:shadow-hover"
    >
      {/* 1. Aspect-Ratio Locked Media Box */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#EAE5DC] dark:bg-[#272523] border-b border-[#E3DCD3] dark:border-white/[0.06]">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = CURATED_COVERS.default;
          }}
        />
        
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-[#1D1C1A] via-transparent to-transparent pointer-events-none" />

        {/* Visual Level Pill Overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
          <Badge variant="pewter" className="bg-[#FFFEFA]/90 dark:bg-[#151413]/85 border border-[#E3DCD3] dark:border-white/10 backdrop-blur-md text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 text-[#282521] dark:text-[#EDE8E1] shadow-xs">
            {level}
          </Badge>
          {category && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#FFFEFA]/90 dark:bg-[#151413]/80 border border-[#E3DCD3] dark:border-white/5 backdrop-blur-md text-[9px] text-[#635E56] dark:text-[#A69F94] font-semibold truncate max-w-[100px] shadow-xs">
              {category}
            </span>
          )}
        </div>

        {/* Wishlist Toggle Button with accessible tooltip */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-xl bg-[#FFFEFA]/90 dark:bg-[#151413]/85 border border-[#E3DCD3] dark:border-white/10 backdrop-blur-md flex items-center justify-center text-[#827B71] dark:text-[#7A7368] hover:text-[#9B3835] transition-colors shadow-xs"
          title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          aria-label={isWishlisted ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
          aria-pressed={isWishlisted}
        >
          <Heart 
            size={14} 
            className={`transition-all duration-300 ${isWishlisted ? 'fill-[#9B3835] text-[#9B3835] scale-110' : 'opacity-70'}`} 
          />
        </motion.button>
      </div>

      {/* 2. Structured Layout Metadata Typography Canvas */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Main Title Block */}
          <h4 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight group-hover:text-[#5B3E57] dark:group-hover:text-[#D1A7CC] transition-colors line-clamp-2 leading-snug">
            {title}
          </h4>

          {/* Instructor & Rating Row */}
          <div className="flex items-center justify-between text-xs text-[#635E56] dark:text-[#A69F94]">
            <div className="flex items-center gap-1.5 truncate pr-2">
              <User size={13} className="text-[#5B3E57]/80 dark:text-[#D1A7CC]/70 shrink-0" />
              <span className="truncate text-[11px] font-medium text-[#635E56] dark:text-[#A69F94]">{instructor}</span>
            </div>
            {rating && (
              <div className="flex items-center gap-1 shrink-0 text-[#935E1E] font-semibold text-[11px]" title={`Course rating: ${rating} out of 5`}>
                <Star size={11} className="fill-[#935E1E] text-[#935E1E]" />
                <span>{rating}</span>
              </div>
            )}
          </div>

          {/* Duration / Lessons info */}
          <div className="flex items-center gap-2 text-[10px] text-[#827B71] dark:text-[#7A7368]">
            <Clock size={11} className="shrink-0" />
            <span>{duration}</span>
            <span>•</span>
            <span className="text-[#5B3E57] dark:text-[#D1A7CC]/90 font-medium">Hands-on Labs</span>
            <span>•</span>
            <span className="text-[#827B71] dark:text-[#7A7368]">Certificate</span>
          </div>
        </div>

        {/* 3. Operational Price & Cart Action Row */}
        <div className="pt-3 border-t border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="block text-[9px] uppercase tracking-wider text-[#827B71] dark:text-[#7A7368] font-semibold">Course Price</span>
            <span className="text-base font-extrabold text-[#282521] dark:text-[#EDE8E1]">
              {price > 0 ? `₹${price.toLocaleString('en-IN')}` : 'Free'}
            </span>
          </div>

          {/* Action Button: Enrolled / In Cart / Free / Add to Cart */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCartAction}
            disabled={enrollingFree}
            title={
              isEnrolled
                ? 'Open course workspace'
                : isInCart
                ? 'View course in cart'
                : price === 0
                ? 'Enroll in free course'
                : 'Add course to cart'
            }
            className={`h-8 px-3.5 rounded-xl border font-sans font-bold text-[11px] tracking-wide flex items-center gap-1.5 transition-all duration-300 cursor-pointer ${
              isEnrolled
                ? 'bg-[#EBF3EE] dark:bg-[#529E73]/15 border-[#B7D9C5] dark:border-[#529E73]/40 text-[#2B6747] dark:text-[#529E73] hover:bg-[#E0ECE4]'
                : isInCart
                ? 'bg-[#EBF3EE] dark:bg-[#529E73]/10 border-[#B7D9C5] dark:border-[#529E73]/30 text-[#2B6747] dark:text-[#529E73]'
                : price === 0
                ? 'bg-[#F2ECF1] dark:bg-[#1D1C1A] border-[#D5C0D1] dark:border-[#D1A7CC]/40 text-[#5B3E57] dark:text-[#D1A7CC] hover:bg-[#EAE5DC]'
                : 'bg-[#5B3E57] dark:bg-[#D1A7CC] border-transparent text-[#FFFEFA] dark:text-[#151413] hover:bg-[#462D42] dark:hover:bg-[#E0BFDC] shadow-xs'
            }`}
          >
            {isEnrolled ? (
              <>
                <Check size={12} className="stroke-[3px]" /> Start Learning
              </>
            ) : isInCart ? (
              <>
                <Check size={12} className="stroke-[3px]" /> In Cart
              </>
            ) : price === 0 ? (
              <>
                <BookOpen size={12} /> {enrollingFree ? 'Enrolling...' : 'Enroll Free'}
              </>
            ) : (
              <>
                <ShoppingCart size={12} /> Add to Cart
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard;
