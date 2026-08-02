// src/pages/admin/Courses.jsx (updated version)
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, CheckCircle, XCircle, Trash2, FileText, Loader2, AlertCircle } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Courses = () => {
  const { user } = useAuth();
  const userRole = user?.role || 'admin';
  const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';
  const permissions = user?.permissions || [];

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Check if user has specific permission
  const hasPermission = (permission) => {
    return isSuperAdmin || permissions.includes(permission);
  };

  // Fetch courses from API when component mounts
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[Courses] Fetching courses from new API endpoint...');
      const response = await adminApi.getCourses();
      console.log('[Courses] API Response:', response);
      
      // Handle different response structures
      let courseData = response.data || response;
      if (!Array.isArray(courseData)) {
        if (courseData.courses) courseData = courseData.courses;
        else if (courseData.items) courseData = courseData.items;
        else if (courseData.content) courseData = courseData.content;
        else courseData = [courseData];
      }
      
      // Transform API data to match component structure
      const transformedCourses = courseData.map(course => ({
        id: course.id || course._id || course.courseId,
        title: course.title || course.name || course.courseName || 'Untitled Course',
        instructor: course.instructorName || course.instructor || course.instructorId || 'Unknown',
        price: course.price || course.cost || 0,
        status: course.status || course.approvalStatus || 'pending',
        students: course.students || course.enrolledCount || 0,
        category: course.category || course.subject || 'General',
        createdAt: course.createdAt || course.createdDate || new Date().toLocaleDateString()
      }));
      
      setCourses(transformedCourses);
      console.log('[Courses] Courses loaded successfully:', transformedCourses.length);
    } catch (err) {
      console.error('[Courses] Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Handle approve course
  const handleApprove = async (id) => {
    if (!hasPermission('courses:approve')) {
      toast.error('You do not have permission to approve courses');
      return;
    }
    try {
      await adminApi.approveCourse(id);
      const updated = courses.map(course =>
        course.id === id ? { ...course, status: 'approved' } : course
      );
      setCourses(updated);
      toast.success('Course approved successfully');
    } catch (err) {
      console.error('[Courses] Error approving course:', err);
      toast.error('Failed to approve course');
    }
  };

  // Handle reject course
  const handleReject = async (id) => {
    if (!hasPermission('courses:approve')) {
      toast.error('You do not have permission to reject courses');
      return;
    }
    try {
      await adminApi.rejectCourse(id);
      const updated = courses.map(course =>
        course.id === id ? { ...course, status: 'rejected' } : course
      );
      setCourses(updated);
      toast.success('Course rejected successfully');
    } catch (err) {
      console.error('[Courses] Error rejecting course:', err);
      toast.error('Failed to reject course');
    }
  };

  // Handle delete course
  const handleDelete = async (id) => {
    if (!hasPermission('courses:edit')) {
      toast.error('You do not have permission to delete courses');
      return;
    }
    if (!window.confirm("Delete this course permanently?")) return;
    
    try {
      await adminApi.deleteCourse(id);
      const updated = courses.filter(course => course.id !== id);
      setCourses(updated);
      toast.success('Course deleted successfully');
    } catch (err) {
      console.error('[Courses] Error deleting course:', err);
      toast.error('Failed to delete course');
    }
  };

  // Handle view course content
  const handleViewContent = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Courses</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchCourses}
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
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-gray-500 text-sm">Approve, reject, and manage courses</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-xl border">
            <span className="text-sm text-gray-500">Total: </span>
            <span className="font-semibold">{courses.length}</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border">
            <span className="text-sm text-gray-500">Pending: </span>
            <span className="font-semibold text-yellow-600">{courses.filter(c => c.status === 'pending').length}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Total Courses</p>
          <p className="text-2xl font-bold">{courses.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-green-600">{courses.filter(c => c.status === 'approved').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{courses.filter(c => c.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <p className="text-sm text-gray-500">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{courses.filter(c => c.status === 'rejected').length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{course.title}</td>
                <td className="px-6 py-4 text-sm">{course.instructor}</td>
                <td className="px-6 py-4 text-sm">{course.category}</td>
                <td className="px-6 py-4 text-sm">${course.price}</td>
                <td className="px-6 py-4 text-sm">{course.students}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    course.status === "approved" ? "bg-green-100 text-green-700" :
                    course.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {course.status || "pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button 
                    onClick={() => handleViewContent(course)} 
                    className="p-1 text-gray-400 hover:text-blue-600"
                    title="View Details"
                  >
                    <FileText size={16} />
                  </button>
                  {hasPermission('courses:approve') && course.status !== "approved" && (
                    <button 
                      onClick={() => handleApprove(course.id)} 
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Approve"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  {hasPermission('courses:approve') && course.status !== "rejected" && (
                    <button 
                      onClick={() => handleReject(course.id)} 
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Reject"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                  {hasPermission('courses:edit') && (
                    <button 
                      onClick={() => handleDelete(course.id)} 
                      className="p-1 text-gray-400 hover:text-red-600"
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

      {/* Course Details Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Course Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Title</p>
                <p className="font-semibold">{selectedCourse.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Instructor</p>
                <p className="font-semibold">{selectedCourse.instructor}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-semibold">{selectedCourse.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-semibold">${selectedCourse.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Students Enrolled</p>
                <p className="font-semibold">{selectedCourse.students}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selectedCourse.status === "approved" ? "bg-green-100 text-green-700" :
                  selectedCourse.status === "rejected" ? "bg-red-100 text-red-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {selectedCourse.status || "pending"}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="font-semibold">{selectedCourse.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Courses;