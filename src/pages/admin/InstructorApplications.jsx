import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Clock, FileText, Eye, Search, Filter,
  Shield, User, Mail, Phone, Globe, Linkedin, ArrowRight,
  RefreshCw, Loader2, AlertCircle, File, ChevronRight, X,
  Check, MessageSquare, AlertTriangle, Building2, CreditCard
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/adminApi";
import { canApproveInstructors } from "../../utils/permissions";
import Portal from "../../components/ui/Portal";

export default function InstructorApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter & Search
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Rejection modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Request info modal
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoRequestNotes, setInfoRequestNotes] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const hasApprovalPermission = canApproveInstructors(user);

  // ── Fetch Applications ───────────────────────────────────────────────────────
  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: currentPage,
        size: pageSize,
      };
      if (filterStatus && filterStatus !== "ALL") {
        params.status = filterStatus;
      }

      const response = await adminApi.getInstructorApplications(params);
      let applicationList = [];
      let total = 0;
      let pages = 1;

      if (response && response.data) {
        if (Array.isArray(response.data)) {
          applicationList = response.data;
          total = response.pagination?.totalApplications || applicationList.length;
          pages = response.pagination?.totalPages || 1;
        } else if (response.data.applications) {
          applicationList = response.data.applications;
          total = response.data.totalApplications || applicationList.length;
          pages = response.data.totalPages || 1;
        }
      } else if (Array.isArray(response)) {
        applicationList = response;
        total = response.length;
      }

      setApplications(applicationList);
      setTotalCount(total);
      setTotalPages(pages);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to load instructor applications";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus, currentPage]);

  // ── Action Handlers ─────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!selectedApp?.application?.applicationId && !selectedApp?.applicationId && !selectedApp?.id) {
      toast.error("Application ID is missing");
      return;
    }

    const appId = selectedApp.application?.applicationId || selectedApp.applicationId || selectedApp.id;
    setActionLoading(true);

    try {
      await adminApi.approveInstructorApplication(appId, "Approved by Administrator");
      toast.success("Application approved successfully! User is now an active Instructor.");
      setShowDetailModal(false);
      fetchApplications();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Approval failed";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("A rejection reason is strictly mandatory.");
      return;
    }

    const appId = selectedApp?.application?.applicationId || selectedApp?.applicationId || selectedApp?.id;
    setActionLoading(true);

    try {
      await adminApi.rejectInstructorApplication(appId, rejectionReason.trim());
      toast.success("Application rejected and decision feedback logged.");
      setShowRejectModal(false);
      setShowDetailModal(false);
      setRejectionReason("");
      fetchApplications();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Rejection failed";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRequestInfo = async () => {
    if (!infoRequestNotes.trim()) {
      toast.error("Please enter the specific clarification notes requested.");
      return;
    }

    const appId = selectedApp?.application?.applicationId || selectedApp?.applicationId || selectedApp?.id;
    setActionLoading(true);

    try {
      await adminApi.requestAdditionalInfo(appId, infoRequestNotes.trim());
      toast.success("Clarification request dispatched to applicant.");
      setShowInfoModal(false);
      setShowDetailModal(false);
      setInfoRequestNotes("");
      fetchApplications();
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Request failed";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Filtered List ───────────────────────────────────────────────────────────
  const filteredApplications = applications.filter((item) => {
    const app = item.application || item;
    const u = item.user || item;
    const search = searchTerm.toLowerCase();

    const nameMatch = (u.fullName || u.name || "").toLowerCase().includes(search);
    const emailMatch = (u.email || "").toLowerCase().includes(search);
    const subjectMatch = (app.subject || "").toLowerCase().includes(search);
    const specMatch = (app.specialization || "").toLowerCase().includes(search);

    return nameMatch || emailMatch || subjectMatch || specMatch;
  });

  const getStatusBadge = (status) => {
    const s = (status || "PENDING").toUpperCase();
    if (s === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
          <CheckCircle className="w-3.5 h-3.5" /> Approved
        </span>
      );
    }
    if (s === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" /> Rejected
        </span>
      );
    }
    if (s === "NEED_MORE_INFO") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
          <AlertCircle className="w-3.5 h-3.5" /> Need Info
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
        <Clock className="w-3.5 h-3.5" /> Pending Review
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D5C0D1] dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#5B3E57]/30 dark:border-[#D1A7CC]/30 text-[#5B3E57] dark:text-[#D1A7CC] text-xs font-semibold uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" /> Administrative Governance
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Instructor Applications
            </h1>
            <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">
              Review credential portfolios, verify identity proofs, and manage faculty admissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchApplications}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#15151B] border border-[#D5C0D1] dark:border-white/10 hover:border-white/20 text-xs font-medium text-[#A1A1AA] hover:text-white transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#5B3E57] dark:text-[#D1A7CC]" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#FFFEFA] dark:bg-[#1D1C1A] p-4 rounded-2xl border border-[#D5C0D1] dark:border-white/10">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {["ALL", "PENDING", "APPROVED", "REJECTED", "NEED_MORE_INFO"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setFilterStatus(st);
                  setCurrentPage(0);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterStatus === st
                    ? "bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] shadow-sm shadow-sm font-bold"
                    : "text-[#A1A1AA] hover:text-white hover:bg-white/5"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-[#756E64] dark:text-[#7A7368] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search applicant name, email, subject..."
              className="w-full bg-[#15151B] border border-[#D5C0D1] dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-[#282521] dark:text-[#EDE8E1] placeholder-[#71717A] focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC]"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D5C0D1] dark:border-white/10 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#5B3E57] dark:text-[#D1A7CC] animate-spin mb-3" />
              <p className="text-xs text-[#A1A1AA]">Retrieving applications from backend registry...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-20 text-center">
              <Shield className="w-10 h-10 text-[#756E64] dark:text-[#7A7368] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-white">No applications match criteria</h3>
              <p className="text-xs text-[#A1A1AA] mt-1">
                {searchTerm ? "Try broadening your search term." : "No applications under this category."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#D5C0D1] dark:border-white/10 bg-[#15151B]/60 text-[11px] font-semibold uppercase tracking-wider text-[#756E64] dark:text-[#7A7368]">
                    <th className="py-3.5 px-4 sm:px-6">Applicant</th>
                    <th className="py-3.5 px-4">Teaching Domain</th>
                    <th className="py-3.5 px-4">Experience</th>
                    <th className="py-3.5 px-4">Submitted At</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {filteredApplications.map((item, idx) => {
                    const app = item.application || item;
                    const u = item.user || item;
                    const appId = app.applicationId || app.id || idx;

                    return (
                      <tr key={appId} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 text-[#5B3E57] dark:text-[#D1A7CC] flex items-center justify-center font-bold text-xs">
                              {(u.fullName || u.name || u.email || "A").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">{u.fullName || u.name || "Applicant"}</p>
                              <p className="text-[11px] text-[#756E64] dark:text-[#7A7368] truncate">{u.email || "No email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-[#282521] dark:text-[#EDE8E1]">{app.subject || "Not specified"}</p>
                          <p className="text-[11px] text-[#756E64] dark:text-[#7A7368] truncate max-w-[180px]">{app.specialization || "General"}</p>
                        </td>
                        <td className="py-4 px-4 text-[#A1A1AA]">
                          {app.experience || "N/A"}
                        </td>
                        <td className="py-4 px-4 text-[#756E64] dark:text-[#7A7368] whitespace-nowrap">
                          {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "Recent"}
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedApp(item);
                              setShowDetailModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 hover:bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#5B3E57] dark:text-[#D1A7CC] hover:text-[#FFFEFA] dark:text-[#151413] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 font-semibold text-xs transition-all inline-flex items-center gap-1"
                          >
                            Review Dossier <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#D5C0D1] dark:border-white/10 text-xs text-[#756E64] dark:text-[#7A7368]">
              <span>Showing {filteredApplications.length} of {totalCount} total applications</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  className="px-3 py-1 rounded bg-[#15151B] border border-[#D5C0D1] dark:border-white/10 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="font-mono text-white">Page {currentPage + 1} of {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1 rounded bg-[#15151B] border border-[#D5C0D1] dark:border-white/10 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Comprehensive Application Detail Modal ─────────────────────────── */}
      {showDetailModal && selectedApp && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-white/15 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-left p-6 sm:p-8">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#D5C0D1] dark:border-white/10 pb-5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 text-[#5B3E57] dark:text-[#D1A7CC] flex items-center justify-center font-bold text-lg">
                    {((selectedApp.user?.fullName || selectedApp.user?.name || "A")[0]).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">
                        {selectedApp.user?.fullName || selectedApp.user?.name || "Instructor Applicant"}
                      </h2>
                      {getStatusBadge(selectedApp.application?.status)}
                    </div>
                    <p className="text-xs text-[#A1A1AA] flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#756E64] dark:text-[#7A7368]" /> {selectedApp.user?.email}</span>
                      {selectedApp.application?.phone && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#756E64] dark:text-[#7A7368]" /> {selectedApp.application.phone}</span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-1.5 rounded-lg text-[#756E64] dark:text-[#7A7368] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Dossier Information Grid */}
              <div className="space-y-6 text-xs">
                {/* 1. Academic & Professional Credentials */}
                <div className="bg-[#15151B] p-4 rounded-xl border border-[#E3DCD3] dark:border-white/5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B3E57] dark:text-[#D1A7CC]">Academic & Domain Specialization</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[#756E64] dark:text-[#7A7368] block">Teaching Domain</span>
                      <span className="text-white font-medium">{selectedApp.application?.subject || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[#756E64] dark:text-[#7A7368] block">Specialization</span>
                      <span className="text-white font-medium">{selectedApp.application?.specialization || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[#756E64] dark:text-[#7A7368] block">Industry Experience</span>
                      <span className="text-white font-medium">{selectedApp.application?.experience || "N/A"}</span>
                    </div>
                  </div>

                  {selectedApp.application?.bio && (
                    <div className="pt-2">
                      <span className="text-[#756E64] dark:text-[#7A7368] block mb-1">Professional Bio</span>
                      <p className="text-[#A1A1AA] leading-relaxed bg-[#F5F2EC] dark:bg-[#151413] p-3 rounded-lg border border-[#E3DCD3] dark:border-white/5">
                        {selectedApp.application.bio}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-1 flex-wrap">
                    {selectedApp.application?.linkedinUrl && (
                      <a href={selectedApp.application.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#5B3E57] dark:text-[#D1A7CC] hover:underline flex items-center gap-1">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
                      </a>
                    )}
                    {selectedApp.application?.websiteUrl && (
                      <a href={selectedApp.application.websiteUrl} target="_blank" rel="noreferrer" className="text-[#5B3E57] dark:text-[#D1A7CC] hover:underline flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> Portfolio Website
                      </a>
                    )}
                  </div>
                </div>

                {/* 2. Verification Documents */}
                <div className="bg-[#15151B] p-4 rounded-xl border border-[#E3DCD3] dark:border-white/5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B3E57] dark:text-[#D1A7CC]">Submitted Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {DOCUMENT_FIELDS.map((df) => {
                      const docUrls = selectedApp.application?.documentUrls || {};
                      const hasDoc = Boolean(docUrls[df.key] || selectedApp.documents?.required?.[df.key] || selectedApp.documents?.optional?.[df.key]);
                      const docUrl = docUrls[df.key];

                      return (
                        <div key={df.key} className="bg-[#F5F2EC] dark:bg-[#151413] p-2.5 rounded-lg border border-[#E3DCD3] dark:border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            {hasDoc ? (
                              <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#756E64] dark:text-[#7A7368] flex-shrink-0" />
                            )}
                            <span className="font-medium text-white truncate">{df.label}</span>
                          </div>

                          {hasDoc && docUrl && (
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 hover:bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#5B3E57] dark:text-[#D1A7CC] hover:text-[#FFFEFA] dark:text-[#151413] font-semibold text-[10px] transition-colors flex items-center gap-1 flex-shrink-0"
                            >
                              <Eye className="w-3 h-3" /> View Proof
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Decision History or Rejection Reason if applicable */}
                {selectedApp.application?.rejectionReason && (
                  <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-xl text-rose-300">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-1">Previous Rejection Reason:</p>
                    <p>{selectedApp.application.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Administrative Action Bar */}
              <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-[#D5C0D1] dark:border-white/10 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white border border-[#D5C0D1] dark:border-white/10 hover:border-white/20 transition-colors bg-[#15151B]"
                >
                  Close
                </button>

                <div className="flex items-center gap-2 flex-wrap">
                  {selectedApp.application?.status !== "APPROVED" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowInfoModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Request Info
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject with Reason
                      </button>

                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="px-6 py-2 rounded-xl text-xs font-bold bg-[#10B981] hover:bg-[#059669] text-white shadow-lg shadow-[#10B981]/20 transition-all flex items-center gap-1.5"
                      >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                        Approve Application
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Rejection Reason Modal ─────────────────────────────────────────── */}
      {showRejectModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Reject Instructor Application</h3>
              <p className="text-xs text-[#A1A1AA] mb-4">
                Please provide an official reason for rejection. This feedback is permanently stored in the audit trail and displayed to the applicant.
              </p>

              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Scanned copy of government ID is unreadable. Please submit high-resolution document."
                className="w-full bg-[#15151B] border border-[#D5C0D1] dark:border-white/10 rounded-xl p-3 text-xs text-[#282521] dark:text-[#EDE8E1] placeholder-[#71717A] focus:outline-none focus:border-rose-400 mb-4 resize-none"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-white bg-[#15151B] border border-[#D5C0D1] dark:border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!rejectionReason.trim() || actionLoading}
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Request More Info Modal ────────────────────────────────────────── */}
      {showInfoModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
              <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Request Additional Documentation</h3>
              <p className="text-xs text-[#A1A1AA] mb-4">
                Specify the additional information or documents required before approval.
              </p>

              <textarea
                rows={3}
                value={infoRequestNotes}
                onChange={(e) => setInfoRequestNotes(e.target.value)}
                placeholder="e.g. Please provide a work portfolio link or prior syllabus outline."
                className="w-full bg-[#15151B] border border-[#D5C0D1] dark:border-white/10 rounded-xl p-3 text-xs text-[#282521] dark:text-[#EDE8E1] placeholder-[#71717A] focus:outline-none focus:border-sky-400 mb-4 resize-none"
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#A1A1AA] hover:text-white bg-[#15151B] border border-[#D5C0D1] dark:border-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!infoRequestNotes.trim() || actionLoading}
                  onClick={handleConfirmRequestInfo}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Send Request"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
