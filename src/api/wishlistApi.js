// src/api/wishlistApi.js
import axiosInstance from "./axiosInstance";

export const wishlistApi = {
  // GET /api/v1/wishlist
  // Get user wishlist
  getWishlist: async () => {
    const headers = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };

    try {
      const response = await axiosInstance.get("/api/v1/wishlist", { headers });
      return response.data;
    } catch (err) {
      console.warn("[wishlistApi] GET /api/v1/wishlist failed, trying direct http://localhost:8080/api/v1/wishlist...", err);
      try {
        const directResp = await fetch("http://localhost:8080/api/v1/wishlist", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          credentials: "include",
        });
        if (directResp.ok) {
          const directData = await directResp.json();
          return directData;
        }
      } catch (directErr) {
        console.warn("[wishlistApi] direct fetch to http://localhost:8080/api/v1/wishlist failed", directErr);
      }

      console.warn("[wishlistApi] trying fallback /wishlist...");
      try {
        const response2 = await axiosInstance.get("/wishlist", { headers });
        return response2.data;
      } catch (err2) {
        // Fallback to /api/v1/courses/wishlist
        const response3 = await axiosInstance.get("/api/v1/courses/wishlist", { headers });
        return response3.data;
      }
    }
  },

  // POST /api/v1/wishlist
  // Add course to wishlist
  addToWishlist: async (courseId) => {
    try {
      const response = await axiosInstance.post("/api/v1/wishlist", { courseId });
      return response.data;
    } catch (err) {
      const response = await axiosInstance.post("/wishlist", { courseId });
      return response.data;
    }
  },

  // DELETE /api/v1/wishlist/{courseId}
  // Remove from wishlist
  removeFromWishlist: async (courseId) => {
    try {
      const response = await axiosInstance.delete(`/api/v1/wishlist/${courseId}`);
      return response.data;
    } catch (err) {
      const response = await axiosInstance.delete(`/wishlist/${courseId}`);
      return response.data;
    }
  },

  // POST /api/v1/wishlist/{courseId}/move-to-cart
  // Move course to cart
  moveToCart: async (courseId) => {
    try {
      const response = await axiosInstance.post(`/api/v1/wishlist/${courseId}/move-to-cart`);
      return response.data;
    } catch (err) {
      // Fallback to direct add to cart
      const response = await axiosInstance.post("/api/v1/cart", { courseId });
      return response.data;
    }
  },

  // DELETE /api/v1/wishlist
  // Clear wishlist
  clearWishlist: async () => {
    try {
      const response = await axiosInstance.delete("/api/v1/wishlist");
      return response.data;
    } catch (err) {
      const response = await axiosInstance.delete("/wishlist");
      return response.data;
    }
  },
};

export default wishlistApi;
