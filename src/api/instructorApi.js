import axiosInstance from "./axiosInstance";

export const instructorApi = {
  // Get instructor dashboard data
  getDashboardData: async () => {
    const response = await axiosInstance.get("/instructor/dashboard");
    return response.data;
  },

  // Get instructor profile
  getProfile: async () => {
    const response = await axiosInstance.get("/instructor/profile");
    return response.data;
  },

  // Update instructor profile
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put("/instructor/profile", profileData);
    return response.data;
  },

  // Create new course
  createCourse: async (courseData) => {
    const response = await axiosInstance.post("/instructor/courses", courseData);
    return response.data;
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    const response = await axiosInstance.put(`/instructor/courses/${courseId}`, courseData);
    return response.data;
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await axiosInstance.delete(`/instructor/courses/${courseId}`);
    return response.data;
  },

  // Get instructor's courses
  getCourses: async () => {
    const response = await axiosInstance.get("/instructor/courses");
    return response.data;
  },

  // Upload course thumbnail
  uploadThumbnail: async (courseId, file) => {
    const formData = new FormData();
    formData.append("thumbnail", file);
    const response = await axiosInstance.post(`/instructor/courses/${courseId}/thumbnail`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Upload lesson video
  uploadVideo: async (courseId, lessonId, file) => {
    const formData = new FormData();
    formData.append("video", file);
    const response = await axiosInstance.post(
      `/instructor/courses/${courseId}/lessons/${lessonId}/video`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Add lesson to course
  addLesson: async (courseId, lessonData) => {
    const response = await axiosInstance.post(`/instructor/courses/${courseId}/lessons`, lessonData);
    return response.data;
  },

  // Update lesson
  updateLesson: async (courseId, lessonId, lessonData) => {
    const response = await axiosInstance.put(
      `/instructor/courses/${courseId}/lessons/${lessonId}`,
      lessonData
    );
    return response.data;
  },

  // Delete lesson
  deleteLesson: async (courseId, lessonId) => {
    const response = await axiosInstance.delete(`/instructor/courses/${courseId}/lessons/${lessonId}`);
    return response.data;
  },

  // Get course enrollments
  getCourseEnrollments: async (courseId) => {
    const response = await axiosInstance.get(`/instructor/courses/${courseId}/enrollments`);
    return response.data;
  },

  // Get earnings
  getEarnings: async (params = {}) => {
    const response = await axiosInstance.get("/instructor/earnings", { params });
    return response.data;
  },

  // Get course analytics
  getCourseAnalytics: async (courseId) => {
    const response = await axiosInstance.get(`/instructor/courses/${courseId}/analytics`);
    return response.data;
  },

  // Get course reviews
  getCourseReviews: async (courseId) => {
    const response = await axiosInstance.get(`/instructor/courses/${courseId}/reviews`);
    return response.data;
  },

  // Respond to review
  respondToReview: async (courseId, reviewId, response) => {
    const res = await axiosInstance.post(
      `/instructor/courses/${courseId}/reviews/${reviewId}/respond`,
      { response }
    );
    return res.data;
  },
};
