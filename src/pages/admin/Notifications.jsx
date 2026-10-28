import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Plus,
  Search,
  Trash2,
  Eye,
  Send,
  Users,
  GraduationCap,
  Shield,
  X,
  Radio,
} from 'lucide-react';
import Portal from '../../components/ui/Portal';
import Badge from '../../design-system/primitives/Badge';
import Button from '../../design-system/primitives/Button';
import { adminApi } from '../../api/adminApi';
import toast from 'react-hot-toast';

const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 26,
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'New React Architecture Course Published',
    message: 'Advanced React 19 concurrent patterns and design system architecture is now live.',
    audience: 'Students',
    date: '20 Jul 2025',
  },
  {
    id: 2,
    title: 'Settlement Ledger Verification',
    message: 'All monthly instructor revenue disbursements have been cryptographically reconciled.',
    audience: 'Instructors',
    date: '22 Jul 2025',
  },
  {
    id: 3,
    title: 'Microservices Mesh Upgrade Complete',
    message: 'Gateway infrastructure upgraded to TLS 1.3 with sub-millisecond p99 latency.',
    audience: 'All Users',
    date: '25 Jul 2025',
  },
];

export const Notifications = () => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'All Users',
  });
  const [selectedNotification, setSelectedNotification] = useState(null);

  const filteredNotifications = notifications.filter((item) => {
    const q = search.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q);
  });

  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleAddNotification = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) return;

    setIsBroadcasting(true);
    try {
      await adminApi.broadcastNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        channel: 'PUSH',
      });
      toast.success('Live broadcast transmitted to cluster!');

      const newNotification = {
        id: Date.now(),
        title: formData.title.trim(),
        message: formData.message.trim(),
        audience: formData.audience,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };

      setNotifications([newNotification, ...notifications]);
      setShowModal(false);
      setFormData({ title: '', message: '', audience: 'All Users' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to dispatch broadcast telemetry');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
    toast.success('Notification dismissed');
  };

  const studentsCount = notifications.filter((n) => n.audience === 'Students').length;
  const instructorsCount = notifications.filter((n) => n.audience === 'Instructors').length;

  return (
    <div className="w-full space-y-6 font-sans selection:bg-[#C5A880]/30 selection:text-white">
      {/* ===================== HERO HEADER ===================== */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_TRANSITION}
        className="rounded-2xl bg-[#0F0F13] border border-white/[0.04] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#14141A] border border-white/[0.04] text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
            <Radio className="w-3 h-3 text-[#C5A880]" />
            <span>Broadcast Telemetry</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5F5F7] tracking-tight">
            System Notifications
          </h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Dispatch announcements, maintenance alerts, and targeted operational signals.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={Plus}
          onClick={() => setShowModal(true)}
          className="self-start md:self-auto cursor-pointer"
        >
          Dispatch Notification
        </Button>
      </motion.section>

      {/* ===================== METRIC CARDS ===================== */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#8E8E93] tracking-wide block">
              Total Dispatches
            </span>
            <p className="text-2xl font-extrabold text-[#F5F5F7] font-mono tracking-tight mt-1">
              {notifications.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#14141A] border border-white/[0.04] flex items-center justify-center text-[#C5A880]">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#8E8E93] tracking-wide block">
              Student Audience
            </span>
            <p className="text-2xl font-extrabold text-[#E5E5E7] font-mono tracking-tight mt-1">
              {studentsCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#14141A] border border-white/[0.04] flex items-center justify-center text-[#E5E5E7]">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#8E8E93] tracking-wide block">
              Instructor Audience
            </span>
            <p className="text-2xl font-extrabold text-[#C5A880] font-mono tracking-tight mt-1">
              {instructorsCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#14141A] border border-white/[0.04] flex items-center justify-center text-[#C5A880]">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* ===================== NOTIFICATION LIST CARD ===================== */}
      <section className="rounded-2xl bg-[#0F0F13] border border-white/[0.04] p-6 space-y-4">
        {/* Search & Counter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.04]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notifications by title or message..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]/50 transition-colors"
            />
          </div>

          <div className="text-xs text-[#71717A]">
            Showing <span className="font-semibold text-white">{filteredNotifications.length}</span> of {notifications.length}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#14141A]/70 border border-white/[0.04] hover:border-white/[0.08] transition-all flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#0F0F13] border border-white/[0.06] flex items-center justify-center text-[#C5A880] shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#F5F5F7] tracking-tight truncate">
                        {item.title}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#0F0F13] border border-white/[0.04] text-[10px] font-mono text-[#A1A1AA]">
                        {item.audience}
                      </span>
                    </div>
                    <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-[#71717A] font-mono mt-2 block">
                      {item.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedNotification(item)}
                    className="p-2 rounded-lg text-[#71717A] hover:text-[#C5A880] hover:bg-white/[0.04] transition-colors cursor-pointer"
                    title="View details"
                    aria-label="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNotification(item.id)}
                    className="p-2 rounded-lg text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete notification"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-xs text-[#71717A]">
              No notifications matched your search query.
            </div>
          )}
        </div>
      </section>

      {/* ===================== CREATE MODAL ===================== */}
      {showModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={SPRING_TRANSITION}
              className="w-full max-w-lg rounded-2xl bg-[#0F0F13] border border-white/[0.06] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                <h2 className="text-sm font-bold text-[#F5F5F7] tracking-tight">
                  Dispatch Broadcast Notification
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-lg text-[#71717A] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddNotification} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8E8E93]">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., Scheduled Maintenance Window"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8E8E93]">
                    Target Audience
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-[#F5F5F7] focus:outline-none focus:border-[#C5A880]/50 transition-colors"
                  >
                    <option value="All Users">All Users</option>
                    <option value="Students">Students Only</option>
                    <option value="Instructors">Instructors Only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#8E8E93]">
                    Message Payload
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter announcement description..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.06] text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]/50 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isBroadcasting}
                    rightIcon={Send}
                  >
                    {isBroadcasting ? 'Transmitting...' : 'Broadcast'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </Portal>
      )}

      {/* ===================== DETAIL MODAL ===================== */}
      {selectedNotification && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={SPRING_TRANSITION}
              className="w-full max-w-md rounded-2xl bg-[#0F0F13] border border-white/[0.06] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
                <h2 className="text-sm font-bold text-[#F5F5F7] tracking-tight">
                  Notification Telemetry
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="p-1 rounded-lg text-[#71717A] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#71717A] uppercase font-mono tracking-wider block">
                    Headline
                  </span>
                  <p className="font-bold text-[#F5F5F7] mt-0.5 text-sm">
                    {selectedNotification.title}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-[#71717A] uppercase font-mono tracking-wider block">
                    Payload
                  </span>
                  <p className="text-[#8E8E93] mt-0.5 leading-relaxed">
                    {selectedNotification.message}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-mono tracking-wider block">
                      Target Audience
                    </span>
                    <span className="font-mono text-[#C5A880] mt-0.5 inline-block">
                      {selectedNotification.audience}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#71717A] uppercase font-mono tracking-wider block">
                      Timestamp
                    </span>
                    <span className="font-mono text-[#A1A1AA] mt-0.5 inline-block">
                      {selectedNotification.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedNotification(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default Notifications;
