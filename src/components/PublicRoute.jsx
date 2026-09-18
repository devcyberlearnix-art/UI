// src/components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, getDashboardPath } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ If authenticated, go to role-specific dashboard
  if (isAuthenticated) {
    const role = user?.role || user?.role1 || user?.userRole || user?.normalizedRole;
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  // ✅ If NOT authenticated, show the page (login, register, etc.)
  return children;
};

export default PublicRoute;