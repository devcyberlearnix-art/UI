import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizApi } from '../api/quizApi';
import { assignmentApi } from '../api/assignmentApi';
import { normalizeBackendQuiz, normalizeQuizResult, normalizeAssignment } from './normalizers';
import toast from 'react-hot-toast';

export const ASSIGNMENTS_QUERY_KEY = ['assignments'];
export const QUIZ_QUERY_KEY = ['quiz'];

export const useAssessments = (courseId = null) => {
  const queryClient = useQueryClient();

  // 1. QUERY: Load full course lab assignment specifications
  const assignmentsQuery = useQuery({
    queryKey: ['assignments', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      const res = await assignmentApi.getAssignments(courseId);
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      return rawList.map(normalizeAssignment);
    },
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 5,
  });

  // 2. MUTATION: Submit Laboratory Code Artifact Archives
  const submitAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, submissionText, fileUrl, submissionData }) => {
      // Constructs valid SubmissionRequest payload schema for Java backend
      const payload = submissionData || { submissionText, fileUrl };
      return await assignmentApi.submitAssignment(assignmentId, payload);
    },
    onSuccess: () => {
      toast.success('Laboratory artifact archive deployed successfully.');
      queryClient.invalidateQueries({ queryKey: ['assignments', courseId] });
      queryClient.invalidateQueries({ queryKey: ASSIGNMENTS_QUERY_KEY });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to sync laboratory submission.');
    },
  });

  return {
    data: assignmentsQuery.data || [],
    assignments: assignmentsQuery.data || [],
    isLoading: assignmentsQuery.isLoading,
    isAssignmentsLoading: assignmentsQuery.isLoading,
    isFetching: assignmentsQuery.isFetching,
    error: assignmentsQuery.error,
    refetch: assignmentsQuery.refetch,
    submitAssignment: submitAssignmentMutation.mutate,
    mutate: submitAssignmentMutation.mutate,
    isSubmittingAssignment: submitAssignmentMutation.isPending,
    isPending: submitAssignmentMutation.isPending,
  };
};

export const useQuizSession = (quizId) => {
  const queryClient = useQueryClient();

  // 1. QUERY: Initialize or fetch current active structural quiz matrix
  const quizQuery = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!quizId) return null;
      const res = await quizApi.getQuizById(quizId);
      return normalizeBackendQuiz(res);
    },
    enabled: Boolean(quizId),
    staleTime: Infinity, // Maintain fixed immutable network layout during active session
    gcTime: 0,
  });

  // 2. MUTATION: Submit single selection answer telemetry stream to backend state register
  const saveAnswerMutation = useMutation({
    mutationFn: async ({ attemptId, questionId, selectedOption, quizId: qId }) => {
      // Maps to live AnswerRequest DTO: public void submitAnswer(AnswerRequest request)
      return await quizApi.submitAnswer({
        attemptId,
        questionId,
        selectedOption,
        quizId: qId || quizId,
      });
    },
  });

  // 3. MUTATION: Finalize exam matrix compilation
  const submitQuizMutation = useMutation({
    mutationFn: async ({ attemptId, quizId: qId } = {}) => {
      const res = await quizApi.submitQuiz({
        attemptId,
        quizId: qId || quizId,
      });
      return normalizeQuizResult(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] });
    },
  });

  return {
    quiz: quizQuery.data,
    isQuizLoading: quizQuery.isLoading,
    saveAnswer: saveAnswerMutation.mutateAsync,
    submitQuiz: submitQuizMutation.mutateAsync,
    isSubmittingQuiz: submitQuizMutation.isPending,
  };
};

// ============================================================================
// Backward Compatible Hook Aliases
// ============================================================================
export const useCourseAssignments = (courseId) => useAssessments(courseId);

export const useSubmitAssignment = () => {
  const { submitAssignment, isSubmittingAssignment } = useAssessments();
  return {
    mutate: submitAssignment,
    isPending: isSubmittingAssignment,
  };
};

export const useQuiz = useQuizSession;
