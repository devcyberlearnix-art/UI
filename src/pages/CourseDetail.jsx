import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { courseApi } from "../api/courseApi";
import { reviewApi } from "../api/reviewApi";
import { wishlistApi } from "../api/wishlistApi";
import { cartApi } from "../api/cartApi";
import { useAuth } from "../context/AuthContext";

const CourseDetail = () => {
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
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("curriculum");
  const [expandedSections, setExpandedSections] = useState({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);

  // Fetch comprehensive course details
  const fetchCourseDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Get comprehensive course details
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

      // Get curriculum separately if not in details
      if (!fetchedCurriculum) {
        const curriculumData = await courseApi.getCourseCurriculum(courseId);
        if (curriculumData?.data) {
          setCurriculum(curriculumData.data);
        }
      }

      // Get requirements
      const reqData = await courseApi.getCourseRequirements(courseId);
      if (reqData?.data) {
        setRequirements(reqData.data);
      }

      // Get learning outcomes
      const outcomesData = await courseApi.getLearningOutcomes(courseId);
      if (outcomesData?.data) {
        setOutcomes(outcomesData);
      }

      // Get materials
      const materialsData = await courseApi.getCourseMaterials(courseId);
      if (materialsData?.data) {
        setMaterials(materialsData);
      }

      // Get FAQs
      const faqsData = await courseApi.getCourseFAQs(courseId);
      if (faqsData?.data) {
        setFaqs(faqsData);
      }

      // Get reviews
      const reviewsData = await reviewApi.getCourseReviews(courseId, { page: 0, size: 10 });
      if (reviewsData?.content) {
        setReviews(reviewsData.content);
      }

      // Get rating summary if not in details
      if (!fetchedRatingSummary) {
        const summaryData = await reviewApi.getRatingSummary(courseId);
        if (summaryData) {
          setRatingSummary(summaryData);
        }
      }

      // Check wishlist status if logged in
      if (user) {
        try {
          const wishlistData = await wishlistApi.checkWishlist(courseId);
          setIsWishlisted(wishlistData?.data?.isInWishlist || false);
        } catch (err) {
          // Non-critical
        }
      }
    } catch (err) {
      console.error("[CourseDetail] Failed to fetch course details", err);
      setError("Failed to load course details. Please try again.");
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
      toast.error("Please login to save courses");
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(courseId);
        setIsWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await wishlistApi.addToWishlist({
          courseId: parseInt(courseId),
          instructorId: course?.instructorId,
        });
        setIsWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast.error("Please login to add to cart");
      navigate("/login");
      return;
    }

    try {
      await cartApi.addToCart({
        courseId: parseInt(courseId),
        instructorId: course?.instructorId,
        courseName: course?.title,
        price: course?.price,
      });
      toast.success("Added to cart");
      navigate("/cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    }
  };

  const enrollInCourse = async () => {
    if (!user) {
      toast.error("Please login to enroll");
      navigate("/login");
      return;
    }

    try {
      await courseApi.enrollCourse(courseId);
      toast.success("Enrolled successfully!");
      navigate(`/student/courses/${courseId}`);
    } catch (err) {
      toast.error("Failed to enroll in course");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="text-red-500 w-16 h-16 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Error Loading Course</h2>
          <p className="text-slate-500">{error}</p>
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
          <p className="text-slate-500">Loading course details...</p>
        </div>
      </div>
    );
  }

  const isEnrolled = enrollmentStatus?.isEnrolled;
  const isFree = course.price === 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920')] bg-cover bg-center opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Courses</span>
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
                  {course.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 text-xs font-semibold">
                  {course.level}
                </span>
                {isEnrolled && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    Enrolled
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                {course.title}
              </h1>

              {course.subtitle && (
                <p className="text-lg text-slate-300 font-medium">{course.subtitle}</p>
              )}

              <p className="text-slate-400 leading-relaxed max-w-3xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={16} fill="currentColor" />
                    <span className="font-bold text-white">
                      {ratingSummary?.averageRating?.toFixed(1) || course.rating?.toFixed(1) || "4.5"}
                    </span>
                  </div>
                  <span className="text-slate-400">
                    ({ratingSummary?.totalReviews || course.reviewCount || 0} reviews)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <Users size={16} />
                  <span>{ratingSummary?.enrollmentCount || course.enrollmentCount || 0} students</span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={16} />
                  <span>{curriculum?.totalDuration || "Self-paced"}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <BookOpen size={16} />
                  <span>{curriculum?.totalLectures || course.lessonsCount || 0} lessons</span>
                </div>
              </div>
            </div>

            {/* Course Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden sticky top-4">
                {/* Video Preview */}
                <div className="relative aspect-video bg-slate-900 group cursor-pointer">
                  {course.previewVideoUrl || course.thumbnail ? (
                    <img
                      src={course.previewVideoUrl || course.thumbnail}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <Video size={48} className="text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition">
                      <Play size={24} className="text-white fill-current ml-1" />
                    </div>
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    {isFree ? (
                      <span className="text-3xl font-black text-emerald-600 font-mono">FREE</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-slate-900 font-mono">
                          ₹{course.price}
                        </span>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <span className="text-lg text-slate-400 line-through font-mono">
                            ₹{course.originalPrice}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!isEnrolled ? (
                      <>
                        {isFree ? (
                          <button
                            onClick={enrollInCourse}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold transition flex items-center justify-center gap-2"
                          >
                            <ShieldCheck size={18} />
                            Enroll Now
                          </button>
                        ) : (
                          <button
                            onClick={addToCart}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition flex items-center justify-center gap-2"
                          >
                            <ShoppingCart size={18} />
                            Add to Cart
                          </button>
                        )}
                        <button
                          onClick={toggleWishlist}
                          className={`p-3 rounded-xl border-2 transition ${
                            isWishlisted
                              ? "border-rose-500 bg-rose-50 text-rose-600"
                              : "border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600"
                          }`}
                        >
                          <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => navigate(`/student/courses/${courseId}`)}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold transition flex items-center justify-center gap-2"
                      >
                        <Play size={18} />
                        Continue Learning
                      </button>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Full lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Downloadable resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-slate-200 mb-8 overflow-x-auto">
            {[
              { id: "curriculum", label: "Curriculum", icon: BookOpen },
              { id: "requirements", label: "Requirements", icon: Target },
              { id: "outcomes", label: "What You'll Learn", icon: Award },
              { id: "reviews", label: "Reviews", icon: Star },
              { id: "faqs", label: "FAQs", icon: HelpCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "curriculum" && curriculum && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Course Curriculum</h3>
                  <div className="text-sm text-slate-500">
                    {curriculum.totalSections} sections • {curriculum.totalLectures} lectures • {Math.floor(curriculum.totalDuration / 60)}h {curriculum.totalDuration % 60}m
                  </div>
                </div>

                {curriculum.sections?.map((section, idx) => (
                  <div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-900">{section.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{section.lectures?.length || 0} lectures</span>
                        {expandedSections[section.id] ? (
                          <ChevronUp size={18} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedSections[section.id] && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-2 bg-white">
                            {section.lectures?.map((lecture) => (
                              <div
                                key={lecture.id}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition"
                              >
                                <div className="p-2 rounded-lg bg-slate-100">
                                  <Video size={14} className="text-slate-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">{lecture.title}</p>
                                  <p className="text-xs text-slate-500">{lecture.description}</p>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {Math.floor(lecture.duration / 60)}:{(lecture.duration % 60).toString().padStart(2, "0")}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "requirements" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4">Requirements</h3>
                <ul className="space-y-3">
                  {requirements.length > 0 ? (
                    requirements.map((req) => (
                      <li key={req.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                        <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />
                        <span className="text-slate-700">{req.requirementText}</span>
                      </li>
                    ))
                  ) : (
                    <p className="text-slate-500">No specific requirements for this course.</p>
                  )}
                </ul>
              </motion.div>
            )}

            {activeTab === "outcomes" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4">What You'll Learn</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {outcomes.length > 0 ? (
                    outcomes.map((outcome) => (
                      <div key={outcome.id} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
                        <Target size={18} className="text-violet-600 mt-0.5" />
                        <span className="text-slate-700 text-sm">{outcome.outcomeText}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 col-span-2">Learning outcomes will be updated soon.</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Student Reviews</h3>
                  {ratingSummary && (
                    <div className="flex items-center gap-8 p-4 rounded-xl bg-slate-50">
                      <div className="text-center">
                        <div className="text-4xl font-black text-slate-900">
                          {ratingSummary.averageRating?.toFixed(1) || "4.5"}
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              fill={star <= Math.round(ratingSummary.averageRating || 4.5) ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {ratingSummary.totalReviews || 0} reviews
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = ratingSummary.ratingDistribution?.[star] || 0;
                          const percentage = ratingSummary.totalReviews ? (count / ratingSummary.totalReviews) * 100 : 0;
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-xs text-slate-600 w-12">{star} star</span>
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500 w-8">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div key={review.id} className="p-4 rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
                              {review.studentName?.charAt(0) || "U"}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{review.studentName || "Student"}</p>
                              <div className="flex items-center gap-1 text-amber-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={12}
                                    fill={star <= review.rating ? "currentColor" : "none"}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-8">No reviews yet. Be the first to review!</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "faqs" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-3">
                  {faqs.length > 0 ? (
                    faqs.map((faq) => (
                      <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleSection(faq.id)}
                          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition"
                        >
                          <span className="font-semibold text-slate-900 text-sm">{faq.question}</span>
                          {expandedSections[faq.id] ? (
                            <ChevronUp size={18} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={18} className="text-slate-400" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedSections[faq.id] && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 bg-white text-sm text-slate-700">{faq.answer}</div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">No FAQs available for this course.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
