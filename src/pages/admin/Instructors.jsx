// src/pages/admin/Instructors.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2, Loader2, AlertCircle, User, Mail, BookOpen, Search, Filter, Download, Users as UsersIcon, Shield, GraduationCap } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Instructors = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'admin';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';
  const permissions = user?.permissions || [];

  const [instructors, setInstructors] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return isSuperAdmin || permissions.includes(permission);
  };

  // Fetch all instructors using new endpoint
  const fetchInstructors = async (page = 0, size = 10) => {
    setLoading(true);
    setError("");
    try {
      console.log('[Instructors] Fetching instructors from API endpoint with pagination:', { page, size });
      const response = await adminApi.getInstructors(page, size);
      console.log('[Instructors] API Response:', response);
      
      // Handle different response structures
      let instructorData = response.data?.users || response.users || response.data || response;
      if (!Array.isArray(instructorData)) {
        if (instructorData.instructors) instructorData = instructorData.instructors;
        else if (instructorData.items) instructorData = instructorData.items;
        else if (instructorData.content) instructorData = instructorData.content;
        else instructorData = [instructorData];
      }
      
      // Transform API data to match component structure
      const transformedInstructors = instructorData.map(instructor => ({
        id: instructor.id || instructor._id || instructor.instructorId,
        name: instructor.name || instructor.firstName ? `${instructor.firstName} ${instructor.lastName || ''}`.trim() : instructor.email?.split('@')[0] || 'Unknown',
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

  useEffect(() => {
    let data = [...instructors];

    if (search) {
      data = data.filter(instructor =>
        instructor.name.toLowerCase().includes(search.toLowerCase()) ||
        instructor.email.toLowerCase().includes(search.toLowerCase()) ||
        instructor.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedStatus !== "All") {
      data = data.filter(instructor => instructor.status?.toUpperCase() === selectedStatus.toUpperCase());
    }

    setFilteredInstructors(data);
  }, [search, selectedStatus, instructors]);

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Instructor Management</h1>
          <p className="text-gray-600 text-lg">Approve, reject, and manage instructors</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-purple-600"/>
            </div>
            <span className="text-sm text-gray-500 font-medium">Total Instructors</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{instructors.length}</p>
          <p className="text-sm text-gray-500 mt-1">All instructors</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600"/>
            </div>
            <span className="text-sm text-gray-500 font-medium">Active</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{instructors.filter(i => i.status?.toUpperCase() === 'ACTIVE').length}</p>
          <p className="text-sm text-gray-500 mt-1">Active instructors</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600"/>
            </div>
            <span className="text-sm text-gray-500 font-medium">Pending</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{instructors.filter(i => i.status?.toUpperCase() === 'PENDING_VERIFICATION').length}</p>
          <p className="text-sm text-gray-500 mt-1">Awaiting approval</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600"/>
            </div>
            <span className="text-sm text-gray-500 font-medium">Suspended</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{instructors.filter(i => i.status?.toUpperCase() === 'SUSPENDED').length}</p>
          <p className="text-sm text-gray-500 mt-1">Suspended accounts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Instructor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Courses</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Students</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInstructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {instructor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{instructor.name}</p>
                        <p className="text-xs text-gray-500">ID: {instructor.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600">{instructor.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 font-medium">{instructor.courses}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 font-medium">{instructor.students}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      instructor.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      instructor.status?.toUpperCase() === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                      instructor.status?.toUpperCase() === 'PENDING_VERIFICATION' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {instructor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleViewDetails(instructor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <User size={18} />
                      </button>
                      {hasPermission('instructors:approve') && instructor.status?.toUpperCase() !== 'ACTIVE' && (
                        <button
                          onClick={() => handleApprove(instructor.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                      {hasPermission('instructors:approve') && instructor.status?.toUpperCase() !== 'SUSPENDED' && (
                        <button
                          onClick={() => handleReject(instructor.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      )}
                      {hasPermission('instructors:edit') && (
                        <button
                          onClick={() => handleDelete(instructor.id)}
                          className="p-2 text-gray-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructor Details Modal */}
      {showModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-bold text-xl text-gray-900">Instructor Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                  {selectedInstructor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg text-gray-900">{selectedInstructor.name}</p>
                  <p className="text-sm text-gray-500">{selectedInstructor.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-semibold text-xs">{selectedInstructor.id.slice(0, 12)}...</p>
                </div>
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
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedInstructor.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    selectedInstructor.status?.toUpperCase() === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                    selectedInstructor.status?.toUpperCase() === 'PENDING_VERIFICATION' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedInstructor.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Joined Date</p>
                <p className="font-semibold">{selectedInstructor.createdAt}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Instructors;