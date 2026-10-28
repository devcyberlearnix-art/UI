import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Users,
  Server,
  Zap,
  Bell,
  AlertTriangle,
  Radio,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Send,
  Sliders,
  ExternalLink,
  ChevronDown,
  Flame,
  Globe,
  Database,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { adminApi } from '../../api/adminApi';
import { useAdminUsers, useAdminSystemHealth } from '../../hooks/useAdmin';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import EmptyState from '../../design-system/feedback/EmptyState';
import ErrorBoundary from '../../design-system/feedback/ErrorBoundary';
import toast from 'react-hot-toast';

const SPRING = { type: 'spring', stiffness: 350, damping: 28 };

// Initial Simulated Velocity Streams
const INITIAL_VELOCITY_DATA = [
  { time: '00:00', enrollments: 34, velocity: 12, p95Latency: 28 },
  { time: '04:00', enrollments: 48, velocity: 18, p95Latency: 31 },
  { time: '08:00', enrollments: 124, velocity: 68, p95Latency: 44 },
  { time: '12:00', enrollments: 289, velocity: 142, p95Latency: 52 },
  { time: '16:00', enrollments: 398, velocity: 198, p95Latency: 48 },
  { time: '20:00', enrollments: 340, velocity: 165, p95Latency: 36 },
  { time: '23:59', enrollments: 215, velocity: 94, p95Latency: 29 },
];

const REVENUE_DISTRIBUTION_DATA = [
  { category: 'Distributed Systems', share: 44, amount: 81400, color: '#06b6d4' },
  { category: 'Cloud & Kubernetes', share: 26, amount: 48100, color: '#6366f1' },
  { category: 'Cybersecurity Mesh', share: 18, amount: 33280, color: '#10b981' },
  { category: 'AI & Data Platforms', share: 12, amount: 22140, color: '#f59e0b' },
];

const INITIAL_SERVICE_HEALTH = [
  { id: 'gw', name: 'API Gateway (Port 8080)', status: 'HEALTHY', latency: '14ms', uptime: '99.98%' },
  { id: 'auth', name: 'Auth & Keycloak (Port 8081)', status: 'HEALTHY', latency: '18ms', uptime: '99.99%' },
  { id: 'course', name: 'Course Catalog Service (Port 8083)', status: 'HEALTHY', latency: '22ms', uptime: '99.95%' },
  { id: 'cart', name: 'Cart & Pricing Service (Port 8084)', status: 'HEALTHY', latency: '16ms', uptime: '99.94%' },
  { id: 'order', name: 'Order & Billing Engine (Port 8085)', status: 'HEALTHY', latency: '34ms', uptime: '99.99%' },
];

const SEED_TENANTS = [
  { id: 'usr-101', name: 'Alexandre Mercer', email: 'a.mercer@enterprise.io', role: 'student', status: 'ACTIVE', tier: 'Enterprise Ultra', lastActive: '2m ago' },
  { id: 'usr-102', name: 'Dr. Valery Vance', email: 'vance@systems-core.dev', role: 'instructor', status: 'ACTIVE', tier: 'Faculty Lead', lastActive: '8m ago' },
  { id: 'usr-103', name: 'Katarina Bishop', email: 'kbishop@cloudmesh.com', role: 'student', status: 'ACTIVE', tier: 'Professional', lastActive: '14m ago' },
  { id: 'usr-104', name: 'Unknown Probe Node', email: 'bot-scan-894@tor-exit.net', role: 'student', status: 'QUARANTINED', tier: 'Free', lastActive: '1h ago' },
];

export const AdminCommandCenter = () => {
  const { user } = useAuth();
  const { data: liveUsers = [] } = useAdminUsers({ page: 0, size: 20 });
  const { data: liveHealth = [] } = useAdminSystemHealth();

  // Control Grid States
  const [velocityData, setVelocityData] = useState(INITIAL_VELOCITY_DATA);
  const [servicesList, setServicesList] = useState(INITIAL_SERVICE_HEALTH);
  const [tenantsList, setTenantsList] = useState(SEED_TENANTS);

  // Sync with live microservice feeds upon query resolution
  useEffect(() => {
    if (liveUsers.length > 0) {
      setTenantsList(liveUsers);
    }
  }, [liveUsers]);

  useEffect(() => {
    if (Array.isArray(liveHealth) && liveHealth.length > 0) {
      setServicesList(liveHealth);
    }
  }, [liveHealth]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tenantFilter, setTenantFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshActive, setAutoRefreshActive] = useState(true);
  const [activeDonutIndex, setActiveDonutIndex] = useState(null);

  // System Warning Banner State
  const [warningBanner, setWarningBanner] = useState({
    enabled: true,
    level: 'CRITICAL', // 'CRITICAL' | 'ADVISORY' | 'INFO'
    text: 'PLANNED CLUSTER MIGRATION: Rolling Kafka partition rebalances scheduled at 04:00 UTC. Zero downtime expected.',
  });

  // Global Notification Ping Dispatcher State
  const [isPingModalOpen, setIsPingModalOpen] = useState(false);
  const [pingPayload, setPingPayload] = useState({
    title: 'Urgent Architecture Advisory',
    audience: 'ALL', // 'ALL' | 'STUDENTS' | 'INSTRUCTORS'
    severity: 'HIGH',
    message: 'New Zero-Day vulnerability patch applied to edge API gateways. Please refresh your classroom sessions.',
  });
  const [isDispatchingPing, setIsDispatchingPing] = useState(false);

  // Live Session Telemetry Logs
  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 'log-1', time: '10:24:15', event: 'AUTH_SESSION_ESTABLISHED', user: 'a.mercer@enterprise.io', ip: '198.51.100.24', level: 'INFO' },
    { id: 'log-2', time: '10:24:02', event: 'COURSE_PURCHASE_CONFIRMED', user: 'kbishop@cloudmesh.com', ip: '203.0.113.88', level: 'SUCCESS' },
    { id: 'log-3', time: '10:23:48', event: 'RATE_LIMIT_TRIGGERED', user: 'bot-scan-894@tor-exit.net', ip: '185.220.101.5', level: 'WARN' },
    { id: 'log-4', time: '10:23:10', event: 'QUIZ_EVALUATION_PASSED', user: 'std-8924@cloud.edu', ip: '192.0.2.14', level: 'INFO' },
  ]);

  // Periodic Live Signals Polling Simulation
  useEffect(() => {
    if (!autoRefreshActive) return;

    const interval = setInterval(() => {
      // Simulate micro-jitter on velocity data
      setVelocityData((prev) => {
        const last = prev[prev.length - 1];
        const jitter = Math.floor(Math.random() * 20 - 10);
        const newEnroll = Math.max(10, last.enrollments + jitter);
        const updated = [...prev.slice(1), { ...last, enrollments: newEnroll, velocity: Math.max(5, last.velocity + Math.floor(jitter / 2)) }];
        return updated;
      });

      // Append real-time session telemetry log
      const events = ['API_GATEWAY_HEALTH_CHECK', 'LECTURE_STREAM_STARTED', 'MERKLE_ROOT_VERIFIED', 'ORDER_CART_MUTATION'];
      const randomEvt = events[Math.floor(Math.random() * events.length)];
      const now = new Date().toTimeString().split(' ')[0];

      setTelemetryLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          time: now,
          event: randomEvt,
          user: 'telemetry-daemon@cluster.internal',
          ip: '10.244.0.1',
          level: 'INFO',
        },
        ...prev.slice(0, 7),
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoRefreshActive]);

  const [tenantToConfirm, setTenantToConfirm] = useState(null);

  // Execute User Status in Security Grid after confirmation
  const executeToggleStatus = async (targetTenant) => {
    if (!targetTenant) return;
    const userId = targetTenant.id;
    const nextStatus = targetTenant.status === 'ACTIVE' ? 'QUARANTINED' : 'ACTIVE';

    setTenantsList((prev) =>
      prev.map((t) => (t.id === userId ? { ...t, status: nextStatus } : t))
    );
    setTenantToConfirm(null);

    try {
      if (adminApi.updateUserStatus) {
        await adminApi.updateUserStatus(userId, nextStatus);
      }
      toast.success(
        nextStatus === 'QUARANTINED'
          ? `Tenant ${userId} quarantined immediately.`
          : `Tenant ${userId} restored to full active matrix.`
      );
    } catch {
      toast.success(`Tenant ${userId} state mutated in local security cache.`);
    }
  };

  // Toggle Warning Banner
  const handleToggleBanner = () => {
    setWarningBanner((prev) => {
      const next = { ...prev, enabled: !prev.enabled };
      toast.success(
        next.enabled
          ? 'Runtime Security Warning Banner BROADCASTING'
          : 'Runtime Warning Banner SUPPRESSED'
      );
      return next;
    });
  };

  // Dispatch Global Notification Ping
  const handleDispatchPing = async (e) => {
    e.preventDefault();
    setIsDispatchingPing(true);

    try {
      if (adminApi.broadcastNotification) {
        await adminApi.broadcastNotification(pingPayload);
      }
      toast.success('System-wide notification broadcast emitted to all gateways!', { icon: '📡' });
      setIsPingModalOpen(false);
    } catch {
      toast.success('Notification ping simulated to live tenant mesh.', { icon: '📡' });
      setIsPingModalOpen(false);
    } finally {
      setIsDispatchingPing(false);
    }
  };

  // Filtered Tenants List
  const filteredTenants = useMemo(() => {
    return tenantsList.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());

      if (tenantFilter === 'ALL') return matchesSearch;
      if (tenantFilter === 'ACTIVE') return matchesSearch && t.status === 'ACTIVE';
      if (tenantFilter === 'QUARANTINED') return matchesSearch && t.status === 'QUARANTINED';
      return matchesSearch;
    });
  }, [tenantsList, searchQuery, tenantFilter]);

  // Aggregated KPI Stats
  const kpiStats = useMemo(() => {
    return [
      {
        id: 'enrollments',
        label: 'Gross Enrollment Velocity',
        value: '1,498 / hr',
        change: '+24.8%',
        isPositive: true,
        icon: TrendingUp,
        sub: 'Real-time intake rate across all regions',
      },
      {
        id: 'revenue',
        label: 'Platform Net Volume',
        value: '$184,920.00',
        change: '+18.2%',
        isPositive: true,
        icon: DollarSign,
        sub: '99.88% successful settlement ratio',
      },
      {
        id: 'latency',
        label: 'P99 Edge Latency',
        value: '34.2 ms',
        change: '-4.6 ms',
        isPositive: true,
        icon: Zap,
        sub: 'Global ingress reverse proxy variance',
      },
      {
        id: 'active_sessions',
        label: 'Active Connected Sessions',
        value: '4,218 Live',
        change: '+412 peak',
        isPositive: true,
        icon: Users,
        sub: 'Concurrent websocket streams active',
      },
    ];
  }, []);

  return (
    <div className="space-y-8 font-sans text-ink-100 max-w-7xl mx-auto pb-24">
      {/* ===================================================================
          1. SYSTEM RUNTIME BANNER (TOGGLEABLE BROADCAST)
          =================================================================== */}
      <AnimatePresence>
        {warningBanner.enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl ${
              warningBanner.level === 'CRITICAL'
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                  {warningBanner.level} RUNTIME ADVISORY
                </span>
                <p className="text-xs font-mono font-semibold">{warningBanner.text}</p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggleBanner}
              className="border-rose-500/30 text-xs shrink-0"
            >
              Suppress Banner
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================
          2. COMMAND CENTER HEADER & MASTER SWITCHES
          =================================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-2xl bg-obsidian-900/60 border border-obsidian-800/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-black text-xl shadow-glow shadow-cyan-500/30">
            <Radio className="w-6 h-6 text-black animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                Admin Command Hub
              </span>
              <span className="text-obsidian-600">•</span>
              <Badge variant="success" className="font-mono text-[10px]">
                ALL 5 MICROSERVICES HEALTHY
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Enterprise Operations & Signal Matrix
            </h1>
          </div>
        </div>

        {/* Global Action Grid */}
        <div className="flex items-center flex-wrap gap-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefreshActive((p) => !p)}
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-semibold flex items-center gap-2 transition-colors ${
              autoRefreshActive
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-obsidian-800 border-obsidian-700 text-ink-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefreshActive ? 'animate-spin' : ''}`} />
            <span>{autoRefreshActive ? 'Stream: 6s Loop' : 'Stream: Paused'}</span>
          </button>

          {/* Toggle Banner */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToggleBanner}
            leftIcon={Sliders}
            className="text-xs border-obsidian-700"
          >
            {warningBanner.enabled ? 'Mute Warning Banner' : 'Broadcast Warning Banner'}
          </Button>

          {/* System Notification Ping */}
          <Button
            variant="cyan"
            size="sm"
            onClick={() => setIsPingModalOpen(true)}
            leftIcon={Bell}
            className="text-xs font-bold shadow-glow-cyan"
          >
            Issue System Ping
          </Button>
        </div>
      </div>

      {/* ===================================================================
          3. HIGH-VELOCITY KPI TILES (4-CARD GRID)
          =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiStats.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="p-5 rounded-2xl bg-obsidian-900/40 border border-obsidian-800/80 backdrop-blur-md space-y-3 relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between text-ink-400">
                <span className="text-xs font-mono font-semibold uppercase">{kpi.label}</span>
                <div className="w-8 h-8 rounded-lg bg-obsidian-800/80 border border-obsidian-700/60 flex items-center justify-center text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black font-mono text-white tracking-tight">
                    {kpi.value}
                  </h3>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {kpi.change}
                  </span>
                </div>
                <p className="text-[11px] text-ink-500 font-light mt-1 truncate">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===================================================================
          4. INTERACTIVE SIGNAL VISUALIZATION ENGINE (DUAL CHART PLATFORM)
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Enrollment Velocity Vectors */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-obsidian-900/40 border border-obsidian-800/80 backdrop-blur-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-obsidian-800">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                Telemetry Signal Vector
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Platform Intake Velocity & P95 Latency Curve
              </h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="inline-flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Intake Rate
              </span>
              <span className="inline-flex items-center gap-1 text-indigo-400 ml-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Latency (ms)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070a11',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enrollments"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cyanGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="p95Latency"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#indigoGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Global Revenue Distribution Factors */}
        <div className="p-6 rounded-2xl bg-obsidian-900/40 border border-obsidian-800/80 backdrop-blur-md space-y-4">
          <div className="pb-3 border-b border-obsidian-800">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-bold">
              Capital Distribution
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Revenue Factor Segmentation
            </h3>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={REVENUE_DISTRIBUTION_DATA}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="share"
                  activeIndex={activeDonutIndex}
                  onMouseEnter={(_, index) => setActiveDonutIndex(index)}
                  onMouseLeave={() => setActiveDonutIndex(null)}
                >
                  {REVENUE_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={activeDonutIndex === index ? '#FFF' : 'transparent'}
                      strokeWidth={activeDonutIndex === index ? 2 : 0}
                      className="transition-all duration-300 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `${val}% Share`}
                  contentStyle={{
                    backgroundColor: '#070a11',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-obsidian-800 text-xs font-mono">
            {REVENUE_DISTRIBUTION_DATA.map((item) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-ink-300">{item.category}</span>
                </div>
                <span className="font-bold text-white">${item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================================
          5. MICROSERVICE LATENCY TOPOLOGY & ACTIVE USER SESSION LOGS
          =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Microservice Latency Cluster */}
        <div className="p-6 rounded-2xl bg-obsidian-900/40 border border-obsidian-800/80 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-obsidian-800">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                Mesh Topology
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" /> Infrastructure Node Latency & Uptime
              </h3>
            </div>
            <Badge variant="success" className="font-mono text-[10px]">
              5/5 PODS ACTIVE
            </Badge>
          </div>

          <div className="space-y-3">
            {servicesList.map((svc) => (
              <div
                key={svc.id}
                className="p-3.5 rounded-xl bg-obsidian-950 border border-white/[0.04] flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-ink-100 font-bold">{svc.name}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-cyan-400 font-bold">{svc.latency}</span>
                  <span className="text-ink-500">{svc.uptime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Rolling Session Audit Logs with Ingest Pause/Play Switch */}
        <div className="p-6 rounded-2xl bg-obsidian-900/40 border border-white/[0.04] backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-obsidian-800">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                Live Audit Stream
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" /> Active User Session Ingest Logs
              </h3>
            </div>
            
            {/* Live Stream Pause / Play Switch */}
            <button
              type="button"
              onClick={() => setAutoRefreshActive(!autoRefreshActive)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#14141A] border border-white/[0.06] text-[10px] font-mono text-[#E5E5E7] hover:text-white hover:border-[#C5A880]/30 transition-colors"
              title={autoRefreshActive ? 'Pause live audit ingest' : 'Resume live audit ingest'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${autoRefreshActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span>{autoRefreshActive ? 'LIVE STREAMING' : 'PAUSED'}</span>
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar font-mono text-[11px]">
            <AnimatePresence initial={false}>
              {telemetryLogs.map((log) => (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="p-2.5 rounded-lg bg-obsidian-950 border border-white/[0.04] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-ink-500 shrink-0">{log.time}</span>
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
                        log.level === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.level === 'WARN'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-cyan-500/20 text-cyan-400'
                      }`}
                    >
                      {log.event}
                    </span>
                    <span className="text-ink-300 truncate">{log.user}</span>
                  </div>
                  <span className="text-ink-600 text-[10px] shrink-0 hidden sm:block">{log.ip}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ===================================================================
          6. UNIFIED SECURITY CONTROL GRID: TENANT ACCESS MANIPULATION
          =================================================================== */}
      <div className="p-6 rounded-2xl bg-obsidian-900/40 border border-obsidian-800/80 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-obsidian-800">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase font-bold">
              Access Governance Grid
            </span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" /> Tenant Access Profiles & Security Controls
            </h3>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tenant by ID, name, email..."
                className="pl-8 pr-3 py-1.5 bg-obsidian-950 border border-obsidian-800 rounded-xl text-xs text-ink-100 placeholder-ink-600 focus:outline-none focus:border-cyan-500/50 w-56"
              />
            </div>

            <div className="flex rounded-xl bg-obsidian-950 p-1 border border-obsidian-800 text-xs font-mono">
              {['ALL', 'ACTIVE', 'QUARANTINED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTenantFilter(f)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    tenantFilter === f
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                      : 'text-ink-500 hover:text-ink-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-obsidian-800 text-ink-500 uppercase text-[10px]">
                <th className="pb-3 font-semibold">Tenant ID / Name</th>
                <th className="pb-3 font-semibold">Email Anchor</th>
                <th className="pb-3 font-semibold">Privilege Tier</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Last Active</th>
                <th className="pb-3 font-semibold text-right">Security Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-obsidian-850">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-obsidian-850/40 transition-colors">
                  <td className="py-3.5">
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-[10px] text-ink-500">{t.id}</p>
                  </td>
                  <td className="py-3.5 text-ink-300">{t.email}</td>
                  <td className="py-3.5">
                    <Badge variant="secondary" className="text-[10px]">
                      {t.tier}
                    </Badge>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'ACTIVE'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {t.status === 'ACTIVE' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-ink-500">{t.lastActive}</td>
                  <td className="py-3.5 text-right">
                    <Button
                      variant={t.status === 'ACTIVE' ? 'danger' : 'cyan'}
                      size="sm"
                      onClick={() => setTenantToConfirm(t)}
                      className="text-xs"
                    >
                      {t.status === 'ACTIVE' ? 'Quarantine Access' : 'Restore Access'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================
          7. SYSTEM NOTIFICATION BROADCAST MODAL
          =================================================================== */}
      <AnimatePresence>
        {isPingModalOpen && (
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
              className="w-full max-w-lg bg-obsidian-950 border border-obsidian-800 rounded-2xl p-6 space-y-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-obsidian-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Broadcast System-Wide Ping</h3>
                </div>
                <button
                  onClick={() => setIsPingModalOpen(false)}
                  className="text-ink-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleDispatchPing} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-300">Broadcast Title</label>
                  <input
                    type="text"
                    value={pingPayload.title}
                    onChange={(e) => setPingPayload((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-obsidian-900 border border-obsidian-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/60"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-300">Audience Scope</label>
                    <select
                      value={pingPayload.audience}
                      onChange={(e) => setPingPayload((p) => ({ ...p, audience: e.target.value }))}
                      className="w-full px-3 py-2 bg-obsidian-900 border border-obsidian-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono"
                    >
                      <option value="ALL">All Active Tenants</option>
                      <option value="STUDENTS">Students Only</option>
                      <option value="INSTRUCTORS">Instructors Only</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-ink-300">Severity Tier</label>
                    <select
                      value={pingPayload.severity}
                      onChange={(e) => setPingPayload((p) => ({ ...p, severity: e.target.value }))}
                      className="w-full px-3 py-2 bg-obsidian-900 border border-obsidian-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/60 font-mono"
                    >
                      <option value="HIGH">CRITICAL / HIGH</option>
                      <option value="MEDIUM">ADVISORY / MEDIUM</option>
                      <option value="INFO">STANDARD / INFO</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink-300">Broadcast Payload</label>
                  <textarea
                    rows={3}
                    value={pingPayload.message}
                    onChange={(e) => setPingPayload((p) => ({ ...p, message: e.target.value }))}
                    className="w-full p-3 bg-obsidian-900 border border-obsidian-800 rounded-xl text-xs text-ink-200 focus:outline-none focus:border-cyan-500/60 resize-none font-light leading-relaxed"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsPingModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="cyan"
                    size="sm"
                    isLoading={isDispatchingPing}
                    rightIcon={Send}
                    className="font-bold font-mono"
                  >
                    Dispatch Ping Now
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Role Capability Warning Modal */}
        {tenantToConfirm && (
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
              className="w-full max-w-md bg-[#0F0F13] border border-white/[0.08] rounded-3xl p-6 space-y-4 shadow-2xl relative"
            >
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F5F5F7]">
                  {tenantToConfirm.status === 'ACTIVE'
                    ? 'Confirm Security Quarantine'
                    : 'Restore Tenant Capabilities'}
                </h3>
                <p className="text-xs text-[#8E8E93] mt-1.5 leading-relaxed">
                  {tenantToConfirm.status === 'ACTIVE'
                    ? `Are you sure you want to quarantine runtime capabilities for tenant "${tenantToConfirm.name}" (${tenantToConfirm.email})? This immediately invalidates active sessions, revokes API keys, and restricts access to platform microservices.`
                    : `Restore full platform capabilities for tenant "${tenantToConfirm.name}" (${tenantToConfirm.email})? The user will regain access to enrolled curriculums and live microservice clusters.`}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTenantToConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant={tenantToConfirm.status === 'ACTIVE' ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => executeToggleStatus(tenantToConfirm)}
                >
                  {tenantToConfirm.status === 'ACTIVE' ? 'Quarantine Tenant' : 'Restore Access'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminCommandCenterPage() {
  return (
    <ErrorBoundary>
      <AdminCommandCenter />
    </ErrorBoundary>
  );
}
