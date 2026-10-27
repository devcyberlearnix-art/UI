import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle2,
  Circle,
  PlayCircle,
  Lock,
  FileText,
  Download,
  UploadCloud,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Sparkles,
  Clock,
  Award,
  BookOpen,
  MessageSquare,
  FileCode,
  ShieldCheck,
  AlertTriangle,
  RotateCw,
  X,
  Send,
  Check,
  Flame,
} from 'lucide-react';
import { courseApi } from '../../api/courseApi';
import { quizApi } from '../../api/quizApi';
import { assignmentApi } from '../../api/assignmentApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import { Skeleton } from '../../design-system/primitives/Skeleton';
import toast from 'react-hot-toast';
import LiveDiscussionHub from '../../components/classroom/LiveDiscussionHub';

const SPRING = { type: 'spring', stiffness: 350, damping: 28 };

// Default sample lesson videos for smooth HTML5 playback demonstration
const SAMPLE_STREAM = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const ClassroomView = () => {
  const { courseId, quizId: initialQuizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State: Core Course & Curriculum Data
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State: Video Classroom Canvas
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'resources' | 'qna'

  // State: Expandable Section Accordions
  const [expandedSections, setExpandedSections] = useState({});

  // State: Fullscreen Quiz Mode Canvas
  const [quizModeActive, setQuizModeActive] = useState(Boolean(initialQuizId));
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [activeAttemptId, setActiveAttemptId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizTimerMs, setQuizTimerMs] = useState(600000); // 10 minutes default
  const [quizTotalDurationMs, setQuizTotalDurationMs] = useState(600000);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  // Discussion state
  const [questionsList, setQuestionsList] = useState([
    {
      id: 1,
      author: 'Marcus Vance',
      avatar: 'M',
      time: '2 hours ago',
      content: 'Does the circuit breaker handle transient gRPC deadline exceeded exceptions out of the box?',
      replies: 2,
    },
    {
      id: 2,
      author: 'Elena Rostova',
      avatar: 'E',
      time: '1 day ago',
      content: 'Make sure to configure the exponential backoff multiplier to 1.5 in the resilience4j yaml file.',
      replies: 4,
    },
  ]);
  const [newComment, setNewComment] = useState('');

  // Hide controls timer
  const controlsTimeoutRef = useRef(null);

  // =========================================================================
  // 1. DATA INITIALIZATION: Fetch Course, Curriculum & Assignments
  // =========================================================================
  useEffect(() => {
    let isMounted = true;
    const loadClassroomData = async () => {
      setLoading(true);
      setError('');
      try {
        const id = courseId || '1';
        const [courseRes, sectionsRes, assignmentsRes] = await Promise.allSettled([
          courseApi.getCourseById(id),
          courseApi.getSections(id),
          assignmentApi.getAssignments(id),
        ]);

        if (!isMounted) return;

        const courseData =
          courseRes.status === 'fulfilled'
            ? courseRes.value?.course || courseRes.value?.data || courseRes.value
            : null;

        setCourse(
          courseData || {
            id,
            title: 'Distributed Systems & Microservice Architecture Masterclass',
            description: 'Advanced distributed tracing, consensus protocols, and reactive messaging.',
            instructor: 'Principal Systems Architect',
          }
        );

        // Parse curriculum sections or construct fallback curriculum
        let rawSections =
          sectionsRes.status === 'fulfilled'
            ? sectionsRes.value?.sections || sectionsRes.value?.data || sectionsRes.value
            : [];

        if (!Array.isArray(rawSections) || rawSections.length === 0) {
          rawSections = [
            {
              id: 101,
              title: 'Module 1: High-Throughput Event Streaming Architecture',
              lectures: [
                {
                  id: 1001,
                  title: '01. Architecture Foundations & Topology Walkthrough',
                  duration: '18:24',
                  videoUrl: SAMPLE_STREAM,
                  completed: true,
                },
                {
                  id: 1002,
                  title: '02. Kafka Partitioning Strategies & Consumer Groups',
                  duration: '24:10',
                  videoUrl: SAMPLE_STREAM,
                  completed: false,
                },
                {
                  id: 1003,
                  title: '03. Zero-Data-Loss Acknowledgements & Idempotency',
                  duration: '21:45',
                  videoUrl: SAMPLE_STREAM,
                  completed: false,
                },
              ],
              resources: [
                { id: 'res-1', title: 'Kafka_Partition_Sizing_Matrix.pdf', size: '2.4 MB' },
                { id: 'res-2', title: 'docker-compose-kafka-cluster.yml', size: '14 KB' },
              ],
              quiz: {
                id: 501,
                title: 'Checkpoint Assessment: Partition & Offset Semantics',
                durationMinutes: 10,
                questionsCount: 4,
              },
            },
            {
              id: 102,
              title: 'Module 2: Resilient Service Mesh & Distributed Tracing',
              lectures: [
                {
                  id: 1004,
                  title: '04. OpenTelemetry Instrumentation & Baggage Propagation',
                  duration: '28:15',
                  videoUrl: SAMPLE_STREAM,
                  completed: false,
                },
                {
                  id: 1005,
                  title: '05. Envoy Proxy Sidecar Injection & Circuit Breaking',
                  duration: '31:50',
                  videoUrl: SAMPLE_STREAM,
                  completed: false,
                },
              ],
              resources: [
                { id: 'res-3', title: 'Envoy_Filter_Chamber_Spec.json', size: '38 KB' },
              ],
              assignment: {
                id: 801,
                title: 'Lab 1: Configure Distributed Rate Limiter in Redis',
                status: 'PENDING_SUBMISSION',
                dueDate: 'In 3 days',
              },
            },
            {
              id: 103,
              title: 'Module 3: Database Isolation Levels & Saga Orchestration',
              lectures: [
                {
                  id: 1006,
                  title: '06. Compensating Transactions in Dual-Phase Commits',
                  duration: '22:30',
                  videoUrl: SAMPLE_STREAM,
                  completed: false,
                },
                {
                  id: 1007,
                  title: '07. Event-Driven Sagas vs Orchestrator Engines',
                  duration: '26:40',
                  videoUrl: SAMPLE_STREAM,
                  completed: false,
                },
              ],
            },
          ];
        }

        setSections(rawSections);

        // Open first section by default
        if (rawSections.length > 0) {
          setExpandedSections({ [rawSections[0].id]: true });
          const firstLecture = rawSections[0].lectures?.[0];
          if (firstLecture) setActiveLecture(firstLecture);
        }

        // Set assignments list
        const rawAssignments =
          assignmentsRes.status === 'fulfilled'
            ? assignmentsRes.value?.assignments || assignmentsRes.value?.data || assignmentsRes.value
            : [];
        setAssignments(Array.isArray(rawAssignments) ? rawAssignments : []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load classroom content');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadClassroomData();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // =========================================================================
  // 2. VIDEO PLAYER CONTROLS & TIMELINE
  // =========================================================================
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.buffered.length > 0) {
      setBuffered(
        (videoRef.current.buffered.end(videoRef.current.buffered.length - 1) /
          videoRef.current.duration) *
          100
      );
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    videoRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleMouseMovePlayer = () => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setIsControlsVisible(false);
    }, 2800);
  };

  // Video Completed Event: Optimistically register completion on backend
  const handleVideoEnded = async () => {
    setIsPlaying(false);
    if (activeLecture) {
      setCompletedLectures((prev) => new Set([...prev, activeLecture.id]));
      toast.success(`Lecture "${activeLecture.title}" completed!`, { icon: '🎯' });
      try {
        await courseApi.completeLecture(activeLecture.id);
      } catch (e) {
        // Optimistic state remains recorded
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // 3. EXPANDABLE SECTION ACCORDION HANDLERS
  // =========================================================================
  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const selectLecture = (lecture) => {
    setActiveLecture(lecture);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  // Calculate course completion percentage
  const totalLecturesCount = useMemo(() => {
    return sections.reduce((acc, sec) => acc + (sec.lectures?.length || 0), 0);
  }, [sections]);

  const progressPercentage = useMemo(() => {
    if (totalLecturesCount === 0) return 0;
    return Math.round((completedLectures.size / totalLecturesCount) * 100);
  }, [completedLectures, totalLecturesCount]);

  // =========================================================================
  // 4. QUIZ ASSESSMENT INTERACTION ENGINE & MILLISECOND TELEMETRY
  // =========================================================================
  const questionsData = useMemo(() => {
    return [
      {
        id: 'q1',
        prompt: 'In an event-driven microservice system with Apache Kafka, how do you enforce strict message order while maintaining horizontal scaling?',
        code: `// Consumer Configuration
props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "500");`,
        options: [
          { id: 'A', text: 'Increase partition count and deploy multiple consumers under different consumer group IDs.' },
          { id: 'B', text: 'Use consistent message partition keys so dependent entities hash to the same specific partition.', isCorrect: true },
          { id: 'C', text: 'Route all events through a single unified partition with synchronous commit calls.' },
          { id: 'D', text: 'Set max.in.flight.requests.per.connection to 10 and enable speculative retry buffering.' },
        ],
        explanation: 'Kafka guarantees total ordering only within a single partition. Hashing by entity ID guarantees all events for that aggregate land sequentially in the same partition.',
      },
      {
        id: 'q2',
        prompt: 'Which consensus algorithm guarantees safety under asynchronous network partitions while tolerating (N-1)/2 node crashes?',
        options: [
          { id: 'A', text: 'Two-Phase Commit (2PC)' },
          { id: 'B', text: 'Raft / Paxos State Machine Replication', isCorrect: true },
          { id: 'C', text: 'Gossip Failure Detector Protocol' },
          { id: 'D', text: 'Consistent Hashing with Virtual Nodes' },
        ],
        explanation: 'Raft and Paxos elect a stable leader through majority quorum (N/2 + 1), maintaining consensus as long as less than half of nodes fail.',
      },
      {
        id: 'q3',
        prompt: 'When implementing the Saga Pattern for distributed transactions, what is the primary role of a Compensating Transaction?',
        options: [
          { id: 'A', text: 'Locking all participant databases until the distributed coordinator sends a global commit command.' },
          { id: 'B', text: 'Semantically undoing the changes of a previously committed local step when a subsequent step fails.', isCorrect: true },
          { id: 'C', text: 'Converting synchronous REST calls into asynchronous gRPC bidirectional streams.' },
          { id: 'D', text: 'Writing WAL checkpoints directly to secondary standby database replicas.' },
        ],
        explanation: 'Compensating transactions reverse the business effects of previous actions since distributed 2PC locking is avoided in microservices.',
      },
      {
        id: 'q4',
        prompt: 'What distributed tracing concept allows cross-cutting metadata (e.g., tenantId, securityTier) to be automatically carried across HTTP headers and async workers?',
        options: [
          { id: 'A', text: 'OpenTelemetry Baggage Context API', isCorrect: true },
          { id: 'B', text: 'Span ID Hash Ring' },
          { id: 'C', text: 'TCP Window Sliding Scale' },
          { id: 'D', text: 'Zipkin Rate Sampling Filter' },
        ],
        explanation: 'OpenTelemetry Baggage propagates key-value pairs across process boundaries and trace boundaries automatically.',
      },
    ];
  }, []);

  // Initiate Quiz Assessment Session
  const startQuizSession = async (quiz) => {
    setActiveQuiz(quiz);
    setQuizModeActive(true);
    setQuizCompleted(false);
    setQuizResult(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    const totalMs = (quiz.durationMinutes || 10) * 60 * 1000;
    setQuizTimerMs(totalMs);
    setQuizTotalDurationMs(totalMs);

    try {
      const attemptRes = await quizApi.startQuizAttempt(quiz.id || 1);
      const attemptId = attemptRes?.attemptId || attemptRes?.data?.attemptId || `ATT-${Date.now()}`;
      setActiveAttemptId(attemptId);
    } catch {
      setActiveAttemptId(`ATT-${Date.now()}`);
    }
  };

  // High-Precision Millisecond Telemetry Countdown
  useEffect(() => {
    if (!quizModeActive || quizCompleted) return;

    const interval = setInterval(() => {
      setQuizTimerMs((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          handleAutoSubmitQuiz();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [quizModeActive, quizCompleted]);

  // Handle Question Answer Selection
  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Auto-submit when timer expires
  const handleAutoSubmitQuiz = useCallback(() => {
    toast.error('Time limit reached! Submitting answers automatically...', { icon: '⏰' });
    compileQuizResults();
  }, [selectedAnswers]);

  // Compile Final Score & Assessment Telemetry
  const compileQuizResults = async () => {
    setQuizSubmitting(true);
    await new Promise((r) => setTimeout(r, 800)); // Smooth processing pause

    let correctCount = 0;
    questionsData.forEach((q) => {
      const selected = selectedAnswers[q.id];
      const correctOption = q.options.find((o) => o.isCorrect);
      if (selected === correctOption?.id) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / questionsData.length) * 100);
    const passed = scorePercentage >= 75;

    const resultPayload = {
      scorePercentage,
      passed,
      correctCount,
      totalQuestions: questionsData.length,
      timeTakenMs: quizTotalDurationMs - quizTimerMs,
    };

    setQuizResult(resultPayload);
    setQuizCompleted(true);
    setQuizSubmitting(false);

    try {
      if (activeAttemptId && activeQuiz) {
        await quizApi.submitQuizAttempt(activeQuiz.id, activeAttemptId);
      }
    } catch {
      // Optimistic persistence
    }
  };

  // Format millisecond telemetry
  const formatTelemetryTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  // Timer Color Dynamics
  const timerRatio = quizTimerMs / quizTotalDurationMs;
  const timerColor =
    timerRatio > 0.3
      ? 'from-brand-accent to-brand-500'
      : timerRatio > 0.1
      ? 'from-amber-400 to-amber-500'
      : 'from-rose-500 to-rose-600 animate-pulse';

  // Handle Q&A Question submission
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const item = {
      id: Date.now(),
      author: user?.name || user?.email?.split('@')[0] || 'Senior Engineer',
      avatar: (user?.name || 'U').charAt(0).toUpperCase(),
      time: 'Just now',
      content: newComment.trim(),
      replies: 0,
    };

    setQuestionsList([item, ...questionsList]);
    setNewComment('');
    toast.success('Question posted to lecture discussion forum!');
  };

  // =========================================================================
  // RENDER: DISTRACTION-FREE FULLSCREEN QUIZ ASSESSMENT CANVAS
  // =========================================================================
  if (quizModeActive) {
    const currentQ = questionsData[currentQuestionIndex];
    const isAnswered = Boolean(selectedAnswers[currentQ?.id]);
    const isLastQuestion = currentQuestionIndex === questionsData.length - 1;

    return (
      <div className="fixed inset-0 z-50 bg-[#06090F] text-ink-100 flex flex-col overflow-y-auto selection:bg-brand-500/30 selection:text-white">
        {/* Top Assessment Telemetry Bar */}
        <header className="sticky top-0 z-40 w-full px-4 sm:px-8 py-3.5 bg-obsidian-900/90 backdrop-blur-2xl border-b border-obsidian-800/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Exit assessment? Your current timer will be forfeit.')) {
                  setQuizModeActive(false);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-ink-300 hover:text-white border border-white/5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit Assessment</span>
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                {activeQuiz?.title || 'Checkpoint Knowledge Assessment'}
              </span>
              <Badge variant="brand" dot>
                Proctored Mode
              </Badge>
            </div>
          </div>

          {/* High-Precision Millisecond Telemetry Countdown */}
          {!quizCompleted && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] text-ink-400 font-mono block">
                  REMAINING TIME
                </span>
                <span
                  className={`font-mono text-sm sm:text-base font-extrabold tracking-wider ${
                    timerRatio <= 0.1 ? 'text-rose-400 animate-pulse' : 'text-brand-accent'
                  }`}
                >
                  {formatTelemetryTime(quizTimerMs)}
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Dynamic Telemetry Progress Line with Millisecond Transition */}
        {!quizCompleted && (
          <div className="w-full h-1 bg-obsidian-950 overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${timerColor}`}
              style={{ width: `${Math.max(0, timerRatio * 100)}%` }}
              transition={{ ease: 'linear', duration: 0.1 }}
            />
          </div>
        )}

        {/* ===================== QUIZ CONTENT VIEW ===================== */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!quizCompleted ? (
              // Active Question Card
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={SPRING}
                className="space-y-8"
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between pb-2 border-b border-obsidian-800/40">
                  <span className="text-xs font-bold text-brand-accent uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {questionsData.length}
                  </span>
                  <span className="text-xs text-ink-400 font-medium">
                    {Math.round(((currentQuestionIndex + 1) / questionsData.length) * 100)}% Completed
                  </span>
                </div>

                {/* Prompt Title */}
                <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                  {currentQ.prompt}
                </h2>

                {/* Optional Syntax Highlighting Code Block */}
                {currentQ.code && (
                  <div className="p-4 rounded-2xl bg-ink-950 border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto shadow-inner">
                    <pre>{currentQ.code}</pre>
                  </div>
                )}

                {/* Modular Spring-Framed Answer Cards */}
                <div className="grid grid-cols-1 gap-3.5">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedAnswers[currentQ.id] === opt.id;
                    return (
                      <motion.button
                        key={opt.id}
                        type="button"
                        whileHover={{ scale: 1.012, y: -1 }}
                        whileTap={{ scale: 0.988 }}
                        onClick={() => handleSelectOption(currentQ.id, opt.id)}
                        className={`p-4 sm:p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-4 select-none ${
                          isSelected
                            ? 'bg-brand-600/20 border-brand-500 shadow-glow-brand text-white'
                            : 'bg-obsidian-900/60 border-obsidian-800/60 text-ink-300 hover:text-white hover:bg-obsidian-850'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-brand-500 text-white shadow-sm'
                              : 'bg-white/5 border border-white/10 text-ink-400'
                          }`}
                        >
                          {opt.id}
                        </div>
                        <span className="text-sm font-medium leading-relaxed pt-0.5">
                          {opt.text}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Navigation Bar */}
                <div className="pt-6 border-t border-obsidian-800/40 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="md"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    leftIcon={ChevronLeft}
                  >
                    Previous
                  </Button>

                  {isLastQuestion ? (
                    <Button
                      variant="primary"
                      size="md"
                      disabled={!isAnswered || quizSubmitting}
                      isLoading={quizSubmitting}
                      onClick={compileQuizResults}
                      rightIcon={Check}
                    >
                      Complete & Submit
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      disabled={!isAnswered}
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      rightIcon={ChevronRight}
                    >
                      Next Question
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              // Result Compilation Screen
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={SPRING}
                className="max-w-xl mx-auto w-full p-8 sm:p-10 rounded-3xl bg-obsidian-900/90 border border-obsidian-800/80 shadow-elevated-lg backdrop-blur-2xl text-center space-y-6"
              >
                {/* Visual Checkmark / Badge */}
                <div className="relative mx-auto w-24 h-24">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                    className={`w-full h-full rounded-3xl flex items-center justify-center ${
                      quizResult?.passed
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                        : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                    }`}
                  >
                    {quizResult?.passed ? (
                      <CheckCircle2 className="w-12 h-12" />
                    ) : (
                      <AlertTriangle className="w-12 h-12" />
                    )}
                  </motion.div>
                  <div
                    className={`absolute -inset-3 rounded-3xl blur-2xl -z-10 ${
                      quizResult?.passed ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                    }`}
                  />
                </div>

                <Badge
                  variant={quizResult?.passed ? 'emerald' : 'amber'}
                  dot
                >
                  {quizResult?.passed ? 'Mastery Verified' : 'Review Recommended'}
                </Badge>

                <div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    {quizResult?.passed ? 'Assessment Passed!' : 'Assessment Incomplete'}
                  </h2>
                  <p className="text-xs text-ink-400 mt-1.5">
                    {quizResult?.passed
                      ? 'You have satisfied the accuracy milestone for this module.'
                      : 'You scored below the 75% threshold. Revisit the lectures and retake.'}
                  </p>
                </div>

                {/* Score Breakdown Metrics */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-white font-mono">
                      {quizResult?.scorePercentage}%
                    </span>
                    <span className="text-[10px] text-ink-400 font-semibold mt-0.5">
                      ACCURACY
                    </span>
                  </div>

                  <div className="flex flex-col items-center border-x border-white/5">
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                      {quizResult?.correctCount} / {quizResult?.totalQuestions}
                    </span>
                    <span className="text-[10px] text-ink-400 font-semibold mt-0.5">
                      CORRECT
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-extrabold text-brand-accent font-mono">
                      {formatTime((quizResult?.timeTakenMs || 0) / 1000)}
                    </span>
                    <span className="text-[10px] text-ink-400 font-semibold mt-0.5">
                      TIME TAKEN
                    </span>
                  </div>
                </div>

                {/* Actionable CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setQuizModeActive(false);
                      // Advance to next lecture automatically
                    }}
                  >
                    Return to Classroom
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full sm:w-auto"
                    onClick={() => startQuizSession(activeQuiz || { id: 501, durationMinutes: 10 })}
                    leftIcon={RotateCcw}
                  >
                    Retake Assessment
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    );
  }

  // =========================================================================
  // RENDER: SPLIT-WINDOW VIDEO CLASSROOM CANVAS
  // =========================================================================
  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-6">
      {/* Top Navigation & Course Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-obsidian-800/40">
        <div className="flex items-center gap-3">
          <Link
            to="/student/my-learning"
            className="p-2 rounded-xl text-ink-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <span>{course?.title || 'Interactive Course Player'}</span>
            </h1>
            <p className="text-xs text-ink-400 mt-0.5">
              Current Track: <span className="text-white font-medium">{activeLecture?.title || 'Lecture Stream'}</span>
            </p>
          </div>
        </div>

        {/* Global Course Progress Bar */}
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="w-36 sm:w-48 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-ink-400">Track Progress</span>
              <span className="text-emerald-400 font-mono">{progressPercentage}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-obsidian-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 rounded-full"
                animate={{ width: `${progressPercentage}%` }}
                transition={SPRING}
              />
            </div>
          </div>

          <Badge variant="emerald" dot>
            {completedLectures.size}/{totalLecturesCount} Verified
          </Badge>
        </div>
      </div>

      {/* ===================== DUAL-PANE SPLIT WINDOW ===================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ===================== LEFT PANE: VIDEO PLAYER & NOTES (8/12) ===================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* HTML5 Video Player Container */}
          <div
            ref={playerContainerRef}
            onMouseMove={handleMouseMovePlayer}
            className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-obsidian-800/80 shadow-elevated-lg group"
          >
            <video
              ref={videoRef}
              src={activeLecture?.videoUrl || SAMPLE_STREAM}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleVideoEnded}
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Central Animated Play/Pause Splash Indicator */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.button
                  type="button"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto w-20 h-20 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-glow-brand backdrop-blur-md border border-white/20 transition-transform hover:scale-105"
                  aria-label="Play video"
                >
                  <Play className="w-8 h-8 ml-1" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Customized Video Control Overlay */}
            <motion.div
              animate={{ opacity: isControlsVisible || !isPlaying ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end gap-2.5 z-20 pointer-events-auto"
            >
              {/* Scrub Timeline Progress Bar */}
              <div
                onClick={handleSeek}
                className="relative w-full h-2 rounded-full bg-white/20 hover:h-3 transition-all cursor-pointer overflow-hidden group/bar"
              >
                {/* Buffered Track */}
                <div
                  className="absolute top-0 left-0 h-full bg-white/30"
                  style={{ width: `${buffered}%` }}
                />
                {/* Played Progress Track */}
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-accent to-brand-500 rounded-full"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              {/* Lower Control Actions */}
              <div className="flex items-center justify-between text-white text-xs">
                {/* Play/Pause & Volume */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-1.5 hover:text-brand-accent transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>

                  <div className="flex items-center gap-1.5 group/vol">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="p-1.5 hover:text-brand-accent transition-colors"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 rounded-full accent-brand-accent opacity-0 group-hover/vol:opacity-100 transition-opacity cursor-pointer"
                    />
                  </div>

                  {/* Timestamp Display */}
                  <span className="font-mono text-[11px] text-ink-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Right: Speed & Fullscreen */}
                <div className="flex items-center gap-2">
                  {/* Playback speed buttons */}
                  <div className="flex items-center bg-white/10 rounded-lg p-0.5">
                    {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => handleSpeedChange(spd)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                          playbackSpeed === spd
                            ? 'bg-brand-600 text-white'
                            : 'text-ink-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-1.5 hover:text-brand-accent transition-colors"
                    aria-label="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Lower Tabbed Navigation Bar */}
          <div className="p-6 rounded-3xl bg-obsidian-900/60 border border-obsidian-800/50 backdrop-blur-xl shadow-elevated-md space-y-6">
            {/* Tab Selector */}
            <div className="flex items-center gap-2 border-b border-obsidian-800/40 pb-3">
              {[
                { id: 'notes', label: 'Lecture Syllabus & Notes', icon: FileText },
                { id: 'resources', label: 'Files & Assets', icon: Download },
                { id: 'qna', label: 'Engineer Discussion Q&A', icon: MessageSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors select-none ${
                      isSelected ? 'text-white' : 'text-ink-400 hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="classroomTabIndicator"
                        className="absolute inset-0 bg-brand-600/20 border border-brand-500/40 rounded-xl -z-10"
                        transition={SPRING}
                      />
                    )}
                    <Icon className="w-4 h-4 text-brand-300" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Lecture Notes */}
            {activeTab === 'notes' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-xs leading-relaxed text-ink-300"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">
                    {activeLecture?.title || 'Architecture Overview'}
                  </h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleVideoEnded()}
                    leftIcon={CheckCircle2}
                  >
                    Mark Lecture Complete
                  </Button>
                </div>

                <p>
                  In this session, we investigate deterministic event sequencing across distributed partition topologies.
                  Pay close attention to how partition keys enforce consumer thread affinity while preventing split-brain states.
                </p>

                <div className="p-4 rounded-2xl bg-ink-950 border border-white/5 font-mono text-[11px] text-brand-accent">
                  <code># Terminal Deployment Verification<br />kubectl get statefulsets -n streaming-mesh -o wide</code>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Resources & Downloadables */}
            {activeTab === 'resources' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h4 className="text-xs font-bold text-ink-400 uppercase tracking-wider">
                  Course Artifacts & Source Repositories
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Full_Architectural_Blueprints.pdf', size: '4.8 MB', type: 'PDF' },
                    { title: 'Kubernetes_Mesh_Manifests.zip', size: '1.2 MB', type: 'ZIP' },
                    { title: 'OpenTelemetry_Collector_Config.yaml', size: '18 KB', type: 'YAML' },
                  ].map((res, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-500/30 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileCode className="w-4 h-4 text-brand-accent shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-white truncate max-w-[180px]">
                            {res.title}
                          </p>
                          <span className="text-[10px] text-ink-500">{res.size}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={Download}
                        onClick={() => toast.success(`Downloading ${res.title}...`)}
                      >
                        Fetch
                      </Button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tab 3: Q&A Forum & Live Discussion Hub */}
            {activeTab === 'qna' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <LiveDiscussionHub
                  courseId={courseId || '1'}
                  lectureTitle={activeLecture?.title}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* ===================== RIGHT PANE: CURRICULUM ACCORDION (4/12) ===================== */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-3xl bg-obsidian-900/80 border border-obsidian-800/60 backdrop-blur-2xl shadow-elevated-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-obsidian-800/40">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand-accent" />
                <span>Curriculum Modules</span>
              </h3>
              <span className="text-[11px] font-mono text-ink-400">
                {sections.length} Sections
              </span>
            </div>

            {/* Vertical Module Accordion List */}
            <div className="space-y-3">
              {sections.map((section, sIdx) => {
                const isExpanded = Boolean(expandedSections[section.id]);
                return (
                  <div
                    key={section.id}
                    className="rounded-2xl border border-obsidian-800/50 bg-white/[0.01] overflow-hidden transition-all"
                  >
                    {/* Section Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-white leading-snug line-clamp-1">
                          {section.title}
                        </p>
                        <span className="text-[10px] text-ink-500 block mt-0.5">
                          {section.lectures?.length || 0} Lectures • {section.quiz ? '1 Quiz' : 'Self-Paced'}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-400 transition-transform ${
                          isExpanded ? 'rotate-180 text-brand-accent' : ''
                        }`}
                      />
                    </button>

                    {/* Section Expandable Body */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={SPRING}
                          className="px-3 pb-3 space-y-2 border-t border-obsidian-800/30"
                        >
                          {/* Lectures List */}
                          {section.lectures?.map((lecture) => {
                            const isCurrent = activeLecture?.id === lecture.id;
                            const isDone = completedLectures.has(lecture.id) || lecture.completed;

                            return (
                              <button
                                key={lecture.id}
                                type="button"
                                onClick={() => selectLecture(lecture)}
                                className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all ${
                                  isCurrent
                                    ? 'bg-brand-600/20 border border-brand-500/40 text-white shadow-glow-brand'
                                    : 'hover:bg-white/5 text-ink-300 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {isDone ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  ) : isCurrent ? (
                                    <PlayCircle className="w-4 h-4 text-brand-accent shrink-0 animate-pulse" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-ink-600 shrink-0" />
                                  )}
                                  <span className="text-xs font-medium truncate">
                                    {lecture.title}
                                  </span>
                                </div>
                                <span className="text-[10px] text-ink-500 font-mono shrink-0 ml-2">
                                  {lecture.duration}
                                </span>
                              </button>
                            );
                          })}

                          {/* Checkpoint Quiz Trigger */}
                          {section.quiz && (
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => startQuizSession(section.quiz)}
                                className="w-full p-3 rounded-xl bg-gradient-to-r from-brand-accent/15 via-brand-600/10 to-transparent border border-brand-accent/30 hover:border-brand-accent flex items-center justify-between text-left transition-all group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Award className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                                  <div>
                                    <p className="text-xs font-bold text-white">
                                      {section.quiz.title}
                                    </p>
                                    <span className="text-[10px] text-cyan-300">
                                      {section.quiz.durationMinutes} min • {section.quiz.questionsCount || 4} Questions
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </div>
                          )}

                          {/* Assignment Card */}
                          {section.assignment && (
                            <div className="pt-1">
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-left">
                                <div className="flex items-center gap-2">
                                  <UploadCloud className="w-4 h-4 text-amber-400 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-amber-200 truncate max-w-[160px]">
                                      {section.assignment.title}
                                    </p>
                                    <span className="text-[10px] text-amber-400/80">
                                      Due {section.assignment.dueDate}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-amber-300 hover:text-white"
                                  onClick={() => toast('Direct lab submission terminal ready', { icon: '🚀' })}
                                >
                                  Submit
                                </Button>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassroomView;
