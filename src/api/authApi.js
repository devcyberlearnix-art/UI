import axios from "axios";

// IMPORTANT: Replace this with your actual ngrok base URL
const API_BASE_URL = "https://matted-ascent-specimen.ngrok-free.dev/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to automatically attach the token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials).then((res) => res.data),
  requestLoginOtp: (email) => api.post("/auth/request-login-otp", { email }).then((res) => res.data),
  verifyLoginOtp: (data) => api.post("/auth/verify-login-otp", data).then((res) => res.data),
  resendOtp: (data) => api.post("/auth/resend-otp", data).then((res) => res.data),
};