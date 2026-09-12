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
  const [pagination, setPagination] = useState({ currentPage: 0, totalPages: 1, totalApplications: 0, pageSize: 10 });
  const [currentPage, setCurrentPage] = useState(0);

  // Check permission
  const hasApprovalPermission = canApproveInstructors(user);

  // Fetch applications
  const fetchApplications = async (page = 0) => {
    setLoading(true);
    try {
      const response = await adminApi.getInstructorApplications({ status: filterStatus, page, size: 10 });
      console.log('[InstructorApplications] Response:', response);

      // Real API shape: { success, data: [ { application, user, documents, nextSteps } ], pagination }
      let rawApps = [];
      if (Array.isArray(response?.data)) {
        rawApps = response.data;
      } else if (Array.isArray(response?.applications)) {
        rawApps = response.applications;
      } else if (Array.isArray(response)) {
        rawApps = response;
      } else if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // Sometimes the data is nested: { data: { applications: [...] } }
        rawApps = response.data.applications || response.data.content || [];
      }

      if (response?.pagination) {
        setPagination(response.pagination);
      }

      const transformed = rawApps.map((item) => {
        const userObj = item.user || {};
        const appObj = item.application || {};
        const docsObj = item.documents || {};
        return {
          // Use applicationId for approve/reject actions
          id: appObj.applicationId || appObj.id || item.id || item.applicationId,
          userId: userObj.userId || userObj.id,
          fullName:
            userObj.name ||
            (userObj.firstName ? `${userObj.firstName} ${userObj.lastName || ''}`.trim() : null) ||
            userObj.email?.split('@')[0] ||
            'Applicant',
          email: userObj.email || item.email || '',
          status: String(appObj.status || item.status || 'PENDING').toLowerCase(),
          submittedAt: appObj.submittedAt || item.submittedAt || item.createdAt,
          reviewMessage: appObj.reviewMessage || item.reviewMessage || '',
          experience: appObj.experience || item.experience || '',
          qualifications: appObj.qualifications || item.qualifications || '',
          bio: appObj.bio || item.bio || '',
          contentType: appObj.contentType || item.contentType || '',
          specialization: appObj.specialization || item.specialization || '',
          currentRole: userObj.currentRole || userObj.role,
          appliedRole: userObj.appliedRole,
          accountStatus: userObj.accountStatus || userObj.status,
          isInstructorApproved: userObj.isInstructorApproved,
          documents: docsObj,
          rawItem: item,
        };
      });

      setApplications(transformed);
      setError('');
    } catch (err) {
      const status = err?.response?.status;
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load applications';
      setError(errorMsg);
      if (status === 403) {
        toast.error("Access denied: You don't have permission to view instructor applications");
      } else if (status === 401) {
        toast.error('Session expired. Please log in again.');
      } else {
        toast.error(`Error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(currentPage);
  }, [filterStatus, currentPage]);

  // View application details
  const handleViewDetails = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  // Approve application — uses applicationId
  // Accepts optional appId to avoid React state race when called from inline buttons
  const handleApprove = async (appId) => {
    const targetId = appId || selectedApp?.id;
    if (!hasApprovalPermission) {
      toast.error("You don't have permission to approve applications");
      return;
    }
    if (!targetId) {
      toast.error('Application ID is missing');
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.approveInstructorApplication(targetId);
      toast.success('Application approved successfully!');
      setShowModal(false);
      setRejectReason('');
      fetchApplications(currentPage);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject application — uses applicationId
  const handleReject = async () => {
    if (!hasApprovalPermission) {
      toast.error("You don't have permission to reject applications");
      return;
    }
    if (!selectedApp?.id) {
      toast.error('Application ID is missing');
      return;
    }
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await adminApi.rejectInstructorApplication(selectedApp.id, rejectReason.trim());
      toast.success('Application rejected successfully!');
      setShowModal(false);
      setRejectReason('');
      fetchApplications(currentPage);
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

  const userRole = String(user?.role || user?.role1 || user?.userRole || "").toLowerCase();
  const isAdmin = userRole.includes("admin") || userRole.includes("super") || userRole.includes("main") || userRole === 'admin';

  // Show access denied only if both checks fail AND we've gotten an actual 403 from the API
  // Don't block the page pre-emptively — let the API decide
  if (!hasApprovalPermission && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 rounded-2xl border border-red-100">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to view instructor applications.</p>
          <p className="text-sm text-gray-400">Your role: <span className="font-semibold capitalize">{userRole || 'unknown'}</span></p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Instructor Applications
          <span className="ml-3 text-lg font-normal text-gray-500">({pagination.totalApplications} total)</span>
        </h1>
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setCurrentPage(0); }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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

                {(app.status === 'pending' || !app.status) && hasApprovalPermission && (
                  <>
                    <button
                      onClick={() => handleApprove(app.id)}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Page <span className="font-semibold">{pagination.currentPage + 1}</span> of{' '}
            <span className="font-semibold">{pagination.totalPages}</span>{' '}
            &mdash; {pagination.totalApplications} total applications
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages - 1, p + 1))}
              disabled={currentPage >= pagination.totalPages - 1}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-40"
            >
              Next
            </button>
          </div>
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
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Applicant Name</p>
                  <p className="font-semibold text-gray-900">{selectedApp.fullName || selectedApp.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Email Address</p>
                  <p className="font-semibold text-gray-900">{selectedApp.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Submitted On</p>
                  <p className="font-semibold text-gray-900">
                    {selectedApp.submittedAt ? new Date(selectedApp.submittedAt).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Application Status</p>
                  <p className="font-semibold capitalize text-orange-600">{selectedApp.status || 'Pending'}</p>
                </div>
                {selectedApp.currentRole && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Current Role</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedApp.currentRole.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {selectedApp.appliedRole && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Applied For</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedApp.appliedRole.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {selectedApp.accountStatus && (
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Account Status</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedApp.accountStatus.replace(/_/g, ' ')}</p>
                  </div>
                )}
              </div>

              {selectedApp.reviewMessage && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                  <p className="text-xs text-blue-500 font-medium uppercase mb-1">Review Message</p>
                  <p className="text-sm text-blue-800">{selectedApp.reviewMessage}</p>
                </div>
              )}

              {selectedApp.documents && (
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-2">Attached Verification Documents</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries({
                      ...(selectedApp.documents.required || {}),
                      ...(selectedApp.documents.optional || {})
                    }).map(([docKey, isUploaded]) => (
                      <div key={docKey} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs">
                        <CheckCircle size={14} className={isUploaded ? "text-green-500" : "text-gray-300"} />
                        <span className="capitalize font-medium text-gray-700">{docKey.replace(/([A-Z])/g, " $1")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedApp.status === "pending" || !selectedApp.status) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Rejection Reason (required if rejecting)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Provide a reason for rejection..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
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
