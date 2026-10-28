import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Play,
  XCircle,
  Plus,
  ChevronRight,
  MapPin,
  Globe,
  Mic,
  Video as VideoIcon,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { liveClassApi } from "../../api/liveClassApi";
import { useAuth } from "../../context/AuthContext";

const LiveClassPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(null);
  const [attending, setAttending] = useState(null);

  const fetchLiveClasses = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await liveClassApi.getLiveClassesByCourse(courseId);
      if (Array.isArray(data)) {
        setLiveClasses(data);
      } else if (data?.data) {
        setLiveClasses(Array.isArray(data.data) ? data.data : data.data.liveClasses || []);
      }
    } catch (err) {
      console.error("[LiveClassPage] Failed to load live classes", err);
      setError("Failed to load live classes");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchLiveClasses();
  }, [fetchLiveClasses]);

  const handleJoin = async (liveClassId) => {
    setJoining(liveClassId);
    try {
      const data = await liveClassApi.joinLiveClass(liveClassId);
      if (data?.data?.meetingUrl) {
        window.open(data.data.meetingUrl, '_blank');
        toast.success("Joined live class!");
      }
    } catch (err) {
      toast.error("Failed to join live class");
    } finally {
      setJoining(null);
    }
  };

  const handleJoinAttendance = async (liveClassId) => {
    setAttending(liveClassId);
    try {
      await liveClassApi.joinAttendance(liveClassId);
      toast.success("Attendance marked!");
      await fetchLiveClasses();
    } catch (err) {
      toast.error("Failed to mark attendance");
    } finally {
      setAttending(null);
    }
  };

  const handleLeaveAttendance = async (liveClassId) => {
    try {
      await liveClassApi.leaveAttendance(liveClassId);
      toast.success("Left class");
      await fetchLiveClasses();
    } catch (err) {
      toast.error("Failed to leave class");
    }
  };

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-emerald-100 text-emerald-700';
      case 'COMPLETED': return 'bg-slate-100 text-slate-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-600">Loading live classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-slate-900 mb-2">Live Classes</h1>
          <p className="text-slate-500">
            Join scheduled live sessions with your instructor
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-700"
          >
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Live Classes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveClasses.map((liveClass, idx) => (
            <motion.div
              key={liveClass.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
            >
              {/* Header */}
              <div className="bg-[#0F0F13] border-b border-white/[0.06] p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    getStatusColor(liveClass.status)
                  }`}>
                    {liveClass.status}
                  </span>
                  <Video size={18} className="text-[#C5A880]" />
                </div>
                <h3 className="font-bold text-lg line-clamp-1">{liveClass.title}</h3>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} />
                  <span>{formatDateTime(liveClass.scheduledTime)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Clock size={16} />
                  <span>{liveClass.duration || 60} minutes</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users size={16} />
                  <span>{liveClass.attendees || 0} attending</span>
                </div>

                {liveClass.description && (
                  <p className="text-sm text-slate-500 line-clamp-2">{liveClass.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-200">
                {liveClass.status === 'SCHEDULED' || liveClass.status === 'IN_PROGRESS' ? (
                  <button
                    onClick={() => handleJoin(liveClass.id)}
                    disabled={joining === liveClass.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C5A880] text-[#070709] font-bold hover:bg-[#D4BC98] transition shadow-sm disabled:opacity-50"
                  >
                    {joining === liveClass.id ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        <Play size={18} />
                        Join Class
                      </>
                    )}
                  </button>
                ) : liveClass.status === 'COMPLETED' ? (
                  <div className="text-center text-sm text-slate-500">
                    This class has ended
                  </div>
                ) : (
                  <div className="text-center text-sm text-red-500">
                    This class was cancelled
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {liveClasses.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Video size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Live Classes Scheduled</h3>
              <p className="text-slate-500 mb-6">
                Check back later for upcoming live sessions
              </p>
              <button
                onClick={() => navigate(`/student/courses/${courseId}`)}
                className="px-6 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
              >
                Back to Course
              </button>
            </div>
          )}
        </div>

        {/* Attendance Summary */}
        {liveClasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white rounded-2xl shadow-sm p-6"
          >
            <h3 className="font-bold text-slate-900 mb-4">Your Attendance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-2xl font-black text-emerald-600">
                  {liveClasses.filter(lc => lc.attended).length}
                </div>
                <div className="text-xs text-slate-600">Attended</div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <div className="text-2xl font-black text-blue-600">
                  {liveClasses.filter(lc => lc.status === 'SCHEDULED').length}
                </div>
                <div className="text-xs text-slate-600">Upcoming</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-2xl font-black text-slate-600">
                  {liveClasses.length}
                </div>
                <div className="text-xs text-slate-600">Total</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LiveClassPage;
