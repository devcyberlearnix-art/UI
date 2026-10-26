import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import { assignmentApi } from "../../api/assignmentApi";

const StatusBadge = ({ status }) => {
  const cfg = {
    SUBMITTED: { cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, label: "Submitted" },
    GRADED: { cls: "bg-blue-100 text-blue-700", icon: CheckCircle2, label: "Graded" },
    PENDING: { cls: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending" },
    OVERDUE: { cls: "bg-red-100 text-red-700", icon: XCircle, label: "Overdue" },
  };
  const c = cfg[status] || { cls: "bg-slate-100 text-slate-600", icon: Clock, label: status || "Open" };
  const Icon = c.icon;
  return (
    <span className={"inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium " + c.cls}>
      <Icon size={11} /> {c.label}
    </span>
  );
};

const AssignmentCard = ({ assignment, courseId, onSubmit }) => {
  const [expanded, setExpanded] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(!!assignment.submission);

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && !submitted;
  const currentStatus = submitted ? "SUBMITTED" : isOverdue ? "OVERDUE" : "PENDING";

  const handleFileChange = (e) => { const f = e.target.files[0]; if (f) setFile(f); };

  const handleSubmit = async () => {
    if (!file) { toast.error("Please select a file to submit"); return; }
    setUploading(true);
    try {
      await assignmentApi.submitAssignment(assignment.id, file);
      setSubmitted(true);
      setFile(null);
      toast.success("Assignment submitted successfully!");
      onSubmit?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit assignment");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div layout className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 cursor-pointer flex items-start justify-between gap-4" onClick={() => setExpanded(p => !p)}>
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <ClipboardList size={20} className="text-orange-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{assignment.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {dueDate ? `Due: ${dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "No due date"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={currentStatus} />
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
              {assignment.description && <p className="text-sm text-slate-600 leading-relaxed">{assignment.description}</p>}
              {assignment.maxScore && <p className="text-sm text-slate-500">Maximum score: <span className="font-semibold text-slate-800">{assignment.maxScore}</span></p>}
              {assignment.submission?.grade != null && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="text-sm font-semibold text-emerald-700">Grade: {assignment.submission.grade} / {assignment.maxScore || "—"}</p>
                  {assignment.submission.feedback && <p className="text-sm text-emerald-600 mt-1">Feedback: {assignment.submission.feedback}</p>}
                </div>
              )}
              {!submitted && !isOverdue && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Upload your submission</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-orange-400 transition">
                    <input id={"file-" + assignment.id} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.zip,.py,.js,.java,.txt" />
                    <label htmlFor={"file-" + assignment.id} className="cursor-pointer">
                      <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                      {file ? <p className="text-sm font-medium text-slate-800">{file.name}</p> : <p className="text-sm text-slate-500">Click to select file (PDF, DOC, ZIP, code files)</p>}
                    </label>
                  </div>
                  <button onClick={handleSubmit} disabled={!file || uploading} className="w-full bg-orange-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {uploading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Upload size={16} /> Submit Assignment</>}
                  </button>
                </div>
              )}
              {submitted && <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl p-3"><CheckCircle2 size={18} /><span className="text-sm font-medium">Assignment submitted</span></div>}
              {isOverdue && <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-3"><XCircle size={18} /><span className="text-sm font-medium">Submission deadline has passed</span></div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Assignments = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignments = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError("");
    try {
      const res = await assignmentApi.getAssignments(courseId);
      const list = res?.data || res || [];
      setAssignments(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-orange-600" size={24} /> Assignments
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{assignments.length} assignment{assignments.length !== 1 ? "s" : ""} for this course</p>
          </div>
          <button onClick={fetchAssignments} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"><RefreshCw size={16} /></button>
        </div>
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={18} /><p className="text-sm">{error}</p>
          </div>
        )}
        {!error && assignments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
              <BookOpen size={40} className="text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No assignments yet</h3>
            <p className="text-slate-500 text-sm">Your instructor has not posted any assignments for this course.</p>
          </div>
        )}
        <div className="space-y-4">
          {assignments.map(a => <AssignmentCard key={a.id} assignment={a} courseId={courseId} onSubmit={fetchAssignments} />)}
        </div>
      </div>
    </motion.div>
  );
};

export default Assignments;
