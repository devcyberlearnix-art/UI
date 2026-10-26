import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Plus,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { assignmentApi } from "../../api/assignmentApi";

const CreateAssignmentForm = ({ courseId, onCreated, onCancel }) => {
  const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxScore: 100 });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      await assignmentApi.createAssignment(courseId, { ...form, maxScore: Number(form.maxScore) });
      toast.success("Assignment created!");
      onCreated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-orange-200 shadow-sm p-6 space-y-4">
      <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Plus size={17} className="text-orange-600" /> New Assignment</h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Title *</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Assignment title" className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Instructions for students..." className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Due Date</label>
            <input name="dueDate" type="datetime-local" value={form.dueDate} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Max Score</label>
            <input name="maxScore" type="number" min="1" max="1000" value={form.maxScore} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition disabled:opacity-60">
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Create Assignment</>}
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition">
          <X size={14} /> Cancel
        </button>
      </div>
    </form>
  );
};

const GradeSubmissionForm = ({ assignmentId, submission, onGraded }) => {
  const [grade, setGrade] = useState(submission.grade || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [saving, setSaving] = useState(false);

  const handleGrade = async () => {
    if (grade === "") { toast.error("Please enter a grade"); return; }
    setSaving(true);
    try {
      await assignmentApi.gradeSubmission(assignmentId, submission.id, { grade: Number(grade), feedback });
      toast.success("Submission graded!");
      onGraded?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to grade submission");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
      <p className="text-xs font-medium text-slate-700">Submission by: {submission.studentName || submission.studentId}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Grade</label>
          <input type="number" value={grade} onChange={e => setGrade(e.target.value)} placeholder="Score" className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Feedback</label>
          <input type="text" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Optional feedback" className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
        </div>
      </div>
      <button onClick={handleGrade} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-60">
        {saving ? <Loader2 size={12} className="animate-spin" /> : <Star size={12} />} {submission.grade != null ? "Update Grade" : "Submit Grade"}
      </button>
    </div>
  );
};

const AssignmentRow = ({ assignment, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpanded(p => !p)}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
            <ClipboardList size={18} className="text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{assignment.title}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {assignment.dueDate ? `Due: ${new Date(assignment.dueDate).toLocaleDateString()}` : "No due date"}
              {" · "} Max: {assignment.maxScore || "N/A"} pts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {assignment.submissions?.length > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              <Users size={10} /> {assignment.submissions.length}
            </span>
          )}
          {expanded ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
          {assignment.description && <p className="text-sm text-slate-600">{assignment.description}</p>}
          {(!assignment.submissions || assignment.submissions.length === 0) ? (
            <p className="text-sm text-slate-500 italic">No submissions yet.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Submissions ({assignment.submissions.length})</p>
              {assignment.submissions.map(sub => (
                <GradeSubmissionForm key={sub.id} assignmentId={assignment.id} submission={sub} onGraded={onRefresh} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InstructorAssignments = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const handleCreated = () => {
    setShowCreateForm(false);
    fetchAssignments();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-9 h-9 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><ClipboardList className="text-orange-600" size={24} /> Manage Assignments</h1>
            <p className="text-slate-500 text-sm mt-0.5">{assignments.length} assignment{assignments.length !== 1 ? "s" : ""} for this course</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAssignments} className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition"><RefreshCw size={15} /></button>
            <button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition">
              <Plus size={15} /> New Assignment
            </button>
          </div>
        </div>
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={16} /><p className="text-sm">{error}</p>
          </div>
        )}
        {showCreateForm && (
          <CreateAssignmentForm courseId={courseId} onCreated={handleCreated} onCancel={() => setShowCreateForm(false)} />
        )}
        <div className="space-y-4">
          {assignments.map(a => <AssignmentRow key={a.id} assignment={a} onRefresh={fetchAssignments} />)}
          {assignments.length === 0 && !showCreateForm && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <ClipboardList size={40} className="text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No assignments yet</h3>
              <p className="text-slate-500 text-sm mb-4">Create your first assignment for this course.</p>
              <button onClick={() => setShowCreateForm(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-xl font-semibold text-sm hover:bg-orange-700 transition">
                <Plus size={15} /> Create Assignment
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default InstructorAssignments;
