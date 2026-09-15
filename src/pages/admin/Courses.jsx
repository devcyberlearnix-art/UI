// src/pages/admin/Courses.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, CheckCircle, XCircle, Trash2, FileText, Loader2, AlertCircle, Plus, Sparkles, RefreshCw, Edit } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { instructorApi } from "../../api/instructorApi";
import { courseApi } from "../../api/courseApi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const CATEGORIES = ["Development", "Design", "Business", "Marketing", "Data Science", "Photography", "Music", "Other"];
const LEVELS     = ["Beginner", "Intermediate", "Advanced", "All Levels"];

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

  // Admin Create Course Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    category: "Development",
    level: "Beginner",
    price: "",
    language: "English",
  });

  // Admin Edit Course Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "Development",
    level: "Beginner",
    price: "",
    language: "English",
  });

  // Admin Quick Patch State (PATCH /api/v1/courses/:id)
  const [showPatchModal, setShowPatchModal] = useState(false);
  const [patchingCourseId, setPatchingCourseId] = useState(null);
  const [patchPrice, setPatchPrice] = useState("");
  const [patching, setPatching] = useState(false);

  const updateCreate = (field, val) => setCreateForm(prev => ({ ...prev, [field]: val }));
  const updateEdit = (field, val) => setEditForm(prev => ({ ...prev, [field]: val }));

  const handleOpenPatchPrice = (course) => {
    setPatchingCourseId(course.id);
    setPatchPrice(course.price != null ? String(course.price) : "899.99");
    setShowPatchModal(true);
  };

  const handleAdminPatchCourse = async (e) => {
    if (e) e.preventDefault();
    if (!patchingCourseId) return;

    setPatching(true);
    try {
      const priceNum = parseFloat(patchPrice);
      const patchData = { price: isNaN(priceNum) ? 899.99 : priceNum };

      // Call PATCH /api/v1/courses/{courseId} API
      await courseApi.patchCourse(patchingCourseId, patchData);

      // Update real-time local storage array `lms_custom_courses`
      const localCourses = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const updatedList = localCourses.map(c => {
        if (String(c.id) === String(patchingCourseId) || String(c._id) === String(patchingCourseId)) {
          return { ...c, ...patchData };
        }
        return c;
      });
      localStorage.setItem("lms_custom_courses", JSON.stringify(updatedList));

      // Update React state
      setCourses(prev => prev.map(c => {
        if (String(c.id) === String(patchingCourseId)) {
          return { ...c, ...patchData };
        }
        return c;
      }));

      setShowPatchModal(false);
      toast.success(`Partial Update (PATCH /api/v1/courses/${patchingCourseId}) Successful! New Price: ₹${patchData.price}`);
    } catch (err) {
      toast.error(err.message || "Failed partial update");
    } finally {
      setPatching(false);
    }
  };

  const hasPermission = (permission) => {
    return isSuperAdmin || permissions.includes(permission);
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      let apiCourses = [];
      try {
        const response = await adminApi.getCourses();
        let courseData = response?.data || response || [];
        if (!Array.isArray(courseData)) {
          if (Array.isArray(courseData.courses)) courseData = courseData.courses;
          else if (Array.isArray(courseData.items)) courseData = courseData.items;
          else if (Array.isArray(courseData.content)) courseData = courseData.content;
          else if (Array.isArray(courseData.data)) courseData = courseData.data;
          else if (typeof courseData === 'object' && courseData !== null && (courseData.id || courseData.title || courseData._id)) courseData = [courseData];
          else courseData = [];
        }
        apiCourses = courseData;
      } catch (e) {
        console.warn("[Admin Courses] API getCourses failed, using local storage cache");
      }

      const localCourses = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");

      const map = new Map();
      localCourses.forEach(c => map.set(c.id || c.title, c));
      apiCourses.forEach(c => {
        const key = c.id || c._id || c.title;
        if (!map.has(key)) map.set(key, c);
      });

      const allCourses = Array.from(map.values());
      const transformedCourses = allCourses.map(course => ({
        id: course.id || course._id || course.courseId || `course_${Math.random()}`,
        title: course.title || course.name || course.courseName || 'Untitled Course',
        description: course.description || '',
        instructor: course.instructorName || course.instructor || course.instructorId || 'Instructor',
        price: course.price || course.cost || 0,
        status: String(course.status || course.approvalStatus || 'approved').toLowerCase(),
        students: course.students || course.enrolledCount || 0,
        category: course.category || course.subject || 'General',
        level: course.level || 'Beginner',
        language: course.language || 'English',
        createdAt: course.createdAt || course.createdDate || new Date().toLocaleDateString()
      }));
      
      setCourses(transformedCourses);
    } catch (err) {
      console.error('[Courses] Error fetching courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdminCreateCourse = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) return toast.error("Course title is required");
    if (!createForm.description.trim()) return toast.error("Description is required");

    setCreating(true);
    try {
      const newId = "course_" + Date.now();
      const payload = {
        id:          newId,
        title:       createForm.title.trim(),
        description: createForm.description.trim(),
        category:    createForm.category,
        level:       createForm.level,
        price:       parseFloat(createForm.price) || 0,
        language:    createForm.language,
        status:      "approved",
        createdAt:   new Date().toLocaleDateString(),
        instructorName: user?.name || user?.firstName || "Admin",
      };

      try {
        await instructorApi.createCourse(user?.id || "admin", payload);
      } catch (err) {
        console.warn("[Admin] API createCourse mock fallback");
      }

      // Persist in real-time local storage cache
      const existing = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const updatedList = [payload, ...existing.filter(c => c.id !== newId)];
      localStorage.setItem("lms_custom_courses", JSON.stringify(updatedList));

      // Update state immediately
      setCourses(prev => [payload, ...prev]);
      setShowCreateModal(false);
      setCreateForm({
        title: "",
        description: "",
        category: "Development",
        level: "Beginner",
        price: "",
        language: "English",
      });
      toast.success("Course created and published successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenEdit = (course) => {
    setEditingCourseId(course.id);
    setEditForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "Development",
      level: course.level || "Beginner",
      price: course.price != null ? String(course.price) : "",
      language: course.language || "English",
    });
    setShowEditModal(true);
  };

  const handleAdminUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) return toast.error("Course title is required");

    setUpdating(true);
    try {
      const payload = {
        title:       editForm.title.trim(),
        description: editForm.description.trim(),
        category:    editForm.category,
        level:       editForm.level,
        price:       parseFloat(editForm.price) || 0,
        language:    editForm.language,
      };

      // Call PUT /api/v1/courses/:courseId
      try {
        await courseApi.updateCourse(editingCourseId, payload);
      } catch (err) {
        try {
          await adminApi.updateCourse(editingCourseId, payload);
        } catch (e) {
          console.warn("[Admin Courses] PUT API updateCourse failed, updating locally");
        }
      }

      // Update real-time local storage array `lms_custom_courses`
      const localCourses = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const updatedList = localCourses.map(c => {
        if (String(c.id) === String(editingCourseId) || String(c._id) === String(editingCourseId)) {
          return { ...c, ...payload };
        }
        return c;
      });
      localStorage.setItem("lms_custom_courses", JSON.stringify(updatedList));

      // Update React state
      setCourses(prev => prev.map(c => {
        if (c.id === editingCourseId) {
          return { ...c, ...payload };
        }
        return c;
      }));

      setShowEditModal(false);
      toast.success("Course updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update course");
    } finally {
      setUpdating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      try { await adminApi.approveCourse(id); } catch (e) {}
      const updated = courses.map(course =>
        course.id === id ? { ...course, status: 'approved' } : course
      );
      setCourses(updated);
      toast.success('Course approved successfully');
    } catch (err) {
      toast.error('Failed to approve course');
    }
  };

  const handleReject = async (id) => {
    try {
      try { await adminApi.rejectCourse(id); } catch (e) {}
      const updated = courses.map(course =>
        course.id === id ? { ...course, status: 'rejected' } : course
      );
      setCourses(updated);
      toast.success('Course rejected successfully');
    } catch (err) {
      toast.error('Failed to reject course');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this course permanently?")) return;
    try {
      try { await adminApi.deleteCourse(id); } catch (e) {}
      
      const localList = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
      const filtered = localList.filter(c => String(c.id) !== String(id));
      localStorage.setItem("lms_custom_courses", JSON.stringify(filtered));

      setCourses(courses.filter(course => course.id !== id));
      toast.success('Course deleted successfully');
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const [contentLoading, setContentLoading] = useState(false);
  const [courseContentData, setCourseContentData] = useState(null);

  const handleViewContent = async (course) => {
    setSelectedCourse(course);
    setShowModal(true);
    setContentLoading(true);
    setCourseContentData(null);

    try {
      // GET /api/v1/admin/content/:courseId
      const res = await adminApi.getCourseContent(course.id);
      const data = res?.data || res;
      setCourseContentData(data);
    } catch (err) {
      console.warn("[Courses] Failed to fetch course content from API", err);
    } finally {
      setContentLoading(false);
    }
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-gray-500 text-sm">Approve, edit, publish, and manage real-time courses</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCourses}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition font-semibold text-sm shadow-md shadow-orange-100"
          >
            <Plus size={18} />
            Create Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Courses</p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{courses.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Published / Approved</p>
          <p className="text-2xl font-bold mt-1 text-green-600">{courses.filter(c => c.status === 'approved' || c.status === 'published').length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Pending Review</p>
          <p className="text-2xl font-bold mt-1 text-yellow-600">{courses.filter(c => c.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Rejected</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{courses.filter(c => c.status === 'rejected').length}</p>
        </div>
      </div>

      {/* Course Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Instructor</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Students</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-orange-50/30 transition">
                <td 
                  className="px-6 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:text-orange-600 transition"
                  onClick={() => handleOpenEdit(course)}
                  title="Click to Edit Course"
                >
                  {course.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{course.instructor}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{course.category}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                  <div className="flex items-center gap-1.5">
                    <span>₹{course.price}</span>
                    <button
                      onClick={() => handleOpenPatchPrice(course)}
                      className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-md transition"
                      title="Quick Partial Update Price (PATCH /api/v1/courses/:id)"
                    >
                      PATCH
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{course.students}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                    course.status === "approved" || course.status === "published" ? "bg-green-100 text-green-700" :
                    course.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {course.status || "approved"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-1.5">
                  <button 
                    onClick={() => handleOpenEdit(course)} 
                    className="px-2.5 py-1 text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition inline-flex items-center gap-1 border border-orange-200"
                    title="Edit / Update Course (PUT API)"
                  >
                    <Edit size={13} />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleOpenPatchPrice(course)} 
                    className="px-2.5 py-1 text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition inline-flex items-center gap-1 border border-amber-200"
                    title="Quick Patch Price (PATCH /api/v1/courses/:id)"
                  >
                    <Sparkles size={13} />
                    <span>Patch</span>
                  </button>
                  <button 
                    onClick={() => handleViewContent(course)} 
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                    title="View Details"
                  >
                    <FileText size={16} />
                  </button>
                  {course.status !== "approved" && (
                    <button 
                      onClick={() => handleApprove(course.id)} 
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Approve"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  {course.status !== "rejected" && (
                    <button 
                      onClick={() => handleReject(course.id)} 
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Reject"
                    >
                      <XCircle size={16} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(course.id)} 
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  No courses found. Click "+ Create Course" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT COURSE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Edit size={18} className="text-orange-500" /> Edit & Update Course (PUT /api/v1/courses/:id)
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleAdminUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => updateEdit("title", e.target.value)}
                  placeholder="Course Title"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => updateEdit("description", e.target.value)}
                  placeholder="Course description..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => updateEdit("category", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Skill Level</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => updateEdit("level", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                  >
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => updateEdit("price", e.target.value)}
                    placeholder="1299.99"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
                  <select
                    value={editForm.language}
                    onChange={(e) => updateEdit("language", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                  >
                    {["English", "Hindi", "Telugu", "Tamil", "Kannada"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 shadow-md shadow-orange-100"
                >
                  {updating ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* QUICK PATCH PRICE MODAL (PATCH /api/v1/courses/:id) */}
      {showPatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-amber-500" /> Partial Course Update (PATCH API)
              </h2>
              <button onClick={() => setShowPatchModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            <p className="text-xs text-gray-500">
              Triggers <code className="bg-gray-100 px-1.5 py-0.5 rounded text-amber-600 font-mono">PATCH /api/v1/courses/{patchingCourseId}</code> with partial JSON data <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono">&#123;"price": {patchPrice || 899.99}&#125;</code>.
            </p>

            <form onSubmit={handleAdminPatchCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Update Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={patchPrice}
                  onChange={(e) => setPatchPrice(e.target.value)}
                  placeholder="899.99"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-400 text-sm font-semibold"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPatchModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patching}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 shadow-md shadow-amber-100"
                >
                  {patching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  Send Partial PATCH
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CREATE COURSE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-gray-100 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-orange-500" /> Create New Course
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleAdminCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => updateCreate("title", e.target.value)}
                  placeholder="e.g. Advanced System Architecture"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => updateCreate("description", e.target.value)}
                  placeholder="Course content summary..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => updateCreate("category", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Skill Level</label>
                  <select
                    value={createForm.level}
                    onChange={(e) => updateCreate("level", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                  >
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.price}
                    onChange={(e) => updateCreate("price", e.target.value)}
                    placeholder="1499.99"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Language</label>
                  <select
                    value={createForm.language}
                    onChange={(e) => updateCreate("language", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 text-sm bg-white"
                  >
                    {["English", "Hindi", "Telugu", "Tamil", "Kannada"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-60 shadow-md shadow-orange-100"
                >
                  {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Publish Course
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Course Details Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText size={18} className="text-orange-500" /> Course Content & Details
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleOpenEdit(selectedCourse);
                  }}
                  className="px-3 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Edit size={14} /> Edit Course
                </button>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
              </div>
            </div>

            {contentLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <Loader2 size={24} className="animate-spin text-orange-500" />
                <p className="text-xs text-gray-500">Loading course content...</p>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Course Title</p>
                  <p className="font-semibold text-gray-900 text-base">{selectedCourse.title}</p>
                </div>
                {courseContentData?.description && (
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Description</p>
                    <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{courseContentData.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Instructor</p>
                    <p className="font-semibold text-gray-900">{selectedCourse.instructor}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Category</p>
                    <p className="font-semibold text-gray-900">{selectedCourse.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Price</p>
                    <p className="font-semibold text-gray-900">₹{selectedCourse.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase">Status</p>
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-700 inline-block mt-0.5">
                      {selectedCourse.status}
                    </span>
                  </div>
                </div>

                {courseContentData?.sections && courseContentData.sections.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-700 uppercase">Syllabus & Sections</p>
                    <div className="space-y-2">
                      {courseContentData.sections.map((sec, idx) => (
                        <div key={sec.id || idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="font-semibold text-xs text-gray-900">{sec.title || `Section ${idx + 1}`}</p>
                          {sec.lectures && (
                            <p className="text-xs text-gray-500 mt-0.5">{sec.lectures.length} Lectures</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Courses;