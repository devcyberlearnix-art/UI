// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const normalizeRole = (roleValue = '') => {
  const role = String(roleValue || '').trim().toLowerCase();
  if (role.includes('super')) return 'super_admin';
  if (role.includes('sub')) return 'sub_admin';
  if (role.includes('main')) return 'admin';
  if (role.includes('admin')) return 'admin';
  if (role.includes('instructor')) return 'instructor';
  if (role.includes('student')) return 'student';
  return role || 'student';
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const restoreSession = () => {
      try {
        console.log('[AuthProvider] Checking existing session');
        
        const storedToken = localStorage.getItem('lms_token') || localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('lms_user');
        
        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setToken(storedToken);
            setUser({
              ...parsedUser,
              role: normalizeRole(parsedUser?.role),
            });
            console.log('[AuthProvider] Session restored successfully');
          } catch (err) {
            console.error('[AuthProvider] Failed to parse stored user:', err);
            localStorage.removeItem('lms_token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('lms_user');
          }
        }
      } catch (err) {
        console.error('[AuthProvider] Session restore error:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
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

      // ✅ Handle the response structure from /admin/internal/login
      if (response && typeof response === "object") {
        // Check for token in authentication object or directly
        tokenData = response.authentication?.accessToken || 
                    response.authentication?.token ||
                    response.accessToken || 
                    response.token || 
                    response.access_token;

        refreshTokenData = response.authentication?.refreshToken || response.refreshToken || response.refresh_token || null;

        // ✅ Extract user data from response
        const userInfo = response.user || response;
        userData = {
          id: userInfo.id || userInfo.userId,
          firstName: userInfo.firstName || userInfo.name || '',
          lastName: userInfo.lastName || userInfo.lastName || '',
          name: userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName || ''}`.trim() : userInfo.name || '',
          email: userInfo.email || emailStr,
          mobileNumber: userInfo.mobileNumber || userInfo.mobile || '',
          role: normalizeRole(userInfo.role || userInfo.role1 || userInfo.userRole || userInfo.effectiveRole || 'student'),
          permissions: userInfo.permissions || [],
          assignedService: userInfo.assignedService || '',
        };
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
        errorMessage = 'Cannot connect to the server. Please check your internet connection.';
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
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthProvider;