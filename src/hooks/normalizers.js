/**
 * ============================================================================
 * ASIVO STUDIO / FD_LMS PAYLOAD NORMALIZATION SYSTEM
 * Architecture: Gateway DTO Unwrapping & Object Schema Alignment
 * ============================================================================
 */
import {
  unwrapPayload,
  unwrapArray,
  normalizeSection,
  normalizeLecture,
  normalizeUserProfile,
  normalizeSession,
  normalizeReview,
  normalizeNotification,
  normalizeQuiz
} from '../utils/normalizers';

export {
  unwrapPayload,
  unwrapArray,
  normalizeSection,
  normalizeLecture,
  normalizeUserProfile,
  normalizeSession,
  normalizeReview,
  normalizeNotification,
  normalizeQuiz
};

export const normalizeCart = (raw) => {
  const data = raw?.data || raw || {};
  const courses = Array.isArray(data.courses) ? data.courses : [];
  return {
    cartId: data.cartId || data.id || null,
    totalCourses: courses.length,
    courses: courses.map((c) => ({
      id: c.courseId || c.id,
      title: c.courseName || c.title || 'Advanced Computing Node',
      price: Number(c.price || 0),
      instructor: c.instructorName || c.instructor || 'Studio Architect',
      instructorId: c.instructorId || 1,
    })),
    subtotal: Number(data.subtotal || data.totalPrice || 0),
    discount: Number(data.discount || 0),
    total: Number(data.total || data.finalPrice || 0),
    couponCode: data.couponCode || null,
  };
};

export const normalizeOrder = (raw) => {
  const o = raw?.data || raw || {};
  return {
    id: o.orderId || o.id || 'err-node',
    status: o.status || 'PENDING',
    createdAt: o.createdAt || o.orderDate || new Date().toISOString(),
    totalAmount: Number(o.totalAmount || o.total || 0),
    signature: o.signature || o.transactionHash || '8f93b5a1c8e9d2f3a4b5c6d7e8f901a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
    items: Array.isArray(o.items)
      ? o.items.map((item) => ({
          title: item.courseName || item.title || `Course Allocation Node #${item.courseId}`,
          courseId: item.courseId,
          price: Number(item.price || 0),
        }))
      : (o.courseIds || []).map((cid) => ({
          title: `Course Allocation Node #${cid}`,
          courseId: cid,
          price: 0,
        })),
  };
};

export const normalizeCourse = (raw) => {
  const c = raw?.data || raw || {};
  return {
    id: c.courseId || c.id,
    title: c.title || 'Advanced Masterclass',
    description: c.description || '',
    price: Number(c.price || 0),
    imageUrl: c.imageUrl || c.thumbnailUrl || '/assets/dashboard-glow.webp',
    category: c.category || 'DISTRIBUTED',
    level: c.level || 'Masterclass',
    instructor: c.instructorName || c.instructor || 'Studio Architect',
    modules: Array.isArray(c.modules)
      ? c.modules.map((m) => ({
          id: m.moduleId || m.id,
          title: m.title || 'Curriculum Section Node',
          lectures: Array.isArray(m.lectures)
            ? m.lectures.map((l) => ({
                id: l.lectureId || l.id,
                title: l.title || 'Lecture Element',
                duration: l.duration || '00:00',
                videoUrl: l.videoUrl || '',
                isCompleted: Boolean(l.completed || l.isCompleted),
              }))
            : [],
          quiz: m.quiz
            ? {
                id: m.quiz.quizId || m.quiz.id,
                title: m.quiz.title || 'Assessment Node',
                timeLimitMs: (m.quiz.durationMinutes || 10) * 60000,
              }
            : null,
        }))
      : [],
  };
};

// ============================================================================
// Extended DTO Alignment Systems (StudentQuizResponse, QuizResult, Assignment)
// ============================================================================

/**
 * Normalizes the backend StudentQuizResponse containing the assessment layout
 * Path: GET /api/v1/quizzes/{quizId}/take or /api/v1/quizzes/{quizId}/student/questions
 */
export const normalizeBackendQuiz = (raw) => {
  const q = raw?.data || raw || {};
  const questions = Array.isArray(q.questions) ? q.questions : [];
  
  return {
    id: q.quizId || q.id || null,
    title: q.title || 'Module Evaluation Matrix',
    timeLimitMs: (q.durationMinutes || q.timeLimit || q.timeLimitMinutes || 10) * 60 * 1000, // Converts backend integer minutes to milliseconds
    questions: questions.map((qn, index) => {
      const options = Array.isArray(qn.options) ? qn.options : [];
      return {
        id: qn.questionId || qn.id || `q-${index}`,
        text: qn.questionText || qn.text || 'Technical Question Prompt',
        options: options.map((o) => (typeof o === 'string' ? o : o.optionText || o.text || ''))
      };
    })
  };
};

/**
 * Normalizes QuizResultResponse following compilation submission
 * Path: POST /api/v1/quizzes/attempts/{attemptId}/submit
 */
export const normalizeQuizResult = (raw) => {
  const r = raw?.data || raw || {};
  const questions = Array.isArray(r.questions) ? r.questions : (Array.isArray(r.questionResults) ? r.questionResults : []);
  
  return {
    score: r.score ?? r.scoreObtained ?? 0,
    totalQuestions: r.totalQuestions ?? (questions.length > 0 ? questions.length : (r.totalMarks ? r.totalMarks : 0)),
    percentage: r.percentage ?? (r.totalQuestions ? Math.round((r.score / r.totalQuestions) * 100) : 0),
    passed: r.passed ?? r.isPassed ?? false,
    questions: questions.map((qn, index) => ({
      id: qn.questionId || qn.id || `q-${index}`,
      text: qn.questionText || 'Question Vector',
      selectedOption: qn.selectedOption ?? null,
      correctOption: qn.correctOption ?? null,
      isCorrect: qn.correct ?? qn.isCorrect ?? (qn.selectedOption === qn.correctOption)
    }))
  };
};

/**
 * Normalizes Assignment entities for Student Workspace Layouts
 * Path: GET /api/v1/assignments/course/{courseId}
 */
export const normalizeAssignment = (raw) => {
  const a = raw?.data || raw || {};
  return {
    id: a.assignmentId || a.id || null,
    title: a.title || 'Technical Laboratory Specification',
    description: a.description || 'Implement the missing core framework parameters.',
    dueDate: a.dueDate || a.deadline || null,
    points: a.maxMarks || a.maxScore || a.points || 100,
    submission: a.submission ? {
      id: a.submission.submissionId || a.submission.id,
      text: a.submission.submissionText || '',
      fileUrl: a.submission.fileUrl || null,
      grade: a.submission.grade || null,
      feedback: a.submission.feedback || null,
      status: a.submission.status || 'SUBMITTED'
    } : null
  };
};
