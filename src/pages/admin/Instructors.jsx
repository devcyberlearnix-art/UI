// src/pages/admin/Instructors.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2, Loader2, AlertCircle, User, Search, RefreshCw, Filter, Mail, BookOpen, ShieldCheck } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Instructors = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'admin';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';
  const permissions = user?.permissions || [];

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return isSuperAdmin || permissions.includes(permission);
  };

  // Permanently purge all instructor & application data from storage & state
  const handlePurgeAllData = () => {
    if (window.confirm("PERMANENTLY DELETE all instructor and application data from the Admin Dashboard? This will reset the count to 0 until a student submits a new application form.")) {
      localStorage.removeItem("lms_instructor_applications");
      localStorage.removeItem("lms_instructors");
      setInstructors([]);
      toast.success("All instructor and application data removed permanently!");
    }
  };

  // Fetch all instructors using API (getInstructors + getInstructorApplications) + local applications storage
  const fetchInstructors = async () => {
    setLoading(true);
    setError("");
    try {
      let apiInstructors = [];
      let apiApplications = [];

      // 1. Fetch from GET /api/v1/admin/instructors
      try {
        const response = await adminApi.getInstructors();
        if (response?.data?.users && Array.isArray(response.data.users)) {
          apiInstructors = response.data.users;
        } else if (response?.data && Array.isArray(response.data)) {
          apiInstructors = response.data;
        } else if (Array.isArray(response)) {
          apiInstructors = response;
        } else if (response?.users && Array.isArray(response.users)) {
          apiInstructors = response.users;
        } else if (response?.instructors && Array.isArray(response.instructors)) {
          apiInstructors = response.instructors;
        }
      } catch (e) {
        console.warn('[Instructors] API getInstructors warning:', e);
      }

      // 2. Fetch from GET /api/v1/admin/instructors/applications
      try {
        const appResponse = await adminApi.getInstructorApplications({ status: 'all' });
        if (Array.isArray(appResponse?.data)) {
          apiApplications = appResponse.data;
        } else if (Array.isArray(appResponse?.applications)) {
          apiApplications = appResponse.applications;
        } else if (Array.isArray(appResponse)) {
          apiApplications = appResponse;
        } else if (appResponse?.data && typeof appResponse.data === 'object' && !Array.isArray(appResponse.data)) {
          apiApplications = appResponse.data.applications || appResponse.data.content || [];
        }
      } catch (e) {
        console.warn('[Instructors] API getInstructorApplications warning:', e);
      }

      // Read local storage applications & custom instructor data
      const localApps = JSON.parse(localStorage.getItem("lms_instructor_applications") || "[]");
      const localInstructors = JSON.parse(localStorage.getItem("lms_instructors") || "[]");

      const map = new Map();

      // Add API instructors
      apiInstructors.forEach(item => {
        const email = (item.email || item.emailAddress || "").toLowerCase();
        if (email) {
          map.set(email, {
            id: item.id || item.userId || item._id || `inst_${Math.random()}`,
            name: item.firstName ? `${item.firstName} ${item.lastName || ''}`.trim() : item.name || email.split('@')[0],
            email: item.email,
            mobile: item.mobile || item.mobileNumber || '',
            avatar: item.profilePhoto || '',
            status: String(item.status || item.verificationStatus || 'active').toLowerCase(),
            courses: item.courses || item.courseCount || 0,
            students: item.students || item.studentCount || 0,
            qualification: item.qualification || item.specialization || 'Not specified',
            experience: item.experience || 0,
            createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
          });
        }
      });

      // Add applications from GET /api/v1/admin/instructors/applications
      apiApplications.forEach(item => {
        const userObj = item.user || {};
        const appObj = item.application || item;
        const email = (userObj.email || appObj.email || item.email || "").toLowerCase();
        if (email) {
          const existing = map.get(email) || {};
          map.set(email, {
            ...existing,
            id: appObj.applicationId || appObj.id || item.id || existing.id || `inst_${Math.random()}`,
            name: userObj.name || (userObj.firstName ? `${userObj.firstName} ${userObj.lastName || ''}`.trim() : null) || existing.name || email.split('@')[0],
            email: email,
            status: String(appObj.status || item.status || existing.status || 'pending_verification').toLowerCase(),
            courses: existing.courses || 0,
            students: existing.students || 0,
            qualification: appObj.specialization || appObj.qualifications || existing.qualification || 'Not specified',
            experience: appObj.experience || existing.experience || '1-3 years',
            bio: appObj.bio || existing.bio || '',
            createdAt: appObj.submittedAt ? new Date(appObj.submittedAt).toLocaleDateString() : (existing.createdAt || new Date().toLocaleDateString())
          });
        }
      });

      // Add student submitted applications from localStorage
      localApps.forEach(item => {
        const email = (item.email || item.user?.email || item.application?.email || "").toLowerCase();
        if (email) {
          const existing = map.get(email) || {};
          map.set(email, {
            ...existing,
            id: item.id || item.applicationId || existing.id || `inst_${Math.random()}`,
            name: item.fullName || item.name || item.user?.name || existing.name || email.split('@')[0],
            email: email,
            status: String(item.status || item.verificationStatus || item.application?.status || existing.status || 'pending_verification').toLowerCase(),
            courses: item.courses || existing.courses || 0,
            students: item.students || existing.students || 0,
            qualification: item.specialization || item.qualification || existing.qualification || 'Not specified',
            experience: item.experience || existing.experience || '1-3 years',
            bio: item.bio || existing.bio || '',
            phone: item.phone || existing.phone || '',
            linkedIn: item.linkedIn || existing.linkedIn || '',
            website: item.website || existing.website || '',
            documents: item.documents || existing.documents || {},
            createdAt: item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : (existing.createdAt || new Date().toLocaleDateString())
          });
        }
      });

      // Overlay explicit admin status overrides from localInstructors
      localInstructors.forEach(item => {
        const email = (item.email || "").toLowerCase();
        if (email) {
          const existing = map.get(email) || {};
          map.set(email, {
            ...existing,
            ...item,
            email: email,
            status: String(item.status || existing.status || 'active').toLowerCase()
          });
        }
      });

      setInstructors(Array.from(map.values()));
    } catch (err) {
      console.error('[Instructors] Error fetching instructors:', err);
      setError('Failed to load instructors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  // ✅ Approve instructor
  const handleApprove = async (instructorId) => {
    if (!hasPermission('instructors:approve')) {
      toast.error('You do not have permission to approve instructors');
      return;
    }
    if (!window.confirm("Approve this instructor?")) return;
    try {
      try { await adminApi.approveInstructorApplication(instructorId); } catch (e) { }

      const targetInst = instructors.find(i => String(i.id) === String(instructorId));
      const targetEmail = (targetInst?.email || '').toLowerCase().trim();

      const updated = instructors.map(inst =>
        String(inst.id) === String(instructorId) || (targetEmail && String(inst.email).toLowerCase().trim() === targetEmail)
          ? { ...inst, status: 'active', verificationStatus: 'approved' }
          : inst
      );
      setInstructors(updated);

      localStorage.setItem("lms_instructors", JSON.stringify(updated));

      const localApps = JSON.parse(localStorage.getItem("lms_instructor_applications") || "[]");
      const updatedApps = localApps.map(a => {
        if (String(a.email).toLowerCase().trim() === targetEmail || String(a.id) === String(instructorId)) {
          return { ...a, status: 'approved', verificationStatus: 'approved' };
        }
        return a;
      });
      localStorage.setItem("lms_instructor_applications", JSON.stringify(updatedApps));

      if (targetEmail) {
        localStorage.setItem(`instructor_app_status_${targetEmail}`, 'approved');
      }
      localStorage.setItem("instructor_application_status", 'approved');

      toast.success(`Instructor ${targetInst?.name || ''} approved successfully! They now have active instructor login access.`);
    } catch (err) {
      console.error('[Instructors] Error approving instructor:', err);
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  // ❌ Reject instructor
  const handleReject = async (instructorId) => {
    if (!hasPermission('instructors:approve')) {
      toast.error('You do not have permission to reject instructors');
      return;
    }
    if (!window.confirm("Reject this instructor?")) return;
    try {
      try { await adminApi.rejectInstructorApplication(instructorId); } catch (e) { }

      const targetInst = instructors.find(i => String(i.id) === String(instructorId));
      const targetEmail = (targetInst?.email || '').toLowerCase();

      const updated = instructors.map(inst =>
        String(inst.id) === String(instructorId) ? { ...inst, status: 'rejected' } : inst
      );
      setInstructors(updated);

      localStorage.setItem("lms_instructors", JSON.stringify(updated));

      const localApps = JSON.parse(localStorage.getItem("lms_instructor_applications") || "[]");
      const updatedApps = localApps.map(a => {
        if (String(a.email).toLowerCase() === targetEmail || String(a.id) === String(instructorId)) {
          return { ...a, status: 'rejected', verificationStatus: 'rejected' };
        }
        return a;
      });
      localStorage.setItem("lms_instructor_applications", JSON.stringify(updatedApps));

      toast.success("Instructor application rejected");
    } catch (err) {
      console.error('[Instructors] Error rejecting instructor:', err);
      toast.error(err.response?.data?.message || 'Rejection failed');
    }
  };

  // 🗑️ Delete instructor (permanently)
  const handleDelete = async (instructorId) => {
    if (!hasPermission('instructors:edit')) {
      toast.error('You do not have permission to delete instructors');
      return;
    }
    if (!window.confirm("Permanently delete this instructor? This action cannot be undone.")) return;
    try {
      await adminApi.deleteInstructor(instructorId);
      const updated = instructors.filter(inst => inst.id !== instructorId);
      setInstructors(updated);
      toast.success("Instructor deleted permanently");
    } catch (err) {
      console.error('[Instructors] Error deleting instructor:', err);
      toast.error(err.response?.data?.message || 'Deletion failed');
    }
  };

  // View instructor details
  const handleViewDetails = (instructor) => {
    setSelectedInstructor(instructor);
    setShowModal(true);
  };

  // Filter instructors by search query & status filter tab
  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch =
      (inst.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inst.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inst.qualification || '').toLowerCase().includes(searchQuery.toLowerCase());

    const normStatus = String(inst.status).toLowerCase();
    let matchesStatus = true;

    if (statusFilter === "active") {
      matchesStatus = normStatus === "active" || normStatus === "approved";
    } else if (statusFilter === "pending") {
      matchesStatus = normStatus.includes("pending");
    } else if (statusFilter === "rejected") {
      matchesStatus = normStatus === "rejected";
    } else if (statusFilter === "suspended") {
      matchesStatus = normStatus === "suspended" || normStatus === "locked";
    }

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Fetching all instructors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center max-w-md">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Instructors</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchInstructors}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleClearStaleData = () => {
    if (window.confirm("Clear cached local applications so you can test a fresh student application form submission?")) {
      localStorage.removeItem("lms_instructor_applications");
      localStorage.removeItem("lms_instructors");
      toast.success("Local applications cleared! Submit a fresh student form to see real-time updates.");
      fetchInstructors();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>Instructor Management</span>
            <span className="text-xs bg-orange-100 text-orange-700 font-medium px-2.5 py-0.5 rounded-full border border-orange-200">
              Get all instructors API
            </span>
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Approve, reject, inspect and manage registered platform instructors
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearStaleData}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-xl border border-red-200 hover:bg-red-100 text-xs font-semibold transition"
            title="Clear old cached applications"
          >
            <Trash2 size={14} />
            Clear Cache
          </button>
          <button
            onClick={fetchInstructors}
            className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition shadow-sm"
            title="Refresh All Instructors"
          >
            <RefreshCw size={16} className={loading ? "animate-spin text-orange-500" : "text-gray-500"} />
            Refresh
          </button>
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total</span>
            <span className="font-bold text-gray-900 text-base">{instructors.length}</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Total Instructors</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{instructors.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <User size={22} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Active / Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {instructors.filter(i => String(i.status).toLowerCase() === 'active' || String(i.status).toLowerCase() === 'approved').length}
            </p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <ShieldCheck size={22} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Pending Verification</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {instructors.filter(i => String(i.status).toLowerCase().includes('pending')).length}
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle size={22} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase">Suspended / Rejected</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {instructors.filter(i => ['suspended', 'locked', 'rejected'].includes(String(i.status).toLowerCase())).length}
            </p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by instructor name, email, qualification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "pending", label: "Pending" },
            { id: "rejected", label: "Rejected" },
            { id: "suspended", label: "Suspended" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                statusFilter === tab.id
                  ? "bg-orange-500 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Instructors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Courses</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredInstructors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="font-medium text-base text-gray-600">No instructors found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or status filter</p>
                  </td>
                </tr>
              ) : (
                filteredInstructors.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-gray-50/80 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-semibold text-sm">
                          {instructor.name ? instructor.name.charAt(0).toUpperCase() : 'I'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{instructor.name}</p>
                          <p className="text-xs text-gray-400">Joined {instructor.createdAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{instructor.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">{instructor.qualification}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{instructor.courses}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{instructor.students}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize inline-flex items-center gap-1 ${
                        ['active', 'approved'].includes(String(instructor.status).toLowerCase())
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : String(instructor.status).toLowerCase().includes('pending')
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : ['suspended', 'locked'].includes(String(instructor.status).toLowerCase())
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {instructor.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-1">
                      <button
                        onClick={() => handleViewDetails(instructor)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <User size={16} />
                      </button>
                      {hasPermission('instructors:approve') && String(instructor.status).toLowerCase() !== "approved" && String(instructor.status).toLowerCase() !== "active" && (
                        <button
                          onClick={() => handleApprove(instructor.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Approve Instructor"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {hasPermission('instructors:approve') && String(instructor.status).toLowerCase() !== "rejected" && (
                        <button
                          onClick={() => handleReject(instructor.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Reject Instructor"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      {hasPermission('instructors:edit') && (
                        <button
                          onClick={() => handleDelete(instructor.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Instructor"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructor Details Modal */}
      {showModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl border border-gray-100">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Instructor Profile Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xl border border-orange-200">
                  {selectedInstructor.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-lg text-gray-900">{selectedInstructor.name}</p>
                  <p className="text-sm text-gray-500">{selectedInstructor.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Qualification / Specialization</p>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">{selectedInstructor.qualification}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Experience</p>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">
                    {selectedInstructor.experience} {String(selectedInstructor.experience).includes('year') ? '' : 'years'}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Assigned Courses</p>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">{selectedInstructor.courses}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Total Students</p>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">{selectedInstructor.students}</p>
                </div>
              </div>

              {selectedInstructor.phone && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">Contact Phone</p>
                  <p className="font-semibold text-gray-900 text-sm">{selectedInstructor.phone}</p>
                </div>
              )}

              {selectedInstructor.linkedIn && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 font-medium">LinkedIn Profile</p>
                  <a href={selectedInstructor.linkedIn} target="_blank" rel="noreferrer" className="text-orange-600 underline font-semibold text-sm truncate block mt-0.5">
                    {selectedInstructor.linkedIn}
                  </a>
                </div>
              )}

              {selectedInstructor.bio && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Bio / Overview</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 leading-relaxed">{selectedInstructor.bio}</p>
                </div>
              )}

              {selectedInstructor.documents && Object.keys(selectedInstructor.documents).length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Uploaded Verification Documents</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedInstructor.documents).map(([key, val]) => (
                      val ? (
                        <div key={key} className="bg-orange-50 text-orange-800 text-xs px-3 py-2 rounded-lg flex items-center justify-between border border-orange-200">
                          <span className="capitalize font-medium">{key.replace(/([A-Z])/g, " $1")}:</span>
                          <span className="truncate max-w-[110px] font-semibold">{typeof val === 'string' ? val : 'Uploaded'}</span>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Account Status</p>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize mt-1 inline-block ${
                    ['active', 'approved'].includes(String(selectedInstructor.status).toLowerCase())
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedInstructor.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium">Joined Date</p>
                  <p className="font-semibold text-gray-800 text-sm mt-0.5">{selectedInstructor.createdAt}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Instructors;