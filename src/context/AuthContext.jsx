// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

// Normalize role function
const normalizeRole = (role) => {
  if (!role) return 'student';
  const roleLower = String(role).toLowerCase().trim();
  if (roleLower === 'admin' || roleLower === 'super_admin' || roleLower === 'superadmin' || roleLower === 'main_admin') {
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

// Helper: Get dashboard path for given role
export const getDashboardPath = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === 'admin') return '/admin/dashboard';
  if (normalized === 'subadmin') return '/admin/sub-dashboard';
  if (normalized === 'instructor') return '/instructor/dashboard';
  return '/student/dashboard';
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

  // ✅ Clear all tokens and reset state
  const clearAuthData = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('lms_user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('registrationEmail');
    
    sessionStorage.removeItem('lms_token');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('otpSessionId');
    sessionStorage.removeItem('pendingProfilePhoto');
    sessionStorage.removeItem('userEmail');
    sessionStorage.removeItem('uploadPendingPhoto');
    sessionStorage.removeItem('verificationSuccess');
    
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = authApi.getToken();
        
        console.log('[AuthProvider] Checking session, token exists:', !!token);
        
        if (token) {
          // ✅ Validate token before restoring session
          const isValid = authApi.isAuthenticated();
          
          if (isValid) {
            // Try to get user from storage
            let userData = authApi.getCurrentUser();
            
            if (!userData) {
              // Try to fetch from API
              try {
                const response = await authApi.fetchCurrentUser();
                if (response) {
                  userData = response;
                }
              } catch (fetchError) {
                console.warn('[AuthProvider] Could not fetch user:', fetchError);
              }
            }
            
            if (userData && (userData.role || userData.role1 || userData.userRole)) {
              userData.normalizedRole = normalizeRole(userData.role || userData.role1 || userData.userRole);
              localStorage.setItem('lms_user', JSON.stringify(userData));
              setUser(userData);
              setIsAuthenticated(true);
              console.log('[AuthProvider] Session restored successfully for:', userData.email);
            } else {
              console.warn('[AuthProvider] No user data found, clearing tokens');
              clearAuthData();
            }
          } else {
            console.log('[AuthProvider] Invalid token found, clearing...');
            clearAuthData();
          }
        } else {
          console.log('[AuthProvider] No token found - user is not authenticated');
          // ✅ Make sure isAuthenticated is false
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthProvider] Session restore error:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      // ✅ Clear any existing tokens before login
      clearAuthData();
      
      const response = await authApi.login(email, password);
      console.log('[AuthProvider] Login response:', response);
      console.log('[AuthProvider] Response structure:', JSON.stringify(response, null, 2));
      
      // ✅ Check for token in the correct location
      if (response.success && response.authentication?.accessToken) {
        const token = response.authentication.accessToken;
        const userData = response.user || response.data || {};
        
        console.log('[AuthProvider] User data before normalization:', userData);
        console.log('[AuthProvider] Role fields:', {
          role: userData.role,
          role1: userData.role1,
          userRole: userData.userRole,
          userType: userData.userType
        });
        
        userData.normalizedRole = normalizeRole(userData.role || userData.role1 || userData.userRole);
        
        console.log('[AuthProvider] Normalized role:', userData.normalizedRole);
        
        // Store tokens
        localStorage.setItem('lms_token', token);
        localStorage.setItem('access_token', token);
        localStorage.setItem('authToken', token);
        localStorage.setItem('lms_user', JSON.stringify(userData));
        localStorage.setItem('userData', JSON.stringify(userData));
        
        sessionStorage.setItem('lms_token', token);
        sessionStorage.setItem('authToken', token);
        
        if (response.authentication.refreshToken) {
          localStorage.setItem('refreshToken', response.authentication.refreshToken);
        }
        
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, data: userData, user: userData };
      }
      
      return { success: false, error: response.message || 'No token received' };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      clearAuthData();
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('[Auth] Logout error:', error);
    } finally {
      clearAuthData();
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
    getDashboardPath,
    clearAuthData,
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

export const useSafeAuth = () => {
  try {
    return useAuth();
  } catch (error) {
    console.warn('useSafeAuth: AuthContext not available, returning empty object');
    return { 
      user: null, 
      isAuthenticated: false, 
      loading: false, 
      login: async () => ({ success: false, error: 'Auth not available' }), 
      logout: async () => {},
      clearAuthData: () => {}
    };
  }
};

export { normalizeRole };
export default AuthContext;