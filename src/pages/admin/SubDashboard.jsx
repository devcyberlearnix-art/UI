import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  ShoppingCart,
  TrendingUp,
  Clock,
  DollarSign,
  Shield,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../api/adminApi';
import Badge from '../../design-system/primitives/Badge';
import { Skeleton } from '../../design-system/primitives/Skeleton';

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

export const SubDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    users: 0,
    courses: 0,
    orders: 0,
    revenue: 0,
  });

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const permissions = user?.permissions || [];

        if (permissions.includes('users:view')) {
          try {
            const usersResponse = await adminApi.getAllUsers();
            const usersCount = Array.isArray(usersResponse)
              ? usersResponse.length
              : usersResponse.data?.length || usersResponse.total || 0;
            if (isMounted) setStatsData((prev) => ({ ...prev, users: usersCount }));
          } catch (err) {
            console.error('[SubDashboard] Error fetching users:', err);
          }
        }

        if (permissions.includes('courses:view')) {
          try {
            const coursesResponse = await adminApi.getAllCourses();
            const coursesCount = Array.isArray(coursesResponse)
              ? coursesResponse.length
              : coursesResponse.data?.length || coursesResponse.total || 0;
            if (isMounted) setStatsData((prev) => ({ ...prev, courses: coursesCount }));
          } catch (err) {
            console.error('[SubDashboard] Error fetching courses:', err);
          }
        }

        if (permissions.includes('orders:view')) {
          try {
            const ordersResponse = await adminApi.getOrders();
            const ordersData = Array.isArray(ordersResponse)
              ? ordersResponse
              : ordersResponse.data || [];
            const ordersCount = ordersData.length;
            const totalRevenue = ordersData.reduce((sum, order) => {
              const amount = order.amount || order.total || order.price || 0;
              return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
            }, 0);
            if (isMounted) {
              setStatsData((prev) => ({ ...prev, orders: ordersCount, revenue: totalRevenue }));
            }
          } catch (err) {
            console.error('[SubDashboard] Error fetching orders:', err);
          }
        }
      } catch (error) {
        console.error('[SubDashboard] Error fetching dashboard data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const userName = user?.displayName || user?.firstName || user?.name || 'Sub-Admin';
  const userInitial = userName?.charAt(0)?.toUpperCase() || 'S';
  const permissions = user?.permissions || [];

  const hasPermission = (permission) => {
    return permissions.includes(permission) || false;
  };

  const stats = [];

  if (hasPermission('users:view')) {
    stats.push({
      title: 'Directory Tenants',
      value: statsData.users.toLocaleString(),
      icon: Users,
    });
  }

  if (hasPermission('courses:view')) {
    stats.push({
      title: 'Curriculum Nodes',
      value: statsData.courses.toLocaleString(),
      icon: BookOpen,
    });
  }

  if (hasPermission('orders:view')) {
    stats.push({
      title: 'Ledger Orders',
      value: statsData.orders.toLocaleString(),
      icon: ShoppingCart,
    });
  }

  if (hasPermission('payments:view')) {
    stats.push({
      title: 'Settled Volume',
      value: `$${statsData.revenue.toLocaleString()}`,
      icon: DollarSign,
    });
  }

  const quickActions = [];

  if (hasPermission('users:view')) {
    quickActions.push({ icon: Users, label: 'User Directory', path: '/admin/users' });
  }

  if (hasPermission('courses:view')) {
    quickActions.push({ icon: BookOpen, label: 'Curriculum Ops', path: '/admin/courses' });
  }

  if (hasPermission('orders:view')) {
    quickActions.push({ icon: ShoppingCart, label: 'Order Ledgers', path: '/admin/orders' });
  }

  if (hasPermission('reports:view')) {
    quickActions.push({ icon: BarChart3, label: 'Platform Reports', path: '/admin/reports' });
  }

  const recentActivities = [
    { id: 1, action: 'Identity federation probe completed', time: '5m ago', icon: Users },
    { id: 2, action: 'Curriculum manifest signed', time: '1h ago', icon: BookOpen },
    { id: 3, action: 'Encrypted checkout settlement', time: '3h ago', icon: ShoppingCart },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans selection:bg-[#5B3E57] dark:bg-[#D1A7CC]/30 selection:text-white">
      {/* ===================== HERO BANNER ===================== */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_TRANSITION}
        className="rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 flex items-center justify-center text-lg font-bold text-[#5B3E57] dark:text-[#D1A7CC] shrink-0">
            {userInitial}
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-3 h-3 text-[#5B3E57] dark:text-[#D1A7CC]" />
              <span>Scoped Administrative Authority</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
              {greeting}, {userName}
            </h1>
            <p className="text-xs text-[#635E56] dark:text-[#A8A196] mt-0.5">
              Authorized operations zone under RBAC security policy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Badge variant="gold" dot>
            Role Scoped
          </Badge>
        </div>
      </motion.section>

      {/* ===================== STATS STRIP ===================== */}
      {stats.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_TRANSITION, delay: index * 0.05 }}
                className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#635E56] dark:text-[#A8A196] tracking-wide">
                    {stat.title}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight font-mono">
                  {stat.value}
                </p>
              </motion.div>
            );
          })}
        </section>
      )}

      {/* ===================== ACTION TILES & TIMELINE ===================== */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launch Operations (2 Cols) */}
        {quickActions.length > 0 && (
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_TRANSITION}
              className="rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] p-6 space-y-4"
            >
              <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                Assigned Command Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      type="button"
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={SPRING_TRANSITION}
                      onClick={() => navigate(action.path)}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413]/80 border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 transition-all text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] group text-left cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#5B3E57] dark:focus-visible:ring-[#D1A7CC]"
                    >
                      <span className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="tracking-tight">{action.label}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#756E64] dark:text-[#7A7368] group-hover:text-white transition-colors" />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Permission Scopes */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={SPRING_TRANSITION}
              className="rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] p-6 space-y-3"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#635E56] dark:text-[#A8A196] flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <span>Granted Role Privileges</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {permissions.length > 0 ? (
                  permissions.map((perm, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-lg bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] text-[11px] font-mono text-[#282521] dark:text-[#EDE8E1]"
                    >
                      {perm}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#756E64] dark:text-[#7A7368]">No explicit privileges assigned.</span>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Activity Feed (1 Col): High-Density Divider List */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_TRANSITION}
            className="rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
              <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <span>Session Events</span>
              </h2>
              <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] font-mono">Real-time</span>
            </div>

            <div className="divide-y divide-white/[0.03]">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <activity.icon className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC] shrink-0" />
                    <span className="text-[#282521] dark:text-[#EDE8E1] font-medium tracking-tight truncate">
                      {activity.action}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#756E64] dark:text-[#7A7368] font-mono shrink-0 ml-2">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SubDashboard;