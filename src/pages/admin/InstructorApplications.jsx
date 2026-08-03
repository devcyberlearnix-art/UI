import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, FileText, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/adminApi";
import { canApproveInstructors } from "../../utils/permissions";

const InstructorApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Check permission
  const hasApprovalPermission = canApproveInstructors(user);

  // Fetch applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getInstructorApplications({ status: filterStatus });
      setApplications(data.applications || data || []);
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      if (errorMsg.includes("permission") || errorMsg.includes("403")) {
        toast.error("You don't have permission to view applications");
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [filterStatus]);

  // View application details
  const handleViewDetails = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  // Approve application
  const handleApprove = async () => {
    if (!hasApprovalPermission) {
      toast.error("You don't have permission to approve applications");
      return;
    }

    if (!selectedApp?.id) {
      toast.error("Application ID is missing");
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.approveInstructorApplication(selectedApp.id, "");
      toast.success("Application approved successfully!");
      setShowModal(false);
      setRejectReason("");
      fetchApplications();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject application
  const handleReject = async () => {
    if (!hasApprovalPermission) {
      toast.error("You don't have permission to reject applications");
      return;
    }

    if (!selectedApp?.id) {
      toast.error("Application ID is missing");
      return;
    }

    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.rejectInstructorApplication(selectedApp.id, rejectReason);
      toast.success("Application rejected successfully!");
      setShowModal(false);
      setRejectReason("");
      fetchApplications();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
      approved: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      rejected: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-2 ${config.bg} ${config.text} px-3 py-1 rounded-full text-sm font-medium`}>
        <Icon size={16} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  if (!hasApprovalPermission && user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view instructor applications.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Instructor Applications</h1>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No applications found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{app.fullName || app.name}</h3>
                  <p className="text-sm text-gray-600">{app.email}</p>
                </div>
                {getStatusBadge(app.status || "pending")}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Experience</p>
                  <p className="font-semibold text-gray-900">{app.experience || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Qualifications</p>
                  <p className="font-semibold text-gray-900">{app.qualifications || "Not specified"}</p>
                </div>
              </div>

              {app.bio && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">About</p>
                  <p className="text-sm text-gray-900 mt-1">{app.bio}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleViewDetails(app)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition"
                >
                  <Eye size={18} />
                  View Details
                </button>

                {(app.status === "pending" || !app.status) && hasApprovalPermission && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        handleApprove();
                      }}
                      disabled={actionLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setShowModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal for details and rejection reason */}
      {showModal && selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setRejectReason("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold">Full Name</p>
                <p className="text-gray-900">{selectedApp.fullName || selectedApp.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold">Email</p>
                <p className="text-gray-900">{selectedApp.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold">Experience</p>
                <p className="text-gray-900">{selectedApp.experience || "Not provided"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold">Qualifications</p>
                <p className="text-gray-900">{selectedApp.qualifications || "Not provided"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 font-semibold">About</p>
                <p className="text-gray-900">{selectedApp.bio || "Not provided"}</p>
              </div>

              {(selectedApp.status === "pending" || !selectedApp.status) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Rejection Reason (if rejecting)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setRejectReason("");
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Close
              </button>

              {(selectedApp.status === "pending" || !selectedApp.status) && hasApprovalPermission && (
                <>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Approve"}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {actionLoading ? "Processing..." : "Reject"}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default InstructorApplications;
