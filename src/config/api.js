const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://matted-ascent-specimen.ngrok-free.dev"
).replace(/\/+$/, "");

export const buildApiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export default API_BASE_URL;