import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Film,
  HelpCircle,
  Terminal,
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  UploadCloud,
  Video,
  FileText,
  Check,
  X,
  Shield,
  ExternalLink,
  RefreshCw,
  BarChart2,
  BookOpen,
  DollarSign,
  Tag,
  Clock,
  Code,
  Award,
  Globe,
  AlertTriangle,
  Play,
  Copy,
  Info,
} from 'lucide-react';
import { instructorApi } from '../../api/instructorApi';
import { courseApi } from '../../api/courseApi';
import { quizApi } from '../../api/quizApi';
import { assignmentApi } from '../../api/assignmentApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import toast from 'react-hot-toast';

const SPRING = { type: 'spring', stiffness: 350, damping: 28 };

const CATEGORIES = [
  'Distributed Systems',
  'Cloud & DevOps',
  'Backend Architecture',
  'Frontend & Full-Stack',
  'Cybersecurity',
  'AI & Deep Learning',
  'Data Systems & Kafka',
  'Mobile & Edge Computing',
];

const DIFFICULTY_LEVELS = [
  { id: 'Beginner', label: 'Beginner', desc: 'Foundations & Core Principles' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'Production Implementations' },
  { id: 'Advanced', label: 'Advanced', desc: 'High-Concurrency & Performance' },
  { id: 'Masterclass', label: 'Masterclass', desc: 'Enterprise Systems Architecture' },
];

const PRESET_WALLPAPERS = [
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
];

const SAMPLE_VIDEO_STREAM = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const CreateCourse = ({ isEditing: propIsEditing = false }) => {
  const { courseId: paramCourseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isEditing = propIsEditing || Boolean(paramCourseId);

  // Authenticated user resolution
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('lms_user');
      return raw && raw !== 'undefined' ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();

  const instructorId =
    user?.id ||
    user?.userId ||
    user?._id ||
    storedUser?.id ||
    storedUser?.userId ||
    storedUser?._id ||
    'me';
  const instructorName =
    user?.name ||
    user?.firstName ||
    storedUser?.name ||
    'Lead Systems Architect';

  // Builder Stepper Tab state: 0 = Meta, 1 = Curriculum, 2 = Quizzes, 3 = Labs, 4 = Pre-flight
  const [activeStep, setActiveStep] = useState(0);

  // Core Form State
  const [courseState, setCourseState] = useState({
    id: paramCourseId || `course_${Date.now()}`,
    title: '',
    subtitle: '',
    description: '',
    category: 'Distributed Systems',
    level: 'Advanced',
    price: 49.99,
    promotionalPrice: 29.99,
    language: 'English',
    thumbnailUrl: PRESET_WALLPAPERS[0],
    durationHours: 18.5,
    status: 'Draft',
    tags: ['Microservices', 'Kafka', 'Resilience', 'gRPC'],
    outcomes: [
      'Architect fault-tolerant event streams with zero data loss',
      'Design idempotent consumer pipelines handling 100k+ ops/sec',
      'Deploy Istio service mesh mTLS cryptographic authorization',
    ],
    prerequisites: [
      'Solid proficiency with Golang, Java, or Node.js',
      'Basic knowledge of containerization and Docker',
    ],
    modules: [
      {
        moduleId: 'mod_1',
        title: '01. Architecture Foundations & System Paradigms',
        description: 'Deep dive into event-driven topologies and replication invariants.',
        lectures: [
          {
            lectureId: 'lec_101',
            title: '1.1 System Architecture Topology & Monolith Deconstruction',
            duration: '18:24',
            videoUrl: SAMPLE_VIDEO_STREAM,
            isPreview: true,
            uploadProgress: 100,
            uploadStatus: 'ready',
            resources: [
              { id: 'res_1', title: 'Architecture_Blueprint_v3.pdf', size: '2.4 MB' },
            ],
          },
          {
            lectureId: 'lec_102',
            title: '1.2 High-Throughput Stream Architectures & Partitioning',
            duration: '24:10',
            videoUrl: SAMPLE_VIDEO_STREAM,
            isPreview: false,
            uploadProgress: 100,
            uploadStatus: 'ready',
            resources: [
              { id: 'res_2', title: 'docker-compose-kafka-cluster.yml', size: '14 KB' },
            ],
          },
        ],
        quiz: {
          quizId: 'quiz_1',
          title: 'Checkpoint Assessment: Stream Invariants & Offsets',
          timeLimit: 15,
          passingScore: 70,
          questions: [
            {
              id: 'q_1',
              text: 'Which architectural component directly guarantees message ordering guarantees across distributed partitions?',
              options: [
                'Dynamic Client-Side Round Robin Load Balancing',
                'Monotonically Increasing Partition Offset Keys',
                'Asynchronous Replicated Ring Buffers',
                'Distributed Two-Phase Commit Transaction Coordinators',
              ],
              answer: 1,
              explanation:
                'Within an individual partition, Kafka guarantees strict order via monotonically increasing offsets assigned on broker write acknowledgment.',
            },
            {
              id: 'q_2',
              text: 'What is the primary degradation penalty of choosing an Acknowledgment state config of acks=all?',
              options: [
                'Total depletion of consumer group pool workers',
                'Write latency increase during cluster in-sync replica synchronization',
                'Uncontrolled cumulative layout shifting',
                'Immediate network socket packet truncation',
              ],
              answer: 1,
              explanation:
                'acks=all forces the broker to wait until all in-sync replicas (ISRs) have written to their commit log, increasing round-trip write latency.',
            },
          ],
        },
        assignment: {
          id: 'lab_1',
          title: 'Lab 1: Configure Multi-Node Resilient Event Stream Topology',
          description:
            'Implement a containerized 3-broker cluster with a replication factor of 3 and min.insync.replicas=2. Submit your docker-compose and benchmark logs.',
          dueDate: 'In 5 days',
          submissionFormat: 'GitHub Repository URL',
        },
      },
    ],
  });

  // UI Micro-states
  const [expandedModules, setExpandedModules] = useState({ mod_1: true });
  const [newTagInput, setNewTagInput] = useState('');
  const [newOutcomeInput, setNewOutcomeInput] = useState('');
  const [newPrereqInput, setNewPrereqInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(Boolean(paramCourseId));
  const [uploadingLectureId, setUploadingLectureId] = useState(null);
  const [showLivePreviewModal, setShowLivePreviewModal] = useState(false);

  // Load existing course if editing
  useEffect(() => {
    if (!paramCourseId) return;

    let isMounted = true;
    const fetchExistingCourse = async () => {
      setIsLoadingExisting(true);
      try {
        // Check local storage custom courses first for instantaneous hydration
        const localList = JSON.parse(localStorage.getItem('lms_custom_courses') || '[]');
        const localCourse = localList.find(
          (c) =>
            String(c.id) === String(paramCourseId) ||
            String(c._id) === String(paramCourseId) ||
            String(c.courseId) === String(paramCourseId)
        );

        if (localCourse && isMounted) {
          setCourseState((prev) => ({
            ...prev,
            ...localCourse,
            modules: localCourse.modules || prev.modules,
          }));
          setIsLoadingExisting(false);
          return;
        }

        // Otherwise query backend APIs
        const apiData = await courseApi.getCourseById(paramCourseId);
        const resolved = apiData?.data || apiData?.course || apiData;
        if (resolved && isMounted) {
          setCourseState((prev) => ({
            ...prev,
            ...resolved,
            modules: resolved.modules || resolved.sections || prev.modules,
          }));
        }
      } catch (err) {
        toast.error('Failed to load existing course details from server.');
      } finally {
        if (isMounted) setIsLoadingExisting(false);
      }
    };

    fetchExistingCourse();
    return () => {
      isMounted = false;
    };
  }, [paramCourseId]);

  // Stepper Config
  const STEPS = [
    { id: 0, label: 'Identity & Meta', icon: Layers, desc: 'Naming, pricing & tags' },
    { id: 1, label: 'Curriculum Matrix', icon: Film, desc: 'Modules, lectures & streams' },
    { id: 2, label: 'Checkpoint Quizzes', icon: HelpCircle, desc: 'Knowledge evaluations' },
    { id: 3, label: 'Labs & Assignments', icon: Terminal, desc: 'Hands-on telemetry briefs' },
    { id: 4, label: 'Pre-flight & Release', icon: Sparkles, desc: 'Audit score & deploy' },
  ];

  // Helper updates
  const updateField = (field, val) => {
    setCourseState((prev) => ({ ...prev, [field]: val }));
  };

  const toggleModuleAccordion = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Add Tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (!newTagInput.trim()) return;
      if (!courseState.tags.includes(newTagInput.trim())) {
        updateField('tags', [...courseState.tags, newTagInput.trim()]);
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    updateField(
      'tags',
      courseState.tags.filter((t) => t !== tagToRemove)
    );
  };

  // Add Outcome
  const handleAddOutcome = () => {
    if (!newOutcomeInput.trim()) return;
    updateField('outcomes', [...courseState.outcomes, newOutcomeInput.trim()]);
    setNewOutcomeInput('');
  };

  const handleRemoveOutcome = (idx) => {
    updateField(
      'outcomes',
      courseState.outcomes.filter((_, i) => i !== idx)
    );
  };

  // Add Prerequisite
  const handleAddPrereq = () => {
    if (!newPrereqInput.trim()) return;
    updateField('prerequisites', [...courseState.prerequisites, newPrereqInput.trim()]);
    setNewPrereqInput('');
  };

  const handleRemovePrereq = (idx) => {
    updateField(
      'prerequisites',
      courseState.prerequisites.filter((_, i) => i !== idx)
    );
  };

  // =========================================================================
  // MODULE & CURRICULUM MANAGEMENT
  // =========================================================================
  const handleAddModule = () => {
    const newModId = `mod_${Date.now()}`;
    const newMod = {
      moduleId: newModId,
      title: `Module ${courseState.modules.length + 1}: Modern Operational Topology`,
      description: 'Architectural objectives and core performance invariants.',
      lectures: [
        {
          lectureId: `lec_${Date.now()}`,
          title: '01. Architecture Foundations & Configuration',
          duration: '15:00',
          videoUrl: SAMPLE_VIDEO_STREAM,
          isPreview: true,
          uploadProgress: 100,
          uploadStatus: 'ready',
          resources: [],
        },
      ],
      quiz: null,
      assignment: null,
    };
    setCourseState((prev) => ({
      ...prev,
      modules: [...prev.modules, newMod],
    }));
    setExpandedModules((prev) => ({ ...prev, [newModId]: true }));
    toast.success('New Module Node added to matrix.');
  };

  const handleDeleteModule = (modId) => {
    if (courseState.modules.length <= 1) {
      toast.error('Curriculum matrix must retain at least one operational module.');
      return;
    }
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.moduleId !== modId),
    }));
    toast.success('Module purged from curriculum stack.');
  };

  const handleMoveModule = (idx, direction) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= courseState.modules.length) return;
    const reordered = [...courseState.modules];
    const temp = reordered[idx];
    reordered[idx] = reordered[newIdx];
    reordered[newIdx] = temp;
    updateField('modules', reordered);
  };

  const handleUpdateModuleTitle = (modId, title) => {
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.moduleId === modId ? { ...m, title } : m
      ),
    }));
  };

  // Lecture operations
  const handleAddLecture = (modId) => {
    const newLecId = `lec_${Date.now()}`;
    const newLec = {
      lectureId: newLecId,
      title: 'New Telemetry Stream Node',
      duration: '12:30',
      videoUrl: SAMPLE_VIDEO_STREAM,
      isPreview: false,
      uploadProgress: 100,
      uploadStatus: 'ready',
      resources: [],
    };

    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.moduleId === modId
          ? { ...m, lectures: [...(m.lectures || []), newLec] }
          : m
      ),
    }));
    toast.success('Lecture node added.');
  };

  const handleDeleteLecture = (modId, lecId) => {
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId) return m;
        if (m.lectures.length <= 1) {
          toast.error('Each module requires at least one lecture node.');
          return m;
        }
        return {
          ...m,
          lectures: m.lectures.filter((l) => l.lectureId !== lecId),
        };
      }),
    }));
  };

  const handleUpdateLecture = (modId, lecId, field, value) => {
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId) return m;
        return {
          ...m,
          lectures: m.lectures.map((l) =>
            l.lectureId === lecId ? { ...l, [field]: value } : l
          ),
        };
      }),
    }));
  };

  // Simulate real-time chunked video upload pipeline
  const simulateVideoUpload = (modId, lecId) => {
    setUploadingLectureId(lecId);
    handleUpdateLecture(modId, lecId, 'uploadStatus', 'uploading');
    handleUpdateLecture(modId, lecId, 'uploadProgress', 10);

    const interval = setInterval(() => {
      setCourseState((prev) => {
        const targetMod = prev.modules.find((m) => m.moduleId === modId);
        const targetLec = targetMod?.lectures?.find((l) => l.lectureId === lecId);
        const currentProgress = targetLec?.uploadProgress || 10;

        if (currentProgress >= 90) {
          clearInterval(interval);
          handleUpdateLecture(modId, lecId, 'uploadStatus', 'transcoding');
          handleUpdateLecture(modId, lecId, 'uploadProgress', 100);

          setTimeout(() => {
            handleUpdateLecture(modId, lecId, 'uploadStatus', 'ready');
            handleUpdateLecture(modId, lecId, 'videoUrl', SAMPLE_VIDEO_STREAM);
            setUploadingLectureId(null);
            toast.success('HLS multi-bitrate video ingest completed.');
          }, 1200);

          return prev;
        }

        return {
          ...prev,
          modules: prev.modules.map((m) => {
            if (m.moduleId !== modId) return m;
            return {
              ...m,
              lectures: m.lectures.map((l) =>
                l.lectureId === lecId
                  ? { ...l, uploadProgress: currentProgress + 25 }
                  : l
              ),
            };
          }),
        };
      });
    }, 400);
  };

  // Resource attachment
  const handleAddResource = (modId, lecId) => {
    const title = prompt('Enter resource filename (e.g. distributed-tracing-matrix.pdf):');
    if (!title) return;
    const newRes = {
      id: `res_${Date.now()}`,
      title,
      size: `${(Math.random() * 4 + 0.5).toFixed(1)} MB`,
    };
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId) return m;
        return {
          ...m,
          lectures: m.lectures.map((l) =>
            l.lectureId === lecId
              ? { ...l, resources: [...(l.resources || []), newRes] }
              : l
          ),
        };
      }),
    }));
    toast.success('Resource package attached.');
  };

  // =========================================================================
  // QUIZ STUDIO MANAGEMENT
  // =========================================================================
  const handleToggleModuleQuiz = (modId) => {
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId) return m;
        if (m.quiz) {
          return { ...m, quiz: null };
        }
        return {
          ...m,
          quiz: {
            quizId: `quiz_${Date.now()}`,
            title: `${m.title} Technical Evaluation`,
            timeLimit: 15,
            passingScore: 70,
            questions: [
              {
                id: `q_${Date.now()}_1`,
                text: 'What guarantee does an in-sync replica (ISR) set provide during leader election?',
                options: [
                  'Lock-free atomic writes without memory barriers',
                  'Zero data loss because all replicas have committed recent records',
                  'Client-side TCP retry suppression',
                  'Round-robin partition distribution over HTTP/2',
                ],
                answer: 1,
                explanation:
                  'Kafka guarantees zero data loss by restricting leader election exclusively to ISR members that have acknowledged all writes.',
              },
            ],
          },
        };
      }),
    }));
  };

  const handleAddQuizQuestion = (modId) => {
    const newQ = {
      id: `q_${Date.now()}`,
      text: 'New Technical Evaluation Query:',
      options: [
        'Option A: Primary Candidate Statement',
        'Option B: Secondary Consensus Alternative',
        'Option C: Fallback Degraded Pathway',
        'Option D: Unbuffered Network Socket Pipe',
      ],
      answer: 0,
      explanation: 'Detailed operational rationale explaining this architecture decision.',
    };

    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId || !m.quiz) return m;
        return {
          ...m,
          quiz: {
            ...m.quiz,
            questions: [...(m.quiz.questions || []), newQ],
          },
        };
      }),
    }));
    toast.success('New assessment question appended.');
  };

  const handleDeleteQuizQuestion = (modId, qId) => {
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId || !m.quiz) return m;
        if (m.quiz.questions.length <= 1) {
          toast.error('Quiz must possess at least one question node.');
          return m;
        }
        return {
          ...m,
          quiz: {
            ...m.quiz,
            questions: m.quiz.questions.filter((q) => q.id !== qId),
          },
        };
      }),
    }));
  };

  const handleUpdateQuizQuestion = (modId, qId, field, val) => {
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId || !m.quiz) return m;
        return {
          ...m,
          quiz: {
            ...m.quiz,
            questions: m.quiz.questions.map((q) =>
              q.id === qId ? { ...q, [field]: val } : q
            ),
          },
        };
      }),
    }));
  };

  const handleUpdateQuizOption = (modId, qId, optIndex, optText) => {
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId || !m.quiz) return m;
        return {
          ...m,
          quiz: {
            ...m.quiz,
            questions: m.quiz.questions.map((q) => {
              if (q.id !== qId) return q;
              const nextOpts = [...q.options];
              nextOpts[optIndex] = optText;
              return { ...q, options: nextOpts };
            }),
          },
        };
      }),
    }));
  };

  // =========================================================================
  // LAB / ASSIGNMENT MANAGEMENT
  // =========================================================================
  const handleToggleModuleAssignment = (modId) => {
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId) return m;
        if (m.assignment) {
          return { ...m, assignment: null };
        }
        return {
          ...m,
          assignment: {
            id: `lab_${Date.now()}`,
            title: `Hands-on Lab: ${m.title}`,
            description:
              'Construct an automated integration test verifying zero-downtime rolling upgrades and telemetry span propagation.',
            dueDate: 'In 7 days',
            submissionFormat: 'GitHub Repository URL or Docker Compose Spec',
          },
        };
      }),
    }));
  };

  const handleUpdateAssignment = (modId, field, val) => {
    setCourseState((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => {
        if (m.moduleId !== modId || !m.assignment) return m;
        return {
          ...m,
          assignment: {
            ...m.assignment,
            [field]: val,
          },
        };
      }),
    }));
  };

  // =========================================================================
  // PRE-FLIGHT AUDIT & VALIDATION METRICS
  // =========================================================================
  const auditMetrics = useMemo(() => {
    const checks = [
      {
        id: 'title',
        label: 'Course Title & Architecture Branding',
        passed: Boolean(courseState.title.trim().length >= 5),
        detail: courseState.title || 'Must be at least 5 characters',
      },
      {
        id: 'description',
        label: 'Technical Syllabus Abstract',
        passed: Boolean(courseState.description.trim().length >= 20),
        detail: `${courseState.description.length}/20 min characters`,
      },
      {
        id: 'pricing',
        label: 'Monetization Model Configured',
        passed: !isNaN(Number(courseState.price)) && Number(courseState.price) >= 0,
        detail: `$${courseState.price} USD standard tier`,
      },
      {
        id: 'modules',
        label: 'Curriculum Module Decomposition',
        passed: courseState.modules.length >= 1,
        detail: `${courseState.modules.length} active module node(s)`,
      },
      {
        id: 'lectures',
        label: 'Streaming Video Ingest Nodes',
        passed: courseState.modules.some((m) => m.lectures && m.lectures.length > 0),
        detail: `${courseState.modules.reduce(
          (acc, m) => acc + (m.lectures?.length || 0),
          0
        )} total stream lectures`,
      },
      {
        id: 'outcomes',
        label: 'Concrete Learning Deliverables',
        passed: courseState.outcomes.length >= 2,
        detail: `${courseState.outcomes.length} core competencies defined`,
      },
      {
        id: 'quiz',
        label: 'Technical Checkpoint Evaluations',
        passed: courseState.modules.some((m) => Boolean(m.quiz)),
        detail: courseState.modules.some((m) => Boolean(m.quiz))
          ? 'Checkpoint quizzes active'
          : 'Optional checkpoint quiz recommended',
        isWarningOnly: true,
      },
    ];

    const criticalChecks = checks.filter((c) => !c.isWarningOnly);
    const passedCritical = criticalChecks.filter((c) => c.passed).length;
    const score = Math.round((passedCritical / criticalChecks.length) * 100);

    return {
      checks,
      score,
      isDeployable: score === 100,
    };
  }, [courseState]);

  // Total curriculum statistics
  const totalStats = useMemo(() => {
    const lectureCount = courseState.modules.reduce(
      (acc, m) => acc + (m.lectures?.length || 0),
      0
    );
    const quizCount = courseState.modules.filter((m) => Boolean(m.quiz)).length;
    const labCount = courseState.modules.filter((m) => Boolean(m.assignment)).length;
    return {
      modules: courseState.modules.length,
      lectures: lectureCount,
      quizzes: quizCount,
      labs: labCount,
    };
  }, [courseState.modules]);

  // =========================================================================
  // FINAL PUBLISHING & DEPLOYMENT PIPELINE
  // =========================================================================
  const handleDeployCourse = async (publishImmediate = true) => {
    if (!auditMetrics.isDeployable && publishImmediate) {
      toast.error('Pre-flight validation failed. Resolve critical checklist items.');
      setActiveStep(4);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Broadcasting architecture matrix to LMS catalog...');

    try {
      const finalStatus = publishImmediate ? 'Published' : 'Draft';
      const completePayload = {
        ...courseState,
        id: courseState.id,
        status: finalStatus,
        instructorId,
        instructorName,
        updatedAt: new Date().toISOString(),
        rating: 5.0,
        enrolledCount: courseState.enrolledCount || 0,
      };

      // 1. Direct authoritative creation on live microservice gateway
      const res = await instructorApi.createCourse(instructorId, completePayload);
      const backendCourse = res?.data || res;

      // 2. Cascade create curriculum sections if specified
      if (courseApi.createSection && backendCourse?.id) {
        for (let i = 0; i < courseState.modules.length; i++) {
          const mod = courseState.modules[i];
          await courseApi.createSection(backendCourse.id, {
            title: mod.title,
            description: mod.description,
            orderIndex: i + 1,
          });
        }
      }

      toast.success(
        publishImmediate
          ? 'Course published cleanly to active master catalog!'
          : 'Course draft saved successfully.',
        { id: toastId }
      );

      setTimeout(() => {
        navigate('/instructor/my-courses');
      }, 900);
    } catch (err) {
      toast.error(err.message || 'Deployment execution fault.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingExisting) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-[#635E56] dark:text-[#A69F94]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#5B3E57] dark:text-[#D1A7CC]" />
        <p className="font-mono text-sm tracking-wider uppercase">
          Hydrating Course Matrix Topology...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-[#282521] dark:text-[#EDE8E1] max-w-7xl mx-auto pb-24">
      {/* =====================================================================
          1. STUDIO HEADER DOCK & TELEMETRY CONTROLS
          ===================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xs relative overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#5B3E57]/20 dark:via-[#D1A7CC]/20 to-transparent" />

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/instructor/my-courses')}
            className="p-2.5 rounded-xl bg-[#EAE5DC] dark:bg-[#272523] hover:bg-[#E1DBD0] border border-[#E3DCD3] dark:border-white/[0.08] text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1] transition-colors"
            title="Return to My Courses"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-widest text-[#5B3E57] dark:text-[#D1A7CC] uppercase">
                {isEditing ? 'Curriculum Studio Node' : 'Authoring Pipeline'}
              </span>
              <span className="text-[#D8D0C5] dark:text-white/[0.2]">•</span>
              <Badge
                variant={courseState.status === 'Published' ? 'success' : 'secondary'}
                className="font-mono text-[10px] tracking-wide uppercase"
              >
                {courseState.status}
              </Badge>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#282521] dark:text-[#EDE8E1] flex items-center gap-2">
              {courseState.title || (isEditing ? 'Edit Course Matrix' : 'Untitled Course Architecture')}
            </h1>
          </div>
        </div>

        {/* Global Studio Action Toolbar */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Live Preview Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLivePreviewModal(true)}
            leftIcon={Eye}
            className="text-[#635E56] dark:text-[#A69F94] hover:text-white border border-[#E3DCD3] dark:border-white/[0.08] bg-[#FAF7F2] dark:bg-[#272523]"
          >
            Live Preview
          </Button>

          {/* Save Draft */}
          <Button
            variant="secondary"
            size="sm"
            isLoading={isSubmitting}
            onClick={() => handleDeployCourse(false)}
            leftIcon={Save}
          >
            Save Draft
          </Button>

          {/* Deploy / Publish Matrix */}
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={() => handleDeployCourse(true)}
            leftIcon={Sparkles}
          >
            {isEditing ? 'Update Course Matrix' : 'Deploy to Catalog'}
          </Button>
        </div>
      </div>

      {/* =====================================================================
          2. HIGH-PRECISION STEPPER NAVIGATION BAR
          ===================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-2 rounded-2xl bg-[#EAE5DC] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08]">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isDone = activeStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`relative p-3 rounded-xl flex items-center gap-3 text-left transition-all duration-300 group ${
                isActive
                  ? 'bg-[#FFFEFA] dark:bg-[#2B2926] border border-[#D5C0D1] dark:border-[#D1A7CC]/40 text-[#5B3E57] dark:text-[#D1A7CC] shadow-xs'
                  : 'hover:bg-white/40 dark:hover:bg-white/[0.03] border border-transparent text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1]'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[#F2ECF1] dark:bg-[#D1A7CC]/20 text-[#5B3E57] dark:text-[#D1A7CC] border border-[#D5C0D1] dark:border-[#D1A7CC]/30'
                    : isDone
                    ? 'bg-[#EBF3EE] dark:bg-[#2B6747]/20 text-[#2B6747] dark:text-[#529E73] border border-[#B7D9C5] dark:border-[#2B6747]/30'
                    : 'bg-[#EAE5DC] dark:bg-[#272523] text-[#756E64] dark:text-[#7A7368] group-hover:text-[#635E56] dark:text-[#A69F94]'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate leading-tight">{step.label}</p>
                <p className="text-[10px] text-[#756E64] dark:text-[#7A7368] truncate hidden sm:block">
                  {step.desc}
                </p>
              </div>

              {isActive && (
                <motion.div
                  layoutId="stepIndicatorGlow"
                  transition={SPRING}
                  className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#5B3E57] dark:bg-[#D1A7CC]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          3. ACTIVE STAGE WORKSPACE RENDERING
          ===================================================================== */}
      <div className="min-h-[500px]">
        {/* STEP 0: IDENTITY & CORE ARCHITECTURE */}
        {activeStep === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left 2 Cols: Main Info Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xs space-y-5">
                <h3 className="text-sm font-mono tracking-widest text-[#5B3E57] dark:text-[#D1A7CC] uppercase font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Core Metadata & Nomenclature
                </h3>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">
                    Course Architecture Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={courseState.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g. Distributed Systems & High-Throughput Microservice Architecture"
                    className="w-full px-4 py-3 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D8D0C5] dark:border-white/[0.08] rounded-xl text-[#282521] dark:text-[#EDE8E1] placeholder:text-[#756E64] dark:placeholder-[#7A7368] focus:outline-none focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/15 dark:focus:border-[#D1A7CC]/60 font-medium transition-all"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">
                    Telemetry Subtitle / Value Proposition
                  </label>
                  <input
                    type="text"
                    value={courseState.subtitle}
                    onChange={(e) => updateField('subtitle', e.target.value)}
                    placeholder="e.g. Master consensus protocols, Kafka event routing, and resilient gRPC meshes."
                    className="w-full px-4 py-3 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D8D0C5] dark:border-white/[0.08] rounded-xl text-[#282521] dark:text-[#EDE8E1] placeholder:text-[#756E64] dark:placeholder-[#7A7368] focus:outline-none focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/15 dark:focus:border-[#D1A7CC]/60 text-sm transition-all"
                  />
                </div>

                {/* Category & Level Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">Domain Category</label>
                    <select
                      value={courseState.category}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-4 py-3 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D8D0C5] dark:border-white/[0.08] rounded-xl text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/15 dark:focus:border-[#D1A7CC]/60 text-sm"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">Engineering Level</label>
                    <select
                      value={courseState.level}
                      onChange={(e) => updateField('level', e.target.value)}
                      className="w-full px-4 py-3 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D8D0C5] dark:border-white/[0.08] rounded-xl text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/15 dark:focus:border-[#D1A7CC]/60 text-sm"
                    >
                      {DIFFICULTY_LEVELS.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.label} — {lvl.desc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">
                      Technical Curriculum Abstract <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[11px] font-mono text-[#756E64] dark:text-[#7A7368]">
                      {courseState.description.length} chars
                    </span>
                  </div>
                  <textarea
                    rows={5}
                    value={courseState.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Provide an in-depth breakdown of the technical challenges, production failure scenarios, and architecture models covered..."
                    className="w-full p-4 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D8D0C5] dark:border-white/[0.08] rounded-xl text-[#282521] dark:text-[#EDE8E1] placeholder:text-[#756E64] dark:placeholder-[#7A7368] focus:outline-none focus:border-[#5B3E57] focus:ring-2 focus:ring-[#5B3E57]/15 dark:focus:border-[#D1A7CC]/60 text-sm leading-relaxed transition-all resize-y"
                  />
                </div>
              </div>

              {/* Learning Outcomes List */}
              <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xs space-y-4">
                <h3 className="text-sm font-mono tracking-widest text-[#5B3E57] dark:text-[#D1A7CC] uppercase font-bold flex items-center gap-2">
                  <Award className="w-4 h-4" /> Core Competencies & Learning Deliverables
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOutcomeInput}
                    onChange={(e) => setNewOutcomeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOutcome()}
                    placeholder="e.g. Implement Raft consensus layer with split-brain prevention"
                    className="flex-1 px-4 py-2.5 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-sm text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                  />
                  <Button variant="secondary" size="sm" onClick={handleAddOutcome} leftIcon={Plus}>
                    Add
                  </Button>
                </div>

                <div className="space-y-2 pt-2">
                  {courseState.outcomes.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A]/70 border border-[#E3DCD3] dark:border-white/[0.08] flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-[#282521] dark:text-[#EDE8E1]">{item}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveOutcome(idx)}
                        className="p-1 rounded-lg hover:bg-rose-500/20 text-[#756E64] dark:text-[#7A7368] hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Monetization, Wallpaper, Tags */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xs space-y-4">
                <h3 className="text-sm font-mono tracking-widest text-[#5B3E57] dark:text-[#D1A7CC] uppercase font-bold flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Pricing & Monetization
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">Catalog Price (USD)</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756E64] dark:text-[#7A7368] font-mono">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={courseState.price}
                        onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-4 py-2.5 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl font-mono text-sm text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">Promotional Flash Price</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756E64] dark:text-[#7A7368] font-mono">
                        $
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={courseState.promotionalPrice}
                        onChange={(e) =>
                          updateField('promotionalPrice', parseFloat(e.target.value) || 0)
                        }
                        className="w-full pl-8 pr-4 py-2.5 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl font-mono text-sm text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallpaper & Thumbnail */}
              <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xs space-y-4">
                <h3 className="text-sm font-mono tracking-widest text-[#5B3E57] dark:text-[#D1A7CC] uppercase font-bold flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Thumbnail Artwork
                </h3>

                <div className="relative aspect-video rounded-xl overflow-hidden border border-[#E3DCD3] dark:border-white/[0.08] bg-[#FFFEFA] dark:bg-[#1D1C1A] group">
                  <img
                    src={courseState.thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent flex items-end p-3">
                    <span className="text-[10px] font-mono text-[#5B3E57] dark:text-[#D1A7CC] uppercase font-bold">
                      Active Studio Canvas
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[#635E56] dark:text-[#A69F94]">Select Obsidian Preset Artwork</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_WALLPAPERS.map((wp, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => updateField('thumbnailUrl', wp)}
                        className={`aspect-video rounded-lg overflow-hidden border transition-all ${
                          courseState.thumbnailUrl === wp
                            ? 'border-[#5B3E57] dark:border-[#D1A7CC] ring-2 ring-[#5B3E57]/20 dark:ring-[#D1A7CC]/30'
                            : 'border-[#E3DCD3] dark:border-white/[0.08] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={wp} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={courseState.thumbnailUrl}
                  onChange={(e) => updateField('thumbnailUrl', e.target.value)}
                  placeholder="Or paste external image URL..."
                  className="w-full px-3 py-2 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-lg text-xs text-[#635E56] dark:text-[#A69F94] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                />
              </div>

              {/* Tags Selector */}
              <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xs space-y-3">
                <h3 className="text-sm font-mono tracking-widest text-[#5B3E57] dark:text-[#D1A7CC] uppercase font-bold flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Discovery Meta Tags
                </h3>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tag (e.g. Rust, Raft)..."
                    className="flex-1 px-3 py-2 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-lg text-xs text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                  />
                  <Button variant="secondary" size="sm" onClick={handleAddTag}>
                    +
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {courseState.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF7F2] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/[0.08] text-xs font-mono text-[#5B3E57] dark:text-[#D1A7CC]"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-400 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 1: ATOMIC CURRICULUM MATRIX */}
        {activeStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            {/* Header Curriculum Stats Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08]">
              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-[#756E64] dark:text-[#7A7368] uppercase">Modules: </span>
                  <span className="font-bold text-[#5B3E57] dark:text-[#D1A7CC]">{totalStats.modules}</span>
                </div>
                <div>
                  <span className="text-[#756E64] dark:text-[#7A7368] uppercase">Lectures: </span>
                  <span className="font-bold text-[#5B3E57] dark:text-[#D1A7CC]">{totalStats.lectures}</span>
                </div>
                <div>
                  <span className="text-[#756E64] dark:text-[#7A7368] uppercase">Evaluations: </span>
                  <span className="font-bold text-emerald-400">{totalStats.quizzes}</span>
                </div>
              </div>

              <Button
                variant="cyan"
                size="sm"
                onClick={handleAddModule}
                leftIcon={Plus}
                className="self-start sm:self-auto"
              >
                Add Module Node
              </Button>
            </div>

            {/* Modules Accordion Tree */}
            <div className="space-y-4">
              {courseState.modules.map((module, mIdx) => {
                const isExpanded = expandedModules[module.moduleId];

                return (
                  <div
                    key={module.moduleId}
                    className="rounded-2xl border border-[#E3DCD3] dark:border-white/[0.08] bg-[#FFFEFA] dark:bg-[#1D1C1A] overflow-hidden transition-all duration-200"
                  >
                    {/* Module Header Bar */}
                    <div className="p-4 bg-[#FFFEFA] dark:bg-[#1D1C1A] border-b border-[#E3DCD3] dark:border-white/[0.08] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Up/Down reorder controls */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            disabled={mIdx === 0}
                            onClick={() => handleMoveModule(mIdx, -1)}
                            className="p-1 hover:bg-[#EAE5DC] dark:bg-[#272523] rounded text-[#635E56] dark:text-[#A69F94] disabled:opacity-20"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={mIdx === courseState.modules.length - 1}
                            onClick={() => handleMoveModule(mIdx, 1)}
                            className="p-1 hover:bg-[#EAE5DC] dark:bg-[#272523] rounded text-[#635E56] dark:text-[#A69F94] disabled:opacity-20"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="w-8 h-8 rounded-lg bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 text-[#5B3E57] dark:text-[#D1A7CC] flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          0{mIdx + 1}
                        </div>

                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => handleUpdateModuleTitle(module.moduleId, e.target.value)}
                          className="flex-1 bg-transparent border-b border-transparent hover:border-[#E3DCD3] dark:border-white/[0.08] focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30 px-2 py-1 text-sm font-bold text-[#282521] dark:text-[#EDE8E1] outline-none transition-colors"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {module.lectures?.length || 0} Lectures
                        </Badge>

                        {module.quiz && (
                          <Badge variant="cyan" className="font-mono text-[10px]">
                            Quiz Module
                          </Badge>
                        )}

                        <button
                          onClick={() => handleDeleteModule(module.moduleId)}
                          className="p-2 rounded-lg hover:bg-rose-500/10 text-[#756E64] dark:text-[#7A7368] hover:text-rose-400 transition-colors"
                          title="Purge Module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleModuleAccordion(module.moduleId)}
                          className="p-2 rounded-lg hover:bg-[#EAE5DC] dark:bg-[#272523] text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:text-[#EDE8E1] transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Inside Module: Lectures List */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-5 space-y-4 bg-[#FFFEFA] dark:bg-[#1D1C1A]/40"
                        >
                          {module.lectures?.map((lecture, lIdx) => {
                            const isUploading = uploadingLectureId === lecture.lectureId;

                            return (
                              <div
                                key={lecture.lectureId}
                                className="p-4 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] space-y-3"
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-xs font-mono text-[#756E64] dark:text-[#7A7368] shrink-0">
                                      #{lIdx + 1}
                                    </span>
                                    <input
                                      type="text"
                                      value={lecture.title}
                                      onChange={(e) =>
                                        handleUpdateLecture(
                                          module.moduleId,
                                          lecture.lectureId,
                                          'title',
                                          e.target.value
                                        )
                                      }
                                      placeholder="Lecture Title..."
                                      className="flex-1 bg-transparent border-b border-[#E3DCD3] dark:border-white/[0.08] focus:border-[#5B3E57] dark:border-[#D1A7CC] px-2 py-1 text-sm font-medium text-[#282521] dark:text-[#EDE8E1] outline-none"
                                    />
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    {/* Duration */}
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] text-xs font-mono text-[#635E56] dark:text-[#A69F94]">
                                      <Clock className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                                      <input
                                        type="text"
                                        value={lecture.duration}
                                        onChange={(e) =>
                                          handleUpdateLecture(
                                            module.moduleId,
                                            lecture.lectureId,
                                            'duration',
                                            e.target.value
                                          )
                                        }
                                        className="w-12 bg-transparent text-center outline-none"
                                      />
                                    </div>

                                    {/* Free Preview Toggle */}
                                    <label className="flex items-center gap-1.5 text-xs text-[#635E56] dark:text-[#A69F94] cursor-pointer select-none">
                                      <input
                                        type="checkbox"
                                        checked={lecture.isPreview}
                                        onChange={(e) =>
                                          handleUpdateLecture(
                                            module.moduleId,
                                            lecture.lectureId,
                                            'isPreview',
                                            e.target.checked
                                          )
                                        }
                                        className="accent-cyan-400 rounded"
                                      />
                                      Free Preview
                                    </label>

                                    {/* Delete Lecture */}
                                    <button
                                      onClick={() =>
                                        handleDeleteLecture(module.moduleId, lecture.lectureId)
                                      }
                                      className="p-1.5 rounded hover:bg-rose-500/10 text-[#756E64] dark:text-[#7A7368] hover:text-rose-400 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Video Upload Telemetry Box */}
                                <div className="p-3 rounded-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-obsidian-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        lecture.uploadStatus === 'ready'
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                          : 'bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] border border-[#D5C0D1] dark:border-[#D1A7CC]/30'
                                      }`}
                                    >
                                      <Video className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-mono text-[#635E56] dark:text-[#A69F94] truncate">
                                        {lecture.videoUrl ? 'Stream Linked' : 'No Video Ingested'}
                                      </p>
                                      <p className="text-[10px] text-[#756E64] dark:text-[#7A7368] font-mono">
                                        Status: {lecture.uploadStatus.toUpperCase()} •{' '}
                                        {lecture.uploadProgress}%
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      isLoading={isUploading}
                                      onClick={() =>
                                        simulateVideoUpload(module.moduleId, lecture.lectureId)
                                      }
                                      leftIcon={UploadCloud}
                                      className="text-xs border-[#E3DCD3] dark:border-white/[0.08]"
                                    >
                                      Simulate Video Ingest
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleAddResource(module.moduleId, lecture.lectureId)
                                      }
                                      leftIcon={Plus}
                                      className="text-xs text-[#635E56] dark:text-[#A69F94] hover:text-white"
                                    >
                                      Attach File ({lecture.resources?.length || 0})
                                    </Button>
                                  </div>
                                </div>

                                {/* Attached Resources Pills */}
                                {lecture.resources?.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {lecture.resources.map((res) => (
                                      <div
                                        key={res.id}
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] text-xs font-mono text-[#635E56] dark:text-[#A69F94]"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                                        <span>{res.title}</span>
                                        <span className="text-ink-600">({res.size})</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Add Lecture inside module */}
                          <button
                            onClick={() => handleAddLecture(module.moduleId)}
                            className="w-full py-3 rounded-xl border border-dashed border-[#E3DCD3] dark:border-white/[0.08] hover:border-[#D5C0D1] dark:border-[#D1A7CC]/30 bg-[#FFFEFA] dark:bg-[#1D1C1A] text-xs font-bold font-mono tracking-wide text-[#635E56] dark:text-[#A69F94] hover:text-[#5B3E57] dark:text-[#D1A7CC] flex items-center justify-center gap-2 transition-all"
                          >
                            <Plus className="w-4 h-4" /> Append Lecture Node to Module
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 2: CHECKPOINT QUIZ STUDIO */}
        {activeStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/10 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 flex items-center gap-3 text-[#5B3E57] dark:text-[#D1A7CC] text-xs leading-relaxed">
              <Info className="w-5 h-5 shrink-0" />
              <span>
                Checkpoint Quizzes test student mastery directly after critical module lectures.
                Scores are synchronized into the student evaluation engine and certificate matrix.
              </span>
            </div>

            <div className="space-y-6">
              {courseState.modules.map((module) => {
                const hasQuiz = Boolean(module.quiz);

                return (
                  <div
                    key={module.moduleId}
                    className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xs space-y-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCD3] dark:border-white/[0.08]">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-[#5B3E57] dark:text-[#D1A7CC] uppercase font-bold">
                          Module Evaluation Layer
                        </span>
                        <h4 className="text-base font-bold text-white">{module.title}</h4>
                      </div>

                      <Button
                        variant={hasQuiz ? 'danger' : 'cyan'}
                        size="sm"
                        onClick={() => handleToggleModuleQuiz(module.moduleId)}
                      >
                        {hasQuiz ? 'Purge Checkpoint Quiz' : '+ Attach Checkpoint Quiz'}
                      </Button>
                    </div>

                    {hasQuiz && module.quiz && (
                      <div className="space-y-5">
                        {/* Quiz Title & Limits */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2 space-y-1.5">
                            <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">
                              Assessment Title
                            </label>
                            <input
                              type="text"
                              value={module.quiz.title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCourseState((prev) => ({
                                  ...prev,
                                  modules: prev.modules.map((m) =>
                                    m.moduleId === module.moduleId && m.quiz
                                      ? { ...m, quiz: { ...m.quiz, title: val } }
                                      : m
                                  ),
                                }));
                              }}
                              className="w-full px-3.5 py-2.5 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-sm text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">
                              Time Allocation (Minutes)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={module.quiz.timeLimit}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 10;
                                setCourseState((prev) => ({
                                  ...prev,
                                  modules: prev.modules.map((m) =>
                                    m.moduleId === module.moduleId && m.quiz
                                      ? { ...m, quiz: { ...m.quiz, timeLimit: val } }
                                      : m
                                  ),
                                }));
                              }}
                              className="w-full px-3.5 py-2.5 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl font-mono text-sm text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                            />
                          </div>
                        </div>

                        {/* Questions List */}
                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-mono text-[#635E56] dark:text-[#A69F94] uppercase font-bold">
                              Evaluation Questions ({module.quiz.questions.length})
                            </h5>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleAddQuizQuestion(module.moduleId)}
                              leftIcon={Plus}
                              className="text-xs"
                            >
                              Add Question
                            </Button>
                          </div>

                          {module.quiz.questions.map((q, qIdx) => (
                            <div
                              key={q.id}
                              className="p-5 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A]/70 border border-[#E3DCD3] dark:border-white/[0.08] space-y-4"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-mono font-bold text-[#5B3E57] dark:text-[#D1A7CC]">
                                  Query 0{qIdx + 1}
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteQuizQuestion(module.moduleId, q.id)
                                  }
                                  className="p-1 rounded hover:bg-rose-500/10 text-[#756E64] dark:text-[#7A7368] hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <textarea
                                rows={2}
                                value={q.text}
                                onChange={(e) =>
                                  handleUpdateQuizQuestion(
                                    module.moduleId,
                                    q.id,
                                    'text',
                                    e.target.value
                                  )
                                }
                                placeholder="State technical evaluation question..."
                                className="w-full p-3 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-sm text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                              />

                              {/* Options */}
                              <div className="space-y-2">
                                <label className="text-[11px] text-[#635E56] dark:text-[#A69F94]">
                                  Select Correct Radio Key:
                                </label>
                                {q.options.map((opt, optIdx) => (
                                  <div
                                    key={optIdx}
                                    className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                                      q.answer === optIdx
                                        ? 'bg-cyan-950/30 border-[#D5C0D1] dark:border-[#D1A7CC]/30'
                                        : 'bg-[#FFFEFA] dark:bg-[#1D1C1A] border-[#E3DCD3] dark:border-white/[0.08]'
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`correct_${q.id}`}
                                      checked={q.answer === optIdx}
                                      onChange={() =>
                                        handleUpdateQuizQuestion(
                                          module.moduleId,
                                          q.id,
                                          'answer',
                                          optIdx
                                        )
                                      }
                                      className="accent-cyan-400 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) =>
                                        handleUpdateQuizOption(
                                          module.moduleId,
                                          q.id,
                                          optIdx,
                                          e.target.value
                                        )
                                      }
                                      className="flex-1 bg-transparent text-xs text-[#282521] dark:text-[#EDE8E1] outline-none"
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Explanation */}
                              <div>
                                <label className="text-[11px] text-[#635E56] dark:text-[#A69F94]">
                                  Architectural Feedback & Verification Note:
                                </label>
                                <input
                                  type="text"
                                  value={q.explanation || ''}
                                  onChange={(e) =>
                                    handleUpdateQuizQuestion(
                                      module.moduleId,
                                      q.id,
                                      'explanation',
                                      e.target.value
                                    )
                                  }
                                  placeholder="Why is this answer correct? Provide reference to system topology..."
                                  className="w-full px-3 py-2 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-lg text-xs text-[#635E56] dark:text-[#A69F94] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30 mt-1"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 3: LABS & ASSIGNMENTS STUDIO */}
        {activeStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-300 text-xs">
              <Terminal className="w-5 h-5 shrink-0" />
              <span>
                Laboratory exercises give learners hands-on coding milestones. Instructors can grade
                submitted code repositories or dockerized deployments directly.
              </span>
            </div>

            <div className="space-y-6">
              {courseState.modules.map((module) => {
                const hasLab = Boolean(module.assignment);

                return (
                  <div
                    key={module.moduleId}
                    className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xs space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCD3] dark:border-white/[0.08]">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold">
                          Practical Lab Specification
                        </span>
                        <h4 className="text-base font-bold text-white">{module.title}</h4>
                      </div>

                      <Button
                        variant={hasLab ? 'danger' : 'secondary'}
                        size="sm"
                        onClick={() => handleToggleModuleAssignment(module.moduleId)}
                      >
                        {hasLab ? 'Purge Lab Node' : '+ Configure Practical Lab'}
                      </Button>
                    </div>

                    {hasLab && module.assignment && (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">Lab Title</label>
                            <input
                              type="text"
                              value={module.assignment.title}
                              onChange={(e) =>
                                handleUpdateAssignment(module.moduleId, 'title', e.target.value)
                              }
                              className="w-full px-3.5 py-2.5 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-sm text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">
                              Due Window Target
                            </label>
                            <input
                              type="text"
                              value={module.assignment.dueDate}
                              onChange={(e) =>
                                handleUpdateAssignment(module.moduleId, 'dueDate', e.target.value)
                              }
                              placeholder="e.g. In 5 days"
                              className="w-full px-3.5 py-2.5 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-sm text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#635E56] dark:text-[#A69F94]">
                            Problem Statement & Architecture Invariants
                          </label>
                          <textarea
                            rows={3}
                            value={module.assignment.description}
                            onChange={(e) =>
                              handleUpdateAssignment(
                                module.moduleId,
                                'description',
                                e.target.value
                              )
                            }
                            className="w-full p-3 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-sm text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#D5C0D1] dark:border-[#D1A7CC]/30 leading-relaxed"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* STEP 4: PRE-FLIGHT AUDIT & RELEASE PIPELINE */}
        {activeStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left 2 Cols: Pre-flight Audit Matrix */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E3DCD3] dark:border-white/[0.08]">
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-[#5B3E57] dark:text-[#D1A7CC] uppercase font-bold">
                      Automated Pre-Flight Gatekeeper
                    </span>
                    <h3 className="text-lg font-bold text-white">System Readiness Assessment</h3>
                  </div>

                  {/* Readiness Score Pill */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-[#635E56] dark:text-[#A69F94] font-mono">Readiness Index</p>
                      <p
                        className={`text-xl font-black font-mono ${
                          auditMetrics.score === 100 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {auditMetrics.score}%
                      </p>
                    </div>
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border font-mono font-bold text-sm ${
                        auditMetrics.score === 100
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {auditMetrics.score === 100 ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Audit Checklist Items */}
                <div className="space-y-3">
                  {auditMetrics.checks.map((check) => (
                    <div
                      key={check.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        check.passed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                          : check.isWarningOnly
                          ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                          : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {check.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : check.isWarningOnly ? (
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">{check.label}</p>
                          <p className="text-xs text-[#635E56] dark:text-[#A69F94] font-mono">{check.detail}</p>
                        </div>
                      </div>

                      <Badge
                        variant={check.passed ? 'success' : check.isWarningOnly ? 'warning' : 'danger'}
                        className="font-mono text-[10px]"
                      >
                        {check.passed ? 'VERIFIED' : check.isWarningOnly ? 'OPTIONAL' : 'REQUIRED'}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Deploy Action Area */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E3DCD3] dark:border-white/[0.08]">
                  <p className="text-xs text-[#635E56] dark:text-[#A69F94]">
                    Once broadcast, the course model will immediately mount to both the public catalog
                    and the student learning portal.
                  </p>

                  <Button
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    disabled={!auditMetrics.isDeployable}
                    onClick={() => handleDeployCourse(true)}
                    leftIcon={Sparkles}
                    className="w-full sm:w-auto font-bold"
                  >
                    Deploy to Production
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Col: Live Discovery Card Preview */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono tracking-widest text-[#635E56] dark:text-[#A69F94] uppercase font-bold">
                Marketplace Discovery Preview
              </h4>

              <div className="rounded-2xl border border-[#E3DCD3] dark:border-white/[0.08] bg-[#FFFEFA] dark:bg-[#1D1C1A] overflow-hidden shadow-2xl space-y-4 p-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08]">
                  <img
                    src={courseState.thumbnailUrl}
                    alt={courseState.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="cyan" className="font-mono text-[10px]">
                      {courseState.level}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-[#5B3E57] dark:text-[#D1A7CC] uppercase font-bold">
                    {courseState.category}
                  </span>
                  <h3 className="text-base font-bold text-white line-clamp-2">
                    {courseState.title || 'Course Architecture Title'}
                  </h3>
                  <p className="text-xs text-[#635E56] dark:text-[#A69F94] line-clamp-2">
                    {courseState.description || 'Course technical abstract will display here.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E3DCD3] dark:border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black font-mono text-white">
                      ${courseState.promotionalPrice || courseState.price}
                    </span>
                    {courseState.promotionalPrice && (
                      <span className="text-xs line-through text-[#756E64] dark:text-[#7A7368] font-mono">
                        ${courseState.price}
                      </span>
                    )}
                  </div>
                  <Badge variant="success" className="text-[10px] font-mono">
                    ● Enrolling Live
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* =====================================================================
          4. LIVE PREVIEW MODAL CANVAS
          ===================================================================== */}
      <AnimatePresence>
        {showLivePreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[85vh] bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-2xl overflow-y-auto p-6 space-y-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E3DCD3] dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <Badge variant="cyan" className="font-mono text-xs">
                    Classroom Simulator
                  </Badge>
                  <h3 className="text-lg font-bold text-white">Live Student Perspective</h3>
                </div>
                <button
                  onClick={() => setShowLivePreviewModal(false)}
                  className="p-2 rounded-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] hover:bg-[#EAE5DC] dark:bg-[#272523] text-[#635E56] dark:text-[#A69F94] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mock Video Canvas */}
              <div className="aspect-video rounded-xl overflow-hidden bg-black border border-[#E3DCD3] dark:border-white/[0.08] relative group flex items-center justify-center">
                <video
                  src={SAMPLE_VIDEO_STREAM}
                  controls
                  className="w-full h-full object-cover"
                  poster={courseState.thumbnailUrl}
                />
              </div>

              {/* Mock Syllabus */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#5B3E57] dark:text-[#D1A7CC] font-bold">
                  Curriculum Breakdown Preview ({courseState.modules.length} Modules)
                </h4>
                <div className="space-y-2">
                  {courseState.modules.map((mod, idx) => (
                    <div
                      key={mod.moduleId}
                      className="p-3 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] text-sm flex items-center justify-between"
                    >
                      <span className="font-medium text-[#282521] dark:text-[#EDE8E1]">
                        {idx + 1}. {mod.title}
                      </span>
                      <span className="text-xs font-mono text-[#756E64] dark:text-[#7A7368]">
                        {mod.lectures?.length || 0} Lectures
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="secondary" onClick={() => setShowLivePreviewModal(false)}>
                  Close Simulator
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateCourse;