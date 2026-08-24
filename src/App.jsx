// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth, getDashboardPath } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import { OrderProvider } from "./context/OrderContext";
import ScrollToTop from "./components/ScrollToTop";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetOtp from "./pages/ResetOtp";
import OtpLogin from "./pages/OtpLogin";
import OtpVerify from "./pages/OtpVerify";
import Landing from "./pages/Landing";

// Dashboard Redirect Component
const DashboardRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const role = user?.role || user?.role1 || user?.userRole || user?.normalizedRole;
  return <Navigate to={getDashboardPath(role)} replace />;
};

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyLearning from "./pages/student/MyLearning";
import Wishlist from "./pages/student/Wishlist";
import Orders from "./pages/student/Orders";
import Checkout from "./pages/student/Checkout";
import Cart from "./pages/student/Cart";

// Instructor Pages
import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import CreateCourse from "./pages/instructor/CreateCourse";
import InstructorCourses from "./pages/instructor/MyCourses";
import InstructorAnalytics from "./pages/instructor/Analytics";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageUsers from "./pages/admin/Users";
import ManageCourses from "./pages/admin/Courses";
import Instructors from "./pages/admin/Instructors";
import AdminOrders from "./pages/admin/Orders";
import Analytics from "./pages/admin/Analytics";
import Certificates from "./pages/admin/Certificates";
import Notifications from "./pages/admin/Notifications";
import Moderation from "./pages/admin/Moderation";
import Support from "./pages/admin/Support";
import CMS from "./pages/admin/CMS";
import Settings from "./pages/admin/Settings";
import Roles from "./pages/admin/Roles";
import AIFeatures from "./pages/admin/AIFeatures";
import Gamification from "./pages/admin/Gamification";
import Payments from "./pages/admin/Payments";
import Reviews from "./pages/admin/Reviews";
import AdminProfile from "./pages/admin/Profile";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminRegister from "./pages/admin/AdminRegister";
import RegistrationSuccess from "./pages/admin/RegistrationSuccess";
import OrderDetails from "./pages/admin/OrderDetails";
import Reports from "./pages/admin/Reports";
import InstructorApplications from "./pages/admin/InstructorApplications";
import SubDashboard from "./pages/admin/SubDashboard";

// Profile Pages
import ProfilePage from "./pages/Profile";
import { Toaster } from "react-hot-toast";

console.log('App.jsx is loading!');

function App() {
  const location = useLocation();
  console.log('App rendering at path:', location.pathname);

  return (
    <AuthProvider>
      <OrderProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Routes location={location}>
              {/* Landing page - public */}
              <Route path="/" element={<Landing />} />
              
              {/* Universal dashboard redirect */}
              <Route path="/dashboard" element={<DashboardRedirect />} />
              
              {/* ✅ Auth routes - wrapped with PublicRoute */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="/reset-otp" element={<PublicRoute><ResetOtp /></PublicRoute>} />
              <Route path="/otp-login" element={<PublicRoute><OtpLogin /></PublicRoute>} />
              <Route path="/otp-verify" element={<PublicRoute><OtpVerify /></PublicRoute>} />

              {/* Admin auth routes */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Registration Success Page */}
              <Route path="/admin/registration-success" element={<RegistrationSuccess />} />

              {/* Student routes - protected */}
              <Route element={<ProtectedRoute allowedRoles={["student"]}><DashboardLayout /></ProtectedRoute>}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/my-learning" element={<MyLearning />} />
                <Route path="/student/wishlist" element={<Wishlist />} />
                <Route path="/student/orders" element={<Orders />} />
                <Route path="/student/profile" element={<ProfilePage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/cart" element={<Cart />} />
              </Route>

              {/* Instructor routes - protected */}
              <Route element={<ProtectedRoute allowedRoles={["instructor"]}><DashboardLayout /></ProtectedRoute>}>
                <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
                <Route path="/instructor/create-course" element={<CreateCourse />} />
                <Route path="/instructor/my-courses" element={<InstructorCourses />} />
                <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
                <Route path="/instructor/profile" element={<ProfilePage />} />
              </Route>

              {/* Admin routes - protected */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "subadmin", "sub_admin", "super_admin"]}><DashboardLayout /></ProtectedRoute>}>
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

              {/* Shared protected routes (for all authenticated users) */}
              <Route element={<ProtectedRoute allowedRoles={["admin", "subadmin", "sub_admin", "student", "instructor"]}><DashboardLayout /></ProtectedRoute>}>
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Fallback - redirect to landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;