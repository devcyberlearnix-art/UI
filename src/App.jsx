// src/App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Primitives & Global Workspace Layout Components
import PageLoader from './components/common/PageLoader';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import { OrderProvider } from './context/OrderContext';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy loading with graceful fallback
const withFallback = (importFn) =>
  lazy(() =>
    importFn().catch(() => ({
      default: () => (
        <div className="p-8 text-center text-[#8E8E93] bg-[#070709] min-h-[400px] flex items-center justify-center font-mono text-xs">
          Module failed to hydrate. Refreshing network interface...
        </div>
      ),
    }))
  );

// Static Core Views
import LandingDashboard from './pages/LandingDashboard';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetOtp from './pages/ResetOtp';
import OtpLogin from './pages/OtpLogin';
import OtpVerify from './pages/OtpVerify';
import AdminLogin from './pages/admin/AdminLogin';
import RegistrationSuccess from './pages/admin/RegistrationSuccess';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import ProfileWorkspace from './pages/student/ProfileWorkspace';
import ShoppingCartWorkspace from './pages/student/ShoppingCartWorkspace';
import Cart from './pages/student/Cart';
import Wishlist from './pages/student/Wishlist';
import CheckoutContainer from './pages/student/CheckoutContainer';
import Checkout from './pages/student/Checkout';
import ResilientCheckout from './pages/student/ResilientCheckout';
import Orders from './pages/student/Orders';
import StudentCourseDetail from './pages/student/StudentCourseDetail';

// Code-split Student & Classroom Workspaces
const ClassroomView = withFallback(() => import('./pages/student/ClassroomView'));
const QuizPage = withFallback(() => import('./pages/student/QuizPage'));
const CertificatePage = withFallback(() => import('./pages/student/CertificatePage'));
const LiveClassPage = withFallback(() => import('./pages/student/LiveClassPage'));
const LiveClassrooms = withFallback(() => import('./pages/student/LiveClassrooms'));
const ReviewPage = withFallback(() => import('./pages/student/ReviewPage'));
const NotificationPage = withFallback(() => import('./pages/student/NotificationPage'));
const StudentAssignments = withFallback(() => import('./pages/student/Assignments'));
const NotificationPreferences = withFallback(() => import('./pages/student/NotificationPreferences'));
const CertificateVerification = withFallback(() => import('./pages/student/CertificateVerification'));
const StudentDashboard = withFallback(() => import('./pages/student/StudentDashboard'));
const MyLearning = withFallback(() => import('./pages/student/MyLearning'));
const InstructorApplication = withFallback(() => import('./pages/student/InstructorApplication'));

// Code-split Instructor Hub
const InstructorDashboard = withFallback(() => import('./pages/instructor/Dashboard'));
const CreateCourse = withFallback(() => import('./pages/instructor/CreateCourse'));
const InstructorCourses = withFallback(() => import('./pages/instructor/MyCourses'));
const InstructorAnalytics = withFallback(() => import('./pages/instructor/Analytics'));
const InstructorAssignments = withFallback(() => import('./pages/instructor/Assignments'));

// Code-split Admin Command Center
const AdminDashboard = withFallback(() => import('./pages/admin/Dashboard'));
const AdminCommandCenter = withFallback(() => import('./pages/admin/AdminCommandCenter'));
const SubDashboard = withFallback(() => import('./pages/admin/SubDashboard'));
const ManageUsers = withFallback(() => import('./pages/admin/Users'));
const ManageCourses = withFallback(() => import('./pages/admin/Courses'));
const Instructors = withFallback(() => import('./pages/admin/Instructors'));
const AdminOrders = withFallback(() => import('./pages/admin/Orders'));
const Analytics = withFallback(() => import('./pages/admin/Analytics'));
const Certificates = withFallback(() => import('./pages/admin/Certificates'));
const Notifications = withFallback(() => import('./pages/admin/Notifications'));
const Moderation = withFallback(() => import('./pages/admin/Moderation'));
const Support = withFallback(() => import('./pages/admin/Support'));
const CMS = withFallback(() => import('./pages/admin/CMS'));
const Settings = withFallback(() => import('./pages/admin/Settings'));
const Roles = withFallback(() => import('./pages/admin/Roles'));
const AIFeatures = withFallback(() => import('./pages/admin/AIFeatures'));
const Gamification = withFallback(() => import('./pages/admin/Gamification'));
const Payments = withFallback(() => import('./pages/admin/Payments'));
const Reviews = withFallback(() => import('./pages/admin/Reviews'));
const AdminProfile = withFallback(() => import('./pages/admin/Profile'));
const AdminManagement = withFallback(() => import('./pages/admin/AdminManagement'));
const AdminRegister = withFallback(() => import('./pages/admin/AdminRegister'));
const OrderDetails = withFallback(() => import('./pages/admin/OrderDetails'));
const Reports = withFallback(() => import('./pages/admin/Reports'));
const InstructorApplications = withFallback(() => import('./pages/admin/InstructorApplications'));
const BannerManagement = withFallback(() => import('./pages/admin/BannerManagement'));

import { useWebSocketNotifications } from './hooks/useWebSocketNotifications';

function WebSocketNotificationBridge() {
  useWebSocketNotifications();
  return null;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  // Derive target dashboard based on user role
  const getDashboardRedirect = () => {
    if (!user) return '/student/dashboard';
    const role = (user.role || '').toLowerCase();
    if (role.includes('admin')) return '/admin/dashboard';
    if (role === 'instructor') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  return (
    <ErrorBoundary>
      <OrderProvider>
        <ScrollToTop />
        <WebSocketNotificationBridge />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* =========================================================================
                PUBLIC ENTRY LAYER: Open to all unauthenticated network scopes by default
                ========================================================================= */}
            <Route path="/" element={<LandingDashboard />} />
            <Route path="/legacy-landing" element={<Landing />} />

            {/* Public Authentication Channels */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to={getDashboardRedirect()} replace />}
            />
            <Route
              path="/register"
              element={!user ? <Register /> : <Navigate to={getDashboardRedirect()} replace />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-otp" element={<ResetOtp />} />
            <Route path="/otp-login" element={<OtpLogin />} />
            <Route path="/otp-verify" element={<OtpVerify />} />
            <Route
              path="/admin/login"
              element={!user ? <AdminLogin /> : <Navigate to="/admin/dashboard" replace />}
            />
            <Route path="/admin/registration-success" element={<RegistrationSuccess />} />

            {/* Public Catalog & Verification Channels */}
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/cart" element={<ShoppingCartWorkspace />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/student/courses" element={<Courses />} />
            <Route path="/checkout" element={<CheckoutContainer />} />
            <Route path="/resilient-checkout" element={<ResilientCheckout />} />
            <Route path="/student/resilient-checkout" element={<ResilientCheckout />} />
            <Route path="/legacy-checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/certifications" element={<CertificateVerification />} />
            <Route path="/verify-certificate/:certificateId" element={<CertificateVerification />} />
            <Route path="/verify-certificate" element={<CertificateVerification />} />
            <Route path="/instructor/apply" element={<InstructorApplication />} />
            <Route path="/student/instructor-application" element={<InstructorApplication />} />
            <Route path="/my-learning" element={<Navigate to="/student/my-learning" replace />} />

            {/* =========================================================================
                AUTHENTICATED SECURE TIERS: Student Role Guard Network
                ========================================================================= */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<ProfileWorkspace />} />
              <Route path="/student/cart" element={<ShoppingCartWorkspace />} />
              <Route path="/student/my-learning" element={<MyLearning />} />
              <Route path="/student/wishlist" element={<Wishlist />} />
              <Route path="/student/orders" element={<Orders />} />
              <Route path="/student/live-classes" element={<LiveClassrooms />} />
              <Route path="/student/assignments" element={<StudentAssignments />} />
              <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
              <Route path="/student/courses/:courseId/classroom" element={<ClassroomView />} />
              <Route path="/student/courses/:courseId/classroom/quiz/:quizId" element={<ClassroomView />} />
              <Route path="/classroom/:courseId" element={<ClassroomView />} />
              <Route path="/student/courses/:courseId/quiz/:quizId" element={<QuizPage />} />
              <Route path="/student/courses/:courseId/certificate" element={<CertificatePage />} />
              <Route path="/student/courses/:courseId/live-classes" element={<LiveClassrooms />} />
              <Route path="/student/courses/:courseId/reviews" element={<ReviewPage />} />
              <Route path="/student/courses/:courseId/assignments" element={<StudentAssignments />} />
              <Route path="/student/notifications" element={<NotificationPage />} />
              <Route path="/student/notification-preferences" element={<NotificationPreferences />} />
              <Route path="/profile" element={<ProfileWorkspace />} />
            </Route>

            {/* =========================================================================
                AUTHENTICATED SECURE TIERS: Instructor Role Guard Network
                ========================================================================= */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
              <Route path="/instructor/create-course" element={<CreateCourse />} />
              <Route path="/instructor/edit-course/:courseId" element={<CreateCourse />} />
              <Route path="/instructor/courses/:courseId/edit" element={<CreateCourse />} />
              <Route path="/instructor/my-courses" element={<InstructorCourses />} />
              <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
              <Route path="/instructor/courses/:courseId/assignments" element={<InstructorAssignments />} />
              <Route path="/profile" element={<ProfileWorkspace />} />
            </Route>

            {/* =========================================================================
                AUTHENTICATED SECURE TIERS: Admin Command Center
                ========================================================================= */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['admin', 'super_admin', 'sub_admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/command-center" element={<AdminCommandCenter />} />
              <Route path="/admin/command-center/:tab" element={<AdminCommandCenter />} />
              <Route path="/admin/sub-dashboard" element={<SubDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/courses" element={<ManageCourses />} />
              <Route path="/admin/instructors" element={<Instructors />} />
              <Route path="/admin/instructor-applications" element={<InstructorApplications />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/orders/:orderId" element={<OrderDetails />} />
              <Route path="/admin/payments" element={<Payments />} />
              <Route path="/admin/certificates" element={<Certificates />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/reviews" element={<Reviews />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/banners" element={<BannerManagement />} />
              <Route path="/admin/admins" element={<AdminManagement />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin/moderation" element={<Moderation />} />
              <Route path="/admin/support" element={<Support />} />
              <Route path="/admin/cms" element={<CMS />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/roles" element={<Roles />} />
              <Route path="/admin/ai-features" element={<AIFeatures />} />
              <Route path="/admin/gamification" element={<Gamification />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/profile" element={<ProfileWorkspace />} />
            </Route>

            {/* =========================================================================
                GLOBAL STRUCTURAL WILDCARD FALLBACK
                Safely redirect unauthenticated sessions to / and authenticated users to their specific dashboard
                ========================================================================= */}
            <Route path="*" element={<Navigate to={user ? getDashboardRedirect() : '/'} replace />} />
          </Routes>
        </Suspense>
      </OrderProvider>
    </ErrorBoundary>
  );
}