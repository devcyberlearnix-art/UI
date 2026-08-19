// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

// Normalize role function
const normalizeRole = (role) => {
  if (!role) return 'student';
  const roleLower = String(role).toLowerCase().trim();
  if (roleLower === 'admin' || roleLower === 'super_admin' || roleLower === 'superadmin') {
    return 'admin';
  }
  if (roleLower === 'subadmin' || roleLower === 'sub_admin' || roleLower === 'sub-admin') {
    return 'subadmin';
  }
  if (roleLower === 'instructor') {
    return 'instructor';
  }
  return 'student';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateUser = (updatedUserData) => {
    setUser(prevUser => {
      const newUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem('lms_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('lms_token') || 
                      localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('lms_user');
        
        if (token && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role) {
            parsedUser.normalizedRole = normalizeRole(parsedUser.role);
          }
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log('[AuthProvider] Session restored successfully');
        }
      } catch (error) {
        console.error('[AuthProvider] Session restore error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      const userData = response?.data || response;
      
      if (userData?.token || userData?.accessToken) {
        const token = userData.token || userData.accessToken;
        if (userData.role) {
          userData.normalizedRole = normalizeRole(userData.role);
        }
        localStorage.setItem('lms_token', token);
        localStorage.setItem('access_token', token);
        localStorage.setItem('lms_user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, data: userData };
      }
      return { success: false, error: 'No token received' };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      localStorage.removeItem('lms_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('lms_user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    setUser,
    updateUser,
    loading,
    isAuthenticated,
    login,
    logout,
    normalizeRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Safe version - returns empty object if context is not available
export const useSafeAuth = () => {
  try {
    return useAuth();
  } catch (error) {
    console.warn('useSafeAuth: AuthContext not available, returning empty object');
    return { user: null, isAuthenticated: false, loading: false, login: async () => {}, logout: async () => {} };
  }
};

export { normalizeRole };
export default AuthContext;