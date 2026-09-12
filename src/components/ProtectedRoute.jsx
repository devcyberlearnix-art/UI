// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  const hasToken = !!localStorage.getItem('lms_token') || 
                   !!localStorage.getItem('access_token') ||
                   !!sessionStorage.getItem('lms_token');

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
  const adminOnly = allowedRoles.some((role) => String(role).toLowerCase().includes('admin'));
  const loginPath = adminOnly ? '/admin/login' : '/login';
  
  if (!isAuth) {
    return <Navigate to={loginPath} replace />;
  }
  
  if (allowedRoles.length > 0) {
    const storedUser = JSON.parse(localStorage.getItem('lms_user') || '{}');
    const userRole = String(
      user?.role || user?.role1 || user?.userRole || 
      storedUser?.role || storedUser?.role1 || storedUser?.userRole || ''
    ).toLowerCase();

    const hasAllowedRole = allowedRoles.some(role => {
      const targetRole = String(role).toLowerCase();
      return userRole.includes(targetRole) || targetRole.includes(userRole) || 
             (userRole.includes('main') && targetRole.includes('admin'));
    });
    
    if (!hasAllowedRole && userRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;