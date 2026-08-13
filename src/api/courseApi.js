import axiosInstance from "./axiosInstance";

export const courseApi = {
  // Get all courses
  getAllCourses: async (params = {}) => {
    const response = await axiosInstance.get("/api/v1/courses", { params });
    return response.data;
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/courses/${courseId}`);
    return response.data;
  },

  // Enroll in course
  enrollCourse: async (courseId) => {
    const response = await axiosInstance.post(`/api/v1/courses/${courseId}/enroll`);
    return response.data;
  },

  // Add to wishlist
  addToWishlist: async (courseId) => {
    const response = await axiosInstance.post("/api/v1/wishlist", { courseId });
    return response.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (courseId) => {
    const response = await axiosInstance.delete(`/api/v1/wishlist/${courseId}`);
    return response.data;
  },

  // Get wishlist
  getWishlist: async () => {
    const response = await axiosInstance.get("/api/v1/wishlist");
    return response.data;
  },

  // Get course reviews
  getCourseReviews: async (courseId) => {
    const response = await axiosInstance.get(`/api/v1/reviews/course/${courseId}`);
    return response.data;
  },

  // Add course review
  addCourseReview: async (courseId, reviewData) => {
    const response = await axiosInstance.post("/api/v1/reviews", { courseId, ...reviewData });
    return response.data;
  },
};