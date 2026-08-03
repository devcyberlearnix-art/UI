// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  console.log('[ProtectedRoute] Loading:', loading);
  console.log('[ProtectedRoute] IsAuthenticated:', isAuthenticated);
  console.log('[ProtectedRoute] User:', user);
  
  const hasToken = !!localStorage.getItem('lms_token') || 
                   !!localStorage.getItem('access_token') ||
                   !!sessionStorage.getItem('lms_token');
  
  console.log('[ProtectedRoute] Has token in storage:', hasToken);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  const isAuth = isAuthenticated || hasToken;
  
  if (!isAuth) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }
  
  // ✅ Check if user has required role
  if (allowedRoles.length > 0) {
    const userRole = user?.role || user?.role1 || user?.userRole;
    const hasAllowedRole = allowedRoles.some(role => 
      userRole?.toLowerCase().includes(role.toLowerCase())
    );
    
    if (!hasAllowedRole) {
      console.log('[ProtectedRoute] Role not allowed, redirecting to landing');
      return <Navigate to="/" replace />;
    }
  }
  
  console.log('[ProtectedRoute] Authenticated, rendering children');
  return children;
};

export default ProtectedRoute;