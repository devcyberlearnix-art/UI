// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';
// Utility extracted to a plain .js file so React Fast Refresh works correctly
import { checkInstructorStatus } from './authHelpers';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('lms_token') || localStorage.getItem('access_token') || sessionStorage.getItem('lms_token') || null;
  });
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('lms_user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        const parsed = JSON.parse(storedUser);
        const instStatus = checkInstructorStatus(parsed.email);
        if (instStatus) {
          parsed.instructorStatus = instStatus;
          if (instStatus === 'active' || instStatus === 'approved') {
            parsed.role = 'instructor';
          }
        }
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn('[AuthProvider] Invalid lms_user in localStorage, clearing');
      localStorage.removeItem('lms_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Verify stored session synchronization on mount
    const storedToken = localStorage.getItem('lms_token') || localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('lms_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const instStatus = checkInstructorStatus(parsedUser.email);
        if (instStatus) {
          parsedUser.instructorStatus = instStatus;
          if (instStatus === 'active' || instStatus === 'approved') {
            parsedUser.role = 'instructor';
          }
        }
        if (!user) setUser(parsedUser);
        if (!token) setToken(storedToken);
      } catch (err) {
        console.error('[AuthProvider] Failed to parse stored user:', err);
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const emailStr = typeof email === 'string' ? email : String(email || '');
      const passwordStr = typeof password === 'string' ? password : String(password || '');
      
      console.log('[AuthProvider] Login attempt for:', emailStr);
      
      if (!emailStr || emailStr.trim() === '') {
        throw new Error('Email is required');
      }
      if (!passwordStr || passwordStr.trim() === '') {
        throw new Error('Password is required');
      }
      
      const response = await authApi.login(emailStr.trim(), passwordStr);
      
      console.log('[AuthProvider] Login response:', response);
      
      let tokenData = null;
      let refreshTokenData = null;
      let userData = null;

      if (response && typeof response === "object") {
        tokenData = response.authentication?.accessToken || 
                    response.authentication?.token ||
                    response.accessToken || 
                    response.token || 
                    response.access_token;

        refreshTokenData = response.authentication?.refreshToken || response.refreshToken || response.refresh_token || null;

        const userInfo = response.user || response;
        userData = {
          id: userInfo.id || userInfo.userId,
          firstName: userInfo.firstName || userInfo.name || '',
          lastName: userInfo.lastName || '',
          name: userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName || ''}`.trim() : userInfo.name || '',
          email: userInfo.email || emailStr,
          mobileNumber: userInfo.mobileNumber || userInfo.mobile || '',
          role: userInfo.role || userInfo.role1 || userInfo.userRole || userInfo.effectiveRole || 'student',
          permissions: userInfo.permissions || [],
          assignedService: userInfo.assignedService || '',
        };
      }

      // Check instructor verification status & grant instructor role if approved
      const instStatus = checkInstructorStatus(userData.email || emailStr);
      if (instStatus) {
        userData.instructorStatus = instStatus;
        if (instStatus === 'active' || instStatus === 'approved') {
          userData.isInstructor = true;
          if (!userData.isAdmin) {
            userData.role = 'instructor';
          }
        }
      }
      
      if (!tokenData) {
        console.error('[AuthProvider] No token found in response:', response);
        throw new Error('No token received from server');
      }
      
      console.log('[AuthProvider] Token extracted:', tokenData.substring(0, 20) + '...');
      console.log('[AuthProvider] User data:', userData);
      
      // ✅ Store in multiple locations
      localStorage.setItem('lms_token', tokenData);
      localStorage.setItem('access_token', tokenData);
      if (refreshTokenData) {
        localStorage.setItem('refresh_token', refreshTokenData);
      }
      sessionStorage.setItem('lms_token', tokenData);
      localStorage.setItem('lms_user', JSON.stringify(userData || {}));
      
      setToken(tokenData);
      setUser(userData);
      
      const userName = userData?.firstName || userData?.name || userData?.fullName || 'Admin';
      toast.success(`Welcome back, ${userName}!`);
      
      return { success: true, user: userData, token: tokenData };
      
    } catch (error) {
      console.error('[AuthProvider] Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          errorMessage = data?.message || 'Invalid request. Please check your credentials.';
        } else if (status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (status === 403) {
          errorMessage = 'Access denied. You do not have permission.';
        } else if (status === 404) {
          errorMessage = 'Server endpoint not found.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        errorMessage = 'Cannot connect to the backend server. Please verify that the backend API server / ngrok tunnel is active.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (targetRole) => {
    try {
      setLoading(true);
      const roleUpper = String(targetRole).toUpperCase(); // "INSTRUCTOR" | "STUDENT" | "ADMIN"
      console.log('[AuthProvider] Calling POST /api/v1/auth/switch-role with:', { switchRole: roleUpper });
      
      const res = await authApi.switchRole(roleUpper);
      console.log('[AuthProvider] switchRole API response:', res);
      
      let tokenData = res?.authentication?.accessToken || res?.authentication?.token || res?.accessToken || res?.token || res?.access_token;
      let refreshTokenData = res?.authentication?.refreshToken || res?.refreshToken || res?.refresh_token;

      if (tokenData) {
        localStorage.setItem('lms_token', tokenData);
        localStorage.setItem('access_token', tokenData);
        sessionStorage.setItem('lms_token', tokenData);
        setToken(tokenData);
      }
      if (refreshTokenData) {
        localStorage.setItem('refresh_token', refreshTokenData);
      }

      const newRoleLower = String(targetRole).toLowerCase();
      const updatedUser = {
        ...(user || {}),
        role: newRoleLower,
        role1: newRoleLower,
        userRole: newRoleLower,
        effectiveRole: roleUpper,
      };

      localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      const label = targetRole.charAt(0).toUpperCase() + targetRole.slice(1).toLowerCase();
      toast.success(`Switched to ${label} view`);
      return { success: true, data: res };
    } catch (err) {
      console.error('[AuthProvider] switchRole error:', err);
      const newRoleLower = String(targetRole).toLowerCase();
      const updatedUser = {
        ...(user || {}),
        role: newRoleLower,
        role1: newRoleLower,
        userRole: newRoleLower,
      };
      localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('[AuthProvider] Logout error:', error);
    } finally {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('lms_user');
      sessionStorage.removeItem('lms_token');
      sessionStorage.removeItem('lms_user');
      
      setToken(null);
      setUser(null);
      setError(null);
      setLoading(false);
      toast.success('Logged out successfully');
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    switchRole,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;