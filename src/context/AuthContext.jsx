import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("lms_token");
    const storedUser = localStorage.getItem("lms_user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem("lms_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({ email, password });

      if (response.success) {
        // Parse user data exactly as per your Insomnia screenshot
        const userData = {
          id: response.user.id,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          name: `${response.user.firstName} ${response.user.lastName}`.trim(),
          email: response.user.email,
          role: response.user.role, // "STUDENT"
          mobileNumber: response.user.mobileNumber,
          permissions: response.user.permissions,
        };

        // Store authentication data
        localStorage.setItem("lms_token", response.authentication.accessToken);
        localStorage.setItem("access_token", response.authentication.accessToken);
        localStorage.setItem("refresh_token", response.authentication.refreshToken);
        localStorage.setItem("lms_user", JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.message || "Login failed" };
      }
    } catch (err) {
      // This makes sure the user sees the real error message
      let errorMessage = "Cannot connect to the server. Please check your internet connection.";
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("lms_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("lms_user");
    sessionStorage.removeItem("lms_token");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);