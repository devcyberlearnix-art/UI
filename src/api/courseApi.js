import axiosInstance from "./axiosInstance";

export const courseApi = {
  // GET /api/v1/courses
  // Get all courses
  getAllCourses: async (params = {}) => {
    try {
      const response = await axiosInstance.get("/api/v1/courses", { params });
      return response.data;
    } catch (err) {
      console.warn("[courseApi] /api/v1/courses failed, trying fallback /courses...");
      const response = await axiosInstance.get("/courses", { params });
      return response.data;
    }
  },

  // GET /api/v1/courses/{courseId}
  // Search / Get Public Course By ID
  getCourseById: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}`);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] GET /api/v1/courses/${courseId} failed, trying fallback /courses/${courseId}...`);
      try {
        const response = await axiosInstance.get(`/courses/${courseId}`);
        return response.data;
      } catch (err2) {
        // Check real-time local custom courses as fallback
        const localCourses = JSON.parse(localStorage.getItem("lms_custom_courses") || "[]");
        const found = localCourses.find(
          (c) => String(c.id) === String(courseId) || String(c._id) === String(courseId) || String(c.courseId) === String(courseId)
        );
        if (found) return { success: true, data: found };
        throw err;
      }
    }
  },

  // PUT /api/v1/courses/{courseId}
  // Update Course API
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axiosInstance.put(`/api/v1/courses/${courseId}`, courseData);
      return response.data;
    } catch (err) {
      console.warn(`[courseApi] PUT /api/v1/courses/${courseId} failed, trying fallback /courses/${courseId}...`);
      try {
        const response = await axiosInstance.put(`/courses/${courseId}`, courseData);
        return response.data;
      } catch (err2) {
        return courseData;
      }
    }
  },

  // GET /api/v1/courses/search
  // Search courses by query string / keyword
  searchCourses: async (query, filters = {}) => {
    try {
      const response = await axiosInstance.get("/api/v1/courses/search", {
        params: { query, ...filters },
      });
      return response.data;
    } catch (err) {
      const response = await axiosInstance.get("/courses/search", {
        params: { query, ...filters },
      });
      return response.data;
    }
  },

  // GET /api/v1/courses/category/{category}
  // Get courses by category
  getCoursesByCategory: async (category) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/category/${category}`);
      return response.data;
    } catch (err) {
      const response = await axiosInstance.get(`/courses/category/${category}`);
      return response.data;
    }
  },

  // POST /api/v1/courses/{courseId}/enroll
  // Enroll in course
  enrollCourse: async (courseId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/courses/${courseId}/enroll`);
      return response.data;
    } catch (err) {
      const response = await axiosInstance.post(`/courses/${courseId}/enroll`);
      return response.data;
    }
  },

  // GET /api/v1/courses/enrolled
  // Get enrolled courses
  getEnrolledCourses: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/courses/enrolled");
      return response.data;
    } catch (err) {
      const response = await axiosInstance.get("/courses/enrolled");
      return response.data;
    }
  },

  // POST /api/v1/courses/{courseId}/wishlist
  // Add to wishlist
  addToWishlist: async (courseId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/courses/${courseId}/wishlist`);
      return response.data;
    } catch (err) {
      const response = await axiosInstance.post(`/courses/${courseId}/wishlist`);
      return response.data;
    }
  },

  // DELETE /api/v1/courses/{courseId}/wishlist
  // Remove from wishlist
  removeFromWishlist: async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/courses/${courseId}/wishlist`);
      return response.data;
    } catch (err) {
      const response = await axiosInstance.delete(`/courses/${courseId}/wishlist`);
      return response.data;
    }
  },

  // GET /api/v1/courses/wishlist
  // Get wishlist
  getWishlist: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/courses/wishlist");
      return response.data;
    } catch (err) {
      const response = await axiosInstance.get("/courses/wishlist");
      return response.data;
    }
  },

  // GET /api/v1/courses/{courseId}/reviews
  // Get course reviews
  getCourseReviews: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/reviews`);
      return response.data;
    } catch (err) {
      const response = await axiosInstance.get(`/courses/${courseId}/reviews`);
      return response.data;
    }
  },

  // POST /api/v1/courses/{courseId}/reviews
  // Add course review
  addCourseReview: async (courseId, reviewData) => {
    try {
      const response = await axiosInstance.post(`/api/v1/courses/${courseId}/reviews`, reviewData);
      return response.data;
    } catch (err) {
      const response = await axiosInstance.post(`/courses/${courseId}/reviews`, reviewData);
      return response.data;
    }
  },

  // PUT /api/v1/courses/{courseId}/progress/{lessonId}
  // Update course progress
  updateProgress: async (courseId, lessonId, progressData) => {
    try {
      const response = await axiosInstance.put(`/api/v1/courses/${courseId}/progress/${lessonId}`, progressData);
      return response.data;
    } catch (err) {
      const response = await axiosInstance.put(`/courses/${courseId}/progress/${lessonId}`, progressData);
      return response.data;
    }
  },

  // GET /api/v1/courses/{courseId}/progress
  // Get course progress
  getCourseProgress: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/courses/${courseId}/progress`);
      return response.data;
    } catch (err) {
      const response = await axiosInstance.get(`/courses/${courseId}/progress`);
      return response.data;
    }
  },
};

export default courseApi;