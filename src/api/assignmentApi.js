// src/api/assignmentApi.js
// Assignment Management API
// Service: Course Service (Port 8083)
import axiosInstance from "./axiosInstance";

/**
 * Assignment Service API Client
 * Aligned with Course Service AssignmentController
 * Gateway Path: /api/v1/assignments
 */
export const assignmentApi = {
  /**
   * POST /api/v1/assignments
   * Create assignment (Instructor/Admin)
   */
  createAssignment: async (courseId, assignmentData) => {
    try {
      const payload = {
        courseId: Number(courseId),
        ...(typeof assignmentData === 'object' ? assignmentData : {}),
      };
      const response = await axiosInstance.post('/api/v1/assignments', payload);
      return response.data;
    } catch (err) {
      console.warn('[assignmentApi] POST /api/v1/assignments failed');
      throw err;
    }
  },

  /**
   * GET /api/v1/assignments/course/{courseId}/published (or /course/{courseId})
   * Get published assignments for course
   */
  getAssignments: async (courseId) => {
    try {
      try {
        const response = await axiosInstance.get(`/api/v1/assignments/course/${courseId}/published`);
        return response.data;
      } catch (err) {
        // Fallback for staff
        const response = await axiosInstance.get(`/api/v1/assignments/course/${courseId}`);
        return response.data;
      }
    } catch (err) {
      console.warn(`[assignmentApi] GET /api/v1/assignments/course/${courseId} failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/assignments/course/{courseId}/published
   */
  getPublishedAssignments: async (courseId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/assignments/course/${courseId}/published`);
      return response.data;
    } catch (err) {
      console.warn(`[assignmentApi] GET /api/v1/assignments/course/${courseId}/published failed`);
      throw err;
    }
  },

  /**
   * POST /api/v1/assignments/{assignmentId}/submission/submit
   * Submit assignment (Student)
   */
  submitAssignment: async (assignmentId, data = {}) => {
    try {
      // First save draft if content/file provided
      if (data && (data.content || data.fileUrl || data.submissionText)) {
        await axiosInstance.post(`/api/v1/assignments/${assignmentId}/submission`, {
          content: data.content || data.submissionText || 'Completed assignment submission',
          fileUrl: data.fileUrl || 'https://cyberlearnix.dev/submissions/sample.pdf'
        });
      }
      const response = await axiosInstance.post(`/api/v1/assignments/${assignmentId}/submission/submit`);
      return response.data;
    } catch (err) {
      console.warn(`[assignmentApi] POST /api/v1/assignments/${assignmentId}/submission/submit failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/assignments/{assignmentId}/submission
   * Get assignment submission (Student)
   */
  getSubmission: async (assignmentId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/assignments/${assignmentId}/submission`);
      return response.data;
    } catch (err) {
      console.warn(`[assignmentApi] GET /api/v1/assignments/${assignmentId}/submission failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/assignments/submissions/{submissionId}/grade
   * Grade assignment submission (Instructor/Admin)
   */
  gradeSubmission: async (submissionId, gradingData) => {
    try {
      const payload = {
        score: Number(gradingData.score || gradingData.grade || 100),
        feedback: gradingData.feedback || 'Great work!',
      };
      const response = await axiosInstance.patch(
        `/api/v1/assignments/submissions/${submissionId}/grade`,
        payload
      );
      return response.data;
    } catch (err) {
      console.warn(`[assignmentApi] PATCH /api/v1/assignments/submissions/${submissionId}/grade failed`);
      throw err;
    }
  },
};

export default assignmentApi;
