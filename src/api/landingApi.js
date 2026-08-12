import { buildApiUrl } from "../config/api";

const fetchJson = async (path) => {
  const response = await fetch(buildApiUrl(path));
  if (!response.ok) {
    throw new Error(`Failed request: ${path}`);
  }
  return response.json();
};

const tryFetch = async (paths) => {
  for (const path of paths) {
    try {
      return await fetchJson(path);
    } catch {
      // Try next candidate endpoint.
    }
  }
  throw new Error(`Unable to fetch from endpoints: ${paths.join(", ")}`);
};

export const landingApi = {
  getLandingPageData: async () => {
    const [landingPayload, coursesPayload, statsPayload] = await Promise.all([
      tryFetch(["/api/v1/public/landing", "/api/v1/landing", "/landing"]).catch(() => ({})),
      tryFetch(["/api/v1/courses/featured?limit=6", "/api/v1/courses"]),
      tryFetch(["/api/v1/courses/stats", "/api/v1/public/stats", "/api/v1/stats", "/stats"]).catch(() => ({})),
    ]);

    const slides =
      landingPayload?.slides ||
      landingPayload?.heroSlides ||
      landingPayload?.data?.slides ||
      [];

    const features =
      landingPayload?.features ||
      landingPayload?.highlights ||
      landingPayload?.data?.features ||
      [];

    const testimonials =
      landingPayload?.testimonials ||
      landingPayload?.reviews ||
      landingPayload?.data?.testimonials ||
      [];

    const courses = coursesPayload?.courses || coursesPayload?.data || coursesPayload || [];

    const landingCategories =
      landingPayload?.categories ||
      landingPayload?.courseCategories ||
      landingPayload?.data?.categories ||
      [];
    const categories = landingCategories.length
      ? landingCategories
      : [...new Set(courses.map((course) => course.category).filter(Boolean))].map((name) => ({
          name,
          subcategories: [],
        }));

    const statsSource = statsPayload?.stats || statsPayload?.data || statsPayload || {};
    const stats = {
      students: Number(statsSource.students || statsSource.totalStudents || 0),
      courses: Number(statsSource.courses || statsSource.totalCourses || courses.length),
      instructors: Number(statsSource.instructors || statsSource.totalInstructors || 0),
      satisfaction: Number(statsSource.satisfaction || statsSource.successRate || 0),
    };

    return {
      slides,
      features,
      testimonials,
      categories,
      courses,
      stats,
    };
  },

  trackCourseImpression: async (courseId, source = "HOME") => {
    const response = await fetch(buildApiUrl(`/api/v1/courses/${courseId}/impressions?source=${source}`), {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`Failed to track course impression: ${courseId}`);
    }
  },
};

export default landingApi;
