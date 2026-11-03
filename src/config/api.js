// In development, use empty string to leverage Vite proxy
// In production, use the full backend URL
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Backend photo proxy base URL - matches the API gateway URL
export const PHOTO_PROXY_BASE = API_BASE_URL;

export const buildApiUrl = (path = "") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Normalize photo URLs to work in both development and production
// Backend returns Google Drive URLs: https://drive.google.com/uc?id=FILE_ID
// Convert to backend proxy endpoint which authenticates with Google Drive service account
export const normalizePhotoUrl = (photoUrl) => {
  if (!photoUrl) return null;

  // Handle Google Drive URLs - route through backend proxy endpoint
  if (photoUrl.includes('drive.google.com')) {
    // Extract file ID from Google Drive URL
    const idMatch = photoUrl.match(/id=([^&]+)/);
    const fileMatch = photoUrl.match(/\/file\/d\/([^\/]+)/);
    const fileId = idMatch ? idMatch[1] : (fileMatch ? fileMatch[1] : null);

    if (fileId) {
      // Use proxy endpoint that serves directly from service account
      return `/api/v1/users/photo/${fileId}`;
    }
    // If we can't extract file ID, return as-is
    return photoUrl;
  }

  // If it's already a relative URL or uses the current API base, return as-is
  if (photoUrl.startsWith('/api/') || (API_BASE_URL && photoUrl.startsWith('http') && photoUrl.includes(API_BASE_URL))) {
    return photoUrl;
  }

  // If backend returns http://localhost:8080, replace with current API base
  if (photoUrl.startsWith('http://localhost:8080')) {
    return photoUrl.replace('http://localhost:8080', API_BASE_URL);
  }

  // If backend returns https://localhost:8080, replace with current API base
  if (photoUrl.startsWith('https://localhost:8080')) {
    return photoUrl.replace('https://localhost:8080', API_BASE_URL);
  }

  // Otherwise return as-is
  return photoUrl;
};

export default API_BASE_URL;
