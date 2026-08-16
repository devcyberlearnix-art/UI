// src/api/landingApi.js
import { buildApiUrl } from '../config/api';

const normalizeCourse = (course, index) => {
  const title = course.title || course.name || `Course ${index + 1}`;
  return {
    id: course.id || course.courseId || index + 1,
    title,
    category: course.category || course.categoryName || 'General',
    subcategory: course.subcategory || course.subCategory || 'General',
    students: Number(course.students || course.enrollmentCount || course.enrolledStudents || 0),
    rating: Number(course.rating || course.avgRating || 0),
    image: course.image || course.thumbnail || course.banner || 'https://via.placeholder.com/500x300?text=Course',
    duration: course.duration || course.estimatedDuration || 'Self-paced',
    level: course.level || course.difficultyLevel || 'All levels',
    tag: course.tag || course.badge || '',
    premium: Boolean(course.premium || course.isPremium),
    featuredScore: Number(course.featuredScore || course.trendingScore || 0),
    totalReviews: Number(course.totalReviews || course.reviewCount || 0),
    price: Number(course.price || course.amount || 0),
    description: course.description || course.summary || '',
    instructor: course.instructor || course.instructorName || course.creator || 'Instructor',
  };
};

const fetchJson = async (path) => {
  const response = await fetch(buildApiUrl(path));
  if (!response.ok) throw new Error(`Failed request: ${path}`);
  return response.json();
};

const tryFetch = async (paths) => {
  for (const path of paths) {
    try { return await fetchJson(path); } catch { /* try next */ }
  }
  throw new Error(`Unable to fetch from endpoints: ${paths.join(', ')}`);
};

export const landingApi = {
  getLandingPageData: async () => {
    const [landingPayload, coursesPayload, statsPayload] = await Promise.all([
      tryFetch(['/api/v1/public/landing', '/api/v1/landing', '/landing']).catch(() => ({})),
      tryFetch(['/api/v1/courses/featured?limit=6', '/api/v1/courses']),
      tryFetch(['/api/v1/courses/stats', '/api/v1/public/stats', '/api/v1/stats', '/stats']).catch(() => ({})),
    ]);

    const slides = landingPayload?.slides || landingPayload?.heroSlides || landingPayload?.data?.slides || [];
    const features = landingPayload?.features || landingPayload?.highlights || landingPayload?.data?.features || [];
    const testimonials = landingPayload?.testimonials || landingPayload?.reviews || landingPayload?.data?.testimonials || [];
    const courses = (coursesPayload?.courses || coursesPayload?.data || coursesPayload || []).map(normalizeCourse);

    const landingCategories = landingPayload?.categories || landingPayload?.courseCategories || landingPayload?.data?.categories || [];
    const categories = landingCategories.length
      ? landingCategories
      : [...new Set(courses.map(c => c.category).filter(Boolean))].map(name => ({ name, subcategories: [] }));

    const statsSource = statsPayload?.stats || statsPayload?.data || statsPayload || {};
    const stats = {
      students: Number(statsSource.students || statsSource.totalStudents || 0),
      courses: Number(statsSource.courses || statsSource.totalCourses || courses.length),
      instructors: Number(statsSource.instructors || statsSource.totalInstructors || 0),
      satisfaction: Number(statsSource.satisfaction || statsSource.successRate || 0),
    };

    return { slides, features, testimonials, categories, courses, stats };
  },

  trackCourseImpression: async (courseId, source = 'HOME') => {
    const response = await fetch(buildApiUrl(`/api/v1/courses/${courseId}/impressions?source=${source}`), { method: 'POST' });
    if (!response.ok) throw new Error(`Failed to track course impression: ${courseId}`);
  },

  getTrendingCourses: async (page = 0, limit = 5) => {
    const requestUrl = new URL(buildApiUrl('/api/v1/courses/trending'));
    requestUrl.searchParams.set('page', String(page));
    requestUrl.searchParams.set('limit', String(limit));

    const response = await fetch(requestUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trending courses (${response.status})`);
    }

    const payload = await response.json();
    const data = payload?.data || payload;
    const rawCourses = data?.courses || data?.content || data?.items || data?.results || [];
    const items = Array.isArray(rawCourses) ? rawCourses.map(normalizeCourse) : [];
    const totalCourses = Number(data?.totalElements || data?.totalItems || data?.totalCourses || items.length || 0);
    const totalPages = Number(data?.totalPages || Math.ceil(totalCourses / limit) || 1);

    return {
      success: true,
      data: {
        courses: items,
        pagination: { page, limit, totalPages, totalCourses },
      },
    };
  },
};

export default landingApi;