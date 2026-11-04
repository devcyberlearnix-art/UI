// src/pages/admin/Instructors.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Trash2, Loader2, AlertCircle, User, Mail, BookOpen, Search, Filter, Download, Users as UsersIcon, Shield, GraduationCap, Calendar, Clock, AlertTriangle, X } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Portal from "../../components/ui/Portal";

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
      const response = await adminApi.getInstructors({ page, size });
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
      <div className="bg-[#F5F2EC] dark:bg-[#151413] min-h-screen p-6 flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-10 h-10 text-[#5B3E57] dark:text-[#D1A7CC] animate-spin" />
    <p className="text-sm font-medium text-[#635E56] dark:text-[#A8A196]">Loading faculty governance roster...</p>
  </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F5F2EC] dark:bg-[#151413] min-h-screen p-6 flex items-center justify-center">
        <div className="bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-red-500/20 rounded-3xl p-8 text-center max-w-md space-y-4 shadow-2xl">
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] p-6 lg:p-10 space-y-8 font-sans selection:bg-[#5B3E57] dark:bg-[#D1A7CC]/30 selection:text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2EC] dark:bg-[#151413] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 text-xs font-semibold text-[#5B3E57] dark:text-[#D1A7CC] mb-2">
            <span className="tracking-wider uppercase text-[10px] font-bold">Faculty Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">Instructor Management</h1>
          <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A8A196]">Approve, review, and govern certified course authors</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-[#5B3E57] dark:text-[#D1A7CC] mb-4">Faculty Overview</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.06] rounded-2xl p-4 text-center">
            <UsersIcon className="w-5 h-5 text-[#5B3E57] dark:text-[#D1A7CC] mx-auto" />
            <p className="text-xl font-extrabold font-mono text-[#282521] dark:text-[#EDE8E1] mt-2">{instructors.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Registered</p>
          </div>
          <div className="bg-[#F5F2EC] dark:bg-[#151413] border border-emerald-500/20 rounded-2xl p-4 text-center">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <p className="text-xl font-bold text-emerald-600 mt-2">{instructors.filter(i => i.status?.toUpperCase() === 'ACTIVE').length}</p>
            <p className="text-xs text-gray-500 mt-0.5">{instructors.length > 0 ? ((instructors.filter(i => i.status?.toUpperCase() === 'ACTIVE').length / instructors.length) * 100).toFixed(1) : 0}% Active</p>
          </div>
          <div className="bg-[#F5F2EC] dark:bg-[#151413] border border-amber-500/20 rounded-2xl p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mx-auto" />
            <p className="text-xl font-bold text-yellow-600 mt-2">{instructors.filter(i => i.status?.toUpperCase() === 'SUSPENDED').length}</p>
            <p className="text-xs text-gray-500 mt-0.5">{instructors.length > 0 ? ((instructors.filter(i => i.status?.toUpperCase() === 'SUSPENDED').length / instructors.length) * 100).toFixed(1) : 0}% Suspended</p>
          </div>
          <div className="bg-[#F5F2EC] dark:bg-[#151413] border border-red-500/20 rounded-2xl p-4 text-center">
            <Clock className="w-5 h-5 text-rose-600 dark:text-rose-400 mx-auto" />
            <p className="text-xl font-bold text-red-600 mt-2">{instructors.filter(i => i.status?.toUpperCase() === 'PENDING_VERIFICATION').length}</p>
            <p className="text-xs text-gray-500 mt-0.5">{instructors.length > 0 ? ((instructors.filter(i => i.status?.toUpperCase() === 'PENDING_VERIFICATION').length / instructors.length) * 100).toFixed(1) : 0}% Pending</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] bg-[#F5F2EC] dark:bg-[#151413]/50">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-sm text-[#282521] dark:text-[#EDE8E1] placeholder-[#71717A] focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC]"
                />
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC]"
              >
                <option value="All">All Status ▼</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_VERIFICATION">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <button className="px-4 py-2.5 bg-[#5B3E57] hover:bg-[#4A3246] dark:bg-[#D1A7CC] dark:hover:bg-[#C296BD] text-white dark:text-[#151413] rounded-xl transition-colors font-medium text-xs shadow-sm">
                + Add Instructor
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm font-medium text-gray-700 dark:text-[#EDE8E1] mb-4">Instructor Directory ({filteredInstructors.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredInstructors
              .slice((currentPage - 1) * instructorsPerPage, currentPage * instructorsPerPage)
              .map((instructor) => (
              <div key={instructor.id} className="bg-[#F5F2EC] dark:bg-[#151413] rounded-2xl p-5 hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 transition-all border border-[#E3DCD3] dark:border-white/[0.06] group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#282521] dark:text-[#EDE8E1] text-sm group-hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors truncate">{instructor.name}</p>
                    <p className="text-xs text-gray-400">Verified Author</p>
                  </div>
                </div>
                <div className="mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full ${
                    instructor.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40' :
                    instructor.status?.toUpperCase() === 'SUSPENDED' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40' :
                    instructor.status?.toUpperCase() === 'PENDING_VERIFICATION' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      instructor.status?.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500' :
                      instructor.status?.toUpperCase() === 'SUSPENDED' ? 'bg-amber-500' :
                      'bg-rose-500'
                    }`} />
                    {instructor.status?.toUpperCase() === 'ACTIVE' ? 'Active' :
                     instructor.status?.toUpperCase() === 'SUSPENDED' ? 'Suspended' :
                     instructor.status?.toUpperCase() === 'PENDING_VERIFICATION' ? 'Pending' : instructor.status}
                  </span>
                </div>
                <p className="text-xs text-[#635E56] dark:text-[#A8A196] mb-2 font-mono truncate">{instructor.email}</p>
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{instructor.createdAt}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(instructor)}
                    className="px-3 py-1 text-xs text-[#5B3E57] dark:text-[#D1A7CC] hover:bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 rounded-lg transition-colors font-medium"
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
        <div className="flex items-center justify-between px-6 py-4 bg-[#F5F2EC] dark:bg-[#151413]/50 border-t border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] text-xs">
          <p className="text-[#635E56] dark:text-[#A8A196]">
            Showing <strong className="text-white">{(currentPage - 1) * instructorsPerPage + 1}</strong> to <strong className="text-white">{Math.min(currentPage * instructorsPerPage, filteredInstructors.length)}</strong> of <strong className="text-white">{filteredInstructors.length}</strong> faculty members
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[#F5F2EC] dark:bg-[#151413] border border-[#D5C0D1] dark:border-white/10 hover:border-white/20 text-[#635E56] dark:text-[#A8A196] hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none transition"
            >
              Previous
            </button>
            <span className="font-mono text-[#282521] dark:text-[#EDE8E1] px-2">
              Page {currentPage} of {Math.ceil(filteredInstructors.length / instructorsPerPage) || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredInstructors.length / instructorsPerPage)))}
              disabled={currentPage === Math.ceil(filteredInstructors.length / instructorsPerPage)}
              className="px-3 py-1.5 bg-[#F5F2EC] dark:bg-[#151413] border border-[#D5C0D1] dark:border-white/10 hover:border-white/20 text-[#635E56] dark:text-[#A8A196] hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Instructor Details Modal (Ink & Onyx) */}
      {showModal && selectedInstructor && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#282521]/45 dark:bg-black/75 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <div className="bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D5C0D1] dark:border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-[#E3DCD3] dark:border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#282521] dark:text-[#EDE8E1]">Faculty Profile Inspection</h3>
                  <p className="text-xs text-[#635E56] dark:text-[#A8A196]">Federated microservice instructor record</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#D5C0D1] dark:border-white/10 text-[#635E56] dark:text-[#A8A196] hover:text-[#282521] dark:hover:text-[#EDE8E1]"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4 text-xs">
                {/* Profile Section */}
                <div className="p-4 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] font-bold text-2xl shadow-sm shrink-0">
                    {selectedInstructor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base text-white truncate">{selectedInstructor.name}</p>
                    <p className="text-xs font-mono text-[#5B3E57] dark:text-[#D1A7CC] truncate mt-0.5">{selectedInstructor.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40">
                        INSTRUCTOR
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {selectedInstructor.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 space-y-1">
                    <span className="text-[#635E56] dark:text-[#A8A196] block text-[11px]">Assigned Role</span>
                    <span className="font-bold text-white text-sm">Faculty Member</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 space-y-1">
                    <span className="text-[#635E56] dark:text-[#A8A196] block text-[11px]">Verification</span>
                    <span className="font-bold text-emerald-400 text-sm">Certified Author</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#635E56] dark:text-[#A8A196]">Faculty Identifier</span>
                    <span className="font-mono text-[#A1A1AA]">{selectedInstructor.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#635E56] dark:text-[#A8A196]">Induction Timestamp</span>
                    <span className="font-mono text-[#756E64] dark:text-[#7A7368]">{selectedInstructor.createdAt}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-[#5B3E57] dark:bg-[#D1A7CC] hover:bg-[#B3936A] text-[#FFFEFA] dark:text-[#151413] rounded-xl text-xs font-bold transition-all shadow-lg shadow-sm"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </motion.div>
  );
};

export default Instructors;
