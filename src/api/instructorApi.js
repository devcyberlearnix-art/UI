
const resolveInstructorId = (id) => {
  if (id && id !== 'me') return id;
  try {
    const u = JSON.parse(localStorage.getItem('lms_user') || '{}');
    if (u.id) return u.id;
    if (u.userId) return u.userId;
  } catch (e) {}
  return id;
};
import axiosInstance from "./axiosInstance";

export const instructorApi = {

  // ======================== PROFILE ========================

  // GET /api/v1/instructors/me
  // Returns the current instructor's profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/users/me");
      return response.data;
    } catch (err) {
      console.warn("[instructorApi] GET /api/v1/users/me failed:", err);
      throw err;
    }
  },

  // ======================== COURSE MANAGEMENT ========================

  // POST /api/v1/instructors/{instructorId}/courses
  // Body: { title, description, price }
  createCourse: async (instructorId, courseData) => {
    const id = resolveInstructorId(instructorId);
    try {
      const response = await axiosInstance.post(
        `/api/v1/instructors/${id}/courses`,
        courseData
      );
      return response.data;
    } catch (err) {
      console.warn('[instructorApi] Instructor path createCourse failed, trying global /api/v1/courses...');
      const fallback = await axiosInstance.post(`/api/v1/courses`, { ...courseData, instructorId: id });
      return fallback.data;
    }
  },

  // GET /api/v1/instructors/{instructorId}/courses
  // Returns all courses created by the instructor
  getCourses: async (instructorId) => {
    const id = resolveInstructorId(instructorId);
    try {
      const response = await axiosInstance.get(
        `/api/v1/instructors/${id}/courses`
      );
      return response.data;
    } catch (err) {
      console.warn('[instructorApi] Instructor getCourses failed, trying global endpoints...');
      try {
        const fallback1 = await axiosInstance.get('/api/v1/courses');
        return fallback1.data;
      } catch (err1) {
        return [];
      }
    }
  },

  // GET /api/v1/instructors/{instructorId}/courses/{courseId}
  // Returns a single course by ID
  getCourseById: async (instructorId, courseId) => {
    const id = resolveInstructorId(instructorId);
    try {
      const response = await axiosInstance.get(
        `/api/v1/instructors/${id}/courses/${courseId}`
      );
      return response.data;
    } catch (err) {
      console.warn('[instructorApi] /instructors/.../courses/:id failed, trying GET /api/v1/courses/:id...');
      const fallback = await axiosInstance.get(`/api/v1/courses/${courseId}`);
      return fallback.data;
    }
  },

  // PUT /api/v1/instructors/{instructorId}/courses/{courseId}
  // Body: partial course data e.g. { price: 1299.99 }
  updateCourse: async (instructorId, courseId, courseData) => {
    const response = await axiosInstance.put(
      `/api/v1/instructors/${instructorId}/courses/${courseId}`,
      courseData
    );
    return response.data;
  },

  // DELETE /api/v1/instructors/{instructorId}/courses/{courseId}
  deleteCourse: async (instructorId, courseId) => {
    const response = await axiosInstance.delete(
      `/api/v1/instructors/${instructorId}/courses/${courseId}`
    );
    return response.data;
  },

  // ======================== STUDENT MANAGEMENT ========================

  // GET /api/v1/instructors/{instructorId}/courses/{courseId}/students
  // Returns list of all students enrolled in a specific course
  getCourseStudents: async (instructorId, courseId) => {
    const response = await axiosInstance.get(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/students`
    );
    return response.data;
  },

  // GET /api/v1/instructors/{instructorId}/courses/{courseId}/students/{studentId}
  // Returns a specific student's details within a course
  getStudentDetail: async (instructorId, courseId, studentId) => {
    const response = await axiosInstance.get(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/students/${studentId}`
    );
    return response.data;
  },

  // ======================== APPLICATION ========================

  // POST /api/v1/instructors/applications
  // Apply to become an instructor (student flow)
  applyForInstructor: async (formData) => {
    const response = await axiosInstance.post(
      "/api/v1/instructors/applications",
      formData
    );
    return response.data;
  },

  // GET /api/v1/instructors/applications/me
  // Returns the current logged-in user's instructor application details
  // Curl reference: GET https://matted-ascent-specimen.ngrok-free.dev/api/v1/instructors/applications/me
  getMyApplication: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/instructors/applications/me");
      return response.data;
    } catch (err) {
      console.warn('[instructorApi] GET /api/v1/instructors/applications/me failed, trying /my-status and /applications fallbacks...');
      try {
        const fallback1 = await axiosInstance.get("/api/v1/instructors/applications/my-status");
        return fallback1.data;
      } catch (err1) {
        const fallback2 = await axiosInstance.get("/api/v1/instructors/applications");
        return fallback2.data;
      }
    }
  },

  // GET /api/v1/instructors/applications/my-status
  // Returns the current logged-in student's instructor application status
  // Response shape: { success, data: { applicationId, status, submittedAt, reviewMessage } }
  getMyApplicationStatus: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/instructors/applications/me");
      return response.data;
    } catch (err) {
      const response = await axiosInstance.get("/api/v1/instructors/applications/my-status");
      return response.data;
    }
  },

  // GET /api/v1/instructors/applications
  // Returns list of all applications by the logged-in user
  getMyApplications: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/instructors/applications/me");
      return response.data;
    } catch (err) {
      const response = await axiosInstance.get("/api/v1/instructors/applications");
      return response.data;
    }
  },

  // ======================== MEDIA UPLOADS ========================

  // POST /api/v1/instructors/{instructorId}/courses/{courseId}/thumbnail
  uploadThumbnail: async (instructorId, courseId, file) => {
    const formData = new FormData();
    formData.append("thumbnail", file);
    const response = await axiosInstance.post(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/thumbnail`,
      formData
    );
    return response.data;
  },

  // POST /api/v1/instructors/{instructorId}/courses/{courseId}/lessons/{lessonId}/video
  uploadVideo: async (instructorId, courseId, lessonId, file) => {
    const formData = new FormData();
    formData.append("video", file);
    const response = await axiosInstance.post(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/lessons/${lessonId}/video`,
      formData
    );
    return response.data;
  },

  // ======================== LESSONS ========================

  // POST /api/v1/instructors/{instructorId}/courses/{courseId}/lessons
  addLesson: async (instructorId, courseId, lessonData) => {
    const response = await axiosInstance.post(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/lessons`,
      lessonData
    );
    return response.data;
  },

  // PUT /api/v1/instructors/{instructorId}/courses/{courseId}/lessons/{lessonId}
  updateLesson: async (instructorId, courseId, lessonId, lessonData) => {
    const response = await axiosInstance.put(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/lessons/${lessonId}`,
      lessonData
    );
    return response.data;
  },

  // DELETE /api/v1/instructors/{instructorId}/courses/{courseId}/lessons/{lessonId}
  deleteLesson: async (instructorId, courseId, lessonId) => {
    const response = await axiosInstance.delete(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/lessons/${lessonId}`
    );
    return response.data;
  },

  // ======================== EARNINGS & ANALYTICS ========================

  // GET /api/v1/instructors/{instructorId}/earnings
  getEarnings: async (instructorId, params = {}) => {
    const response = await axiosInstance.get(
      `/api/v1/instructors/${instructorId}/earnings`,
      { params }
    );
    return response.data;
  },

  // GET /api/v1/instructors/{instructorId}/courses/{courseId}/analytics
  getCourseAnalytics: async (instructorId, courseId) => {
    const response = await axiosInstance.get(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/analytics`
    );
    return response.data;
  },

  // GET /api/v1/instructors/{instructorId}/courses/{courseId}/reviews
  getCourseReviews: async (instructorId, courseId) => {
    const response = await axiosInstance.get(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/reviews`
    );
    return response.data;
  },

  // POST /api/v1/instructors/{instructorId}/courses/{courseId}/reviews/{reviewId}/respond
  respondToReview: async (instructorId, courseId, reviewId, message) => {
    const response = await axiosInstance.post(
      `/api/v1/instructors/${instructorId}/courses/${courseId}/reviews/${reviewId}/respond`,
      { response: message }
    );
    return response.data;
  },

  // ======================== DASHBOARD ========================

  /**
   * GET /api/v1/instructors/{id}/dashboard
   * Get instructor dashboard
   */
  getDashboard: async (instructorId) => {
    const id = resolveInstructorId(instructorId);
    try {
      const response = await axiosInstance.get(`/api/v1/instructors/${id}/dashboard`);
      return response.data;
    } catch (err) {
      console.warn(`[instructorApi] GET /api/v1/instructors/${id}/dashboard failed`);
      throw err;
    }
  },

  // ======================== GRADES ========================

  /**
   * POST /api/v1/instructors/{id}/courses/{courseId}/grades
   * Assign/update grade
   */
  assignGrade: async (instructorId, courseId, gradeData) => {
    const id = resolveInstructorId(instructorId);
    try {
      const response = await axiosInstance.post(
        `/api/v1/instructors/${id}/courses/${courseId}/grades`,
        gradeData
      );
      return response.data;
    } catch (err) {
      console.warn(`[instructorApi] POST /api/v1/instructors/${id}/courses/${courseId}/grades failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/instructors/{id}/courses/{courseId}/grades
   * Get grades by course
   */
  getCourseGrades: async (instructorId, courseId) => {
    const id = resolveInstructorId(instructorId);
    try {
      const response = await axiosInstance.get(
        `/api/v1/instructors/${id}/courses/${courseId}/grades`
      );
      return response.data;
    } catch (err) {
      console.warn(`[instructorApi] GET /api/v1/instructors/${id}/courses/${courseId}/grades failed`);
      throw err;
    }
  },

  // ======================== ANNOUNCEMENTS ========================
  createAnnouncement: async (instructorId, courseId, data) => {
    const id = resolveInstructorId(instructorId);
    const response = await axiosInstance.post(
      `/api/v1/instructors/${id}/courses/${courseId}/announcements`,
      data
    );
    return response.data;
  },

  // ======================== COURSE MESSAGES ========================
  sendCourseMessage: async (instructorId, courseId, data) => {
    const id = resolveInstructorId(instructorId);
    const response = await axiosInstance.post(
      `/api/v1/instructors/${id}/courses/${courseId}/messages`,
      data
    );
    return response.data;
  },

  // ======================== MODULES & RESOURCES ========================
  addModule: async (instructorId, courseId, data) => {
    const id = resolveInstructorId(instructorId);
    const response = await axiosInstance.post(
      `/api/v1/instructors/${id}/courses/${courseId}/modules`,
      data
    );
    return response.data;
  },

  updateModule: async (instructorId, courseId, moduleId, data) => {
    const id = resolveInstructorId(instructorId);
    const response = await axiosInstance.put(
      `/api/v1/instructors/${id}/courses/${courseId}/modules/${moduleId}`,
      data
    );
    return response.data;
  },

  deleteModule: async (instructorId, courseId, moduleId) => {
    const id = resolveInstructorId(instructorId);
    const response = await axiosInstance.delete(
      `/api/v1/instructors/${id}/courses/${courseId}/modules/${moduleId}`
    );
    return response.data;
  },

  uploadModuleResource: async (instructorId, courseId, file, type = "PDF") => {
    const id = resolveInstructorId(instructorId);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const response = await axiosInstance.post(
      `/api/v1/instructors/${id}/courses/${courseId}/modules/upload`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  // ======================== CONTENT PUBLISHING ========================
  publishContent: async (instructorId, contentId, publish = true) => {
    const id = resolveInstructorId(instructorId);
    const response = await axiosInstance.patch(
      `/api/v1/instructors/${id}/content/${contentId}/publish`,
      { publish }
    );
    return response.data;
  },

  // ======================== INSTRUCTOR PROFILE ========================
  getInstructorProfile: async (instructorId) => {
    const id = resolveInstructorId(instructorId);
    const response = await axiosInstance.get(
      `/api/v1/instructors/${id}/profile`
    );
    return response.data;
  },

  // ======================== PUBLIC COURSE ========================
  getPublicCourseById: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/courses/${courseId}`);
    return response.data;
  },
};

export default instructorApi;
