// src/App.jsx
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import { OrderProvider } from "./context/OrderContext";
import ScrollToTop from "./components/ScrollToTop";

// ─── Lazy-loaded pages: each chunk only loads when that route is visited ───────

// Auth Pages
const Login            = lazy(() => import("./pages/Login"));
const Register         = lazy(() => import("./pages/Register"));
const ForgotPassword   = lazy(() => import("./pages/ForgotPassword"));
const ResetOtp         = lazy(() => import("./pages/ResetOtp"));
const OtpLogin         = lazy(() => import("./pages/OtpLogin"));
const OtpVerify        = lazy(() => import("./pages/OtpVerify"));
const Landing          = lazy(() => import("./pages/Landing"));

// Student Pages
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const MyLearning       = lazy(() => import("./pages/student/MyLearning"));
const Wishlist         = lazy(() => import("./pages/student/Wishlist"));
const Orders           = lazy(() => import("./pages/student/Orders"));
const Checkout         = lazy(() => import("./pages/student/Checkout"));
const Cart             = lazy(() => import("./pages/student/Cart"));

// Instructor Pages
const InstructorDashboard = lazy(() => import("./pages/instructor/InstructorDashboard"));
const CreateCourse        = lazy(() => import("./pages/instructor/CreateCourse"));
const InstructorCourses   = lazy(() => import("./pages/instructor/MyCourses"));
const InstructorAnalytics = lazy(() => import("./pages/instructor/Analytics"));
const CourseStudents      = lazy(() => import("./pages/instructor/CourseStudents"));
const CourseDetail        = lazy(() => import("./pages/instructor/CourseDetail"));
const EditCourse          = lazy(() => import("./pages/instructor/EditCourse"));

// Admin Pages
const AdminDashboard         = lazy(() => import("./pages/admin/Dashboard"));
const ManageUsers            = lazy(() => import("./pages/admin/Users"));
const ManageCourses          = lazy(() => import("./pages/admin/Courses"));
const Instructors            = lazy(() => import("./pages/admin/Instructors"));
const AdminOrders            = lazy(() => import("./pages/admin/Orders"));
const Analytics              = lazy(() => import("./pages/admin/Analytics"));
const Certificates           = lazy(() => import("./pages/admin/Certificates"));
const Notifications          = lazy(() => import("./pages/admin/Notifications"));
const Moderation             = lazy(() => import("./pages/admin/Moderation"));
const Support                = lazy(() => import("./pages/admin/Support"));
const CMS                    = lazy(() => import("./pages/admin/CMS"));
const Settings               = lazy(() => import("./pages/admin/Settings"));
const Roles                  = lazy(() => import("./pages/admin/Roles"));
const AIFeatures             = lazy(() => import("./pages/admin/AIFeatures"));
const Gamification           = lazy(() => import("./pages/admin/Gamification"));
const Payments               = lazy(() => import("./pages/admin/Payments"));
const Reviews                = lazy(() => import("./pages/admin/Reviews"));
const AdminProfile           = lazy(() => import("./pages/admin/Profile"));
const AdminLogin             = lazy(() => import("./pages/admin/AdminLogin"));
const AdminManagement        = lazy(() => import("./pages/admin/AdminManagement"));
const AdminRegister          = lazy(() => import("./pages/admin/AdminRegister"));
const RegistrationSuccess    = lazy(() => import("./pages/admin/RegistrationSuccess"));
const OrderDetails           = lazy(() => import("./pages/admin/OrderDetails"));
const Reports                = lazy(() => import("./pages/admin/Reports"));
const InstructorApplications = lazy(() => import("./pages/admin/InstructorApplications"));
const SubDashboard           = lazy(() => import("./pages/admin/SubDashboard"));

// ─── Lightweight inline page-transition spinner ───────────────────────────────
const PageLoader = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#f8fafc",
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: "50%",
      border: "4px solid #fee2e2",
      borderTop: "4px solid #f97316",
      animation: "spin 0.7s linear infinite",
    }} />
    <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
  </div>
);

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const location = useLocation();

  return (
    <OrderProvider>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes location={location}>
          {/* Public */}
          <Route path="/"                      element={<Landing />} />
          <Route path="/login"                 element={<Login />} />
          <Route path="/register"              element={<Register />} />
          <Route path="/forgot-password"       element={<ForgotPassword />} />
          <Route path="/reset-otp"             element={<ResetOtp />} />
          <Route path="/otp-login"             element={<OtpLogin />} />
          <Route path="/otp-verify"            element={<OtpVerify />} />

          {/* Admin auth */}
          <Route path="/admin/login"               element={<AdminLogin />} />
          <Route path="/admin/registration-success" element={<RegistrationSuccess />} />

          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={["student"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/student/dashboard"   element={<StudentDashboard />} />
            <Route path="/student/my-learning" element={<MyLearning />} />
            <Route path="/student/wishlist"    element={<Wishlist />} />
            <Route path="/student/orders"      element={<Orders />} />
            <Route path="/checkout"            element={<Checkout />} />
            <Route path="/cart"                element={<Cart />} />
          </Route>

          {/* Instructor routes */}
          <Route element={<ProtectedRoute allowedRoles={["instructor","admin","super_admin","sub_admin","main_admin","main"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/instructor/dashboard"                       element={<InstructorDashboard />} />
            <Route path="/instructor/create-course"                   element={<CreateCourse />} />
            <Route path="/instructor/my-courses"                      element={<InstructorCourses />} />
            <Route path="/instructor/courses/:courseId"               element={<CourseDetail />} />
            <Route path="/instructor/courses/:courseId/edit"          element={<EditCourse />} />
            <Route path="/instructor/courses/:courseId/students"      element={<CourseStudents />} />
            <Route path="/instructor/analytics"                       element={<InstructorAnalytics />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin","super_admin","sub_admin","main_admin","main"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard"               element={<AdminDashboard />} />
            <Route path="/admin/sub-dashboard"           element={<SubDashboard />} />
            <Route path="/admin/users"                   element={<ManageUsers />} />
            <Route path="/admin/courses"                 element={<ManageCourses />} />
            <Route path="/admin/courses/:courseId/students" element={<CourseStudents />} />
            <Route path="/admin/instructors"             element={<Instructors />} />
            <Route path="/admin/instructor-applications" element={<InstructorApplications />} />
            <Route path="/admin/orders"                  element={<AdminOrders />} />
            <Route path="/admin/orders/:orderId"         element={<OrderDetails />} />
            <Route path="/admin/payments"                element={<Payments />} />
            <Route path="/admin/certificates"            element={<Certificates />} />
            <Route path="/admin/analytics"               element={<Analytics />} />
            <Route path="/admin/reports"                 element={<Reports />} />
            <Route path="/admin/reviews"                 element={<Reviews />} />
            <Route path="/admin/notifications"           element={<Notifications />} />
            <Route path="/admin/admins"                  element={<AdminManagement />} />
            <Route path="/admin/register"                element={<AdminRegister />} />
            <Route path="/admin/moderation"              element={<Moderation />} />
            <Route path="/admin/support"                 element={<Support />} />
            <Route path="/admin/cms"                     element={<CMS />} />
            <Route path="/admin/settings"                element={<Settings />} />
            <Route path="/admin/roles"                   element={<Roles />} />
            <Route path="/admin/ai-features"             element={<AIFeatures />} />
            <Route path="/admin/gamification"            element={<Gamification />} />
            <Route path="/admin/profile"                 element={<AdminProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </OrderProvider>
  );
}

export default App;