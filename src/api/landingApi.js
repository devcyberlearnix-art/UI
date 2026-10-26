// src/api/landingApi.js
import axiosInstance from './axiosInstance';

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
  const response = await axiosInstance.get(path);
  return response.data;
};

const tryFetch = async (paths) => {
  for (const path of paths) {
    try { return await fetchJson(path); } catch { /* try next */ }
  }
  throw new Error(`Unable to fetch from endpoints: ${paths.join(', ')}`);
};

export const landingApi = {
  getLandingPageData: async () => {
    // Only use endpoints that are likely to exist on the backend
    const [coursesPayload] = await Promise.all([
      tryFetch(['/api/v1/courses/featured?limit=6', '/api/v1/courses']).catch(() => ({ courses: [] })),
    ]);

    // Landing page data - if not available, use empty defaults
    const slides = [];
    const features = [];
    const testimonials = [];

    const coursesArray = coursesPayload?.courses || coursesPayload?.data || coursesPayload?.content || coursesPayload?.items || coursesPayload?.results || coursesPayload;
    const courses = (Array.isArray(coursesArray) ? coursesArray : []).map(normalizeCourse);

    // Derive categories from courses if API doesn't provide them
    const categories = [...new Set(courses.map(c => c.category).filter(Boolean))].map(name => ({ name, subcategories: [] }));

    // Stats - use defaults if not available from backend
    const stats = {
      students: courses.reduce((sum, c) => sum + (c.students || 0), 0),
      courses: courses.length,
      instructors: [...new Set(courses.map(c => c.instructor).filter(Boolean))].length,
      satisfaction: courses.length > 0 
        ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1) 
        : 0,
    };

    return { slides, features, testimonials, categories, courses, stats };
  },

  trackCourseImpression: async (courseId, source = 'HOME') => {
    await axiosInstance.post(`/api/v1/courses/${courseId}/impressions?source=${source}`);
  },

  getTrendingCourses: async (page = 0, size = 10, category = '', level = '') => {
    const params = {
      page: String(page),
      size: String(size),
      limit: String(size),
    };
    if (category && category !== 'All') params.category = category;
    if (level && level !== 'All') params.level = level;

    const response = await axiosInstance.get('/api/v1/courses/trending', { params });
    const payload = response.data;
    const data = payload?.data || payload;
    const rawCourses = data?.courses || data?.content || data?.items || data?.results || (Array.isArray(data) ? data : []);
    const items = Array.isArray(rawCourses) ? rawCourses.map(normalizeCourse) : [];
    const totalCourses = Number(data?.totalElements || data?.totalItems || data?.totalCourses || items.length || 0);
    const totalPages = Number(data?.totalPages || Math.ceil(totalCourses / size) || 1);

    return {
      success: true,
      data: {
        courses: items,
        pagination: { page, size, totalPages, totalCourses },
      },
    };
  },
};

export default landingApi;