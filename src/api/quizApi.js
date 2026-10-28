import axiosInstance from "./axiosInstance";

/**
 * Quiz & Assessment API Client
 * Service: Course Service (Port 8083)
 * Gateway Path: /api/v1/quizzes
 */
export const quizApi = {
  // ============================================
  // Quiz Management (Instructor/Admin)
  // ============================================

  /**
   * POST /api/v1/quizzes
   * Create quiz
   */
  createQuiz: async (quizData) => {
    try {
      const response = await axiosInstance.post('/api/v1/quizzes', quizData);
      return response.data;
    } catch (err) {
      console.warn('[quizApi] POST /api/v1/quizzes failed');
      throw err;
    }
  },

  /**
   * PUT /api/v1/quizzes/{quizId}
   * Update quiz
   */
  updateQuiz: async (quizId, quizData) => {
    try {
      const response = await axiosInstance.put(`/api/v1/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] PUT /api/v1/quizzes/${quizId} failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/quizzes/{quizId}
   * Delete quiz
   */
  deleteQuiz: async (quizId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/quizzes/${quizId}`);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] DELETE /api/v1/quizzes/${quizId} failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/quizzes/{quizId}/publish
   * Publish quiz
   */
  publishQuiz: async (quizId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/quizzes/${quizId}/publish`);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] PATCH /api/v1/quizzes/${quizId}/publish failed`);
      throw err;
    }
  },

  /**
   * PATCH /api/v1/quizzes/{quizId}/unpublish
   * Unpublish quiz
   */
  unpublishQuiz: async (quizId) => {
    try {
      const response = await axiosInstance.patch(`/api/v1/quizzes/${quizId}/unpublish`);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] PATCH /api/v1/quizzes/${quizId}/unpublish failed`);
      throw err;
    }
  },

  /**
   * POST /api/v1/quizzes/{quizId}/questions
   * Add question to quiz
   */
  addQuestion: async (quizId, questionData) => {
    try {
      const response = await axiosInstance.post(`/api/v1/quizzes/${quizId}/questions`, questionData);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] POST /api/v1/quizzes/${quizId}/questions failed`);
      throw err;
    }
  },

  /**
   * PUT /api/v1/quizzes/questions/{questionId}
   * Update question
   */
  updateQuestion: async (questionId, questionData) => {
    try {
      const response = await axiosInstance.put(`/api/v1/quizzes/questions/${questionId}`, questionData);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] PUT /api/v1/quizzes/questions/${questionId} failed`);
      throw err;
    }
  },

  /**
   * DELETE /api/v1/quizzes/questions/{questionId}
   * Delete question
   */
  deleteQuestion: async (questionId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/quizzes/questions/${questionId}`);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] DELETE /api/v1/quizzes/questions/${questionId} failed`);
      throw err;
    }
  },

  // ============================================
  // Quiz Taking (Student)
  // ============================================

  /**
   * GET /api/v1/quizzes/{quizId}/student
   * Get student quiz (no answers)
   */
  getStudentQuiz: async (quizId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/quizzes/${quizId}/student`);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] GET /api/v1/quizzes/${quizId}/student failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/quizzes/{quizId}/student/questions
   * Get student quiz with questions
   */
  getStudentQuizWithQuestions: async (quizId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/quizzes/${quizId}/student/questions`);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] GET /api/v1/quizzes/${quizId}/student/questions failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/quizzes/{quizId}/take or /api/v1/quizzes/{quizId}/student/questions
   * Alias: getQuizById
   */
  getQuizById: async (quizId) => {
    try {
      try {
        const response = await axiosInstance.get(`/api/v1/quizzes/${quizId}/student/questions`);
        return response.data;
      } catch (err) {
        const response = await axiosInstance.get(`/api/v1/quizzes/${quizId}`);
        return response.data;
      }
    } catch (err) {
      console.warn(`[quizApi] getQuizById for ${quizId} failed`);
      throw err;
    }
  },

  /**
   * POST /api/v1/quizzes/{quizId}/attempts
   * Start quiz attempt
   */
  startQuizAttempt: async (quizId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/quizzes/${quizId}/attempts`);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] POST /api/v1/quizzes/${quizId}/attempts failed`);
      throw err;
    }
  },

  startAttempt: async (quizId) => {
    return quizApi.startQuizAttempt(quizId);
  },

  /**
   * GET /api/v1/quizzes/{quizId}/attempts/current
   * Get current attempt
   */
  getCurrentAttempt: async (quizId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/quizzes/${quizId}/attempts/current`);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] GET /api/v1/quizzes/${quizId}/attempts/current failed`);
      throw err;
    }
  },

  /**
   * POST /api/v1/quizzes/{quizId}/attempts/{attemptId}/answers
   * Supports both (quizId, attemptId, answerData) and ({ attemptId, questionId, selectedOption, quizId })
   */
  submitAnswer: async (quizIdOrData, maybeAttemptId, maybeAnswerData) => {
    try {
      let qId = quizIdOrData;
      let attId = maybeAttemptId;
      let payload = maybeAnswerData;

      if (typeof quizIdOrData === 'object' && quizIdOrData !== null) {
        attId = quizIdOrData.attemptId;
        qId = quizIdOrData.quizId || 1;
        const selectedOpt = quizIdOrData.selectedOption ?? quizIdOrData.selectedOptionId;
        payload = {
          questionId: Number(quizIdOrData.questionId),
          selectedOptionIds: Array.isArray(quizIdOrData.selectedOptionIds)
            ? quizIdOrData.selectedOptionIds
            : selectedOpt !== undefined
            ? [Number(selectedOpt)]
            : [],
          selectedOption: selectedOpt,
        };
      }

      // Try nested route first: /api/v1/quizzes/{quizId}/attempts/{attemptId}/answers
      try {
        const response = await axiosInstance.post(
          `/api/v1/quizzes/${qId}/attempts/${attId}/answers`,
          payload
        );
        return response.data;
      } catch (nestedErr) {
        // Fallback to direct attempt route: /api/v1/quizzes/attempts/{attemptId}/answers
        const response = await axiosInstance.post(
          `/api/v1/quizzes/attempts/${attId}/answers`,
          payload
        );
        return response.data;
      }
    } catch (err) {
      console.warn(`[quizApi] submitAnswer failed:`, err?.message);
      throw err;
    }
  },

  /**
   * POST /api/v1/quizzes/{quizId}/attempts/{attemptId}/submit
   * Supports (quizId, attemptId), ({ attemptId, quizId }), and (attemptId)
   */
  submitQuizAttempt: async (quizId, attemptId) => {
    try {
      const response = await axiosInstance.post(
        `/api/v1/quizzes/${quizId}/attempts/${attemptId}/submit`
      );
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] POST /api/v1/quizzes/${quizId}/attempts/${attemptId}/submit failed`);
      throw err;
    }
  },

  submitQuiz: async (attemptIdOrData, maybeAttemptId) => {
    try {
      let qId = 1;
      let attId = attemptIdOrData;

      if (typeof attemptIdOrData === 'object' && attemptIdOrData !== null) {
        attId = attemptIdOrData.attemptId;
        qId = attemptIdOrData.quizId || 1;
      } else if (maybeAttemptId !== undefined) {
        qId = attemptIdOrData;
        attId = maybeAttemptId;
      }

      try {
        const response = await axiosInstance.post(
          `/api/v1/quizzes/${qId}/attempts/${attId}/submit`
        );
        return response.data;
      } catch (nestedErr) {
        const response = await axiosInstance.post(
          `/api/v1/quizzes/attempts/${attId}/submit`
        );
        return response.data;
      }
    } catch (err) {
      console.warn(`[quizApi] submitQuiz failed:`, err?.message);
      throw err;
    }
  },

  /**
   * GET /api/v1/quizzes/{quizId}/attempts/{attemptId}/result
   * Get attempt result
   */
  getAttemptResult: async (quizId, attemptId) => {
    try {
      const response = await axiosInstance.get(
        `/api/v1/quizzes/${quizId}/attempts/${attemptId}/result`
      );
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] GET /api/v1/quizzes/${quizId}/attempts/${attemptId}/result failed`);
      throw err;
    }
  },

  /**
   * GET /api/v1/quizzes/{quizId}/attempts
   * Get student attempts
   */
  getStudentAttempts: async (quizId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/quizzes/${quizId}/attempts`);
      return response.data;
    } catch (err) {
      console.warn(`[quizApi] GET /api/v1/quizzes/${quizId}/attempts failed`);
      throw err;
    }
  },
};

export default quizApi;
