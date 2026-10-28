import { useState } from "react";
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
  FileCode,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCourseAssignments, useSubmitAssignment } from "../../hooks/useAssessments";
import Button from "../../design-system/primitives/Button";
import Badge from "../../design-system/primitives/Badge";

const SPRING_TRANSITION = {
  type: "spring",
  stiffness: 280,
  damping: 26,
};

const StatusBadge = ({ status }) => {
  const cfg = {
    SUBMITTED: { variant: "emerald", icon: CheckCircle2, label: "Submitted" },
    GRADED: { variant: "cyan", icon: CheckCircle2, label: "Graded" },
    PENDING: { variant: "amber", icon: Clock, label: "Pending" },
    OVERDUE: { variant: "danger", icon: XCircle, label: "Overdue" },
  };
  const c = cfg[status] || { variant: "secondary", icon: Clock, label: status || "Open" };
  const Icon = c.icon;

  return (
    <Badge variant={c.variant} size="sm" className="gap-1 font-mono">
      <Icon size={12} />
      <span>{c.label}</span>
    </Badge>
  );
};

const AssignmentCard = ({ assignment, courseId }) => {
  const [expanded, setExpanded] = useState(false);
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(Boolean(assignment.submitted || assignment.submission));

  const { mutate: submitAssignment, isPending: uploading } = useSubmitAssignment();

  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && !submitted;
  const currentStatus = submitted ? "SUBMITTED" : isOverdue ? "OVERDUE" : "PENDING";

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please select an archive or code document to submit");
      return;
    }
    submitAssignment(
      {
        assignmentId: assignment.id,
        submissionData: file,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setFile(null);
        },
      }
    );
  };

  return (
    <motion.div
      layout
      transition={SPRING_TRANSITION}
      className="bg-[#0F0F13] rounded-2xl border border-white/[0.04] shadow-xl overflow-hidden hover:border-white/10 transition-colors"
    >
      <div
        className="p-5 cursor-pointer flex items-start justify-between gap-4 select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#14141A] border border-white/[0.04] flex items-center justify-center flex-shrink-0 text-[#C5A880]">
            <ClipboardList size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[#F5F5F7] tracking-tight truncate text-sm sm:text-base">
              {assignment.title}
            </h3>
            <p className="text-xs text-[#8E8E93] font-mono mt-0.5">
              {dueDate
                ? `Due: ${dueDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : "Continuous Milestone Evaluation"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={currentStatus} />
          <div className="p-1 rounded-lg text-[#8E8E93] hover:text-white transition-colors">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING_TRANSITION}
            className="overflow-hidden border-t border-white/[0.04]"
          >
            <div className="p-5 space-y-4 bg-[#0A0A0E]/50">
              {assignment.description && (
                <p className="text-xs sm:text-sm text-[#8E8E93] leading-relaxed">
                  {assignment.description}
                </p>
              )}
              {assignment.maxScore && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#8E8E93]">
                  <span>Score Weight:</span>
                  <span className="text-[#F5F5F7] font-semibold">{assignment.maxScore} PTS</span>
                </div>
              )}

              {/* Verified Grade Callout */}
              {assignment.grade != null && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-emerald-400">
                      Evaluated Score: {assignment.grade} / {assignment.maxScore || 100}
                    </p>
                    {assignment.feedback && (
                      <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                        Instructor Feedback: {assignment.feedback}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Workspace */}
              {!submitted && !isOverdue && (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#8E8E93]">
                    Upload Execution Artifact / Code Archive
                  </label>
                  <div className="border-2 border-dashed border-white/[0.08] hover:border-[#C5A880]/50 rounded-2xl p-6 text-center transition-all bg-[#0F0F13]">
                    <input
                      id={`file-${assignment.id}`}
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.zip,.tar.gz,.py,.js,.java,.ts,.cpp,.txt"
                    />
                    <label htmlFor={`file-${assignment.id}`} className="cursor-pointer block space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-[#14141A] border border-white/[0.04] mx-auto flex items-center justify-center text-[#8E8E93] hover:text-[#C5A880] transition-colors">
                        <Upload size={18} />
                      </div>
                      {file ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] text-xs font-mono font-medium">
                          <FileCode size={14} />
                          <span>{file.name}</span>
                          <span className="text-[#8E8E93]">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-[#E5E5E7] font-medium">
                            Click to select archive or code file
                          </p>
                          <p className="text-[11px] text-[#52525B] font-mono mt-0.5">
                            Supports ZIP, TAR, PDF, Python, JavaScript, Java, C++
                          </p>
                        </div>
                      )}
                    </label>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full justify-center"
                    disabled={!file || uploading}
                    onClick={handleSubmit}
                  >
                    {uploading ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        <span>Transmitting to Evaluation Pipeline...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        <span>Submit Lab Artifact</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {submitted && (
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs font-mono">
                  <CheckCircle2 size={16} />
                  <span>Lab submission verified and recorded for grading</span>
                </div>
              )}

              {isOverdue && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs font-mono">
                  <XCircle size={16} />
                  <span>Submission window has concluded</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const Assignments = () => {
  const { courseId } = useParams();
  const effectiveCourseId = courseId || 2;
  const {
    data: assignments = [],
    isLoading,
    error,
    refetch,
    isFetching,
  } = useCourseAssignments(effectiveCourseId);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#070709]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880] mx-auto" />
          <p className="text-xs text-[#8E8E93] font-mono">Syncing course assessment nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.04]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5F5F7] flex items-center gap-2.5">
              <ClipboardList className="text-[#C5A880]" size={22} />
              <span>Assessment & Lab Workspaces</span>
            </h1>
            <p className="text-xs text-[#8E8E93] font-mono mt-1">
              {assignments.length} curriculum checkpoint{assignments.length !== 1 ? "s" : ""} registered
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl bg-[#0F0F13] border border-white/[0.04] text-[#8E8E93] hover:text-white transition-colors"
            title="Refresh Assignments"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin text-[#C5A880]" : ""} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-xs font-mono">{error?.message || "Failed to load assignments"}</p>
          </div>
        )}

        {!error && assignments.length === 0 && (
          <div className="text-center py-20 bg-[#0F0F13] border border-white/[0.04] rounded-3xl p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#14141A] border border-white/[0.04] flex items-center justify-center text-[#8E8E93]">
              <BookOpen size={28} />
            </div>
            <h3 className="text-base font-bold text-[#F5F5F7] mb-1">No Active Lab Assignments</h3>
            <p className="text-xs text-[#8E8E93] max-w-sm mx-auto leading-relaxed">
              Course instructors have not posted required code exercises or submission artifacts for this curriculum module yet.
            </p>
          </div>
        )}

        <div className="space-y-3.5">
          {assignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              courseId={courseId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Assignments;
