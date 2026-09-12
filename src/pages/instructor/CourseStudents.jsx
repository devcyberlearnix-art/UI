import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, ArrowLeft, Loader2, AlertCircle, RefreshCw,
  Search, Mail, Calendar, TrendingUp, X, ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";

const CourseStudents = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const instructorId = user?.id;

  const [students, setStudents]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [selectedStudent, setSelected]  = useState(null);
  const [detailLoading, setDetailLoad]  = useState(false);
  const [detailError, setDetailError]   = useState("");

  const fetchStudents = async () => {
    if (!instructorId || !courseId) return;
    setLoading(true);
    setError("");
    try {
      // GET /api/v1/instructors/{instructorId}/courses/{courseId}/students
      const data = await instructorApi.getCourseStudents(instructorId, courseId);
      const list = Array.isArray(data) ? data : (data?.data || data?.students || []);
      setStudents(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [instructorId, courseId]);

  const handleViewDetail = async (student) => {
    setSelected(student);
    setDetailError("");
    setDetailLoad(true);
    try {
      // GET /api/v1/instructors/{instructorId}/courses/{courseId}/students/{studentId}
      const data = await instructorApi.getStudentDetail(instructorId, courseId, student.id);
      const detail = data?.data || data;
      setSelected({ ...student, ...detail });
    } catch (err) {
      setDetailError(err.response?.data?.message || err.message || "Failed to load student detail");
    } finally {
      setDetailLoad(false);
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name || s.fullName || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enrolled Students</h1>
            <p className="text-sm text-gray-500">
              {loading ? "Loading..." : `${students.length} students enrolled`}
            </p>
          </div>
        </div>
        <button
          onClick={fetchStudents}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-orange-500" />
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Users size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No students found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Enrolled</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student) => (
                  <motion.tr
                    key={student.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-orange-50/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-xs">
                          {(student.name || student.fullName || "?")[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">
                          {student.name || student.fullName || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Mail size={13} /> {student.email || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} />
                        {student.enrolledAt
                          ? new Date(student.enrolledAt).toLocaleDateString()
                          : "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {student.progress != null ? (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
                            <div
                              className="h-full bg-orange-400 rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{student.progress}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleViewDetail(student)}
                        className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-xs"
                      >
                        Details <ChevronRight size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">Student Progress</h2>
                <button
                  onClick={() => { setSelected(null); setDetailError(""); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={28} className="animate-spin text-orange-500" />
                </div>
              ) : detailError ? (
                <div className="text-red-600 text-sm text-center py-4">{detailError}</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xl font-bold">
                      {(selectedStudent.name || selectedStudent.fullName || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedStudent.name || selectedStudent.fullName}</p>
                      <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl">
                    {[
                      { label: "Enrolled On", value: selectedStudent.enrolledAt ? new Date(selectedStudent.enrolledAt).toLocaleDateString() : "—" },
                      { label: "Progress",    value: selectedStudent.progress != null ? `${selectedStudent.progress}%` : "—" },
                      { label: "Grade",       value: selectedStudent.grade || "—" },
                      { label: "Status",      value: selectedStudent.status || "Active" },
                      { label: "Last Active", value: selectedStudent.lastActive ? new Date(selectedStudent.lastActive).toLocaleDateString() : "—" },
                      { label: "Completed",   value: selectedStudent.completedAt ? new Date(selectedStudent.completedAt).toLocaleDateString() : "—" },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 uppercase font-medium">{label}</p>
                        <p className="text-sm font-semibold text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>

                  {selectedStudent.progress != null && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Course Completion</span>
                        <span>{selectedStudent.progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-400 rounded-full transition-all"
                          style={{ width: `${selectedStudent.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseStudents;
