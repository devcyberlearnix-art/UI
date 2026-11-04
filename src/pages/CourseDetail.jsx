import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  BookOpen,
  Clock,
  Users,
  Star,
  Award,
  CheckCircle2,
  Heart,
  Share2,
  ShoppingCart,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Target,
  HelpCircle,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { courseApi } from '../api/courseApi';
import { reviewApi } from '../api/reviewApi';
import { wishlistApi } from '../api/wishlistApi';
import { cartApi } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';
import Button from '../design-system/primitives/Button';
import Badge from '../design-system/primitives/Badge';
import { Skeleton } from '../design-system/primitives/Skeleton';
import { resolveCoverImage } from '../design-system/components/CourseCard';

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

export const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('curriculum');
  const [expandedSections, setExpandedSections] = useState({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch comprehensive course details
  const fetchCourseDetails = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const detailsData = await courseApi.getCourseDetails(courseId);
      let fetchedCurriculum = null;
      let fetchedRatingSummary = null;

      if (detailsData?.data) {
        setCourse(detailsData.data.courseInfo);
        fetchedCurriculum = detailsData.data.curriculum;
        setCurriculum(fetchedCurriculum);
        setEnrollmentStatus(detailsData.data.enrollmentStatus);
        fetchedRatingSummary = detailsData.data.ratingSummary;
        setRatingSummary(fetchedRatingSummary);
      }

      if (!fetchedCurriculum) {
        const curriculumData = await courseApi.getCourseCurriculum(courseId);
        if (curriculumData?.data) {
          setCurriculum(curriculumData.data);
        }
      }

      const reqData = await courseApi.getCourseRequirements(courseId);
      if (reqData?.data) {
        setRequirements(reqData.data);
      }

      const outcomesData = await courseApi.getLearningOutcomes(courseId);
      if (outcomesData?.data) {
        setOutcomes(outcomesData);
      }

      const materialsData = await courseApi.getCourseMaterials(courseId);
      setMaterials(Array.isArray(materialsData?.data) ? materialsData.data : (Array.isArray(materialsData) ? materialsData : []));

      const faqsData = await courseApi.getCourseFAQs(courseId);
      setFaqs(Array.isArray(faqsData?.data) ? faqsData.data : (Array.isArray(faqsData) ? faqsData : []));

      const reviewsData = await reviewApi.getCourseReviews(courseId, { page: 0, size: 10 });
      if (reviewsData?.content) {
        setReviews(reviewsData.content);
      }

      if (!fetchedRatingSummary) {
        const summaryData = await reviewApi.getRatingSummary(courseId);
        if (summaryData) {
          setRatingSummary(summaryData);
        }
      }

      if (user) {
        try {
          const wishlistData = await wishlistApi.checkWishlist(courseId);
          setIsWishlisted(wishlistData?.data?.isInWishlist || false);
        } catch (err) {
          // Non-critical
        }
      }
    } catch (err) {
      console.error('[CourseDetail] Failed to fetch course details', err);
      setError('Failed to load course details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to save tracks');
      navigate('/login');
      return;
    }

    if (wishlistLoading) return;
    setWishlistLoading(true);

    const targetWishlistedState = !isWishlisted;
    // Optimistic UI state
    setIsWishlisted(targetWishlistedState);

    try {
      if (!targetWishlistedState) {
        await wishlistApi.removeFromWishlist(courseId);
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.addToWishlist({
          courseId: parseInt(courseId),
          instructorId: course?.instructorId,
        });
        toast.success('Saved to wishlist');
      }
      try {
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist-check', courseId] });
      } catch (_) {}
    } catch (err) {
      // Revert optimistic state on genuine failure
      setIsWishlisted(!targetWishlistedState);
      toast.error('Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      navigate('/login');
      return;
    }

    if (cartLoading) return;
    setCartLoading(true);

    try {
      await cartApi.addToCart({
        courseId: parseInt(courseId),
        instructorId: course?.instructorId,
        courseName: course?.title,
        price: course?.price,
      });
      toast.success('Added to order cart');
      navigate('/cart');
    } catch (err) {
      if (err.response?.status === 409) {
        toast('Course is already in your cart', { icon: '🛒' });
        navigate('/cart');
        return;
      }
      toast.error('Failed to add to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const enrollInCourse = async () => {
    if (!user) {
      toast.error('Please login to enroll');
      navigate('/login');
      return;
    }

    try {
      await courseApi.enrollCourse(courseId);
      toast.success('Enrolled successfully!');
      navigate(`/student/courses/${courseId}`);
    } catch (err) {
      toast.error('Failed to enroll in course');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#5B3E57] dark:border-[#D1A7CC] border-t-transparent" />
          <p className="text-xs font-mono text-[#635E56] dark:text-[#A8A196]">Accessing curriculum node telemetry...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="text-rose-400 w-12 h-12 mx-auto" />
          <h2 className="text-xl font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">Curriculum Node Unavailable</h2>
          <p className="text-xs text-[#635E56] dark:text-[#A8A196] leading-relaxed">{error || 'Course not found in active catalog.'}</p>
          <Button variant="primary" size="sm" onClick={() => navigate('/courses')}>
            Return to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const isEnrolled = enrollmentStatus?.isEnrolled;
  const isFree = Number(course.price || 0) === 0 || course.isFree === true;

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] font-sans selection:bg-[#5B3E57]/20 dark:selection:bg-[#D1A7CC]/30">
      {/* ===================== HERO SECTION ===================== */}
      <section className="border-b border-[#E3DCD3] dark:border-white/[0.04] bg-[#FFFEFA] dark:bg-[#1D1C1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Back Navigation Breadcrumb */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#635E56] dark:text-[#A8A196] hover:text-[#282521] dark:text-[#EDE8E1] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Catalog</span>
          </button>

          {/* Hero Grid */}
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Course Description & Lead Attributes */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 text-[10px] font-bold text-[#5B3E57] dark:text-[#D1A7CC] uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#EAE5DC] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] text-[10px] font-bold text-[#635E56] dark:text-[#A8A196] uppercase tracking-wider">
                  {course.level}
                </span>
                {isEnrolled && (
                  <Badge variant="emerald" dot>
                    Enrolled
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight leading-tight">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="text-sm sm:text-base text-[#9A6B56] dark:text-[#D9A48F] font-medium leading-relaxed">
                  {course.subtitle}
                </p>
              )}

              <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A8A196] leading-relaxed max-w-3xl">
                {course.description}
              </p>

              {/* Meta Attributes Strip */}
              <div className="flex flex-wrap items-center gap-5 pt-2 text-xs text-[#635E56] dark:text-[#A8A196]">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-[#C29B38] fill-[#C29B38]" />
                  <span className="font-bold text-[#282521] dark:text-[#EDE8E1] font-mono">
                    {ratingSummary?.averageRating != null ? ratingSummary.averageRating.toFixed(1) : (course.rating != null ? Number(course.rating).toFixed(1) : '5.0')}
                  </span>
                  <span className="text-[#756E64] dark:text-[#7A7368]">
                    ({ratingSummary?.totalReviews ?? course.reviewsCount ?? 0} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#756E64] dark:text-[#7A7368]" />
                  <span className="font-mono">
                    {curriculum?.totalDuration ? `${Math.floor(curriculum.totalDuration / 60)}h ${curriculum.totalDuration % 60}m` : (course.duration || 'Self-paced')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#756E64] dark:text-[#7A7368]" />
                  <span>{curriculum?.totalLectures ?? 0} Lectures</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#756E64] dark:text-[#7A7368]" />
                  <span>{course.enrollmentsCount ?? 0} Engineers Enrolled</span>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Floating Enrollment Card */}
            <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] space-y-5 shadow-sm dark:shadow-2xl">
              {/* Media Preview Box */}
              <div className="relative aspect-video rounded-xl bg-[#EAE5DC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.04] overflow-hidden flex items-center justify-center group">
                {course.thumbnailUrl ? (
                  <img
                    src={resolveCoverImage(course.category, course.title, course.thumbnailUrl, course.id)}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#EAE5DC] dark:bg-[#151413] text-[#756E64] dark:text-[#7A7368]">
                    <Video className="w-8 h-8 mb-2 text-[#5B3E57] dark:text-[#D1A7CC]" />
                    <span className="text-[10px] font-mono uppercase">Mastery Course Preview</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#5B3E57] text-[#FFFEFA] dark:bg-[#D1A7CC] dark:text-[#151413] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    <Play className="w-5 h-5 ml-0.5 fill-current" />
                  </div>
                </div>
              </div>

              {/* Price & Action Strip */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl font-black text-[#282521] dark:text-[#EDE8E1] font-mono tracking-tight">
                    {isFree ? 'Free' : `₹${Number(course.price || 0).toLocaleString('en-IN')}`}
                  </span>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-xs line-through text-[#756E64] dark:text-[#7A7368] ml-2 font-mono">
                      ₹{course.originalPrice}
                    </span>
                  )}
                </div>
                <Badge variant="gold" dot>
                  Lifetime Access
                </Badge>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                {isEnrolled ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => navigate(`/student/courses/${courseId}`)}
                  >
                    Continue Learning
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full justify-center"
                      onClick={isFree ? enrollInCourse : addToCart}
                    >
                      {isFree ? 'Enroll Now (Free)' : 'Enroll Now'}
                    </Button>
                    {!isFree && (
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full justify-center"
                        onClick={addToCart}
                        leftIcon={ShoppingCart}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      wishlistLoading ? 'opacity-60 cursor-not-allowed' : ''
                    } ${
                      isWishlisted
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-[#F5F2EC] dark:bg-[#151413] border-[#E3DCD3] dark:border-white/[0.06] text-[#635E56] dark:text-[#A8A196] hover:text-[#282521] dark:hover:text-[#EDE8E1]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                    <span>{wishlistLoading ? 'Syncing...' : (isWishlisted ? 'Saved' : 'Wishlist')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Curriculum link copied to clipboard');
                    }}
                    className="p-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.06] text-[#635E56] dark:text-[#A8A196] hover:text-[#282521] dark:hover:text-[#EDE8E1] transition-colors cursor-pointer"
                    title="Share curriculum link"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Features Guarantee List */}
              <div className="pt-3 border-t border-[#E3DCD3] dark:border-white/[0.04] space-y-2 text-[11px] text-[#635E56] dark:text-[#A8A196]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC] shrink-0" />
                  <span>Verifiable cryptographic certificate upon completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC] shrink-0" />
                  <span>Full lifetime access to interactive labs & source code</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TABBED CONTENT CANVAS ===================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] p-6 sm:p-8 space-y-6 shadow-sm dark:shadow-xl">
          {/* Tab Switcher Header */}
          <div className="flex items-center gap-2 border-b border-[#E3DCD3] dark:border-white/[0.06] pb-4 overflow-x-auto scrollbar-none">
            {[
              { id: 'curriculum', label: 'Curriculum Schema', icon: BookOpen },
              { id: 'outcomes', label: 'Engineered Outcomes', icon: Target },
              { id: 'requirements', label: 'Prerequisites', icon: ShieldCheck },
              { id: 'reviews', label: 'Verified Reviews', icon: Star },
              { id: 'faqs', label: 'Operational FAQs', icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] border border-[#D5C0D1] dark:border-[#D1A7CC]/30 shadow-sm'
                      : 'text-[#635E56] dark:text-[#A8A196] hover:text-[#282521] dark:hover:text-[#EDE8E1] hover:bg-[#F5F2EC] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          <AnimatePresence mode="wait">
            {activeTab === 'curriculum' && (
              <motion.div
                key="curriculum"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={SPRING_TRANSITION}
                className="space-y-4"
              >
                <div className="flex items-center justify-between pb-2">
                  <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                    Course Structure & Micro-Lectures
                  </h3>
                  <span className="text-xs text-[#756E64] dark:text-[#7A7368] font-mono">
                    {curriculum?.totalSections || 0} Sections &bull; {curriculum?.totalLectures || 0} Lectures
                  </span>
                </div>

                <div className="space-y-3">
                  {curriculum?.sections && curriculum.sections.length > 0 ? (
                    curriculum.sections.map((section, idx) => {
                      const sectionKey = section.id ?? section.sectionId ?? `section-${idx}`;
                      return (
                        <div
                          key={sectionKey}
                          className="rounded-xl bg-[#F5F2EC]/60 dark:bg-[#151413]/70 border border-[#E3DCD3] dark:border-white/[0.04] overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => toggleSection(sectionKey)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#EAE5DC]/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] text-[#5B3E57] dark:text-[#D1A7CC] flex items-center justify-center text-xs font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-[#282521] dark:text-[#EDE8E1] truncate">
                                {section.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[11px] text-[#756E64] dark:text-[#7A7368] font-mono">
                                {section.lectures?.length || 0} lessons
                              </span>
                              {expandedSections[sectionKey] ? (
                                <ChevronUp className="w-4 h-4 text-[#756E64] dark:text-[#7A7368]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#756E64] dark:text-[#7A7368]" />
                              )}
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedSections[sectionKey] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-[#E3DCD3] dark:border-white/[0.04] divide-y divide-[#E3DCD3] dark:divide-white/[0.04]"
                              >
                                {section.lectures?.map((lecture, lIdx) => {
                                  const lectureKey = lecture.id ?? lecture.lectureId ?? `lecture-${lIdx}`;
                                  return (
                                    <div
                                      key={lectureKey}
                                      className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-white/[0.01]"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <Play className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                                        <span className="text-[#282521] dark:text-[#EDE8E1]">{lecture.title}</span>
                                      </div>
                                      <span className="text-[11px] font-mono text-[#756E64] dark:text-[#7A7368]">
                                        {lecture.durationMinutes || lecture.duration || 0}m
                                      </span>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-[#756E64] dark:text-[#7A7368]">
                      Detailed lecture syllabus is currently synchronizing with the gateway.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'outcomes' && (
              <motion.div
                key="outcomes"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={SPRING_TRANSITION}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                  Targeted Engineering Competencies
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {outcomes.length > 0 ? (
                    outcomes.map((outcome, oIdx) => (
                      <div
                        key={outcome.id ?? outcome.outcomeId ?? (typeof outcome === 'string' ? `outcome-${outcome}-${oIdx}` : `outcome-${oIdx}`)}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#151413]/70 border border-[#E3DCD3] dark:border-white/[0.04]"
                      >
                        <Target className="w-4 h-4 text-[#9A6B56] dark:text-[#D9A48F] mt-0.5 shrink-0" />
                        <span className="text-xs text-[#282521] dark:text-[#EDE8E1] leading-relaxed">
                          {outcome.outcomeText || outcome}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-8 text-center text-xs text-[#756E64] dark:text-[#7A7368]">
                      Engineering outcomes specified within individual lecture assignments.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'requirements' && (
              <motion.div
                key="requirements"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={SPRING_TRANSITION}
                className="space-y-4"
              >
                <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                  Environment & Architectural Prerequisites
                </h3>
                <div className="space-y-2.5">
                  {requirements.length > 0 ? (
                    requirements.map((req, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#151413]/70 border border-[#E3DCD3] dark:border-white/[0.04] text-xs text-[#282521] dark:text-[#EDE8E1]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{req.requirementText || req}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[#756E64] dark:text-[#7A7368]">
                      Fundamental computer science understanding and terminal familiarity required.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={SPRING_TRANSITION}
                className="space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                    Peer Reviews & Verification Feedback
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#C29B38]">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-mono font-bold">
                      {(ratingSummary?.averageRating || 0).toFixed(1)}
                    </span>
                    <span className="text-[#756E64] dark:text-[#7A7368]">
                      ({reviews.length} total reviews)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((rev, revIdx) => (
                      <div
                        key={rev.id ?? rev.reviewId ?? `rev-${revIdx}-${rev.createdAt || ''}`}
                        className="p-4 rounded-xl bg-[#F5F2EC]/60 dark:bg-[#151413]/70 border border-[#E3DCD3] dark:border-white/[0.04] space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#282521] dark:text-[#EDE8E1]">{rev.studentName || 'Engineer'}</span>
                          <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] font-mono">
                            {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#635E56] dark:text-[#A8A196] leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[#756E64] dark:text-[#7A7368]">
                      No peer reviews submitted yet for this curriculum track.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'faqs' && (
              <motion.div
                key="faqs"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={SPRING_TRANSITION}
                className="space-y-3"
              >
                <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight mb-4">
                  Frequently Asked Questions
                </h3>
                {faqs.length > 0 ? (
                  faqs.map((faq, faqIdx) => (
                    <div
                      key={faq.id ?? faq.faqId ?? `faq-${faqIdx}`}
                      className="rounded-xl bg-[#F5F2EC]/60 dark:bg-[#151413]/70 border border-[#E3DCD3] dark:border-white/[0.04] p-4 space-y-1.5 text-xs"
                    >
                      <h4 className="font-bold text-[#282521] dark:text-[#EDE8E1]">{faq.question}</h4>
                      <p className="text-[#635E56] dark:text-[#A8A196] leading-relaxed">{faq.answer}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-[#756E64] dark:text-[#7A7368]">
                    No open FAQs recorded for this curriculum.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
