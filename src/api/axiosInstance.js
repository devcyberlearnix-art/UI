import axios from "axios";

const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? ""
  : "https://iodine-pesticide-bulge.ngrok-free.dev";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  timeout: 10000,
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("lms_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem("lms_token");
        localStorage.removeItem("access_token");
        localStorage.removeItem("lms_user");
        window.location.href = "/login";
      } else if (status === 403) {
        // Forbidden
        console.error("Access denied");
      } else if (status === 500) {
        // Server error
        console.error("Server error:", data?.message || "Internal server error");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
