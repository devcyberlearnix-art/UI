import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, FileText, Eye, RefreshCw, Trash2 } from "lucide-react";
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
      let rawApps = [];
      try {
        const response = await adminApi.getInstructorApplications({ status: filterStatus, page, size: 10 });
        if (Array.isArray(response?.data)) {
          rawApps = response.data;
        } else if (Array.isArray(response?.applications)) {
          rawApps = response.applications;
        } else if (Array.isArray(response)) {
          rawApps = response;
        } else if (response?.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          rawApps = response.data.applications || response.data.content || [];
        }
        if (response?.pagination) {
          setPagination(response.pagination);
        }
      } catch (apiErr) {
        console.warn("[InstructorApplications] API fetch error, fallback to local storage");
      }

      const transformed = rawApps.map((item) => {
        const userObj = item.user || {};
        const appObj = item.application || {};
        const docsObj = item.documents || {};
        return {
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

      // Merge with student applications stored in localStorage
      const localApps = JSON.parse(localStorage.getItem("lms_instructor_applications") || "[]");
      const appMap = new Map();

      transformed.forEach(app => {
        if (app.email) appMap.set(app.email.toLowerCase(), app);
      });

      localApps.forEach(app => {
        const email = (app.email || app.user?.email || "").toLowerCase();
        if (email) {
          appMap.set(email, {
            id: app.id || app.applicationId || `app_${Math.random()}`,
            userId: app.userId || `usr_${Math.random()}`,
            fullName: app.fullName || app.name || email.split('@')[0],
            email: email,
            status: String(app.status || 'pending_verification').toLowerCase(),
            submittedAt: app.submittedAt || new Date().toISOString(),
            experience: app.experience || '1-3 years',
            qualifications: app.specialization || app.qualifications || 'Not specified',
            bio: app.bio || '',
            contentType: app.contentType || 'Development',
            specialization: app.specialization || 'General'
          });
        }
      });

      setApplications(Array.from(appMap.values()));
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load applications';
      setError(errorMsg);
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

  // Approve application
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
      try { await adminApi.approveInstructorApplication(targetId); } catch (e) {}

      const targetApp = applications.find(a => String(a.id) === String(targetId) || String(a.applicationId) === String(targetId)) || selectedApp;
      const targetEmail = (targetApp?.email || targetApp?.user?.email || selectedApp?.email || '').toLowerCase().trim();

      const updated = applications.map(a => {
        const matchId = String(a.id) === String(targetId) || String(a.applicationId) === String(targetId);
        const matchEmail = targetEmail && String(a.email || '').toLowerCase().trim() === targetEmail;
        if (matchId || matchEmail) {
          return { ...a, status: 'approved', verificationStatus: 'approved' };
        }
        return a;
      });
      setApplications(updated);

      localStorage.setItem("lms_instructor_applications", JSON.stringify(updated));

      const localInsts = JSON.parse(localStorage.getItem("lms_instructors") || "[]");
      const instMap = new Map();
      localInsts.forEach(i => {
        if (i.email) instMap.set(String(i.email).toLowerCase().trim(), i);
      });

      if (targetEmail) {
        const existingInst = instMap.get(targetEmail) || {};
        instMap.set(targetEmail, {
          ...existingInst,
          ...targetApp,
          email: targetEmail,
          status: 'active',
          verificationStatus: 'approved'
        });
        localStorage.setItem(`instructor_app_status_${targetEmail}`, 'approved');
      }
      localStorage.setItem("lms_instructors", JSON.stringify(Array.from(instMap.values())));
      localStorage.setItem("instructor_application_status", 'approved');

      toast.success('Application approved successfully! Instructor login activated.');
      setShowModal(false);
      setRejectReason('');
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

  const handleClearStaleData = () => {
    if (window.confirm("PERMANENTLY DELETE all current applications from the Admin Dashboard? Count will reset to 0 until a student submits a new application.")) {
      localStorage.removeItem("lms_instructor_applications");
      localStorage.removeItem("lms_instructors");
      setApplications([]);
      setPagination({ currentPage: 0, totalPages: 1, totalApplications: 0, pageSize: 10 });
      toast.success("All applications removed permanently! Total set to 0.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span>Instructor Applications</span>
            <span className="text-lg font-normal text-gray-500">({pagination.totalApplications || applications.length} total)</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review student applications submitted to become an instructor</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleClearStaleData}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-100 text-xs font-semibold transition"
            title="Clear old cached applications"
          >
            <Trash2 size={14} />
            Clear Cache
          </button>
          <button
            onClick={() => fetchApplications(currentPage)}
            className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition shadow-xs"
            title="Refresh Applications"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-orange-500" : "text-gray-500"} />
            Refresh
          </button>
          <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setCurrentPage(0); }}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition ${
                filterStatus === status
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

                {String(app.status).toLowerCase() !== 'approved' && String(app.status).toLowerCase() !== 'active' && hasApprovalPermission && (
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

              {selectedApp.documents && Object.keys(selectedApp.documents).length > 0 && (
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-2">Attached Verification Documents</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(
                      selectedApp.documents.required || selectedApp.documents.optional
                        ? { ...(selectedApp.documents.required || {}), ...(selectedApp.documents.optional || {}) }
                        : selectedApp.documents
                    ).map(([docKey, docVal]) => (
                      docVal ? (
                        <div key={docKey} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg text-xs">
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="capitalize font-medium text-gray-700">{docKey.replace(/([A-Z])/g, " $1")}:</span>
                          <span className="truncate text-gray-600 font-semibold">{typeof docVal === 'string' ? docVal : 'Uploaded'}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {String(selectedApp.status).toLowerCase() !== 'approved' && String(selectedApp.status).toLowerCase() !== 'active' && (
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

              {String(selectedApp.status).toLowerCase() !== 'approved' && String(selectedApp.status).toLowerCase() !== 'active' && hasApprovalPermission && (
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
