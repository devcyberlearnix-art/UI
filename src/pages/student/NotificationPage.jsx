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
      return <BookOpen size={18} className="text-cyan-400" />;
    case 'REVIEW':
      return <Star size={18} className="text-amber-400" />;
    case 'CERTIFICATE':
      return <Award size={18} className="text-[#C5A880]" />;
    case 'COURSE_UPDATE':
      return <BellRing size={18} className="text-[#E5E5E7]" />;
    case 'PAYMENT':
      return <ShoppingCart size={18} className="text-emerald-400" />;
    case 'SYSTEM':
      return <AlertCircle size={18} className="text-rose-400" />;
    default:
      return <Bell size={18} className="text-[#8E8E93]" />;
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
      <div className="min-h-screen flex items-center justify-center bg-[#070709]">
        <div className="text-center space-y-3">
          <Loader2 className="animate-spin text-[#C5A880] w-8 h-8 mx-auto" />
          <p className="text-xs font-mono text-[#8E8E93]">Streaming telemetry alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] p-4 sm:p-8 selection:bg-[#C5A880]/30 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING_TRANSITION}
          className="pb-4 border-b border-white/[0.04]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#14141A] border border-white/[0.04] flex items-center justify-center text-[#C5A880]">
                  <Bell size={16} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#F5F5F7]">
                  Telemetry & System Alerts
                </h1>
              </div>
              <p className="text-xs text-[#8E8E93] font-mono mt-1">
                Real-time microservice notifications routed via event pipeline
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-2 rounded-xl bg-[#0F0F13] border border-white/[0.04] text-[#8E8E93] hover:text-white transition-colors"
                title="Sync Telemetry Stream"
              >
                <RefreshCw size={15} className={isFetching ? "animate-spin text-[#C5A880]" : ""} />
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
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] text-xs font-mono font-medium">
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
                  ? 'bg-[#C5A880] text-[#070709] font-bold shadow-lg shadow-[#C5A880]/15'
                  : 'bg-[#0F0F13] text-[#8E8E93] hover:text-white border border-white/[0.04] hover:border-white/10'
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
                      ? 'bg-[#0F0F13] border-[#C5A880]/30 shadow-lg shadow-[#C5A880]/5'
                      : 'bg-[#0F0F13]/60 border-white/[0.04] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-[#14141A] border border-white/[0.04] shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-[#F5F5F7] tracking-tight">
                            {notification.title}
                          </h3>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#C5A880] shrink-0" />
                          )}
                        </div>

                        {isUnread && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.notificationId || notification.id);
                            }}
                            className="p-1 text-[#8E8E93] hover:text-white transition-colors"
                            title="Dismiss Alert"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed line-clamp-2">
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
                        <span className="uppercase text-[#8E8E93]">{notification.priority}</span>
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
              className="text-center py-20 bg-[#0F0F13] border border-white/[0.04] rounded-3xl p-8"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#14141A] border border-white/[0.04] flex items-center justify-center text-[#8E8E93]">
                <Bell size={28} />
              </div>
              <h3 className="text-base font-bold text-[#F5F5F7] mb-1">
                Telemetry Pipeline Clear
              </h3>
              <p className="text-xs text-[#8E8E93] max-w-sm mx-auto leading-relaxed">
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
