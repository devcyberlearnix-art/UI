// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login (NOT register!)
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] User not authenticated - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required roles (if specified)
  if (requiredRoles.length > 0 && user) {
    const userRole = user.role?.toLowerCase() || user.normalizedRole?.toLowerCase() || 'student';
    const hasRequiredRole = requiredRoles.some(role => 
      userRole === role.toLowerCase()
    );
    
    if (!hasRequiredRole) {
      console.log('[ProtectedRoute] User does not have required role:', requiredRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Only check verification if user exists and has verified property
  if (user && user.verified === false) {
    console.log('[ProtectedRoute] User email not verified');
    return <Navigate to="/otp-verify" replace />;
  }

  // All checks passed, render children
  return children;
};

export default ProtectedRoute;