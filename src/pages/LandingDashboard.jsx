import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  Code2,
  ChevronDown,
  User,
  Star,
  Quote,
  HelpCircle,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Compass,
  Users,
  TrendingUp,
  Award,
  Server,
  Database,
  Lock,
  Zap,
  Activity,
  Play,
  Check,
  Clock,
  ChevronRight,
} from 'lucide-react';
import HeaderNav from '../design-system/layout/HeaderNav';
import CourseCard from '../design-system/components/CourseCard';
import { CourseCardSkeleton } from '../design-system/primitives/Skeleton';
import EmptyState from '../design-system/feedback/EmptyState';
import ErrorBoundary from '../design-system/feedback/ErrorBoundary';
import Button from '../design-system/primitives/Button';
import Badge from '../design-system/primitives/Badge';
import { useAuth } from '../context/AuthContext';
import { useCourses } from '../hooks/useCourses';
import { cmsPublicApi } from '../api/cmsApi';
import BannerSlider from '../layouts/BannerSlider';
import {
  parseStatisticRecord,
  resolveStatisticDisplay,
  DEFAULT_STATISTICS_CONFIG,
} from '../utils/statisticsCalculator';

const ICON_MAP = {
  BookOpen,
  Users,
  Star,
  GraduationCap,
  Terminal,
  ShieldCheck,
  Cpu,
  Award,
  TrendingUp,
  Server,
  Database,
  Lock,
};

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

const LUXURY_EASING = [0.16, 1, 0.3, 1];

const sanitizeCustomerFacingText = (text = '') => {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/#\d+/g, '')
    .replace(/\b(FD_LMS|CyberLearnix|Initialize Portal Matrix|Access Authenticated Node|Start Track|Curriculum Discovery Matrix)\b/gi, (match) => {
      const lower = match.toLowerCase();
      if (lower.includes('fd_lms') || lower.includes('cyberlearnix')) return 'Asivo LMS';
      if (lower.includes('portal matrix') || lower.includes('start track')) return 'Explore Courses';
      if (lower.includes('authenticated node')) return 'View Learning Paths';
      return 'Explore Curriculum';
    })
    .trim();
};

export const LandingDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [activeFaqCategory, setActiveFaqCategory] = useState('ALL');
  const [activeSandboxTab, setActiveSandboxTab] = useState('kafka');
  const [isSimulatingPayload, setIsSimulatingPayload] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState([
    '● System Initialized: All 17 Spring Boot microservices listening on Port 8080.',
    '● Kafka Broker connected on :9092. Partitions [0, 1, 2] rebalanced.',
    '● PostgreSQL 16 schema pool initialized: max_connections=100.',
    '● Redis Sentinel heartbeat healthy: replication_lag=0ms.',
  ]);

  // Dynamic CMS state initialized with senior product content
  const [cmsData, setCmsData] = useState({
    hero: {
      badgeText: 'ENGINEERING LEARNING PLATFORM',
      verificationLabel: 'Production Standards',
      heading: 'Master Production Systems. Engineered on Real Architecture.',
      headingEmphasis: 'Real Architecture.',
      description: 'Deploy, debug, and scale real Spring Boot microservices, Kafka event pipelines, and PostgreSQL multi-tenant databases with automated production PR reviews. Zero toy projects.',
      primaryCta: { label: 'Explore 400+ Tracks', destination: '/courses', visible: true },
      secondaryCta: { label: 'Interactive Sandbox', destination: '#architecture-sandbox', visible: true },
      searchPlaceholder: 'Search topics, distributed architectures, or instructors (e.g. Kafka, Spring Boot, K8s)...',
      searchVisible: true,
      textAlignment: 'center',
      sectionVisible: true,
    },
    navigation: null,
    sections: [],
    statistics: null,
    footer: null,
    siteSettings: null,
  });

  const [cmsTestimonials, setCmsTestimonials] = useState(null);

  // Query published CMS configuration on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCmsLandingPage() {
      try {
        const [res, testRes] = await Promise.allSettled([
          cmsPublicApi.getLandingPage(),
          cmsPublicApi.getTestimonials(),
        ]);
        if (!isMounted) return;

        if (res.status === 'fulfilled' && res.value) {
          const data = res.value?.data || res.value;
          if (data && typeof data === 'object') {
            setCmsData(prev => ({
              ...prev,
              hero: data.hero ? {
                ...prev.hero,
                ...data.hero,
                badgeText: sanitizeCustomerFacingText(data.hero.badgeText || prev.hero.badgeText),
                verificationLabel: sanitizeCustomerFacingText(data.hero.verificationLabel || prev.hero.verificationLabel),
                heading: sanitizeCustomerFacingText(data.hero.heading || prev.hero.heading),
                headingEmphasis: sanitizeCustomerFacingText(data.hero.headingEmphasis || prev.hero.headingEmphasis),
                description: sanitizeCustomerFacingText(data.hero.description || prev.hero.description),
                primaryCta: data.hero.primaryCta ? {
                  ...data.hero.primaryCta,
                  label: sanitizeCustomerFacingText(data.hero.primaryCta.label || 'Explore 400+ Tracks'),
                  destination: data.hero.primaryCta.destination || '/courses',
                } : prev.hero.primaryCta,
                secondaryCta: data.hero.secondaryCta ? {
                  ...data.hero.secondaryCta,
                  label: (data.hero.secondaryCta.label === 'Login' || !data.hero.secondaryCta.label) ? 'Interactive Sandbox' : sanitizeCustomerFacingText(data.hero.secondaryCta.label),
                  destination: (data.hero.secondaryCta.destination === '/login' || !data.hero.secondaryCta.destination) ? '#architecture-sandbox' : data.hero.secondaryCta.destination,
                } : prev.hero.secondaryCta,
              } : prev.hero,
              navigation: Array.isArray(data.navigation) ? data.navigation : prev.navigation,
              sections: Array.isArray(data.sections) ? data.sections : prev.sections,
              statistics: Array.isArray(data.statistics) ? data.statistics : prev.statistics,
              footer: data.footer || prev.footer,
              siteSettings: data.siteSettings || prev.siteSettings,
            }));
          }
        }

        if (testRes.status === 'fulfilled' && testRes.value) {
          const tList = testRes.value?.data || testRes.value;
          if (Array.isArray(tList) && tList.length > 0) {
            setCmsTestimonials(tList.map(t => ({
              quote: t.content,
              author: t.authorName || t.author_name,
              role: t.authorRole || t.author_role || 'Staff Infrastructure Engineer',
              avatar: t.avatarUrl || t.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              track: t.company || 'Distributed Systems Track',
              rating: t.rating || 5,
            })));
          }
        }
      } catch (err) {
        console.warn('CMS public landing configuration fallback active:', err?.message || err);
      }
    }
    loadCmsLandingPage();
    return () => { isMounted = false; };
  }, []);

  // Query live courses from backend microservice
  const { data, isLoading, isError, error, refetch, isFetching } = useCourses({
    page: 0,
    size: 24,
    sortBy: 'id',
    sortDir: 'asc', // Bring authentic curated courses to the forefront
  });

  const allCourses = useMemo(() => data?.courses || [], [data]);

  // Derived categories dynamically from backend courses
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(allCourses.map((c) => c.category).filter(Boolean))
    );
    return ['ALL', ...unique];
  }, [allCourses]);

  // Secondary CTA destination resolution
  const heroSecondaryCta = useMemo(() => {
    if (isAuthenticated && user) {
      const role = (user.role || '').toUpperCase();
      if (role.includes('ADMIN')) {
        return { label: 'Admin Command Center', destination: '/admin/dashboard' };
      }
      if (role === 'INSTRUCTOR') {
        return { label: 'Instructor Studio', destination: '/instructor/dashboard' };
      }
      return { label: 'Student Workspace', destination: '/student/dashboard' };
    }
    const cta = cmsData.hero?.secondaryCta;
    const label = (!cta?.label || cta.label === 'Login') ? 'Interactive Sandbox' : cta.label;
    const destination = (!cta?.destination || cta.destination === '/login') ? '#architecture-sandbox' : cta.destination;
    return { label, destination };
  }, [isAuthenticated, user, cmsData.hero?.secondaryCta]);

  // Authoritative platform telemetry data
  const telemetry = useMemo(() => {
    const activeCoursesCount = data?.totalElements || allCourses.length || 401;
    return {
      activeCoursesCount,
      enrolledStudentsCount: 40850,
      averageRating: 4.9,
      instructorsCount: 24,
    };
  }, [allCourses.length, data?.totalElements]);

  // Statistics configured via CMS
  const statisticsList = useMemo(() => {
    const rawList = Array.isArray(cmsData.statistics) && cmsData.statistics.length > 0
      ? cmsData.statistics
      : DEFAULT_STATISTICS_CONFIG;

    return rawList
      .map((item, idx) => parseStatisticRecord(item, idx))
      .filter(item => item.isVisible !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map(item => resolveStatisticDisplay(item, telemetry));
  }, [cmsData.statistics, telemetry]);

  // Filter courses based on search query, category, and level
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (course.title && course.title.toLowerCase().includes(q)) ||
        (course.description && course.description.toLowerCase().includes(q)) ||
        (course.instructor && course.instructor.toLowerCase().includes(q)) ||
        (course.category && course.category.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'ALL' ||
        (course.category && course.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchesLevel =
        selectedLevel === 'ALL' ||
        (course.level && course.level.toLowerCase().includes(selectedLevel.toLowerCase()));

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allCourses, searchQuery, selectedCategory, selectedLevel]);

  // Top 8 Curated courses for high aesthetic density and zero grid fatigue
  const curatedShowcaseCourses = useMemo(() => {
    return filteredCourses.slice(0, 8);
  }, [filteredCourses]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedLevel('ALL');
  };

  const { hero } = cmsData;

  const scrollToSection = (destination) => {
    if (destination?.startsWith('#')) {
      const el = document.getElementById(destination.replace('#', ''));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(destination || '/courses');
  };

  // Interactive Architecture Sandbox Simulation
  const triggerSandboxSimulation = (type) => {
    setIsSimulatingPayload(true);
    const timestamp = new Date().toLocaleTimeString();

    if (type === 'kafka') {
      setSimulationLogs(prev => [
        `[${timestamp}] ❯ PRODUCER -> topic: order.checkout.v1 | partition: 1 | offset: 4092`,
        `[${timestamp}] ❯ KAFKA-CONSUMER -> Group 'payment-orchestrator' received 1 event`,
        `[${timestamp}] ❯ SAGA-STEP -> Initiating idempotency hash verification: OK (0.8ms)`,
        ...prev.slice(0, 4),
      ]);
    } else if (type === 'gateway') {
      setSimulationLogs(prev => [
        `[${timestamp}] ❯ GATEWAY :8080 -> Incoming request POST /api/v1/orders`,
        `[${timestamp}] ❯ JWT-VALIDATE -> RS256 key rotation verified | claims: {role: 'STAFF_ENG'}`,
        `[${timestamp}] ❯ RATE-LIMITER -> Bucket remaining tokens: 98/100 | latency: 1.2ms`,
        ...prev.slice(0, 4),
      ]);
    } else if (type === 'postgres') {
      setSimulationLogs(prev => [
        `[${timestamp}] ❯ POSTGRESQL 16 -> SET search_path TO tenant_enterprise_01`,
        `[${timestamp}] ❯ HIKARICP-POOL -> Borrowed connection in 0.4ms (active: 12, idle: 88)`,
        `[${timestamp}] ❯ QUERY-PLAN -> Index Scan on order_ledger (cost=0.29..8.31 rows=1) (0.9ms)`,
        ...prev.slice(0, 4),
      ]);
    } else if (type === 'redis') {
      setSimulationLogs(prev => [
        `[${timestamp}] ❯ REDIS SENTINEL -> SET lock:course:401 NX PX 5000: ACQUIRED`,
        `[${timestamp}] ❯ CACHE-LOOKUP -> Key 'catalog:featured:v2' HIT (cached TTL: 594s)`,
        `[${timestamp}] ❯ STOMP-SOCKET -> Broadcast metrics payload to 84 connected clients`,
        ...prev.slice(0, 4),
      ]);
    }

    setTimeout(() => {
      setIsSimulatingPayload(false);
    }, 450);
  };

  // Architectural Learning Paths
  const learningPaths = [
    {
      id: 'backend',
      title: 'Staff Backend Systems Architect',
      tagline: 'High-Throughput Distributed Microservices',
      description: 'Master high-concurrency Spring Boot microservices, gRPC protocols, event-driven Kafka pipelines, and distributed transaction sagas.',
      skills: ['Microservices', 'Spring Boot 3', 'Kafka', 'Redis Sentinel', 'PostgreSQL 16'],
      duration: '16 Weeks',
      coursesCount: 5,
      salary: '$180,000+ Avg Role Compensation',
      destination: '/courses?search=backend',
    },
    {
      id: 'cloud',
      title: 'Cloud-Native & SRE Infrastructure Lead',
      tagline: 'Resilient Kubernetes & Platform Engineering',
      description: 'Architect containerized environments, manage Kubernetes clusters, automate Terraform provisioning, and practice chaos engineering under live load.',
      skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Prometheus', 'CI/CD'],
      duration: '14 Weeks',
      coursesCount: 4,
      salary: '$175,000+ Avg Role Compensation',
      destination: '/courses?search=cloud',
    },
    {
      id: 'security',
      title: 'Application Security & Zero-Trust Architect',
      tagline: 'Defensive IAM & Cryptographic Protocols',
      description: 'Implement zero-trust security architectures, OAuth2/OIDC federation, API gateways, JWT rotation, and defensive vulnerability scanning.',
      skills: ['Zero-Trust', 'OAuth2 / OIDC', 'JWT Rotation', 'RBAC Matrix', 'Pen Testing'],
      duration: '12 Weeks',
      coursesCount: 4,
      salary: '$185,000+ Avg Role Compensation',
      destination: '/courses?search=security',
    },
    {
      id: 'data',
      title: 'High-Throughput Data & Storage Engineer',
      tagline: 'Event Streaming & Real-Time Analytics',
      description: 'Design distributed data storage, fine-tune PostgreSQL indexes, implement Redis caching strategies, and process streaming data with Kafka.',
      skills: ['Apache Kafka', 'PostgreSQL', 'Redis', 'Event Streaming', 'Query Tuning'],
      duration: '12 Weeks',
      coursesCount: 4,
      salary: '$170,000+ Avg Role Compensation',
      destination: '/courses?search=data',
    },
  ];

  // Lead Faculty
  const instructors = [
    {
      name: 'Geeta Kapoor',
      title: 'Principal Software Architect',
      experience: '15 Published Courses • Distributed Systems & Clean Code',
      company: 'Ex-Lead Systems Architect, Global Fintech',
      topics: 'Clean Code, Design Patterns, Refactoring',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Priyanka Zacharia',
      title: 'Cloud Systems & Kubernetes Lead',
      experience: '15 Published Courses • Production Infrastructure',
      company: 'Platform Lead, CloudScale Engineering',
      topics: 'Kubernetes, Docker, Cloud-Native Resilience',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Suman Chopra',
      title: 'Distributed Systems Architect',
      experience: '16 Published Courses • High-Throughput Pipelines',
      company: 'Principal Architect, Enterprise Streaming',
      topics: 'Microservices, Event Streaming, Distributed DBs',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    },
    {
      name: 'Rajendra Mathew',
      title: 'Principal Backend Engineer',
      experience: '20 Published Courses • Enterprise Persistence & SQL',
      company: 'Database Performance Specialist',
      topics: 'PostgreSQL, High-Concurrency DBs, Cache Topology',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    },
  ];

  // Verified Outcomes & Testimonials
  const defaultTestimonials = [
    {
      quote: 'Asivo’s verified curriculum is unmatched. Debugged real Redis cache stampedes and Kafka partition rebalances under actual production load during the capstone lab.',
      author: 'Elena Rostova',
      role: 'Principal Architect at Fintech Global',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      track: 'Distributed Systems Track',
      rating: 5,
    },
    {
      quote: 'Comprehensive coverage of actual engineering judgment. The automated grading test suites mirror actual senior engineering PR reviews with real static analysis.',
      author: 'Maya Patel',
      role: 'Cloud Infrastructure Lead at CloudScale',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      track: 'Cloud-Native & SRE Track',
      rating: 5,
    },
    {
      quote: 'Zero synthetic boilerplate. Every single module deploys real containerized Spring services. I secured a promotion to Staff Engineer within 3 months of completion.',
      author: 'Liam O’Connor',
      role: 'Staff Data Systems Engineer at DataNexus',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      track: 'High-Throughput Data Track',
      rating: 5,
    },
  ];

  const testimonialsList = useMemo(() => {
    if (Array.isArray(cmsTestimonials) && cmsTestimonials.length > 0) {
      return cmsTestimonials;
    }
    return defaultTestimonials;
  }, [cmsTestimonials, defaultTestimonials]);

  // Frequently Asked Questions
  const allFaqs = [
    {
      category: 'SANDBOXES',
      question: 'Do I get hands-on access to realistic production sandboxes?',
      answer: 'Yes. Courses with practical components provide access to genuine containerized Spring Boot microservices, live PostgreSQL instances, Redis caching, and Kafka message brokers so you practice authentic troubleshooting under production-like conditions.',
    },
    {
      category: 'CERTIFICATIONS',
      question: 'How does cryptographic certificate verification work for employers?',
      answer: 'Every completion certificate issued by Asivo LMS includes an unforgeable cryptographic verification identifier and a public verification URL (/certifications). Employers can directly inspect the syllabus criteria, student completion date, and verified grades without requiring any login.',
    },
    {
      category: 'CURRICULUM',
      question: 'Can I study at my own pace, or are there fixed deadlines?',
      answer: 'All enrolled courses grant lifetime access to course materials, source code repositories, and curriculum updates. You can complete lectures, exercises, and assessments according to your own professional schedule.',
    },
    {
      category: 'CURRICULUM',
      question: 'Can I access courses and classroom workspaces on mobile devices?',
      answer: 'Yes. Asivo LMS is fully responsive across mobile, tablet, and desktop viewports. You can watch lectures, review documentation, track progress, and browse curriculum tracks comfortably from any modern mobile device.',
    },
    {
      category: 'PAYMENTS',
      question: 'What happens if a payment fails during checkout?',
      answer: 'Our checkout gateway employs server-side idempotent order verification. If a transaction fails or is interrupted, no enrollment charges will be captured, and you can safely retry with alternate payment methods or contact support@asivo.io for immediate assistance.',
    },
  ];

  const filteredFaqs = useMemo(() => {
    if (activeFaqCategory === 'ALL') return allFaqs;
    return allFaqs.filter(f => f.category === activeFaqCategory);
  }, [activeFaqCategory, allFaqs]);

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] flex flex-col selection:bg-[#5B3E57]/15 selection:text-[#5B3E57] dark:selection:bg-[#D1A7CC]/25 dark:selection:text-[#EDE8E1] font-sans antialiased overflow-x-hidden transition-colors duration-300">
      {/* Top Floating Glass Header with dynamic CMS integration */}
      <HeaderNav initialNav={cmsData.navigation} initialSettings={cmsData.siteSettings} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-16 sm:space-y-24">
        
        {/* ===================== HERO SECTION ===================== */}
        {hero.sectionVisible !== false && (
          <section className="relative pt-6 pb-8 sm:pt-12 sm:pb-16 text-center overflow-hidden">
            
            {/* Ambient Lighting & Architectural Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(91,62,87,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(209,167,204,0.06),transparent)] pointer-events-none -z-10" />

            {/* Announcement / Status Micro-Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: LUXURY_EASING }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FFFEFA]/90 dark:bg-[#1D1C1A]/90 border border-[#E3DCD3] dark:border-white/10 text-xs font-semibold text-[#635E56] dark:text-[#A69F94] backdrop-blur-xl mb-6 shadow-xs hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#2B6747] dark:bg-[#529E73] animate-pulse" />
              <span className="tracking-wider uppercase text-[11px] font-bold text-[#5B3E57] dark:text-[#D1A7CC]">
                {hero.badgeText || '2026 ARCHITECTURE TRACKS OPEN'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E3DCD3] dark:bg-white/20" />
              <span className="text-[11px] font-medium text-[#756E64] dark:text-[#A69F94]">
                {hero.verificationLabel || 'Production Standards'}
              </span>
            </motion.div>

            {/* Main Title with Sculpted Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: LUXURY_EASING }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#282521] dark:text-[#EDE8E1] max-w-4xl mx-auto leading-[1.08]"
            >
              Master Production Systems.{' '}
              <span className="text-[#5B3E57] dark:text-[#D1A7CC] underline decoration-[#9A6B56]/40 underline-offset-8">
                On Real Architecture.
              </span>
            </motion.h1>

            {/* Subtitle in Constrained Measure */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.14, ease: LUXURY_EASING }}
              className="mt-6 text-base sm:text-lg text-[#635E56] dark:text-[#A69F94] max-w-2xl mx-auto leading-relaxed"
            >
              {hero.description || 'Deploy, debug, and scale real Spring Boot microservices, Kafka event pipelines, and PostgreSQL multi-tenant databases with automated production PR reviews. Zero toy projects.'}
            </motion.p>

            {/* Primary & Secondary Call to Action Deck */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: LUXURY_EASING }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-7 w-full max-w-xs sm:max-w-none mx-auto"
            >
              <Button
                variant="primary"
                onClick={() => navigate(hero.primaryCta?.destination || '/courses')}
                className="px-7 py-3.5 font-bold shadow-md shadow-[#5B3E57]/15 flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer text-sm"
              >
                <span>{hero.primaryCta?.label || 'Explore 400+ Tracks'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  if (heroSecondaryCta.destination?.startsWith('#')) {
                    scrollToSection(heroSecondaryCta.destination);
                  } else {
                    navigate(heroSecondaryCta.destination);
                  }
                }}
                className="px-7 py-3.5 font-semibold flex items-center justify-center w-full sm:w-auto cursor-pointer text-sm border-[#E3DCD3] dark:border-white/10"
              >
                {heroSecondaryCta.label}
              </Button>
            </motion.div>

            {/* Interactive Search Command Dock with Quick Topic Tags */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.22, ease: LUXURY_EASING }}
              className="mt-10 max-w-2xl mx-auto space-y-3"
            >
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center p-2 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-sm focus-within:border-[#5B3E57] dark:focus-within:border-[#D1A7CC] transition-all"
              >
                <div className="pl-3.5 text-[#756E64] dark:text-[#7A7368]">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={hero.searchPlaceholder || 'Search topics, distributed architectures, or instructors...'}
                  className="w-full px-3 py-2 text-sm text-[#282521] dark:text-[#EDE8E1] bg-transparent outline-none placeholder:text-[#756E64] dark:placeholder:text-[#7A7368]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-2.5 py-1 text-xs text-[#756E64] hover:text-[#282521] dark:hover:text-[#EDE8E1] mr-1 transition-colors cursor-pointer"
                    aria-label="Clear Search"
                  >
                    Clear
                  </button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="shrink-0 cursor-pointer font-bold px-5"
                >
                  Search
                </Button>
              </form>

              {/* Quick Topic Shortcut Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#756E64] dark:text-[#7A7368] pt-1">
                <span className="font-semibold text-[11px] mr-1">Trending:</span>
                {['Microservices', 'Kubernetes', 'Kafka', 'Spring Boot', 'Zero-Trust', 'PostgreSQL'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      navigate(`/courses?search=${encodeURIComponent(tag)}`);
                    }}
                    className="px-2.5 py-0.5 rounded-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/5 hover:border-[#5B3E57] dark:hover:border-[#D1A7CC] text-[11px] font-medium text-[#635E56] dark:text-[#A69F94] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-all cursor-pointer shadow-2xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Seamless Telemetry & Trust Ribbon */}
            {statisticsList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28, ease: LUXURY_EASING }}
                className="mt-12 sm:mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto"
              >
                {statisticsList.map((statItem, idx) => {
                  const IconComp = ICON_MAP[statItem.icon] || TrendingUp;
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/30 transition-all flex flex-col items-center text-center shadow-xs group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-2xl lg:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                        {statItem.fullDisplayString}
                      </span>
                      <span className="text-xs text-[#635E56] dark:text-[#A69F94] font-semibold mt-0.5">
                        {statItem.label}
                      </span>
                      <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] mt-0.5 line-clamp-1">
                        {statItem.label === 'Average Rating'
                          ? '1,200+ Verified Reviews'
                          : statItem.label === 'Enrolled Engineers'
                          ? 'Active in Production'
                          : 'Enterprise Calibrated'}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </section>
        )}

        {/* ===================== PROMOTIONAL BANNER SHOWCASE ===================== */}
        <BannerSlider />

        {/* ===================== INTERACTIVE ARCHITECTURE PLAYGROUND ===================== */}
        <section id="architecture-sandbox" className="py-6 sm:py-8 space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 text-xs font-bold text-[#5B3E57] dark:text-[#D1A7CC]">
              <Cpu className="w-3.5 h-3.5" />
              <span>THE ASIVO DIFFERENCE</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#282521] dark:text-[#EDE8E1]">
              Experience the Live Sandbox Topology
            </h2>
            <p className="text-sm sm:text-base text-[#635E56] dark:text-[#A69F94] leading-relaxed">
              Unlike theoretical video tutorials, every Asivo curriculum project executes on real containerized microservices. Click an architectural node below to simulate production traffic.
            </p>
          </div>

          {/* Interactive Topology Container */}
          <div className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Architectural Tab Switcher */}
            <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#E3DCD3] dark:border-white/10 pb-4">
              {[
                { id: 'kafka', label: '1. Event-Driven Pipeline', icon: Activity, desc: 'Kafka Partition Rebalance' },
                { id: 'gateway', label: '2. Edge API Gateway', icon: ShieldCheck, desc: 'Spring Cloud & JWT Rotation' },
                { id: 'postgres', label: '3. Multi-Tenant DB', icon: Database, desc: 'PostgreSQL Schema Pool' },
                { id: 'redis', label: '4. Cache & Session Mesh', icon: Zap, desc: 'Redis Distributed Locks' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSandboxTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveSandboxTab(tab.id);
                      triggerSandboxSimulation(tab.id);
                    }}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] shadow-xs'
                        : 'bg-[#F5F2EC] dark:bg-[#272523] text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Split Screen: Visual Architecture Node + Live Terminal Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Architecture Blueprint Card */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/10 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 font-bold text-[#5B3E57] dark:text-[#D1A7CC]">
                      Containerized Sandbox
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-[#2B6747] dark:text-[#529E73] font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#2B6747] dark:bg-[#529E73] animate-pulse" />
                      Live Status: 200 OK
                    </span>
                  </div>

                  {activeSandboxTab === 'kafka' && (
                    <>
                      <h3 className="text-xl font-bold text-[#282521] dark:text-[#EDE8E1]">
                        Event Sourcing & Kafka Streams
                      </h3>
                      <p className="text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                        Simulate asynchronous events between user registrations, order payments, and notification broadcasts without message loss.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {['Apache Kafka 3.6', '3 Partitions', 'Exactly-Once', 'Dead-Letter Queue'].map(chip => (
                          <span key={chip} className="px-2 py-0.5 rounded-md bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 text-[10px] font-medium text-[#635E56] dark:text-[#A69F94]">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {activeSandboxTab === 'gateway' && (
                    <>
                      <h3 className="text-xl font-bold text-[#282521] dark:text-[#EDE8E1]">
                        Edge Security & Dynamic JWT
                      </h3>
                      <p className="text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                        Reverse-proxy all client requests on Port 8080 with cryptographic public-key token verification and token-bucket rate limiting.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {['Spring Cloud Gateway', 'Netty Reactive', 'RS256 JWT Rotation', 'Rate Limiting'].map(chip => (
                          <span key={chip} className="px-2 py-0.5 rounded-md bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 text-[10px] font-medium text-[#635E56] dark:text-[#A69F94]">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {activeSandboxTab === 'postgres' && (
                    <>
                      <h3 className="text-xl font-bold text-[#282521] dark:text-[#EDE8E1]">
                        Multi-Tenant Relational Schemas
                      </h3>
                      <p className="text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                        Execute production SQL queries against partitioned schema environments with zero cross-tenant data leakage.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {['PostgreSQL 16', 'HikariCP Pool', 'Schema Isolation', 'ACID Sagas'].map(chip => (
                          <span key={chip} className="px-2 py-0.5 rounded-md bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 text-[10px] font-medium text-[#635E56] dark:text-[#A69F94]">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {activeSandboxTab === 'redis' && (
                    <>
                      <h3 className="text-xl font-bold text-[#282521] dark:text-[#EDE8E1]">
                        Distributed Caching & Mutex Locks
                      </h3>
                      <p className="text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                        Prevent cache stampedes under high concurrent load with Redisson distributed locks and sub-millisecond retrieval.
                      </p>
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {['Redis 7.2 Sentinel', 'Distributed Locks', 'Session Clusters', 'STOMP Sockets'].map(chip => (
                          <span key={chip} className="px-2 py-0.5 rounded-md bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 text-[10px] font-medium text-[#635E56] dark:text-[#A69F94]">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E3DCD3] dark:border-white/10 flex items-center justify-between">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => triggerSandboxSimulation(activeSandboxTab)}
                    disabled={isSimulatingPayload}
                    className="font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isSimulatingPayload ? 'Executing Payload...' : 'Fire Test Payload'}</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => navigate('/courses?search=' + activeSandboxTab)}
                    className="text-xs font-semibold text-[#5B3E57] dark:text-[#D1A7CC] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Relevant Tracks</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Simulated Live Microservice Terminal */}
              <div className="lg:col-span-7 rounded-2xl bg-[#151413] border border-white/10 p-5 flex flex-col justify-between font-mono text-xs text-[#EDE8E1] shadow-inner space-y-4">
                <div className="space-y-3">
                  {/* Terminal Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#9B3835]" />
                      <span className="w-3 h-3 rounded-full bg-[#935E1E]" />
                      <span className="w-3 h-3 rounded-full bg-[#2B6747]" />
                      <span className="ml-2 text-[11px] text-[#A69F94]">asivo-microservice-cluster:bash</span>
                    </div>
                    <span className="text-[10px] text-[#7A7368]">Port 8080 • Gateway Mesh</span>
                  </div>

                  {/* Terminal Stream Feed */}
                  <div className="space-y-2 py-2 overflow-x-auto">
                    {simulationLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className={`text-[11px] leading-relaxed transition-opacity ${
                          idx === 0 ? 'text-[#D1A7CC] font-bold' : 'text-[#A69F94]'
                        }`}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terminal Footer Status Bar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#7A7368]">
                  <span>Environment: sandbox-k8s-pod-17</span>
                  <span className="text-[#529E73] font-semibold">Latency: 1.2ms • 100% SLA</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== CURATED CATALOG & SPOTLIGHT ===================== */}
        <section id="catalog" className="space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E3DCD3] dark:border-white/10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#5B3E57] dark:text-[#D1A7CC] uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Verified Curriculum Catalog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#282521] dark:text-[#EDE8E1]">
                Explore Production Engineering Tracks
              </h2>
              <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94]">
                Showing top curated specializations out of {allCourses.length || 401} verified tracks in the academy.
              </p>
            </div>

            {/* Level Quick Toggle */}
            <div className="flex items-center gap-1.5 bg-[#FFFEFA] dark:bg-[#1D1C1A] p-1 rounded-xl border border-[#E3DCD3] dark:border-white/10 self-start md:self-auto shadow-2xs">
              {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    selectedLevel === lvl
                      ? 'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] font-bold shadow-xs'
                      : 'text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1]'
                  }`}
                >
                  {lvl === 'ALL' ? 'All Levels' : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Specialization Filter Pills */}
          <div
            role="tablist"
            aria-label="Course Categories"
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
                    isSelected
                      ? 'border-[#5B3E57] dark:border-[#D1A7CC] text-[#5B3E57] dark:text-[#D1A7CC] bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 shadow-xs font-bold'
                      : 'border-[#E3DCD3] dark:border-white/10 text-[#635E56] dark:text-[#A69F94] hover:text-[#282521] dark:hover:text-[#EDE8E1] bg-[#FFFEFA] dark:bg-[#1D1C1A]'
                  }`}
                >
                  <span>{cat === 'ALL' ? 'All Tracks' : cat}</span>
                </button>
              );
            })}
          </div>

          {/* Flagship Course Spotlight Banner (Breaks Grid Fatigue) */}
          {selectedCategory === 'ALL' && !searchQuery && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFFEFA] via-[#F5F2EC] to-[#EAE5DC] dark:from-[#1D1C1A] dark:via-[#1D1C1A] dark:to-[#272523] border border-[#E3DCD3] dark:border-white/10 p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#5B3E57] text-[#FFFEFA] text-[10px] font-extrabold uppercase tracking-wider">
                      ★ Flagship Track of the Month
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EBF3EE] dark:bg-[#529E73]/20 border border-[#B7D9C5] dark:border-[#529E73]/40 text-[#2B6747] dark:text-[#529E73] text-[10px] font-bold">
                      100% Practical Sandboxes
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight leading-snug">
                    Java Backend Development: Spring Boot & Microservices
                  </h3>

                  <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94] leading-relaxed max-w-xl">
                    Build a tested REST service, persist multi-tenant relational data with PostgreSQL, secure edge APIs with Spring Security and dynamic JWT rotation, then split a monolithic service into observable Docker & Kafka microservices.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#635E56] dark:text-[#A69F94] pt-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[#282521] dark:text-[#EDE8E1]">
                      <User className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                      <span>Ananya Rao (Lead Architect)</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#935E1E] font-bold">
                      <Star className="w-3.5 h-3.5 fill-[#935E1E]" />
                      <span>4.9 / 5.0 (340+ reviews)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>14 Weeks • 68 Hands-on Exercises</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap items-center gap-3">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/courses/16')}
                      className="px-6 py-3 font-bold text-xs sm:text-sm cursor-pointer shadow-md"
                    >
                      <span>Explore Flagship Curriculum</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => navigate('/courses?search=spring')}
                      className="px-5 py-3 font-semibold text-xs cursor-pointer border-[#E3DCD3] dark:border-white/10"
                    >
                      View All Java Tracks
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5 relative aspect-video rounded-2xl overflow-hidden border border-[#E3DCD3] dark:border-white/10 shadow-md">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80"
                    alt="Spring Boot Microservices Architecture"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-mono text-white font-semibold">
                      Sandbox: spring-boot-cluster:8083 (Kafka Mesh)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Curated Grid of 8 Distinct Cards */}
          <ErrorBoundary onReset={refetch}>
            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <CourseCardSkeleton key={idx} />
                ))}
              </div>
            )}

            {isError && !isLoading && (
              <div className="p-8 sm:p-10 my-8 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#9B3835]/30 text-center max-w-lg mx-auto shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#FAECEB] dark:bg-[#9B3835]/20 text-[#9B3835] mx-auto flex items-center justify-center mb-4">
                  <RotateCcw className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-[#282521] dark:text-[#EDE8E1] mb-2 tracking-tight">
                  Catalog Synchronization Interrupted
                </h3>
                <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94] mb-6 max-w-sm mx-auto leading-relaxed">
                  {error?.message || 'Unable to synchronize course tracks. Please retry or browse the full catalog.'}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="danger" size="md" onClick={() => refetch()} leftIcon={RotateCcw}>
                    Retry Connection
                  </Button>
                  <Button variant="secondary" size="md" onClick={() => navigate('/courses')}>
                    Browse Catalog
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && !isError && curatedShowcaseCourses.length === 0 && (
              <EmptyState
                icon={Search}
                title="No matching curriculum tracks"
                description={`No courses matched "${searchQuery || selectedCategory}". Reset your filters to explore our complete catalog.`}
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            )}

            {!isLoading && !isError && curatedShowcaseCourses.length > 0 && (
              <motion.div
                id="catalog-courses-grid"
                role="region"
                aria-label="Course tracks catalog"
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {curatedShowcaseCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </ErrorBoundary>

          {/* Expansive Full Catalog CTA Ribbon */}
          <div className="rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1]">
                Looking for a specific engineering specialization?
              </h4>
              <p className="text-xs text-[#635E56] dark:text-[#A69F94]">
                Explore our exhaustive repository of {allCourses.length || 401} verified courses with interactive curriculum matrices.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/courses')}
              className="shrink-0 font-bold text-xs px-6 cursor-pointer"
            >
              <span>Explore All {allCourses.length || 401} Tracks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </section>

        {/* ===================== GUIDED LEARNING PATHS ===================== */}
        <section id="learning-paths" className="py-12 border-t border-[#E3DCD3] dark:border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-xs font-bold text-[#5B3E57] dark:text-[#D1A7CC]">
              <Compass className="w-3.5 h-3.5" />
              <span>CAREER ACCELERATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
              Guided Engineering Learning Paths
            </h2>
            <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94] leading-relaxed">
              Sequenced curriculum tracks designed to take you from foundational syntax to principal architectural authority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path) => (
              <div
                key={path.id}
                className="p-6 sm:p-7 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 hover:border-[#5B3E57] dark:hover:border-[#D1A7CC]/40 transition-all flex flex-col justify-between space-y-6 shadow-xs group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#5B3E57] dark:text-[#D1A7CC] font-bold px-2.5 py-1 rounded-lg bg-[#F2ECF1] dark:bg-[#D1A7CC]/15">
                      {path.duration} • {path.coursesCount} Courses
                    </span>
                    <span className="text-[#2B6747] dark:text-[#529E73] font-semibold text-[11px]">
                      {path.salary}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#282521] dark:text-[#EDE8E1] group-hover:text-[#5B3E57] dark:group-hover:text-[#D1A7CC] transition-colors tracking-tight">
                      {path.title}
                    </h3>
                    <p className="text-xs font-medium text-[#9A6B56] dark:text-[#D9A48F] mt-0.5">
                      {path.tagline}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                    {path.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {path.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 rounded-md bg-[#F5F2EC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/5 text-[11px] font-medium text-[#635E56] dark:text-[#A69F94]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E3DCD3] dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#635E56] dark:text-[#A69F94] group-hover:text-[#282521] dark:group-hover:text-[#EDE8E1] transition-colors">
                    Explore Track Curriculum & Projects
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(path.destination)}
                    className="w-9 h-9 rounded-xl bg-[#F5F2EC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/10 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] group-hover:bg-[#5B3E57] group-hover:text-[#FFFEFA] dark:group-hover:bg-[#D1A7CC] dark:group-hover:text-[#151413] transition-all cursor-pointer shadow-xs"
                    aria-label={`Explore ${path.title}`}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== THE ASIVO STANDARD (PRODUCTION PILLARS) ===================== */}
        <section className="py-12 border-t border-[#E3DCD3] dark:border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EE] dark:bg-[#529E73]/20 border border-[#B7D9C5] dark:border-[#529E73]/40 text-xs font-bold text-[#2B6747] dark:text-[#529E73]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>THE ASIVO STANDARD</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
              Built for High-Stakes Production Engineering
            </h2>
            <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94] leading-relaxed">
              Why senior engineers choose Asivo over generic video tutorial platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/30 transition-all space-y-3 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] flex items-center justify-center">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                Live Microservice Sandboxes
              </h3>
              <p className="text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                Deploy sample services, test REST and gRPC endpoints, inspect distributed traces, and troubleshoot real Redis and PostgreSQL instances instead of synthetic mocks.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/30 transition-all space-y-3 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-[#F6EFEA] dark:bg-[#D9A48F]/15 text-[#9A6B56] dark:text-[#D9A48F] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                Zero-Trust Security & RBAC Matrix
              </h3>
              <p className="text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                Learn modern identity federation, JWT rotation, and defense-in-depth protection across role-based access control policies verified on live API endpoints.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 hover:border-[#2B6747]/40 dark:hover:border-[#529E73]/30 transition-all space-y-3 shadow-xs">
              <div className="w-11 h-11 rounded-2xl bg-[#EBF3EE] dark:bg-[#529E73]/20 text-[#2B6747] dark:text-[#529E73] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                Verifiable Master Credentials
              </h3>
              <p className="text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                Earn unforgeable cryptographic credentials backed by automated test suites and code challenges, complete with a public verification URL on /certifications.
              </p>
            </div>
          </div>
        </section>

        {/* ===================== LEAD FACULTY ===================== */}
        <section id="instructors" className="py-12 border-t border-[#E3DCD3] dark:border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-xs font-bold text-[#5B3E57] dark:text-[#D1A7CC]">
              <Users className="w-3.5 h-3.5" />
              <span>ACTIVE FACULTY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
              Learn From Principal Engineers & Architects
            </h2>
            <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94] leading-relaxed">
              Every course is authored and reviewed by practitioners designing systems that handle real production traffic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {instructors.map((inst) => (
              <div
                key={inst.name}
                onClick={() => navigate(`/courses?search=${encodeURIComponent(inst.name)}`)}
                className="p-5 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 hover:border-[#5B3E57] dark:hover:border-[#D1A7CC]/40 transition-all flex flex-col items-center text-center space-y-3 cursor-pointer shadow-xs group"
                title={`View all courses taught by ${inst.name}`}
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#E3DCD3] dark:border-white/10 shadow-sm group-hover:scale-105 transition-transform">
                  <img
                    src={inst.image}
                    alt={inst.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1] group-hover:text-[#5B3E57] dark:group-hover:text-[#D1A7CC] transition-colors">
                    {inst.name}
                  </h4>
                  <p className="text-xs font-semibold text-[#5B3E57] dark:text-[#D1A7CC]">
                    {inst.title}
                  </p>
                  <p className="text-[10px] text-[#9A6B56] dark:text-[#D9A48F] font-medium">
                    {inst.company}
                  </p>
                </div>
                <p className="text-[11px] text-[#635E56] dark:text-[#A69F94] leading-relaxed">
                  {inst.experience}
                </p>
                <div className="pt-2 border-t border-[#E3DCD3] dark:border-white/10 w-full flex items-center justify-between text-[11px] text-[#756E64] dark:text-[#7A7368]">
                  <span className="truncate max-w-[120px]">{inst.topics}</span>
                  <span className="text-[#935E1E] font-bold shrink-0">★ {inst.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== VERIFIED STUDENT OUTCOMES ===================== */}
        <section id="testimonials" className="py-12 border-t border-[#E3DCD3] dark:border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3EE] dark:bg-[#529E73]/20 text-xs font-bold text-[#2B6747] dark:text-[#529E73]">
              <Award className="w-3.5 h-3.5" />
              <span>PROVEN OUTCOMES</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
              Engineers Leveling Up in Real Roles
            </h2>
            <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94] leading-relaxed">
              Discover how engineers transitioned into staff roles and engineered resilient infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialsList.map((test, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 flex flex-col justify-between space-y-5 hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/30 transition-all shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Quote className="w-6 h-6 text-[#5B3E57]/60 dark:text-[#D1A7CC]/60" />
                    <div className="flex items-center text-[#935E1E] text-xs font-bold">
                      {'★'.repeat(test.rating || 5)}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#282521] dark:text-[#EDE8E1] leading-relaxed italic">
                    "{test.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E3DCD3] dark:border-white/10 flex items-center gap-3">
                  <img
                    src={test.avatar}
                    alt={test.author}
                    className="w-10 h-10 rounded-full object-cover border border-[#E3DCD3] dark:border-white/10"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-[#282521] dark:text-[#EDE8E1] truncate">{test.author}</h5>
                    <p className="text-[10px] text-[#635E56] dark:text-[#A69F94] truncate">{test.role}</p>
                    <span className="text-[9px] text-[#5B3E57] dark:text-[#D1A7CC] font-mono font-semibold">{test.track}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================== CATEGORIZED FAQ ACCORDION ===================== */}
        <section id="faqs" className="py-12 border-t border-[#E3DCD3] dark:border-white/10 max-w-4xl mx-auto w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2EC] dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/10 text-xs font-bold text-[#635E56] dark:text-[#A69F94]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
              Clear & Transparent Policies
            </h2>
            <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A69F94]">
              Everything you need to know about access, sandboxes, certificates, and refunds.
            </p>
          </div>

          {/* FAQ Category Filter Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['ALL', 'SANDBOXES', 'CERTIFICATIONS', 'CURRICULUM', 'PAYMENTS'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveFaqCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeFaqCategory === cat
                    ? 'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] font-bold shadow-2xs'
                    : 'bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 text-[#635E56] dark:text-[#A69F94]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 overflow-hidden shadow-2xs transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F5F2EC]/50 dark:hover:bg-white/[0.02] focus:outline-none focus:ring-1 focus:ring-[#5B3E57]"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                  >
                    <span className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">{faq.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#756E64] dark:text-[#7A7368] shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#5B3E57] dark:text-[#D1A7CC]' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${idx}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 pb-5 text-xs text-[#635E56] dark:text-[#A69F94] leading-relaxed border-t border-[#E3DCD3]/60 dark:border-white/5 pt-3"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ===================== FOOTER ===================== */}
      <footer className="w-full border-t border-[#E3DCD3] dark:border-white/10 bg-[#FFFEFA] dark:bg-[#151413] mt-20 pt-14 pb-10 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            
            {/* Col 1: Brand & Positioning */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5B3E57] text-[#FFFEFA] flex items-center justify-center font-black shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">Asivo LMS</span>
                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#5B3E57] dark:text-[#D1A7CC] uppercase">
                    ENGINEERING ACADEMY
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#635E56] dark:text-[#A69F94] max-w-sm leading-relaxed">
                High-fidelity engineering education built on real distributed microservice architectures, verifiable cryptographic credentials, and hands-on container sandboxes.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#2B6747] dark:text-[#529E73] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#2B6747] dark:bg-[#529E73] animate-pulse" />
                <span>All 17 microservice systems operational</span>
              </div>
            </div>

            {/* Col 2: Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#282521] dark:text-[#EDE8E1] uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-xs text-[#635E56] dark:text-[#A69F94]">
                <li>
                  <button type="button" onClick={() => navigate('/courses')} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Explore Courses
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('#learning-paths')} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Learning Paths
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/certifications')} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Certifications
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/student/dashboard')} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Student Workspace
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Resources */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#282521] dark:text-[#EDE8E1] uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-xs text-[#635E56] dark:text-[#A69F94]">
                <li>
                  <button type="button" onClick={() => navigate('/certifications')} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Certificate Verification
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/courses?level=Beginner')} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Beginner Foundations
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/courses?level=Advanced')} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Advanced Architectures
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => scrollToSection('#faqs')} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Platform FAQs
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Trust & Faculty */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#282521] dark:text-[#EDE8E1] uppercase tracking-wider">Faculty & Trust</h4>
              <ul className="space-y-2 text-xs text-[#635E56] dark:text-[#A69F94]">
                <li>
                  <button type="button" onClick={() => navigate('/instructor/apply')} className="text-[#5B3E57] dark:text-[#D1A7CC] font-semibold hover:underline transition-colors cursor-pointer">
                    Teach on Asivo
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigate('/instructor/dashboard')} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Instructor Studio
                  </button>
                </li>
                <li>
                  <a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    Terms & Privacy
                  </a>
                </li>
                <li>
                  <a href="/refund" onClick={(e) => { e.preventDefault(); navigate('/refund'); }} className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors cursor-pointer">
                    30-Day Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright Row */}
          <div className="pt-8 border-t border-[#E3DCD3] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#756E64] dark:text-[#7A7368]">
            <p>© {new Date().getFullYear()} Asivo LMS Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <button type="button" onClick={() => navigate('/courses')} className="hover:text-[#282521] dark:hover:text-[#EDE8E1] transition-colors cursor-pointer">
                Curriculum 2026
              </button>
              <button type="button" onClick={() => navigate('/certifications')} className="hover:text-[#282521] dark:hover:text-[#EDE8E1] transition-colors cursor-pointer">
                Verify Credentials
              </button>
              <button type="button" onClick={() => navigate('/login')} className="hover:text-[#282521] dark:hover:text-[#EDE8E1] transition-colors cursor-pointer">
                Portal Sign In
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingDashboard;
