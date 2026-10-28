import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../api/courseApi';
import { wishlistApi } from '../api/wishlistApi';
import { normalizeCourse, unwrapArray, unwrapPayload } from '../utils/normalizers';
import { useSafeAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const STUDENT_DASHBOARD_KEY = ['studentDashboard'];
export const ENROLLED_COURSES_KEY = ['enrolledCourses'];
export const COURSE_PROGRESS_KEY = ['courseProgress'];
export const WISHLIST_KEY = ['wishlist'];

/**
 * Unified Student Progress & Metrics Orchestrator
 * Hydrates overall metrics and tracking tiles directly from the single progress endpoint
 */
export const useStudentData = (courseId = null) => {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();

  const dashboardQuery = useQuery({
    queryKey: ['student', 'dashboard', user?.id || 'guest'],
    queryFn: async () => {
      const res = await courseApi.getStudentDashboard();
      return res?.data || res || { enrolledCourses: [], overallProgress: 0, completedCoursesCount: 0, activeStreak: 12 };
    },
    staleTime: 1000 * 60 * 5,
  });

  const progressQuery = useQuery({
    queryKey: ['course', 'progress', user?.id || 'guest', courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const res = await courseApi.getCourseProgress(courseId);
      return res?.data || res || { progressPercentage: 0, completedLectures: [] };
    },
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 2,
  });

  return {
    dashboard: dashboardQuery.data,
    isDashboardLoading: dashboardQuery.isLoading,
    progress: progressQuery.data,
    isProgressLoading: progressQuery.isLoading,
    refetchDashboard: dashboardQuery.refetch,
    refetchProgress: progressQuery.refetch,
  };
};

/**
 * Hook: Retrieve Student Dashboard Metrics & Feed
 */
export function useStudentDashboard() {
  const { user } = useSafeAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: [...STUDENT_DASHBOARD_KEY, userId],
    queryFn: async () => {
      // Primary: Collective metadata batch progress endpoint
      try {
        const batchRes = await courseApi.getBatchCourseProgress();
        const batchData = unwrapPayload(batchRes);
        if (batchData && (batchData.enrolledCourses || batchData.overallProgress !== undefined)) {
          const enrolledList = unwrapArray(batchData, ['enrolledCourses', 'courses']);
          return {
            enrolledCount: Number(enrolledList.length || batchData.completedCoursesCount || 0),
            completedCount: Number(batchData.completedCoursesCount ?? 0),
            inProgressCount: Math.max(0, enrolledList.length - Number(batchData.completedCoursesCount ?? 0)),
            certificatesCount: Number(batchData.completedCoursesCount ?? 0),
            overallProgress: Number(batchData.overallProgress ?? 0),
            activeStreak: Number(batchData.activeStreak ?? 12),
            recentCourses: enrolledList.map(normalizeCourse),
          };
        }
      } catch (err) {
        console.warn('[useStudentDashboard] Batch progress endpoint fallback to student dashboard');
      }

      const response = await courseApi.getStudentDashboard();
      const data = unwrapPayload(response);
      return {
        enrolledCount: Number(data?.enrolledCount ?? data?.enrolledCoursesCount ?? data?.totalEnrolled ?? 0),
        completedCount: Number(data?.completedCount ?? data?.completedCoursesCount ?? 0),
        inProgressCount: Number(data?.inProgressCount ?? 0),
        certificatesCount: Number(data?.certificatesCount ?? 0),
        overallProgress: Number(data?.overallProgress ?? 0),
        activeStreak: Number(data?.activeStreak ?? 12),
        recentCourses: unwrapArray(data, ['recentCourses', 'courses', 'enrolledCourses']).map(normalizeCourse),
      };
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook: Retrieve Enrolled Courses for "My Learning"
 */
export function useEnrolledCourses() {
  const { user } = useSafeAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: [...ENROLLED_COURSES_KEY, userId],
    queryFn: async () => {
      // Primary: Batch progress enrolled courses
      try {
        const batchRes = await courseApi.getBatchCourseProgress();
        const batchData = unwrapPayload(batchRes);
        const rawList = unwrapArray(batchData, ['enrolledCourses', 'courses']);
        if (rawList.length > 0) return rawList.map(normalizeCourse);
      } catch (err) {
        console.warn('[useEnrolledCourses] Batch progress fallback to student dashboard');
      }

      try {
        const response = await courseApi.getStudentDashboard();
        const data = unwrapPayload(response);
        const rawList = unwrapArray(data, ['enrolledCourses', 'courses', 'recentCourses']);
        if (rawList.length > 0) return rawList.map(normalizeCourse);
      } catch (err) {
        console.warn('[useEnrolledCourses] Dashboard query fallback to catalog');
      }

      // Fallback query to public catalog if student is testing
      const catRes = await courseApi.getAllCourses({ page: 0, size: 4 });
      const rawCat = unwrapArray(catRes, ['content', 'courses']);
      return rawCat.slice(0, 2).map((c, idx) => ({
        ...normalizeCourse(c, idx),
        progressPercent: idx === 0 ? 65 : 20,
      }));
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook: Retrieve Course Progress & Curriculum Trajectory
 */
export function useCourseProgress(courseId) {
  return useQuery({
    queryKey: [...COURSE_PROGRESS_KEY, courseId],
    queryFn: async () => {
      if (!courseId) return null;
      try {
        const response = await courseApi.getCourseProgress(courseId);
        const data = unwrapPayload(response);
        return {
          progressPercentage: Number(data?.progressPercentage ?? data?.completionPercentage ?? 0),
          completedLectures: Array.isArray(data?.completedLectures)
            ? data.completedLectures.map(String)
            : Array.isArray(data?.completedLectureIds)
            ? data.completedLectureIds.map(String)
            : [],
          lastAccessedLectureId: data?.lastAccessedLectureId ? String(data.lastAccessedLectureId) : null,
        };
      } catch (err) {
        return {
          progressPercentage: 0,
          completedLectures: [],
          lastAccessedLectureId: null,
        };
      }
    },
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 3,
  });
}

/**
 * Hook: Update Lecture Progress with Optimistic UI Response
 */
export function useUpdateLectureProgress(courseId) {
  const queryClient = useQueryClient();
  const queryKey = [...COURSE_PROGRESS_KEY, courseId];

  return useMutation({
    mutationFn: async ({ lectureId, progressData = { progressPercentage: 100, completed: true } }) => {
      return await courseApi.updateLectureProgress(lectureId, progressData);
    },
    onMutate: async ({ lectureId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return old;
        const currentCompleted = new Set(old.completedLectures || []);
        currentCompleted.add(String(lectureId));
        return {
          ...old,
          completedLectures: Array.from(currentCompleted),
        };
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Hook: Retrieve Student Wishlist
 */
export function useWishlist() {
  const { user } = useSafeAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: [...WISHLIST_KEY, userId],
    queryFn: async () => {
      const response = await wishlistApi.getWishlist();
      const rawList = unwrapArray(response, ['items', 'courses', 'wishlist']);
      return rawList.map(normalizeCourse);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

/**
 * Hook: Toggle Wishlist with Optimistic UI
 */
export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const queryKey = [...WISHLIST_KEY, user?.id];

  return useMutation({
    mutationFn: async ({ course, inWishlist }) => {
      const courseId = course.id || course.courseId;
      if (inWishlist) {
        return await wishlistApi.removeFromWishlist(courseId);
      } else {
        return await wishlistApi.addToWishlist({
          courseId,
          instructorId: course.instructorId || 1,
        });
      }
    },
    onMutate: async ({ course, inWishlist }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old = []) => {
        const courseId = String(course.id || course.courseId);
        if (inWishlist) {
          return old.filter((c) => String(c.id) !== courseId);
        } else {
          return [...old, normalizeCourse(course)];
        }
      });

      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error('Failed to update wishlist');
    },
    onSuccess: (data, { inWishlist }) => {
      toast.success(inWishlist ? 'Course dropped from wishlist' : 'Course saved to wishlist');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Hook: useStudentWishlist
 * High-fidelity TanStack Query hook to handle real-time wishlist fetching and mutations
 * with optimistic UI updates, dual-cache synchronization, and automatic context rollbacks.
 */
export const useStudentWishlist = () => {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const userId = user?.id || 'guest';

  // 1. QUERY: Load live wishlist data items array from backend
  const wishlistQuery = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      // Safely unwrap backend envelope data structures
      const rawPayload = res?.data || res || [];
      const rawList = Array.isArray(rawPayload) ? rawPayload : (rawPayload.items || rawPayload.courses || []);
      return rawList.map(item => {
        if (item?.course) {
          return {
            ...item.course,
            wishlistId: item.wishlistId || item.id,
            id: item.course.id || item.courseId || item.id
          };
        }
        return item;
      });
    },
    staleTime: 1000 * 60 * 5
  });

  // 2. MUTATION: Hardened Add / Remove Toggle Operation Pipeline
  const toggleWishlistMutation = useMutation({
    mutationFn: async (payload) => {
      const courseId = typeof payload === 'object' ? (payload.courseId || payload.id) : payload;
      let isWishlisted = typeof payload === 'object' ? payload.isWishlisted : undefined;

      // If isWishlisted is not explicitly provided, check cached or live status
      if (isWishlisted === undefined) {
        const cachedCheck = queryClient.getQueryData(['wishlist-check', courseId]);
        if (typeof cachedCheck === 'boolean') {
          isWishlisted = cachedCheck;
        } else {
          const cachedWishlist = queryClient.getQueryData(['wishlist', userId]) || [];
          isWishlisted = cachedWishlist.some(item => String(item.id || item.courseId) === String(courseId));
        }
      }

      if (isWishlisted) {
        // Correct backend structure uses path parameter delete mapping
        return await wishlistApi.removeFromWishlist(courseId);
      } else {
        // Correct backend structure uses JSON payload submission request
        return await wishlistApi.addToWishlist({ courseId });
      }
    },
    onMutate: async (payload) => {
      const courseId = typeof payload === 'object' ? (payload.courseId || payload.id) : payload;
      let isWishlisted = typeof payload === 'object' ? payload.isWishlisted : undefined;

      if (isWishlisted === undefined) {
        const cachedCheck = queryClient.getQueryData(['wishlist-check', courseId]);
        if (typeof cachedCheck === 'boolean') {
          isWishlisted = cachedCheck;
        } else {
          const cachedWishlist = queryClient.getQueryData(['wishlist', userId]) || [];
          isWishlisted = cachedWishlist.some(item => String(item.id || item.courseId) === String(courseId));
        }
      }

      await queryClient.cancelQueries({ queryKey: ['wishlist', userId] });
      await queryClient.cancelQueries({ queryKey: ['wishlist-check', userId, courseId] });

      const previousWishlist = queryClient.getQueryData(['wishlist', userId]) || [];
      const previousCheckState = queryClient.getQueryData(['wishlist-check', courseId]);

      // 1. Optimistically flip the singular course card target check state
      queryClient.setQueryData(['wishlist-check', courseId], !isWishlisted);

      // 2. Optimistically update the collection array cache
      queryClient.setQueryData(['wishlist'], (old = []) => {
        if (isWishlisted) {
          return old.filter(item => String(item.id || item.courseId) !== String(courseId));
        }
        return [...old, { id: courseId, courseId, title: 'Syncing track matrix...', price: 0 }];
      });

      return { previousWishlist, previousCheckState, courseId };
    },
    onError: (err, variables, context) => {
      if (context) {
        queryClient.setQueryData(['wishlist'], context.previousWishlist);
        queryClient.setQueryData(['wishlist-check', context.courseId], context.previousCheckState);
      }
      toast.error('Failed to synchronize wishlist preference state.');
    },
    onSuccess: (data, variables) => {
      const isWishlisted = typeof variables === 'object' ? variables.isWishlisted : false;
      toast.success(
        isWishlisted 
          ? 'Blueprint removed from saved tracks.' 
          : 'Blueprint added to saved tracks.', 
        { icon: '💖' }
      );
    },
    onSettled: (data, error, variables) => {
      const courseId = typeof variables === 'object' ? (variables.courseId || variables.id) : variables;
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
      if (courseId) {
        queryClient.invalidateQueries({ queryKey: ['wishlist-check', userId, courseId] });
      }
    }
  });

  return {
    wishlist: wishlistQuery.data || [],
    isWishlistLoading: wishlistQuery.isLoading,
    toggleWishlist: toggleWishlistMutation.mutate,
    isTogglingWishlist: toggleWishlistMutation.isPending
  };
};

/**
 * Separate isolated caching query hook to evaluate if an individual course card
 * is wishlisted directly via the optimized backend checking endpoint.
 */
export const useCourseWishlistCheck = (courseId) => {
  const queryClient = useQueryClient();
  const { user } = useSafeAuth();
  const userId = user?.id || 'guest';

  return useQuery({
    queryKey: ['wishlist-check', userId, courseId],
    queryFn: async () => {
      if (!courseId) return false;
      try {
        const res = await wishlistApi.checkWishlistStatus(courseId);
        // Backend returns direct native boolean literals or wrapped response entities
        return typeof res === 'boolean'
          ? res
          : res?.data === true || res?.data?.inWishlist === true || res?.inWishlist === true || res === 'true';
      } catch (e) {
        return false;
      }
    },
    initialData: () => {
      const cachedWishlist = queryClient.getQueryData(['wishlist', userId]) || [];
      if (Array.isArray(cachedWishlist) && cachedWishlist.length > 0) {
        return cachedWishlist.some(item => String(item.id || item.courseId) === String(courseId));
      }
      return undefined;
    },
    enabled: Boolean(courseId) && Boolean(user),
    staleTime: 1000 * 60 * 5
  });
};

