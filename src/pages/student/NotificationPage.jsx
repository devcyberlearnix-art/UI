import { useState, useEffect, useCallback } from "react";
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
  Users,
  ShoppingCart,
  AlertCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { notificationApi } from "../../api/notificationApi";
import { useAuth } from "../../context/AuthContext";

const NotificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const userId = user?.id || user?.userId;
      if (!userId) {
        console.warn("[NotificationPage] No user ID available");
        setLoading(false);
        return;
      }

      const [notifData, countData] = await Promise.all([
        notificationApi.getNotifications(userId),
        notificationApi.getUnreadCount(userId),
      ]);

      if (Array.isArray(notifData?.data)) {
        setNotifications(notifData.data);
      } else if (Array.isArray(notifData)) {
        setNotifications(notifData);
      }

      if (countData?.data) {
        setUnreadCount(countData.data.count || countData.data);
      }
    } catch (err) {
      console.error("[NotificationPage] Failed to load notifications", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === notificationId || n.id === notificationId ? { ...n, status: 'READ', read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ENROLLMENT': return <BookOpen size={20} className="text-blue-600" />;
      case 'REVIEW': return <Star size={20} className="text-amber-600" />;
      case 'CERTIFICATE': return <Award size={20} className="text-emerald-600" />;
      case 'COURSE_UPDATE': return <BellRing size={20} className="text-orange-600" />;
      case 'PAYMENT': return <ShoppingCart size={20} className="text-purple-600" />;
      case 'SYSTEM': return <AlertCircle size={20} className="text-red-600" />;
      default: return <Bell size={20} className="text-slate-600" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'ENROLLMENT': return 'bg-blue-50 border-blue-200';
      case 'REVIEW': return 'bg-amber-50 border-amber-200';
      case 'CERTIFICATE': return 'bg-emerald-50 border-emerald-200';
      case 'COURSE_UPDATE': return 'bg-orange-50 border-orange-200';
      case 'PAYMENT': return 'bg-purple-50 border-purple-200';
      case 'SYSTEM': return 'bg-red-50 border-red-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return n.status !== 'READ' && !n.read;
    return n.type === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Notifications</h1>
              <p className="text-slate-500">
                Stay updated with your learning journey
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchNotifications}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              >
                <RefreshCw size={18} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
                >
                  <CheckCircle2 size={16} />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold">
              <BellRing size={16} />
              {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
            </div>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2 overflow-x-auto pb-2"
        >
          {['all', 'unread', 'ENROLLMENT', 'REVIEW', 'CERTIFICATE', 'COURSE_UPDATE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : f}
            </button>
          ))}
        </motion.div>

        {/* Notifications List */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.map((notification, idx) => (
              <motion.div
                key={notification.notificationId || notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  if (notification.status !== 'READ' && !notification.read) {
                    handleMarkAsRead(notification.notificationId || notification.id);
                  }
                  if (notification.actionUrl) {
                    navigate(notification.actionUrl);
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition hover:shadow-md ${
                  (notification.status === 'READ' || notification.read) ? 'bg-white border-slate-200' : 'bg-white border-l-4 border-l-orange-500 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-slate-900">{notification.title}</h3>
                      {notification.status !== 'READ' && !notification.read && (
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                      <Clock size={12} />
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {notification.status !== 'READ' && !notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.notificationId || notification.id);
                      }}
                      className="p-2 text-slate-400 hover:text-slate-600 transition"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200"
            >
              <Bell size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Notifications</h3>
              <p className="text-slate-500">
                {filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up!'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;
