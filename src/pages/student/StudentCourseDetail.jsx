import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  Star,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  PlayCircle,
  FileText,
  CheckCircle2,
  RefreshCw,
  Heart,
  Award,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Share2,
  Check,
  Lock,
  Video,
  Volume2,
  VolumeX,
  Maximize2,
  Play,
  Pause,
  Settings,
  MonitorUp,
  Target,
  TrendingUp,
  X,
  ClipboardList,
  Radio,
  MessageSquare,
} from "lucide-react";
import toast from "react-hot-toast";
import { courseApi } from "../../api/courseApi";
import { wishlistApi } from "../../api/wishlistApi";
import { useAuth } from "../../context/AuthContext";

const StudentCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [courseProgress, setCourseProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Video player state
  const [currentLecture, setCurrentLecture] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef(null);

  // Fetch course data
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError("");

    try {
      // Get course details
      const courseData = await courseApi.getCourseById(courseId);
      const data = courseData?.data || courseData;
      
      if (!data) throw new Error("No course details returned from server");

      const normalized = {
        id: data.id || data.courseId || courseId,
        title: data.title || data.courseName || data.name || "Course",
        category: data.category || data.categoryName || "Programming",
        level: data.level || data.difficultyLevel || "Beginner",
        price: data.price != null ? Number(data.price) : 0,
        originalPrice: data.originalPrice || (data.price ? Math.round(Number(data.price) * 1.6) : 0),
        rating: Number(data.rating || data.avgRating || 4.8),
        ratingCount: Number(data.ratingCount || data.reviewsCount || 0),
        students: Number(data.students || data.enrolledCount || 0),
        duration: data.duration || data.estimatedDuration || "Self-paced",
        language: data.language || "English",
        instructor: data.instructor?.name || data.instructorName || "Instructor",
        instructorRole: data.instructor?.role || "Senior Instructor",
        instructorBio: data.instructor?.bio || "Experienced instructor",
        image: data.image || data.thumbnail || data.coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80",
        description: data.description || data.summary || "Course description",
      };

      setCourse(normalized);

      // Get curriculum
      try {
        const curriculumData = await courseApi.getCourseCurriculum(courseId);
        if (curriculumData?.data) {
          setCurriculum(curriculumData.data);
          // Auto-expand first section
          if (curriculumData.data.sections?.length > 0) {
            setExpandedSections({ [curriculumData.data.sections[0].id]: true });
            // Set first lecture as current
            if (curriculumData.data.sections[0].lectures?.length > 0) {
              setCurrentLecture(curriculumData.data.sections[0].lectures[0]);
            }
          }
        }
      } catch (curriculumErr) {
        console.warn("[StudentCourseDetail] Curriculum fetch failed", curriculumErr);
      }

      // Get course progress
      try {
        const progressData = await courseApi.getCourseProgress(courseId);
        if (progressData?.data) {
          setCourseProgress(progressData.data);
        }
      } catch (progressErr) {
        console.warn("[StudentCourseDetail] Progress fetch failed", progressErr);
      }

      // Check wishlist
      try {
        const wishlistData = await wishlistApi.checkWishlist(courseId);
        setIsWishlisted(wishlistData?.data?.isInWishlist || false);
      } catch (wishlistErr) {
        console.warn("[StudentCourseDetail] Wishlist check failed", wishlistErr);
      }
    } catch (err) {
      console.error("[StudentCourseDetail] API error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load course details.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

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

  const selectLecture = async (lecture) => {
    setCurrentLecture(lecture);
    try {
      await courseApi.startLecture(lecture.id);
      setIsPlaying(true);
    } catch (err) {
      console.warn("Failed to start lecture progress", err);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      
      // Update progress every 5 seconds
      if (current % 5 < 1 && duration > 0) {
        const progressPercentage = Math.round((current / duration) * 100);
        if (currentLecture) {
          courseApi.updateLectureProgress(currentLecture.id, progressPercentage).catch(err => {
            console.warn("Failed to update progress", err);
          });
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleLectureComplete = async () => {
    if (currentLecture) {
      try {
        await courseApi.completeLecture(currentLecture.id);
        toast.success("Lecture completed!");
        // Refresh progress
        const progressData = await courseApi.getCourseProgress(courseId);
        if (progressData?.data) {
          setCourseProgress(progressData.data);
        }
      } catch (err) {
        console.warn("Failed to complete lecture", err);
      }
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const time = parseFloat(e.target.value);
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md p-8">
          <AlertCircle className="text-red-500 w-16 h-16 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Error Loading Course</h2>
          <p className="text-slate-500">{error}</p>
          <button
            onClick={() => navigate("/student/dashboard")}
            className="px-6 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = courseProgress?.progressPercentage || 0;
  const completedLectures = courseProgress?.completedLectures || 0;
  const totalLectures = curriculum?.totalLectures || 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft size={18} />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">
                  {progressPercentage}% Complete
                </div>
                <div className="text-xs text-slate-500">
                  {completedLectures}/{totalLectures} lessons
                </div>
              </div>
              <button
                onClick={toggleWishlist}
                className={`p-2 rounded-xl border transition ${
                  isWishlisted
                    ? "border-rose-200 bg-rose-50 text-rose-600"
                    : "border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600"
                }`}
              >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
              <div className="relative aspect-video bg-slate-900">
                {currentLecture?.videoUrl ? (
                  <video
                    ref={videoRef}
                    src={currentLecture.videoUrl}
                    className="w-full h-full"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleLectureComplete}
                    controls={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <div className="text-center">
                      <Video size={48} className="text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Select a lecture to start learning</p>
                    </div>
                  </div>
                )}

                {/* Custom Video Controls */}
                {currentLecture && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4">
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePlayPause}
                          className="p-2 rounded-full bg-white text-slate-900 hover:bg-slate-100 transition"
                        >
                          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                        </button>
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
                        >
                          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <span className="text-white text-sm font-mono">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={playbackSpeed}
                          onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                          className="bg-white/20 text-white text-xs rounded-lg px-2 py-1 border-0 outline-none cursor-pointer"
                        >
                          <option value={0.5}>0.5x</option>
                          <option value={0.75}>0.75x</option>
                          <option value={1}>1x</option>
                          <option value={1.25}>1.25x</option>
                          <option value={1.5}>1.5x</option>
                          <option value={2}>2x</option>
                        </select>
                        <button
                          onClick={handleLectureComplete}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition flex items-center gap-1"
                        >
                          <Check size={14} /> Complete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lecture Info */}
              {currentLecture && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-1">{currentLecture.title}</h3>
                  {currentLecture.description && (
                    <p className="text-sm text-slate-600">{currentLecture.description}</p>
                  )}
                </div>
              )}

              {/* Curriculum */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen size={18} className="text-orange-500" />
                    Course Curriculum
                  </h2>
                  <div className="text-xs text-slate-500">
                    {curriculum?.totalSections} sections • {curriculum?.totalLectures} lectures
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {curriculum?.sections?.map((section, idx) => {
                    const isExpanded = expandedSections[section.id];
                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-slate-900 text-sm">{section.title}</h3>
                              <p className="text-xs text-slate-500">
                                {section.lectures?.length || 0} lectures
                              </p>
                            </div>
                          </div>
                          <ChevronDown
                            size={18}
                            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              className="overflow-hidden bg-slate-50"
                            >
                              <div className="p-2 space-y-1">
                                {section.lectures?.map((lecture) => {
                                  const isCurrent = currentLecture?.id === lecture.id;
                                  const isCompleted = lecture.status === 'COMPLETED';
                                  return (
                                    <button
                                      key={lecture.id}
                                      onClick={() => selectLecture(lecture)}
                                      className={`w-full p-3 rounded-lg flex items-center gap-3 transition ${
                                        isCurrent
                                          ? 'bg-orange-50 border-orange-300'
                                          : 'hover:bg-white border-transparent'
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                                      ) : isCurrent ? (
                                        <PlayCircle size={16} className="text-orange-500 shrink-0" />
                                      ) : (
                                        <Video size={16} className="text-slate-400 shrink-0" />
                                      )}
                                      <div className="flex-1 text-left">
                                        <p className="text-sm font-medium text-slate-900 line-clamp-1">
                                          {lecture.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {lecture.duration ? `${Math.floor(lecture.duration / 60)}m` : ''} {lecture.previewEnabled && (
                                            <span className="text-emerald-600 font-medium">• Preview</span>
                                          )}
                                        </p>
                                      </div>
                                      {isCurrent && (
                                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Target size={18} className="text-orange-500" />
                What You'll Learn
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Master the fundamentals and advanced concepts</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Build real-world projects and portfolio pieces</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>Earn a verified certificate upon completion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="font-bold text-slate-900 mb-2">{course.title}</h2>
                  <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={16} fill="currentColor" />
                    <span className="font-bold">{course.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-slate-500">({course.ratingCount} reviews)</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={16} />
                  <span>{course.students} students enrolled</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock size={16} />
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Award size={16} />
                  <span>Certificate included</span>
                </div>
              </div>
            </div>

            {/* Course Activities & Resources */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                <BookOpen size={16} className="text-orange-500" />
                Course Activities
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/student/courses/${courseId}/assignments`}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 text-slate-700 hover:text-orange-600 transition text-xs font-semibold"
                >
                  <ClipboardList size={15} className="text-orange-500" />
                  <span>Assignments</span>
                </Link>
                <Link
                  to={`/student/courses/${courseId}/live-classes`}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 text-slate-700 hover:text-blue-600 transition text-xs font-semibold"
                >
                  <Radio size={15} className="text-blue-500" />
                  <span>Live Classes</span>
                </Link>
                <Link
                  to={`/student/courses/${courseId}/reviews`}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/50 text-slate-700 hover:text-amber-600 transition text-xs font-semibold"
                >
                  <MessageSquare size={15} className="text-amber-500" />
                  <span>Reviews</span>
                </Link>
                <Link
                  to={`/student/courses/${courseId}/certificate`}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-600 transition text-xs font-semibold"
                >
                  <Award size={15} className="text-emerald-500" />
                  <span>Certificate</span>
                </Link>
              </div>
            </div>

            {/* Progress Card */}
            {courseProgress && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500" />
                  Your Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Overall Progress</span>
                      <span className="font-bold text-slate-900">{progressPercentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-xl bg-slate-50">
                      <div className="text-2xl font-bold text-slate-900">{completedLectures}</div>
                      <div className="text-xs text-slate-500">Completed</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50">
                      <div className="text-2xl font-bold text-slate-900">{totalLectures - completedLectures}</div>
                      <div className="text-xs text-slate-500">Remaining</div>
                    </div>
                  </div>

                  {courseProgress.estimatedCompletionDate && (
                    <div className="text-xs text-slate-500 text-center">
                      Est. completion: {new Date(courseProgress.estimatedCompletionDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructor Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MonitorUp size={18} className="text-[#C5A880]" />
                Instructor
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#14141A] border border-white/[0.08] text-[#C5A880] flex items-center justify-center font-bold text-lg">
                    {course.instructor?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{course.instructor}</p>
                    <p className="text-xs text-slate-500">{course.instructorRole}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{course.instructorBio}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseDetail;
