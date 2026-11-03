import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Upload, X, CheckCircle, FileText, User, BookOpen,
  Camera, CreditCard, Briefcase, Award, Shield, ArrowRight,
  ArrowLeft, Loader2, AlertCircle, Check, Eye, File,
  GraduationCap, Building2, Phone, Globe, Linkedin, Sparkles,
  Save, RefreshCw, ChevronDown, CheckSquare, Square, Search,
  ExternalLink, HelpCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";
import toast from "react-hot-toast";
import Portal from "../../components/ui/Portal";

// ─── Document field specifications ───────────────────────────────────────────
const DOCUMENT_FIELDS = [
  {
    key: "resume",
    label: "Resume / CV",
    description: "Detailed curriculum vitae showing education and teaching background",
    icon: FileText,
    accept: ".pdf,.doc,.docx",
    acceptLabel: "PDF, DOC, DOCX",
    required: true,
  },
  {
    key: "educationalCertificates",
    label: "Educational Certificates",
    description: "Degree, diploma, or highest qualification transcript",
    icon: GraduationCap,
    accept: ".pdf,.jpg,.jpeg,.png",
    acceptLabel: "PDF, JPG, PNG",
    required: true,
  },
  {
    key: "governmentIdProof",
    label: "Government Identity Proof",
    description: "Passport, Aadhaar Card, National ID, or Driver's License",
    icon: Shield,
    accept: ".pdf,.jpg,.jpeg,.png",
    acceptLabel: "PDF, JPG, PNG",
    required: true,
  },
  {
    key: "passportPhoto",
    label: "Passport Photograph",
    description: "Recent formal photograph with clear neutral background",
    icon: Camera,
    accept: ".jpg,.jpeg,.png",
    acceptLabel: "JPG, PNG",
    required: true,
  },
  {
    key: "bankDetails",
    label: "Bank Account Proof / Cheque",
    description: "Cancelled cheque or statement header for instructor honorarium payouts",
    icon: Building2,
    accept: ".pdf,.jpg,.jpeg,.png",
    acceptLabel: "PDF, JPG, PNG",
    required: true,
  },
  {
    key: "panDocument",
    label: "PAN Card / Tax Document",
    description: "Permanent Account Number or regional tax registration document",
    icon: CreditCard,
    accept: ".pdf,.jpg,.jpeg,.png",
    acceptLabel: "PDF, JPG, PNG",
    required: true,
  },
  {
    key: "portfolio",
    label: "Portfolio / Course Outlines",
    description: "Sample syllabus, published articles, code repositories, or lecture slides",
    icon: Briefcase,
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    acceptLabel: "PDF, DOC, JPG, PNG",
    required: false,
  },
  {
    key: "experienceLetter",
    label: "Experience Proof / Recommendation",
    description: "Prior teaching experience letter, employment proof, or references",
    icon: Award,
    accept: ".pdf,.jpg,.jpeg,.png",
    acceptLabel: "PDF, JPG, PNG",
    required: false,
  },
];

const EXPERIENCE_OPTIONS = [
  { value: "0-1 year", label: "0-1 year (Entry / Fresher)" },
  { value: "1-3 years", label: "1-3 years (Junior Instructor)" },
  { value: "3-5 years", label: "3-5 years (Mid-Level Practitioner)" },
  { value: "5-7 years", label: "5-7 years (Senior Specialist)" },
  { value: "7-10 years", label: "7-10 years (Lead Educator)" },
  { value: "10+ years", label: "10+ years (Principal / Veteran Architect)" },
];

export default function InstructorApplication() {
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();

  // ── States ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Existing backend application (if user has already submitted or has draft)
  const [existingApp, setExistingApp] = useState(null);

  // Taxonomy options from backend
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState(false);

  // Form info
  const [info, setInfo] = useState({
    subject: "",
    specialization: "",
    experience: "",
    bio: "",
    phone: "",
    linkedinUrl: "",
    websiteUrl: "",
    bankAccountNumber: "",
    bankIfsc: "",
    bankName: "",
    panNumber: "",
  });

  // Files state (holds File objects or string URLs from draft)
  const [files, setFiles] = useState({
    resume: null,
    educationalCertificates: null,
    governmentIdProof: null,
    passportPhoto: null,
    bankDetails: null,
    panDocument: null,
    portfolio: null,
    experienceLetter: null,
  });

  const STEPS = ["Personal Profile", "Verification Documents", "Review & Submit"];

  // ── Load taxonomy and existing application on mount ─────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoadingInitial(true);
      try {
        // 1. Fetch taxonomy subjects
        const subjects = await instructorApi.getTeachingSubjects();
        if (isMounted && Array.isArray(subjects) && subjects.length > 0) {
          setSubjectOptions(subjects);
          setSubjectError(false);
        }
      } catch (err) {
        console.warn("Failed to load subjects:", err);
        if (isMounted) setSubjectError(true);
      } finally {
        if (isMounted) setLoadingSubjects(false);
      }

      try {
        // 2. Fetch existing application status / draft
        const appRes = await instructorApi.getMyApplication();
        const appData = appRes?.data || appRes;
        if (isMounted && appData && appData.application) {
          const app = appData.application;
          setExistingApp(appData);

          // Populate form if status is DRAFT or NEED_MORE_INFO
          if (app.status === "DRAFT" || app.status === "NEED_MORE_INFO") {
            setInfo((prev) => ({
              ...prev,
              subject: app.subject || prev.subject,
              specialization: app.specialization || prev.specialization,
              experience: app.experience || prev.experience,
              bio: app.bio || prev.bio,
              phone: app.phone || prev.phone,
              linkedinUrl: app.linkedinUrl || prev.linkedinUrl,
              websiteUrl: app.websiteUrl || prev.websiteUrl,
              bankAccountNumber: app.bankAccountNumber || prev.bankAccountNumber,
              bankIfsc: app.bankIfsc || prev.bankIfsc,
              bankName: app.bankName || prev.bankName,
              panNumber: app.panNumber || prev.panNumber,
            }));

            // Mark existing uploaded documents from backend
            if (app.documentUrls) {
              setFiles((prev) => {
                const nextFiles = { ...prev };
                Object.keys(app.documentUrls).forEach((key) => {
                  if (app.documentUrls[key]) {
                    nextFiles[key] = {
                      name: `${key} (Uploaded on server)`,
                      isServerFile: true,
                      url: app.documentUrls[key],
                    };
                  }
                });
                return nextFiles;
              });
            }
          }
        }
      } catch (err) {
        // 404 or no existing application is expected for first-time applicants
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, []);

  // ── Validation Computed Values ──────────────────────────────────────────────
  const requiredDocFields = DOCUMENT_FIELDS.filter((f) => f.required);
  const uploadedRequiredCount = requiredDocFields.filter((f) => files[f.key]).length;

  // Validation rules
  const isUrlValid = (url) => {
    if (!url || !url.trim()) return true;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isPhoneValid = (phone) => {
    if (!phone || !phone.trim()) return true;
    // Basic international / Indian phone format check (digits, optional +, space, dash, 8-16 chars)
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/.test(phone.trim());
  };

  const isPanValid = (pan) => {
    if (!pan || !pan.trim()) return true;
    // Standard Indian PAN format: 5 letters, 4 numbers, 1 letter
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(pan.trim());
  };

  const isStep1Valid =
    Boolean(info.subject && info.subject.trim()) &&
    Boolean(info.specialization && info.specialization.trim()) &&
    Boolean(info.experience && info.experience.trim()) &&
    Boolean(info.bio && info.bio.trim().length >= 30) &&
    isUrlValid(info.linkedinUrl) &&
    isUrlValid(info.websiteUrl) &&
    isPhoneValid(info.phone) &&
    isPanValid(info.panNumber);

  const isStep2Valid = requiredDocFields.every((f) => files[f.key]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleInputChange = (field, val) => {
    setInfo((prev) => ({ ...prev, [field]: val }));
  };

  const handleFileChange = (key, file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size exceeds maximum permitted 25MB.");
      return;
    }
    setFiles((prev) => ({ ...prev, [key]: file }));
    toast.success(`${file.name} selected.`);
  };

  const handleFileRemove = async (key) => {
    setFiles((prev) => ({ ...prev, [key]: null }));
    if (existingApp?.application?.status === "DRAFT") {
      try {
        await instructorApi.removeDocument(key);
      } catch (e) {
        // Non-blocking
      }
    }
    toast.success("Document removed.");
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      const res = await instructorApi.saveDraft(info);
      setExistingApp(res?.data || res);
      toast.success("Application draft saved successfully. You can return anytime.");
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to save draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!termsAccepted) {
      toast.error("Please accept the accuracy declaration before submitting.");
      return;
    }
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const formData = new FormData();

      // Append text fields
      formData.append("subject", info.subject);
      formData.append("specialization", info.specialization);
      formData.append("experience", info.experience);
      formData.append("bio", info.bio);
      if (info.phone) formData.append("phone", info.phone);
      if (info.linkedinUrl) formData.append("linkedinUrl", info.linkedinUrl);
      if (info.websiteUrl) formData.append("websiteUrl", info.websiteUrl);
      if (info.bankAccountNumber) formData.append("bankAccountNumber", info.bankAccountNumber);
      if (info.bankIfsc) formData.append("bankIfsc", info.bankIfsc);
      if (info.bankName) formData.append("bankName", info.bankName);
      if (info.panNumber) formData.append("panNumber", info.panNumber.toUpperCase());

      // Append files (only actual File objects)
      Object.keys(files).forEach((key) => {
        if (files[key] && files[key] instanceof File) {
          formData.append(key, files[key]);
        }
      });

      const response = await instructorApi.applyForInstructor(formData);
      const appData = response?.data || response;
      setExistingApp(appData);
      toast.success("Application submitted successfully for administrative review!");
      setStep(3); // Advance to confirmation view
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Submission failed. Please check required fields.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render Loading Screen ───────────────────────────────────────────────────
  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#070709] flex flex-col items-center justify-center text-white px-4">
        <Loader2 className="w-10 h-10 text-[#C5A880] animate-spin mb-4" />
        <p className="text-sm font-medium text-[#A1A1AA]">Loading your instructor application workspace...</p>
      </div>
    );
  }

  // ── Render Completed / Submitted / Review Screen if exists ──────────────────
  const appStatus = existingApp?.application?.status;
  const isAlreadySubmitted = appStatus === "PENDING" || appStatus === "UNDER_REVIEW" || appStatus === "APPROVED" || appStatus === "REJECTED";

  if (isAlreadySubmitted && step !== 0 && step !== 1 && step !== 2) {
    return (
      <div className="min-h-screen bg-[#070709] text-[#F5F5F7] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-[#0F0F13] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
            <Link to="/" className="flex items-center gap-3 group" title="Asivo Home">
              <div className="w-10 h-10 rounded-xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 overflow-hidden shrink-0">
                <img
                  src="/assets/asivo-symbol-128.png"
                  alt="Asivo emblem"
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/assets/asivo-symbol.png";
                  }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-white group-hover:text-[#C5A880] transition-colors leading-none">
                  Asivo
                </span>
                <span className="text-[9px] font-bold tracking-[0.2em] text-[#C5A880] uppercase mt-1">
                  FACULTY GOVERNANCE
                </span>
              </div>
            </Link>

            <button
              onClick={() => navigate("/student/dashboard")}
              className="text-xs text-[#A1A1AA] hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-[#15151B]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </button>
          </div>

          {/* Status Banner */}
          <div className={`p-6 rounded-xl border mb-8 ${
            appStatus === "APPROVED"
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
              : appStatus === "REJECTED"
              ? "bg-rose-950/20 border-rose-500/30 text-rose-200"
              : "bg-amber-950/20 border-amber-500/30 text-amber-200"
          }`}>
            <div className="flex items-start gap-4">
              {appStatus === "APPROVED" ? (
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : appStatus === "REJECTED" ? (
                <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-6 h-6 text-amber-400 animate-spin flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <h2 className="text-base font-semibold">
                    {appStatus === "APPROVED"
                      ? "Congratulations! Your Instructor Application is Approved"
                      : appStatus === "REJECTED"
                      ? "Application Requires Revision"
                      : "Application Pending Administrative Review"}
                  </h2>
                  <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                    appStatus === "APPROVED"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : appStatus === "REJECTED"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {appStatus}
                  </span>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">
                  {existingApp?.application?.reviewMessage || "Your submission has been cataloged for administrative verification."}
                </p>
                {existingApp?.application?.rejectionReason && (
                  <div className="mt-4 p-3.5 bg-black/40 border border-rose-500/30 rounded-lg text-sm text-rose-300">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-rose-400">Official Decision Reason:</p>
                    {existingApp.application.rejectionReason}
                  </div>
                )}
                {existingApp?.application?.requestedInfo && (
                  <div className="mt-4 p-3.5 bg-black/40 border border-amber-500/30 rounded-lg text-sm text-amber-300">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-amber-400">Reviewer Requested Information:</p>
                    {existingApp.application.requestedInfo}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Application Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-sm">
            <div className="bg-[#15151B] p-4 rounded-xl border border-white/5">
              <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">Application Reference</span>
              <p className="font-mono text-xs text-[#C5A880] break-all">{existingApp?.application?.applicationId || "N/A"}</p>
            </div>
            <div className="bg-[#15151B] p-4 rounded-xl border border-white/5">
              <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">Submission Timestamp</span>
              <p className="text-sm text-[#F5F5F7]">
                {existingApp?.application?.submittedAt
                  ? new Date(existingApp.application.submittedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="bg-[#15151B] p-4 rounded-xl border border-white/5">
              <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">Applicant Name</span>
              <p className="text-sm text-[#F5F5F7]">{existingApp?.user?.fullName || user?.name || "Applicant"}</p>
            </div>
            <div className="bg-[#15151B] p-4 rounded-xl border border-white/5">
              <span className="text-xs text-[#71717A] uppercase tracking-wider block mb-1">Teaching Domain</span>
              <p className="text-sm text-[#F5F5F7]">{existingApp?.application?.subject || "N/A"}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-sm font-medium text-[#A1A1AA] hover:text-white transition-all bg-[#15151B]"
            >
              Return to Student Dashboard
            </button>
            {appStatus === "APPROVED" && (
              <button
                onClick={async () => {
                  try {
                    await switchRole("INSTRUCTOR");
                    navigate("/instructor/dashboard");
                  } catch (e) {
                    navigate("/instructor/dashboard");
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4BC9A] text-[#070709] font-bold text-sm transition-all shadow-lg shadow-[#C5A880]/20 flex items-center gap-2"
              >
                Launch Instructor Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {(appStatus === "REJECTED" || appStatus === "NEED_MORE_INFO") && (
              <button
                onClick={() => {
                  setStep(0); // Permit editing and re-applying
                }}
                className="px-6 py-2.5 rounded-xl bg-[#C5A880] hover:bg-[#D4BC9A] text-[#070709] font-bold text-sm transition-all flex items-center gap-2"
              >
                Update & Re-apply <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Multi-step Form Workspace ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Top Header with Asivo Brand & Back Navigation */}
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group" title="Asivo Home">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#14141A] border border-[#C5A880]/30 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 overflow-hidden shrink-0">
              <img
                src="/assets/asivo-symbol-128.png"
                alt="Asivo emblem"
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/assets/asivo-symbol.png";
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-[#C5A880] transition-colors leading-none">
                Asivo
              </span>
              <span className="text-[9px] font-bold tracking-[0.22em] text-[#C5A880] uppercase mt-1">
                LEARNING PLATFORM
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {existingApp?.application?.status && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#15151B] border border-white/10 text-[#C5A880]">
                Status: {existingApp.application.status}
              </span>
            )}
            <button
              onClick={() => navigate("/student/dashboard")}
              className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA] hover:text-[#C5A880] transition-colors py-2 px-3.5 rounded-xl bg-[#0F0F13] border border-white/10 hover:border-[#C5A880]/30"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </button>
          </div>
        </header>

        {/* Application Hero */}
        <section className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] text-xs font-semibold uppercase tracking-wider mb-3">
            <GraduationCap className="w-4 h-4 text-[#C5A880]" />
            <span>Faculty Application Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Become an Instructor
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-xl mx-auto leading-relaxed">
            Share your expertise with learners and become part of the Asivo teaching community.
          </p>
        </section>

        {/* Existing Requested Info Alert if in NEED_MORE_INFO state */}
        {existingApp?.application?.status === "NEED_MORE_INFO" && (
          <div className="mb-8 p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 text-amber-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-300 mb-1">Administrative Clarification Requested</p>
              <p className="opacity-90">{existingApp.application.requestedInfo || "Please review and update your credentials."}</p>
            </div>
          </div>
        )}

        {/* Ink & Onyx Progress Stepper */}
        <nav aria-label="Application Progress" className="mb-10">
          <div className="flex items-center justify-center max-w-xl mx-auto">
            {STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (i < step || (i === 1 && isStep1Valid) || (i === 2 && isStep1Valid && isStep2Valid)) {
                        setStep(i);
                      }
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      i < step
                        ? "bg-[#10B981] text-[#070709] shadow-md shadow-[#10B981]/20 ring-2 ring-[#10B981]/40"
                        : i === step
                        ? "bg-[#C5A880] text-[#070709] ring-4 ring-[#C5A880]/25 scale-110 shadow-lg shadow-[#C5A880]/30 font-extrabold"
                        : "bg-[#15151B] text-[#71717A] border border-white/10"
                    }`}
                  >
                    {i < step ? <Check className="w-5 h-5 stroke-[2.5]" /> : i + 1}
                  </button>
                  <span
                    className={`text-xs mt-2 font-medium transition-colors text-center ${
                      i === step
                        ? "text-[#C5A880] font-bold"
                        : i < step
                        ? "text-[#10B981]"
                        : "text-[#71717A]"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-[2px] flex-1 mx-2 sm:mx-4 mb-6 rounded transition-colors duration-300 ${
                      i < step ? "bg-[#10B981]" : "bg-white/10"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>

        {/* Main Form Surface */}
        <div className="bg-[#0F0F13] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm relative">

          {/* ──────────────────────────────────────────────────────────────────
              STEP 1: PERSONAL & PROFESSIONAL PROFILE
          ────────────────────────────────────────────────────────────────── */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C5A880]" /> Personal & Professional Information
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Specify your teaching subjects, specialization focus, experience level, and professional background.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Teaching Subject / Content Type */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                    Teaching Subject / Content Type <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={info.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className="w-full bg-[#15151B] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select your primary teaching subject...</option>
                      {subjectOptions.map((subj) => (
                        <option key={subj.id || subj.name} value={subj.name} className="bg-[#15151B] text-white">
                          {subj.name} ({subj.category || "Standard Domain"})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#71717A] absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-1.5">
                    {loadingSubjects
                      ? "Fetching authoritative backend taxonomy..."
                      : subjectError
                      ? "Error loading subjects. Please check connection."
                      : "Authoritative course domain managed by the Asivo curriculum registry."}
                  </p>
                </div>

                {/* Specialization */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                    Specialization <span className="text-[#EF4444]">*</span>
                  </label>
                  <input
                    type="text"
                    value={info.specialization}
                    onChange={(e) => handleInputChange("specialization", e.target.value)}
                    placeholder="e.g. Cloud Security Architecture & DevSecOps"
                    className="w-full bg-[#15151B] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                  />
                  <p className="text-[11px] text-[#71717A] mt-1.5">Your specific engineering focus or technical niche.</p>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                    Years of Experience <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={info.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      className="w-full bg-[#15151B] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#F5F5F7] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] appearance-none cursor-pointer"
                    >
                      <option value="" disabled>Select your total industry/teaching experience...</option>
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#15151B] text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#71717A] absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-1.5">Total years active in professional practice or education.</p>
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                    Contact Phone Number <span className="text-[#71717A] lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={info.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="1234567890"
                      className="w-full bg-[#15151B] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-1.5">
                    {info.phone && !isPhoneValid(info.phone) ? (
                      <span className="text-rose-400">Invalid phone format. Use standard 10-digit or international format.</span>
                    ) : (
                      "Supports standard Indian (+91) or international format."
                    )}
                  </p>
                </div>

                {/* LinkedIn Profile URL (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                    LinkedIn Profile <span className="text-[#71717A] lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <Linkedin className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                    <input
                      type="url"
                      value={info.linkedinUrl}
                      onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-[#15151B] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-1.5">
                    {info.linkedinUrl && !isUrlValid(info.linkedinUrl) ? (
                      <span className="text-rose-400">Must be a valid web URL starting with https://</span>
                    ) : (
                      "Valid public LinkedIn address for verification."
                    )}
                  </p>
                </div>

                {/* Website / Portfolio URL (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                    Portfolio / Website URL <span className="text-[#71717A] lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-[#71717A] absolute left-3.5 top-3.5" />
                    <input
                      type="url"
                      value={info.websiteUrl}
                      onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                      placeholder="https://yourportfolio.dev"
                      className="w-full bg-[#15151B] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                    />
                  </div>
                  <p className="text-[11px] text-[#71717A] mt-1.5">
                    {info.websiteUrl && !isUrlValid(info.websiteUrl) ? (
                      <span className="text-rose-400">Must be a valid URL starting with https://</span>
                    ) : (
                      "Personal website, blog, or GitHub profile."
                    )}
                  </p>
                </div>
              </div>

              {/* Professional Bio with Live Character Counter */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-[#F5F5F7] uppercase tracking-wider">
                    Professional Bio <span className="text-[#EF4444]">*</span>
                  </label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      info.bio.trim().length >= 30
                        ? "text-[#10B981]"
                        : "text-[#F59E0B]"
                    }`}
                  >
                    {info.bio.trim().length} / 500 characters (min 30)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={info.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Introduce your engineering background, teaching philosophy, and notable achievements in at least 30 characters..."
                  className="w-full bg-[#15151B] border border-white/10 rounded-xl p-4 text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] resize-none"
                />
                {info.bio.trim().length > 0 && info.bio.trim().length < 30 && (
                  <p className="text-xs text-[#F59E0B] mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Bio must be at least 30 characters ({30 - info.bio.trim().length} more needed).
                  </p>
                )}
              </div>

              {/* Banking Coordinates & Tax Section */}
              <div className="pt-4 border-t border-white/10">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C5A880]" /> Financial & Tax Information
                  </h3>
                  <p className="text-xs text-[#71717A] mt-0.5">Required for instructor honorarium payouts and tax reporting.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={info.bankAccountNumber}
                      onChange={(e) => handleInputChange("bankAccountNumber", e.target.value)}
                      placeholder="e.g. 123456789012"
                      className="w-full bg-[#15151B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={info.bankName}
                      onChange={(e) => handleInputChange("bankName", e.target.value)}
                      placeholder="e.g. HDFC Bank / Chase"
                      className="w-full bg-[#15151B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                      Bank IFSC / Routing Code
                    </label>
                    <input
                      type="text"
                      value={info.bankIfsc}
                      onChange={(e) => handleInputChange("bankIfsc", e.target.value)}
                      placeholder="e.g. HDFC0001234"
                      className="w-full bg-[#15151B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5F7] mb-2 uppercase tracking-wider">
                      PAN / Tax Identifier Number
                    </label>
                    <input
                      type="text"
                      value={info.panNumber}
                      onChange={(e) => handleInputChange("panNumber", e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      className="w-full bg-[#15151B] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F5F5F7] placeholder-[#71717A] uppercase focus:outline-none focus:border-[#C5A880]"
                    />
                    {info.panNumber && !isPanValid(info.panNumber) && (
                      <p className="text-[11px] text-amber-400 mt-1">Standard PAN format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons for Step 1 */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={savingDraft}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-medium text-[#A1A1AA] hover:text-white transition-all bg-[#15151B] flex items-center gap-2"
                >
                  {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Draft
                </button>

                <button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => setStep(1)}
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    isStep1Valid
                      ? "bg-[#C5A880] hover:bg-[#D4BC9A] text-[#070709] shadow-lg shadow-[#C5A880]/20"
                      : "bg-[#15151B] text-[#71717A] border border-white/5 cursor-not-allowed opacity-60"
                  }`}
                >
                  Next: Document Verification <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              STEP 2: DOCUMENT UPLOAD WORKSPACE
          ────────────────────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4 mb-6 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#C5A880]" /> Verification Documents
                  </h2>
                  <p className="text-xs text-[#A1A1AA] mt-1">
                    Upload official credentials and identity proofs. All files are encrypted, private, and verified on upload.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-[#C5A880] font-bold">
                    {uploadedRequiredCount} of {requiredDocFields.length} Required Uploaded
                  </span>
                  <div className="w-36 h-1.5 bg-[#15151B] rounded-full mt-1.5 overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-[#10B981] transition-all duration-300"
                      style={{ width: `${Math.round((uploadedRequiredCount / requiredDocFields.length) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOCUMENT_FIELDS.map((field) => {
                  const Icon = field.icon;
                  const currentFile = files[field.key];
                  const isUploaded = Boolean(currentFile);

                  return (
                    <div
                      key={field.key}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        isUploaded
                          ? "bg-[#15151B] border-[#10B981]/40 shadow-sm shadow-[#10B981]/5"
                          : "bg-[#15151B]/60 border-white/10 hover:border-[#C5A880]/30"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isUploaded ? "bg-[#10B981]/20 text-[#10B981]" : "bg-white/5 text-[#A1A1AA]"
                          }`}
                        >
                          {isUploaded ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">{field.label}</span>
                            {field.required ? (
                              <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-medium">
                                Required
                              </span>
                            ) : (
                              <span className="text-[10px] bg-white/5 text-[#71717A] px-1.5 py-0.2 rounded font-medium">
                                Optional
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#71717A] line-clamp-1 mt-0.5">{field.description}</p>
                        </div>
                      </div>

                      {/* File Card or Drop Zone */}
                      {isUploaded ? (
                        <div className="bg-[#070709] rounded-lg p-2.5 border border-white/10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <File className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                            <span className="text-xs text-white truncate font-medium">
                              {currentFile.name}
                            </span>
                            {currentFile.size && (
                              <span className="text-[10px] text-[#71717A] flex-shrink-0">
                                ({(currentFile.size / (1024 * 1024)).toFixed(2)} MB)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (currentFile instanceof File) {
                                  const url = URL.createObjectURL(currentFile);
                                  setPreviewDoc({ url, name: currentFile.name, type: currentFile.type });
                                } else if (currentFile.url) {
                                  window.open(currentFile.url, "_blank");
                                }
                              }}
                              title="Preview Document"
                              className="p-1 rounded hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <label className="p-1 rounded hover:bg-white/10 text-[#A1A1AA] hover:text-[#C5A880] transition-colors cursor-pointer" title="Replace File">
                              <RefreshCw className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                accept={field.accept}
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleFileChange(field.key, e.target.files[0]);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => handleFileRemove(field.key)}
                              title="Remove File"
                              className="p-1 rounded hover:bg-rose-500/20 text-[#A1A1AA] hover:text-rose-400 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files?.[0]) handleFileChange(field.key, e.dataTransfer.files[0]);
                          }}
                          className="border border-dashed border-white/15 rounded-lg p-3 text-center cursor-pointer hover:border-[#C5A880]/50 hover:bg-[#070709]/40 transition-all flex flex-col items-center justify-center block"
                        >
                          <Upload className="w-4 h-4 text-[#71717A] mb-1" />
                          <p className="text-xs text-[#A1A1AA]">
                            Drop file here or <span className="text-[#C5A880] font-semibold">browse</span>
                          </p>
                          <p className="text-[10px] text-[#71717A] mt-0.5">{field.acceptLabel} • Max 25MB</p>
                          <input
                            type="file"
                            accept={field.accept}
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleFileChange(field.key, e.target.files[0]);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Row for Step 2 */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-medium text-[#A1A1AA] hover:text-white transition-all bg-[#15151B] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Previous: Profile
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-medium text-[#A1A1AA] hover:text-white transition-all bg-[#15151B] flex items-center gap-2"
                  >
                    {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Draft
                  </button>

                  <button
                    type="button"
                    disabled={!isStep2Valid}
                    onClick={() => setStep(2)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      isStep2Valid
                        ? "bg-[#C5A880] hover:bg-[#D4BC9A] text-[#070709] shadow-lg shadow-[#C5A880]/20"
                        : "bg-[#15151B] text-[#71717A] border border-white/5 cursor-not-allowed opacity-60"
                    }`}
                  >
                    Next: Review & Submit <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              STEP 3: REVIEW & SUBMIT
          ────────────────────────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4 mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-[#C5A880]" /> Final Application Review
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-1">
                  Inspect your submitted details before administrative dispatch. You may jump back to edit any section.
                </p>
              </div>

              {/* Card 1: Professional Information Overview */}
              <div className="bg-[#15151B] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C5A880]" /> Personal & Professional Credentials
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs text-[#C5A880] hover:underline font-semibold"
                  >
                    Edit Section
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#71717A] block mb-1">Teaching Domain</span>
                    <span className="text-[#F5F5F7] font-medium">{info.subject || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block mb-1">Specialization</span>
                    <span className="text-[#F5F5F7] font-medium">{info.specialization || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block mb-1">Years of Experience</span>
                    <span className="text-[#F5F5F7] font-medium">{info.experience || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block mb-1">Phone Number</span>
                    <span className="text-[#F5F5F7] font-medium">{info.phone || "None provided"}</span>
                  </div>
                  {info.linkedinUrl && (
                    <div className="sm:col-span-2">
                      <span className="text-[#71717A] block mb-1">LinkedIn Profile</span>
                      <a href={info.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#C5A880] hover:underline break-all">
                        {info.linkedinUrl}
                      </a>
                    </div>
                  )}
                  {info.websiteUrl && (
                    <div className="sm:col-span-2">
                      <span className="text-[#71717A] block mb-1">Portfolio URL</span>
                      <a href={info.websiteUrl} target="_blank" rel="noreferrer" className="text-[#C5A880] hover:underline break-all">
                        {info.websiteUrl}
                      </a>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <span className="text-[#71717A] block mb-1">Professional Bio</span>
                    <p className="text-[#A1A1AA] leading-relaxed bg-[#070709] p-3 rounded-lg border border-white/5">
                      {info.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Financial Coordinates */}
              <div className="bg-[#15151B] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#C5A880]" /> Financial Coordinates & Tax Identification
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-xs text-[#C5A880] hover:underline font-semibold"
                  >
                    Edit Financials
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#71717A] block mb-1">Bank Account Number</span>
                    <span className="text-[#F5F5F7] font-medium font-mono">
                      {info.bankAccountNumber ? `••••••••${info.bankAccountNumber.slice(-4)}` : "None provided"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block mb-1">Bank Name</span>
                    <span className="text-[#F5F5F7] font-medium">{info.bankName || "None provided"}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block mb-1">IFSC / Routing Code</span>
                    <span className="text-[#F5F5F7] font-medium font-mono">{info.bankIfsc || "None provided"}</span>
                  </div>
                  <div>
                    <span className="text-[#71717A] block mb-1">PAN / Tax ID</span>
                    <span className="text-[#F5F5F7] font-medium font-mono uppercase">{info.panNumber || "None provided"}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Document Verification Checklist */}
              <div className="bg-[#15151B] border border-white/10 rounded-xl p-5">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#C5A880]" /> Uploaded Verification Documents
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#C5A880] hover:underline font-semibold"
                  >
                    Edit Documents
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOCUMENT_FIELDS.map((df) => {
                    const f = files[df.key];
                    if (!f && !df.required) return null;
                    return (
                      <div key={df.key} className="bg-[#070709] p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {f ? (
                            <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-white font-medium truncate">{df.label}</p>
                            <p className="text-[10px] text-[#71717A] truncate">
                              {f ? f.name : "Missing required document"}
                            </p>
                          </div>
                        </div>
                        {f && (
                          <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded font-mono">
                            ATTACHED
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Declaration Checkbox */}
              <div className="bg-[#15151B]/60 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className="mt-0.5 text-[#C5A880] flex-shrink-0 focus:outline-none"
                >
                  {termsAccepted ? (
                    <CheckSquare className="w-5 h-5 fill-[#C5A880] text-[#070709]" />
                  ) : (
                    <Square className="w-5 h-5 text-[#71717A]" />
                  )}
                </button>
                <label
                  onClick={() => setTermsAccepted(!termsAccepted)}
                  className="text-xs text-[#A1A1AA] cursor-pointer leading-relaxed select-none"
                >
                  I certify that all submitted information, educational credentials, and identification proofs are authentic, genuine, and compliant with Asivo LMS Educator Integrity Standards. I understand that fraudulent submissions will result in immediate termination and reporting.
                </label>
              </div>

              {/* Action Row for Step 3 */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-medium text-[#A1A1AA] hover:text-white transition-all bg-[#15151B] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Documents
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-medium text-[#A1A1AA] hover:text-white transition-all bg-[#15151B] flex items-center gap-2"
                  >
                    {savingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Save Draft
                  </button>

                  <button
                    type="button"
                    disabled={!termsAccepted || submitting}
                    onClick={() => setShowConfirmModal(true)}
                    className={`px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                      termsAccepted && !submitting
                        ? "bg-[#C5A880] hover:bg-[#D4BC9A] text-[#070709] shadow-xl shadow-[#C5A880]/30"
                        : "bg-[#15151B] text-[#71717A] border border-white/5 cursor-not-allowed opacity-50"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        Submit Final Application <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Submission Confirmation Dialog ──────────────────────────────────── */}
      {showConfirmModal && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0F0F13] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
              <div className="w-12 h-12 rounded-xl bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#C5A880] flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Confirm Application Submission</h3>
              <p className="text-sm text-[#A1A1AA] leading-relaxed mb-6">
                Are you ready to submit your instructor application for official administrative review?
                Once submitted, your portfolio will be locked while under review.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white border border-white/10 hover:border-white/20 transition-colors bg-[#15151B]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C5A880] hover:bg-[#D4BC9A] text-[#070709] transition-all shadow-md shadow-[#C5A880]/20 flex items-center gap-1.5"
                >
                  Yes, Submit Application
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Document Preview Modal ───────────────────────────────────────────── */}
      {previewDoc && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-[#0F0F13] border border-white/15 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-left">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#C5A880]" />
                  <span className="text-sm font-bold text-white truncate max-w-md">{previewDoc.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-auto flex items-center justify-center bg-[#070709] rounded-xl p-4 border border-white/5">
                {previewDoc.type?.startsWith("image/") ? (
                  <img src={previewDoc.url} alt={previewDoc.name} className="max-h-[50vh] max-w-full object-contain rounded-lg" />
                ) : (
                  <div className="py-8 text-center space-y-4">
                    <FileText className="w-16 h-16 text-[#C5A880] mx-auto opacity-70" />
                    <p className="text-sm text-[#A1A1AA]">PDF / Document preview is ready</p>
                    <a
                      href={previewDoc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C5A880] text-[#070709] font-bold text-xs"
                    >
                      Open Document in New Tab <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A1A1AA] hover:text-white border border-white/10 hover:border-white/20 transition-colors bg-[#15151B]"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
