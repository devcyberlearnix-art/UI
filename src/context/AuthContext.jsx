// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import { studentApi } from '../api/studentApi';
import { instructorApi } from '../api/instructorApi';
import toast from 'react-hot-toast';
import { parseApiError } from '../utils/apiErrorParser';
import { normalizePhotoUrl } from '../config/api';

const AuthContext = createContext(null);

export const normalizeRole = (roleValue = '') => {
  const role = String(roleValue || '').trim().toLowerCase();
  if (role.includes('super')) return 'super_admin';
  if (role.includes('sub')) return 'sub_admin';
  if (role.includes('main')) return 'admin';
  if (role.includes('admin')) return 'admin';
  if (role.includes('instructor')) return 'instructor';
  if (role.includes('student')) return 'student';
  return role || 'student';
};

export const getDashboardPath = (roleValue = '') => {
  const role = normalizeRole(roleValue);
  if (role === 'super_admin' || role === 'admin') return '/admin/dashboard';
  if (role === 'sub_admin') return '/admin/sub-dashboard';
  if (role === 'instructor') return '/instructor/dashboard';
  return '/student/dashboard';
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useSafeAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      token: null,
      loading: false,
      error: null,
      login: async () => ({ success: false, error: 'Auth not available' }),
      logout: async () => {},
      syncSession: () => null,
      isAuthenticated: false,
    };
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const syncSession = (nextUser, nextToken, refreshToken = null) => {
    const normalizedUser = {
      ...(nextUser || {}),
      role: normalizeRole(nextUser?.role || nextUser?.effectiveRole || nextUser?.userRole || 'student'),
    };

    localStorage.setItem('lms_token', nextToken);
    localStorage.setItem('access_token', nextToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    sessionStorage.setItem('lms_token', nextToken);
    localStorage.setItem('lms_user', JSON.stringify(normalizedUser));

    setToken(nextToken);
    setUser(normalizedUser);
    return normalizedUser;
  };

  // Fetch user profile data including photo
  const fetchUserProfile = async (currentUser) => {
    try {
      const role = currentUser?.role || 'student';

      let profileData;
      if (role === 'admin' || role === 'super_admin' || role === 'sub_admin') {
        profileData = await authApi.getSubAdminProfile();
      } else if (role === 'instructor') {
        profileData = await instructorApi.getProfile();
      } else {
        profileData = await authApi.getUserProfile();
      }

      // Handle different response structures
      // The API might return: { data: { user: {...} } } or { data: [...] } or directly { user: {...} }
      let data = profileData?.data?.user || profileData?.data?.admin || profileData?.data?.instructor || profileData?.data || profileData;

      // If data is an array, try to find the user object in it
      if (Array.isArray(data)) {
        data = data.find(item => item && (item.email || item.firstName || item.id)) || data[0] || {};
      }

      const profilePhoto = data?.profilePhoto || data?.photoURL || data?.avatar || data?.profilePhotoUrl || data?.photoUrl || null;

      // Normalize photo URL to work in both development and production
      const normalizedPhotoUrl = normalizePhotoUrl(profilePhoto);

      // Update user state with profile photo
      if (data && typeof data === 'object') {
        const updatedUser = {
          ...currentUser,
          ...data,
          // Handle mobile field name compatibility (backend uses 'mobile', frontend expects 'mobileNumber')
          mobileNumber: data.mobileNumber || data.mobile || currentUser.mobileNumber || '',
          profilePhoto: normalizedPhotoUrl,
        };
        setUser(updatedUser);
        localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('[AuthProvider] Failed to fetch user profile:', error);
      // Don't throw error - user can still function without profile photo
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem('lms_token') || localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('lms_user');

        if (storedToken && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            const normalizedUser = {
              ...parsedUser,
              role: normalizeRole(parsedUser?.role),
            };
            setToken(storedToken);
            setUser(normalizedUser);

            // Fetch profile data including photo
            await fetchUserProfile(normalizedUser);
          } catch (err) {
            localStorage.removeItem('lms_token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('lms_user');
          }
        }
      } catch (err) {
        // Storage can be unavailable in privacy-restricted browser contexts.
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Listen for profile photo changes from other components
  useEffect(() => {
    const handleProfilePhotoChange = (event) => {
      if (user && event.detail) {
        const updatedUser = {
          ...user,
          profilePhoto: event.detail.profilePhoto,
        };
        setUser(updatedUser);
        localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      }
    };

    const handleProfilePhotoRemoved = () => {
      if (user) {
        const updatedUser = {
          ...user,
          profilePhoto: null,
        };
        setUser(updatedUser);
        localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      }
    };

    window.addEventListener('profilePhotoChanged', handleProfilePhotoChange);
    window.addEventListener('profilePhotoRemoved', handleProfilePhotoRemoved);

    return () => {
      window.removeEventListener('profilePhotoChanged', handleProfilePhotoChange);
      window.removeEventListener('profilePhotoRemoved', handleProfilePhotoRemoved);
    };
  }, [user]);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const emailStr = typeof email === 'string' ? email : String(email || '');
      const passwordStr = typeof password === 'string' ? password : String(password || '');
      
      if (!emailStr || emailStr.trim() === '') {
        throw new Error('Email is required');
      }
      if (!passwordStr || passwordStr.trim() === '') {
        throw new Error('Password is required');
      }
      
      const response = await authApi.login(emailStr.trim(), passwordStr);
      
      let tokenData = null;
      let refreshTokenData = null;
      let userData = null;

      // ✅ Handle the response structure from /admin/internal/login
      if (response && typeof response === "object") {
        const payload = response.data && typeof response.data === 'object' ? response.data : response;
        // Check for token in authentication object or directly
        tokenData = payload.authentication?.accessToken ||
                    payload.authentication?.token ||
                    payload.accessToken ||
                    payload.token ||
                    payload.access_token;

        refreshTokenData = payload.authentication?.refreshToken || payload.refreshToken || payload.refresh_token || null;

        // ✅ Extract user data from response
        const userInfo = payload.user || payload;
        const profilePhoto = userInfo.profilePhoto || userInfo.photoURL || userInfo.avatar || userInfo.profilePhotoUrl || userInfo.photoUrl || null;

        // Normalize photo URL to work in both development and production
        const normalizedPhotoUrl = normalizePhotoUrl(profilePhoto);

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
          profilePhoto: normalizedPhotoUrl,
        };
      }
      
      if (!tokenData) {
        throw new Error('No token received from server');
      }
      
      // ✅ Store in multiple locations
      syncSession(userData, tokenData, refreshTokenData);

      // Only fetch profile if photo is not already in login response
      if (!userData.profilePhoto) {
        await fetchUserProfile(userData);
      }

      const userName = userData?.firstName || userData?.name || userData?.fullName || 'Admin';
      toast.success(`Welcome back, ${userName}!`);

      return { success: true, user: userData, token: tokenData };
      
    } catch (error) {
      const { message: errorMessage } = parseApiError(error, 'Login failed. Please check your details and try again.');
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage, originalError: error };
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (socialData) => {
    try {
      setError(null);
      setLoading(true);

      const response = await authApi.socialLogin(socialData);
      let tokenData = null;
      let refreshTokenData = null;
      let userData = null;

      if (response && typeof response === 'object') {
        const payload = response.data && typeof response.data === 'object' ? response.data : response;
        tokenData = payload.authentication?.accessToken ||
                    payload.authentication?.token ||
                    payload.accessToken ||
                    payload.token ||
                    payload.access_token;

        refreshTokenData = payload.authentication?.refreshToken || payload.refreshToken || payload.refresh_token || null;

        const userInfo = payload.user || payload;
        const profilePhoto = userInfo.profilePhoto || userInfo.photoURL || userInfo.avatar || null;
        const normalizedPhotoUrl = normalizePhotoUrl(profilePhoto);

        userData = {
          id: userInfo.id || userInfo.userId,
          firstName: userInfo.firstName || userInfo.name || '',
          lastName: userInfo.lastName || '',
          name: userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName || ''}`.trim() : userInfo.name || '',
          email: userInfo.email || socialData.email || '',
          mobileNumber: userInfo.mobileNumber || userInfo.mobile || '',
          role: normalizeRole(userInfo.role || userInfo.role1 || userInfo.userRole || userInfo.effectiveRole || 'student'),
          permissions: userInfo.permissions || [],
          assignedService: userInfo.assignedService || '',
          profilePhoto: normalizedPhotoUrl,
        };
      }

      if (!tokenData) {
        throw new Error('No authentication token received from OAuth provider');
      }

      syncSession(userData, tokenData, refreshTokenData);

      const userName = userData?.firstName || userData?.name || 'User';
      toast.success(response.message || `Welcome, ${userName}!`);

      return { success: true, user: userData, token: tokenData };
    } catch (error) {
      const { message: errorMessage } = parseApiError(error, 'Social sign-in failed. Please try again.');
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage, originalError: error };
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
    socialLogin,
    logout,
    syncSession,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthProvider;
