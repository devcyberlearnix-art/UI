import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isTokenExpired } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const token = localStorage.getItem("lms_token") || localStorage.getItem("access_token");

  if (!user || !token || isTokenExpired(token)) {
    if (user || token) {
      logout();
    }
    return <Navigate to="/login" replace />;
  }

  // Normalize roles: map "user" to "student" in case backend uses "user"
  const normalizedUserRole = user.role === "user" ? "student" : user.role;
  const normalizedAllowedRoles = allowedRoles.map((role) =>
    role === "user" ? "student" : role
  );

  if (allowedRoles && !normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
