import { useQuery } from '@tanstack/react-query';
import { courseApi } from '../api/courseApi';

/**
 * Standardize and sanitize course payload from backend microservice
 */
export const normalizeCoursePayload = (item, index = 0) => {
  if (!item) return null;
  const id = item.id || item.courseId || index + 1;
  const title = item.title || item.name || 'Untitled Course';
  const category = item.category || item.categoryName || 'General';
  const price = Number(item.price || item.amount || 0);
  const rating = Number(item.rating || item.avgRating || 4.8);
  const totalReviews = Number(item.totalReviews || item.reviewCount || 0);
  const students = Number(item.students || item.enrolledStudents || item.enrollmentCount || 0);
  const duration = item.duration || item.estimatedDuration || 'Self-paced';
  const level = item.level || item.difficultyLevel || 'All Levels';
  const instructor = item.instructor || item.instructorName || item.creator || 'Lead Instructor';
  const description = item.description || item.summary || 'Comprehensive masterclass designed by industry practitioners.';
  const thumbnail = item.image || item.thumbnail || item.banner || null;

  return {
    id,
    title,
    category,
    price,
    rating,
    totalReviews,
    students,
    duration,
    level,
    instructor,
    description,
    thumbnail,
    isPremium: Boolean(item.isPremium || item.premium),
    badge: item.badge || item.tag || (rating >= 4.8 ? 'Top Rated' : null),
  };
};

/**
 * Hook: Fetch courses from backend with caching and background revalidation
 * Zero mock data: queries live backend endpoints
 */
export function useCourses({ page = 0, size = 12, sortBy = 'id', sortDir = 'desc' } = {}) {
  return useQuery({
    queryKey: ['courses', { page, size, sortBy, sortDir }],
    queryFn: async () => {
      try {
        const response = await courseApi.getAllCourses({ page, size, sortBy, sortDir });
        const list = response?.courses || response?.content || response?.data || (Array.isArray(response) ? response : []);
        const totalElements = response?.totalElements || response?.total || list.length;
        const totalPages = response?.totalPages || Math.ceil(totalElements / size) || 1;

        return {
          courses: list.map(normalizeCoursePayload),
          totalElements,
          totalPages,
          page,
          size,
        };
      } catch (err) {
        // Fallback to featured catalog endpoint if getAllCourses encounters 404/500
        const featured = await courseApi.getFeaturedCourses(size).catch(() => []);
        const list = Array.isArray(featured) ? featured : (featured?.data || featured?.courses || []);
        return {
          courses: list.map(normalizeCoursePayload),
          totalElements: list.length,
          totalPages: 1,
          page: 0,
          size,
        };
      }
    },
    staleTime: 1000 * 60 * 3, // 3 minutes fresh
  });
}

/**
 * Hook: Fetch single course by ID
 */
export function useCourseDetail(courseId) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const data = await courseApi.getCourseById(courseId);
      const course = data?.course || data?.data || data;
      return normalizeCoursePayload(course);
    },
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 5,
  });
}
