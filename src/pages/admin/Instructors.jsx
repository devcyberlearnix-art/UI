// src/pages/admin/Instructors.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2, Loader2, AlertCircle, User, Mail, BookOpen } from "lucide-react";
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

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return isSuperAdmin || permissions.includes(permission);
  };

  // Fetch all instructors using new endpoint
  // Fetch all instructors using API + local applications storage
  const fetchInstructors = async () => {
    setLoading(true);
    setError("");
    try {
      let apiInstructors = [];
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
        console.warn('[Instructors] API getInstructors warning, fallback to stored applications');
      }

      // Read local storage applications & custom instructor data
      const localApps = JSON.parse(localStorage.getItem("lms_instructor_applications") || "[]");
      const localInstructors = JSON.parse(localStorage.getItem("lms_instructors") || "[]");

      // Default seed matching Admin Management interface
      const defaultInstructors = [
        { id: "inst_1", name: "emily.johnson", email: "emily.johnson@yahoo.com", courses: 0, students: 0, status: "locked" },
        { id: "inst_2", name: "amanda.smith", email: "amanda.smith@outlook.com", courses: 0, students: 0, status: "suspended" },
        { id: "inst_3", name: "jane.martinez", email: "jane.martinez@outlook.com", courses: 0, students: 0, status: "active" },
        { id: "inst_4", name: "michael.johnson", email: "michael.johnson@outlook.com", courses: 0, students: 0, status: "suspended" },
        { id: "inst_5", name: "william.davis", email: "william.davis@outlook.com", courses: 0, students: 0, status: "pending_verification" },
        { id: "inst_6", name: "emily.thomas", email: "emily.thomas@icloud.com", courses: 0, students: 0, status: "active" }
      ];

      const map = new Map();

      // Seed default instructors
      defaultInstructors.forEach(item => {
        if (item.email) map.set(item.email.toLowerCase(), item);
      });

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
      try { await adminApi.approveInstructorApplication(instructorId); } catch (e) {}

      const targetInst = instructors.find(i => String(i.id) === String(instructorId));
      const targetEmail = (targetInst?.email || '').toLowerCase();

      const updated = instructors.map(inst =>
        String(inst.id) === String(instructorId) ? { ...inst, status: 'active' } : inst
      );
      setInstructors(updated);

      // Persist in localStorage so student immediately gains instructor login access
      localStorage.setItem("lms_instructors", JSON.stringify(updated));

      // Also update matching application entry in lms_instructor_applications
      const localApps = JSON.parse(localStorage.getItem("lms_instructor_applications") || "[]");
      const updatedApps = localApps.map(a => {
        if (String(a.email).toLowerCase() === targetEmail || String(a.id) === String(instructorId)) {
          return { ...a, status: 'approved', verificationStatus: 'approved' };
        }
        return a;
      });
      localStorage.setItem("lms_instructor_applications", JSON.stringify(updatedApps));

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
      try { await adminApi.rejectInstructorApplication(instructorId); } catch (e) {}

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

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading instructors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Instructors</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchInstructors}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Instructor Management</h1>
          <p className="text-gray-500 text-sm">Approve, reject, and manage instructors</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border">
            <span className="text-sm text-gray-500">Total: </span>
            <span className="font-semibold">{instructors.length}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border">
            <span className="text-sm text-gray-500">Pending: </span>
            <span className="font-semibold text-yellow-600">{instructors.filter(i => i.status === 'pending').length}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Total Instructors</p>
          <p className="text-2xl font-bold">{instructors.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{instructors.filter(i => i.status === 'active').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{instructors.filter(i => i.status === 'pending_verification').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Suspended / Locked</p>
          <p className="text-2xl font-bold text-red-600">{instructors.filter(i => i.status === 'suspended' || i.status === 'locked').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Courses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium">{instructor.name}</td>
                  <td className="px-6 py-4 text-sm">{instructor.email}</td>
                  <td className="px-6 py-4 text-sm">{instructor.courses}</td>
                  <td className="px-6 py-4 text-sm">{instructor.students}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${
                      instructor.status === 'active' ? 'bg-green-100 text-green-700' :
                      instructor.status === 'suspended' ? 'bg-red-100 text-red-700' :
                      instructor.status === 'locked' ? 'bg-gray-200 text-gray-700' :
                      instructor.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {instructor.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleViewDetails(instructor)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded transition"
                      title="View Details"
                    >
                      <User size={16} />
                    </button>
                    {hasPermission('instructors:approve') && instructor.status !== "approved" && (
                      <button
                        onClick={() => handleApprove(instructor.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                        title="Approve"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {hasPermission('instructors:approve') && instructor.status !== "rejected" && (
                      <button
                        onClick={() => handleReject(instructor.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    {hasPermission('instructors:edit') && (
                      <button
                        onClick={() => handleDelete(instructor.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructor Details Modal */}
      {showModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Instructor Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{selectedInstructor.name}</p>
                  <p className="text-sm text-gray-500">{selectedInstructor.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Qualification</p>
                  <p className="font-semibold">{selectedInstructor.qualification}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-semibold">{selectedInstructor.experience} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Courses</p>
                  <p className="font-semibold">{selectedInstructor.courses}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Students</p>
                  <p className="font-semibold">{selectedInstructor.students}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${
                  selectedInstructor.status === 'active' ? 'bg-green-100 text-green-700' :
                  selectedInstructor.status === 'suspended' ? 'bg-red-100 text-red-700' :
                  selectedInstructor.status === 'locked' ? 'bg-gray-200 text-gray-700' :
                  selectedInstructor.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {selectedInstructor.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined Date</p>
                <p className="font-semibold">{selectedInstructor.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Instructors;