import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getActingRole } from '../utils/roleSwitch';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

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

  if (!user) {
    const isAdminRoute = allowedRoles.some(role =>
      String(role).toLowerCase().includes('admin')
    );
    return <Navigate to={isAdminRoute ? '/admin/login' : '/login'} replace />;
  }

  if (allowedRoles.length > 0) {
    const effectiveRole = String(getActingRole() || user?.role || '').toLowerCase();
    const hasAllowedRole = allowedRoles.some(role =>
      effectiveRole.includes(String(role).toLowerCase())
    );
    if (!hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;