import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Users, DollarSign, TrendingUp, Award, Clock,
  PlusCircle, Edit, Trash2, Eye, Upload, FileText, Send, MessageCircle,
  ChevronRight, X, Save, BarChart3, Star, Calendar, Mail, Sparkles
} from "lucide-react";

// ---------- Mock Data (stored in localStorage) ----------
const getCourses = () => {
  const stored = localStorage.getItem("instructor_courses");
  if (stored) return JSON.parse(stored);
  const defaultCourses = [
    { id: "c1", title: "React Masterclass", description: "Learn React from scratch", price: 49, status: "published", createdAt: "2025-04-01", modules: [
        { id: "m1", title: "Introduction", content: "Video intro", type: "video" },
        { id: "m2", title: "React Hooks", content: "PDF notes", type: "pdf" }
      ] },
    { id: "c2", title: "UI/UX Design", description: "Figma prototyping", price: 39, status: "draft", createdAt: "2025-04-10", modules: [] }
  ];
  localStorage.setItem("instructor_courses", JSON.stringify(defaultCourses));
  return defaultCourses;
};

const getEnrollments = () => {
  const stored = localStorage.getItem("instructor_enrollments");
  if (stored) return JSON.parse(stored);
  const defaultEnrollments = [
    { id: "e1", courseId: "c1", studentName: "John Doe", studentEmail: "john@example.com", progress: 65, grade: "A", enrolledAt: "2025-04-15" },
    { id: "e2", courseId: "c1", studentName: "Jane Smith", studentEmail: "jane@example.com", progress: 40, grade: "B+", enrolledAt: "2025-04-20" }
  ];
  localStorage.setItem("instructor_enrollments", JSON.stringify(defaultEnrollments));
  return defaultEnrollments;
};

const getEarnings = () => {
  const stored = localStorage.getItem("instructor_earnings");
  if (stored) return JSON.parse(stored);
  const defaultEarnings = { total: 2450, monthly: [320, 450, 580, 620, 480], pending: 150 };
  localStorage.setItem("instructor_earnings", JSON.stringify(defaultEarnings));
  return defaultEarnings;
};

const getAnnouncements = () => {
  const stored = localStorage.getItem("instructor_announcements");
  if (stored) return JSON.parse(stored);
  const defaultAnnouncements = [
    { id: "a1", courseId: "c1", title: "Welcome to React course", content: "Please complete the introduction module.", date: "2025-04-16" }
  ];
  localStorage.setItem("instructor_announcements", JSON.stringify(defaultAnnouncements));
  return defaultAnnouncements;
};

const getMessages = () => {
  const stored = localStorage.getItem("instructor_messages");
  if (stored) return JSON.parse(stored);
  const defaultMessages = [
    { id: "m1", courseId: "c1", from: "John Doe", message: "When is the deadline?", date: "2025-04-18" }
  ];
  localStorage.setItem("instructor_messages", JSON.stringify(defaultMessages));
  return defaultMessages;
};

// ---------- Helper Functions ----------
const saveCourses = (courses) => localStorage.setItem("instructor_courses", JSON.stringify(courses));
const saveEnrollments = (enrollments) => localStorage.setItem("instructor_enrollments", JSON.stringify(enrollments));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
};
const cardHover = { scale: 1.02, transition: { type: "spring", stiffness: 300 } };
const modalVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", damping: 15, stiffness: 300 } },
  exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } }
};
const tabVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, type: "spring" } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

// ---------- Main Component ----------
const InstructorDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [earnings, setEarnings] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: "", description: "", price: 0, status: "draft" });
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [selectedCourseForModule, setSelectedCourseForModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({ title: "", content: "", type: "video" });
  const [editingModule, setEditingModule] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeValue, setGradeValue] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ courseId: "", title: "", content: "" });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageReply, setMessageReply] = useState("");

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      loadData();
      setLoading(false);
    }, 800);
  }, []);

  const loadData = () => {
    setCourses(getCourses());
    setEnrollments(getEnrollments());
    setEarnings(getEarnings());
    setAnnouncements(getAnnouncements());
    setMessages(getMessages());
  };

  // ----- Course CRUD -----
  const handleCreateCourse = () => {
    const newCourse = {
      id: Date.now().toString(),
      ...courseForm,
      createdAt: new Date().toISOString().split("T")[0],
      modules: [],
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    saveCourses(updated);
    setShowCourseModal(false);
    setCourseForm({ title: "", description: "", price: 0, status: "draft" });
  };

  const handleUpdateCourse = () => {
    const updated = courses.map(c => c.id === editingCourse.id ? { ...c, ...courseForm } : c);
    setCourses(updated);
    saveCourses(updated);
    setShowCourseModal(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm("Delete this course permanently?")) {
      const updated = courses.filter(c => c.id !== id);
      setCourses(updated);
      saveCourses(updated);
    }
  };

  // ----- Module CRUD -----
  const openModuleModal = (course) => {
    setSelectedCourseForModule(course);
    setModuleForm({ title: "", content: "", type: "video" });
    setEditingModule(null);
    setShowModuleModal(true);
  };

  const handleAddModule = () => {
    const newModule = { id: Date.now().toString(), ...moduleForm };
    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourseForModule.id) {
        return { ...c, modules: [...c.modules, newModule] };
      }
      return c;
    });
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setShowModuleModal(false);
  };

  const handleUpdateModule = () => {
    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourseForModule.id) {
        const updatedModules = c.modules.map(m => m.id === editingModule.id ? { ...m, ...moduleForm } : m);
        return { ...c, modules: updatedModules };
      }
      return c;
    });
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
    setShowModuleModal(false);
  };

  const handleDeleteModule = (courseId, moduleId) => {
    if (window.confirm("Delete this module?")) {
      const updatedCourses = courses.map(c => {
        if (c.id === courseId) {
          return { ...c, modules: c.modules.filter(m => m.id !== moduleId) };
        }
        return c;
      });
      setCourses(updatedCourses);
      saveCourses(updatedCourses);
    }
  };

  // ----- File Upload (mock) -----
  const handleFileUpload = (courseId, moduleId, file) => {
    alert(`Uploaded ${file.name} (mock) – you can replace with real API`);
  };

  // ----- Student Management -----
  const updateGrade = (enrollmentId, newGrade) => {
    const updated = enrollments.map(e => e.id === enrollmentId ? { ...e, grade: newGrade } : e);
    setEnrollments(updated);
    saveEnrollments(updated);
  };

  // ----- Announcements -----
  const handlePostAnnouncement = () => {
    const newAnnouncement = {
      id: Date.now().toString(),
      ...announcementForm,
      date: new Date().toISOString().split("T")[0],
    };
    setAnnouncements([...announcements, newAnnouncement]);
    localStorage.setItem("instructor_announcements", JSON.stringify([...announcements, newAnnouncement]));
    setShowAnnouncementModal(false);
    setAnnouncementForm({ courseId: "", title: "", content: "" });
  };

  // ----- Messages -----
  const handleReplyMessage = (msgId, reply) => {
    alert(`Reply sent: ${reply} (mock)`);
    setShowMessageModal(false);
  };

  // ----- Earnings & Analytics -----
  const totalStudents = enrollments.length;
  const completedCourses = courses.filter(c => c.status === "published").length;
  const avgRating = 4.7;

  // Loading skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="p-6">
      <motion.h1 variants={itemVariants} className="text-2xl font-bold mb-6">Instructor Dashboard</motion.h1>

      {/* Tabs with animated indicator */}
      <div className="flex flex-wrap gap-2 border-b mb-6 relative">
        {["dashboard", "courses", "students", "announcements", "messages"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize relative transition-colors ${activeTab === tab ? "text-orange-600" : "text-gray-500"}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
            )}
          </button>
        ))}
      </div>

      {/* Dashboard Overview Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Stats Row with hover effects */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: "Total Courses", value: courses.length, icon: BookOpen, color: "orange" },
                { label: "Students Enrolled", value: totalStudents, icon: Users, color: "blue" },
                { label: "Total Earnings", value: `$${earnings.total}`, icon: DollarSign, color: "green" },
                { label: "Avg Rating", value: avgRating, icon: Star, color: "yellow" }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 400 } }}
                  className="bg-white p-4 rounded-xl shadow-sm border cursor-pointer"
                >
                  <div className="flex justify-between">
                    <span className="text-gray-500">{stat.label}</span>
                    <stat.icon size={20} className={`text-${stat.color}-500`} />
                  </div>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                    className="h-1 bg-orange-200 rounded-full mt-2"
                  />
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div whileHover={{ y: -5 }} className="bg-white p-4 rounded-xl shadow-sm border">
                <h2 className="font-semibold mb-3">Monthly Earnings</h2>
                <div className="h-40 flex items-end gap-2">
                  {earnings.monthly?.map((val, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${val / 10}px` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      className="flex-1 bg-orange-200 rounded-t relative group"
                      style={{ height: `${val / 10}px` }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-xs bg-black text-white px-1 rounded">${val}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="bg-white p-4 rounded-xl shadow-sm border">
                <h2 className="font-semibold mb-3">Course Analytics</h2>
                <div className="space-y-2">
                  <div><span>Published: {completedCourses}</span><div className="h-2 bg-gray-200 rounded-full mt-1"><motion.div initial={{ width: 0 }} animate={{ width: `${(completedCourses / courses.length) * 100}%` }} className="h-2 bg-green-500 rounded-full" /></div></div>
                  <div><span>Draft: {courses.length - completedCourses}</span><div className="h-2 bg-gray-200 rounded-full mt-1"><motion.div initial={{ width: 0 }} animate={{ width: `${((courses.length - completedCourses) / courses.length) * 100}%` }} className="h-2 bg-yellow-500 rounded-full" /></div></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Courses Tab */}
        {activeTab === "courses" && (
          <motion.div
            key="courses"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setEditingCourse(null); setCourseForm({ title: "", description: "", price: 0, status: "draft" }); setShowCourseModal(true); }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <PlusCircle size={18} /> Create New Course
            </motion.button>
            <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-4">
              {courses.map((course, idx) => (
                <motion.div
                  key={course.id}
                  variants={itemVariants}
                  whileHover="hover"
                  custom={idx}
                  className="bg-white rounded-xl border p-4 shadow-sm cursor-pointer"
                >
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{course.title}</h3>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`text-xs px-2 py-1 rounded ${course.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {course.status}
                    </motion.span>
                  </div>
                  <p className="text-gray-500 text-sm">{course.description}</p>
                  <p className="text-orange-600 font-bold mt-1">${course.price}</p>
                  <div className="flex gap-2 mt-3">
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => { setEditingCourse(course); setCourseForm(course); setShowCourseModal(true); }} className="text-blue-600"><Edit size={16} /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleDeleteCourse(course.id)} className="text-red-600"><Trash2 size={16} /></motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} onClick={() => openModuleModal(course)} className="text-green-600"><PlusCircle size={16} /> Module</motion.button>
                  </div>
                  {/* Modules list */}
                  {course.modules?.length > 0 && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 pt-2 border-t">
                      <p className="text-xs font-semibold">Modules:</p>
                      {course.modules.map(module => (
                        <div key={module.id} className="flex justify-between items-center text-sm mt-1">
                          <span>{module.title} ({module.type})</span>
                          <div>
                            <button onClick={() => { setSelectedCourseForModule(course); setEditingModule(module); setModuleForm(module); setShowModuleModal(true); }} className="text-blue-500 mr-1"><Edit size={12} /></button>
                            <button onClick={() => handleDeleteModule(course.id, module.id)} className="text-red-500"><Trash2 size={12} /></button>
                            <label className="ml-2 cursor-pointer text-gray-400"><Upload size={12} /><input type="file" className="hidden" onChange={(e) => handleFileUpload(course.id, module.id, e.target.files[0])} /></label>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <motion.div
            key="students"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <table className="min-w-full bg-white rounded-xl border overflow-hidden">
              <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left">Student</th><th className="px-4 py-2 text-left">Course</th><th className="px-4 py-2 text-left">Progress</th><th className="px-4 py-2 text-left">Grade</th><th className="px-4 py-2 text-left">Actions</th></tr></thead>
              <tbody>
                {enrollments.map(enrollment => {
                  const course = courses.find(c => c.id === enrollment.courseId);
                  return (
                    <motion.tr
                      key={enrollment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: enrollment.id * 0.05 }}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-2">{enrollment.studentName}<br/><span className="text-xs text-gray-400">{enrollment.studentEmail}</span></td>
                      <td className="px-4 py-2">{course?.title || "—"}</td>
                      <td className="px-4 py-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${enrollment.progress}%` }}
                            transition={{ duration: 1 }}
                            className="bg-orange-500 h-2 rounded-full"
                          />
                        </div>
                        <span className="text-xs">{enrollment.progress}%</span>
                      </td>
                      <td className="px-4 py-2">{enrollment.grade}</td>
                      <td className="px-4 py-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => { setSelectedStudent(enrollment); setGradeValue(enrollment.grade); setShowStudentModal(true); }}
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm"
                        >
                          Assign Grade
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <motion.div
            key="announcements"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAnnouncementModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg mb-4 flex items-center gap-2 shadow-md"
            >
              <Send size={16} /> Post Announcement
            </motion.button>
            <div className="space-y-3">
              {announcements.map((ann, idx) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white p-4 rounded-xl border"
                >
                  <h3 className="font-semibold">{ann.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{ann.content}</p>
                  <div className="flex justify-between mt-2 text-xs text-gray-400">
                    <span>Course: {courses.find(c => c.id === ann.courseId)?.title || "All"}</span>
                    <span>{ann.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <motion.div
            key="messages"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white p-4 rounded-xl border"
                >
                  <div className="flex justify-between"><span className="font-semibold">{msg.from}</span><span className="text-xs text-gray-400">{msg.date}</span></div>
                  <p className="text-gray-600 mt-1">{msg.message}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => { setSelectedStudent(msg); setMessageReply(""); setShowMessageModal(true); }}
                    className="mt-2 text-blue-600 text-sm flex items-center gap-1"
                  >
                    <MessageCircle size={14} /> Reply
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ----- MODALS WITH ANIMATIONS ----- */}
      <AnimatePresence>
        {showCourseModal && (
          <Modal onClose={() => setShowCourseModal(false)} title={editingCourse ? "Edit Course" : "Create Course"}>
            <input type="text" placeholder="Title" className="w-full p-2 border rounded mb-2" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} />
            <textarea placeholder="Description" className="w-full p-2 border rounded mb-2" rows="3" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} />
            <input type="number" placeholder="Price ($)" className="w-full p-2 border rounded mb-2" value={courseForm.price} onChange={e => setCourseForm({...courseForm, price: Number(e.target.value)})} />
            <select className="w-full p-2 border rounded mb-4" value={courseForm.status} onChange={e => setCourseForm({...courseForm, status: e.target.value})}>
              <option value="draft">Draft</option><option value="published">Published</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
              className="w-full bg-orange-600 text-white py-2 rounded-lg"
            >
              {editingCourse ? "Update" : "Create"}
            </motion.button>
          </Modal>
        )}
        {showModuleModal && (
          <Modal onClose={() => setShowModuleModal(false)} title={editingModule ? "Edit Module" : "Add Module"}>
            <input type="text" placeholder="Module Title" className="w-full p-2 border rounded mb-2" value={moduleForm.title} onChange={e => setModuleForm({...moduleForm, title: e.target.value})} />
            <input type="text" placeholder="Content URL / Text" className="w-full p-2 border rounded mb-2" value={moduleForm.content} onChange={e => setModuleForm({...moduleForm, content: e.target.value})} />
            <select className="w-full p-2 border rounded mb-4" value={moduleForm.type} onChange={e => setModuleForm({...moduleForm, type: e.target.value})}>
              <option value="video">Video</option><option value="pdf">PDF</option><option value="quiz">Quiz</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={editingModule ? handleUpdateModule : handleAddModule}
              className="w-full bg-orange-600 text-white py-2 rounded-lg"
            >
              {editingModule ? "Update" : "Add"}
            </motion.button>
          </Modal>
        )}
        {showStudentModal && selectedStudent && (
          <Modal onClose={() => setShowStudentModal(false)} title="Assign Grade">
            <p>Student: {selectedStudent.studentName}</p>
            <p>Course: {courses.find(c => c.id === selectedStudent.courseId)?.title}</p>
            <label className="block mt-2">Grade</label>
            <input type="text" placeholder="e.g., A, B+, 85%" className="w-full p-2 border rounded mt-1" value={gradeValue} onChange={e => setGradeValue(e.target.value)} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { updateGrade(selectedStudent.id, gradeValue); setShowStudentModal(false); }}
              className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg"
            >
              Save Grade
            </motion.button>
          </Modal>
        )}
        {showAnnouncementModal && (
          <Modal onClose={() => setShowAnnouncementModal(false)} title="Post Announcement">
            <select className="w-full p-2 border rounded mb-2" value={announcementForm.courseId} onChange={e => setAnnouncementForm({...announcementForm, courseId: e.target.value})}>
              <option value="">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <input type="text" placeholder="Title" className="w-full p-2 border rounded mb-2" value={announcementForm.title} onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})} />
            <textarea placeholder="Content" className="w-full p-2 border rounded mb-4" rows="3" value={announcementForm.content} onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePostAnnouncement}
              className="w-full bg-orange-600 text-white py-2 rounded-lg"
            >
              Post
            </motion.button>
          </Modal>
        )}
        {showMessageModal && selectedStudent && (
          <Modal onClose={() => setShowMessageModal(false)} title="Reply to Message">
            <p className="text-gray-600 mb-2">Original: {selectedStudent.message}</p>
            <textarea placeholder="Your reply..." className="w-full p-2 border rounded mb-4" rows="3" value={messageReply} onChange={e => setMessageReply(e.target.value)} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleReplyMessage(selectedStudent.id, messageReply)}
              className="w-full bg-orange-600 text-white py-2 rounded-lg"
            >
              Send Reply
            </motion.button>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Reusable Modal with Animation
const Modal = ({ children, title, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
    <motion.div
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose}>
          <X size={20} />
        </motion.button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

export default InstructorDashboard;