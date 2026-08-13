import axiosInstance from "./axiosInstance";

export const instructorApi = {
  // Get instructor dashboard data
  getDashboardData: async (instructorId) => {
    const response = await axiosInstance.get(`/api/v1/instructors/${instructorId}/dashboard`);
    return response.data;
  },

  // Create new course
  createCourse: async (courseData, instructorId) => {
    const response = await axiosInstance.post(`/api/v1/instructors/${instructorId}/courses`, courseData);
    return response.data;
  },

  // Update course
  updateCourse: async (courseId, courseData, instructorId) => {
    const response = await axiosInstance.put(`/api/v1/instructors/${instructorId}/courses/${courseId}`, courseData);
    return response.data;
  },

  // Delete course
  deleteCourse: async (courseId, instructorId) => {
    const response = await axiosInstance.delete(`/api/v1/instructors/${instructorId}/courses/${courseId}`);
    return response.data;
  },

  // Get instructor's courses
  getCourses: async (instructorId) => {
    const response = await axiosInstance.get(`/api/v1/instructors/${instructorId}/courses`);
    return response.data;
  },

  // Get course enrollments
  getCourseEnrollments: async (courseId, instructorId) => {
    const response = await axiosInstance.get(`/api/v1/instructors/${instructorId}/courses/${courseId}/students`);
    return response.data;
  },

  // Get earnings
  getEarnings: async (params = {}, instructorId) => {
    const response = await axiosInstance.get(`/api/v1/instructors/${instructorId}/earnings`, { params });
    return response.data;
  },

  // Get course analytics
  getCourseAnalytics: async (courseId, instructorId) => {
    const response = await axiosInstance.get(`/api/v1/instructors/${instructorId}/courses/${courseId}/analytics`);
    return response.data;
  },

  applyForInstructorRole: async (formData) => {
    const response = await axiosInstance.post('/api/v1/instructors/applications', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
