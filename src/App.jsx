import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import { OrderProvider } from "./context/OrderContext";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

// ---- Lazy loading with fallback ----
const withFallback = (importFn) => lazy(() => importFn().catch(() => ({
  default: () => <div className="p-8 text-center text-gray-500">Page failed to load.</div>
})));

// ---- Imports ----
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetOtp from "./pages/ResetOtp";
import OtpLogin from "./pages/OtpLogin";
import OtpVerify from "./pages/OtpVerify";
import AdminLogin from "./pages/admin/AdminLogin";
import RegistrationSuccess from "./pages/admin/RegistrationSuccess";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Profile from "./pages/Profile";
import Cart from "./pages/student/Cart";
import Wishlist from "./pages/student/Wishlist";
import Checkout from "./pages/student/Checkout";
import Orders from "./pages/student/Orders";
import StudentCourseDetail from "./pages/student/StudentCourseDetail";

// New pages
const QuizPage = withFallback(() => import("./pages/student/QuizPage"));
const CertificatePage = withFallback(() => import("./pages/student/CertificatePage"));
const LiveClassPage = withFallback(() => import("./pages/student/LiveClassPage"));
const ReviewPage = withFallback(() => import("./pages/student/ReviewPage"));
const NotificationPage = withFallback(() => import("./pages/student/NotificationPage"));
const StudentAssignments = withFallback(() => import("./pages/student/Assignments"));
const NotificationPreferences = withFallback(() => import("./pages/student/NotificationPreferences"));
const BannerManagement = withFallback(() => import("./pages/admin/BannerManagement"));

// Student
const StudentDashboard = withFallback(() => import("./pages/student/StudentDashboard"));
const MyLearning = withFallback(() => import("./pages/student/MyLearning"));

// Instructor
const InstructorDashboard = withFallback(() => import("./pages/instructor/Dashboard"));
const CreateCourse = withFallback(() => import("./pages/instructor/CreateCourse"));
const InstructorCourses = withFallback(() => import("./pages/instructor/MyCourses"));
const InstructorAnalytics = withFallback(() => import("./pages/instructor/Analytics"));
const InstructorAssignments = withFallback(() => import("./pages/instructor/Assignments"));

// Admin
const AdminDashboard = withFallback(() => import("./pages/admin/Dashboard"));
const ManageUsers = withFallback(() => import("./pages/admin/Users"));
const ManageCourses = withFallback(() => import("./pages/admin/Courses"));
const Instructors = withFallback(() => import("./pages/admin/Instructors"));
const AdminOrders = withFallback(() => import("./pages/admin/Orders"));
const Analytics = withFallback(() => import("./pages/admin/Analytics"));
const Certificates = withFallback(() => import("./pages/admin/Certificates"));
const Notifications = withFallback(() => import("./pages/admin/Notifications"));
const Moderation = withFallback(() => import("./pages/admin/Moderation"));
const Support = withFallback(() => import("./pages/admin/Support"));
const CMS = withFallback(() => import("./pages/admin/CMS"));
const Settings = withFallback(() => import("./pages/admin/Settings"));
const Roles = withFallback(() => import("./pages/admin/Roles"));
const AIFeatures = withFallback(() => import("./pages/admin/AIFeatures"));
const Gamification = withFallback(() => import("./pages/admin/Gamification"));
const Payments = withFallback(() => import("./pages/admin/Payments"));
const Reviews = withFallback(() => import("./pages/admin/Reviews"));
const AdminProfile = withFallback(() => import("./pages/admin/Profile"));
const AdminManagement = withFallback(() => import("./pages/admin/AdminManagement"));
const AdminRegister = withFallback(() => import("./pages/admin/AdminRegister"));
const OrderDetails = withFallback(() => import("./pages/admin/OrderDetails"));
const Reports = withFallback(() => import("./pages/admin/Reports"));
const InstructorApplications = withFallback(() => import("./pages/admin/InstructorApplications"));
const SubDashboard = withFallback(() => import("./pages/admin/SubDashboard"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
  </div>
);

function AnimatedRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-otp" element={<ResetOtp />} />
          <Route path="/otp-login" element={<OtpLogin />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/registration-success" element={<RegistrationSuccess />} />

          {/* Public Routes */}
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />

          {/* Student */}
          <Route element={<ProtectedRoute allowedRoles={["student"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/my-learning" element={<MyLearning />} />
            <Route path="/student/orders" element={<Orders />} />
            <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
            <Route path="/student/courses/:courseId/quiz/:quizId" element={<QuizPage />} />
            <Route path="/student/courses/:courseId/certificate" element={<CertificatePage />} />
            <Route path="/student/courses/:courseId/live-classes" element={<LiveClassPage />} />
            <Route path="/student/courses/:courseId/reviews" element={<ReviewPage />} />
            <Route path="/student/courses/:courseId/assignments" element={<StudentAssignments />} />
            <Route path="/student/notifications" element={<NotificationPage />} />
            <Route path="/student/notification-preferences" element={<NotificationPreferences />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Instructor */}
          <Route element={<ProtectedRoute allowedRoles={["instructor"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/create-course" element={<CreateCourse />} />
            <Route path="/instructor/my-courses" element={<InstructorCourses />} />
            <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
            <Route path="/instructor/courses/:courseId/assignments" element={<InstructorAssignments />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "super_admin", "sub_admin"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
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
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <OrderProvider>
        <AnimatedRoutes />
      </OrderProvider>
    </ErrorBoundary>
  );
}

export default App;