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
  const fetchInstructors = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[Instructors] Fetching instructors from new API endpoint...');
      const response = await adminApi.getInstructors();
      console.log('[Instructors] API Response:', response);
      
      // Handle different response structures
      let instructorData = response.data || response;
      if (!Array.isArray(instructorData)) {
        if (instructorData.instructors) instructorData = instructorData.instructors;
        else if (instructorData.items) instructorData = instructorData.items;
        else if (instructorData.content) instructorData = instructorData.content;
        else instructorData = [instructorData];
      }
      
      // Transform API data to match component structure
      const transformedInstructors = instructorData.map(instructor => ({
        id: instructor.id || instructor._id || instructor.instructorId,
        name: instructor.name || instructor.firstName ? `${instructor.firstName} ${instructor.lastName || ''}`.trim() : instructor.displayName || 'Unknown',
        email: instructor.email || instructor.emailAddress || '',
        status: instructor.status || instructor.verificationStatus || 'pending',
        courses: instructor.courses || instructor.courseCount || 0,
        students: instructor.students || instructor.studentCount || 0,
        qualification: instructor.qualification || instructor.specialization || 'Not specified',
        experience: instructor.experience || instructor.yearsOfExperience || 0,
        createdAt: instructor.createdAt || instructor.joinedDate || new Date().toLocaleDateString()
      }));
      
      setInstructors(transformedInstructors);
      console.log('[Instructors] Instructors loaded successfully:', transformedInstructors.length);
    } catch (err) {
      console.error('[Instructors] Error fetching instructors:', err);
      setError('Failed to load instructors. Please try again.');
      toast.error('Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  // ✅ Approve instructor using new endpoint
  const handleApprove = async (instructorId) => {
    if (!hasPermission('instructors:approve')) {
      toast.error('You do not have permission to approve instructors');
      return;
    }
    if (!window.confirm("Approve this instructor?")) return;
    try {
      await adminApi.approveInstructorApplication(instructorId);
      const updated = instructors.map(inst =>
        inst.id === instructorId ? { ...inst, status: 'approved' } : inst
      );
      setInstructors(updated);
      toast.success("Instructor approved successfully");
    } catch (err) {
      console.error('[Instructors] Error approving instructor:', err);
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  // ❌ Reject instructor using new endpoint
  const handleReject = async (instructorId) => {
    if (!hasPermission('instructors:approve')) {
      toast.error('You do not have permission to reject instructors');
      return;
    }
    if (!window.confirm("Reject this instructor?")) return;
    try {
      await adminApi.rejectInstructorApplication(instructorId);
      const updated = instructors.map(inst =>
        inst.id === instructorId ? { ...inst, status: 'rejected' } : inst
      );
      setInstructors(updated);
      toast.success("Instructor rejected successfully");
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
          <p className="text-sm text-gray-500">Verified</p>
          <p className="text-2xl font-bold text-green-600">{instructors.filter(i => i.status === 'approved').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{instructors.filter(i => i.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{instructors.filter(i => i.status === 'rejected').length}</p>
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      instructor.status === "approved" ? "bg-green-100 text-green-700" :
                      instructor.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {instructor.status}
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
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedInstructor.status === "approved" ? "bg-green-100 text-green-700" :
                  selectedInstructor.status === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {selectedInstructor.status}
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