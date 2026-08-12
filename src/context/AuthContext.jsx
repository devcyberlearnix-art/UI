import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
<<<<<<< Updated upstream
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error("Error loading user session:", err);
=======
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
      let userData = null;

      // ✅ Handle the response structure from /admin/internal/login
      if (response && typeof response === "object") {
        // Check for token in authentication object or directly
        tokenData = response.authentication?.accessToken || 
                    response.authentication?.token ||
                    response.accessToken || 
                    response.token || 
                    response.access_token;

        // ✅ Extract user data from response
        const userInfo = response.user || response;
        userData = {
          id: userInfo.id || userInfo.userId,
          firstName: userInfo.firstName || userInfo.name || '',
          lastName: userInfo.lastName || '',
          name: userInfo.firstName ? `${userInfo.firstName} ${userInfo.lastName || ''}`.trim() : userInfo.name || '',
          email: userInfo.email || emailStr,
          mobileNumber: userInfo.mobileNumber || userInfo.mobile || '',
          role: userInfo.role || userInfo.role1 || userInfo.userRole || 'admin',
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
>>>>>>> Stashed changes
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
<<<<<<< Updated upstream
=======
      localStorage.removeItem('lms_token');
      localStorage.removeItem('access_token');
      localStorage.removeItem('lms_user');
      sessionStorage.removeItem('lms_token');
      sessionStorage.removeItem('lms_user');
      
      setToken(null);
>>>>>>> Stashed changes
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);