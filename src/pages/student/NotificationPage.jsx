import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Star,
  Award,
  BookOpen,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "../../hooks/useNotifications";
import Button from "../../design-system/primitives/Button";
import Badge from "../../design-system/primitives/Badge";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 26,
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'ENROLLMENT':
      return <BookOpen size={18} className="text-[#5B3E57] dark:text-[#D1A7CC]" />;
    case 'REVIEW':
      return <Star size={18} className="text-amber-400" />;
    case 'CERTIFICATE':
      return <Award size={18} className="text-[#5B3E57] dark:text-[#D1A7CC]" />;
    case 'COURSE_UPDATE':
      return <BellRing size={18} className="text-[#282521] dark:text-[#EDE8E1]" />;
    case 'PAYMENT':
      return <ShoppingCart size={18} className="text-emerald-400" />;
    case 'SYSTEM':
      return <AlertCircle size={18} className="text-rose-400" />;
    default:
      return <Bell size={18} className="text-[#635E56] dark:text-[#A8A196]" />;
  }
};

const NotificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id || user?.userId;

  const [filter, setFilter] = useState("all");

  const {
    notifications = [],
    unreadCount = 0,
    isLoading,
    isFetching,
    refetch,
  } = useNotifications(userId);

  const { mutate: markAsRead } = useMarkNotificationAsRead(userId);
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllNotificationsAsRead(userId);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === "all") return true;
      if (filter === "unread") return !n.read && n.status !== 'READ';
      return n.type === filter;
    });
  }, [notifications, filter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F2EC] dark:bg-[#151413]">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-[#5B3E57] dark:text-[#D1A7CC] w-8 h-8 mx-auto" />
          <p className="text-xs font-mono text-[#635E56] dark:text-[#A8A196]">Streaming telemetry alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] p-4 sm:p-8 selection:bg-[#5B3E57] dark:bg-[#D1A7CC]/30 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="pb-4 border-b border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC]">
                  <Bell size={16} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#282521] dark:text-[#EDE8E1]">
                  Telemetry & System Alerts
                </h1>
              </div>
              <p className="text-xs text-[#635E56] dark:text-[#A8A196] font-mono mt-1">
                Real-time microservice notifications routed via event pipeline
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] text-[#635E56] dark:text-[#A8A196] hover:text-white transition-colors"
                title="Sync Telemetry Stream"
              >
                <RefreshCw size={15} className={isFetching ? "animate-spin text-[#5B3E57] dark:text-[#D1A7CC]" : ""} />
              </button>

              {unreadCount > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={markingAll}
                  onClick={() => markAllAsRead()}
                >
                  <CheckCircle2 size={14} className="mr-1.5" />
                  <span>Mark All Read</span>
                </Button>
              )}
            </div>
          </div>

          {/* Unread Telemetry Pill */}
          {unreadCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#5B3E57]/30 dark:border-[#D1A7CC]/30 text-[#5B3E57] dark:text-[#D1A7CC] text-xs font-mono font-medium">
              <Sparkles size={13} />
              <span>{unreadCount} unread system signal{unreadCount > 1 ? 's' : ''}</span>
            </div>
          )}
        </motion.div>

        {/* Filter Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="flex items-center gap-2 overflow-x-auto pb-1"
        >
          {['all', 'unread', 'ENROLLMENT', 'CERTIFICATE', 'COURSE_UPDATE', 'REVIEW', 'PAYMENT'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all select-none whitespace-nowrap ${
                filter === f
                  ? 'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] font-bold shadow-lg shadow-sm'
                  : 'bg-[#FFFEFA] dark:bg-[#1D1C1A] text-[#635E56] dark:text-[#A8A196] hover:text-white border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#D5C0D1] dark:border-white/10'
              }`}
            >
              {f === 'all' ? 'All Alerts' : f === 'unread' ? `Unread (${unreadCount})` : f.replace('_', ' ')}
            </button>
          ))}
        </motion.div>

        {/* Notifications List Track */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification, idx) => {
              const isUnread = !notification.read && notification.status !== 'READ';
              return (
                <motion.div
                  key={notification.notificationId || notification.id || idx}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={SPRING_TRANSITION}
                  onClick={() => {
                    if (isUnread) {
                      markAsRead(notification.notificationId || notification.id);
                    }
                    if (notification.actionUrl) {
                      navigate(notification.actionUrl);
                    }
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden ${
                    isUnread
                      ? 'bg-[#FFFEFA] dark:bg-[#1D1C1A] border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 shadow-lg shadow-sm'
                      : 'bg-[#FFFEFA] dark:bg-[#1D1C1A]/60 border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#D5C0D1] dark:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-[#282521] dark:text-[#EDE8E1] tracking-tight">
                            {notification.title}
                          </h3>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#5B3E57] dark:bg-[#D1A7CC] shrink-0" />
                          )}
                        </div>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.notificationId || notification.id);
                            }}
                            className="p-1 text-[#635E56] dark:text-[#A8A196] hover:text-white transition-colors"
                            title="Dismiss Alert"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A8A196] leading-relaxed line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-[#52525B]">
                        <span className="flex items-center gap-1.5">
                          <Clock size={11} />
                          {new Date(notification.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>•</span>
                        <span className="uppercase text-[#635E56] dark:text-[#A8A196]">{notification.priority}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={SPRING_TRANSITION}
              className="text-center py-20 bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] rounded-3xl p-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-center text-[#635E56] dark:text-[#A8A196]">
                <Bell size={28} />
              </div>
              <h3 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1] mb-1">
                Telemetry Pipeline Clear
              </h3>
              <p className="text-xs text-[#635E56] dark:text-[#A8A196] max-w-sm mx-auto leading-relaxed">
                {filter === 'unread'
                  ? 'All pending system signals and notifications have been cleared.'
                  : 'No active events or system broadcasts found in the telemetry stream.'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
