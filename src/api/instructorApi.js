import axiosInstance from "./axiosInstance";

export const instructorApi = {

  // ======================== COURSE MANAGEMENT ========================

  // POST /api/v1/instructors/{instructorId}/courses
  // Body: { title, description, price }
  createCourse: async (instructorId, courseData) => {
    const response = await axiosInstance.post(
      `/api/v1/instructors/${instructorId}/courses`,
      courseData
    );
    return response.data;
  },

  // GET /api/v1/instructors/{instructorId}/courses
  // Returns all courses created by the instructor
  getCourses: async (instructorId) => {
    const response = await axiosInstance.get(
      `/api/v1/instructors/${instructorId}/courses`
    );
    return response.data;
  },

  // GET /api/v1/instructors/{instructorId}/courses/{courseId}
  // Returns a single course by ID
  getCourseById: async (instructorId, courseId) => {
    const response = await axiosInstance.get(
      `/api/v1/instructors/${instructorId}/courses/${courseId}`
    );
    return response.data;
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

  // GET /api/v1/instructors/applications/my-status
  // Returns the current logged-in student's instructor application status
  // Response shape: { success, data: { applicationId, status, submittedAt, reviewMessage } }
  getMyApplicationStatus: async () => {
    const response = await axiosInstance.get("/api/v1/instructors/applications/my-status");
    return response.data;
  },

  // GET /api/v1/instructors/applications
  // Returns list of all applications by the logged-in user
  getMyApplications: async () => {
    const response = await axiosInstance.get("/api/v1/instructors/applications");
    return response.data;
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
};

export default instructorApi;
