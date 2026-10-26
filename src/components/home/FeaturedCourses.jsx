import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Clock, Users, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { courseApi } from "../../api/courseApi";
import { useAuth } from "../../context/AuthContext";

const FeaturedCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getFeaturedCourses(8);
        const coursesData = response?.data?.courses || response?.courses || response || [];
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (err) {
        console.error("Failed to fetch featured courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-asivo-navy">Featured Courses</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-asivo-border overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-asivo-navy mb-4">Featured Courses</h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (courses.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-asivo-navy mb-4">Featured Courses</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No featured courses available at the moment.</p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 mt-4 text-asivo-primary font-semibold hover:text-asivo-primary/80"
            >
              Browse all courses
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-asivo-navy">Featured Courses</h2>
          <Link
            to="/courses"
            className="flex items-center gap-2 text-asivo-primary font-semibold hover:text-asivo-primary/80 transition-colors"
          >
            View All
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="group bg-white rounded-xl border border-asivo-border overflow-hidden hover:shadow-xl hover:border-asivo-primary/30 transition-all duration-300 cursor-pointer"
            >
              {/* Course Thumbnail */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={course.image || course.thumbnail || "https://via.placeholder.com/400x250?text=Course"}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {course.tag && (
                  <span className="absolute top-3 left-3 bg-asivo-primary text-white text-xs font-semibold px-2 py-1 rounded">
                    {course.tag}
                  </span>
                )}
              </div>

              {/* Course Content */}
              <div className="p-4">
                <h3 className="font-semibold text-asivo-dark mb-2 line-clamp-2 group-hover:text-asivo-primary transition-colors">
                  {course.title}
                </h3>

                <p className="text-sm text-asivo-secondary mb-3 line-clamp-2">
                  {course.description || course.summary}
                </p>

                {/* Instructor */}
                {course.instructor && (
                  <p className="text-xs text-asivo-secondary mb-3">
                    by {course.instructor}
                  </p>
                )}

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-asivo-dark">
                      {course.rating || course.avgRating || "4.5"}
                    </span>
                  </div>
                  {course.totalReviews && (
                    <span className="text-xs text-asivo-secondary">
                      ({course.totalReviews} reviews)
                    </span>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-asivo-secondary mb-4">
                  {course.duration && (
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{course.duration}</span>
                    </div>
                  )}
                  {course.students && (
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{course.students} students</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <button className="w-full py-2.5 bg-asivo-bg-soft text-asivo-primary font-semibold rounded-lg group-hover:bg-asivo-primary group-hover:text-white transition-all">
                  {isAuthenticated ? "Continue Learning" : "Enroll Now"}
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
