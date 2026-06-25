import axiosInstance from "./axiosInstance";

export const courseApi = {
  // Get all courses
  getAllCourses: async (params = {}) => {
    const response = await axiosInstance.get("/courses", { params });
    return response.data;
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}`);
    return response.data;
  },

  // Search courses
  searchCourses: async (query, filters = {}) => {
    const response = await axiosInstance.get("/courses/search", {
      params: { query, ...filters },
    });
    return response.data;
  },

  // Get courses by category
  getCoursesByCategory: async (category) => {
    const response = await axiosInstance.get(`/courses/category/${category}`);
    return response.data;
  },

  // Enroll in course
  enrollCourse: async (courseId) => {
    const response = await axiosInstance.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  // Get enrolled courses
  getEnrolledCourses: async () => {
    const response = await axiosInstance.get("/courses/enrolled");
    return response.data;
  },

  // Add to wishlist
  addToWishlist: async (courseId) => {
    const response = await axiosInstance.post(`/courses/${courseId}/wishlist`);
    return response.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (courseId) => {
    const response = await axiosInstance.delete(`/courses/${courseId}/wishlist`);
    return response.data;
  },

  // Get wishlist
  getWishlist: async () => {
    const response = await axiosInstance.get("/courses/wishlist");
    return response.data;
  },

  // Get course reviews
  getCourseReviews: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}/reviews`);
    return response.data;
  },

  // Add course review
  addCourseReview: async (courseId, reviewData) => {
    const response = await axiosInstance.post(`/courses/${courseId}/reviews`, reviewData);
    return response.data;
  },

  // Update course progress
  updateProgress: async (courseId, lessonId, progressData) => {
    const response = await axiosInstance.put(`/courses/${courseId}/progress/${lessonId}`, progressData);
    return response.data;
  },

  // Get course progress
  getCourseProgress: async (courseId) => {
    const response = await axiosInstance.get(`/courses/${courseId}/progress`);
    return response.data;
  },
};
