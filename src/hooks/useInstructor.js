import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorApi } from '../api/instructorApi';
import { normalizeCourse, unwrapArray, unwrapPayload } from '../utils/normalizers';
import { useSafeAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const INSTRUCTOR_DASHBOARD_KEY = ['instructorDashboard'];
export const INSTRUCTOR_COURSES_KEY = ['instructorCourses'];
export const INSTRUCTOR_EARNINGS_KEY = ['instructorEarnings'];

/**
 * Hook: Retrieve Instructor Studio Dashboard Metrics
 */
export function useInstructorDashboard(instructorIdOverride) {
  const { user } = useSafeAuth();
  const instructorId = instructorIdOverride || user?.id || 'me';

  return useQuery({
    queryKey: [...INSTRUCTOR_DASHBOARD_KEY, instructorId],
    queryFn: async () => {
      const response = await instructorApi.getDashboard(instructorId);
      const data = unwrapPayload(response);
      return {
        totalCourses: Number(data?.totalCourses ?? data?.coursesCount ?? 0),
        totalStudents: Number(data?.totalStudents ?? data?.studentsCount ?? data?.enrolledStudents ?? 0),
        totalEarnings: Number(data?.totalEarnings ?? data?.earnings ?? data?.revenue ?? 0),
        avgRating: Number(data?.avgRating ?? data?.rating ?? 4.9),
        recentEnrollments: unwrapArray(data, ['recentEnrollments', 'enrollments', 'students']),
      };
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook: Retrieve Courses Authored by Instructor
 */
export function useInstructorCourses(instructorIdOverride) {
  const { user } = useSafeAuth();
  const instructorId = instructorIdOverride || user?.id || 'me';

  return useQuery({
    queryKey: [...INSTRUCTOR_COURSES_KEY, instructorId],
    queryFn: async () => {
      const response = await instructorApi.getCourses(instructorId);
      const rawList = unwrapArray(response, ['courses', 'data', 'content']);
      return rawList.map(normalizeCourse);
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook: Retrieve Instructor Earning Distributions
 */
export function useInstructorEarnings(instructorIdOverride, params = { period: 'month' }) {
  const { user } = useSafeAuth();
  const instructorId = instructorIdOverride || user?.id || 'me';

  return useQuery({
    queryKey: [...INSTRUCTOR_EARNINGS_KEY, instructorId, params],
    queryFn: async () => {
      const response = await instructorApi.getEarnings(instructorId, params);
      const data = unwrapPayload(response);
      return {
        totalEarnings: Number(data?.totalEarnings ?? data?.total ?? 0),
        monthlyRevenue: Array.isArray(data?.monthly) ? data.monthly : [],
        pendingPayout: Number(data?.pendingPayout ?? data?.pending ?? 0),
      };
    },
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook: Create New Course Mutation
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const instructorId = user?.id || 'me';

  return useMutation({
    mutationFn: async (courseData) => {
      return await instructorApi.createCourse(instructorId, courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INSTRUCTOR_COURSES_KEY, instructorId] });
      queryClient.invalidateQueries({ queryKey: [...INSTRUCTOR_DASHBOARD_KEY, instructorId] });
      toast.success('Curriculum module drafted and published');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create course');
    },
  });
}

/**
 * Hook: Update Course Mutation
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const instructorId = user?.id || 'me';

  return useMutation({
    mutationFn: async ({ courseId, courseData }) => {
      return await instructorApi.updateCourse(instructorId, courseId, courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...INSTRUCTOR_COURSES_KEY, instructorId] });
      toast.success('Curriculum details updated');
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update course');
    },
  });
}

/**
 * Hook: Delete Course Mutation with Optimistic Eviction
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const instructorId = user?.id || 'me';
  const queryKey = [...INSTRUCTOR_COURSES_KEY, instructorId];

  return useMutation({
    mutationFn: async (courseId) => {
      return await instructorApi.deleteCourse(instructorId, courseId);
    },
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old = []) =>
        old.filter((c) => String(c.id) !== String(courseId))
      );

      return { previous };
    },
    onError: (err, courseId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error('Failed to delete course');
    },
    onSuccess: () => {
      toast.success('Course purged from instructor matrix');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
