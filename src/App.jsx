import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import { OrderProvider } from "./context/OrderContext";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

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

// ---- Lazy loading with fallback ----
const withFallback = (importFn) => lazy(() => importFn().catch(() => ({
  default: () => <div className="p-8 text-center text-gray-500">Page failed to load.</div>
})));

// Student
const StudentDashboard = withFallback(() => import("./pages/student/StudentDashboard"));
const MyLearning = withFallback(() => import("./pages/student/MyLearning"));
const Wishlist = withFallback(() => import("./pages/student/Wishlist"));
const Orders = withFallback(() => import("./pages/student/Orders"));
const Checkout = withFallback(() => import("./pages/student/Checkout"));
const Cart = withFallback(() => import("./pages/student/Cart"));

// Instructor
const InstructorDashboard = withFallback(() => import("./pages/instructor/Dashboard"));
const CreateCourse = withFallback(() => import("./pages/instructor/CreateCourse"));
const InstructorCourses = withFallback(() => import("./pages/instructor/MyCourses"));
const InstructorAnalytics = withFallback(() => import("./pages/instructor/Analytics"));

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
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2, ease: "easeOut" }}>
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
              
              {/* Student */}
              <Route element={<ProtectedRoute allowedRoles={["student"]}><DashboardLayout /></ProtectedRoute>}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/my-learning" element={<MyLearning />} />
                <Route path="/student/wishlist" element={<Wishlist />} />
                <Route path="/student/orders" element={<Orders />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/cart" element={<Cart />} />
              </Route>

              {/* Instructor */}
              <Route element={<ProtectedRoute allowedRoles={["instructor"]}><DashboardLayout /></ProtectedRoute>}>
                <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
                <Route path="/instructor/create-course" element={<CreateCourse />} />
                <Route path="/instructor/my-courses" element={<InstructorCourses />} />
                <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
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
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
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