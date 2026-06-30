import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetOtp from "./pages/ResetOtp";
import OtpLogin from "./pages/OtpLogin";
import OtpVerify from "./pages/OtpVerify";
import Landing from "./pages/Landing";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyLearning from "./pages/student/MyLearning";
import Wishlist from "./pages/student/Wishlist";
import Orders from "./pages/student/Orders";
import Checkout from "./pages/student/Checkout";
import Cart from "./pages/student/Cart";

// ✅ Certification & Subscription pages
import Certifications from "./pages/Certifications";   // already exists
import Subscription from "./pages/Subscription";     // create this page or import your existing one

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
import Analytics from "./pages/admin/Analytics.jsx";
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
import AdminRegister from "./pages/admin/AdminRegister";
import OrderDetails from "./pages/admin/OrderDetails";

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-otp" element={<ResetOtp />} />
          <Route path="/otp-login" element={<OtpLogin />} />
          <Route path="/otp-verify" element={<OtpVerify />} />
          <Route path="/cart" element={<Cart />} />

          {/* ✅ New public routes for certification and subscription */}
          <Route path="/certification" element={<Certifications />} />
          <Route path="/subscription" element={<Subscription />} />

          {/* Admin auth routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* Student routes (protected) */}
          <Route element={<ProtectedRoute allowedRoles={["student"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/my-learning" element={<MyLearning />} />
            <Route path="/student/wishlist" element={<Wishlist />} />
            <Route path="/student/orders" element={<Orders />} />
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          {/* Instructor routes */}
          <Route element={<ProtectedRoute allowedRoles={["instructor"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
            <Route path="/instructor/create-course" element={<CreateCourse />} />
            <Route path="/instructor/my-courses" element={<InstructorCourses />} />
            <Route path="/instructor/analytics" element={<InstructorAnalytics />} />
          </Route>

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]}><DashboardLayout /></ProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/courses" element={<ManageCourses />} />
            <Route path="/admin/instructors" element={<Instructors />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/certificates" element={<Certificates />} />
            <Route path="/admin/notifications" element={<Notifications />} />
            <Route path="/admin/moderation" element={<Moderation />} />
            <Route path="/admin/support" element={<Support />} />
            <Route path="/admin/cms" element={<CMS />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/roles" element={<Roles />} />
            <Route path="/admin/ai-features" element={<AIFeatures />} />
            <Route path="/admin/gamification" element={<Gamification />} />
            <Route path="/admin/payments" element={<Payments />} />
            <Route path="/admin/reviews" element={<Reviews />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/orders/:orderId" element={<OrderDetails />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;