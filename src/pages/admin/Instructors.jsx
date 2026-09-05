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
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [instructorsPerPage] = useState(8);

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
        _id: instructor.id || instructor._id || instructor.instructorId,
        name: instructor.email?.split('@')[0] || 'Unknown', // API only provides email, use email prefix as name
        email: instructor.email || '',
        status: instructor.status || 'ACTIVE',
        courses: 0, // API doesn't provide this
        students: 0, // API doesn't provide this
        qualification: 'Not specified', // API doesn't provide this
        experience: 0, // API doesn't provide this
        createdAt: instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
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
    setCurrentPage(1); // Reset to page 1 when filtering
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <p className="text-sm font-semibold text-gray-700 mb-4">📊 Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">👥</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{instructors.length}</p>
            <p className="text-xs text-gray-500 mt-1">All</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">✅</p>
            <p className="text-xl font-bold text-green-600 mt-1">{instructors.filter(i => i.status?.toUpperCase() === 'ACTIVE').length}</p>
            <p className="text-xs text-gray-500 mt-1">{instructors.length > 0 ? ((instructors.filter(i => i.status?.toUpperCase() === 'ACTIVE').length / instructors.length) * 100).toFixed(1) : 0}%</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">⚠️</p>
            <p className="text-xl font-bold text-yellow-600 mt-1">{instructors.filter(i => i.status?.toUpperCase() === 'SUSPENDED').length}</p>
            <p className="text-xs text-gray-500 mt-1">{instructors.length > 0 ? ((instructors.filter(i => i.status?.toUpperCase() === 'SUSPENDED').length / instructors.length) * 100).toFixed(1) : 0}%</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-red-600">⏳</p>
            <p className="text-xl font-bold text-red-600 mt-1">{instructors.filter(i => i.status?.toUpperCase() === 'PENDING_VERIFICATION').length}</p>
            <p className="text-xs text-gray-500 mt-1">{instructors.length > 0 ? ((instructors.filter(i => i.status?.toUpperCase() === 'PENDING_VERIFICATION').length / instructors.length) * 100).toFixed(1) : 0}%</p>
          </div>
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
                  placeholder="Search..."
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
                <option value="All">All Status ▼</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <button className="px-4 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
                + Add Instructor
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm font-medium text-gray-700 mb-4">Instructor Cards ({filteredInstructors.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredInstructors
              .slice((currentPage - 1) * instructorsPerPage, currentPage * instructorsPerPage)
              .map((instructor) => (
              <div key={instructor.id} className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                    👤
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{instructor.name}</p>
                    <p className="text-xs text-gray-400">────────</p>
                  </div>
                </div>
                <div className="mb-2">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    instructor.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                    instructor.status?.toUpperCase() === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' :
                    instructor.status?.toUpperCase() === 'PENDING_VERIFICATION' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {instructor.status?.toUpperCase() === 'ACTIVE' ? '🟢 ACTIVE' :
                     instructor.status?.toUpperCase() === 'SUSPENDED' ? '🟡 SUSPENDED' :
                     instructor.status?.toUpperCase() === 'PENDING_VERIFICATION' ? '🔴 PENDING' : instructor.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">📧 {instructor.email.slice(0, 8)}...</p>
                <p className="text-xs text-gray-500 mb-3">📅 {instructor.createdAt}</p>
                <p className="text-xs text-gray-400 mb-3">────────</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(instructor)}
                    className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleApprove(instructor.id)}
                    className="px-3 py-1 text-xs text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 px-4 py-3 bg-white border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * instructorsPerPage + 1}-{Math.min(currentPage * instructorsPerPage, filteredInstructors.length)} of {filteredInstructors.length} instructors
          </p>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt; Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(filteredInstructors.length / instructorsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredInstructors.length / instructorsPerPage)))}
            disabled={currentPage === Math.ceil(filteredInstructors.length / instructorsPerPage)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next &gt;
          </button>
        </div>
      </div>

      {/* Instructor Details Modal */}
      {showModal && selectedInstructor && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm font-medium"
              >
                ← Back to Instructors
              </button>
              <h2 className="font-bold text-xl text-gray-900">Instructor Details</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(selectedInstructor.id)}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                >
                  Edit
                </button>
                <button className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                  Actions ▼
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile Section */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-6 flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-purple-100">
                    {selectedInstructor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xl text-gray-900">{selectedInstructor.name}</p>
                    <p className="text-sm text-gray-600 mt-1">📧 {selectedInstructor.email}</p>
                    <p className="text-sm text-gray-600 mt-1">🎓 INSTRUCTOR</p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                      selectedInstructor.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      selectedInstructor.status?.toUpperCase() === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' :
                      selectedInstructor.status?.toUpperCase() === 'PENDING_VERIFICATION' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedInstructor.status}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">📅 Joined: {selectedInstructor.createdAt}</p>
                    <p className="text-sm text-gray-500">🆔 ID: {selectedInstructor.id}</p>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedInstructor.courses}</p>
                  <p className="text-xs text-gray-500 mt-1">Courses</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900">{selectedInstructor.students}</p>
                  <p className="text-xs text-gray-500 mt-1">Students</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-xs text-gray-500 mt-1">Rating</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-xs text-gray-500 mt-1">Reviews</p>
                </div>
              </div>

              {/* Account Information */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold text-sm text-gray-700">📋 Account Information</p>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="px-4 py-3 flex justify-between items-center">
                    <p className="text-sm text-gray-500">Account Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      selectedInstructor.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      selectedInstructor.status?.toUpperCase() === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-700' :
                      selectedInstructor.status?.toUpperCase() === 'PENDING_VERIFICATION' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedInstructor.status}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="text-sm text-gray-900">INSTRUCTOR</p>
                  </div>
                  <div className="px-4 py-3 flex justify-between items-center">
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">{selectedInstructor.createdAt}</p>
                  </div>
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