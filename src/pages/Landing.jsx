import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import AsivoHero from "../components/home/AsivoHero";
import PopularCategories from "../components/home/PopularCategories";
import FeaturedCourses from "../components/home/FeaturedCourses";

function Landing() {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated, loading: authLoading } = useAuth();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser) {
      const role = (authUser.role || '').toLowerCase();
      let dashboardPath = '/student/dashboard';
      if (role.includes('admin') || role === 'super_admin' || role === 'sub_admin') {
        dashboardPath = '/admin/dashboard';
      } else if (role.includes('instructor')) {
        dashboardPath = '/instructor/dashboard';
      }
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, authUser, navigate]);

  // If still loading auth, show spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-asivo-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated, we already redirect (see useEffect above), but to avoid flash we return null
  if (!authLoading && isAuthenticated) {
    return null;
  }

  const stats = {
    courses: 500,
    learners: 50000,
    projects: 10000,
    rating: 4.8,
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-16">
        <AsivoHero stats={stats} />
        <PopularCategories />
        <FeaturedCourses />
      </main>
      <Footer />
    </div>
  );
}

export default Landing;
