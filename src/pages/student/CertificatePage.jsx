import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  User,
  BookOpen,
  ArrowLeft,
  QrCode,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { courseApi } from "../../api/courseApi";
import { useAuth } from "../../context/AuthContext";

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(null);

  const fetchCertificate = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await courseApi.getCertificate(courseId);
      if (data?.data) {
        setCertificate(data.data);
      }
    } catch (err) {
      console.error("[CertificatePage] Failed to load certificate", err);
      setError(err.response?.data?.message || "Failed to load certificate");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);

  const handleDownload = async () => {
    try {
      const data = await courseApi.downloadCertificate(certificate.id);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificate.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Certificate downloaded!");
    } catch (err) {
      toast.error("Failed to download certificate");
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const data = await courseApi.verifyCertificate(certificate.certificateNumber);
      setVerified(data?.data?.valid ? true : false);
      toast.success(verified ? "Certificate verified!" : "Certificate verification failed");
    } catch (err) {
      setVerified(false);
      toast.error("Certificate verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      toast.success("Certificate URL copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4 max-w-md p-8">
          <AlertCircle className="text-amber-500 w-16 h-16 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Certificate Not Available</h2>
          <p className="text-slate-500">
            {error || "Complete the course to earn your certificate."}
          </p>
          <button
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="px-6 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(`/student/courses/${courseId}`)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition mb-4"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Course</span>
          </button>

          <h1 className="text-3xl font-black text-slate-900 mb-2">Your Certificate</h1>
          <p className="text-slate-500">
            Congratulations on completing the course!
          </p>
        </motion.div>

        {/* Certificate Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
        >
          {/* Certificate Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Award size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-black mb-1">Certificate of Completion</h2>
            <p className="text-indigo-100">This certifies that</p>
          </div>

          {/* Certificate Body */}
          <div className="p-8 text-center">
            <h1 className="text-4xl font-black text-slate-900 mb-2">
              {user?.firstName || user?.name || "Student"} {user?.lastName || ""}
            </h1>
            <p className="text-slate-500 mb-8">has successfully completed</p>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 mb-8 border border-orange-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {certificate.courseName || certificate.courseTitle || "Course"}
              </h3>
              <p className="text-slate-600">{certificate.courseDescription || ""}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="flex items-center justify-center gap-2 text-slate-600 mb-1">
                  <Calendar size={16} />
                  <span className="text-xs font-medium">Date</span>
                </div>
                <p className="font-bold text-slate-900">
                  {new Date(certificate.issuedDate || certificate.completionDate).toLocaleDateString()}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="flex items-center justify-center gap-2 text-slate-600 mb-1">
                  <BookOpen size={16} />
                  <span className="text-xs font-medium">Score</span>
                </div>
                <p className="font-bold text-slate-900">
                  {certificate.score || certificate.percentage || "100"}%
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="flex items-center justify-center gap-2 text-slate-600 mb-1">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-medium">Certificate ID</span>
                </div>
                <p className="font-bold text-slate-900 font-mono text-sm">
                  {certificate.certificateNumber || "N/A"}
                </p>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-6">
              <CheckCircle2 size={20} />
              <span className="font-semibold">Verified by Asivo</span>
            </div>

            {/* Instructor Signature */}
            <div className="border-t border-slate-200 pt-6 mt-6">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xl">
                    {certificate.instructorName?.charAt(0) || "I"}
                  </div>
                  <p className="font-semibold text-slate-900">{certificate.instructorName || "Instructor"}</p>
                  <p className="text-xs text-slate-500">Course Instructor</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <h3 className="font-bold text-slate-900 mb-4">Certificate Actions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:from-indigo-600 hover:to-purple-600 transition"
            >
              <Download size={18} />
              Download PDF
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
            >
              <Share2 size={18} />
              Share Certificate
            </button>

            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Verify Certificate
                </>
              )}
            </button>
          </div>

          {verified !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${
                verified
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {verified ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span className="font-medium">
                {verified ? "Certificate is valid and verified!" : "Certificate verification failed"}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* QR Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm p-6 mt-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <QrCode size={20} className="text-slate-600" />
            <h3 className="font-bold text-slate-900">Verification QR Code</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center">
              <QrCode size={48} className="text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-2">
                Scan this QR code to verify the authenticity of this certificate.
              </p>
              <p className="text-xs text-slate-500 font-mono break-all">
                {window.location.href}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CertificatePage;
